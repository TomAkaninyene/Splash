import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/** Screen shake that kicks at each hit frame and decays over ~12 frames. */
export const shakeOffset = (frame: number, hits: number[], strength = 26) => {
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const d = frame - h;
    if (d < 0 || d > 14) continue;
    const amp = strength * Math.exp(-d / 4);
    x += Math.sin(d * 2.9 + h) * amp;
    y += Math.cos(d * 3.7 + h * 0.7) * amp;
  }
  return {x, y};
};

export const Shake: React.FC<{hits: number[]; strength?: number; children: React.ReactNode}> = ({
  hits,
  strength,
  children,
}) => {
  const frame = useCurrentFrame();
  const {x, y} = shakeOffset(frame, hits, strength);
  return (
    <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(1.04)`}}>{children}</AbsoluteFill>
  );
};

/** White flash that fades out, for hard cuts and impacts. */
export const Flash: React.FC<{at: number; color?: string; length?: number}> = ({
  at,
  color = '#fff',
  length = 8,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + length], [0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (frame < at || o <= 0) return null;
  return <AbsoluteFill style={{background: color, opacity: o}} />;
};

/** Slow push-in with a touch of handheld sway, applied per scene. */
export const Camera: React.FC<{duration: number; push?: number; children: React.ReactNode}> = ({duration, push = 0.07, children}) => {
  const frame = useCurrentFrame();
  const s = 1 + push * (frame / duration);
  const sx = Math.sin(frame / 23) * 4 + Math.sin(frame / 7.3) * 1.2;
  const sy = Math.cos(frame / 19) * 3 + Math.cos(frame / 5.9) * 1;
  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${s})`, transformOrigin: '50% 42%'}}>{children}</AbsoluteFill>
  );
};

/** Film look over the whole video: vignette, grain and slightly crushed blacks. */
export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{opacity: 0.09, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,20,30,0.18) 0%, transparent 30%, transparent 70%, rgba(30,10,0,0.15) 100%)', mixBlendMode: 'soft-light', pointerEvents: 'none'}} />
    </>
  );
};
