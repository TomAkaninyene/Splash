// Voices for "TALES BY GAMDOM LIGHT" into public/vo/legend/. Same key handling as generate-voices.mjs
// (ELEVENLABS_API_KEY or ~/.config/gamdom100k/elevenlabs.env; never printed).
// Run: NODE_USE_ENV_PROXY=1 node scripts/generate-legend-voices.mjs
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const API = 'https://api.elevenlabs.io';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public', 'vo', 'legend');
const TAKES = path.join(OUT, 'takes');
// --only=a,b limits generation to lines whose name starts with one of these.
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7).split(',').filter(Boolean);

const KEY = (() => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const m = fs.readFileSync(path.join(os.homedir(), '.config', 'gamdom100k', 'elevenlabs.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m);
  if (!m) throw new Error('No ElevenLabs key found.');
  return m[1].trim();
})();

// Premade voices by role. Children are young voices pitched up in the edit.
const ROLES = {elder: ['Bill', 'George', 'Brian'], kidA: ['Jessica', 'Laura'], kidB: ['Laura', 'Lily'], kidC: ['Lily', 'Sarah'], teen: ['Charlie', 'Will', 'Liam']};

// takes > 1: the shortest take wins.
const LINES = [
  {name: 'elder-gather', role: 'elder', takes: 2, text: '[slow] [deep voice] [storytelling] Children... gather round. Tonight, I will tell you how Gamdom found its chosen one.'},
  {name: 'kid-code', role: 'kidA', takes: 2, text: '[excited] [childlike] Is it the one about the code?'},
  {name: 'elder-spoil', role: 'elder', takes: 2, text: '[stern] [annoyed] Do not spoil it.'},
  {name: 'elder-dark', role: 'elder', takes: 2, text: '[storytelling] [slow] Long ago, Gamdom was strong... but not number one. So the elders consulted the oracle.'},
  {name: 'elder-prophecy', role: 'elder', takes: 2, text: '[whispering] [mysterious] The prophecy said: one day, a man would come... who would do anything.'},
  {name: 'elder-false', role: 'elder', takes: 2, text: '[grave] [slow] Many came. Many... spelled it wrong.'},
  {name: 'kid-there', role: 'kidB', takes: 2, text: '[curious] [childlike] Grandpa, were you there?'},
  {name: 'elder-it', role: 'elder', takes: 2, text: '[pause] [quietly] [matter-of-fact] ...I was the oracle\'s IT guy.'},
  {name: 'elder-four', role: 'elder', takes: 2, text: '[long sigh] [tired] ...Four times.'},
  {name: 'elder-trials', role: 'elder', takes: 2, text: '[dramatic] He crossed the Mines... mostly. He tamed the Crash. He changed the rules... three times.'},
  {name: 'kid-why', role: 'kidB', takes: 2, text: '[curious] [childlike] Why three times?'},
  {name: 'elder-nobody', role: 'elder', takes: 2, text: '[flatly] [deadpan] Nobody knows.'},
  {name: 'elder-written', role: 'elder', takes: 2, text: '[epic] [slow] And so it was written: Gamdom... to number one.'},
  {name: 'elder-code', role: 'elder', takes: 2, text: '[warm] [slow] Sign up with code STEVE.'},
  {name: 'kid-wake', role: 'kidC', takes: 2, text: '[waking up suddenly] [childlike] Wait... what was the code?'},
  {name: 'all-steve-1', role: 'elder', takes: 1, text: '[shouting] STEVE!'},
  {name: 'all-steve-2', role: 'kidA', takes: 1, text: '[shouting] [excited] STEVE!'},
  {name: 'all-steve-3', role: 'kidB', takes: 1, text: '[shouting] [excited] STEVE!'},
  {name: 'all-steve-4', role: 'kidC', takes: 1, text: '[shouting] [excited] STEVE!'},
  {name: 'all-steve-5', role: 'teen', takes: 1, text: '[shouting] [excited] STEVE!'},
];

const api = (method, url, body) =>
  fetch(API + url, {
    method,
    headers: {'xi-api-key': KEY, ...(body ? {'Content-Type': 'application/json'} : {})},
    body: body ? JSON.stringify(body) : undefined,
  });

const duration = (file) =>
  parseFloat(execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {cwd: ROOT}).toString());

const main = async () => {
  const vr = await api('GET', '/v1/voices');
  if (!vr.ok) throw new Error(`Listing voices failed: ${vr.status}`);
  const premade = (await vr.json()).voices.filter((v) => v.category === 'premade');
  const voice = Object.fromEntries(
    Object.entries(ROLES).map(([role, names]) => [role, names.map((n) => premade.find((v) => v.name.split(' ')[0] === n)).find(Boolean) ?? premade[0]])
  );
  for (const [role, v] of Object.entries(voice)) console.log(`${role}: ${v.name.split(' ')[0]}`);
  fs.mkdirSync(TAKES, {recursive: true});

  for (const line of LINES.filter((l) => !ONLY.length || ONLY.some((o) => l.name.startsWith(o)))) {
    const takes = [];
    for (let i = 1; i <= line.takes; i++) {
      const out = path.join(TAKES, `${line.name}-${i}.mp3`);
      const res = await api('POST', `/v1/text-to-speech/${voice[line.role].voice_id}?output_format=mp3_44100_128`, {text: line.text, model_id: 'eleven_v3'});
      if (!res.ok) throw new Error(`TTS failed for ${line.name}: ${res.status} ${(await res.text()).slice(0, 200)}`);
      fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
      takes.push({out, d: duration(out)});
    }
    const best = takes.reduce((a, b) => (b.d < a.d ? b : a));
    fs.copyFileSync(best.out, path.join(OUT, `${line.name}.mp3`));
    console.log(`${line.name}: ${takes.map((t) => t.d.toFixed(2)).join(', ')}s → ${path.basename(best.out)}`);
  }
};

main().catch((e) => {
  console.error(String(e.message ?? e).replaceAll(KEY, '[redacted]'));
  process.exit(1);
});
