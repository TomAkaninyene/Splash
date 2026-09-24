import {colors, impact} from '../theme';

export const Rocket: React.FC<{size: number; flame: number}> = ({size, flame}) => (
  <svg width={size} height={size * 0.5} viewBox="-60 0 260 100" style={{overflow: 'visible'}}>
    {/* Flame */}
    <path d={`M20 34 Q${-30 - flame * 30} 50 20 66 Z`} fill={colors.amber} />
    <path d={`M20 40 Q${-8 - flame * 18} 50 20 60 Z`} fill="#fff4c2" />
    {/* Fins */}
    <path d="M40 22 L20 0 L64 22 Z" fill={colors.red} stroke="#111" strokeWidth={4} />
    <path d="M40 78 L20 100 L64 78 Z" fill={colors.red} stroke="#111" strokeWidth={4} />
    {/* Body */}
    <path d="M20 26 L150 26 Q196 50 150 74 L20 74 Z" fill="#f4f6fb" stroke="#111" strokeWidth={5} />
    <path d="M150 26 Q196 50 150 74 Z" fill={colors.red} stroke="#111" strokeWidth={4} />
    <circle cx={128} cy={50} r={13} fill="#6fc3ff" stroke="#111" strokeWidth={4} />
    <text x={40} y={60} fontFamily={impact} fontSize={26} fill={colors.brandDark} letterSpacing={2}>
      STEVE
    </text>
  </svg>
);

export const Plane: React.FC<{width: number; pilotShock: boolean; hasCup: boolean}> = ({width, pilotShock, hasCup}) => (
  <svg width={width} height={width * 0.42} viewBox="0 0 400 170">
    <path d="M40 80 Q20 60 60 56 L330 56 Q380 60 390 80 Q380 104 330 106 L60 106 Q20 100 40 80 Z" fill="#f2f4f8" stroke="#111" strokeWidth={5} />
    <path d="M300 56 L360 6 L382 6 L352 56 Z" fill="#4f7dd6" stroke="#111" strokeWidth={5} />
    <path d="M170 86 L250 160 L286 160 L240 86 Z" fill="#c9d3e6" stroke="#111" strokeWidth={5} />
    {[110, 150, 190, 230, 270].map((x) => (
      <circle key={x} cx={x} cy={74} r={8} fill="#6fc3ff" stroke="#111" strokeWidth={3} />
    ))}
    {/* Cockpit with pilot */}
    <path d="M40 80 Q46 60 78 58 L78 80 Z" fill="#6fc3ff" stroke="#111" strokeWidth={4} />
    <circle cx={64} cy={70} r={11} fill="#E8B48A" stroke="#111" strokeWidth={3} />
    <circle cx={60} cy={68} r={pilotShock ? 3.5 : 2} fill="#111" />
    <circle cx={68} cy={68} r={pilotShock ? 3.5 : 2} fill="#111" />
    {pilotShock ? <ellipse cx={64} cy={76} rx={3} ry={4} fill="#111" /> : <path d="M60 75 q4 3 8 0" stroke="#111" strokeWidth={2} fill="none" />}
    {hasCup && <rect x={74} y={66} width={8} height={10} fill="#fff" stroke="#111" strokeWidth={2} />}
  </svg>
);

export const Cup: React.FC<{size: number; spin: number}> = ({size, spin}) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{transform: `rotate(${spin}deg)`}}>
    <path d="M14 14 L46 14 L42 54 L18 54 Z" fill="#fff" stroke="#111" strokeWidth={4} />
    <rect x={12} y={8} width={36} height={8} rx={3} fill="#5b3a1f" stroke="#111" strokeWidth={3} />
    <rect x={16} y={28} width={28} height={10} fill="#5b3a1f" />
  </svg>
);

export const Alien: React.FC<{width: number; sign?: boolean; drip?: number; mouth?: 'o' | 'flat'; wave?: number}> = ({
  width,
  sign = true,
  drip = 0,
  mouth = 'flat',
  wave = 0,
}) => (
  <svg width={width} height={width * 1.3} viewBox="0 0 300 390" style={{overflow: 'visible'}}>
    {/* Antennae */}
    <path d="M120 60 Q100 10 80 0" stroke="#111" strokeWidth={5} fill="none" />
    <path d="M180 60 Q200 10 220 0" stroke="#111" strokeWidth={5} fill="none" />
    <circle cx={80} cy={0} r={12} fill="#ff5fd2" stroke="#111" strokeWidth={4} />
    <circle cx={220} cy={0} r={12} fill="#ff5fd2" stroke="#111" strokeWidth={4} />
    {/* Body + head */}
    <path d="M100 250 Q100 200 150 200 Q200 200 200 250 L210 390 L90 390 Z" fill="#9b6bff" stroke="#111" strokeWidth={5} />
    <ellipse cx={150} cy={130} rx={95} ry={80} fill="#9b6bff" stroke="#111" strokeWidth={5} />
    <ellipse cx={112} cy={124} rx={28} ry={34} fill="#111" />
    <ellipse cx={188} cy={124} rx={28} ry={34} fill="#111" />
    <circle cx={120} cy={112} r={9} fill="#fff" />
    <circle cx={196} cy={112} r={9} fill="#fff" />
    {mouth === 'o' ? (
      <ellipse cx={150} cy={178} rx={10} ry={13} fill="#3a0d3a" stroke="#111" strokeWidth={3} />
    ) : (
      <path d="M130 178 q20 -8 40 0" stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
    )}
    {/* Coffee on head */}
    {drip > 0 && (
      <g opacity={Math.min(1, drip)}>
        <path d="M70 90 Q90 40 150 44 Q210 40 230 90 Q214 80 200 100 Q190 80 176 110 Q164 84 150 104 Q136 84 124 112 Q110 84 100 104 Q86 80 70 90 Z" fill="#5b3a1f" stroke="#111" strokeWidth={3} />
        <ellipse cx={100} cy={104 + drip * 40} rx={6} ry={9} fill="#5b3a1f" />
        <ellipse cx={176} cy={110 + drip * 60} rx={6} ry={9} fill="#5b3a1f" />
        <ellipse cx={138} cy={112 + drip * 30} rx={5} ry={8} fill="#5b3a1f" />
      </g>
    )}
    {/* Sign */}
    {sign && (
      <g transform={`rotate(${Math.sin(wave) * 6} 150 260)`}>
        <rect x={146} y={250} width={10} height={140} fill="#8a6a45" stroke="#111" strokeWidth={3} />
        <rect x={20} y={190} width={260} height={100} rx={10} fill="#fff" stroke="#111" strokeWidth={6} />
        <text x={150} y={262} textAnchor="middle" fontFamily={impact} fontSize={62} fill={colors.red}>
          CASH OUT
        </text>
      </g>
    )}
    {/* Hands */}
    <circle cx={sign ? 130 : 96} cy={sign ? 300 : 290} r={16} fill="#9b6bff" stroke="#111" strokeWidth={4} />
    <circle cx={sign ? 172 : 204} cy={sign ? 300 : 290} r={16} fill="#9b6bff" stroke="#111" strokeWidth={4} />
  </svg>
);

/** Crash-style multiplier curve that auto-scales so the tip stays in view. */
export const CrashGraph: React.FC<{
  w: number;
  h: number;
  m: number;
  crashed?: boolean;
  cashedAt?: number;
  rocket?: boolean;
  frame: number;
  showAxes?: boolean;
  rocketSize?: number;
}> = ({w, h, m, crashed, cashedAt, rocket = true, frame, showAxes = true, rocketSize = 220}) => {
  const pad = 60;
  const yMax = Math.max(2, m * 1.25);
  const n = 60;
  const tip = Math.log(Math.max(m, 1.0001));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * tip;
    const mm = Math.exp(s);
    const x = pad + (i / n) * (w * 0.72 - pad);
    const y = h - pad - ((mm - 1) / (yMax - 1)) * (h - pad * 2);
    pts.push([x, y]);
  }
  const [tx, ty] = pts[pts.length - 1];
  const [px, py] = pts[pts.length - 3];
  const angle = (Math.atan2(ty - py, tx - px) * 180) / Math.PI;
  const lineColor = crashed ? colors.red : colors.brand;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const gridLines = [1, 2, 5, 10, 20].filter((g) => g < yMax);
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        {showAxes &&
          gridLines.map((g) => {
            const y = h - pad - ((g - 1) / (yMax - 1)) * (h - pad * 2);
            return (
              <g key={g}>
                <line x1={pad} x2={w - 20} y1={y} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeDasharray="8 10" />
                <text x={pad - 10} y={y + 8} textAnchor="end" fill="rgba(255,255,255,0.45)" fontFamily={impact} fontSize={24}>
                  {g}x
                </text>
              </g>
            );
          })}
        <path d={`${d} L${tx} ${h - pad} L${pad} ${h - pad} Z`} fill={`${lineColor}22`} />
        <path d={d} stroke={lineColor} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {rocket && !crashed && (
        <div style={{position: 'absolute', left: tx - rocketSize / 2, top: ty - rocketSize / 4, transform: `rotate(${angle}deg)`, transformOrigin: `${rocketSize / 2}px ${rocketSize / 4}px`}}>
          <Rocket size={rocketSize} flame={0.5 + 0.5 * Math.sin(frame * 1.7)} />
        </div>
      )}
      {cashedAt !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: tx - 190,
            top: ty - 150,
            padding: '8px 18px',
            background: colors.brand,
            color: colors.night,
            fontFamily: impact,
            fontSize: 38,
            borderRadius: 12,
            border: '4px solid #111',
          }}
        >
          CASHED OUT {cashedAt.toFixed(2)}x
        </div>
      )}
    </div>
  );
};
