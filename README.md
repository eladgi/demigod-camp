# Demigod Camp

English-reading games for young learners who love Greek myths. Short sentences, real gameplay.

**Play:** https://olympus.gidron.org

There are no quizzes: you read in order to play. Reading a note tells you where a package goes,
which monster to strike, or which way leads out of the maze.

## The games

| Game | What you do |
|---|---|
| **Demigod Trials** | Listen to the Oracle and strike the right monster. |
| **The Labyrinth** | Follow Ariadne's voice and escape the Minotaur. |
| **Climb to Olympus** | Daughter of Zeus, climb the mountain to your father. |
| **Hermes Express** | Read the notes and help Hermes deliver every package. |
| **The Voyage** | Sail with Odysseus past the Cyclops, Circe, the Sirens and Scylla, all the way home to Ithaca. |
| **Hermes' Shop** | Spend the drachmas you earn on myth cards, pets, hats and magic trails. |

## What's in the repo

| Folder | Contents |
|---|---|
| `game/` | The games: plain HTML and JavaScript with [Phaser 3](https://phaser.io) from a CDN, no build step. Art and recorded voices are in `game/assets/`. |
| `tools/` | Python scripts that cut AI-generated pictures into game art, the voice recorder (ElevenLabs), a local server, and the site builder. |
| `art/` | The image prompts used to make the art (Google's Nano Banana). |
| `.github/workflows/` | Builds the site from `game/` and publishes it to GitHub Pages on every push to `main`. |

Progress (coins, cards, pets, best scores) is saved in the browser's `localStorage`.
Narration was recorded ahead of time and is used only as help. Anything not recorded is read by the browser's own voice.

## Run it locally

```bash
python tools/serve.py 8123
```

Then open http://localhost:8123. On Windows you can double-click `Start game.bat` instead.

To record new voice lines you need your own ElevenLabs key in `.env.local` (never committed), then:

```bash
npm install
npm run voices
```

## License

The code is under the MIT License. The art and audio in `game/assets/` are all rights reserved.
See [LICENSE](LICENSE) for details.
