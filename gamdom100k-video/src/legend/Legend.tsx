import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {firstExisting} from '../components/audio';
import {Camera, Flash, Grade} from '../components/fx';
import {CrowningScene, DarkScene, EndScene, FireScene, ProphecyScene, StingerScene, TrialsScene, WhyScene} from './Scenes';
import {LEGEND_DURATION, scene} from './timing';

const PARTS = [
  {name: 'fire', C: FireScene, push: 0.08},
  {name: 'dark', C: DarkScene, push: 0.05},
  {name: 'prophecy', C: ProphecyScene, push: 0.1},
  {name: 'trials', C: TrialsScene, push: 0.04},
  {name: 'why', C: WhyScene, push: 0.12},
  {name: 'crowning', C: CrowningScene, push: 0.06},
  {name: 'endcard', C: EndScene, push: 0.03},
  {name: 'stinger', C: StingerScene, push: 0.06},
];

// Music bed: public/music/legend.mp3 (or the shared track.mp3), mixed under the voices.
const music = firstExisting(['music/legend.mp3', 'music/legend.wav', 'music/track.mp3', 'music/track.wav']);

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
    <Flash at={scene('why').from} color="#ffb060" length={6} />
    <Flash at={scene('crowning').from} color="#fff0c0" length={8} />
    <Flash at={scene('endcard').from} length={6} />
    <Grade />
    {music && <Audio src={staticFile(music)} volume={(f) => (f > LEGEND_DURATION - 45 ? Math.max(0, (LEGEND_DURATION - f) / 45) * 0.18 : 0.18)} />}
  </AbsoluteFill>
);
