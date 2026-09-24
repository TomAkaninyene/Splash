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
const VO_AT = 15;

const METALS: Record<string, string> = {
  gold: 'linear-gradient(100deg, #7a5a12 0%, #f5d27a 35%, #b8871f 60%, #5e430c 100%)',
  silver: 'linear-gradient(100deg, #4d535e 0%, #e6ebf2 35%, #9aa3b1 60%, #3d434d 100%)',
  bronze: 'linear-gradient(100deg, #5a2f14 0%, #e0a270 35%, #a4602f 60%, #4a250f 100%)',
};

const Block: React.FC<{label: string; h: number; w: number; metal: string}> = ({label, h, w, metal}) => (
  <div style={{width: w, height: h, background: METALS[metal], borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'center', paddingTop: 24, boxSizing: 'border-box', fontFamily: impact, fontSize: w * 0.4, color: 'rgba(0,0,0,0.55)', boxShadow: 'inset 0 6px 0 rgba(255,255,255,0.35)'}}>
    {label}
  </div>
);

export const S6Podium: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rocketY = lerp(f, 0, LAND, -500, 1055);
  const flag = spring({frame: f - PLANT, fps, config: {damping: 10}});

  return (
    <AbsoluteFill style={{background: '#020306', overflow: 'hidden'}}>
      {/* Stage spotlights */}
      {[-18, 0, 18].map((a, i) => (
        <div
          key={a}
          style={{
            position: 'absolute',
            left: 540 - 300,
            top: -100,
            width: 600,
            height: 1900,
            background: `linear-gradient(180deg, rgba(255,245,220,${i === 1 ? 0.28 : 0.14}) 0%, transparent 85%)`,
            clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)',
            transform: `rotate(${a + Math.sin(f / 20 + i) * 3}deg)`,
            transformOrigin: '50% 0',
            mixBlendMode: 'screen',
          }}
        />
      ))}
      <Shake hits={[LAND, PLANT]} strength={22}>
        {Array.from({length: 50}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: (i * 211) % 1080, top: (i * 137) % 1200, width: 5, height: 5, borderRadius: '50%', background: '#fff', opacity: 0.7}} />
        ))}
        {/* Podium */}
        <div style={{position: 'absolute', bottom: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}>
          <Block label="#2" h={420} w={290} metal="silver" />
          <Block label="#1" h={640} w={330} metal="gold" />
          <Block label="#3" h={300} w={290} metal="bronze" />
        </div>
        {/* Rocket lands nose-up on #1 */}
        <div style={{position: 'absolute', left: 540 - 150, top: rocketY, transform: 'rotate(-90deg)', transformOrigin: '150px 75px'}}>
          <Rocket size={300} flame={f < LAND ? 1 : 0} />
        </div>
        {/* Landing smoke */}
        {f >= LAND - 4 &&
          Array.from({length: 10}).map((_, i) => {
            const t = f - LAND + 4;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 540 - 80 + (i - 4.5) * t * 3.2,
                  top: 1230 - t * (0.8 + (i % 3) * 0.4),
                  width: 120 + t * 4,
                  height: 80 + t * 2,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(200,205,215,0.35) 0%, transparent 70%)',
                  opacity: lerp(t, 10, 50, 1, 0),
                }}
              />
            );
          })}
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
      <Caption from={VO_AT} to={89} speaker="COMMANDER" text="Gamdom… to number one." y={300} color={colors.brand} />

      <Sfx name="rumble" at={0} volume={0.4} duration={LAND} />
      <Sfx name="stamp" at={LAND} />
      <Sfx name="flag" at={PLANT} />
      <Sfx name="sting" at={PLANT} volume={0.8} />
      <Vo files={['commander-number-one.mp3']} at={VO_AT} />
    </AbsoluteFill>
  );
};
