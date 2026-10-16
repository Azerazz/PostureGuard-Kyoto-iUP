"""Mesure une voix : mots/seconde (Whisper) et hauteur médiane (Hz).
Usage : python3 scripts/voice_stats.py fichier1 [fichier2 ...]"""
import subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

def load(path, sr=16000):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)

def median_f0(x, sr=16000):
    fr, hop, f0s = 1024, 256, []
    for i in range(0, len(x) - fr, hop):
        w = x[i:i + fr] * np.hanning(fr)
        if np.sqrt((w ** 2).mean()) < 0.02: continue
        ac = np.correlate(w, w, 'full')[fr - 1:]
        lo, hi = sr // 400, sr // 70
        lag = lo + np.argmax(ac[lo:hi])
        if ac[lag] > 0.45 * ac[0]: f0s.append(sr / lag)
    return float(np.median(f0s)) if f0s else 0.0

model = WhisperModel('small', device='cpu', compute_type='int8')
for p in sys.argv[1:]:
    x = load(p)
    segs, _ = model.transcribe(x, language='fr', word_timestamps=True)
    words = [w for s in segs for w in s.words]
    speech = words[-1].end - words[0].start if words else 0
    print(f"{p.split('/')[-1]}: {len(words)} mots / {speech:.1f} s parlées = {len(words)/max(speech,1e-6):.2f} mots/s, "
          f"F0 médiane {median_f0(x):.0f} Hz")
    print('   texte :', ' '.join(w.word.strip() for w in words)[:300])
