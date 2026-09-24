// Voices for "THE GAMDOM HOTLINE" into public/vo/hotline/. Same key handling as generate-voices.mjs
// (ELEVENLABS_API_KEY or ~/.config/gamdom100k/elevenlabs.env; never printed).
// Run: NODE_USE_ENV_PROXY=1 node scripts/generate-hotline-voices.mjs
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const API = 'https://api.elevenlabs.io';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public', 'vo', 'hotline');
const TAKES = path.join(OUT, 'takes');

const KEY = (() => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const m = fs.readFileSync(path.join(os.homedir(), '.config', 'gamdom100k', 'elevenlabs.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m);
  if (!m) throw new Error('No ElevenLabs key found.');
  return m[1].trim();
})();

// Premade voices by role.
const ROLES = {ivr: ['Sarah', 'Alice', 'Jessica'], caller: ['Liam', 'Will', 'Charlie'], operator: ['Matilda', 'Alice', 'Bella']};

// takes > 1: the shortest take wins (snappier comedy timing).
const LINES = [
  {name: 'ivr-welcome', role: 'ivr', takes: 2, text: '[calm] [corporate] Thank you for calling the Gamdom code hotline. If you forgot the sign-up code, press one.'},
  {name: 'ivr-code-1', role: 'ivr', takes: 2, text: '[cheerful] The code is STEVE. To hear it again, press two.'},
  {name: 'ivr-code-2', role: 'ivr', takes: 1, text: '[cheerful] The code is STEVE.'},
  {name: 'ivr-code-3', role: 'ivr', takes: 1, text: '[slightly annoyed] Still STEVE.'},
  {name: 'ivr-code-4', role: 'ivr', takes: 2, text: '[slowly] [spelling it out] S. T. E. V. E.'},
  {name: 'ivr-code-5', role: 'ivr', takes: 1, text: '[irritated] It has not changed. It is STEVE.'},
  {name: 'ivr-code-6', role: 'ivr', takes: 1, text: '[long sigh] ...STEVE.'},
  {name: 'ivr-hold', role: 'ivr', takes: 1, text: '[strained] [through gritted teeth] Please hold for a human.'},
  {name: 'ivr-bye', role: 'ivr', takes: 1, text: '[cheerful] Thank you for calling. The code is STEVE.'},
  {name: 'caller-ok', role: 'caller', takes: 2, text: '[mumbling] Okay, okay... got it.'},
  {name: 'caller-code', role: 'caller', takes: 2, text: '[groggy] [timid] Hi... the code?'},
  {name: 'caller-repeat', role: 'caller', takes: 2, text: '[sleepy] ...can you repeat that?'},
  {name: 'op-hello', role: 'operator', takes: 2, text: '[tired] [strong Nigerian accent] Gamdom hotline. Let me guess.'},
  {name: 'op-steve', role: 'operator', takes: 2, text: '[shouting] [strong Nigerian accent] It is STEVE!'},
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

  for (const line of LINES) {
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
