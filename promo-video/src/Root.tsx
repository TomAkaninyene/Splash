import {Composition} from 'remotion';
import {Promo} from './Promo';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SplashPromo"
    component={Promo}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
