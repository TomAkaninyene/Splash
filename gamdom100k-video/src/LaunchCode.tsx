import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {firstExisting} from './components/audio';
import {Flash} from './components/fx';
import {S1Password} from './scenes/S1Password';
import {S2Steve} from './scenes/S2Steve';
import {S3Rules} from './scenes/S3Rules';
import {S4Flight} from './scenes/S4Flight';
import {S5Cashout} from './scenes/S5Cashout';
import {S6Podium} from './scenes/S6Podium';
import {S7EndCard} from './scenes/S7EndCard';
import {S8Stinger} from './scenes/S8Stinger';
import {DURATION, T} from './theme';

const scenes = [
  {name: '1 Password', from: T.password, to: T.steve, C: S1Password},
  {name: '2 STEVE', from: T.steve, to: T.accepted, C: S2Steve},
  {name: '3 Rules update', from: T.accepted, to: T.flight, C: S3Rules},
  {name: '4 Flight', from: T.flight, to: T.cashout, C: S4Flight},
  {name: '5 Cash out', from: T.cashout, to: T.podium, C: S5Cashout},
  {name: '6 Podium', from: T.podium, to: T.endcard, C: S6Podium},
  {name: '7 End card', from: T.endcard, to: T.stinger, C: S7EndCard},
  {name: '8 Stinger', from: T.stinger, to: T.end, C: S8Stinger},
];

// Music bed: drop the Pixabay track into public/music/ as track.mp3 (or .wav).
const music = firstExisting(['music/track.mp3', 'music/track.wav', 'music/track.m4a']);

export const LaunchCode: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {scenes.map(({name, from, to, C}) => (
      <Sequence key={name} name={name} from={from} durationInFrames={to - from}>
        <C />
      </Sequence>
    ))}
    {/* Punchy white flashes on the big cuts */}
    <Flash at={T.flight} />
    <Flash at={T.podium} />
    <Flash at={T.endcard} length={6} />
    {music && (
      <Audio
        src={staticFile(music)}
        volume={(f) => (f > DURATION - 45 ? Math.max(0, (DURATION - f) / 45) * 0.22 : 0.22)}
      />
    )}
  </AbsoluteFill>
);
