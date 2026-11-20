// Records every game sentence with ElevenLabs into game/assets/audio/*.mp3 (only the ones that don't exist yet).
//
//   npm run voices:list                 list the voices on the account
//   npm run voices:samples              make a short sample per candidate voice in art/voice_samples/ (to choose one)
//   npm run voices -- --voice <id>      choose a voice (saved in tools/voice.json) and record everything
//   npm run voices                      record whatever is missing with the saved voice
//
// The API key is read from ELEVENLABS_API_KEY (.env.local, loaded by the npm scripts). Never put the key in code.
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'game');
const CONFIG = path.join(ROOT, 'tools', 'voice.json');

// Load the game's own word list and sentence list (browser scripts) so the recordings always match the games.
function loadPhrases() {
  const ctx = { window: {}, innerWidth: 1280, innerHeight: 720, localStorage: null, console };
  vm.createContext(ctx);
  const code = readFileSync(path.join(GAME, 'common.js'), 'utf8') + '\n' + readFileSync(path.join(GAME, 'phrases.js'), 'utf8')
    + '\n' + readFileSync(path.join(GAME, 'voyage_text.js'), 'utf8')
    + '\nglobalThis.__out = { phrases: allPhrases(), zeus: zeusPhrases(), hermes: hermesPhrases(), villagers: villagerPhrases(), cards: cardPhrases(), voyage: voyPhrases(), file: audioFile };';
  vm.runInContext(code, ctx);
  return ctx.__out;
}

// Calm, clear, a little slow: for children learning English.
const MODEL = 'eleven_multilingual_v2';
const SETTINGS = { stability: 0.6, similarityBoost: 0.8, speed: 0.9 };
const SAMPLE_TEXT = 'Hello, hero! Go through the elephant door! Take the purple key!';
// Female voices on the account that fit a friendly English teacher (from --list-voices)
const CANDIDATES = {
  Bella: 'hpp4J3VqNfWAUOO0d1Us',     // American, bright, warm, educational
  Jessica: 'cgSgspJ2msm6clMCkdW9',   // American, young, playful
  Matilda: 'XrExE9yKIg1WjnnlVkGX',   // American, upbeat, educational
  Alice: 'Xb7hH8MSUJpSbSDYk0k2',     // British, clear educator
};

const client = new ElevenLabsClient();   // reads ELEVENLABS_API_KEY

// Lines the voice reads differently from how the game writes them (e.g. it shouted these with "!").
// The recording is still saved under the game's text, so nothing changes in the games.
const SPOKEN_AS = {
  'Close the door!': 'Close the door.',
  'Open the door!': 'Open the door.',
};

async function record(voiceId, text, file, folder) {
  text = SPOKEN_AS[text] || text;
  // Zeus shouts at "!" - he says everything calmly with a period instead (the game still shows the "!")
  if (folder === 'zeus') text = text.replace(/!/g, '.');
  // a single word on its own gets rushed and its last sound swallowed ("hat", "car"): say it as a little sentence, "Hat."
  if (!/\s/.test(text) && /^[a-z]+$/i.test(text)) text = text[0].toUpperCase() + text.slice(1) + '.';
  for (let attempt = 1; ; attempt++) {
    try {
      const audio = await client.textToSpeech.convert(voiceId, { text, modelId: MODEL, voiceSettings: SETTINGS, outputFormat: 'mp3_44100_64' });
      await pipeline(Readable.fromWeb(audio), createWriteStream(file));
      return;
    } catch (e) {
      const status = e?.statusCode ?? e?.status;
      if (status === 429 && attempt < 6) { await new Promise(r => setTimeout(r, 2000 * attempt)); continue; }
      throw e;
    }
  }
}

async function main() {
const args = process.argv.slice(2);

if (args.includes('--list-voices')) {
  const res = await client.voices.search({ pageSize: 100 });
  for (const v of res.voices) console.log(`${v.voiceId}  ${v.name}  ${JSON.stringify(v.labels || {})}`);
  return;
}

if (args.includes('--samples')) {
  const dir = path.join(ROOT, 'art', 'voice_samples');
  mkdirSync(dir, { recursive: true });
  for (const [name, id] of Object.entries(CANDIDATES)) {
    const f = path.join(dir, `${name}.mp3`);
    await record(id, SAMPLE_TEXT, f);
    console.log('sample:', f);
  }
  return;
}

// tools/voice.json: { "voiceId": narrator voice, "zeus": Zeus's voice, "hermes": Hermes's voice }
const cfg = existsSync(CONFIG) ? JSON.parse(readFileSync(CONFIG, 'utf8')) : {};
const vi = args.indexOf('--voice'), zi = args.indexOf('--zeus'), hi = args.indexOf('--hermes');
if (vi >= 0) cfg.voiceId = CANDIDATES[args[vi + 1]] || args[vi + 1];
if (zi >= 0) cfg.zeus = args[zi + 1];
if (hi >= 0) cfg.hermes = args[hi + 1];
if (vi >= 0 || zi >= 0 || hi >= 0) writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
if (!cfg.voiceId) { console.error('Choose a voice first: npm run voices -- --voice <name or id>'); process.exitCode = 1; return; }

const { phrases, zeus, hermes, villagers, cards, voyage, file } = loadPhrases();
// every recording: [text, voice folder (undefined = narrator), ElevenLabs voice id]
const jobs = [...phrases, ...cards].map(t => [t, undefined, cfg.voiceId]);   // narrator: game lines + the shop's card texts
if (cfg.zeus) zeus.forEach(t => jobs.push([t, 'zeus', cfg.zeus]));
else console.log('(no Zeus voice set yet: npm run voices -- --zeus <id>)');
if (cfg.hermes) hermes.forEach(t => jobs.push([t, 'hermes', cfg.hermes]));
else console.log('(no Hermes voice set yet: npm run voices -- --hermes <id>)');
// villagers: one library voice per kind of person (tools/voice.json "villagers": { girl: id, ... })
for (const [t, folder] of villagers) { const id = cfg.villagers?.[folder.split('/')[1]]; if (id) jobs.push([t, folder, id]); }
// The Voyage story: each character's own voice (tools/voice.json "voyage": { odysseus: id, ... }), the narrator for the rest
for (const [t, folder] of voyage) { const id = folder ? cfg.voyage?.[folder] : cfg.voiceId; if (id) jobs.push([t, folder, id]); }
for (const d of ['audio', 'audio/zeus', 'audio/hermes', ...Object.keys(cfg.villagers || {}).map(t => 'audio/villagers/' + t), ...Object.keys(cfg.voyage || {}).map(t => 'audio/' + t)]) mkdirSync(path.join(GAME, 'assets', d), { recursive: true });
const seen = new Set();   // the same line can come from two lists: record it once
let todo = jobs.filter(([t, v]) => { const f = file(t, v); if (seen.has(f) || existsSync(path.join(GAME, f))) return false; seen.add(f); return true; });
const li = args.indexOf('--limit'); if (li >= 0) todo = todo.slice(0, +args[li + 1]);   // e.g. --limit 1 to test first
const chars = todo.reduce((a, [t]) => a + t.length, 0);
console.log(`${jobs.length} recordings, ${todo.length} to make (${chars} characters)`);
if (args.includes('--dry-run')) return;
let n = 0;
for (const [t, v, id] of todo) {
  await record(id, t, path.join(GAME, file(t, v)), v);
  n++; if (n % 20 === 0 || n === todo.length) console.log(`  ${n}/${todo.length}`);
}
execFileSync('python', [path.join(ROOT, 'tools', 'manifest.py')], { stdio: 'inherit' });
console.log('done');
}

await main();
