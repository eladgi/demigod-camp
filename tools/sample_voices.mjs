// Make short samples of candidate voices, to choose one by listening:
//   node --env-file=.env.local tools/sample_voices.mjs tools/samples_voyage.json
// The JSON is { "<character>": { "text": "...", "voices": { "<name>": "<voice id>" } } }.
// Samples go to art/voice_samples/<character>_<name>.mp3 (not in git), plus index.html to listen to them all.
// Same model and settings as make_voices.mjs, so a sample sounds like the real recording.
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'art', 'voice_samples');
const MODEL = 'eleven_multilingual_v2';
const SETTINGS = { stability: 0.6, similarityBoost: 0.8, speed: 0.9 };

const list = JSON.parse(readFileSync(path.resolve(process.argv[2]), 'utf8'));
const client = new ElevenLabsClient();   // reads ELEVENLABS_API_KEY
mkdirSync(OUT, { recursive: true });
let html = '<!doctype html><meta charset="utf-8"><title>Voice samples</title><style>body{font:16px system-ui;margin:24px;max-width:760px}h2{margin:28px 0 4px}p{color:#555;margin:0 0 10px}div{display:flex;align-items:center;gap:12px;margin:6px 0}b{width:190px}code{color:#888;font-size:12px}</style>';
let chars = 0;
for (const [who, { text, voices }] of Object.entries(list)) {
  html += `<h2>${who}</h2><p>"${text}"</p>`;
  for (const [name, id] of Object.entries(voices)) {
    const file = `${who}_${name}.mp3`.replace(/[^\w.-]+/g, '_');
    if (!existsSync(path.join(OUT, file))) {
      const audio = await client.textToSpeech.convert(id, { text, modelId: MODEL, voiceSettings: SETTINGS, outputFormat: 'mp3_44100_64' });
      await pipeline(Readable.fromWeb(audio), createWriteStream(path.join(OUT, file)));
      chars += text.length;
      console.log('made', file);
    }
    html += `<div><b>${name}</b><audio controls preload="none" src="${file}"></audio><code>${id}</code></div>`;
  }
}
writeFileSync(path.join(OUT, 'index.html'), html);
console.log(`${chars} characters used. Listen: ${path.join(OUT, 'index.html')}`);
