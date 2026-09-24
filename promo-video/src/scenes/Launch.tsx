import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, display, rainbow, rainbowCss} from '../theme';

// 23–26s: a wave of colour floods the screen, like the app's launch splash.
export const Launch: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const waves = [...rainbow, colors.bg].map((color, i) => {
    const t = interpolate(frame - i * 4, [0, 26], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });
    return {color, r: t * 1150};
  });

  const line1 = spring({frame: frame - 36, fps, config: {damping: 15}});
  const line2 = spring({frame: frame - 44, fps, config: {damping: 15}});
  const textStyle: React.CSSProperties = {
    fontFamily: display,
    fontWeight: 800,
    fontSize: 150,
    lineHeight: 1.05,
    letterSpacing: -4,
    textAlign: 'center',
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      {waves.map((w, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: w.r * 2,
            height: w.r * 2,
            borderRadius: '50%',
            background: w.color,
          }}
        />
      ))}
      <div style={{overflow: 'hidden', paddingBottom: 16}}>
        <div style={{...textStyle, color: colors.text, transform: `translateY(${(1 - line1) * 180}px)`}}>
          Opens with
        </div>
      </div>
      <div style={{overflow: 'hidden', paddingBottom: 16}}>
        <div
          style={{
            ...textStyle,
            backgroundImage: rainbowCss,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            transform: `translateY(${(1 - line2) * 180}px)`,
          }}
        >
          a splash.
        </div>
      </div>
    </AbsoluteFill>
  );
};
