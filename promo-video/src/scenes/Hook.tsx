import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {body, colors, display, rainbowCss} from '../theme';

const Line: React.FC<{text: string; delay: number; gradient?: boolean}> = ({
  text,
  delay,
  gradient,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: 28, justifyContent: 'center'}}>
      {text.split(' ').map((word, i) => {
        const t = spring({frame: frame - delay - i * 5, fps, config: {damping: 15}});
        return (
          <div key={i} style={{overflow: 'hidden', padding: '0 6px 18px'}}>
            <div
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: 116,
                lineHeight: 1.05,
                letterSpacing: -4,
                transform: `translateY(${(1 - t) * 180}px)`,
                ...(gradient
                  ? {
                      backgroundImage: rainbowCss,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }
                  : {color: colors.text}),
              }}
            >
              {word}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 3.5–7s: the promise.
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pill = spring({frame: frame - 45, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <Line text="Your whole day." delay={4} />
        <Line text="One glance." delay={18} gradient />
        <div
          style={{
            marginTop: 70,
            padding: '22px 52px',
            borderRadius: 60,
            border: '2px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.06)',
            fontFamily: body,
            fontWeight: 600,
            fontSize: 44,
            color: colors.text,
            opacity: pill,
            transform: `scale(${0.8 + 0.2 * pill})`,
          }}
        >
          Meet Splash
        </div>
      </div>
    </AbsoluteFill>
  );
};
