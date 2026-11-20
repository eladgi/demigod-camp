# Demigod Camp

English-reading browser games set in Greek myths, made for a young learner of English.
Live at https://olympus.gidron.org. Pushing to `main` publishes it (see Publishing).

If `CLAUDE.local.md` exists, read it: it has the private notes about the player and how to talk to the family.

## Design rules (from play-testing; check every new idea against them)

- **No quizzes.** The player controls a character all the time, and understanding the English decides what she does. A multiple-choice screen with animations was rejected as "not really a game".
- **No enemies attacking her in normal levels.** Danger only in boss fights.
- **Progress is monotonic.** Nothing undoes what she achieved (no regrowing Hydra heads).
- **Every challenge can be failed by not knowing the English.** No sections where any choice works.
- **Don't show the English word she must match.** She reads well, so that makes it trivial. Give the prompt as a picture or in Hebrew; she answers in English.
- **After a mistake, repeat the same task.** Difficulty comes from being sent back, not from swapping in a new task. Never give the same instruction twice in a row across rooms.
- **Voice is help only.** Reading comes first; a button reads the line aloud.
- **"Too easy" means the gameplay, not the reading.** Make it harder with movement, timing and danger; keep the sentences at the same level.
- Keep feedback wording consistent (e.g. count out loud on every hit, including the last).
- Commands that lead to danger: danger arrives about 1.8 s after the command.
- Art is never hand-drawn SVG (rejected as babyish): it comes from Nano Banana, see Art.

## The games (all in `game/`, Phaser 3.80.1 from a CDN, no build step)

| File | Game |
|---|---|
| `index.html` | Camp menu: one card per game, plus the shop as a stall card |
| `arena.html` | Demigod Trials: listen to the Oracle, strike the right monster (vocabulary) |
| `labyrinth.html` | The Labyrinth: follow Ariadne's voice; doors, keys, colors, directions, Minotaur chase |
| `olympus.html` | Climb to Olympus: side platformer; Zeus's verb commands, word bridges, opposites magic, Typhon boss |
| `hermes.html` | Hermes Express: read notes, deliver packages in a village; letter fixing; Eris boss on day 5 |
| `voyage.html` | The Voyage of Odysseus: sea map and 6 islands (Lotus, Cyclops, Circe, Sirens, Scylla/Charybdis, storm to Ithaca); texts in `voyage_text.js` |
| `shop.html` | Hermes' Shop: myth cards with a rising price, plus pets, hats and trails |

Shared code:
- `common.js`: `Save` (localStorage key `demigodSave`: coins, best, cards, items, equip, voyage), `say(text, voice)` (plays a recording or falls back to browser speech), `hdTick` (HD canvas with a separate UI camera), and `Gear` (pets, hats, trails).
  - `Gear.preload(scene)` and `Gear.attach(scene, hero, {state})` are called by every game.
  - Hats have front, side and back views and are glued to the head measured from the hero picture. There is no hat while ducking or swimming.
  - Pets move by type (fly, walk, hop) and wait or reappear when the hero climbs, rides or swims.
- `phrases.js`: the cards (`CARDS`; 7th field `'voyage'` means a gift card that is not for sale), the shop lines, the Hermes and villager lines, and the phrase lists used by the voice recorder.

Phaser gotcha: `rtl: true` on a Text makes other Text objects vanish. Don't use it.

## Running and testing

- Double-click `Start game.bat`, or run `python tools/serve.py 8123` and open http://localhost:8123. Opening the files directly (file://) does not work.
- `.claude/launch.json` has the `game` server for the browser preview.
- Games only load assets listed in `game/assets/manifest.json`. After adding or removing any asset, run `python tools/manifest.py`.

## Art

- The user makes pictures in Nano Banana (Gemini app) and saves them in `art/raw/`, which is not in git. Prompts live in `art/prompts_*.md`: give exact prompts and file names, and match the existing style text.
- Ask for a green #00FF00 background. Ratios: characters 3:4, objects 1:1, backgrounds 16:9.
- Use whole images. Separately generated body parts never line up, so swap whole poses and animate with code tweens.
- A 4x4 grid prompt gives consistent icons.
- Tools:
  - `cutout.py`: removes the green background.
  - `slice_grid.py`, `slice_sheet.py`, `split_objects.py`, `build_walk_sheet.py`: grids, animation sheets and loose objects.
  - `pot.py`: power-of-two sizes so pictures stay sharp.
  - `make_hats.py`, `make_voyage_art.py`, `door_mask.py`, `soften_tiles.py`: per-game processing.

## Voices (ElevenLabs)

- `npm run voices` runs `tools/make_voices.mjs` and records missing lines into `game/assets/audio/`. Which voice each character uses is in `tools/voice.json`. `tools/credits.mjs` shows the remaining credits; `tools/find_voices.mjs` searches for voices.
- Model `eleven_multilingual_v2` shouts lines ending in "!", so Zeus lines are recorded with "!" changed to ".". Check loudness (median about -21 dB) and re-record outliers.
- Read-aloud hints for generated text are NOT recorded (too many credits); they use the browser voice.
- The Voyage story panels are recorded: Odysseus, Circe, Athena, Poseidon, the Cyclops and Hermes each have their own voice (`voice.json` "voyage"; `voyVoice()` in `voyage_text.js`). Panels marked `narr: true`, and all the others, use the narrator.
- To choose a new voice: list candidates in a JSON file like `tools/samples_voyage.json` and run `node --env-file=.env.local tools/sample_voices.mjs <file>`. It makes a listening page in `art/voice_samples/`.

### The key: strict rules

- The key is in `.env.local` (ignored by git). Never open, print or cat it. Never put a key in code: the SDK reads `ELEVENLABS_API_KEY`.
- Never ask for a key in chat, and never accept one pasted there.

## Publishing

- `.github/workflows/pages.yml` runs `python tools/build_site.py` on every push to `main` and deploys `site/` to GitHub Pages (custom domain olympus.gidron.org, set in the repo settings; DNS is a Cloudflare CNAME, DNS only).
- `build_site.py` copies only `game/`, leaves out files the game doesn't use, filters the manifest, and **fails if any copied file looks like a key**. Run it locally before pushing anything new.
- The repo is public: no personal details about the player or the family in commits, code comments, prompts or docs. Those go in `CLAUDE.local.md`.
