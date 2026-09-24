import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {Sfx} from '../components/audio';
import {Chair} from '../components/ControlRoom';
import {Shake} from '../components/fx';
import {Alien, CrashGraph, Cup, Plane} from '../components/Space';
import {colors, comic, impact} from '../theme';
import {clamp, lerp} from './common';

export const FLIGHT_LEN = 210;
// Multiplier climbs 1.00x → 10.00x across the flight.
export const flightM = (f: number) => Math.exp(Math.log(10) * Math.min(1, Math.max(0, (f - 8) / (FLIGHT_LEN - 8))));

const PLANE = [44, 130];
const CUP_DROP = 80;
const CHAIR = [112, 172];
const ALIEN_IN = 146;
const SPLAT = 184;

export const S4Flight: React.FC = () => {
  const f = useCurrentFrame();
  const m = flightM(f);
  const sky = interpolateColors(m, [1, 2.5, 5, 10], ['#58b4ff', '#2c5fc4', '#101845', colors.night]);
  const planeX = lerp(f, PLANE[0], PLANE[1], 1150, -520);
  const planeY = 430;
  const cupFall = f - CUP_DROP;
  const splatted = f >= SPLAT;
  const alienX = lerp(f, ALIEN_IN, ALIEN_IN + 24, 1150, 560) - Math.max(0, f - ALIEN_IN - 24) * 2;

  return (
    <AbsoluteFill style={{background: sky, overflow: 'hidden'}}>
      <Shake hits={[0, 3]} strength={20}>
        {/* Stars fade in as we leave the atmosphere */}
        {Array.from({length: 60}).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (i * 173) % 1080 - ((f * (2 + (i % 3))) % 1080),
              top: (i * 311) % 1920,
              width: 4 + (i % 3) * 2,
              height: 4 + (i % 3) * 2,
              borderRadius: '50%',
              background: '#fff',
              opacity: lerp(m, 3, 6, 0, 0.8),
            }}
          />
        ))}
        {/* Clouds rush past at low altitude */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 1200 - ((f * 22 + i * 420) % 1700),
              top: 500 + i * 330,
              width: 380,
              height: 120,
              borderRadius: 80,
              background: '#fff',
              opacity: lerp(m, 1.5, 3, 0.9, 0),
            }}
          />
        ))}

        <div style={{position: 'absolute', left: 0, top: 380}}>
          <CrashGraph w={1080} h={1350} m={m} frame={f} rocketSize={300} />
        </div>

        {/* Plane + pilot dropping his coffee */}
        {f >= PLANE[0] && f <= PLANE[1] && (
          <div style={{position: 'absolute', left: planeX, top: planeY}}>
            <Plane width={440} pilotShock={f >= CUP_DROP - 4} hasCup={f < CUP_DROP} />
          </div>
        )}
        {cupFall >= 0 && f < CUP_DROP + 40 && (
          <div style={{position: 'absolute', left: lerp(f, PLANE[0], PLANE[1], 1150, -520) + 60 + cupFall * 4, top: planeY + 50 + cupFall * cupFall * 0.9}}>
            <Cup size={60} spin={cupFall * 25} />
          </div>
        )}
        {f >= CUP_DROP - 4 && f < CUP_DROP + 26 && (
          <div style={{position: 'absolute', left: Math.max(40, lerp(f, PLANE[0], PLANE[1], 1150, -520) - 40), top: planeY + 170, fontFamily: comic, fontSize: 64, color: '#fff', WebkitTextStroke: '3px #111', transform: 'rotate(-8deg)'}}>
            MY COFFEE!
          </div>
        )}

        {/* The launched chair drifting through space */}
        {f >= CHAIR[0] && f <= CHAIR[1] && (
          <div
            style={{
              position: 'absolute',
              left: lerp(f, CHAIR[0], CHAIR[1], -300, 1150),
              top: lerp(f, CHAIR[0], CHAIR[1], 1300, 1050),
              transform: `rotate(${f * 6}deg) scale(0.6)`,
            }}
          >
            <Chair />
          </div>
        )}

        {/* Alien with a CASH OUT sign; the coffee finally lands on him */}
        {f >= ALIEN_IN && (
          <div style={{position: 'absolute', left: alienX, top: 950 + Math.sin(f / 6) * 14}}>
            <Alien width={340} drip={splatted ? lerp(f, SPLAT, SPLAT + 20, 0.3, 1) : 0} mouth={splatted ? 'o' : 'flat'} wave={f / 3} />
          </div>
        )}
        {f >= SPLAT - 14 && f < SPLAT && (
          <div style={{position: 'absolute', left: alienX + 150, top: lerp(f, SPLAT - 14, SPLAT, -80, 950)}}>
            <Cup size={60} spin={f * 25} />
          </div>
        )}
        {f >= SPLAT && f < SPLAT + 22 && (
          <div style={{position: 'absolute', left: alienX + 40, top: 820, fontFamily: comic, fontSize: 110, color: '#8a5a2b', WebkitTextStroke: '4px #111', transform: `rotate(-10deg) scale(${lerp(f, SPLAT, SPLAT + 5, 0.5, 1)})`}}>
            SPLASH!
          </div>
        )}
      </Shake>

      {/* Multiplier */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          width: '100%',
          textAlign: 'center',
          fontFamily: impact,
          fontSize: 230,
          lineHeight: 1,
          color: '#fff',
          textShadow: `0 0 40px ${colors.brand}, 0 8px 0 #111`,
          transform: `scale(${1 + 0.04 * Math.sin(f * 0.8)})`,
        }}
      >
        {m.toFixed(2)}x
      </div>

      <Sfx name="rumble" at={0} volume={0.55} />
      <Sfx name="launch" at={0} volume={0.6} />
      <Sfx name="passby" at={PLANE[0] + 20} volume={0.8} />
      <Sfx name="passby" at={CHAIR[0] + 8} volume={0.6} />
      <Sfx name="splash" at={SPLAT} />
    </AbsoluteFill>
  );
};

export {clamp};
