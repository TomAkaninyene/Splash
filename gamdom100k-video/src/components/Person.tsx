// Flat cartoon character drawn in a 200×320 box (head, torso, arms). Lower body is hidden
// behind the desk in every shot, so only the upper body is drawn.

export type Expr =
  | 'neutral'
  | 'confident'
  | 'nervous'
  | 'shock'
  | 'scream'
  | 'angry'
  | 'happy'
  | 'groan'
  | 'frozen';

export type Pose = 'down' | 'type' | 'facepalm' | 'up' | 'point' | 'hover' | 'slam' | 'hips';

export type PersonProps = {
  skin: string;
  shirt: string;
  hair?: 'short' | 'bald' | 'bun' | 'afro' | 'none';
  hairColor?: string;
  headwrap?: {base: string; accent: string};
  glasses?: boolean;
  headset?: boolean;
  mustache?: boolean;
  badge?: string;
  pattern?: {dots: string[]};
  expr: Expr;
  pose: Pose;
  /** 0 = arm raised, 1 = slammed down (pose 'slam'). */
  slam?: number;
  /** Typing jiggle phase (pose 'type'). */
  typePhase?: number;
  sweat?: number;
  width?: number;
  /** Internal: draw as a dark backlit silhouette (set via the `rim` prop on Person). */
  silhouette?: boolean;
};

const SHOULDER_L = [50, 196] as const;
const SHOULDER_R = [150, 196] as const;

type Arm = {elbow: [number, number]; hand: [number, number]};

const arms = (pose: Pose, slam = 0, phase = 0): {l: Arm; r: Arm} => {
  const bob = Math.sin(phase) * 8;
  switch (pose) {
    case 'type':
      return {
        l: {elbow: [28, 262], hand: [72, 300 + bob]},
        r: {elbow: [172, 262], hand: [128, 300 - bob]},
      };
    case 'facepalm':
      return {
        l: {elbow: [30, 260], hand: [44, 312]},
        r: {elbow: [186, 150], hand: [104, 96]},
      };
    case 'up':
      return {
        l: {elbow: [8, 150], hand: [22, 58]},
        r: {elbow: [192, 150], hand: [178, 58]},
      };
    case 'point':
      return {
        l: {elbow: [30, 260], hand: [44, 312]},
        r: {elbow: [190, 196], hand: [196, 120]},
      };
    case 'hover':
      return {
        l: {elbow: [30, 260], hand: [44, 312]},
        r: {elbow: [196, 200], hand: [224, 238]},
      };
    case 'slam': {
      const y = 30 + slam * 280;
      return {
        l: {elbow: [22, 240], hand: [36, 196]},
        r: {elbow: [196, 60 + slam * 170], hand: [160, y]},
      };
    }
    case 'hips':
      return {
        l: {elbow: [4, 250], hand: [48, 282]},
        r: {elbow: [196, 250], hand: [152, 282]},
      };
    default:
      return {
        l: {elbow: [30, 260], hand: [44, 312]},
        r: {elbow: [170, 260], hand: [156, 312]},
      };
  }
};

const armPath = (s: readonly [number, number], a: Arm) =>
  `M${s[0]} ${s[1]} Q${a.elbow[0]} ${a.elbow[1]} ${a.hand[0]} ${a.hand[1]}`;

const Face: React.FC<{expr: Expr}> = ({expr}) => {
  const eyeY = 94;
  const L = 76;
  const R = 124;
  const eye = (x: number, r: number, pr: number, dx = 0, dy = 0) => (
    <g>
      <circle cx={x} cy={eyeY} r={r} fill="#fff" stroke="#111" strokeWidth={3} />
      <circle cx={x + dx} cy={eyeY + dy} r={pr} fill="#111" />
    </g>
  );
  const brow = (x1: number, y1: number, x2: number, y2: number) => (
    <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#111" strokeWidth={6} strokeLinecap="round" />
  );
  switch (expr) {
    case 'confident':
      return (
        <g>
          <path d={`M${L - 12} ${eyeY} q12 -8 24 0`} stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M${R - 12} ${eyeY} q12 -8 24 0`} stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
          {brow(L - 14, 72, L + 12, 76)}
          {brow(R - 12, 70, R + 14, 64)}
          <path d="M80 124 q26 16 46 -6" stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'nervous':
      return (
        <g>
          {eye(L, 12, 4, 2, 2)}
          {eye(R, 12, 4, -2, 2)}
          {brow(L - 12, 74, L + 10, 68)}
          {brow(R - 10, 68, R + 12, 74)}
          <path d="M78 128 q6 -6 12 0 t12 0 t12 0 t12 0" stroke="#111" strokeWidth={4} fill="none" />
        </g>
      );
    case 'shock':
    case 'frozen':
      return (
        <g>
          {eye(L, 16, expr === 'frozen' ? 2.5 : 3.5)}
          {eye(R, 16, expr === 'frozen' ? 2.5 : 3.5)}
          {brow(L - 14, 66, L + 12, 64)}
          {brow(R - 12, 64, R + 14, 66)}
          {expr === 'frozen' ? (
            <path d="M84 130 L116 130" stroke="#111" strokeWidth={5} strokeLinecap="round" />
          ) : (
            <ellipse cx={100} cy={132} rx={11} ry={15} fill="#3a0d0d" stroke="#111" strokeWidth={3} />
          )}
        </g>
      );
    case 'scream':
      return (
        <g>
          {eye(L, 13, 4)}
          {eye(R, 13, 4)}
          {brow(L - 14, 70, L + 12, 66)}
          {brow(R - 12, 66, R + 14, 70)}
          <path d="M72 116 Q100 112 128 116 Q124 158 100 158 Q76 158 72 116 Z" fill="#3a0d0d" stroke="#111" strokeWidth={3} />
          <path d="M84 146 Q100 136 116 146" fill="#e0525a" />
        </g>
      );
    case 'angry':
      return (
        <g>
          {eye(L, 11, 5, 2)}
          {eye(R, 11, 5, -2)}
          {brow(L - 14, 70, L + 12, 82)}
          {brow(R - 12, 82, R + 14, 70)}
          <path d="M76 120 Q100 114 124 120 Q120 150 100 150 Q80 150 76 120 Z" fill="#3a0d0d" stroke="#111" strokeWidth={3} />
          <rect x={84} y={119} width={32} height={7} rx={3} fill="#fff" />
        </g>
      );
    case 'happy':
      return (
        <g>
          <path d={`M${L - 12} ${eyeY + 2} q12 -14 24 0`} stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d={`M${R - 12} ${eyeY + 2} q12 -14 24 0`} stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M74 118 Q100 150 126 118 Z" fill="#3a0d0d" stroke="#111" strokeWidth={3} />
        </g>
      );
    case 'groan':
      return (
        <g>
          <path d={`M${L - 12} ${eyeY} L${L + 12} ${eyeY}`} stroke="#111" strokeWidth={5} strokeLinecap="round" />
          <path d={`M${R - 12} ${eyeY} L${R + 12} ${eyeY}`} stroke="#111" strokeWidth={5} strokeLinecap="round" />
          {brow(L - 12, 76, L + 10, 70)}
          {brow(R - 10, 70, R + 12, 76)}
          <ellipse cx={100} cy={134} rx={16} ry={11} fill="#3a0d0d" stroke="#111" strokeWidth={3} />
        </g>
      );
    default:
      return (
        <g>
          {eye(L, 11, 5)}
          {eye(R, 11, 5)}
          {brow(L - 12, 74, L + 12, 72)}
          {brow(R - 12, 72, R + 12, 74)}
          <path d="M84 128 q16 8 32 0" stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
  }
};

const Drawing: React.FC<PersonProps> = (p) => {
  const {l, r} = arms(p.pose, p.slam, p.typePhase);
  const hairColor = p.hairColor ?? '#1b1b1b';
  const w = p.width ?? 200;
  return (
    <svg width={w} height={(w * 320) / 200} viewBox="-10 -40 220 360" style={{overflow: 'visible'}}>
      {/* Hair behind head */}
      {p.hair === 'afro' && <circle cx={100} cy={82} r={80} fill={hairColor} />}
      {p.hair === 'bun' && <circle cx={100} cy={22} r={26} fill={hairColor} />}

      {/* Torso */}
      <path d="M36 330 L36 214 Q36 170 100 168 Q164 170 164 214 L164 330 Z" fill={p.shirt} stroke="#111" strokeWidth={4} />
      {p.pattern &&
        p.pattern.dots.map((c, i) => (
          <circle key={i} cx={52 + ((i * 37) % 100)} cy={200 + ((i * 53) % 110)} r={10} fill={c} opacity={0.9} />
        ))}
      {p.badge && <circle cx={128} cy={214} r={11} fill={p.badge} stroke="#111" strokeWidth={3} />}

      {/* Neck + head */}
      <rect x={84} y={140} width={32} height={34} fill={p.skin} stroke="#111" strokeWidth={4} />
      <circle cx={100} cy={96} r={58} fill={p.skin} stroke="#111" strokeWidth={4} />
      <circle cx={42} cy={100} r={11} fill={p.skin} stroke="#111" strokeWidth={4} />
      <circle cx={158} cy={100} r={11} fill={p.skin} stroke="#111" strokeWidth={4} />

      {/* Hair on top */}
      {p.hair === 'short' && (
        <path d="M44 86 Q44 30 100 32 Q158 30 156 86 Q140 58 100 58 Q62 58 44 86 Z" fill={hairColor} stroke="#111" strokeWidth={3} />
      )}
      {p.hair === 'bun' && (
        <path d="M42 92 Q40 34 100 34 Q160 34 158 92 Q150 56 100 54 Q52 56 42 92 Z" fill={hairColor} stroke="#111" strokeWidth={3} />
      )}
      {p.hair === 'bald' && (
        <>
          <path d="M44 100 Q42 70 56 62" stroke={hairColor} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M156 100 Q158 70 144 62" stroke={hairColor} strokeWidth={12} fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Gele (head wrap) */}
      {p.headwrap && (
        <g>
          <path d="M30 78 Q20 -10 100 -30 Q180 -10 170 78 Q150 40 100 40 Q50 40 30 78 Z" fill={p.headwrap.base} stroke="#111" strokeWidth={4} />
          <path d="M40 60 Q100 -40 160 60" stroke={p.headwrap.accent} strokeWidth={10} fill="none" />
          <path d="M60 40 Q100 -20 140 40" stroke={p.headwrap.accent} strokeWidth={8} fill="none" />
          <path d="M150 20 Q205 -30 200 30 Q185 20 160 44 Z" fill={p.headwrap.base} stroke="#111" strokeWidth={4} />
          <path d="M50 20 Q-5 -30 0 30 Q15 20 40 44 Z" fill={p.headwrap.base} stroke="#111" strokeWidth={4} />
        </g>
      )}

      {p.silhouette ? <Glints expr={p.expr} /> : <Face expr={p.expr} />}

      {p.mustache && (
        <path d="M70 118 Q86 104 100 116 Q114 104 130 118 Q116 126 100 120 Q84 126 70 118 Z" fill={hairColor} stroke="#111" strokeWidth={2} />
      )}
      {p.glasses && p.silhouette && (
        <g>
          <circle cx={76} cy={94} r={20} fill="rgba(160,255,210,0.18)" stroke="#1b2230" strokeWidth={4} />
          <circle cx={124} cy={94} r={20} fill="rgba(160,255,210,0.18)" stroke="#1b2230" strokeWidth={4} />
          <path d="M64 86 L76 80 M112 86 L124 80" stroke="rgba(255,255,255,0.8)" strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
      {p.glasses && !p.silhouette && (
        <g stroke="#111" strokeWidth={4} fill="rgba(180,220,255,0.25)">
          <circle cx={76} cy={94} r={20} />
          <circle cx={124} cy={94} r={20} />
          <path d="M96 92 L104 92" />
        </g>
      )}
      {p.headset && (
        <g>
          <path d="M40 92 Q40 26 100 26 Q160 26 160 92" stroke="#2b2b2b" strokeWidth={9} fill="none" />
          <rect x={30} y={82} width={20} height={34} rx={8} fill="#2b2b2b" />
          <path d="M40 114 Q46 140 76 138" stroke="#2b2b2b" strokeWidth={5} fill="none" />
          <circle cx={78} cy={138} r={6} fill={p.silhouette ? '#39ff9c' : '#2b2b2b'} />
        </g>
      )}
      {p.sweat ? (
        <g opacity={p.sweat}>
          <path d="M160 58 q10 16 0 22 q-10 -6 0 -22 Z" fill="#7fd3ff" stroke="#111" strokeWidth={2} />
          <path d="M38 60 q8 13 0 18 q-8 -5 0 -18 Z" fill="#7fd3ff" stroke="#111" strokeWidth={2} />
        </g>
      ) : null}

      {/* Arms */}
      <path d={armPath(SHOULDER_L, l)} stroke={p.shirt} strokeWidth={28} fill="none" strokeLinecap="round" />
      <path d={armPath(SHOULDER_R, r)} stroke={p.shirt} strokeWidth={28} fill="none" strokeLinecap="round" />
      <circle cx={l.hand[0]} cy={l.hand[1]} r={16} fill={p.skin} stroke="#111" strokeWidth={4} />
      <circle cx={r.hand[0]} cy={r.hand[1]} r={p.pose === 'facepalm' ? 30 : 16} fill={p.skin} stroke="#111" strokeWidth={4} />
    </svg>
  );
};

// Cast. Nobody is drawn to resemble Steve.
export const cast = {
  commander: {skin: '#E8B48A', shirt: '#233A6B', hair: 'bald', hairColor: '#C9CED6', mustache: true, headset: true, badge: '#FFC22E'},
  tech: {skin: '#8D5A3B', shirt: '#159A8C', hair: 'short', hairColor: '#1b1b1b', glasses: true, headset: true},
  crewA: {skin: '#F1C7A5', shirt: '#6B3FA0', hair: 'bun', hairColor: '#7A3B12', headset: true},
  crewB: {skin: '#5C3A24', shirt: '#B8452F', hair: 'afro', hairColor: '#141414', headset: true},
  auntie: {
    skin: '#6B4226',
    shirt: '#F2811D',
    headwrap: {base: '#F2811D', accent: '#1FA64A'},
    pattern: {dots: ['#1FA64A', '#FFD23F', '#1FA64A', '#7B2CBF', '#FFD23F', '#1FA64A']},
  },
} satisfies Record<string, Omit<PersonProps, 'expr' | 'pose'>>;

/** In silhouette mode faces are dark; only wide eyes catch the light. */
const Glints: React.FC<{expr: Expr}> = ({expr}) => {
  if (!['shock', 'frozen', 'scream', 'angry'].includes(expr)) return null;
  const r = expr === 'angry' ? 4 : 6;
  return (
    <g fill="rgba(255,255,255,0.9)">
      <ellipse cx={76} cy={94} rx={r} ry={expr === 'angry' ? 3 : r} />
      <ellipse cx={124} cy={94} rx={r} ry={expr === 'angry' ? 3 : r} />
    </g>
  );
};

const SIL = {body: '#0a0d15', head: '#0c1019', hair: '#06070b'};

/**
 * A cast member. With `rim` set they are drawn as a dark silhouette, rim-lit by the room
 * (screen glow / alarm light) — the cinematic look. Without it, the flat cartoon drawing.
 */
export const Person: React.FC<PersonProps & {rim?: string}> = ({rim, ...p}) => {
  if (!rim) return <Drawing {...p} />;
  const dark: PersonProps = {
    ...p,
    skin: SIL.head,
    shirt: SIL.body,
    hairColor: SIL.hair,
    badge: p.badge ? '#5a4614' : undefined,
    pattern: p.pattern ? {dots: p.pattern.dots.map(() => '#24140a')} : undefined,
    headwrap: p.headwrap ? {base: '#1a0d05', accent: '#10200f'} : undefined,
    silhouette: true,
  };
  return (
    <div style={{filter: `drop-shadow(0 0 1.5px ${rim}) drop-shadow(0 0 16px ${rim}77)`}}>
      <Drawing {...dark} />
    </div>
  );
};
