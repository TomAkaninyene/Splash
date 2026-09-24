import {interpolate, useCurrentFrame} from 'remotion';
import {body, colors, impact} from '../theme';

/**
 * Film-style subtitle with a small speaker label. Most X viewers watch muted, so every line
 * is captioned. `big` is for shouted lines.
 */
export const Caption: React.FC<{
  from: number;
  to: number;
  speaker: string;
  text: string;
  color?: string;
  big?: boolean;
  y?: number;
}> = ({from, to, speaker, text, color = colors.amber, big, y = 1580}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const o = Math.min(
    interpolate(frame, [from, from + 4], [0, 1], {extrapolateRight: 'clamp'}),
    interpolate(frame, [to - 4, to], [1, 0], {extrapolateLeft: 'clamp'})
  );
  return (
    <div style={{position: 'absolute', top: y, left: 60, right: 60, textAlign: 'center', opacity: o}}>
      {speaker && (
        <div style={{fontFamily: body, fontWeight: 800, fontSize: 26, letterSpacing: 8, color, marginBottom: 8, textShadow: '0 2px 10px #000'}}>
          {speaker}
        </div>
      )}
      <div
        style={{
          fontFamily: big ? impact : body,
          fontWeight: big ? 400 : 700,
          fontSize: big ? 110 : 54,
          lineHeight: 1.12,
          letterSpacing: big ? 4 : 0,
          color: colors.white,
          textShadow: '0 3px 14px rgba(0,0,0,0.95), 0 0 2px #000',
        }}
      >
        {text}
      </div>
    </div>
  );
};
