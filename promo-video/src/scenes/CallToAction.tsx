import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {LogoMark, Wordmark} from '../components/Logo';
import {body, colors, rainbowCss} from '../theme';

// 26–30s: logo, tagline, download button.
export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const draw = interpolate(frame, [4, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const word = spring({frame: frame - 14, fps, config: {damping: 16}});
  const tagline = spring({frame: frame - 26, fps, config: {damping: 18}});
  const button = spring({frame: frame - 38, fps, config: {damping: 12}});
  const pulse = frame > 60 ? 1 + Math.sin((frame - 60) / 6) * 0.03 : 1;
  const footer = spring({frame: frame - 52, fps, config: {damping: 20}});

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <LogoMark size={420} draw={draw} />
        <div style={{overflow: 'hidden', paddingBottom: 20, marginTop: 20}}>
          <Wordmark size={170} style={{transform: `translateY(${(1 - word) * 200}px)`}} />
        </div>
        <div
          style={{
            fontFamily: body,
            fontWeight: 500,
            fontSize: 50,
            color: colors.muted,
            marginTop: 10,
            opacity: tagline,
            transform: `translateY(${(1 - tagline) * 30}px)`,
          }}
        >
          Your day, at a glance.
        </div>
        <div
          style={{
            marginTop: 90,
            padding: 5,
            borderRadius: 80,
            backgroundImage: rainbowCss,
            transform: `scale(${button * pulse})`,
            boxShadow: `0 20px 60px ${colors.purple}88`,
          }}
        >
          <div
            style={{
              padding: '34px 90px',
              borderRadius: 76,
              background: colors.bg,
              fontFamily: body,
              fontWeight: 600,
              fontSize: 56,
              color: colors.text,
            }}
          >
            Download now
          </div>
        </div>
        <div
          style={{
            marginTop: 50,
            fontFamily: body,
            fontSize: 38,
            color: colors.muted,
            opacity: footer,
            letterSpacing: 2,
          }}
        >
          Free on Android
        </div>
      </div>
    </AbsoluteFill>
  );
};
