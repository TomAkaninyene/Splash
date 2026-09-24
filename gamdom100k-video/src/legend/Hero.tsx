// The legendary hero: a full-body shadow-puppet cutout, always seen from behind or side-on.
// No face is ever drawn.

export type HeroPose = 'stand' | 'run' | 'jump' | 'surf' | 'raise';

export const Hero: React.FC<{height: number; pose: HeroPose; phase?: number; color?: string; smoke?: number}> = ({
  height,
  pose,
  phase = 0,
  color = '#120705',
  smoke = 0,
}) => {
  const swing = pose === 'run' ? Math.sin(phase) * 28 : 0;
  const cape = Math.sin(phase * 1.3) * 10;
  const legL = pose === 'jump' ? -35 : pose === 'surf' ? -20 : swing;
  const legR = pose === 'jump' ? 25 : pose === 'surf' ? 20 : -swing;
  const armUp = pose === 'raise' || pose === 'jump';
  return (
    <svg width={height * 0.6} height={height} viewBox="0 0 120 200" style={{overflow: 'visible'}}>
      {/* Cape billowing behind */}
      <path d={`M44 52 Q${10 + cape} 110 ${2 + cape * 1.6} 150 L${40 + cape} 140 Q50 100 58 56 Z`} fill={color} />
      {/* Legs */}
      <g transform={`rotate(${legL} 56 118)`}>
        <path d="M50 116 L46 190 L58 190 L62 116 Z" fill={color} />
      </g>
      <g transform={`rotate(${legR} 64 118)`}>
        <path d="M58 116 L62 190 L74 190 L70 116 Z" fill={color} />
      </g>
      {/* Torso, shoulders, head (back view) */}
      <path d="M40 60 Q60 48 80 60 L76 120 L44 120 Z" fill={color} />
      <circle cx={60} cy={36} r={17} fill={color} />
      {/* Arms */}
      <path d={armUp ? 'M44 64 Q30 40 34 12' : `M44 64 Q34 92 ${36 - swing * 0.4} 116`} stroke={color} strokeWidth={11} strokeLinecap="round" fill="none" />
      <path d={armUp ? 'M76 64 Q92 40 88 12' : `M76 64 Q86 92 ${84 + swing * 0.4} 116`} stroke={color} strokeWidth={11} strokeLinecap="round" fill="none" />
      {/* Smoke curling off a singed cape */}
      {smoke > 0 &&
        [0, 1, 2].map((i) => (
          <circle key={i} cx={10 + cape + i * 8} cy={140 - i * 22 - smoke * 20} r={8 + i * 4} fill="rgba(60,40,30,0.35)" opacity={1 - i * 0.25} />
        ))}
    </svg>
  );
};
