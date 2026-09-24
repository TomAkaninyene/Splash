import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Flag, GamdomLogo} from '../components/Brand';
import {Caption} from '../components/Caption';
import {Sfx} from '../components/audio';
import {Shake} from '../components/fx';
import {CrashGraph} from '../components/Space';
import {colors, body, impact} from '../theme';
import {EndCardContent} from '../scenes/S7EndCard';
import {clamp, lerp} from '../scenes/common';
import {Hero} from './Hero';
import {Backdrop, Ground, INK, Leaderboard, Lightning, Oracle, serif, UpdateScreen, Villager} from './Storybook';
import {Cue, scene, steveTakes} from './timing';
import {FIRE_X, FIRE_Y, VillageScene, Who} from './Village';

const cueOf = (name: string, id: string) => scene(name).cues.find((c) => c.id === id)!;
const during = (f: number, c: Cue, pad = 0) => f >= c.at - pad && f <= c.at + c.len + pad;

/** Voice + caption for one cue. Captions double as placeholders when a line has no audio yet. */
const Line: React.FC<{c: Cue; color?: string; big?: boolean; y?: number; noCaption?: boolean}> = ({c, color, big, y, noCaption}) => (
  <>
    {c.file && (
      <Sequence from={c.audioAt} layout="none" name={c.id}>
        <Audio src={staticFile(c.file)} playbackRate={c.rate} toneFrequency={c.pitch} />
      </Sequence>
    )}
    {!noCaption && <Caption from={c.at} to={c.at + c.len + 10} speaker={c.speaker} text={c.text} color={color ?? (c.speaker === 'CHILD' ? '#7fd6ff' : colors.amber)} big={big} y={y} />}
  </>
);

const Ambience: React.FC<{dur: number; crickets?: boolean}> = ({dur, crickets}) => (
  <>
    <Sfx name="crackle" at={0} volume={0.45} duration={dur} />
    {crickets && <Sfx name="crickets" at={0} volume={0.5} duration={dur} />}
  </>
);

const Plaque: React.FC<{text: string; f: number}> = ({text, f}) => (
  <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', opacity: lerp(f, 0, 8, 0, 1)}}>
    <div style={{display: 'inline-block', padding: '14px 40px', background: INK, color: '#ffd98f', fontFamily: serif, fontWeight: 700, fontSize: 46, letterSpacing: 4, borderRadius: 8}}>{text}</div>
  </div>
);

/** Smoke billowing up from the fire to carry us into (or out of) the story. */
const Smoke: React.FC<{t: number; out?: boolean}> = ({t, out}) => {
  const k = out ? 1 - t : t;
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 16}).map((_, i) => {
        const r = 200 + (i % 4) * 120;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: FIRE_X - r + Math.sin(i * 2.1) * 380 * k,
              top: FIRE_Y - r - k * (300 + i * 90),
              width: r * 2 * (0.4 + k),
              height: r * 2 * (0.4 + k),
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(235,215,190,0.95) 0%, rgba(210,180,150,0.6) 45%, transparent 70%)',
              opacity: Math.min(1, k * 1.4),
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: '#e8d5b8', opacity: Math.max(0, k - 0.55) * 2}} />
    </AbsoluteFill>
  );
};

// ---------- 1. The fire ----------
export const FireScene: React.FC = () => {
  const f = useCurrentFrame();
  const s = scene('fire');
  const gather = cueOf('fire', 'elder-gather');
  const ask = cueOf('fire', 'kid-code');
  const spoil = cueOf('fire', 'elder-spoil');
  const glare = f >= spoil.at - 4;
  const asking = during(f, ask, 4);
  const neutral: Who = {expr: 'neutral', pose: 'down'};
  const title = Math.min(lerp(f, 2, 22, 0, 1), lerp(f, gather.at + 50, gather.at + 70, 1, 0));
  return (
    <AbsoluteFill>
      <VillageScene
        elder={{expr: glare ? 'angry' : 'neutral', pose: glare || during(f, gather) ? 'point' : 'down'}}
        kids={[neutral, asking ? {expr: 'happy', pose: 'up'} : glare ? {expr: 'groan', pose: 'down'} : neutral, neutral, neutral]}
      />
      <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', opacity: title}}>
        <div style={{fontFamily: serif, fontWeight: 900, fontSize: 84, lineHeight: 1.05, color: '#ffe3b0', letterSpacing: 4, textShadow: '0 0 30px rgba(255,160,60,0.8)'}}>
          TALES BY
          <br />
          GAMDOM LIGHT
        </div>
        <div style={{marginTop: 18, fontFamily: serif, fontWeight: 600, fontSize: 44, color: colors.brand, letterSpacing: 6, textShadow: `0 0 20px ${colors.brand}88`}}>THE LEGEND OF STEVE</div>
      </div>
      <Smoke t={lerp(f, s.dur - 24, s.dur, 0, 1)} />
      {s.cues.map((c) => (
        <Line key={c.id} c={c} />
      ))}
      <Ambience dur={s.dur} crickets />
      <Sfx name="passby" at={s.dur - 24} volume={0.5} />
    </AbsoluteFill>
  );
};

// ---------- 2. The dark times ----------
export const DarkScene: React.FC = () => {
  const f = useCurrentFrame();
  const s = scene('dark');
  const c = s.cues[0];
  const toOracle = c.at + Math.round(c.len * 0.55);
  const mix = lerp(f, toOracle, toOracle + 10, 0, 1);
  return (
    <AbsoluteFill>
      <Backdrop glow="#f7c77a">
        <AbsoluteFill style={{opacity: 1 - mix}}>
          <Leaderboard castle={0} rain={1} />
          <Ground y={1560} />
        </AbsoluteFill>
        <AbsoluteFill style={{opacity: mix}}>
          <OracleSet f={f} progress={lerp(f, toOracle, s.dur, 0, 0.62)} done={false} />
        </AbsoluteFill>
      </Backdrop>
      <Smoke t={lerp(f, 0, 26, 0, 1)} out />
      <Line c={c} />
      <Sfx name="crickets" at={0} volume={0.25} duration={s.dur} />
    </AbsoluteFill>
  );
};

const OracleSet: React.FC<{f: number; progress: number; done: boolean; awe?: boolean}> = ({f, progress, done, awe}) => (
  <>
    <Oracle x={330} y={930} screen={<UpdateScreen progress={progress} done={done} />} glow={done ? 1.6 : 0.8} />
    {/* Elders waiting on the update; one taps his foot */}
    <Villager x={40} y={1190 + (awe ? 0 : Math.abs(Math.sin(f / 4)) * -6)} w={210} expr={awe ? 'shock' : 'groan'} pose={awe ? 'up' : 'hips'} />
    <Villager x={790} y={1180} w={220} expr={awe ? 'shock' : 'neutral'} pose={awe ? 'up' : 'down'} wrap />
    <Ground y={1560} />
  </>
);

// ---------- 3. The prophecy ----------
export const ProphecyScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = scene('prophecy');
  const DONE = 16;
  const BOLT = 20;
  const RISE = 26;
  return (
    <AbsoluteFill>
      <Shake hits={[BOLT]} strength={24}>
        <Backdrop glow={f >= BOLT ? '#d9ffe9' : '#f7c77a'}>
          <OracleSet f={f} progress={lerp(f, 0, DONE, 0.62, 1)} done={f >= DONE} awe={f >= BOLT} />
          {'STEVE'.split('').map((l, i) => {
            const t = spring({frame: f - RISE - i * 6, fps, config: {damping: 16, mass: 1.2}});
            const x = 540 + (i - 2) * 175;
            const y = 1000 - t * (560 + 90 * Math.cos(((i - 2) / 2) * 1.2));
            if (f < RISE + i * 6) return null;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 540 + (x - 540) * t - 80,
                  top: y,
                  width: 160,
                  textAlign: 'center',
                  fontFamily: serif,
                  fontWeight: 900,
                  fontSize: 190,
                  color: '#eafff3',
                  textShadow: `0 0 30px ${colors.brand}, 0 0 70px ${colors.brand}, 0 0 4px #fff`,
                  opacity: Math.min(1, t * 2),
                  transform: `scale(${0.4 + 0.6 * t})`,
                }}
              >
                {l}
              </div>
            );
          })}
        </Backdrop>
      </Shake>
      <Lightning x={540} y={930} t={f - BOLT} />
      <Line c={s.cues[0]} />
      <Sfx name="ding" at={DONE} volume={0.5} />
      <Sfx name="thunder" at={BOLT} />
      <Sfx name="shimmer" at={RISE} volume={0.8} />
    </AbsoluteFill>
  );
};

// ---------- 4. The trials ----------
const MinesTrial: React.FC<{f: number; len: number}> = ({f, len}) => {
  const tiles = 6;
  const hopLen = len / (tiles + 1);
  const hop = Math.min(tiles, Math.floor(f / hopLen));
  const t = (f % hopLen) / hopLen;
  const tileX = (i: number) => 90 + i * 155;
  const fromX = hop === 0 ? -60 : tileX(hop - 1);
  const toX = hop >= tiles ? 1150 : tileX(hop);
  const x = fromX + (toX - fromX) * t;
  const y = 1080 - Math.sin(Math.PI * t) * 180;
  return (
    <Backdrop glow="#ffe0a0">
      <Plaque text="I · THE RIVER OF MINES" f={f} />
      {/* River */}
      <div style={{position: 'absolute', left: 0, top: 1240, width: 1080, height: 360, background: 'linear-gradient(180deg, #2a1208, #140806)'}} />
      {[0, 1, 2].map((r) => (
        <svg key={r} style={{position: 'absolute', left: 0, top: 1300 + r * 90}} width={1080} height={40}>
          <path d={`M0 20 ${Array.from({length: 20}, (_, i) => `Q${i * 60 + 30 - ((f * 3) % 60)} ${i % 2 ? 5 : 35} ${i * 60 + 60 - ((f * 3) % 60)} 20`).join(' ')}`} stroke="#8a4a1c" strokeWidth={4} fill="none" opacity={0.6} />
        </svg>
      ))}
      {/* Tiles he steps on flip to gems; the bomb tiles below stay untouched */}
      {Array.from({length: tiles}).map((_, i) => {
        const landed = hop > i || (hop === i && t > 0.9);
        return (
          <div key={i}>
            <div style={{position: 'absolute', left: tileX(i) - 60, top: 1250, width: 120, height: 60, borderRadius: 10, background: landed ? '#0d2a1a' : INK, border: `4px solid ${landed ? colors.brand : '#3d1d0c'}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {landed && <div style={{width: 30, height: 30, background: colors.brand, transform: 'rotate(45deg)', boxShadow: `0 0 20px ${colors.brand}`}} />}
            </div>
            <div style={{position: 'absolute', left: tileX(i) - 60 + (i % 2) * 20, top: 1400, width: 120, height: 60, borderRadius: 10, background: INK, border: '4px solid #3d1d0c', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: 34, height: 34, borderRadius: '50%', background: '#2a0c06', boxShadow: `0 0 ${10 + 8 * Math.sin(f / 3 + i)}px ${colors.red}`}} />
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: x - 60, top: y}}>
        <Hero height={200} pose={t > 0.1 && t < 0.9 ? 'jump' : 'stand'} phase={f / 3} />
      </div>
    </Backdrop>
  );
};

const CrashTrial: React.FC<{f: number; len: number}> = ({f, len}) => {
  const jump = len * 0.72;
  const boom = len * 0.8;
  const m = Math.exp(Math.log(8) * Math.min(1, f / boom));
  const crashed = f >= boom;
  const jt = Math.max(0, (f - jump) / (len - jump));
  return (
    <Backdrop glow="#ffc77a">
      <Plaque text="II · THE CRASH" f={f} />
      <div style={{position: 'absolute', left: 0, top: 420}}>
        <CrashGraph w={1080} h={1100} m={m} frame={f} crashed={crashed} rocket={!crashed} rocketSize={260} showAxes={false} />
      </div>
      <div style={{position: 'absolute', top: 290, width: '100%', textAlign: 'center', fontFamily: impact, fontSize: 130, color: crashed ? colors.red : INK}}>{m.toFixed(2)}x</div>
      {/* The hero surfs the rocket, then leaps clear just before it goes */}
      <div
        style={{
          position: 'absolute',
          left: f < jump ? 700 : 700 - jt * 380,
          top: f < jump ? 640 + (1 - Math.min(1, f / boom)) * 520 : 640 - Math.sin(Math.PI * Math.min(1, jt * 1.4)) * 220 + jt * 160,
        }}
      >
        <Hero height={170} pose={f < jump ? 'surf' : 'jump'} phase={f / 3} />
      </div>
      {f >= jump && (
        <div style={{position: 'absolute', left: 240, top: 560, fontFamily: serif, fontWeight: 900, fontSize: 48, color: colors.brand, background: INK, padding: '8px 20px', borderRadius: 8, opacity: lerp(f, jump, jump + 5, 0, 1)}}>
          CASHED OUT
        </div>
      )}
      {crashed && (
        <div style={{position: 'absolute', left: 820 - 260, top: 640 - 260, width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, #fff6c2 0%, ${colors.amber} 30%, ${colors.red}88 55%, transparent 70%)`, transform: `scale(${lerp(f, boom, boom + 8, 0.2, 1.2)})`, opacity: lerp(f, boom + 6, len + 6, 1, 0)}} />
      )}
    </Backdrop>
  );
};

const RulesTrial: React.FC<{f: number; len: number}> = ({f, len}) => {
  const stamps = [0.18, 0.45, 0.72].map((p) => Math.round(p * len));
  const labels = ['UPDATED', 'UPDATED AGAIN', 'UPDATED AGAIN (AGAIN)'];
  return (
    <Backdrop glow="#ffe0a0">
      <Plaque text="III · THE RULES" f={f} />
      {/* Scroll */}
      <div style={{position: 'absolute', left: 170, top: 330, width: 740, height: 760, background: '#f3dfb4', borderRadius: 18, boxShadow: `inset 0 0 60px rgba(120,60,20,0.5), 0 0 0 14px ${INK}`}}>
        <div style={{textAlign: 'center', fontFamily: serif, fontWeight: 900, fontSize: 60, color: INK, marginTop: 40}}>CONTEST RULES</div>
        {Array.from({length: 7}).map((_, i) => (
          <div key={i} style={{margin: '26px 70px 0', height: 14, borderRadius: 7, background: 'rgba(20,8,6,0.35)', width: `${60 + ((i * 29) % 30)}%`}} />
        ))}
        {stamps.map((st, i) =>
          f >= st ? (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 60 + i * 30,
                top: 260 + i * 150,
                fontFamily: impact,
                fontSize: 64,
                color: colors.red,
                border: `8px solid ${colors.red}`,
                borderRadius: 12,
                padding: '0 18px',
                transform: `rotate(${-14 + i * 9}deg) scale(${lerp(f, st, st + 4, 1.8, 1)})`,
                opacity: 0.9,
              }}
            >
              {labels[i]}
            </div>
          ) : null
        )}
      </div>
      {/* Villagers faint, one per update */}
      {[60, 380, 760].map((x, i) => (
        <Villager key={x} x={x} y={1215} w={200} expr={f >= stamps[i] ? 'shock' : 'neutral'} pose={f >= stamps[i] ? 'up' : 'down'} faint={lerp(f, stamps[i] + 3, stamps[i] + 12, 0, 1)} wrap={i === 1} />
      ))}
      <Ground y={1560} />
      <div style={{position: 'absolute', left: 470, top: 1220}}>
        <Hero height={300} pose={stamps.some((st) => f >= st - 4 && f < st + 3) ? 'raise' : 'stand'} phase={f / 5} />
      </div>
    </Backdrop>
  );
};

export const TrialsScene: React.FC = () => {
  const f = useCurrentFrame();
  const s = scene('trials');
  const c = s.cues[0];
  const b1 = c.at + Math.round(c.len * 0.34);
  const b2 = c.at + Math.round(c.len * 0.6);
  return (
    <AbsoluteFill>
      {f < b1 && <MinesTrial f={f} len={b1} />}
      {f >= b1 && f < b2 && <CrashTrial f={f - b1} len={b2 - b1} />}
      {f >= b2 && <RulesTrial f={f - b2} len={s.dur - b2} />}
      <Line c={c} noCaption />
      <Caption from={c.at} to={b1 - 1} speaker="ELDER" text="He crossed the Mines…" color={colors.amber} />
      <Caption from={b1} to={b2 - 1} speaker="ELDER" text="…he tamed the Crash…" color={colors.amber} />
      <Caption from={b2} to={c.at + c.len + 10} speaker="ELDER" text="…he changed the rules… three times." color={colors.amber} />
      {Array.from({length: 7}).map((_, i) => (
        <Sequence key={i} from={Math.round(((i + 1) * b1) / 7) - 2} layout="none">
          <Sfx name={i < 6 ? 'ding' : 'hop'} at={0} volume={0.35} />
        </Sequence>
      ))}
      <Sfx name="rumble" at={b1} volume={0.4} duration={b2 - b1} />
      <Sfx name="explosion" at={b1 + Math.round((b2 - b1) * 0.8)} volume={0.7} />
      {[0.18, 0.45, 0.72].map((p, i) => {
        const st = b2 + Math.round(p * (s.dur - b2));
        return (
          <Sequence key={i} from={st} layout="none">
            <Sfx name="stamp" at={0} volume={0.8} />
            <Sfx name="bodyfall" at={10} volume={0.8} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 4b. "Why three times?" ----------
export const WhyScene: React.FC = () => {
  const f = useCurrentFrame();
  const s = scene('why');
  const [why, nobody] = s.cues;
  const neutral: Who = {expr: 'neutral', pose: 'down'};
  return (
    <AbsoluteFill>
      <VillageScene
        elder={{expr: 'neutral', pose: 'down'}}
        kids={[neutral, neutral, during(f, why, 4) ? {expr: 'neutral', pose: 'up'} : neutral, neutral]}
      />
      <Line c={why} />
      <Line c={nobody} />
      <Ambience dur={s.dur} crickets />
      {/* Awkward silence: the crickets get louder after 'Nobody knows.' */}
      <Sfx name="crickets" at={nobody.at + nobody.len} volume={0.9} />
    </AbsoluteFill>
  );
};

// ---------- 5. The crowning ----------
export const CrowningScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = scene('crowning');
  const c = s.cues[0];
  const rise = interpolate(f, [c.at, c.at + c.len * 0.6], [0, 1], {...clamp});
  const flag = spring({frame: f - 6, fps, config: {damping: 11}});
  return (
    <AbsoluteFill>
      <Backdrop glow="#fff0b8">
        {/* Flag sits behind the castle so the castle stays the star */}
        <div style={{position: 'absolute', left: 415, top: 960 - 468 * 0.9, transformOrigin: 'bottom left', transform: `scaleY(${flag})`}}>
          <Flag wave={f / 4} scale={0.9} />
        </div>
        <Leaderboard castle={rise} rain={1 - rise} rays={rise} />
        {/* The hero on top of #1 plants the Gamdom flag */}
        <div style={{position: 'absolute', left: 600, top: 960 - 170}}>
          <Hero height={170} pose={f < 14 ? 'raise' : 'stand'} phase={f / 5} />
        </div>
        {/* Village celebration */}
        {[20, 230, 700, 880].map((x, i) => (
          <Villager key={x} x={x} y={1330 + Math.abs(Math.sin(f / 5 + i)) * -30} w={170} expr="happy" pose="up" wrap={i % 2 === 1} />
        ))}
        <Ground y={1600} />
      </Backdrop>
      <Line c={c} color={colors.brand} />
      <Sfx name="flag" at={6} />
      <Sfx name="drums" at={0} volume={0.9} />
      <Sfx name="sting" at={c.at + Math.round(c.len * 0.6)} volume={0.5} />
      <Sfx name="crowd" at={c.at + Math.round(c.len * 0.6)} volume={0.35} />
    </AbsoluteFill>
  );
};

// ---------- 6. End card ----------
export const EndScene: React.FC = () => {
  const f = useCurrentFrame();
  const s = scene('endcard');
  return (
    <AbsoluteFill>
      <EndCardContent f={f} />
      <Line c={s.cues[0]} color={colors.brand} y={1420} />
      {[8, 11, 14, 17, 20].map((d) => (
        <Sfx key={d} name="slam" at={d} volume={0.35} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- 7. Stinger ----------
export const StingerScene: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = scene('stinger');
  const wake = s.cues[0];
  const WAKE = 18;
  const SHOUT = s.lastCueEnd + 4;
  const STING = SHOUT + 34;
  const shout = f >= SHOUT;
  const pop = spring({frame: f - SHOUT, fps, config: {damping: 8}});
  const k = spring({frame: f - STING, fps, config: {damping: 12}});
  const scream: Who = {expr: 'scream', pose: 'up'};
  const idle: Who = {expr: 'neutral', pose: 'down'};
  if (f >= STING) {
    return (
      <AbsoluteFill style={{background: colors.night, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${0.6 + 0.4 * k})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <GamdomLogo height={120} />
          <div style={{marginTop: 60, fontFamily: impact, fontSize: 130, color: colors.brand, letterSpacing: 6}}>CODE STEVE</div>
          <div style={{marginTop: 30, fontFamily: body, fontWeight: 800, fontSize: 44, color: colors.muted}}>gamdom.com · 18+ · Play responsibly</div>
        </div>
        <Sfx name="sting" at={0} volume={0.5} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Shake hits={shout ? [SHOUT, SHOUT + 5] : []} strength={30}>
        <VillageScene
          elder={shout ? scream : idle}
          kids={shout ? [scream, scream, scream, scream] : [idle, idle, idle, f >= WAKE ? {expr: 'shock', pose: 'down'} : idle]}
          doze={{kid: 3, amount: f < WAKE ? 1 : lerp(f, WAKE, WAKE + 4, 1, 0)}}
          flare={shout ? lerp(f, SHOUT, SHOUT + 6, 0, 1) : 0}
        />
        {shout && (
          <div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', fontFamily: serif, fontWeight: 900, fontSize: 190, color: '#eafff3', letterSpacing: 6, textShadow: `0 0 40px ${colors.brand}, 0 0 90px ${colors.brand}`, transform: `scale(${0.4 + 0.6 * pop})`}}>
            STEVE!
          </div>
        )}
      </Shake>
      {f < WAKE && <div style={{position: 'absolute', left: 820, top: 1120, fontFamily: serif, fontSize: 60, color: '#ffe3b0', opacity: 0.8}}>z z z</div>}
      <Line c={wake} />
      <Caption from={SHOUT} to={STING - 1} speaker="EVERYONE" text="STEVE!" big color={colors.brand} />
      <Ambience dur={STING} />
      {steveTakes.map((t, i) => (
        <Sequence key={t.file} from={SHOUT + i * 2 - Math.round(t.start * 30)} layout="none">
          <Audio src={staticFile(t.file)} volume={t.mine ? 0.7 : 0.45} toneFrequency={t.mine ? undefined : 1.3} />
        </Sequence>
      ))}
      <Sfx name="crowd" at={SHOUT} volume={0.4} />
      <Sfx name="launch" at={SHOUT} volume={0.4} />
    </AbsoluteFill>
  );
};
