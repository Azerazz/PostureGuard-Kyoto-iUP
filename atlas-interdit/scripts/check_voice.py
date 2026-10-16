"""Contrôle qualité : transcrit chaque phrase générée et la compare au script.
Usage : python3 scripts/check_voice.py episodes/ep01-cadeaux-interdits.json"""
import difflib, json, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
ep = json.load(open(sys.argv[1], encoding='utf-8'))
texts = [l['text'] for b in [ep['hook'], *ep['scenes'], ep['outro']] for l in b['lines']]
ext = 'mp3' if isinstance(ep['voice'], dict) and ep['voice'].get('engine') == 'edge' else 'wav'
m = WhisperModel('small', device='cpu', compute_type='int8')
N = lambda s: re.sub(r"[^a-zà-ÿ0-9 ]", '', s.lower().replace("'", ' ').replace('-', ' ')).split()
for i, t in enumerate(texts):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f"build/{ep['id']}/lines/{i:02d}.{ext}", '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    segs, _ = m.transcribe(np.frombuffer(raw, np.float32), language='fr')
    heard = ' '.join(s.text.strip() for s in segs)
    r = difflib.SequenceMatcher(None, N(t), N(heard)).ratio()
    print(f"{i:02d} {r:.2f}{'' if r > 0.9 else '  <== à vérifier'} | {heard}")
