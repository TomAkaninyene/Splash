import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, impact} from '../theme';
import {cast, Expr, Person, Pose} from './Person';

export type Actor = {expr: Expr; pose: Pose; slam?: number; sweat?: number; dy?: number; dx?: number; typing?: boolean};

export type RoomProps = {
  screen: React.ReactNode;
  commander: Actor;
  tech: Actor;
  crewA: Actor;
  crewB: Actor;
  auntie?: Actor & {x: number};
  alarm?: boolean;
  /** Chair vertical offset (negative = flying up). */
  chairY?: number;
  chairSpin?: number;
  /** 0..1 how open the hole in the ceiling is. */
  hole?: number;
  button?: {pressed: number; glow: number};
  /** Overlay above the technician's head, e.g. the "not responding" dialog. */
  techOverlay?: React.ReactNode;
};

const SCREEN = {x: 60, y: 170, w: 960, h: 560};
export const SCREEN_BOX = SCREEN;

const Beacon: React.FC<{x: number; on: boolean; phase: number}> = ({x, on, phase}) => {
  const frame = useCurrentFrame();
  const blink = on && Math.floor((frame + phase) / 8) % 2 === 0;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - 34,
          top: 104,
          width: 68,
          height: 42,
          borderRadius: '34px 34px 6px 6px',
          background: blink ? colors.red : '#5a1016',
          border: '4px solid #111',
          boxShadow: blink ? `0 0 60px 20px ${colors.red}aa` : 'none',
        }}
      />
      {blink && (
        <div
          style={{
            position: 'absolute',
            left: x - 260,
            top: 140,
            width: 520,
            height: 900,
            background: `radial-gradient(ellipse at 50% 0%, ${colors.red}40 0%, transparent 60%)`,
          }}
        />
      )}
    </>
  );
};

export const Chair: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <svg width={260} height={420} viewBox="0 0 260 420" style={style}>
    <rect x={40} y={0} width={180} height={260} rx={40} fill="#2A2F3E" stroke="#111" strokeWidth={6} />
    <rect x={66} y={26} width={128} height={190} rx={28} fill="#3A4256" />
    <rect x={20} y={250} width={220} height={50} rx={20} fill="#2A2F3E" stroke="#111" strokeWidth={6} />
    <rect x={120} y={300} width={20} height={70} fill="#111" />
    <path d="M40 400 L130 370 L220 400" stroke="#111" strokeWidth={14} fill="none" strokeLinecap="round" />
    <circle cx={40} cy={404} r={12} fill="#111" />
    <circle cx={220} cy={404} r={12} fill="#111" />
  </svg>
);

export const ControlRoom: React.FC<RoomProps> = (p) => {
  const frame = useCurrentFrame();
  const typePhase = frame * 1.3;
  const person = (who: keyof typeof cast, a: Actor, x: number, y: number, width: number) => (
    <div style={{position: 'absolute', left: x + (a.dx ?? 0), top: y + (a.dy ?? 0)}}>
      <Person
        {...cast[who]}
        expr={a.expr}
        pose={a.pose}
        slam={a.slam}
        sweat={a.sweat}
        typePhase={a.typing ? typePhase * (who === 'crewA' ? 3 : 1) : 0}
        width={width}
      />
    </div>
  );

  return (
    <AbsoluteFill style={{background: colors.wall, overflow: 'hidden'}}>
      {/* Back wall panels */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{position: 'absolute', left: i * 270, top: 130, width: 266, height: 1100, background: i % 2 ? '#1a2439' : '#18223a', borderRight: '4px solid #0d1322'}}
        />
      ))}

      {/* Ceiling + hole */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 140, background: '#0c111d', borderBottom: '8px solid #2b3550'}} />
      {(p.hole ?? 0) > 0 && (
        <svg style={{position: 'absolute', left: 340, top: -20}} width={400} height={200} viewBox="0 0 400 200">
          <path
            d={`M${200 - 150 * p.hole!} 160 L${200 - 90 * p.hole!} 20 L${200 - 20 * p.hole!} 70 L${200 + 60 * p.hole!} 10 L${200 + 150 * p.hole!} 150 L${200 + 40 * p.hole!} 120 Z`}
            fill="#6fb7ff"
            stroke="#111"
            strokeWidth={6}
          />
          <circle cx={200 + 30 * p.hole!} cy={60} r={6 * p.hole!} fill="#fff" />
        </svg>
      )}
      <Beacon x={150} on={!!p.alarm} phase={0} />
      <Beacon x={930} on={!!p.alarm} phase={8} />

      {/* Main screen */}
      <div
        style={{
          position: 'absolute',
          left: SCREEN.x,
          top: SCREEN.y,
          width: SCREEN.w,
          height: SCREEN.h,
          background: colors.screen,
          border: '14px solid #2b3550',
          borderRadius: 26,
          boxShadow: `inset 0 0 80px ${colors.brand}22, 0 0 0 4px #0d1322`,
          overflow: 'hidden',
        }}
      >
        {p.screen}
        {/* Scanlines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 6px)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Chair behind the technician */}
      <div
        style={{
          position: 'absolute',
          left: 410,
          top: 880 + (p.chairY ?? 0),
          transform: `rotate(${p.chairSpin ?? 0}deg)`,
          zIndex: (p.chairY ?? 0) < -40 ? 5 : 0,
        }}
      >
        <Chair />
      </div>

      {/* Crew */}
      {person('commander', p.commander, 10, 820, 270)}
      {person('crewA', p.crewA, 740, 930, 190)}
      {person('crewB', p.crewB, 890, 900, 200)}
      {person('tech', p.tech, 405, 910, 270)}
      {p.techOverlay && <div style={{position: 'absolute', left: 300, top: 760}}>{p.techOverlay}</div>}

      {/* Desk */}
      <div
        style={{
          position: 'absolute',
          left: -20,
          top: 1290,
          width: 1120,
          height: 240,
          background: 'linear-gradient(180deg, #3a4560 0%, #252d42 30%, #1a2030 100%)',
          borderTop: '10px solid #4b577a',
        }}
      >
        {Array.from({length: 22}).map((_, i) => {
          const on = Math.floor((frame + i * 7) / 6) % 3 !== 0;
          const c = [colors.brand, colors.amber, colors.red, '#4fb2ff'][i % 4];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 40 + i * 48,
                top: 150 + (i % 2) * 34,
                width: 22,
                height: 14,
                borderRadius: 4,
                background: on ? c : '#0e131f',
                boxShadow: on ? `0 0 12px ${c}` : 'none',
              }}
            />
          );
        })}
        {/* Keypad */}
        <div style={{position: 'absolute', left: 430, top: 30, width: 220, height: 100, borderRadius: 14, background: '#10151f', border: '4px solid #4b577a', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, padding: 10, boxSizing: 'border-box'}}>
          {Array.from({length: 12}).map((_, i) => (
            <div key={i} style={{background: '#2d3750', borderRadius: 4}} />
          ))}
        </div>
      </div>

      {/* CASH OUT button */}
      {p.button && (
        <div style={{position: 'absolute', left: 740, top: 1215, width: 230, textAlign: 'center'}}>
          <div
            style={{
              margin: '0 auto',
              width: 210,
              height: 110 - 30 * p.button.pressed,
              marginTop: 30 * p.button.pressed,
              borderRadius: '105px 105px 20px 20px',
              background: `radial-gradient(circle at 40% 30%, #ff8a93, ${colors.red} 55%, #99101b)`,
              border: '6px solid #111',
              boxShadow: `0 0 ${60 * p.button.glow}px ${30 * p.button.glow}px ${colors.red}88`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: impact,
              fontSize: 40,
              color: '#fff',
              textShadow: '0 3px 0 #111',
            }}
          >
            CASH OUT
          </div>
          <div style={{height: 26, background: '#111', borderRadius: 8, marginTop: -4}} />
        </div>
      )}

      {/* Auntie enters in front of everyone */}
      {p.auntie && person('auntie', p.auntie, p.auntie.x, 800, 300)}

      {/* Floor */}
      <div style={{position: 'absolute', left: 0, top: 1530, width: 1080, height: 400, background: '#0b0f19'}} />
    </AbsoluteFill>
  );
};
