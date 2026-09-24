import {Img, staticFile} from 'remotion';
import {body, colors} from '../theme';
import {firstExisting} from './audio';

// An official logo file in public/brand/ (logo.svg / logo.png) overrides the traced mark below.
const logoFile = firstExisting(['brand/logo.svg', 'brand/logo.png', 'brand/logo.webp']);

/** Gamdom castle mark, traced from the logo image the user supplied. */
export const GamdomMark: React.FC<{size: number}> = ({size}) =>
  logoFile ? (
    <Img src={staticFile(logoFile)} style={{height: size}} />
  ) : (
    <svg width={size * (440 / 560)} height={size} viewBox="80 20 440 560" strokeLinejoin="round">
      <path d="M88 135 L157 100 L157 182 L232 145 L232 62 L300 28 L300 218 L100 312 L88 300 Z" fill={colors.brand} stroke={colors.brand} strokeWidth={10} />
      <path d="M512 135 L443 100 L443 182 L368 145 L368 62 L300 28 L300 218 L500 312 L512 300 Z" fill={colors.brandShade} stroke={colors.brandShade} strokeWidth={10} />
      <path d="M300 295 L150 368 L150 498 L300 570 Z" fill={colors.brand} stroke={colors.brand} strokeWidth={10} />
      <path d="M300 295 L450 368 L450 498 L300 570 Z" fill={colors.brandShade} stroke={colors.brandShade} strokeWidth={10} />
    </svg>
  );

export const GamdomLogo: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: height * 0.25, ...style}}>
    <GamdomMark size={height * 1.25} />
    <div style={{fontFamily: body, fontWeight: 900, fontSize: height, letterSpacing: height * 0.02, color: '#fff', lineHeight: 1}}>
      GAMDOM
    </div>
  </div>
);

export const Flag: React.FC<{wave: number; scale?: number}> = ({wave, scale = 1}) => (
  <div style={{position: 'relative', width: 420 * scale, height: 520 * scale}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 16 * scale, height: 520 * scale, background: '#d9d9d9', border: '3px solid #111', borderRadius: 8}} />
    <div
      style={{
        position: 'absolute',
        left: 16 * scale,
        top: 10 * scale,
        width: 400 * scale,
        height: 250 * scale,
        background: colors.night,
        border: `6px solid ${colors.brand}`,
        borderRadius: 10,
        transform: `skewY(${Math.sin(wave) * 4}deg)`,
        transformOrigin: 'left center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GamdomMark size={190 * scale} />
    </div>
  </div>
);
