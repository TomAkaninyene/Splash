"""Synthesises every sound effect used in the video into public/sfx/*.wav.

Everything is generated from scratch (no samples), so there are no licensing issues.
Run: python3 scripts/make_sfx.py  (needs numpy)
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
rng = np.random.default_rng(7)


def t(dur):
    return np.arange(int(SR * dur)) / SR


def noise(dur):
    return rng.uniform(-1, 1, int(SR * dur))


def band(x, lo, hi):
    """Brick-wall band-pass via FFT (fine for short one-shots)."""
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(freqs < lo) | (freqs > hi)] = 0
    return np.fft.irfft(spec, len(x))


def env(n, attack=0.005, decay=None, dur=None):
    """Linear attack then exponential decay (decay = time constant in s)."""
    tt = np.arange(n) / SR
    a = np.clip(tt / max(attack, 1e-4), 0, 1)
    d = np.exp(-tt / decay) if decay else np.ones(n)
    return a * d


def sweep(f0, f1, dur, shape='sine'):
    tt = t(dur)
    f = f0 * (f1 / f0) ** (tt / dur)
    phase = 2 * np.pi * np.cumsum(f) / SR
    if shape == 'square':
        return np.sign(np.sin(phase))
    if shape == 'saw':
        return 2 * ((phase / (2 * np.pi)) % 1) - 1
    return np.sin(phase)


def tone(f, dur, shape='sine'):
    return sweep(f, f, dur, shape)


def fade(x, fin=0.005, fout=0.02):
    n = len(x)
    a, b = int(SR * fin), int(SR * fout)
    x = x.copy()
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)
    return x


def mix(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[: len(p)] += p
    return out


def place(buf, x, at):
    i = int(at * SR)
    end = min(len(buf), i + len(x))
    buf[i:end] += x[: end - i]


def save(name, x, peak=0.9):
    x = fade(np.asarray(x, dtype=float))
    m = np.max(np.abs(x)) or 1
    x = (x / m * peak * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(x.tobytes())


def thud(dur=0.6, f0=110, f1=40):
    body = sweep(f0, f1, dur) * env(int(SR * dur), 0.002, 0.12)
    click = band(noise(0.05), 800, 6000) * env(int(SR * 0.05), 0.001, 0.01)
    return mix(body, click * 0.6)


def build():
    os.makedirs(OUT, exist_ok=True)

    # Two-tone control-room klaxon, 4 s.
    k = np.zeros(int(SR * 4))
    for i in range(8):
        f = 620 if i % 2 == 0 else 470
        place(k, fade(tone(f, 0.45, 'square'), 0.01, 0.05) * 0.5, i * 0.5)
    save('alarm', band(k, 200, 3000), 0.6)

    # Keypad beep for each typed character.
    save('key', tone(1350, 0.07) * env(int(SR * 0.07), 0.002, 0.03), 0.5)

    # ACCESS DENIED buzzer.
    save('denied', mix(tone(140, 0.7, 'saw'), tone(147, 0.7, 'saw')) * env(int(SR * 0.7), 0.01, 0.5), 0.8)

    # CODE ACCEPTED: three rising beeps.
    acc = np.zeros(int(SR * 0.6))
    for i, f in enumerate([880, 1175, 1760]):
        place(acc, tone(f, 0.12) * env(int(SR * 0.12), 0.003, 0.06), i * 0.13)
    save('accepted', acc, 0.7)

    # Big letter slam: low thud + metallic clang.
    clang = mix(*[tone(f, 0.5) * env(int(SR * 0.5), 0.001, 0.08) * a for f, a in [(523, 0.4), (1307, 0.25), (2211, 0.15)]])
    save('slam', mix(thud(0.7, 130, 35), clang * 0.5))

    # Cartoon boing (chair spring) and whoosh up.
    boing = sweep(180, 520, 0.5) * (1 + 0.6 * np.sin(2 * np.pi * 18 * t(0.5))) * env(int(SR * 0.5), 0.002, 0.25)
    whoosh = band(noise(0.9), 300, 5000) * np.sin(np.pi * t(0.9) / 0.9) ** 2
    save('launch', mix(boing * 0.8, whoosh * 0.7))

    # Ceiling crash: debris noise + thud.
    debris = np.zeros(int(SR * 1.2))
    for _ in range(25):
        place(debris, band(noise(0.08), 1500, 9000) * env(int(SR * 0.08), 0.001, 0.02) * rng.uniform(0.2, 0.6), rng.uniform(0, 1.0))
    save('crash', mix(thud(0.8, 90, 30), band(noise(1.2), 400, 8000) * env(int(SR * 1.2), 0.002, 0.25) * 0.6, debris))

    # Rules-update siren (up/down wail), 2.4 s.
    tt = t(2.4)
    f = 700 + 450 * np.sin(2 * np.pi * 1.2 * tt - np.pi / 2)
    siren = np.sin(2 * np.pi * np.cumsum(f) / SR)
    save('siren', siren * 0.6, 0.55)

    # Pop-up window.
    save('popup', sweep(500, 1400, 0.12) * env(int(SR * 0.12), 0.002, 0.05), 0.6)

    # Frantic typing, 3 s.
    typing = np.zeros(int(SR * 3))
    pos = 0.0
    while pos < 2.9:
        place(typing, band(noise(0.03), 2000, 9000) * env(int(SR * 0.03), 0.0005, 0.006) * rng.uniform(0.4, 1), pos)
        pos += rng.uniform(0.035, 0.09)
    save('typing', typing, 0.5)

    # Rocket rumble, 8 s, swelling.
    rum = band(noise(8), 30, 400) + 0.3 * band(noise(8), 400, 2500)
    rum *= np.clip(t(8) / 1.5, 0, 1) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.5 * t(8)))
    save('rumble', rum, 0.7)

    # Whoosh pass-by (plane, chair).
    pb = band(noise(1.0), 200, 4000) * np.exp(-((t(1.0) - 0.45) ** 2) / 0.02)
    save('passby', pb, 0.7)

    # Coffee splash.
    sp = band(noise(0.5), 600, 7000) * env(int(SR * 0.5), 0.002, 0.08)
    drips = np.zeros(int(SR * 0.9))
    for i in range(4):
        place(drips, sweep(600 + 150 * i, 1500 + 200 * i, 0.06) * env(int(SR * 0.06), 0.002, 0.02) * 0.5, 0.35 + i * 0.13)
    save('splash', mix(sp, drips))

    # Door slam (auntie).
    save('door', mix(thud(0.6, 95, 45), band(noise(0.25), 150, 3000) * env(int(SR * 0.25), 0.001, 0.05) * 0.7))

    # Giant button slam.
    save('button', mix(thud(0.6, 150, 50), tone(2400, 0.04) * env(int(SR * 0.04), 0.001, 0.01) * 0.6))

    # Record scratch into the freeze-frame.
    tt = t(0.5)
    fs = 900 * (1 - tt / 0.5) + 150
    scratch = np.sin(2 * np.pi * np.cumsum(fs) / SR) * band(noise(0.5), 500, 6000)
    save('scratch', scratch * env(int(SR * 0.5), 0.003, 0.2), 0.8)

    # CLOSE CALL stamp.
    save('stamp', thud(0.5, 170, 60))

    # Explosion.
    exp_len = 2.2
    boom = band(noise(exp_len), 20, 900) * env(int(SR * exp_len), 0.003, 0.5)
    sizzle = band(noise(exp_len), 1500, 8000) * env(int(SR * exp_len), 0.003, 0.25) * 0.4
    save('explosion', mix(boom, sizzle, thud(1.0, 70, 25)))

    # Tension riser while the technician freezes, 2 s.
    rs = sweep(200, 1200, 2.0) * np.linspace(0.1, 1, int(SR * 2.0)) + band(noise(2.0), 2000, 8000) * np.linspace(0, 0.3, int(SR * 2.0))
    save('riser', rs, 0.5)

    # Heroic brass-ish chord for the flag plant / logo sting.
    chord = np.zeros(int(SR * 2.0))
    for f in [261.6, 329.6, 392.0, 523.3]:
        for h, a in [(1, 1), (2, 0.5), (3, 0.3), (4, 0.15)]:
            chord += a * tone(f * h, 2.0) * 0.25
    save('sting', chord * env(int(SR * 2.0), 0.02, 0.7), 0.8)

    # Flag thunk.
    save('flag', thud(0.4, 220, 90))

    # Crowd cheer bed (goes under the layered STEEEVE takes).
    dur = 2.5
    crowd = np.zeros(int(SR * dur))
    for _ in range(40):
        f0 = rng.uniform(250, 900)
        v = band(noise(dur), f0, f0 * 2.2)
        am = 0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(2, 7) * t(dur) + rng.uniform(0, 6))
        crowd += v * am
    crowd *= np.clip(t(dur) / 0.15, 0, 1) * np.clip((dur - t(dur)) / 1.0, 0, 1)
    save('crowd', crowd, 0.6)


def build_hotline():
    # Ringback (two rings) and pickup click.
    ring = np.zeros(int(SR * 3.2))
    for start in (0.0, 1.8):
        place(ring, fade(mix(tone(440, 1.2), tone(480, 1.2)) * 0.5, 0.02, 0.05), start)
    save('ring', ring, 0.5)
    save('pickup', mix(band(noise(0.04), 1000, 8000) * env(int(SR * 0.04), 0.001, 0.008), thud(0.15, 200, 120) * 0.4), 0.6)

    # DTMF keys 1 and 2.
    save('dtmf1', mix(tone(697, 0.16), tone(1209, 0.16)) * 0.5, 0.55)
    save('dtmf2', mix(tone(697, 0.16), tone(1336, 0.16)) * 0.5, 0.55)

    # Busy / hang-up tone.
    busy = np.zeros(int(SR * 1.5))
    for i in range(3):
        place(busy, fade(mix(tone(480, 0.25), tone(620, 0.25)) * 0.5), i * 0.5)
    save('busy', busy, 0.5)

    # Cheesy hold music: soft electric-piano arpeggios over Cmaj7-Am7-Dm7-G7, 8 s loop.
    bar = 2.0
    chords = [[261.6, 329.6, 392.0, 493.9], [220.0, 261.6, 329.6, 392.0], [293.7, 349.2, 440.0, 523.3], [196.0, 246.9, 293.7, 349.2]]
    hold = np.zeros(int(SR * bar * 4))
    for c, notes in enumerate(chords):
        for k in range(8):
            f = notes[[0, 1, 2, 3, 2, 1, 2, 3][k]] * 2
            n = tone(f, 0.24) + 0.3 * tone(f * 2, 0.24)
            place(hold, n * env(len(n), 0.004, 0.09) * 0.35, c * bar + k * 0.25)
        pad = sum(tone(f / 2, bar) for f in notes) * 0.06
        place(hold, fade(pad, 0.1, 0.2), c * bar)
    save('hold', hold, 0.5)

    # Epic hold music: timpani hits and a swelling brass chord, 3 s.
    ep = np.zeros(int(SR * 3.0))
    for i, at in enumerate([0.0, 0.5, 1.0, 1.25, 1.5, 1.75, 2.0]):
        place(ep, sweep(90, 60, 0.6) * env(int(SR * 0.6), 0.002, 0.18) * (0.6 + 0.1 * i), at)
    brass = np.zeros(int(SR * 3.0))
    for f in [130.8, 196.0, 261.6, 311.1]:
        for h, a in [(1, 1), (2, 0.6), (3, 0.4), (4, 0.25), (5, 0.15)]:
            brass += a * tone(f * h, 3.0) * 0.12
    brass *= np.linspace(0.1, 1, len(brass)) ** 2
    save('hold_epic', mix(ep, brass), 0.8)

    # Clock fast-forward ticks for the time skip, 2 s.
    ticks = np.zeros(int(SR * 2.0))
    t0 = 0.0
    gap = 0.12
    while t0 < 1.95:
        place(ticks, band(noise(0.02), 2500, 9000) * env(int(SR * 0.02), 0.0005, 0.004), t0)
        t0 += gap
        gap = max(0.03, gap * 0.9)
    save('ticks', ticks, 0.5)

    # Light switches clicking on across the building.
    lights = np.zeros(int(SR * 1.6))
    for i in range(12):
        place(lights, band(noise(0.015), 1500, 7000) * env(int(SR * 0.015), 0.0005, 0.003) * rng.uniform(0.5, 1), i * 0.11 + rng.uniform(0, 0.04))
    save('lights', lights, 0.6)


if __name__ == '__main__':
    build()
    build_hotline()
    print('wrote', sorted(os.listdir(OUT)))
