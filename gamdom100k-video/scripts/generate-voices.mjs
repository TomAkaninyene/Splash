// Generates the ElevenLabs voice lines into public/vo/.
//
// Key: read from ELEVENLABS_API_KEY or ~/.config/gamdom100k/elevenlabs.env (never from the repo).
// The key is never printed or logged.
//
//   node scripts/generate-voices.mjs            # checks the plan licence, stops on the free tier
//   node scripts/generate-voices.mjs --go       # generate after you've confirmed the licence is OK
//
// Each line gets several takes in public/vo/takes/; the take whose length best fits its slot in
// the edit is copied to public/vo/<name>.mp3. Swap by copying a different take over it.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const API = 'https://api.elevenlabs.io';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const VO = path.join(ROOT, 'public', 'vo');
const TAKES = path.join(VO, 'takes');
const GO = process.argv.includes('--go');
// --only=auntie,steve limits generation to those groups (names of LINES entries, or 'nooo' / 'steve').
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7).split(',').filter(Boolean);
const wanted = (name) => !ONLY.length || ONLY.some((o) => name.startsWith(o));

const loadKey = () => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const file = path.join(os.homedir(), '.config', 'gamdom100k', 'elevenlabs.env');
  if (fs.existsSync(file)) {
    const m = fs.readFileSync(file, 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  }
  throw new Error('No ElevenLabs key found (ELEVENLABS_API_KEY or ~/.config/gamdom100k/elevenlabs.env).');
};
const KEY = loadKey();

const api = async (method, url, body) => {
  const res = await fetch(API + url, {
    method,
    headers: {'xi-api-key': KEY, ...(body ? {'Content-Type': 'application/json'} : {})},
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
};
const errText = async (res) => `${res.status} ${(await res.text()).slice(0, 300)}`;

// Lines: v3 text uses audio tags; they're stripped for the v2 fallback.
// slot = seconds available in the edit, used to pick the best-fitting take.
const LINES = [
  {name: 'commander-launch', role: 'commander', takes: 3, slot: 1.8, text: '[serious] [deep voice] Enter the launch code.'},
  {name: 'tech-steve', role: 'tech', takes: 3, slot: 3.0, text: '[panicked] [shouting] S! T! E! V! E!'},
  {name: 'commander-number-one', role: 'commander', takes: 3, slot: 1.8, text: '[dramatic] [slowly] Gamdom... to number one.'},
  {name: 'commander-code', role: 'commander', takes: 3, slot: 1.4, text: '[confident] Code STEVE.'},
  {name: 'alien', role: 'alien', takes: 2, slot: 0.9, text: '[confused] ...what was the code?'},
  {name: 'auntie', role: 'auntie', takes: 3, slot: 1.3, text: '[strong Nigerian accent] [shouting] [exasperated] Will you PRESS IT!'},
];
// The room shouting the code in the stinger: one take per voice, layered in the edit.
const STEVE = {text: '[shouting] [excited] STEEEEVE!', voices: 6};
const NOOO = {text: '[groaning] [frustrated] Nooo!', slot: 1.3};

// Premade voice preferences by role; falls back to label matching, then any premade voice.
const PREFS = {
  commander: {names: ['Brian', 'Bill', 'Arnold', 'Adam', 'Clyde', 'George', 'Daniel'], gender: 'male', ages: ['middle_aged', 'old']},
  tech: {names: ['Liam', 'Charlie', 'Callum', 'Will', 'Jeremy', 'Josh'], gender: 'male', ages: ['young']},
  alien: {names: ['Jessica', 'Laura', 'Charlotte', 'Lily', 'Freya', 'Gigi'], gender: 'female', ages: ['young']},
  auntie: {names: ['Matilda', 'Alice', 'Bella', 'Lily'], gender: 'female', ages: ['middle_aged', 'old']},
};

const duration = (file) =>
  parseFloat(
    execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {cwd: ROOT})
      .toString()
      .trim()
  );

let MODEL = 'eleven_v3';
const tts = async (voiceId, text, out) => {
  const body = (model) => ({
    text: model === 'eleven_v3' ? text : text.replace(/\[[^\]]*\]\s*/g, ''),
    model_id: model,
    ...(model === 'eleven_v3' ? {} : {voice_settings: {stability: 0.3, similarity_boost: 0.75, style: 0.6}}),
  });
  let res = await api('POST', `/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, body(MODEL));
  if (!res.ok && MODEL === 'eleven_v3' && [400, 403, 422].includes(res.status)) {
    console.log(`eleven_v3 unavailable (${res.status}); falling back to eleven_multilingual_v2`);
    MODEL = 'eleven_multilingual_v2';
    res = await api('POST', `/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, body(MODEL));
  }
  if (!res.ok) throw new Error(`TTS failed for ${path.basename(out)}: ${await errText(res)}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
};

const main = async () => {
  // 1. Licence check.
  const sub = await api('GET', '/v1/user/subscription');
  if (sub.ok) {
    const s = await sub.json();
    console.log(`Plan: ${s.tier} · characters used ${s.character_count}/${s.character_limit}`);
    if (s.tier === 'free' && !GO) {
      console.log('Free tier: ElevenLabs free-plan audio is not licensed for commercial use and needs attribution.');
      console.log('Stopping before generating. Re-run with --go once you have decided that is acceptable.');
      return;
    }
  } else {
    console.log(`Could not read the plan (${sub.status}); the key may lack the user_read permission.`);
    if (!GO) {
      console.log('Check the plan on elevenlabs.io, then re-run with --go.');
      return;
    }
  }

  // 2. Pick premade voices.
  const vr = await api('GET', '/v1/voices');
  if (!vr.ok) throw new Error(`Listing voices failed: ${await errText(vr)}`);
  const premade = (await vr.json()).voices.filter((v) => v.category === 'premade');
  if (!premade.length) throw new Error('No premade voices available on this account.');
  const used = new Set();
  const pick = (role) => {
    const p = PREFS[role];
    const byName = p.names.map((n) => premade.find((v) => v.name.split(' ')[0] === n && !used.has(v.voice_id))).find(Boolean);
    const byLabel = premade.find((v) => !used.has(v.voice_id) && v.labels?.gender === p.gender && p.ages.includes(v.labels?.age));
    const v = byName ?? byLabel ?? premade.find((x) => !used.has(x.voice_id)) ?? premade[0];
    used.add(v.voice_id);
    return v;
  };
  const voices = {commander: pick('commander'), tech: pick('tech'), alien: pick('alien'), auntie: pick('auntie')};
  for (const [role, v] of Object.entries(voices)) console.log(`${role}: ${v.name}`);

  fs.mkdirSync(TAKES, {recursive: true});

  // 3. Lines with multiple takes; keep the take that best fits its slot.
  for (const line of LINES.filter((l) => wanted(l.name))) {
    const takes = [];
    for (let i = 1; i <= line.takes; i++) {
      const out = path.join(TAKES, `${line.name}-${i}.mp3`);
      await tts(voices[line.role].voice_id, line.text, out);
      takes.push({out, d: duration(out)});
    }
    const best = takes.reduce((a, b) => (Math.abs(b.d - line.slot) < Math.abs(a.d - line.slot) ? b : a));
    fs.copyFileSync(best.out, path.join(VO, `${line.name}.mp3`));
    console.log(`${line.name}: ${takes.map((t) => t.d.toFixed(2) + 's').join(', ')} → using ${path.basename(best.out)}`);
  }

  // 4. "Nooo!" in four different voices, layered in the edit.
  const others = premade.filter((v) => !Object.values(voices).some((x) => x.voice_id === v.voice_id));
  const groaners = wanted('nooo') ? [...others.slice(0, 3), voices.tech].slice(0, 4) : [];
  for (let i = 0; i < groaners.length; i++) {
    const out = path.join(VO, `nooo-${i + 1}.mp3`);
    await tts(groaners[i].voice_id, NOOO.text, out);
    console.log(`nooo-${i + 1}: ${groaners[i].name} (${duration(out).toFixed(2)}s)`);
  }
  // 5. "STEEEVE!" from the whole room.
  if (wanted('steve')) {
    const shouters = [voices.commander, voices.tech, voices.auntie, ...others].slice(0, STEVE.voices);
    for (let i = 0; i < shouters.length; i++) {
      const out = path.join(VO, `steve-${i + 1}.mp3`);
      await tts(shouters[i].voice_id, STEVE.text, out);
      console.log(`steve-${i + 1}: ${shouters[i].name.split(' ')[0]} (${duration(out).toFixed(2)}s)`);
    }
  }
  console.log(`Done with model ${MODEL}. Re-render to hear them: npm run render`);
};

main().catch((e) => {
  console.error(String(e.message ?? e).replaceAll(KEY, '[redacted]'));
  process.exit(1);
});
