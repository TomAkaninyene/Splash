import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Cross-fades a scene in and out; neighbouring Sequences overlap by `fade` frames.
export const SceneFade: React.FC<{
  children: React.ReactNode;
  fade?: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
}> = ({children, fade = 10, fadeIn = true, fadeOut = true}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = Math.min(
    fadeIn ? interpolate(frame, [0, fade], [0, 1], {extrapolateRight: 'clamp'}) : 1,
    fadeOut
      ? interpolate(frame, [durationInFrames - fade, durationInFrames], [1, 0], {
          extrapolateLeft: 'clamp',
        })
      : 1
  );
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
