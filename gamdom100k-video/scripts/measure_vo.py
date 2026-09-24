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
    'elder-gather', 'kid-code', 'elder-spoil', 'elder-dark', 'elder-prophecy', 'elder-trials',
    'kid-why', 'elder-nobody', 'elder-written', 'elder-code', 'kid-wake',
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


def speech_span(rel):
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        subprocess.run(
            ['npx', 'remotion', 'ffmpeg', '-v', 'error', '-y', '-i', os.path.join(PUB, rel), '-ac', '1', '-ar', '22050', '-c:a', 'pcm_s16le', tmp.name],
            cwd=ROOT, check=True,
        )
        w = wave.open(tmp.name)
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    hop = int(sr * 0.01)
    e = np.array([np.sqrt((x[i:i + hop] ** 2).mean()) for i in range(0, len(x) - hop, hop)])
    on = np.where(e > max(e.max() * 0.05, 1e-3))[0]
    return round(max(0, on[0] * 0.01 - 0.03), 2), round(on[-1] * 0.01 + 0.08, 2)


def main():
    out = {'lines': {}, 'steve': []}
    for i in IDS:
        rel, mine = find(i)
        if rel:
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
