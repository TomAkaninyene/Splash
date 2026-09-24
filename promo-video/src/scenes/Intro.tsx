import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {LogoMark, Wordmark} from '../components/Logo';
import {rainbow} from '../theme';

// 0–3.5s: paint droplets burst outward, the loop draws itself, the name rises.
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const drops = Array.from({length: 18}, (_, i) => {
    const angle = (i / 18) * Math.PI * 2 + (i % 2) * 0.2;
    const dist = 260 + (i % 3) * 140;
    const t = spring({frame: frame - 2 - (i % 4), fps, config: {damping: 18, mass: 0.6}});
    const fade = interpolate(frame, [20, 42], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const size = 30 + (i % 4) * 18;
    return {
      x: Math.cos(angle) * dist * t,
      y: Math.sin(angle) * dist * t,
      size: size * (1 - 0.4 * t),
      color: rainbow[i % rainbow.length],
      opacity: fade,
    };
  });

  const rings = [0, 6, 12].map((delay, i) => {
    const t = interpolate(frame - delay, [0, 30], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
    return {r: 80 + t * 700, opacity: (1 - t) * 0.8, color: rainbow[i * 2]};
  });

  const draw = interpolate(frame, [12, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const logoScale = spring({frame: frame - 8, fps, config: {damping: 14}});
  const word = spring({frame: frame - 45, fps, config: {damping: 16}});
  const drift = interpolate(frame, [0, 110], [1, 1.06]);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {rings.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: r.r * 2,
            height: r.r * 2,
            borderRadius: '50%',
            border: `6px solid ${r.color}`,
            opacity: r.opacity,
          }}
        />
      ))}
      {drops.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: d.color,
            opacity: d.opacity,
            transform: `translate(${d.x}px, ${d.y - 120}px)`,
          }}
        />
      ))}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${drift})`,
        }}
      >
        <div style={{transform: `scale(${0.5 + 0.5 * logoScale})`}}>
          <LogoMark size={560} draw={draw} />
        </div>
        <div style={{overflow: 'hidden', paddingBottom: 20, marginTop: 30}}>
          <Wordmark
            size={190}
            style={{transform: `translateY(${(1 - word) * 220}px)`}}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
