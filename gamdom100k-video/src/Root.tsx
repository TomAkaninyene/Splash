import {Composition} from 'remotion';
import {LaunchCode} from './LaunchCode';
import {Legend} from './legend/Legend';
import {LEGEND_DURATION} from './legend/timing';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LaunchCode" component={LaunchCode} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Legend" component={Legend} durationInFrames={LEGEND_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
