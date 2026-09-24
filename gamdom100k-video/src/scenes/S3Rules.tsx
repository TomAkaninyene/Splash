import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx, Vo} from '../components/audio';
import {Caption} from '../components/Caption';
import {ControlRoom} from '../components/ControlRoom';
import {Shake} from '../components/fx';
import {body, colors, impact} from '../theme';
import {lerp} from './common';
import {ScreenHeader} from './S1Password';

const SIREN = 30;
const GROAN = 38;
const TYPING = 58;
const DONE = 100;

export const S3Rules: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - SIREN - 2, fps, config: {damping: 9}});
  const progress = lerp(f, TYPING, DONE, 0, 1);
  const groan = f >= GROAN;

  return (
    <AbsoluteFill>
      <Shake hits={[SIREN + 2]} strength={14}>
        <ControlRoom
          alarm={f >= SIREN}
          hole={1}
          chairY={-3000}
          screen={
            <>
              <ScreenHeader />
              <div
                style={{
                  position: 'absolute',
                  top: 110,
                  left: 60,
                  right: 60,
                  height: 300,
                  borderRadius: 20,
                  background: colors.brand,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: impact,
                  color: colors.night,
                }}
              >
                <div style={{fontSize: 120, lineHeight: 1}}>CODE ACCEPTED</div>
                <div style={{fontSize: 70}}>✓ STEVE</div>
              </div>
              {f >= SIREN && (
                <div
                  style={{
                    position: 'absolute',
                    top: 70,
                    left: 70,
                    right: 70,
                    background: '#f1f1f1',
                    border: '6px solid #111',
                    borderRadius: 14,
                    overflow: 'hidden',
                    transform: `scale(${pop}) rotate(${(1 - pop) * -8}deg)`,
                    boxShadow: '0 20px 0 rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{background: colors.red, color: '#fff', fontFamily: impact, fontSize: 56, padding: '10px 24px'}}>
                    ⚠ RULES UPDATED
                  </div>
                  <div style={{padding: '22px 28px', fontFamily: body, fontWeight: 900, fontSize: 52, color: '#111', lineHeight: 1.15}}>
                    ALSO TAG
                    <br />
                    <span style={{color: colors.brandDark}}>@gamdom_beekay</span>
                  </div>
                  <div style={{margin: '0 28px 24px', height: 40, borderRadius: 20, background: '#ccc', overflow: 'hidden', border: '3px solid #111'}}>
                    <div style={{width: `${progress * 100}%`, height: '100%', background: colors.brand}} />
                  </div>
                  {f >= DONE && (
                    <div style={{position: 'absolute', right: 30, top: 90, fontFamily: impact, fontSize: 70, color: colors.brandDark, transform: 'rotate(-10deg)'}}>
                      TAGGED ✓
                    </div>
                  )}
                </div>
              )}
            </>
          }
          commander={{expr: groan ? (f >= DONE ? 'happy' : 'groan') : 'happy', pose: groan ? (f >= DONE ? 'up' : 'facepalm') : 'up'}}
          tech={{expr: groan ? 'groan' : 'happy', pose: groan ? 'down' : 'up', dy: 90}}
          crewA={{expr: f >= TYPING ? 'scream' : groan ? 'groan' : 'happy', pose: f >= TYPING && f < DONE ? 'type' : groan ? 'down' : 'up', typing: f >= TYPING && f < DONE}}
          crewB={{expr: groan ? (f >= DONE ? 'happy' : 'groan') : 'happy', pose: groan ? (f >= DONE ? 'up' : 'facepalm') : 'up'}}
        />
      </Shake>
      <Caption from={GROAN} to={TYPING + 20} speaker="EVERYONE" text="Nooo!" big color={colors.red} />
      <Caption from={TYPING + 22} to={119} speaker="CREW" text="*types at the speed of light*" />

      <Sfx name="accepted" at={0} />
      <Sfx name="siren" at={SIREN} volume={0.5} />
      <Sfx name="popup" at={SIREN + 2} />
      <Vo files={['nooo-1.mp3', 'nooo-2.mp3', 'nooo-3.mp3', 'nooo-4.mp3']} at={GROAN} stagger={2} volume={0.6} />
      <Sfx name="typing" at={TYPING} volume={0.8} duration={DONE - TYPING} />
      <Sfx name="accepted" at={DONE} volume={0.5} />
    </AbsoluteFill>
  );
};
