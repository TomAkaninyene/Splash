import {AbsoluteFill, Freeze, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx, Vo} from '../components/audio';
import {Caption} from '../components/Caption';
import {ControlRoom} from '../components/ControlRoom';
import {Flash, Shake} from '../components/fx';
import {CrashGraph} from '../components/Space';
import {body, colors, comic, impact} from '../theme';
import {lerp} from './common';
import {ScreenHeader} from './S1Password';

const NOT_RESPONDING = 20;
const DOOR = 58;
const AUNTIE_LINE = 64;
const SLAM = 100;
const FREEZE = 103;
const UNFREEZE = 140;
const BOOM = 146;
const CASHED = 11.2;

const multiplier = (f: number) => {
  if (f < SLAM) return 10 * Math.exp((Math.log(CASHED / 10) * f) / SLAM);
  return Math.min(11.24, CASHED + (f - SLAM) * 0.001);
};

const NotResponding: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: f - NOT_RESPONDING, fps, config: {damping: 10}});
  if (f < NOT_RESPONDING) return null;
  return (
    <div style={{width: 480, background: '#f3f3f3', border: '4px solid #111', borderRadius: 10, transform: `scale(${s})`, boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
      <div style={{background: '#2b5fd9', color: '#fff', fontFamily: body, fontWeight: 800, fontSize: 26, padding: '8px 14px'}}>technician.exe</div>
      <div style={{fontFamily: body, fontWeight: 800, fontSize: 32, color: '#111', padding: '16px 18px'}}>
        technician.exe is not responding
        <div style={{marginTop: 10, fontWeight: 500, fontSize: 24}}>Wait for it to respond?</div>
      </div>
    </div>
  );
};

const Scene: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const m = multiplier(f);
  const auntieIn = spring({frame: f - DOOR, fps, config: {damping: 13}});
  const slam = lerp(f, SLAM - 6, SLAM, 0, 1);
  const crashed = f >= BOOM;
  const relieved = f >= BOOM + 6;

  return (
    <Shake hits={[DOOR, SLAM, BOOM, BOOM + 4]} strength={28}>
      <ControlRoom
        alarm
        hole={1}
        chairY={-3000}
        button={{pressed: f >= SLAM ? 1 : 0, glow: f < SLAM ? 0.6 + 0.4 * Math.sin(f / 3) : 0.2}}
        techOverlay={f < DOOR + 10 ? <NotResponding f={f} /> : null}
        screen={
          <>
            <ScreenHeader />
            <div style={{position: 'absolute', left: 0, top: 70}}>
              <CrashGraph w={930} h={460} m={m} frame={f} crashed={crashed} cashedAt={f >= SLAM ? CASHED : undefined} showAxes={false} />
            </div>
            <div style={{position: 'absolute', top: 90, left: 40, fontFamily: impact, fontSize: 130, color: crashed ? colors.red : '#fff', textShadow: '0 6px 0 #111'}}>
              {m.toFixed(2)}x
            </div>
            {crashed && (
              <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: impact, fontSize: 130, color: colors.red, textShadow: '0 6px 0 #111', transform: 'rotate(-6deg)'}}>
                CRASHED
              </div>
            )}
          </>
        }
        commander={{expr: relieved ? 'happy' : 'scream', pose: relieved ? 'up' : 'point'}}
        tech={{expr: relieved ? 'happy' : 'frozen', pose: relieved ? 'up' : 'hover', sweat: relieved ? 0 : 1, dy: -10}}
        crewA={{expr: relieved ? 'happy' : 'scream', pose: 'up'}}
        crewB={{expr: relieved ? 'happy' : 'scream', pose: 'up'}}
        auntie={f >= DOOR ? {x: 1100 - 510 * auntieIn, expr: relieved ? 'happy' : 'angry', pose: f >= SLAM - 8 ? (relieved ? 'hips' : 'slam') : 'point', slam} : undefined}
      />
      {crashed && (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, ${colors.amber}cc 0%, ${colors.red}66 30%, transparent 60%)`, opacity: lerp(f, BOOM, BOOM + 20, 1, 0)}} />
      )}
    </Shake>
  );
};

export const S5Cashout: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const frozen = f >= FREEZE && f < UNFREEZE;
  const stamp = spring({frame: f - FREEZE - 4, fps, config: {damping: 9}});

  return (
    <AbsoluteFill>
      {frozen ? (
        <Freeze frame={FREEZE}>
          <AbsoluteFill style={{filter: 'grayscale(0.85) contrast(1.1)'}}>
            <Scene f={FREEZE} />
          </AbsoluteFill>
        </Freeze>
      ) : (
        <Scene f={f} />
      )}
      {frozen && (
        <div
          style={{
            position: 'absolute',
            top: 760,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            transform: `rotate(-12deg) scale(${2.4 - 1.4 * stamp})`,
            opacity: Math.min(1, stamp * 2),
          }}
        >
          <div style={{fontFamily: comic, fontSize: 190, color: colors.red, border: `14px solid ${colors.red}`, borderRadius: 30, padding: '0 40px', background: 'rgba(255,255,255,0.85)', letterSpacing: 6}}>
            CLOSE CALL
          </div>
        </div>
      )}
      <Flash at={BOOM} color={colors.amber} length={10} />

      <Caption from={2} to={40} speaker="EVERYONE" text="CASH OUT!! CASH OUT!!" color={colors.red} />
      <Caption from={AUNTIE_LINE} to={FREEZE - 1} speaker="AUNTIE" text="Will you PRESS IT!" big color={colors.brand} />

      <Sfx name="alarm" at={0} volume={0.25} duration={FREEZE} />
      <Sfx name="riser" at={8} volume={0.6} />
      <Sfx name="popup" at={NOT_RESPONDING} />
      <Sfx name="door" at={DOOR} />
      <Vo files={['auntie.mp3', 'auntie.m4a', 'auntie.wav']} at={AUNTIE_LINE} />
      <Sfx name="button" at={SLAM} />
      <Sfx name="scratch" at={FREEZE} />
      <Sfx name="stamp" at={FREEZE + 6} />
      <Sfx name="explosion" at={BOOM} />
    </AbsoluteFill>
  );
};
