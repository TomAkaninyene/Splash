import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {body, colors} from '../theme';
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
  /** Colour of the light the main screen casts on the room. */
  screenLight?: string;
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

export const Chair: React.FC<{style?: React.CSSProperties; rim?: string}> = ({style, rim = '#5fe3ff'}) => (
  <svg width={260} height={420} viewBox="0 0 260 420" style={{...style, filter: `drop-shadow(0 0 1.5px ${rim}) drop-shadow(0 0 10px ${rim}55)`}}>
    <rect x={40} y={0} width={180} height={260} rx={40} fill="#0b0e16" />
    <rect x={20} y={250} width={220} height={50} rx={20} fill="#0b0e16" />
    <rect x={120} y={300} width={20} height={70} fill="#07090e" />
    <path d="M40 400 L130 370 L220 400" stroke="#07090e" strokeWidth={14} fill="none" strokeLinecap="round" />
  </svg>
);

/** Red rotating beacon beam that sweeps the room. */
const Beam: React.FC<{x: number; phase: number; on: boolean}> = ({x, phase, on}) => {
  const frame = useCurrentFrame();
  if (!on) return null;
  const angle = ((frame * 7 + phase) % 360) - 180;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 900,
        top: 128 - 900,
        width: 1800,
        height: 1800,
        background: `conic-gradient(from ${angle}deg at 50% 50%, ${colors.red}00 0deg, ${colors.red}55 14deg, ${colors.red}00 30deg, transparent 180deg, ${colors.red}00 180deg, ${colors.red}40 194deg, ${colors.red}00 210deg, transparent 360deg)`,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
  );
};

export const ControlRoom: React.FC<RoomProps> = (p) => {
  const frame = useCurrentFrame();
  const typePhase = frame * 1.3;
  const pulse = p.alarm ? 0.5 + 0.5 * Math.sin(frame / 4) : 0;
  const screenLight = p.screenLight ?? '#5fe3ff';
  // Rim light blends the screen colour with the alarm red as it pulses.
  const rim = p.alarm && pulse > 0.55 ? colors.red : screenLight;

  const person = (who: keyof typeof cast, a: Actor, x: number, y: number, width: number) => (
    <div style={{position: 'absolute', left: x + (a.dx ?? 0), top: y + (a.dy ?? 0)}}>
      <Person
        {...cast[who]}
        rim={rim}
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
    <AbsoluteFill style={{background: '#03050a', overflow: 'hidden'}}>
      {/* Wall of small monitors behind the crew: their glow backlights the silhouettes */}
      <div style={{position: 'absolute', left: 0, top: 760, width: 1080, height: 560, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14, padding: '0 14px', boxSizing: 'border-box'}}>
        {Array.from({length: 21}).map((_, i) => {
          const hue = [screenLight, '#3a7bff', colors.brand][i % 3];
          const flicker = 0.35 + 0.15 * Math.sin(frame / 7 + i * 1.7);
          return (
            <div key={i} style={{background: '#070b14', border: '2px solid #121a2a', borderRadius: 6, position: 'relative', overflow: 'hidden', boxShadow: `0 0 30px ${hue}22`}}>
              {[0, 1, 2, 3].map((r) => (
                <div
                  key={r}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: 14 + r * 30,
                    height: 6,
                    width: `${30 + ((i * 37 + r * 23 + Math.floor(frame / 9)) % 60)}%`,
                    background: hue,
                    opacity: flicker,
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Ceiling */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 140, background: 'linear-gradient(#05070c, #0a0f1a)', borderBottom: '2px solid #1b2436'}} />
      {(p.hole ?? 0) > 0 && (
        <>
          <svg style={{position: 'absolute', left: 340, top: -20}} width={400} height={200} viewBox="0 0 400 200">
            <path
              d={`M${200 - 150 * p.hole!} 160 L${200 - 90 * p.hole!} 20 L${200 - 20 * p.hole!} 70 L${200 + 60 * p.hole!} 10 L${200 + 150 * p.hole!} 150 L${200 + 40 * p.hole!} 120 Z`}
              fill="#dff3ff"
            />
          </svg>
          {/* Daylight shaft through the hole */}
          <div
            style={{
              position: 'absolute',
              left: 300,
              top: 100,
              width: 480,
              height: 1300,
              background: 'linear-gradient(180deg, rgba(220,240,255,0.35) 0%, rgba(220,240,255,0.06) 60%, transparent 100%)',
              clipPath: 'polygon(38% 0, 62% 0, 100% 100%, 0 100%)',
              opacity: p.hole,
              mixBlendMode: 'screen',
            }}
          />
        </>
      )}

      {/* Beacons */}
      {[150, 930].map((x) => (
        <div
          key={x}
          style={{
            position: 'absolute',
            left: x - 26,
            top: 112,
            width: 52,
            height: 30,
            borderRadius: '26px 26px 4px 4px',
            background: p.alarm ? colors.red : '#2a0a0e',
            boxShadow: p.alarm ? `0 0 ${30 + 40 * pulse}px ${10 + 20 * pulse}px ${colors.red}aa` : 'none',
          }}
        />
      ))}

      {/* Main screen with bloom and a cone of light onto the room */}
      <div
        style={{
          position: 'absolute',
          left: SCREEN.x - 40,
          top: SCREEN.y + SCREEN.h - 20,
          width: SCREEN.w + 80,
          height: 900,
          background: `linear-gradient(180deg, ${screenLight}26 0%, transparent 70%)`,
          clipPath: 'polygon(6% 0, 94% 0, 100% 100%, 0 100%)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: SCREEN.x,
          top: SCREEN.y,
          width: SCREEN.w,
          height: SCREEN.h,
          background: colors.screen,
          border: '6px solid #151c2b',
          borderRadius: 14,
          boxShadow: `0 0 120px 20px ${screenLight}33, inset 0 0 80px ${screenLight}22`,
          overflow: 'hidden',
        }}
      >
        {p.screen}
        <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 5px)', pointerEvents: 'none'}} />
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.07) 0%, transparent 35%)', pointerEvents: 'none'}} />
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
        <Chair rim={rim} />
      </div>

      {/* Crew */}
      {person('commander', p.commander, 10, 820, 270)}
      {person('crewA', p.crewA, 740, 930, 190)}
      {person('crewB', p.crewB, 890, 900, 200)}
      {person('tech', p.tech, 405, 910, 270)}
      {p.techOverlay && <div style={{position: 'absolute', left: 300, top: 760, zIndex: 6}}>{p.techOverlay}</div>}

      {/* Desk: glossy black with a screen reflection along the edge */}
      <div
        style={{
          position: 'absolute',
          left: -20,
          top: 1290,
          width: 1120,
          height: 260,
          background: 'linear-gradient(180deg, #121826 0%, #080b12 35%, #05070b 100%)',
          borderTop: `3px solid ${screenLight}66`,
          boxShadow: `0 -10px 40px ${screenLight}22`,
        }}
      >
        {Array.from({length: 26}).map((_, i) => {
          const on = Math.floor((frame + i * 7) / 6) % 3 !== 0;
          const c = [colors.brand, colors.amber, '#4fb2ff', '#ffffff'][i % 4];
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 30 + i * 41,
                top: 190 + (i % 2) * 22,
                width: 10,
                height: 4,
                borderRadius: 2,
                background: on ? c : '#0c111b',
                boxShadow: on ? `0 0 10px ${c}` : 'none',
              }}
            />
          );
        })}
        {/* Keypad */}
        <div style={{position: 'absolute', left: 430, top: 30, width: 220, height: 100, borderRadius: 10, background: '#05080d', border: `2px solid ${screenLight}44`, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, padding: 10, boxSizing: 'border-box'}}>
          {Array.from({length: 12}).map((_, i) => (
            <div key={i} style={{background: '#0d1420', borderRadius: 3, boxShadow: `inset 0 0 6px ${screenLight}55`}} />
          ))}
        </div>
      </div>

      {/* CASH OUT button */}
      {p.button && (
        <div style={{position: 'absolute', left: 740, top: 1225, width: 230, textAlign: 'center'}}>
          <div
            style={{
              margin: '0 auto',
              width: 190,
              height: 90 - 26 * p.button.pressed,
              marginTop: 26 * p.button.pressed,
              borderRadius: '95px 95px 14px 14px',
              background: `radial-gradient(circle at 40% 25%, #ffb0b6 0%, ${colors.red} 40%, #6a0a12 100%)`,
              boxShadow: `0 0 ${50 * p.button.glow}px ${24 * p.button.glow}px ${colors.red}99`,
            }}
          />
          <div style={{height: 22, background: '#10141d', borderRadius: 6, marginTop: -2, borderTop: '2px solid #2a3144'}} />
          <div style={{marginTop: 8, fontFamily: body, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: '#ffd9dc'}}>CASH OUT</div>
        </div>
      )}

      {/* Auntie enters in front of everyone */}
      {p.auntie && person('auntie', p.auntie, p.auntie.x, 800, 300)}

      {/* Alarm beams + red wash on top of everything */}
      <Beam x={150} phase={0} on={!!p.alarm} />
      <Beam x={930} phase={140} on={!!p.alarm} />
      {p.alarm && <AbsoluteFill style={{background: colors.red, opacity: 0.08 * pulse, mixBlendMode: 'screen'}} />}

      {/* Floor */}
      <div style={{position: 'absolute', left: 0, top: 1550, width: 1080, height: 400, background: 'linear-gradient(#05070b, #020305)'}} />
    </AbsoluteFill>
  );
};
