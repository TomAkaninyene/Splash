import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {GamdomMark} from '../components/Brand';
import {cast, Expr, Person, Pose} from '../components/Person';
import {body, colors, impact} from '../theme';

export const INK = '#140806';
const LIT = '#ffcf8a';
export const serif = "'Cinzel', serif";

/** Warm shadow-theatre backdrop: glowing paper lit from behind, burnt edges, ink-black ground. */
export const Backdrop: React.FC<{children?: React.ReactNode; glow?: string}> = ({children, glow = '#ffd98f'}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, ${glow} 0%, #f0a24a 32%, #c55a1e 62%, #5a1a08 100%)`, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(40,10,0,0.55) 100%)'}} />
    {children}
  </AbsoluteFill>
);

export const Ground: React.FC<{y?: number}> = ({y = 1500}) => (
  <svg style={{position: 'absolute', left: 0, top: y - 60}} width={1080} height={520} viewBox="0 0 1080 520">
    <path d={`M0 60 ${Array.from({length: 28}, (_, i) => `L${i * 40 + 20} ${i % 2 ? 40 : 62}`).join(' ')} L1080 60 L1080 520 L0 520 Z`} fill={INK} />
  </svg>
);

/** A villager cut-out (flat, no rim) that can faint backwards. */
export const Villager: React.FC<{x: number; y: number; w: number; expr?: Expr; pose?: Pose; faint?: number; wrap?: boolean; bob?: number}> = ({
  x,
  y,
  w,
  expr = 'neutral',
  pose = 'down',
  faint = 0,
  wrap,
  bob = 0,
}) => (
  <div style={{position: 'absolute', left: x, top: y + bob, transform: `rotate(${-88 * faint}deg)`, transformOrigin: '30% 100%'}}>
    <Person {...(wrap ? cast.villagerB : cast.villager)} expr={expr} pose={pose} rim={LIT} width={w} />
  </div>
);

const RANK_Y = {1: 960, 2: 1140, 3: 1260} as const;

/**
 * The giant leaderboard: three carved pedestals. `castle` is 0 at #2 and 1 at #1.
 */
export const Leaderboard: React.FC<{castle: number; rain?: number; rays?: number}> = ({castle, rain = 0, rays = 0}) => {
  const f = useCurrentFrame();
  const cx = 250 + (540 - 250) * castle;
  const cy = RANK_Y[2] + (RANK_Y[1] - RANK_Y[2]) * castle - 250 - Math.sin(Math.PI * castle) * 160;
  return (
    <>
      {rays > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 900,
            top: 800 - 900,
            width: 1800,
            height: 1800,
            background: `repeating-conic-gradient(from ${f * 0.6}deg, rgba(255,255,220,${0.35 * rays}) 0deg 8deg, transparent 8deg 22deg)`,
            maskImage: 'radial-gradient(circle, black 10%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(circle, black 10%, transparent 60%)',
          }}
        />
      )}
      {(
        [
          [2, 110, 280],
          [1, 395, 290],
          [3, 700, 270],
        ] as const
      ).map(([rank, x, w]) => (
        <div
          key={rank}
          style={{
            position: 'absolute',
            left: x,
            top: RANK_Y[rank],
            width: w,
            height: 1600 - RANK_Y[rank],
            background: INK,
            clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 30,
            boxSizing: 'border-box',
          }}
        >
          <div style={{fontFamily: serif, fontWeight: 900, fontSize: 110, color: rank === 1 ? colors.amber : '#8a4a1c', textShadow: rank === 1 ? `0 0 30px ${colors.amber}` : 'none'}}>
            #{rank}
          </div>
        </div>
      ))}
      {/* Mist and a question mark over the empty #1 */}
      {castle < 0.5 && (
        <div style={{position: 'absolute', left: 395, top: 700, width: 290, textAlign: 'center', fontFamily: serif, fontSize: 180, color: 'rgba(40,15,5,0.45)', opacity: 1 - castle * 2}}>?</div>
      )}
      {/* The Gamdom castle */}
      <div style={{position: 'absolute', left: cx - 100, top: cy, filter: `drop-shadow(0 0 ${20 + 30 * castle}px ${colors.brand}aa)`, transform: `rotate(${Math.sin(f / 9) * 2 * (1 - castle)}deg)`}}>
        <GamdomMark size={240} />
      </div>
      {/* A small sad rain cloud */}
      {rain > 0 && (
        <div style={{position: 'absolute', left: cx - 120, top: cy - 170, opacity: rain}}>
          <svg width={240} height={200} viewBox="0 0 240 200">
            <path d="M40 90 Q20 40 70 40 Q90 0 140 20 Q200 10 200 60 Q235 70 215 100 Z" fill="#3b2a24" />
            {Array.from({length: 7}).map((_, i) => {
              const y = 100 + ((f * 6 + i * 23) % 90);
              return <path key={i} d={`M${60 + i * 22} ${y} l-4 14`} stroke="#6fa6d6" strokeWidth={4} strokeLinecap="round" />;
            })}
          </svg>
        </div>
      )}
    </>
  );
};

/** The oracle: a laptop on a tree stump. */
export const Oracle: React.FC<{x: number; y: number; screen: React.ReactNode; glow?: number}> = ({x, y, screen, glow = 1}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    {/* Stump */}
    <svg style={{position: 'absolute', left: -40, top: 250}} width={500} height={330} viewBox="0 0 500 330">
      <path d="M60 40 Q250 10 440 40 L460 300 Q480 330 520 330 L-20 330 Q20 330 40 300 Z" fill={INK} />
      <ellipse cx={250} cy={40} rx={190} ry={30} fill="#2a1409" />
      <path d="M100 40 Q250 20 400 40" stroke="#3d1d0c" strokeWidth={4} fill="none" />
    </svg>
    {/* Laptop */}
    <div
      style={{
        position: 'absolute',
        left: 30,
        top: 0,
        width: 360,
        height: 230,
        background: '#0b0f14',
        border: `8px solid ${INK}`,
        borderRadius: 12,
        boxShadow: `0 0 ${80 * glow}px ${20 * glow}px ${colors.brand}55`,
        overflow: 'hidden',
      }}
    >
      {screen}
    </div>
    <div style={{position: 'absolute', left: 0, top: 236, width: 420, height: 22, background: INK, borderRadius: '4px 4px 14px 14px'}} />
  </div>
);

export const UpdateScreen: React.FC<{progress: number; done: boolean}> = ({progress, done}) => (
  <div style={{position: 'absolute', inset: 0, padding: 22, fontFamily: body, color: '#dfffee', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12}}>
    {done ? (
      <div style={{fontFamily: impact, fontSize: 48, color: colors.brand, textAlign: 'center', textShadow: `0 0 20px ${colors.brand}`}}>UPDATE COMPLETE</div>
    ) : (
      <>
        <div style={{fontWeight: 900, fontSize: 30, letterSpacing: 1}}>SYSTEM UPDATE REQUIRED</div>
        <div style={{fontSize: 20, opacity: 0.8}}>Installing update {Math.min(147, 1 + Math.floor(progress * 146))} of 147…</div>
        <div style={{height: 16, background: '#1c2a24', borderRadius: 8, overflow: 'hidden'}}>
          <div style={{width: `${progress * 100}%`, height: '100%', background: colors.brand}} />
        </div>
      </>
    )}
  </div>
);

export const Lightning: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  if (t < 0 || t > 10) return null;
  const pts = [
    [0, 0],
    [40, 180],
    [-10, 200],
    [60, 420],
    [10, 440],
    [80, y],
  ];
  return (
    <>
      <AbsoluteFill style={{background: '#fffbe8', opacity: t < 3 ? 0.85 : Math.max(0, 0.6 - t * 0.07)}} />
      <svg style={{position: 'absolute', left: x - 80, top: 0, overflow: 'visible'}} width={200} height={y}>
        <polyline points={pts.map(([a, b]) => `${a + 80},${b}`).join(' ')} fill="none" stroke="#fff" strokeWidth={10} style={{filter: 'drop-shadow(0 0 20px #fff) drop-shadow(0 0 40px #c9ffe6)'}} opacity={t < 6 ? 1 : 0} />
      </svg>
    </>
  );
};
