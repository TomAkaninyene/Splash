import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {firstExisting} from '../components/audio';
import {Camera, Flash, Grade} from '../components/fx';
import {CallbackScene, CrowningScene, DarkScene, EndScene, FalseScene, FireScene, ProphecyScene, StingerScene, ThereScene, TrialsScene, WhyScene} from './Scenes';
import {LEGEND_DURATION, SCENES, scene} from './timing';

const PARTS = [
  {name: 'fire', C: FireScene, push: 0.08},
  {name: 'dark', C: DarkScene, push: 0.05},
  {name: 'prophecy', C: ProphecyScene, push: 0.1},
  {name: 'false', C: FalseScene, push: 0.05},
  {name: 'there', C: ThereScene, push: 0.14},
  {name: 'trials', C: TrialsScene, push: 0.04},
  {name: 'why', C: WhyScene, push: 0.12},
  {name: 'crowning', C: CrowningScene, push: 0.06},
  {name: 'endcard', C: EndScene, push: 0.03},
  {name: 'stinger', C: StingerScene, push: 0.06},
  {name: 'callback', C: CallbackScene, push: 0},
];

// A supplied track (public/music/legend.mp3 or track.mp3) replaces the original score below.
const music = firstExisting(['music/legend.mp3', 'music/legend.wav', 'music/track.mp3', 'music/track.wav']);

// Every spoken line, in global frames, so the music can duck under the voices.
const SPEECH = SCENES.flatMap((s) => s.cues.map((c) => [s.from + c.at - 4, s.from + c.at + c.len + 4] as const));
const DUCK = 0.4;
const RAMP = 6;
const duck = (g: number) => {
  let d = Infinity;
  for (const [a, b] of SPEECH) {
    if (g >= a && g <= b) return DUCK;
    d = Math.min(d, g < a ? a - g : g - b);
  }
  return d >= RAMP ? 1 : DUCK + (1 - DUCK) * (d / RAMP);
};

// Original score (scripts/make_music.py): which loop plays over which scenes. Gaps are deliberate
// silences — the music cuts dead for "Why three times? / Nobody knows" and for the rules callback.
const SCORE: {file: string; scenes: string[]; level: number}[] = [
  {file: 'music/score_village.wav', scenes: ['fire'], level: 0.8},
  {file: 'music/score_mystery.wav', scenes: ['dark', 'prophecy', 'false'], level: 1},
  {file: 'music/score_village.wav', scenes: ['there'], level: 0.7},
  {file: 'music/score_trials.wav', scenes: ['trials'], level: 0.75},
  {file: 'music/score_triumph.wav', scenes: ['crowning', 'endcard'], level: 0.68},
  {file: 'music/score_village.wav', scenes: ['stinger'], level: 0.6},
];

const Score: React.FC = () => (
  <>
    {SCORE.map(({file, scenes, level}, i) => {
      const from = scene(scenes[0]).from;
      const last = scene(scenes[scenes.length - 1]);
      const dur = last.from + last.dur - from;
      return (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none" name={`score:${file}`}>
          <Audio
            src={staticFile(file)}
            loop
            volume={(f) => level * duck(from + f) * Math.min(1, f / 8, (dur - f) / 4)}
          />
        </Sequence>
      );
    })}
  </>
);

export const Legend: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {PARTS.map(({name, C, push}) => {
      const s = scene(name);
      return (
        <Sequence key={name} name={name} from={s.from} durationInFrames={s.dur}>
          <Camera duration={s.dur} push={push}>
            <C />
          </Camera>
        </Sequence>
      );
    })}
    <Flash at={scene('there').from} color="#ffb060" length={6} />
    <Flash at={scene('why').from} color="#ffb060" length={6} />
    <Flash at={scene('crowning').from} color="#fff0c0" length={8} />
    <Flash at={scene('endcard').from} length={6} />
    <Grade />
    {music ? (
      <Audio src={staticFile(music)} volume={(f) => 0.22 * duck(f) * Math.min(1, (LEGEND_DURATION - f) / 45)} />
    ) : (
      <Score />
    )}
  </AbsoluteFill>
);
