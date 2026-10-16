"""Musique de fond originale (libre de droits, générée) + bruitages.

Usage : python3 -I tools/build_music.py <dossier_projet> <durée_s>
Sorties : public/music.wav, public/pop.wav, public/ding.wav
"""
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(sys.argv[1]).resolve()
DUR = float(sys.argv[2])
SR = 44100
rng = np.random.default_rng(7)


def save(name, a):
    a = a / (np.abs(a).max() + 1e-9) * 0.9
    st = np.stack([a, a], 1) if a.ndim == 1 else a
    with wave.open(str(ROOT / "public" / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def pluck(freq, dur, bright=0.5):
    """Corde pincée (Karplus-Strong)."""
    n, p = int(dur * SR), max(int(SR / freq), 2)
    buf = rng.uniform(-1, 1, p) * bright
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


BPM = 100
beat = 60 / BPM
# Do – Sol – Lam – Fa, ambiance ukulélé légère
chords = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]]
bass = [48, 43, 45, 41]
melody = [76, 74, 72, 74, 76, 79, 76, 74, 72, 71, 72, 74, 72, 69, 72, None]

n = int((DUR + 2) * SR)
mix = np.zeros(n)
t, bar, step = 0.0, 0, 0
while t < DUR + 1:
    ch = chords[bar % 4]
    # strum : croche pointée sur chaque temps
    for b in range(4):
        for k, note in enumerate(ch):
            s = int((t + b * beat + k * 0.012) * SR)
            if s < n:
                tone = pluck(hz(note), 1.2, 0.35 if b % 2 else 0.5)
                mix[s:s + len(tone)] += tone[: n - s] * 0.5
    s = int(t * SR)
    tb = np.arange(int(beat * 4 * SR)) / SR
    bline = np.sin(2 * np.pi * hz(bass[bar % 4]) * tb) * np.exp(-tb * 1.2) * 0.6
    mix[s:s + len(bline)] += bline[: n - s]
    # mélodie douce à partir de la 3e mesure
    if bar >= 2:
        for h in range(4):
            note = melody[step % len(melody)]
            step += 1
            if note:
                s = int((t + h * beat) * SR)
                tm = np.arange(int(beat * SR * 0.95)) / SR
                tone = (np.sin(2 * np.pi * hz(note) * tm) + 0.3 * np.sin(4 * np.pi * hz(note) * tm)) * np.exp(-tm * 3)
                mix[s:s + len(tone)] += tone[: n - s] * 0.22
    # shaker
    for e in range(8):
        s = int((t + e * beat / 2) * SR)
        sh = rng.normal(0, 1, int(0.05 * SR)) * np.exp(-np.arange(int(0.05 * SR)) / 300) * (0.12 if e % 2 else 0.06)
        mix[s:s + len(sh)] += sh[: n - s]
    t += beat * 4
    bar += 1

mix = mix[: int(DUR * SR)]
fade = int(1.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)
mix[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
save("music.wav", mix)

tp = np.arange(int(0.12 * SR)) / SR
save("pop.wav", np.sin(2 * np.pi * (500 + 900 * tp / tp[-1]) * tp) * np.exp(-tp * 35))
td = np.arange(int(0.8 * SR)) / SR
save("ding.wav", (np.sin(2 * np.pi * 1318 * td) + 0.5 * np.sin(2 * np.pi * 1976 * td)) * np.exp(-td * 5))
print("ok")
