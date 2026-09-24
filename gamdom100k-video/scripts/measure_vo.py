"""Measures the voice lines for TALES BY GAMDOM LIGHT and writes src/legend/cues.json.

For each line it uses your own recording from public/vo/legend/mine/<id>.(m4a|mp3|wav) if present,
otherwise the ElevenLabs file in public/vo/legend/<id>.mp3. It records where the speech starts and
ends so the edit can trim silence and size each scene to the actual delivery.
Run: python3 scripts/measure_vo.py   (then re-render)
"""
import json
import os
import subprocess
import tempfile
import wave

import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
PUB = os.path.join(ROOT, 'public')
IDS = [
    'elder-gather', 'kid-code', 'elder-spoil', 'elder-dark', 'elder-prophecy', 'elder-false', 'kid-there', 'elder-it', 'elder-trials',
    'kid-why', 'elder-nobody', 'elder-written', 'elder-code', 'kid-wake', 'elder-four',
]
AI_STEVE = [f'all-steve-{i}' for i in range(2, 6)]  # the four young ElevenLabs shouts
MINE_STEVE = [f'steve-{i}' for i in range(1, 9)]


def find(name):
    for ext in ('m4a', 'mp3', 'wav', 'aac', 'ogg'):
        p = f'vo/legend/mine/{name}.{ext}'
        if os.path.exists(os.path.join(PUB, p)):
            return p, True
    p = f'vo/legend/{name}.mp3'
    return (p, False) if os.path.exists(os.path.join(PUB, p)) else (None, False)


MAX_PAUSE = 0.32  # seconds; longer silences inside ElevenLabs guide lines are shortened to this


def load(rel, sr=44100):
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        subprocess.run(
            ['npx', 'remotion', 'ffmpeg', '-v', 'error', '-y', '-i', os.path.join(PUB, rel), '-ac', '1', '-ar', str(sr), '-c:a', 'pcm_s16le', tmp.name],
            cwd=ROOT, check=True,
        )
        w = wave.open(tmp.name)
        return np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768, w.getframerate()


def activity(x, sr):
    hop = int(sr * 0.01)
    e = np.array([np.sqrt((x[i:i + hop] ** 2).mean()) for i in range(0, len(x) - hop, hop)])
    return e > max(e.max() * 0.05, 1e-3)


def speech_span(rel):
    x, sr = load(rel, 22050)
    on = np.where(activity(x, sr))[0]
    return round(max(0, on[0] * 0.01 - 0.03), 2), round(on[-1] * 0.01 + 0.08, 2)


def tighten(rel, name):
    """Writes a copy of `rel` with internal pauses capped at MAX_PAUSE; returns its path."""
    x, sr = load(rel)
    act = activity(x, sr)
    hop = int(sr * 0.01)
    keep = np.ones(len(x), bool)
    fade = int(sr * 0.01)
    i = 0
    on = np.where(act)[0]
    while i < len(act):
        if not act[i] and on[0] < i < on[-1]:
            j = i
            while j < len(act) and not act[j]:
                j += 1
            if (j - i) * 0.01 > MAX_PAUSE:
                cut_from = (i * hop) + int(sr * MAX_PAUSE / 2)
                cut_to = (j * hop) - int(sr * MAX_PAUSE / 2)
                keep[cut_from:cut_to] = False
            i = j
        else:
            i += 1
    y = x.copy()
    # Short fades either side of every cut to avoid clicks.
    edges = np.where(np.diff(keep.astype(int)) != 0)[0]
    for e in edges:
        a, b = max(0, e - fade), min(len(y), e + fade)
        y[a:b] *= np.abs(np.linspace(-1, 1, b - a))
    y = y[keep]
    out = f'vo/legend/tight/{name}.wav'
    os.makedirs(os.path.join(PUB, 'vo/legend/tight'), exist_ok=True)
    with wave.open(os.path.join(PUB, out), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    return out


def main():
    out = {'lines': {}, 'steve': []}
    for i in IDS:
        rel, mine = find(i)
        if rel:
            if not mine:
                rel = tighten(rel, i)
            s, e = speech_span(rel)
            out['lines'][i] = {'file': rel, 'start': s, 'end': e, 'mine': mine}
            print(f'{i:15s} {"MINE" if mine else "AI  "} {e - s:4.2f}s')
    for name in MINE_STEVE + AI_STEVE:
        rel, mine = find(name)
        if rel and (mine or name in AI_STEVE):
            s, e = speech_span(rel)
            out['steve'].append({'file': rel, 'start': s, 'mine': mine})
    print('STEVE takes:', len(out['steve']))
    with open(os.path.join(ROOT, 'src', 'legend', 'cues.json'), 'w') as f:
        json.dump(out, f, indent=1)


if __name__ == '__main__':
    main()
