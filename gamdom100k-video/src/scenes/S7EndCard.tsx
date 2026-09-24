import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx, Vo} from '../components/audio';
import {GamdomLogo} from '../components/Brand';
import {Caption} from '../components/Caption';
import {body, colors, impact} from '../theme';

/** The end card content, reused under the stinger and in the final logo sting. */
export const EndCardContent: React.FC<{f: number; animate?: boolean}> = ({f, animate = true}) => {
  const {fps} = useVideoConfig();
  const s = (d: number) => (animate ? spring({frame: f - d, fps, config: {damping: 11}}) : 1);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #16403a 0%, ${colors.night} 65%)`, alignItems: 'center'}}>
      <div style={{marginTop: 260, transform: `scale(${s(0)})`}}>
        <GamdomLogo height={110} />
      </div>
      <div style={{marginTop: 110, fontFamily: body, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: 4, opacity: s(4)}}>
        SIGN UP WITH CODE
      </div>
      <div style={{marginTop: 30, display: 'flex', gap: 14}}>
        {'STEVE'.split('').map((l, i) => {
          const k = s(8 + i * 3);
          return (
            <div
              key={i}
              style={{
                width: 170,
                height: 250,
                borderRadius: 20,
                border: `8px solid ${colors.brand}`,
                background: '#07120f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: impact,
                fontSize: 210,
                color: colors.brand,
                textShadow: `0 0 30px ${colors.brand}`,
                transform: `scale(${2.2 - 1.2 * k})`,
                opacity: Math.min(1, k * 3),
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 70, fontFamily: body, fontWeight: 900, fontSize: 84, color: '#fff', opacity: s(26)}}>gamdom.com</div>
      <div style={{position: 'absolute', bottom: 190, fontFamily: body, fontWeight: 800, fontSize: 44, color: colors.muted, letterSpacing: 2, opacity: s(28)}}>
        18+ · Play responsibly
      </div>
    </AbsoluteFill>
  );
};

export const S7EndCard: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <EndCardContent f={f} />
      <Caption from={20} to={70} speaker="COMMANDER" text="Code STEVE." y={1420} color={colors.brand} />
      {[8, 11, 14, 17, 20].map((d) => (
        <Sfx key={d} name="slam" at={d} volume={0.45} />
      ))}
      <Vo files={['commander-code.mp3']} at={20} />
    </AbsoluteFill>
  );
};
