"""Composes the original music score for TALES BY GAMDOM LIGHT into public/music/*.wav.

Four seamless loops, one per mood (all synthesised here, so there is nothing to license):
  score_village  - warm kalimba storytelling groove (the fire)
  score_mystery  - low drone, bells and sparse kalimba in a minor key (dark times, prophecy)
  score_trials   - fast kalimba ostinato, talking drum and shaker (the trials montage)
  score_triumph  - bright major kalimba, pad and drums (the crowning, end card)
Run: python3 scripts/make_music.py
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import make_sfx as fx  # noqa: E402  (shares the synth helpers)

SR = fx.SR
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'music')
rng = np.random.default_rng(11)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def kalimba(f, dur=1.4, vel=1.0):
    tt = fx.t(dur)
    body = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.55)
    tine = 0.35 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt / 0.07)
    knock = fx.band(fx.noise(dur), 1500, 6000) * np.exp(-tt / 0.004) * 0.15
    x = (body + tine + knock) * np.clip(tt / 0.002, 0, 1)
    return x * vel


def pad(freqs, dur, vol=0.08):
    tt = fx.t(dur)
    x = np.zeros(len(tt))
    for f in freqs:
        for d in (-0.4, 0.4):
            x += np.sin(2 * np.pi * (f + d) * tt) + 0.3 * np.sin(2 * np.pi * 2 * (f + d) * tt)
    swell = np.clip(tt / 1.0, 0, 1) * np.clip((dur - tt) / 1.0, 0, 1)
    return x * swell * vol


def shaker(vol=0.12):
    return fx.band(fx.noise(0.06), 5000, 11000) * fx.env(int(SR * 0.06), 0.004, 0.015) * vol


def talking_drum(f0, f1, vol=0.7):
    return fx.sweep(f0, f1, 0.26) * fx.env(int(SR * 0.26), 0.002, 0.08) * vol


def loop(buf, tail):
    """Folds the ring-out past the loop point back onto the start so the loop is seamless."""
    n = len(buf) - tail
    out = buf[:n].copy()
    out[:tail] += buf[n:]
    return out


def write(name, x, peak=0.5):
    fx.OUT = OUT
    fx.save(name, x, peak)


def village():
    bpm, beats = 88, 32
    beat = 60 / bpm
    dur = beat * beats
    tail = int(SR * 1.6)
    buf = np.zeros(int(SR * dur) + tail)
    # D major pentatonic, gentle two-bar phrases.
    scale = [62, 64, 66, 69, 71, 74, 76, 78]
    phrase = [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 4, 6, 5, 4, 2, 3]
    for i in range(beats * 2):
        if rng.random() < 0.18:
            continue
        n = scale[phrase[i % len(phrase)]]
        fx.place(buf, kalimba(midi(n), vel=0.8 if i % 2 == 0 else 0.5), i * beat / 2)
    # Bass notes on each bar.
    for bar, n in enumerate([50, 47, 43, 45] * 2):
        fx.place(buf, kalimba(midi(n), 2.5, 0.9), bar * beat * 4)
    for i in range(beats * 2):
        if i % 2 == 1:
            fx.place(buf, shaker(0.08), i * beat / 2)
    fx.place(buf, pad([midi(50), midi(57), midi(62)], dur, 0.03), 0)
    write('score_village', loop(buf, tail))


def mystery():
    dur = 10.0
    tail = int(SR * 2.5)
    buf = np.zeros(int(SR * dur) + tail)
    tt = fx.t(dur)
    drone = (np.sin(2 * np.pi * midi(38) * tt) + 0.6 * np.sin(2 * np.pi * midi(45) * tt) + 0.25 * np.sin(2 * np.pi * midi(50) * tt))
    drone *= 0.18 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.2 * tt))
    fx.place(buf, drone, 0)
    # D minor: sparse, questioning kalimba and bells.
    for at, n in [(0.5, 74), (1.6, 77), (2.4, 72), (4.2, 69), (5.0, 74), (6.6, 81), (7.4, 77), (8.8, 76)]:
        fx.place(buf, kalimba(midi(n), 2.0, 0.6), at)
    for at, n in [(3.0, 86), (8.0, 89)]:
        bell = fx.mix(fx.tone(midi(n), 2.5), fx.tone(midi(n) * 2.76, 2.5) * 0.4) * fx.env(int(SR * 2.5), 0.003, 0.7) * 0.25
        fx.place(buf, bell, at)
    write('score_mystery', loop(buf, tail), 0.42)


def trials():
    bpm = 124
    beat = 60 / bpm
    beats = 16
    dur = beat * beats
    tail = int(SR * 1.4)
    buf = np.zeros(int(SR * dur) + tail)
    # Driving 16th-note kalimba ostinato in D minor pentatonic.
    riff = [62, 69, 72, 69, 65, 69, 72, 74]
    for i in range(beats * 4):
        n = riff[i % len(riff)] + (12 if (i // 16) % 4 == 3 and i % 2 == 0 else 0)
        fx.place(buf, kalimba(midi(n), 0.8, 0.75 if i % 4 == 0 else 0.45), i * beat / 4)
    # Talking-drum phrase each bar: the drum "speaks" with pitch bends.
    pattern = [(0.0, 190, 120), (0.75, 150, 220), (1.0, 190, 120), (1.5, 130, 200), (2.0, 190, 120), (2.5, 210, 140), (3.0, 150, 240), (3.5, 190, 120)]
    for bar in range(beats // 4):
        for at, f0, f1 in pattern:
            fx.place(buf, talking_drum(f0, f1, 0.6), (bar * 4 + at) * beat)
        for k in range(4):
            fx.place(buf, fx.thud(0.35, 95, 50) * 0.6, (bar * 4 + k) * beat)
    for i in range(beats * 4):
        fx.place(buf, shaker(0.1 if i % 2 else 0.05), i * beat / 4)
    write('score_trials', loop(buf, tail))


def triumph():
    bpm = 118
    beat = 60 / bpm
    beats = 16
    dur = beat * beats
    tail = int(SR * 1.8)
    buf = np.zeros(int(SR * dur) + tail)
    chords = [[62, 66, 69], [67, 71, 74], [64, 69, 73], [62, 66, 69, 74]]  # D G A D
    for bar, ch in enumerate(chords):
        fx.place(buf, pad([midi(n) for n in ch], beat * 4 + 0.8, 0.05), bar * beat * 4)
        for k in range(8):
            n = ch[[0, 1, 2, 1, 2, 0, 2, 1][k]] + 12
            fx.place(buf, kalimba(midi(n), 1.0, 0.7), bar * beat * 4 + k * beat / 2)
        fx.place(buf, kalimba(midi(ch[0] - 12), 2.0, 0.9), bar * beat * 4)
        for k in range(4):
            fx.place(buf, fx.thud(0.4, 100, 50) * 0.55, (bar * 4 + k) * beat)
            fx.place(buf, talking_drum(200, 140, 0.35), (bar * 4 + k + 0.5) * beat)
    for i in range(beats * 4):
        fx.place(buf, shaker(0.09 if i % 2 else 0.04), i * beat / 4)
    write('score_triumph', loop(buf, tail))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    village()
    mystery()
    trials()
    triumph()
    print('wrote', sorted(f for f in os.listdir(OUT) if f.startswith('score_')))
