import {Composition} from 'remotion';
import {LaunchCode} from './LaunchCode';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="LaunchCode"
    component={LaunchCode}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
