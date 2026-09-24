import {continueRender, delayRender} from 'remotion';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

// Fonts are bundled locally so rendering never depends on a network fetch.
export const display = "'Poppins', sans-serif";
export const body = "'Inter', sans-serif";

const fontsHandle = delayRender('Loading fonts');
Promise.all(
  ['600 1em Poppins', '700 1em Poppins', '800 1em Poppins', '400 1em Inter', '500 1em Inter', '600 1em Inter'].map(
    (font) => document.fonts.load(font)
  )
).then(() => continueRender(fontsHandle));

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 30 * FPS;

// Brand colours: the rainbow loop from the splash logo plus the app's own theme colours.
export const colors = {
  bg: '#0A0A18',
  bgSoft: '#14142A',
  text: '#FFFFFF',
  muted: '#A6A6C4',
  red: '#FF3D57',
  orange: '#FF9F1C',
  yellow: '#F6F652', // app's card colour
  teal: '#03DAC5', // app colorSecondary
  blue: '#2F80ED',
  purple: '#6200EE', // app colorPrimary
  lilac: '#BB86FC',
};

export const rainbow = [
  colors.red,
  colors.orange,
  colors.yellow,
  colors.teal,
  colors.blue,
  colors.lilac,
];

export const rainbowCss = `linear-gradient(90deg, ${rainbow.join(', ')})`;
