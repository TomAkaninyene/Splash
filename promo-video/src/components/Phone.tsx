import {interpolate, spring, useVideoConfig} from 'remotion';
import {body, colors, display} from '../theme';
import {Icon} from './icons';

export const PHONE_W = 720;
export const PHONE_H = 1480;
const BEZEL = 18;
const SCREEN_W = PHONE_W - BEZEL * 2;
const SCREEN_H = PHONE_H - BEZEL * 2;
// The app's layout is in dp on a ~360dp-wide screen.
const dp = (v: number) => v * (SCREEN_W / 360);

export type Focus = {
  greeting: number;
  weather: number;
  notifications: number;
  people: number;
};

// A spotlighted element grows slightly and glows; the rest dims while anything is in focus.
const spot = (amount: number, anyFocus: number, glow: string) => ({
  opacity: 1 - 0.65 * Math.max(0, anyFocus - amount),
  transform: `scale(${1 + 0.06 * amount})`,
  filter: amount > 0.01 ? `drop-shadow(0 0 ${28 * amount}px ${glow})` : undefined,
});

const agenda = [
  {time: '07:30', label: 'Morning run', color: colors.teal},
  {time: '10:00', label: 'Team sync', color: colors.lilac},
  {time: '13:00', label: 'Lunch with friends', color: colors.orange},
];

const avatars = [
  {initial: 'A', color: colors.red},
  {initial: 'K', color: colors.orange},
  {initial: 'M', color: colors.teal},
  {initial: 'J', color: colors.blue},
  {initial: '+3', color: '#2A2A40'},
];

/** Home screen of the app (activity_main.xml), restyled for the promo. */
export const Phone: React.FC<{frame: number; focus: Focus; beatFrame: number[]}> = ({
  frame,
  focus,
  beatFrame,
}) => {
  const {fps} = useVideoConfig();
  const any = Math.max(focus.greeting, focus.weather, focus.notifications, focus.people);

  // Greeting types itself out when its beat starts.
  const greetingText = 'Good Morning';
  const typed = Math.round(
    interpolate(beatFrame[0], [0, 18], [0, greetingText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const shownGreeting = greetingText.slice(0, typed);

  const sunSpin = frame * 0.6 + Math.max(0, beatFrame[1]) * 2.5;
  const bellSwing =
    beatFrame[2] > 0 ? Math.sin(beatFrame[2] * 0.7) * 18 * Math.exp(-beatFrame[2] / 30) : 0;
  const count = Math.round(
    interpolate(beatFrame[2], [4, 28], [0, 4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
  );
  const badge = spring({frame: beatFrame[2] - 20, fps, config: {damping: 10}});

  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 96,
        padding: BEZEL,
        background: 'linear-gradient(160deg, #3A3A52 0%, #15151F 40%, #2A2A3C 100%)',
        boxShadow: '0 60px 120px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.12)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: SCREEN_W,
          height: SCREEN_H,
          borderRadius: 78,
          overflow: 'hidden',
          background: '#000',
          fontFamily: body,
          color: '#fff',
        }}
      >
        {/* Status bar + camera */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 60,
            right: 60,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 30,
            fontWeight: 600,
          }}
        >
          <span>7:30</span>
          <svg width={84} height={30} viewBox="0 0 84 30">
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={i * 9} y={22 - i * 6} width={6} height={8 + i * 6} rx={1.5} fill="#fff" />
            ))}
            <rect x={44} y={6} width={34} height={20} rx={5} fill="none" stroke="#fff" strokeWidth={2.5} />
            <rect x={48} y={10} width={22} height={12} rx={2} fill="#fff" />
            <rect x={79.5} y={12} width={3} height={8} rx={1} fill="#fff" />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: SCREEN_W / 2 - 18,
            width: 36,
            height: 36,
            borderRadius: 18,
            background: '#111',
            boxShadow: 'inset 0 0 0 3px #222',
          }}
        />

        {/* Top row: people (left), search + notifications (right) */}
        <div
          style={{
            position: 'absolute',
            top: 110,
            left: dp(20),
            ...spot(focus.people, any, colors.teal),
          }}
        >
          <Icon name="people" size={dp(50)} color="#F5EEEE" />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 110,
            right: dp(20) + dp(50) + dp(20),
            opacity: 1 - 0.65 * any,
          }}
        >
          <Icon name="search" size={dp(50)} color="#FFFFFF" />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 110,
            right: dp(20),
            ...spot(focus.notifications, any, colors.yellow),
          }}
        >
          <div style={{transform: `rotate(${bellSwing}deg)`, transformOrigin: '50% 10%'}}>
            <Icon name="notification" size={dp(50)} color="#FFFFFF" />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 4,
              right: 2,
              width: 40,
              height: 40,
              borderRadius: 20,
              background: colors.red,
              fontSize: 24,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${badge})`,
            }}
          >
            4
          </div>
        </div>

        {/* Greeting */}
        <div
          style={{
            position: 'absolute',
            top: 250,
            left: dp(20),
            transformOrigin: 'left center',
            ...spot(focus.greeting, any, colors.lilac),
          }}
        >
          <div style={{fontSize: 38, fontWeight: 500, color: colors.muted, height: 46}}>
            {shownGreeting}
          </div>
          <div
            style={{
              fontFamily: display,
              fontWeight: 800,
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: -4,
            }}
          >
            TOM
          </div>
        </div>

        {/* Weather */}
        <div
          style={{
            position: 'absolute',
            top: 250,
            right: dp(20),
            width: 220,
            height: 220,
            borderRadius: 40,
            background: '#15151F',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            ...spot(focus.weather, any, colors.yellow),
          }}
        >
          <Icon
            name="sunny"
            size={120}
            color={colors.yellow}
            style={{transform: `rotate(${sunSpin}deg)`}}
          />
          <div style={{fontSize: 30, fontWeight: 600}}>Sunny</div>
        </div>

        {/* Yellow notifications card (CardView #F6F652, 200dp) */}
        <div
          style={{
            position: 'absolute',
            top: 520,
            left: dp(20),
            width: dp(200),
            height: dp(200),
            borderRadius: dp(20),
            background: colors.yellow,
            color: '#000',
            padding: 36,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            ...spot(focus.notifications, any, colors.yellow),
          }}
        >
          <Icon name="notification" size={60} color="#000" />
          <div>
            <div style={{fontFamily: display, fontWeight: 800, fontSize: 170, lineHeight: 0.9}}>
              {count}
            </div>
            <div style={{fontSize: 32, fontWeight: 600}}>new updates</div>
          </div>
        </div>

        {/* Side tiles */}
        <div
          style={{
            position: 'absolute',
            top: 520,
            right: dp(20),
            width: 220,
            height: dp(95),
            borderRadius: 40,
            background: colors.purple,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            opacity: 1 - 0.65 * any,
          }}
        >
          <Icon name="search" size={70} color="#fff" />
          <div style={{fontSize: 28, fontWeight: 600}}>Search</div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 520 + dp(105),
            right: dp(20),
            width: 220,
            height: dp(95),
            borderRadius: 40,
            background: colors.teal,
            color: '#00312C',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            ...spot(focus.people, any, colors.teal),
          }}
        >
          <Icon name="people" size={70} color="#00312C" />
          <div style={{fontSize: 28, fontWeight: 600}}>People</div>
        </div>

        {/* Your people */}
        <div
          style={{
            position: 'absolute',
            top: 960,
            left: dp(20),
            right: dp(20),
            ...spot(focus.people, any, colors.teal),
            transformOrigin: 'left center',
          }}
        >
          <div style={{fontSize: 32, fontWeight: 600, marginBottom: 22}}>Your people</div>
          <div style={{display: 'flex', gap: 20}}>
            {avatars.map((a, i) => {
              const pop = spring({frame: beatFrame[3] - 6 - i * 4, fps, config: {damping: 11}});
              return (
                <div
                  key={a.initial}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    background: a.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: display,
                    fontWeight: 700,
                    fontSize: 40,
                    color: a.color === colors.orange ? '#000' : '#fff',
                    transform: `scale(${pop})`,
                    boxShadow: '0 0 0 5px #000',
                  }}
                >
                  {a.initial}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today */}
        <div
          style={{
            position: 'absolute',
            top: 1170,
            left: dp(20),
            right: dp(20),
            opacity: 1 - 0.65 * any,
          }}
        >
          <div style={{fontSize: 32, fontWeight: 600, marginBottom: 18}}>Today</div>
          {agenda.map((a) => (
            <div
              key={a.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                height: 76,
                marginBottom: 14,
                padding: '0 26px',
                borderRadius: 24,
                background: '#15151F',
                fontSize: 28,
              }}
            >
              <div style={{width: 12, height: 40, borderRadius: 6, background: a.color}} />
              <span style={{color: colors.muted, width: 90}}>{a.time}</span>
              <span style={{fontWeight: 500}}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
