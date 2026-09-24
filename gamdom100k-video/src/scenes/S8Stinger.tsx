import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx, Vo} from '../components/audio';
import {GamdomLogo} from '../components/Brand';
import {Caption} from '../components/Caption';
import {ControlRoom} from '../components/ControlRoom';
import {Shake} from '../components/fx';
import {Alien} from '../components/Space';
import {body, colors, comic, impact} from '../theme';
import {EndCardContent} from './S7EndCard';

const SHOUT = 30;
const STING = 56;

export const S8Stinger: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const alienUp = spring({frame: f, fps, config: {damping: 12}});
  const shout = spring({frame: f - SHOUT, fps, config: {damping: 7}});
  const sting = spring({frame: f - STING, fps, config: {damping: 12}});

  return (
    <AbsoluteFill>
      {f < SHOUT && (
        <>
          <AbsoluteFill style={{filter: 'brightness(0.45)'}}>
            <EndCardContent f={99} animate={false} />
          </AbsoluteFill>
          <div style={{position: 'absolute', left: 300, top: 1920 - 620 * alienUp}}>
            <Alien width={480} sign={false} drip={1} mouth="flat" />
          </div>
          <Caption from={3} to={SHOUT - 1} speaker="ALIEN (DRIPPING)" text="…what was the code?" y={560} color="#b98cff" />
        </>
      )}
      {f >= SHOUT && f < STING && (
        <Shake hits={[SHOUT, SHOUT + 5, SHOUT + 10]} strength={36}>
          <ControlRoom
            alarm
            hole={1}
            chairY={-3000}
            screen={<AbsoluteFill style={{background: colors.brand}} />}
            commander={{expr: 'scream', pose: 'up'}}
            tech={{expr: 'scream', pose: 'up', dy: -10}}
            crewA={{expr: 'scream', pose: 'up'}}
            crewB={{expr: 'scream', pose: 'up'}}
            auntie={{x: 580, expr: 'scream', pose: 'up'}}
          />
          <div
            style={{
              position: 'absolute',
              top: 300,
              width: '100%',
              textAlign: 'center',
              fontFamily: comic,
              fontSize: 250,
              color: '#fff',
              WebkitTextStroke: '10px #111',
              textShadow: `0 14px 0 ${colors.brandDark}`,
              transform: `scale(${0.4 + 0.6 * shout}) rotate(-4deg)`,
            }}
          >
            STEEEVE!
          </div>
        </Shake>
      )}
      {f >= STING && (
        <AbsoluteFill style={{background: colors.night, alignItems: 'center', justifyContent: 'center'}}>
          <div style={{transform: `scale(${0.6 + 0.4 * sting})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <GamdomLogo height={120} />
            <div style={{marginTop: 60, fontFamily: impact, fontSize: 130, color: colors.brand, letterSpacing: 6}}>CODE STEVE</div>
            <div style={{marginTop: 30, fontFamily: body, fontWeight: 800, fontSize: 44, color: colors.muted}}>gamdom.com · 18+ · Play responsibly</div>
          </div>
        </AbsoluteFill>
      )}
      <Caption from={SHOUT} to={STING - 1} speaker="EVERYONE" text="STEEEVE!" big y={1600} color={colors.brand} />

      <Sfx name="popup" at={0} />
      <Vo files={['alien.mp3']} at={3} toneFrequency={1.7} />
      <Vo files={['steve-1.mp3', 'steve-2.mp3', 'steve-3.mp3', 'steve-4.mp3', 'steve-5.mp3', 'steve-6.mp3', 'steve-1.m4a', 'steve-2.m4a', 'steve-3.m4a', 'steve-4.m4a', 'steve-5.m4a', 'steve-6.m4a']} at={SHOUT} stagger={2} />
      <Sfx name="crowd" at={SHOUT} volume={0.7} />
      <Sfx name="slam" at={SHOUT} />
      <Sfx name="sting" at={STING} />
    </AbsoluteFill>
  );
};
