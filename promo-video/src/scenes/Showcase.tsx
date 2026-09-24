import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Phone, PHONE_W} from '../components/Phone';
import {body, colors, display, rainbow} from '../theme';

export const BEAT_START = 36;
export const BEAT_LEN = 112;

const features = [
  {title: 'Greets you by name', sub: 'Every morning feels personal.'},
  {title: 'Weather at a glance', sub: 'Know before you go.'},
  {title: 'Never miss an update', sub: 'Notifications, neatly counted.'},
  {title: 'Friends, one tap away', sub: 'Stay close to who matters.'},
];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 7–23s: the app's home screen, one feature spotlighted at a time.
export const Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const beatFrame = features.map((_, i) => frame - (BEAT_START + i * BEAT_LEN));
  const focusOf = (i: number) => {
    const s = BEAT_START + i * BEAT_LEN;
    const e = s + BEAT_LEN;
    const up = interpolate(frame, [s - 6, s + 6], [0, 1], clamp);
    const down = i === features.length - 1 ? 1 : interpolate(frame, [e - 6, e + 6], [1, 0], clamp);
    return Math.min(up, down);
  };
  const focus = {
    greeting: focusOf(0),
    weather: focusOf(1),
    notifications: focusOf(2),
    people: focusOf(3),
  };

  const enter = spring({frame: frame - 8, fps, config: {damping: 16, mass: 0.9}});
  const float = Math.sin(frame / 28) * 8;

  return (
    <AbsoluteFill>
      {features.map((f, i) => {
        const s = BEAT_START + i * BEAT_LEN;
        const inT = spring({frame: frame - s, fps, config: {damping: 16}});
        const out =
          i === features.length - 1 ? 1 : interpolate(frame, [s + BEAT_LEN - 10, s + BEAT_LEN], [1, 0], clamp);
        const visible = frame >= s - 1 && out > 0;
        if (!visible) return null;
        return (
          <div
            key={f.title}
            style={{
              position: 'absolute',
              top: 170,
              left: 70,
              right: 70,
              textAlign: 'center',
              opacity: inT * out,
              transform: `translateY(${(1 - inT) * 60 - (1 - out) * 40}px)`,
            }}
          >
            <div
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: 80,
                whiteSpace: 'nowrap',
                lineHeight: 1.05,
                letterSpacing: -2,
                color: colors.text,
              }}
            >
              {f.title}
            </div>
            <div style={{fontFamily: body, fontSize: 42, color: colors.muted, marginTop: 16}}>
              {f.sub}
            </div>
          </div>
        );
      })}

      {/* Progress through the four features */}
      <div
        style={{
          position: 'absolute',
          top: 395,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 14,
          opacity: interpolate(frame, [BEAT_START, BEAT_START + 10], [0, 1], clamp),
        }}
      >
        {features.map((_, i) => {
          const fill = interpolate(beatFrame[i], [0, BEAT_LEN], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{width: 70, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}
            >
              <div style={{width: `${fill * 100}%`, height: '100%', background: rainbow[i + 1]}} />
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 470,
          left: (1080 - PHONE_W) / 2,
          transform: `translateY(${(1 - enter) * 1400 + float}px)`,
        }}
      >
        <Phone frame={frame} focus={focus} beatFrame={beatFrame} />
      </div>
    </AbsoluteFill>
  );
};
