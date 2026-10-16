"""Génère la voix off, aligne chaque mot et écrit la timeline des sous-titres.

Usage : python3 -I tools/build_audio.py <dossier_projet> <slug> [modele_piper.onnx]   (script : scripts/<slug>.json)

Moteurs (script.json > tts.engine) :
  - "edge"  : voix neuronales Microsoft (fr-FR-HenriNeural…), horodatage des mots fourni par le service
  - "elevenlabs" : voix ElevenLabs (variable d'env. ELEVENLABS_API_KEY, tts.voice = voice_id), horodatage par caractère
  - "piper" : voix locale hors-ligne (passer le chemin du modèle .onnx), alignement par faster-whisper
Dans le texte, *mot* = mot-clé affiché en jaune.
Sorties : public/<slug>/voice.wav, src/timelines/<slug>.json
"""
import asyncio
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

import numpy as np

ROOT = Path(sys.argv[1]).resolve()
SLUG = sys.argv[2]
SR = 24000
FPS = 30
LEAD = 0.25


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def trim_bounds(a, thresh=0.012):
    idx = np.where(np.abs(a) > thresh)[0]
    if not len(idx):
        return 0, len(a)
    return max(idx[0] - int(0.02 * SR), 0), min(idx[-1] + int(0.06 * SR), len(a))


def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    return "".join(c for c in s if c.isalnum())


def tokens(text):
    """Mots affichés (la ponctuation isolée reste collée au mot précédent) + drapeau mot-clé."""
    out, inside = [], False
    for raw in text.split():
        kw = inside or "*" in raw
        if raw.count("*") % 2:
            inside = not inside
        t = raw.replace("*", "")
        if out and all(not c.isalnum() for c in t):
            out[-1]["t"] += "\u00a0" + t
        else:
            out.append({"t": t, "k": kw})
    return out


def align(toks, bounds):
    """Associe chaque mot affiché à un temps via la position des lettres dans les mots prononcés."""
    pts_c, pts_t, c = [0.0], [bounds[0][0]], 0
    for s, e, w in bounds:
        n = len(norm(w))
        pts_c += [c, c + n]
        pts_t += [s, e]
        c += n
    total_spoken = c
    total_disp = sum(len(norm(t["t"])) for t in toks)
    scale = total_spoken / max(total_disp, 1)
    c = 0
    for t in toks:
        n = len(norm(t["t"]))
        t["s"] = float(np.interp(c * scale, pts_c, pts_t))
        t["e"] = float(np.interp((c + n) * scale, pts_c, pts_t))
        c += n
    return toks


async def edge_tts_scene(text, cfg, out):
    import certifi

    bundle = "/root/.ccr/ca-bundle.crt"  # proxy d'entreprise éventuel
    if Path(bundle).exists():
        certifi.where = lambda: bundle
    import edge_tts

    comm = edge_tts.Communicate(text, cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"], boundary="WordBoundary")
    bounds = []
    with open(out, "wb") as f:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                bounds.append((ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7, ch["text"]))
    return bounds


def elevenlabs_scene(text, cfg, out):
    import base64
    import os
    import urllib.request

    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voice']}/with-timestamps",
        data=json.dumps({
            "text": text,
            "model_id": cfg.get("model", "eleven_multilingual_v2"),
            "voice_settings": cfg.get("settings", {"stability": 0.4, "similarity_boost": 0.8, "style": 0.3, "speed": 1.1}),
        }).encode(),
        headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
    )
    res = json.loads(urllib.request.urlopen(req).read())
    Path(out).write_bytes(base64.b64decode(res["audio_base64"]))
    al = res["alignment"]
    bounds, cur, t0 = [], "", None
    for ch, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch.isspace():
            if cur:
                bounds.append((t0, last, cur))
            cur, t0 = "", None
            continue
        if t0 is None:
            t0 = s
        cur += ch
        last = e
    if cur:
        bounds.append((t0, last, cur))
    return bounds


def piper_scene(text, model, out):
    from faster_whisper import WhisperModel

    subprocess.run([sys.executable, "-m", "piper", "-m", model, "-f", str(out), "--length-scale", "0.9"], input=text.encode(), check=True, capture_output=True)
    a = decode(out)
    a16 = np.interp(np.linspace(0, len(a) - 1, int(len(a) * 16000 / SR)), np.arange(len(a)), a).astype(np.float32)
    segs, _ = WhisperModel("small", compute_type="int8").transcribe(a16, language="fr", word_timestamps=True)
    return [(w.start, w.end, w.word) for s in segs for w in s.words]


script = json.loads((ROOT / "scripts" / f"{SLUG}.json").read_text())
cfg = script["tts"]
tmp = Path(tempfile.mkdtemp())
pieces, scenes, cursor = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD

for sc in script["scenes"]:
    spoken = sc["text"].replace("*", "")
    out = tmp / f"{sc['id']}.mp3"
    if cfg["engine"] == "edge":
        bounds = asyncio.run(edge_tts_scene(spoken, cfg, out))
    elif cfg["engine"] == "elevenlabs":
        bounds = elevenlabs_scene(spoken, cfg, out)
    else:
        bounds = piper_scene(spoken, sys.argv[3], out)
    a = decode(out)
    i0, i1 = trim_bounds(a)
    a = a[i0:i1]
    off = i0 / SR
    bounds = [(s - off, e - off, w) for s, e, w in bounds]
    dur = len(a) / SR
    toks = align(tokens(sc["text"]), bounds)
    print(f"{sc['id']:8s} {dur:5.2f}s  mots={len(toks)}")
    scenes.append({
        "id": sc["id"],
        "start": round(cursor, 3),
        "end": round(cursor + dur, 3),
        "words": [{"t": t["t"], "k": t["k"], "s": round(cursor + t["s"], 3), "e": round(cursor + t["e"], 3)} for t in toks],
    })
    pieces += [a, np.zeros(int(script["gap"] * SR), np.float32)]
    cursor += dur + script["gap"]

voice = np.concatenate(pieces)
(ROOT / "public" / SLUG).mkdir(parents=True, exist_ok=True)
pcm = (np.clip(voice, -1, 1) * 32767).astype(np.int16).tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", str(ROOT / "public" / SLUG / "voice.wav")], input=pcm, check=True)
total = len(voice) / SR + 1.0
(ROOT / "src" / "timelines" / f"{SLUG}.json").write_text(json.dumps({"fps": FPS, "durationInFrames": int(np.ceil(total * FPS)), "scenes": scenes}, ensure_ascii=False, indent=1))
print(f"Durée totale : {total:.1f}s")
