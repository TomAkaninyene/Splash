import {useId} from 'react';
import {display, rainbow, rainbowCss} from '../theme';

// Infinity loop inspired by the app's splash logo (drawable-v24/name.png).
const LOOP =
  'M 100 50 C 70 15, 25 15, 25 50 C 25 85, 70 85, 100 50 C 130 15, 175 15, 175 50 C 175 85, 130 85, 100 50 Z';

export const LogoMark: React.FC<{size: number; draw?: number}> = ({
  size,
  draw = 1,
}) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size / 2} viewBox="0 0 200 100">
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="1" y1="0" y2="0">
          {rainbow.map((c, i) => (
            <stop key={c} offset={i / (rainbow.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <path
        d={LOOP}
        fill="none"
        stroke={`url(#g${id})`}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
      />
    </svg>
  );
};

export const Wordmark: React.FC<{size: number; style?: React.CSSProperties}> = ({
  size,
  style,
}) => (
  <div
    style={{
      fontFamily: display,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: -size * 0.03,
      lineHeight: 1,
      backgroundImage: rainbowCss,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      ...style,
    }}
  >
    Splash
  </div>
);
