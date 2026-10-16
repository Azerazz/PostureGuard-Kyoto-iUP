"""Génère la voix off d'un épisode et produit la timeline (phrases + mots).

Deux moteurs, choisis par le champ "voice" de l'épisode :
- {"engine": "edge", "name": "fr-FR-HenriNeural", "rate": "+38%", "pitch": "+30Hz"}
  Voix « TikTok » identique à celle de l'autre compte (cahier des charges : débit enchaîné,
  0,08 s entre les morceaux, aucun effet). Minutage des mots fourni par le service.
- {"engine": "piper", "model": "fr_FR-tom-medium", "lengthScale": 0.95}  (hors ligne)

Usage : python3 scripts/voice.py episodes/ep01-cadeaux-interdits.json
Sortie : build/<id>/voice.wav et build/<id>/timeline.json
"""
import asyncio, json, os, re, subprocess, sys, wave
import numpy as np

SR = 44100
TAIL = 1.6          # silence final (laisse le temps à l'écran de fin)

ep_path = sys.argv[1]
ep = json.load(open(ep_path, encoding='utf-8'))
out = f"build/{ep['id']}"
os.makedirs(f"{out}/lines", exist_ok=True)
V = ep['voice'] if isinstance(ep['voice'], dict) else {'engine': 'piper', 'model': ep['voice'], 'lengthScale': ep.get('lengthScale', 0.95)}
EDGE = V['engine'] == 'edge'
LEAD = 0.25 if EDGE else 0.15
GAP_IN = 0.08 if EDGE else 0.18      # entre deux phrases d'une même scène
GAP_SCENE = 0.08 if EDGE else 0.55   # entre deux scènes


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def trim(x, thr, pre, post):
    idx = np.where(np.abs(x) > thr)[0]
    a, b = max(idx[0] - int(pre * SR), 0), min(idx[-1] + int(post * SR), len(x))
    return x[a:b], a / SR


async def edge_synth(text, path):
    import certifi
    if os.path.exists('/root/.ccr/ca-bundle.crt'):   # proxy de l'environnement cloud : on garde la vérification SSL
        certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
    import edge_tts  # après le correctif : edge-tts fige son contexte SSL à l'import
    c = edge_tts.Communicate(text, V['name'], rate=V['rate'], pitch=V['pitch'], boundary='WordBoundary')
    words = []
    with open(path, 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                words.append((ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, ch['text']))
    return words


def synth(text, n):
    """Renvoie (audio 44,1 kHz coupé, liste de (début, fin) des mots prononcés ou None)."""
    if EDGE:
        mp3 = f'{out}/lines/{n:02d}.mp3'
        for attempt in range(4):
            try:
                bounds = asyncio.run(edge_synth(text, mp3)); break
            except Exception as e:
                if attempt == 3: raise
                print('nouvel essai Edge TTS :', e)
        x, off = trim(decode(mp3), 0.012, 0.020, 0.060)
        return x, [(s - off, e - off) for s, e, _ in bounds]
    wav = f'{out}/lines/{n:02d}.wav'
    # Piper lit mal « … » et les guillemets : on les remplace par des pauses simples.
    spoken = text.replace('…', ',').replace('«', '').replace('»', '').replace(' :', ',')
    subprocess.run(['piper', '-m', f"assets/voices/{V['model']}.onnx", '--length-scale', str(V['lengthScale']), '-f', wav],
                   input=spoken.encode(), check=True, capture_output=True)
    x = decode(wav)
    env = np.convolve(np.abs(x), np.ones(441) / 441, 'same')
    idx = np.where(env > 0.01)[0]
    return x[max(idx[0] - 600, 0):min(idx[-1] + 1500, len(x))], None


norm = lambda s: re.sub(r'[^\wÀ-ÿ\'-]', '', s).lower()


def words_timing(text, keys, start, dur, bounds):
    words = text.split()
    keyset = {norm(k) for k in keys}
    is_key = lambda w: norm(w) in keyset or norm(w).split("'")[-1] in keyset
    if bounds and len(bounds) == len(words):   # minutage exact fourni par le moteur
        return [{'w': w, 's': round(start + s, 3), 'e': round(start + e, 3), 'key': is_key(w)} for w, (s, e) in zip(words, bounds)]
    # sinon : répartition proportionnelle à la longueur des mots
    weights = [len(re.sub(r'[^\wÀ-ÿ\']', '', w)) + 2 + (4 if re.search(r'[…,.:?!»]$', w) else 0) for w in words]
    total, acc, res = sum(weights), 0, []
    s0, d = (start + bounds[0][0], bounds[-1][1] - bounds[0][0]) if bounds else (start + 0.05, dur - 0.12)
    for w, wt in zip(words, weights):
        s = s0 + d * acc / total; acc += wt
        res.append({'w': w, 's': round(s, 3), 'e': round(s0 + d * acc / total, 3), 'key': is_key(w)})
    return res


blocks = [('hook', ep['hook'])] + [(f'scene{i}', s) for i, s in enumerate(ep['scenes'])] + [('outro', ep['outro'])]
track, t, timeline = [np.zeros(int(LEAD * SR))], LEAD, {'blocks': []}
n = 0
for bi, (name, blk) in enumerate(blocks):
    lines = []
    for li, line in enumerate(blk['lines']):
        audio, bounds = synth(line.get('say', line['text']), n)  # « say » = prononciation forcée
        n += 1
        dur = len(audio) / SR
        lines.append({'text': line['text'], 's': round(t, 3), 'e': round(t + dur, 3),
                      'words': words_timing(line['text'], line.get('keys', []), t, dur, bounds)})
        track.append(audio)
        t += dur
        gap = GAP_IN if li < len(blk['lines']) - 1 else (GAP_SCENE if bi < len(blocks) - 1 else TAIL)
        track.append(np.zeros(int(gap * SR)))
        t += gap
    timeline['blocks'].append({'name': name, 'lines': lines})
timeline['duration'] = round(t, 3)

voice = np.concatenate(track)
if not EDGE:
    voice = voice / (np.abs(voice).max() + 1e-9) * 0.9
with wave.open(f'{out}/voice.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(voice, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump(timeline, open(f'{out}/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
nw = sum(len(l['words']) for b in timeline['blocks'] for l in b['lines'])
print(f"durée totale : {timeline['duration']} s — {nw} mots")
