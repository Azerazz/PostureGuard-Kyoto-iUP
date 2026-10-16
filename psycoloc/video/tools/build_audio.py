"""Génère la voix off (Piper), aligne les mots (faster-whisper) et écrit la timeline.

Usage : python3 -I tools/build_audio.py <dossier_projet> <modele_piper.onnx>
Sorties : public/voice.wav, src/timeline.json
"""
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(sys.argv[1]).resolve()
MODEL = sys.argv[2]
FPS = 30
SR = 22050
LEAD = 0.35  # silence avant la première phrase


def read_wav(path):
    with wave.open(str(path)) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def trim(a, thresh=0.01):
    idx = np.where(np.abs(a) > thresh)[0]
    return a[max(idx[0] - 400, 0): idx[-1] + 1200] if len(idx) else a


def resample16k(a):
    n = int(len(a) * 16000 / SR)
    return np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)


def display_tokens(sub):
    toks = []
    for t in sub.split():
        if toks and all(not c.isalnum() for c in t):
            toks[-1] += " " + t  # « tranquille : » reste sur un seul mot
        else:
            toks.append(t)
    return toks


script = json.loads((ROOT / "script.json").read_text())
whisper = WhisperModel("small", compute_type="int8")
pieces, scenes, cursor = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD
tmp = Path(tempfile.mkdtemp())

for sc in script["scenes"]:
    out = tmp / f"{sc['id']}.wav"
    subprocess.run(
        [sys.executable, "-m", "piper", "-m", MODEL, "-f", str(out), "--length-scale", str(script["lengthScale"])],
        input=sc["say"].encode(), check=True, capture_output=True,
    )
    a = trim(read_wav(out))
    dur = len(a) / SR
    toks = display_tokens(sc["sub"])
    segs, _ = whisper.transcribe(resample16k(a), language="fr", word_timestamps=True)
    ww = [w for s in segs for w in s.words]
    if len(ww) == len(toks):
        times = [(w.start, w.end) for w in ww]
    else:  # répartition proportionnelle à la longueur des mots
        t0 = ww[0].start if ww else 0.0
        t1 = ww[-1].end if ww else dur
        lens = np.array([len(t) + 2 for t in toks], float)
        edges = t0 + np.concatenate([[0], np.cumsum(lens)]) / lens.sum() * (t1 - t0)
        times = list(zip(edges[:-1], edges[1:]))
    print(f"{sc['id']:8s} {dur:5.2f}s  whisper={len(ww)} tokens={len(toks)}")
    scenes.append({
        "id": sc["id"],
        "start": round(cursor, 3),
        "end": round(cursor + dur, 3),
        "words": [{"t": t, "s": round(cursor + s, 3), "e": round(cursor + e, 3)} for t, (s, e) in zip(toks, times)],
    })
    pieces += [a, np.zeros(int(script["gap"] * SR), np.float32)]
    cursor += dur + script["gap"]

voice = np.concatenate(pieces)
(ROOT / "public").mkdir(exist_ok=True)
with wave.open(str(ROOT / "public" / "voice.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(voice, -1, 1) * 32767).astype(np.int16).tobytes())

total = len(voice) / SR + 1.2
timeline = {"fps": FPS, "durationInFrames": int(np.ceil(total * FPS)), "scenes": scenes}
(ROOT / "src" / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
print(f"Durée totale : {total:.1f}s")
