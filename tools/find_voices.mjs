// Search the ElevenLabs voice library:  node --env-file=.env.local tools/find_voices.mjs "<search>" [gender] [age]
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
const [search, gender, age] = process.argv.slice(2);
const res = await new ElevenLabsClient().voices.getShared({ pageSize: 15, search, gender, age, language: 'en' });
for (const v of res.voices) console.log(v.voiceId, '|', v.name, '|', v.gender, v.age, v.accent, '|', v.useCase, '|', (v.description || '').slice(0, 90).replace(/\n/g, ' '), '| uses', v.clonedByCount);
