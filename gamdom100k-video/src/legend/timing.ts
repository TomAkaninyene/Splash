import cues from './cues.json';

// Scene timing is derived from the measured voice lines (scripts/measure_vo.py → cues.json), so
// dropping your own recordings into public/vo/legend/mine/ and re-measuring re-times the edit.

export const FPS = 30;

type Line = {file: string; start: number; end: number; mine: boolean};
const lines = cues.lines as Record<string, Line>;
export const steveTakes = cues.steve as {file: string; start: number; mine: boolean}[];

// The ElevenLabs elder is only a guide track, sped up a little; your own recording plays at 1×.
const GUIDE_ELDER_RATE = 1.2;
// ElevenLabs "children" are young adult voices pitched up.
export const KID_PITCH = 1.35;

export type Cue = {
  id: string;
  speaker: string;
  text: string;
  file?: string;
  /** Frame (relative to the scene) where the speech itself starts. */
  at: number;
  /** Frames of speech. */
  len: number;
  rate: number;
  pitch?: number;
  /** Frame where the audio file must start so its speech lands on `at`. */
  audioAt: number;
};

type Step = {id: string; speaker: string; text: string; gap?: number};
type SceneSpec = {name: string; lead: number; steps: Step[]; tail: number; min?: number};

const cue = (step: Step, at: number): Cue => {
  const l = lines[step.id];
  const kid = step.id.startsWith('kid');
  const rate = l && !l.mine && step.id.startsWith('elder') ? GUIDE_ELDER_RATE : 1;
  // Placeholder length (captions only) when a line has no audio yet.
  const len = l ? Math.ceil(((l.end - l.start) / rate) * FPS) : Math.max(45, step.text.length * 2);
  return {
    ...step,
    file: l?.file,
    at,
    len,
    rate,
    pitch: kid && l && !l.mine ? KID_PITCH : undefined,
    audioAt: l ? at - Math.round((l.start / rate) * FPS) : at,
  };
};

const SPECS: SceneSpec[] = [
  {
    name: 'fire',
    lead: 14,
    steps: [
      {id: 'elder-gather', speaker: 'ELDER', text: 'Children… gather round. Tonight I will tell you how Gamdom found its chosen one.'},
      {id: 'kid-code', speaker: 'CHILD', text: 'Is it the one about the code?', gap: 4},
      {id: 'elder-spoil', speaker: 'ELDER', text: "Don't spoil it.", gap: 6},
    ],
    tail: 12,
  },
  {
    name: 'dark',
    lead: 18,
    steps: [{id: 'elder-dark', speaker: 'ELDER', text: 'Long ago, Gamdom was strong… but not number one. The elders consulted the oracle.'}],
    tail: 20,
  },
  {
    name: 'prophecy',
    lead: 30,
    steps: [{id: 'elder-prophecy', speaker: 'ELDER', text: 'The prophecy said: one day, a man would come… who would do anything.'}],
    tail: 10,
  },
  {
    name: 'false',
    lead: 16,
    steps: [{id: 'elder-false', speaker: 'ELDER', text: 'Many came. Many… spelled it wrong.'}],
    tail: 12,
    // Three failed attempts need room even if the line is short.
    min: 105,
  },
  {
    name: 'there',
    lead: 6,
    steps: [
      {id: 'kid-there', speaker: 'CHILD', text: 'Grandpa, were you there?'},
      // The pause before the answer is the joke.
      {id: 'elder-it', speaker: 'ELDER', text: "…I was the oracle's IT guy.", gap: 16},
    ],
    tail: 14,
  },
  {
    name: 'trials',
    lead: 6,
    steps: [{id: 'elder-trials', speaker: 'ELDER', text: 'He crossed the Mines… he tamed the Crash… he changed the rules… three times.'}],
    tail: 12,
  },
  {
    name: 'why',
    lead: 4,
    steps: [
      {id: 'kid-why', speaker: 'CHILD', text: 'Why three times?'},
      {id: 'elder-nobody', speaker: 'ELDER', text: 'Nobody knows.', gap: 8},
    ],
    tail: 14,
  },
  {
    name: 'crowning',
    lead: 18,
    steps: [{id: 'elder-written', speaker: 'ELDER', text: 'And so it was written: Gamdom… to number one.'}],
    tail: 26,
  },
  {
    name: 'endcard',
    lead: 14,
    steps: [{id: 'elder-code', speaker: 'ELDER', text: 'Sign up with code STEVE.'}],
    tail: 14,
    min: 84,
  },
  {
    name: 'stinger',
    lead: 20,
    steps: [{id: 'kid-wake', speaker: 'CHILD', text: 'Wait… what was the code?'}],
    // Room shout (~1 s) + a beat of logo before the callback.
    tail: 4 + 34 + 22,
  },
  {
    name: 'callback',
    lead: 16,
    steps: [{id: 'elder-four', speaker: 'ELDER', text: '…Four times.'}],
    // Hold the final frame (code + 18+) so it also works as the thumbnail.
    tail: 40,
  },
];

export type Scene = {name: string; from: number; dur: number; cues: Cue[]; lastCueEnd: number};

const build = () => {
  let from = 0;
  const scenes: Scene[] = [];
  for (const spec of SPECS) {
    let t = spec.lead;
    const cs: Cue[] = [];
    for (const step of spec.steps) {
      t += step.gap ?? 0;
      const c = cue(step, t);
      cs.push(c);
      t = c.at + c.len;
    }
    const dur = Math.max(spec.min ?? 0, t + spec.tail);
    scenes.push({name: spec.name, from, dur, cues: cs, lastCueEnd: t});
    from += dur;
  }
  return {scenes, total: from};
};

export const {scenes: SCENES, total: LEGEND_DURATION} = build();
export const scene = (name: string) => SCENES.find((s) => s.name === name)!;
