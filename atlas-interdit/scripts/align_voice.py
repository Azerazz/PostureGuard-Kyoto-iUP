"""Utilise une voix externe (ElevenLabs, ta propre voix…) à la place de Piper.

Transcrit le fichier avec faster-whisper, aligne les mots sur le script de l'épisode
et réécrit build/<id>/voice.wav + build/<id>/timeline.json.

Usage : python3 scripts/align_voice.py episodes/ep01-cadeaux-interdits.json ma_voix.mp3
Ensuite : ./make_video.sh episodes/ep01-cadeaux-interdits.json --voix-externe
"""
import difflib, json, re, subprocess, sys, wave
import numpy as np
from faster_whisper import WhisperModel

ep_path, audio_path = sys.argv[1], sys.argv[2]
ep = json.load(open(ep_path, encoding='utf-8'))
out = f"build/{ep['id']}"
SR = 44100
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', audio_path, '-ac', '1', '-ar', str(SR), f'{out}/voice.wav'], check=True)
w = wave.open(f'{out}/voice.wav'); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
x16 = np.interp(np.arange(0, len(x), SR / 16000), np.arange(len(x)), x).astype(np.float32)
model = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = model.transcribe(x16, language='fr', word_timestamps=True, beam_size=5)
heard = [(wd.word, wd.start, wd.end) for s in segs for wd in s.words]

norm = lambda s: re.sub(r"[^a-zà-ÿ0-9]", '', s.lower())
blocks = [('hook', ep['hook'])] + [(f'scene{i}', s) for i, s in enumerate(ep['scenes'])] + [('outro', ep['outro'])]
script = []  # (bloc, ligne, mot)
for bi, (_, blk) in enumerate(blocks):
    for li, line in enumerate(blk['lines']):
        for wd in line['text'].split():
            script.append((bi, li, wd))
sm = difflib.SequenceMatcher(None, [norm(s[2]) for s in script], [norm(h[0]) for h in heard], autojunk=False)
times = [None] * len(script)
for a, b, n in sm.get_matching_blocks():
    for k in range(n): times[a + k] = (heard[b + k][1], heard[b + k][2])
# interpole les mots non reconnus
known = [i for i, t in enumerate(times) if t]
for i in range(len(times)):
    if times[i] is None:
        prev = max([k for k in known if k < i], default=None); nxt = min([k for k in known if k > i], default=None)
        s0 = times[prev][1] if prev is not None else 0.0
        s1 = times[nxt][0] if nxt is not None else s0 + 0.4
        times[i] = (s0, max(s0 + 0.05, s1))

timeline = {'blocks': []}
idx = 0
for bi, (name, blk) in enumerate(blocks):
    lines = []
    for li, line in enumerate(blk['lines']):
        keys = {norm(k) for k in line.get('keys', [])}
        words = []
        for wd in line['text'].split():
            s, e = times[idx]; idx += 1
            words.append({'w': wd, 's': round(s, 3), 'e': round(e, 3), 'key': norm(wd) in keys or norm(wd.split("'")[-1]) in keys})
        lines.append({'text': line['text'], 's': words[0]['s'], 'e': words[-1]['e'], 'words': words})
    timeline['blocks'].append({'name': name, 'lines': lines})
timeline['duration'] = round(len(x) / SR + 0.5, 3)
json.dump(timeline, open(f'{out}/timeline.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
ok = sum(1 for a, b, n in sm.get_matching_blocks() for _ in range(n))
print(f'{ok}/{len(script)} mots alignés — timeline écrite')
