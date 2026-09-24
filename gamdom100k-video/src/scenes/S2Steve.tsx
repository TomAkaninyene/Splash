import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx, Vo} from '../components/audio';
import {Caption} from '../components/Caption';
import {ControlRoom} from '../components/ControlRoom';
import {Shake} from '../components/fx';
import {colors, impact} from '../theme';
import {lerp} from './common';
import {ScreenHeader} from './S1Password';

const LETTERS = ['S', 'T', 'E', 'V', 'E'];
const VO_AT = 8;
export const SLAMS = [12, 34, 56, 76, 98];
const LAUNCH = 102;

export const S2Steve: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = SLAMS.filter((s) => f >= s).length;
  const launched = f >= LAUNCH;
  const fly = spring({frame: f - LAUNCH, fps, config: {damping: 30, mass: 0.5}});
  const drop = spring({frame: f - LAUNCH, fps, config: {damping: 8}});

  const debris = launched
    ? Array.from({length: 14}, (_, i) => {
        const t = f - (LAUNCH + 4);
        return {x: 380 + ((i * 97) % 320), y: 120 + t * (10 + (i % 4) * 4) + 0.6 * t * t, r: 8 + (i % 3) * 6, rot: t * (i % 2 ? 12 : -9)};
      })
    : [];

  return (
    <AbsoluteFill>
      <Shake hits={[...SLAMS, LAUNCH + 4]} strength={30}>
        <ControlRoom
          alarm
          screenLight={colors.brand}
          hole={lerp(f, LAUNCH + 3, LAUNCH + 8, 0, 1)}
          chairY={launched ? -1700 * fly : 0}
          chairSpin={launched ? fly * 200 : 0}
          screen={
            <>
              <ScreenHeader />
              <div style={{position: 'absolute', top: 110, width: '100%', display: 'flex', justifyContent: 'center', gap: 18}}>
                {LETTERS.map((l, i) => {
                  if (i >= shown) return null;
                  const s = spring({frame: f - SLAMS[i], fps, config: {damping: 9, mass: 0.5}});
                  return (
                    <div
                      key={i}
                      style={{
                        width: 158,
                        height: 250,
                        border: `6px solid ${colors.brand}`,
                        borderRadius: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: impact,
                        fontSize: 210,
                        color: colors.brand,
                        textShadow: `0 0 30px ${colors.brand}`,
                        transform: `scale(${3 - 2 * s})`,
                        opacity: Math.min(1, s * 3),
                      }}
                    >
                      {l}
                    </div>
                  );
                })}
              </div>
            </>
          }
          commander={{expr: launched ? 'shock' : 'neutral', pose: launched ? 'up' : 'hips'}}
          tech={{
            expr: launched ? 'shock' : 'scream',
            pose: launched ? 'up' : 'type',
            typing: !launched,
            sweat: 1,
            dy: launched ? 90 * drop : 0,
          }}
          crewA={{expr: launched ? 'shock' : 'nervous', pose: launched ? 'up' : 'down'}}
          crewB={{expr: launched ? 'shock' : 'nervous', pose: launched ? 'up' : 'down'}}
        />
        {debris.map((d, i) => (
          <div
            key={i}
            style={{position: 'absolute', left: d.x, top: d.y, width: d.r * 2, height: d.r * 1.4, background: '#3a4560', border: '3px solid #111', transform: `rotate(${d.rot}deg)`}}
          />
        ))}
      </Shake>

      <Caption
        from={SLAMS[0]}
        to={LAUNCH + 4}
        speaker="TECHNICIAN"
        text={LETTERS.slice(0, shown).map((l) => `${l}!`).join(' ')}
        big
      />
      <Caption from={LAUNCH + 12} to={149} speaker="" text="[ the chair has left the building ]" />

      <Sfx name="alarm" at={0} volume={0.25} />
      <Vo files={['tech-steve.mp3']} at={VO_AT} />
      {SLAMS.map((s) => (
        <Sfx key={s} name="slam" at={s} volume={0.75} />
      ))}
      <Sfx name="launch" at={LAUNCH - 2} volume={0.7} />
      <Sfx name="crash" at={LAUNCH + 3} volume={0.6} />
    </AbsoluteFill>
  );
};
