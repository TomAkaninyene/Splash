import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cast, Expr, Person, Pose} from '../components/Person';

export const FIRE_X = 540;
export const FIRE_Y = 1330;

const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/** Firelight flicker, 0.75–1.05, shared by the fire glow and the rim light on everyone. */
export const flicker = (f: number) => 0.9 + 0.08 * Math.sin(f * 0.9) + 0.05 * Math.sin(f * 2.3 + 1) + 0.03 * Math.sin(f * 5.1);

export const NightSky: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #070a1f 0%, #141233 45%, #3a1d24 75%, #5a2a16 100%)'}}>
      {Array.from({length: 70}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: hash(i) * 1080,
            top: hash(i + 99) * 900,
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            borderRadius: '50%',
            background: '#fff',
            opacity: 0.4 + 0.5 * Math.abs(Math.sin(f / 20 + i)),
          }}
        />
      ))}
      <div style={{position: 'absolute', left: 760, top: 150, width: 170, height: 170, borderRadius: '50%', background: '#fff6dc', boxShadow: '0 0 80px 30px rgba(255,240,200,0.35)'}} />
    </AbsoluteFill>
  );
};

/** Round huts with conical thatch roofs and a mango tree, as dark silhouettes on the horizon. */
export const Compound: React.FC = () => (
  <svg style={{position: 'absolute', left: 0, top: 640}} width={1080} height={700} viewBox="0 0 1080 700">
    {/* Mango tree */}
    <rect x={70} y={240} width={40} height={300} fill="#0b0605" />
    {[
      [90, 200, 150],
      [30, 260, 100],
      [170, 250, 110],
      [100, 130, 110],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#0b0605" />
    ))}
    {/* Huts */}
    {[
      [330, 1],
      [640, 1.25],
      [930, 0.95],
    ].map(([x, s], i) => (
      <g key={i} transform={`translate(${x} ${420 - s * 60}) scale(${s})`}>
        <rect x={-110} y={60} width={220} height={180} fill="#100907" />
        <path d="M-150 70 L0 -90 L150 70 Z" fill="#0b0605" />
        <rect x={-30} y={140} width={60} height={100} fill="#2a1409" />
      </g>
    ))}
    <rect x={0} y={560} width={1080} height={140} fill="#0b0605" />
  </svg>
);

export const Fire: React.FC<{flare?: number}> = ({flare = 0}) => {
  const f = useCurrentFrame();
  const k = flicker(f) * (1 + flare * 0.8);
  const flame = (i: number, color: string, w: number, h: number) => {
    const sway = Math.sin(f * 0.35 + i * 1.7) * 14;
    const hh = h * k * (0.9 + 0.12 * Math.sin(f * 0.8 + i));
    return (
      <path
        key={`${color}${i}`}
        d={`M${-w / 2} 0 Q${-w / 2} ${-hh * 0.5} ${sway} ${-hh} Q${w / 2} ${-hh * 0.5} ${w / 2} 0 Z`}
        fill={color}
        transform={`translate(${(i - 1) * w * 0.35} 0)`}
      />
    );
  };
  return (
    <>
      {/* Warm pool of light on the ground and in the air */}
      <div
        style={{
          position: 'absolute',
          left: FIRE_X - 900,
          top: FIRE_Y - 900,
          width: 1800,
          height: 1800,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,150,60,${0.42 * k}) 0%, rgba(255,110,40,${0.16 * k}) 30%, transparent 60%)`,
          mixBlendMode: 'screen',
        }}
      />
      <svg style={{position: 'absolute', left: FIRE_X - 200, top: FIRE_Y - 420, overflow: 'visible'}} width={400} height={440}>
        <g transform="translate(200 420)">
          {[0, 1, 2].map((i) => flame(i, '#c2361a', 130, 260 + flare * 200))}
          {[0, 1, 2].map((i) => flame(i, '#ff8a1f', 95, 200 + flare * 160))}
          {[0, 1, 2].map((i) => flame(i, '#ffd35a', 55, 130 + flare * 110))}
          {/* Logs */}
          <rect x={-120} y={-18} width={240} height={30} rx={14} fill="#2a150b" transform="rotate(-12)" />
          <rect x={-120} y={-18} width={240} height={30} rx={14} fill="#1f1008" transform="rotate(14)" />
        </g>
      </svg>
      {/* Embers */}
      {Array.from({length: 22}).map((_, i) => {
        const life = ((f * (1.2 + hash(i) * 1.5) + hash(i + 7) * 300) % 300) / 300;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: FIRE_X + (hash(i + 3) - 0.5) * 160 + Math.sin(f / 10 + i) * 30 * life,
              top: FIRE_Y - 200 - life * (700 + flare * 500),
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#ffb347',
              boxShadow: '0 0 10px #ff8a1f',
              opacity: 1 - life,
            }}
          />
        );
      })}
    </>
  );
};

export type Who = {expr: Expr; pose: Pose};

const RIM = '#ff9a3c';

const Seated: React.FC<{who: keyof typeof cast; a: Who; x: number; y: number; w: number; tilt?: number}> = ({who, a, x, y, w, tilt = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${tilt}deg)`, transformOrigin: '50% 100%'}}>
    <Person {...cast[who]} expr={a.expr} pose={a.pose} rim={RIM} width={w} />
    {/* Crossed legs */}
    <div style={{position: 'absolute', left: w * 0.02, top: w * 1.5, width: w * 0.96, height: w * 0.32, borderRadius: '50%', background: '#0a0d15', filter: `drop-shadow(0 0 1.5px ${RIM})`}} />
  </div>
);

export const VillageScene: React.FC<{
  elder: Who;
  kids: [Who, Who, Who, Who];
  /** Which kid (0–3) is dozing, and how far over they lean (0–1). */
  doze?: {kid: number; amount: number};
  flare?: number;
}> = ({elder, kids, doze, flare = 0}) => {
  const f = useCurrentFrame();
  const bob = (i: number) => Math.sin(f / 12 + i) * 2;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <NightSky />
      <Compound />
      <div style={{position: 'absolute', left: 0, top: 1240, width: 1080, height: 700, background: 'linear-gradient(180deg, #1a0d07 0%, #0c0604 100%)'}} />
      {/* Elder on a stool, stick in hand */}
      <div style={{position: 'absolute', left: 40, top: 900}}>
        <div style={{position: 'absolute', left: 250, top: -40, width: 14, height: 560, background: '#0a0d15', borderRadius: 7, transform: 'rotate(-6deg)', filter: `drop-shadow(0 0 1.5px ${RIM})`}} />
        <Person {...cast.elder} expr={elder.expr} pose={elder.pose} rim={RIM} width={290} />
        <div style={{position: 'absolute', left: 30, top: 440, width: 230, height: 120, borderRadius: 20, background: '#0a0d15', filter: `drop-shadow(0 0 1.5px ${RIM})`}} />
      </div>
      <Fire flare={flare} />
      {/* Children in an arc on the right */}
      <Seated who="kidA" a={kids[0]} x={640} y={1040 + bob(0)} w={150} tilt={doze?.kid === 0 ? -28 * doze.amount : 0} />
      <Seated who="kidB" a={kids[1]} x={800} y={1080 + bob(1)} w={160} tilt={doze?.kid === 1 ? -28 * doze.amount : 0} />
      <Seated who="kidC" a={kids[2]} x={900} y={1180 + bob(2)} w={150} tilt={doze?.kid === 2 ? 28 * doze.amount : 0} />
      <Seated who="kidD" a={kids[3]} x={690} y={1240 + bob(3)} w={165} tilt={doze?.kid === 3 ? 30 * doze.amount : 0} />
    </AbsoluteFill>
  );
};
