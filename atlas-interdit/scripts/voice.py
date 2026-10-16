"""Génère la voix off d'un épisode avec Piper et produit la timeline (phrases + mots).

Usage : python3 scripts/voice.py episodes/ep01-cadeaux-interdits.json
Sortie : build/<id>/voice.wav et build/<id>/timeline.json
"""
import json, os, re, subprocess, sys, wave
import numpy as np

SR = 44100
LEAD = 0.15        # silence avant la première phrase
GAP_IN = 0.18      # entre les deux phrases d'une même scène
GAP_SCENE = 0.55   # entre deux scènes (le globe tourne pendant ce temps)

ep_path = sys.argv[1]
ep = json.load(open(ep_path, encoding='utf-8'))
out = f"build/{ep['id']}"
os.makedirs(f"{out}/lines", exist_ok=True)
model = f"assets/voices/{ep['voice']}.onnx"


def synth(text, path):
    # Piper lit mal « … » et les guillemets : on les remplace par des pauses simples.
    spoken = text.replace('…', ',').replace('«', '').replace('»', '').replace(' :', ',')
    subprocess.run(['piper', '-m', model, '--length-scale', str(ep['lengthScale']), '-f', path],
                   input=spoken.encode(), check=True, capture_output=True)
    with wave.open(path) as w:
        sr, data = w.getframerate(), np.frombuffer(w.readframes(w.getnframes()), np.int16)
    x = data.astype(np.float32) / 32768
    # rééchantillonnage linéaire vers 44,1 kHz
    t = np.linspace(0, len(x) / sr, int(len(x) * SR / sr), endpoint=False)
    x = np.interp(t, np.arange(len(x)) / sr, x)
    # coupe les silences de début et de fin
    env = np.convolve(np.abs(x), np.ones(441) / 441, 'same')
    idx = np.where(env > 0.01)[0]
    a, b = max(idx[0] - 600, 0), min(idx[-1] + 1500, len(x))
    return x[a:b]


def words_timing(text, keys, start, dur):
    words = text.split()
    weights = []
    for w in words:
        wt = len(re.sub(r'[^\wÀ-ÿ\']', '', w)) + 2
        if re.search(r'[…,.:?!»]$', w):
            wt += 4  # pause après la ponctuation
        weights.append(wt)
    total, acc, res = sum(weights), 0, []
    norm = lambda s: re.sub(r'[^\wÀ-ÿ\'-]', '', s).lower()
    keyset = {norm(k) for k in keys}
    for w, wt in zip(words, weights):
        s = start + dur * acc / total
        acc += wt
        res.append({'w': w, 's': round(s, 3), 'e': round(start + dur * acc / total, 3),
                    'key': norm(w) in keyset or norm(w).split("'")[-1] in keyset})
    return res


blocks = [('hook', ep['hook'])] + [(f'scene{i}', s) for i, s in enumerate(ep['scenes'])] + [('outro', ep['outro'])]
track, t, timeline = [np.zeros(int(LEAD * SR))], LEAD, {'blocks': []}
n = 0
for bi, (name, blk) in enumerate(blocks):
    lines = []
    for li, line in enumerate(blk['lines']):
        audio = synth(line.get('say', line['text']), f"{out}/lines/{n:02d}.wav")  # « say » = prononciation forcée
        n += 1
        dur = len(audio) / SR
        lines.append({'text': line['text'], 's': round(t, 3), 'e': round(t + dur, 3),
                      'words': words_timing(line['text'], line.get('keys', []), t + 0.05, dur - 0.12)})
        track.append(audio)
        t += dur
        gap = GAP_IN if li < len(blk['lines']) - 1 else (GAP_SCENE if bi < len(blocks) - 1 else 1.6)
        track.append(np.zeros(int(gap * SR)))
        t += gap
    timeline['blocks'].append({'name': name, 'lines': lines})
timeline['duration'] = round(t, 3)

voice = np.concatenate(track)
voice = voice / (np.abs(voice).max() + 1e-9) * 0.9
with wave.open(f'{out}/voice.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((voice * 32767).astype(np.int16).tobytes())
json.dump(timeline, open(f'{out}/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('durée totale :', timeline['duration'], 's')
