import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx, Vo} from '../components/audio';
import {Flag} from '../components/Brand';
import {Caption} from '../components/Caption';
import {Shake} from '../components/fx';
import {Rocket} from '../components/Space';
import {colors, impact} from '../theme';
import {lerp} from './common';

const LAND = 26;
const PLANT = 34;

const Block: React.FC<{label: string; h: number; w: number; color: string}> = ({label, h, w, color}) => (
  <div style={{width: w, height: h, background: color, border: '6px solid #111', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'center', paddingTop: 20, boxSizing: 'border-box', fontFamily: impact, fontSize: w * 0.42, color: '#111'}}>
    {label}
  </div>
);

export const S6Podium: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rocketY = lerp(f, 0, LAND, -500, 1055);
  const flag = spring({frame: f - PLANT, fps, config: {damping: 10}});

  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 60%, #1b3b3a 0%, ${colors.night} 70%)`, overflow: 'hidden'}}>
      <Shake hits={[LAND, PLANT]} strength={22}>
        {Array.from({length: 50}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: (i * 211) % 1080, top: (i * 137) % 1200, width: 5, height: 5, borderRadius: '50%', background: '#fff', opacity: 0.7}} />
        ))}
        {/* Podium */}
        <div style={{position: 'absolute', bottom: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}>
          <Block label="#2" h={420} w={290} color="#c9d1dc" />
          <Block label="#1" h={640} w={330} color={colors.amber} />
          <Block label="#3" h={300} w={290} color="#d08a4e" />
        </div>
        {/* Rocket lands nose-up on #1 */}
        <div style={{position: 'absolute', left: 540 - 150, top: rocketY, transform: 'rotate(-90deg)', transformOrigin: '150px 75px'}}>
          <Rocket size={300} flame={f < LAND ? 1 : 0} />
        </div>
        {/* Flag */}
        {f >= PLANT && (
          <div style={{position: 'absolute', left: 625, top: 1280 - 468, transformOrigin: 'bottom left', transform: `scaleY(${flag})`}}>
            <Flag wave={f / 4} scale={0.9} />
          </div>
        )}
        {/* Confetti */}
        {f >= PLANT &&
          Array.from({length: 40}).map((_, i) => {
            const t = f - PLANT;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 540 + Math.cos(i * 2.4) * (40 + t * (8 + (i % 5))),
                  top: 1150 + Math.sin(i * 2.4) * t * 9 + t * t * 0.45,
                  width: 18,
                  height: 10,
                  background: [colors.brand, colors.amber, '#fff', colors.red][i % 4],
                  transform: `rotate(${t * 20 + i * 30}deg)`,
                }}
              />
            );
          })}
      </Shake>
      <Caption from={PLANT + 4} to={89} speaker="COMMANDER" text="Gamdom… to number one." y={300} color={colors.brand} />

      <Sfx name="rumble" at={0} volume={0.4} duration={LAND} />
      <Sfx name="stamp" at={LAND} />
      <Sfx name="flag" at={PLANT} />
      <Sfx name="sting" at={PLANT} volume={0.8} />
      <Vo files={['commander-number-one.mp3']} at={PLANT + 4} />
    </AbsoluteFill>
  );
};
