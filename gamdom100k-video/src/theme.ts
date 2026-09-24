import {continueRender, delayRender} from 'remotion';
import '@fontsource/bangers/400.css';
import '@fontsource/anton/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/800.css';
import '@fontsource/inter/900.css';

export const comic = "'Bangers', sans-serif";
export const impact = "'Anton', sans-serif";
export const body = "'Inter', sans-serif";

const fontsHandle = delayRender('Loading fonts');
Promise.all(
  ['400 1em Bangers', '400 1em Anton', '500 1em Inter', '800 1em Inter', '900 1em Inter'].map((f) =>
    document.fonts.load(f)
  )
).then(() => continueRender(fontsHandle));

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 34 * FPS;

export const colors = {
  // Sampled from the Gamdom logo the user supplied.
  brand: '#00FF88',
  brandShade: '#00D473',
  brandDark: '#0E7C43',
  night: '#0E1F20',
  room: '#111827',
  wall: '#172033',
  panel: '#1F2A40',
  screen: '#050A10',
  red: '#FF3040',
  amber: '#FFC22E',
  white: '#FFFFFF',
  ink: '#0A0A0A',
  muted: '#9AA6BF',
};

// Scene boundaries in frames (30 fps). Voice and SFX cues are relative to scene starts.
export const T = {
  password: 0,
  steve: 120,
  accepted: 270,
  flight: 390,
  cashout: 600,
  podium: 780,
  endcard: 870,
  stinger: 945,
  end: DURATION,
};
