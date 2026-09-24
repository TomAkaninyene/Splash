import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {body, colors, comic} from '../theme';

/** Speaker-labelled subtitle. Most X viewers watch muted, so every line is captioned. */
export const Caption: React.FC<{
  from: number;
  to: number;
  speaker: string;
  text: string;
  color?: string;
  big?: boolean;
  y?: number;
}> = ({from, to, speaker, text, color = colors.amber, big, y = 1540}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame > to) return null;
  const pop = spring({frame: frame - from, fps, config: {damping: 12, mass: 0.6}});
  const out = interpolate(frame, [to - 5, to], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 50,
        right: 50,
        display: 'flex',
        justifyContent: 'center',
        opacity: out,
        transform: `scale(${0.7 + 0.3 * pop})`,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.82)',
          borderRadius: 26,
          padding: '18px 34px 22px',
          textAlign: 'center',
          border: `3px solid ${color}`,
          maxWidth: 960,
        }}
      >
        <div style={{fontFamily: body, fontWeight: 900, fontSize: 30, letterSpacing: 3, color}}>
          {speaker}
        </div>
        <div
          style={{
            fontFamily: big ? comic : body,
            fontWeight: 800,
            fontSize: big ? 96 : 58,
            lineHeight: 1.1,
            color: colors.white,
            letterSpacing: big ? 3 : 0,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};
