import {AbsoluteFill, Sequence} from 'remotion';
import {Background} from './components/Background';
import {SceneFade} from './components/SceneFade';
import {CallToAction} from './scenes/CallToAction';
import {Hook} from './scenes/Hook';
import {Intro} from './scenes/Intro';
import {Launch} from './scenes/Launch';
import {Showcase} from './scenes/Showcase';

// Timeline (30 fps, 900 frames). Scenes overlap by 10 frames to cross-fade.
const scenes = [
  {name: 'Intro', from: 0, duration: 110, Component: Intro},
  {name: 'Hook', from: 100, duration: 115, Component: Hook},
  {name: 'Showcase', from: 205, duration: 490, Component: Showcase},
  {name: 'Launch', from: 685, duration: 105, Component: Launch},
  {name: 'CallToAction', from: 780, duration: 120, Component: CallToAction},
];

export const Promo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    {scenes.map(({name, from, duration, Component}, i) => (
      <Sequence key={name} name={name} from={from} durationInFrames={duration}>
        <SceneFade fadeIn={i > 0} fadeOut={i < scenes.length - 1}>
          <Component />
        </SceneFade>
      </Sequence>
    ))}
  </AbsoluteFill>
);
