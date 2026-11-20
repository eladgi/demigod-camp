// How many ElevenLabs characters are left this month:  node --env-file=.env.local tools/credits.mjs
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
const s = await new ElevenLabsClient().user.subscription.get();
console.log(`${s.tier}: used ${s.characterCount} of ${s.characterLimit}, ${s.characterLimit - s.characterCount} left, resets ${new Date(s.nextCharacterCountResetUnix * 1000).toISOString().slice(0, 10)}`);
