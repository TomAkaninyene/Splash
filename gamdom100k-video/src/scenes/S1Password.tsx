import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Sfx, Vo} from '../components/audio';
import {Caption} from '../components/Caption';
import {ControlRoom} from '../components/ControlRoom';
import {Shake} from '../components/fx';
import {colors, impact} from '../theme';

const ATTEMPT = 'PASSWORD123';
const TYPE_START = 40;
const DENIED = 78;

export const ScreenHeader: React.FC = () => (
  <div style={{position: 'absolute', top: 24, width: '100%', textAlign: 'center', fontFamily: impact, fontSize: 40, letterSpacing: 6, color: colors.brand}}>
    MISSION: GAMDOM TO #1
  </div>
);

export const S1Password: React.FC = () => {
  const f = useCurrentFrame();
  const typed = Math.max(0, Math.min(ATTEMPT.length, Math.floor((f - TYPE_START) / 3) + 1));
  const denied = f >= DENIED;
  const facepalm = f >= DENIED + 8;
  const cursor = Math.floor(f / 8) % 2 === 0 ? '▌' : ' ';

  return (
    <AbsoluteFill>
      <Shake hits={[DENIED]} strength={16}>
        <ControlRoom
          alarm
          screen={
            <>
              <ScreenHeader />
              <div style={{position: 'absolute', top: 130, width: '100%', textAlign: 'center', fontFamily: impact, fontSize: 64, color: '#fff'}}>
                ENTER LAUNCH CODE
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 250,
                  left: 90,
                  right: 90,
                  height: 160,
                  border: `6px solid ${colors.brand}`,
                  borderRadius: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: impact,
                  fontSize: 100,
                  letterSpacing: 6,
                  color: colors.brand,
                }}
              >
                {f >= TYPE_START ? ATTEMPT.slice(0, typed) : ''}
                {!denied && cursor}
              </div>
              {denied && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: Math.floor((f - DENIED) / 4) % 2 === 0 ? colors.red : '#8a0f18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: impact,
                    fontSize: 150,
                    color: '#fff',
                    textShadow: '0 6px 0 #111',
                  }}
                >
                  ACCESS DENIED
                </div>
              )}
            </>
          }
          commander={{expr: facepalm ? 'groan' : 'neutral', pose: facepalm ? 'facepalm' : 'point'}}
          tech={{
            expr: denied ? 'nervous' : 'confident',
            pose: 'type',
            typing: f >= TYPE_START && f < DENIED,
            sweat: denied ? 1 : 0,
          }}
          crewA={{expr: facepalm ? 'groan' : 'neutral', pose: facepalm ? 'facepalm' : 'down'}}
          crewB={{expr: facepalm ? 'groan' : 'neutral', pose: facepalm ? 'facepalm' : 'down'}}
        />
      </Shake>
      <Caption from={6} to={60} speaker="COMMANDER" text="Enter the launch code." />
      <Caption from={DENIED + 6} to={119} speaker="EVERYONE" text="*facepalm*" color={colors.red} />

      <Sfx name="alarm" at={0} volume={0.3} />
      <Vo files={['commander-launch.mp3']} at={6} />
      {Array.from({length: ATTEMPT.length}).map((_, i) => (
        <Sfx key={i} name="key" at={TYPE_START + i * 3} volume={0.6} />
      ))}
      <Sfx name="denied" at={DENIED} />
      <Sfx name="flag" at={DENIED + 8} volume={0.5} />
    </AbsoluteFill>
  );
};
