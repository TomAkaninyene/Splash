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
