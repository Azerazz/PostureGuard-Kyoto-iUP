"""Bande-son : bruitages calés sur la timeline (+ musique synthétisée si "music": true dans l'épisode).

Par défaut pas de musique : elle s'ajoute dans TikTok (~10 %).

Usage : python3 scripts/audio.py episodes/ep01-cadeaux-interdits.json
Sortie : build/<id>/music_sfx.wav (la voix est mixée ensuite par ffmpeg dans make_video.sh)
"""
import json, sys, wave
import numpy as np

SR = 44100
ep = json.load(open(sys.argv[1], encoding='utf-8'))
out = f"build/{ep['id']}"
tl = json.load(open(f'{out}/timeline.json', encoding='utf-8'))
DUR = tl['duration']
N = int(DUR * SR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def tone(freq, dur, d=0.25, harm=(1, 0.35, 0.12)):
    n = int(dur * SR); t = np.arange(n) / SR
    sig = sum(h * np.sin(2 * np.pi * freq * (i + 1) * t) for i, h in enumerate(harm))
    return sig * env(n, 0.004, d)


def lowpass(x, alpha):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += alpha * (v - acc); y[i] = acc
    return y


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    j = min(len(buf), i + len(sig)); buf[max(i, 0):j] += gain * sig[max(0, -i):j - i]


# ---------- Musique : boucle « curiosité » en la mineur, 100 BPM ----------
music = np.zeros(N)
bpm = 100; beat = 60 / bpm; eighth = beat / 2
note = lambda m: 440 * 2 ** ((m - 69) / 12)
prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G
pattern = [0, 2, 1, 2, 0, 2, 1, 2]
bar = 4 * beat
nb = int(DUR / bar) + 1
for b in range(nb):
    chord = prog[b % 4]
    for k, idx in enumerate(pattern):
        at = b * bar + k * eighth
        add(music, tone(note(chord[idx] + 12), 0.5, 0.22), at, 0.18)
    # basse
    add(music, tone(note(chord[0] - 12), bar, 0.9, (1, 0.2)), b * bar, 0.30)
    for k in range(4):
        at = b * bar + k * beat
        # kick doux
        n = int(0.25 * SR); tt = np.arange(n) / SR
        kick = np.sin(2 * np.pi * (55 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 14)
        if k % 2 == 0: add(music, kick, at, 0.45)
        # shaker
        sh = rng.normal(0, 1, int(0.06 * SR)) * env(int(0.06 * SR), 0.002, 0.018)
        add(music, np.diff(sh, prepend=0), at + eighth, 0.10)
        add(music, np.diff(sh, prepend=0), at, 0.05)

# ---------- Bruitages ----------
sfx = np.zeros(N)
def whoosh(dur=0.9):
    n = int(dur * SR); x = rng.normal(0, 1, n)
    shape = np.sin(np.pi * np.arange(n) / n) ** 2
    lo = lowpass(x, 0.08); hi = x - lowpass(x, 0.35)
    mix = np.linspace(0, 1, n)
    return (lo * (1 - mix) + hi * 0.4 * mix) * shape
def pop():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (900 - 2600 * t) * t) * np.exp(-t * 35)
def thud():
    n = int(0.45 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (70 + 120 * np.exp(-t * 25)) * t) * np.exp(-t * 9)
    crack = lowpass(rng.normal(0, 1, n), 0.3) * np.exp(-t * 40)
    return body * 1.0 + crack * 0.6
def ding():
    return tone(1568, 0.6, 0.25, (1, 0.3)) + 0.6 * tone(2093, 0.6, 0.2, (1,))

blocks = tl['blocks']
scenes = blocks[1:-1]
T = [b['lines'][0]['s'] for b in scenes]
TOUT = blocks[-1]['lines'][0]['s']
W_ = whoosh(); P_ = pop(); TH_ = thud(); D_ = ding()
add(sfx, P_, 0.0, 0.5)
add(sfx, TH_, blocks[0]['lines'][0]['e'] - 0.55 + 0.12, 0.9)          # tampon du hook
for k, tk in enumerate(T):
    add(sfx, W_, tk - 0.55, 0.55)                                        # transition / avion
    add(sfx, P_, tk + 0.35 + 0.42, 0.55)                                 # objet qui atterrit
    add(sfx, TH_, scenes[k]['lines'][0]['e'] - 0.25 + 0.12, 0.9)          # tampon INTERDIT
    if len(scenes[k]['lines']) > 1:
        add(sfx, D_, scenes[k]['lines'][1]['s'], 0.22)                    # étiquette rouge
add(sfx, W_, TOUT - 0.55, 0.55)
for j in range(len(T)):
    add(sfx, P_, TOUT + 0.1 + j * 0.09 + 0.4, 0.25)

# ---------- Ducking de la musique sous la voix ----------
with wave.open(f'{out}/voice.wav') as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
v = np.pad(v, (0, max(0, N - len(v))))[:N]
venv = np.convolve(np.abs(v), np.ones(4410) / 4410, 'same')
duck = 1 - 0.45 * np.clip(venv / 0.05, 0, 1)
music *= duck / (np.abs(music).max() + 1e-9) * 0.16
music *= np.clip((DUR - t_all) / 1.5, 0, 1)                              # fondu final
sfx = sfx / (np.abs(sfx).max() + 1e-9) * 0.3  # bruitages discrets sous la voix
mix = (music if ep.get('music') else 0) + sfx
with wave.open(f'{out}/music_sfx.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print('bande-son écrite', DUR)
