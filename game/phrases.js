// Every sentence the games can say out loud. tools/make_voices.mjs turns each one into an ElevenLabs recording
// (assets/audio/<text>.mp3); say() in common.js plays the recording and falls back to the browser voice.
// If you add a new sentence to a game, add it here too and run:  npm run voices
const PHRASE_COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white'];
const PLURALS = { fish: 'fish', bus: 'buses' };
const plural = w => PLURALS[w] || w + 's';

// ---------- Climb to Olympus ----------
const OLYMPUS = {
  // word-bridge sentences per world: [english, hebrew]
  sentences: {
    1: [['red car', 'מכונית אדומה'], ['big bear', 'דוב גדול'], ['small rabbit', 'ארנב קטן'], ['blue boat', 'סירה כחולה'],
        ['yellow bus', 'אוטובוס צהוב'], ['hot pizza', 'פיצה חמה'], ['happy monkey', 'קוף שמח'], ['green hat', 'כובע ירוק'], ['white egg', 'ביצה לבנה']],
    2: [['I can jump', 'אני יכולה לקפוץ'], ['I can swim', 'אני יכולה לשחות'], ['I can run', 'אני יכולה לרוץ'], ['the big bear', 'הדוב הגדול'],
        ['a red car', 'מכונית אדומה'], ['the small egg', 'הביצה הקטנה'], ['I see Zeus', 'אני רואה את זאוס']],
    3: [['The cat is big', 'החתול גדול'], ['The bus is yellow', 'האוטובוס צהוב'], ['The egg is small', 'הביצה קטנה'],
        ['The monkey can climb', 'הקוף יודע לטפס'], ['The boat is blue', 'הסירה כחולה'], ['I can see a bear', 'אני רואה דוב']],
    4: [['The plane can fly', 'המטוס יכול לעוף'], ['I am a hero', 'אני גיבורה'], ['The bear is happy', 'הדוב שמח'],
        ['The elephant is sad', 'הפיל עצוב'], ['I can fly to Olympus', 'אני יכולה לעוף לאולימפוס'], ['Zeus is my father', 'זאוס הוא אבא שלי']],
  },
  distractors: ['cat', 'dog', 'red', 'big', 'is', 'can', 'sun', 'the', 'a', 'run', 'hat', 'bus', 'blue', 'sad', 'fly', 'see', 'small', 'egg'],
  commands: {
    jump: ['Jump!', 'קפצי!'], duck: ['Duck!', 'התכופפי!'], dontjump: ["Don't jump!", 'אל תקפצי!'], stop: ['Stop!', 'עצרי!'],
    run: ['Run!', 'רוצי!'], climb: ['Climb!', 'טפסי!'], swim: ['Swim!', 'שחי!'], fly: ['Fly!', 'עופי!'],
  },
  // opposites magic: two words, what Zeus says for each, hebrew
  opposites: {
    rock:    { a: 'big', b: 'small', say: { a: 'Make the rock big!', b: 'Make the rock small!' }, he: { a: 'תעשי את הסלע גדול', b: 'תעשי את הסלע קטן' } },
    door:    { a: 'open', b: 'close', say: { a: 'Open the door!', b: 'Close the door!' }, he: { a: 'פתחי את הדלת', b: 'סגרי את הדלת' } },
    river:   { a: 'hot', b: 'cold', say: { a: 'Make the river hot!', b: 'Make the river cold!' }, he: { a: 'תעשי את הנהר חם', b: 'תעשי את הנהר קר' } },
    wind:    { a: 'fast', b: 'slow', say: { a: 'Make the wind fast!', b: 'Make the wind slow!' }, he: { a: 'תעשי את הרוח מהירה', b: 'תעשי את הרוח איטית' } },
    cloud:   { a: 'up', b: 'down', say: { a: 'Make the cloud go up!', b: 'Make the cloud go down!' }, he: { a: 'תעלי את הענן למעלה', b: 'תורידי את הענן למטה' } },
    monster: { a: 'happy', b: 'sad', say: { a: 'Make the monster happy!', b: 'Make the monster sad!' }, he: { a: 'תעשי את המפלצת שמחה', b: 'תעשי את המפלצת עצובה' } },
  },
  lines: ['Hello, daughter of Zeus! Climb to Olympus!', 'Well done!', 'Oops! Listen again.', 'Up the mountain!',
          'Here comes Typhon!', 'Make Typhon small!', 'Welcome to Olympus, my daughter!', 'Ride the Pegasus!', 'Build the bridge!'],
};
// the words on the bridge stones (spoken when she lands on the right one)
function olympusWords() {
  const ws = new Set(OLYMPUS.distractors);
  Object.values(OLYMPUS.sentences).forEach(list => list.forEach(([s]) => s.split(' ').forEach(w => ws.add(w))));
  return [...ws];
}

function allPhrases() {
  const words = WORDS.map(w => w[0]);
  const out = new Set();
  const add = t => out.add(t);

  // --- Demigod Trials (arena) ---
  words.forEach(w => add(`Hit the ${w}!`));
  PHRASE_COLORS.forEach(c => words.forEach(w => add(`Hit the ${c} ${w}!`)));
  ['two', 'three'].forEach(n => words.forEach(w => add(`Hit ${n} ${plural(w)}!`)));
  ['one!', 'two!', 'three!'].forEach(add);
  ['Jump!', 'Go left!', 'Go right!'].forEach(add);
  add('Here comes the Hydra!');
  add('You defeated the Hydra! You are a true hero!');

  // --- The Labyrinth ---
  words.forEach(w => add(`Go through the ${w} door!`));
  PHRASE_COLORS.forEach(c => { add(`Take the ${c} key!`); add(`Open the ${c} door!`); });
  ['Go up!'].forEach(add);
  const rels = { table: ['on', 'under'], chest: ['in', 'next to'], column: ['behind', 'next to'], tree: ['behind', 'next to'] };
  Object.entries(rels).forEach(([obj, rs]) => rs.forEach(r => add(`The key is ${r} the ${obj}. Take it!`)));
  add('Now open the door!');
  add('Hello, hero! Walk up and listen to me.');
  add('Walk up, hero!');
  add('Well done! Down the stairs!');
  add('You escaped the Labyrinth! You are a true hero!');

  return [...out];
}

// Everything Zeus says in Climb to Olympus (recorded with Zeus's voice into assets/audio/zeus/)
function zeusPhrases() {
  const out = new Set(), add = t => out.add(t);
  Object.values(OLYMPUS.sentences).forEach(list => list.forEach(([s]) => add(s)));
  olympusWords().forEach(add);
  Object.values(OLYMPUS.commands).forEach(([t]) => add(t));
  Object.values(OLYMPUS.opposites).forEach(o => { add(o.say.a); add(o.say.b); });
  OLYMPUS.lines.forEach(add);
  return [...out];
}

// Hermes's fixed lines in Hermes Express (recorded with his own voice into assets/audio/hermes/).
// The notes she can ask him to read aloud change every game, so those use the browser voice.
function hermesPhrases() {
  return ['Hi! I am Hermes. Can you help me?', 'Thank you!', 'Wrong house!', 'Not this person!', 'Great job!', 'Find the wrong word!',
    'You are the best helper!', 'Oh no! Eris is hiding in the village. Can you find her?', 'You found her!', 'You caught Eris!',
    'Eris is not in a house!', 'That is not Eris!', ...SHOP_LINES,
    ...(typeof GEAR_ITEMS !== 'undefined' ? Object.values(GEAR_ITEMS).map(g => g[4]) : [])];   // what he says about each thing on his shelf
}

// Villagers in Hermes Express: each kind of person has their own ElevenLabs voice (tools/voice.json "villagers")
// and says their own little lines (recorded into assets/audio/villagers/<type>/).
const VILLAGER_LINES = {
  girl:    { thanks: ['Yay! Thank you so much!', 'Wow! Is this for me? Thank you!'], wrong: 'Hmm, that is not for me.' },
  boy:     { thanks: ['Cool! Thank you!', 'Awesome! Thanks a lot!'], wrong: 'Not me! Try again.' },
  man:     { thanks: ['Thank you very much!', 'Great! I was waiting for this.'], wrong: 'Sorry, that is not for me.' },
  woman:   { thanks: ['Oh, how lovely! Thank you!', 'Thank you, dear!'], wrong: 'Oh no, that is not mine.' },
  grandpa: { thanks: ['Thank you, young hero!', 'Ah, wonderful! Thank you!'], wrong: 'Hmm? No, no. That is not mine.' },
  grandma: { thanks: ['Thank you, sweetheart!', 'Oh, how kind! Thank you!'], wrong: 'Oh dear, that is not for me.' },
};
function villagerPhrases() {
  return Object.entries(VILLAGER_LINES).flatMap(([type, l]) => [...l.thanks, l.wrong].map(t => [t, 'villagers/' + type]));
}

// ---------- Hermes' Shop: the card album (shop.html) ----------
// [id, name, kind, emoji, english text (short sentences she reads), hebrew help]
// kind: god / monster / friend. Picture: assets/cards/<id>.png (Nano Banana), else CARD_ART_FALLBACK, else the emoji.
const CARDS = [
  ['zeus', 'Zeus', 'god', '⚡', 'Zeus is the king of the gods. He throws lightning bolts. He lives on Mount Olympus.', 'זאוס הוא מלך האלים. הוא זורק ברקים. הוא גר על הר האולימפוס.'],
  ['hera', 'Hera', 'god', '👑', 'Hera is the queen of the gods. She is the wife of Zeus. Her bird is the peacock.', 'הרה היא מלכת האלים. היא אשתו של זאוס. הציפור שלה היא הטווס.'],
  ['poseidon', 'Poseidon', 'god', '🔱', 'Poseidon is the god of the sea. He has a big trident. He can make huge waves.', 'פוסידון הוא אל הים. יש לו קלשון גדול. הוא יכול לעשות גלים ענקיים.'],
  ['hades', 'Hades', 'god', '💀', 'Hades is the god of the Underworld. He wears a dark helmet. His dog has three heads.', 'האדס הוא אל השאול. הוא חובש קסדה כהה. לכלב שלו יש שלושה ראשים.'],
  ['athena', 'Athena', 'god', '🦉', 'Athena is the goddess of wisdom. She is very smart. Her bird is the owl.', 'אתנה היא אלת החוכמה. היא חכמה מאוד. הציפור שלה היא הינשוף.'],
  ['apollo', 'Apollo', 'god', '☀️', 'Apollo is the god of the sun and music. He plays a golden lyre.', 'אפולו הוא אל השמש והמוזיקה. הוא מנגן בנבל של זהב.'],
  ['artemis', 'Artemis', 'god', '🌙', 'Artemis is the goddess of the moon. She hunts with a silver bow. She loves animals.', 'ארטמיס היא אלת הירח. היא צדה עם קשת של כסף. היא אוהבת חיות.'],
  ['hermes', 'Hermes', 'god', '🪽', 'Hermes is the messenger of the gods. He has wings on his shoes. He is very fast!', 'הרמס הוא השליח של האלים. יש לו כנפיים על הנעליים. הוא מהיר מאוד!'],
  ['ares', 'Ares', 'god', '⚔️', 'Ares is the god of war. He is big and strong. He has a red helmet and a spear.', 'ארס הוא אל המלחמה. הוא גדול וחזק. יש לו קסדה אדומה וחנית.'],
  ['aphrodite', 'Aphrodite', 'god', '💖', 'Aphrodite is the goddess of love. She is very beautiful. Her bird is the dove.', 'אפרודיטה היא אלת האהבה. היא יפה מאוד. הציפור שלה היא היונה.'],
  ['hephaestus', 'Hephaestus', 'god', '🔨', 'Hephaestus is the god of fire. He has a big hammer. He makes swords and shields.', 'הפייסטוס הוא אל האש. יש לו פטיש גדול. הוא מכין חרבות ומגינים.'],
  ['demeter', 'Demeter', 'god', '🌾', 'Demeter is the goddess of the harvest. She helps the plants and flowers grow.', 'דמטר היא אלת היבול. היא עוזרת לצמחים ולפרחים לגדול.'],
  ['medusa', 'Medusa', 'monster', '🐍', 'Medusa has snakes for hair. Do not look at her eyes! You will turn to stone.', 'למדוזה יש נחשים במקום שיער. אל תסתכלי לה בעיניים! את תהפכי לאבן.'],
  ['minotaur', 'The Minotaur', 'monster', '🐂', 'The Minotaur is half man and half bull. He lives in a big maze.', 'המינוטאור הוא חצי אדם וחצי שור. הוא גר במבוך גדול.'],
  ['hydra', 'The Hydra', 'monster', '🐉', 'The Hydra is a snake with many heads. Cut one head, and two grow back!', 'ההידרה היא נחש עם הרבה ראשים. חותכים ראש אחד, ושניים צומחים במקומו!'],
  ['cyclops', 'Cyclops', 'monster', '👁️', 'A Cyclops is a giant with one big eye. He is very tall and strong.', 'קיקלופ הוא ענק עם עין אחת גדולה. הוא גבוה וחזק מאוד.'],
  ['cerberus', 'Cerberus', 'monster', '🐕', 'Cerberus is a big dog with three heads. He guards the Underworld.', 'קרברוס הוא כלב גדול עם שלושה ראשים. הוא שומר על השאול.'],
  ['typhon', 'Typhon', 'monster', '🌪️', 'Typhon is the biggest monster of all. He has a hundred snake heads. The gods are afraid of him.', 'טייפון הוא המפלצת הכי גדולה. יש לו מאה ראשי נחשים. האלים מפחדים ממנו.'],
  ['harpy', 'Harpy', 'monster', '🦅', 'A harpy is half woman and half bird. She flies fast and steals food.', 'הארפיה היא חצי אישה וחצי ציפור. היא עפה מהר וגונבת אוכל.'],
  ['chimera', 'The Chimera', 'monster', '🔥', 'The Chimera has a lion head and a snake tail. It breathes fire!', 'לכימרה יש ראש של אריה וזנב של נחש. היא יורקת אש!'],
  ['pegasus', 'Pegasus', 'friend', '🐴', 'Pegasus is a white horse with wings. He can fly above the clouds.', 'פגסוס הוא סוס לבן עם כנפיים. הוא יכול לעוף מעל העננים.'],
  ['chiron', 'Chiron', 'friend', '🏹', 'Chiron is a centaur. He is half man and half horse. He teaches young heroes.', 'כירון הוא קנטאור. הוא חצי אדם וחצי סוס. הוא מלמד גיבורים צעירים.'],
  ['hercules', 'Hercules', 'friend', '💪', 'Hercules is the strongest hero. He is a son of Zeus. He fought the Hydra.', 'הרקולס הוא הגיבור הכי חזק. הוא בן של זאוס. הוא נלחם בהידרה.'],
  ['ariadne', 'Ariadne', 'friend', '🧶', 'Ariadne is a clever princess. She has a long red thread. It helps heroes get out of the maze.', 'אריאדנה היא נסיכה חכמה. יש לה חוט אדום ארוך. הוא עוזר לגיבורים לצאת מהמבוך.'],
  // won on The Voyage of Odysseus (not for sale in the shop): the 7th field says where
  ['odysseus', 'Odysseus', 'friend', '⛵', 'Odysseus is a clever king. He sails home after the war in Troy.', 'אודיסאוס הוא מלך חכם. הוא מפליג הביתה אחרי המלחמה בטרויה.', 'voyage'],
  ['polyphemus', 'Polyphemus', 'monster', '🐑', 'Polyphemus is a Cyclops. He has one eye and many sheep.', 'פוליפמוס הוא קיקלופ. יש לו עין אחת והרבה כבשים.', 'voyage'],
  ['circe', 'Circe', 'friend', '🪄', 'Circe is a witch. She can turn men into pigs!', 'קירקה היא מכשפה. היא יכולה להפוך אנשים לחזירים!', 'voyage'],
  ['sirens', 'The Sirens', 'monster', '🎶', 'The Sirens sing beautiful songs. Sailors who listen hit the rocks.', 'הסירנות שרות שירים יפים. מלחים שמקשיבים מתנגשים בסלעים.', 'voyage'],
  ['scylla', 'Scylla', 'monster', '🐙', 'Scylla has six heads. She lives in a dark cave by the sea.', 'לסקילה יש שישה ראשים. היא גרה במערה חשוכה ליד הים.', 'voyage'],
  ['charybdis', 'Charybdis', 'monster', '🌀', 'Charybdis is a giant whirlpool. She drinks the sea three times a day.', 'כריבדיס היא מערבולת ענקית. היא שותה את הים שלוש פעמים ביום.', 'voyage'],
  ['penelope', 'Penelope', 'friend', '🧵', 'Penelope is the wife of Odysseus. She waits for him for twenty years.', 'פנלופה היא אשתו של אודיסאוס. היא מחכה לו עשרים שנה.', 'voyage'],
  ['argos', 'Argos', 'friend', '🐕', 'Argos is the dog of Odysseus. He knows his master after twenty years.', 'ארגוס הוא הכלב של אודיסאוס. הוא מכיר את האדון שלו אחרי עשרים שנה.', 'voyage'],
];
// pictures that already exist in other games, used until the card picture is drawn
const CARD_ART_FALLBACK = { zeus: 'assets/olympus/zeus.png', hermes: 'assets/hermes/hermes.png', typhon: 'assets/olympus/typhon.png', cyclops: 'assets/olympus/cyclops.png',
  harpy: 'assets/olympus/harpy.png', pegasus: 'assets/olympus/pegasus.png', hydra: 'assets/hydra_full.png', ariadne: 'assets/ariadne.png', minotaur: 'assets/minotaur_sleep.png',
  polyphemus: 'assets/olympus/cyclops.png', sirens: 'assets/olympus/harpy.png', scylla: 'assets/cards/hydra.png', argos: 'assets/shop/pet_dog.png' };
// every card costs more than the one before: the first is 60 drachmas, each next one 5 more (the last is 175, 2,820 for the whole album)
const CARD_PRICE_START = 60, CARD_PRICE_STEP = 5;
const cardPrice = owned => CARD_PRICE_START + CARD_PRICE_STEP * owned;
const SHOP_LINES = ['Welcome to my shop!', 'Here is a new card for you!', 'You need more drachmas. Play a game and come back!', 'You have all the cards! You are a true hero!'];
function cardPhrases() { return CARDS.map(c => c[4]); }
