import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../theme';

// Slowly drifting colour glows behind every scene.
const blobs = [
  {color: colors.purple, x: 0.2, y: 0.25, r: 700, speed: 0.011, phase: 0},
  {color: colors.teal, x: 0.85, y: 0.6, r: 650, speed: 0.009, phase: 2},
  {color: colors.red, x: 0.3, y: 0.9, r: 600, speed: 0.013, phase: 4},
];

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: colors.bg, overflow: 'hidden'}}>
      {blobs.map((b, i) => {
        const dx = Math.sin(frame * b.speed + b.phase) * 120;
        const dy = Math.cos(frame * b.speed * 0.8 + b.phase) * 160;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x * 1080 - b.r + dx,
              top: b.y * 1920 - b.r + dy,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${b.color}55 0%, ${b.color}00 65%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
