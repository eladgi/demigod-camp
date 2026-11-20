// The Voyage of Odysseus: every sentence she reads, with Hebrew help.
// Story panels: { who, en, he } (who = whose picture and name show: odysseus, hermes, circe, cyclops, athena, poseidon, log, ...).
// The instructions on the islands are made by the generators in voyage.html from the lists here.

const VOY_ISLANDS = [ // [scene, place name, map note, hebrew, gift cards]
  ['Lotus',   'The Lotus Island',      'Sail to the island with pink flowers.',            'הפליגי לאי עם הפרחים הורודים.',              ['odysseus']],
  ['Cyclops', 'The Cyclops Cave',      'Sail to the island with a big cave.',              'הפליגי לאי עם המערה הגדולה.',               ['polyphemus']],
  ['Circe',   "Circe's Island",        'Sail to the island with a stone house.',           'הפליגי לאי עם בית האבן.',                    ['circe']],
  ['Sirens',  'The Sirens',            'Sail to the three rocks in the sea.',              'הפליגי לשלושת הסלעים בים.',                  ['sirens']],
  ['Strait',  'Scylla and Charybdis',  'Sail between the two tall cliffs.',                'הפליגי בין שני הצוקים הגבוהים.',             ['scylla', 'charybdis']],
  ['Storm',   "Poseidon's Storm",      'Sail to the dark clouds. Ithaca is behind them.',  'הפליגי לעננים השחורים. איתקה מאחוריהם.',      ['penelope', 'argos']],
];

const VOY_STORY = {
  intro: [
    { who: 'log', en: 'The war in Troy is over.', he: 'המלחמה בטרויה נגמרה.' },
    { who: 'odysseus', en: 'I am Odysseus. I want to go home to Ithaca.', he: 'אני אודיסאוס. אני רוצה לחזור הביתה לאיתקה.' },
    { who: 'poseidon', en: 'But Poseidon, the god of the sea, is angry!', he: 'אבל פוסידון, אל הים, כועס!' },
    { who: 'odysseus', en: 'Brave daughter of Zeus, please sail with me!', he: 'בת אמיצה של זאוס, בבקשה הפליגי איתי!' },
    { who: 'log', en: 'Use the arrows to sail. Press SPACE at an island.', he: 'השתמשי בחצים כדי להפליג. לחצי רווח ליד אי.' },
  ],
  Lotus: [
    { who: 'log', en: 'The ship stops at a sunny island.', he: 'הספינה עוצרת באי שטוף שמש.' },
    { who: 'log', en: 'Pink lotus flowers grow everywhere.', he: 'פרחי לוטוס ורודים צומחים בכל מקום.' },
    { who: 'log', en: 'Five sailors eat the flowers. Now they forget home!', he: 'חמישה מלחים אוכלים את הפרחים. עכשיו הם שוכחים את הבית!' },
    { who: 'odysseus', en: 'Bring my sailors back to the ship.', he: 'החזירי את המלחים שלי לספינה.' },
    { who: 'odysseus', en: 'Do not eat the flowers!', he: 'אל תאכלי את הפרחים!' },
  ],
  LotusEnd: [
    { who: 'odysseus', en: 'All my sailors are on the ship. Thank you!', he: 'כל המלחים שלי על הספינה. תודה!' },
  ],
  Cyclops1: [
    { who: 'log', en: 'The ship comes to the land of the Cyclopes.', he: 'הספינה מגיעה לארץ הקיקלופים.' },
    { who: 'log', en: 'You find a big cave with sheep and cheese.', he: 'את מוצאת מערה גדולה עם כבשים וגבינה.' },
    { who: 'cyclops', en: 'Oh no! The Cyclops comes home!', he: 'אוי לא! הקיקלופ חוזר הביתה!' },
    { who: 'cyclops', en: 'He closes the cave with a huge rock.', he: 'הוא סוגר את המערה בסלע ענק.' },
    { who: 'log', en: 'His name is Polyphemus. He is the son of Poseidon.', he: 'קוראים לו פוליפמוס. הוא הבן של פוסידון.' },
    { who: 'odysseus', en: 'Psst! If he asks your name, say "Nobody".', he: 'פססט! אם הוא שואל איך קוראים לך, תגידי "אף אחד".' },
  ],
  Cyclops2: [
    { who: 'cyclops', en: 'Nobody? What a funny name! Ha ha!', he: 'אף אחד? איזה שם מצחיק! הה הה!' },
    { who: 'log', en: 'At night, the Cyclops falls asleep.', he: 'בלילה, הקיקלופ נרדם.' },
    { who: 'log', en: 'In the morning, he lets the sheep go out.', he: 'בבוקר, הוא מוציא את הכבשים החוצה.' },
    { who: 'log', en: 'He feels the backs of the sheep. But not under them!', he: 'הוא ממשש את הגב של הכבשים. אבל לא מתחתיהן!' },
    { who: 'odysseus', en: 'We can hide under the sheep. Read my notes!', he: 'אנחנו יכולים להתחבא מתחת לכבשים. קראי את הפתקים שלי!' },
  ],
  CyclopsEnd: [
    { who: 'cyclops', en: 'Help! Nobody is running away!', he: 'הצילו! אף אחד בורח!' },
    { who: 'odysseus', en: 'Run to the ship! Sail away, fast!', he: 'רוצי לספינה! הפליגו מהר!' },
  ],
  Circe1: [
    { who: 'log', en: 'The ship comes to a green island.', he: 'הספינה מגיעה לאי ירוק.' },
    { who: 'log', en: 'There is a big stone house in the trees.', he: 'יש בית אבן גדול בין העצים.' },
    { who: 'log', en: 'Five sailors go to the house. They do not come back!', he: 'חמישה מלחים הולכים לבית. הם לא חוזרים!' },
    { who: 'hermes', en: 'Hello! I am Hermes. Your friends are in danger.', he: 'שלום! אני הרמס. החברים שלך בסכנה.' },
    { who: 'hermes', en: 'Circe is a witch. She turns men into pigs!', he: 'קירקה היא מכשפה. היא הופכת אנשים לחזירים!' },
    { who: 'hermes', en: 'Eat the moly flower. Then her magic will not work.', he: 'אכלי את פרח המולי. אז הקסם שלה לא יעבוד.' },
  ],
  Circe2: [
    { who: 'circe', en: 'Welcome! Here is some soup for you.', he: 'ברוכה הבאה! הנה קצת מרק בשבילך.' },
    { who: 'log', en: 'You ate the moly flower. So you drink the soup.', he: 'אכלת את פרח המולי. אז את שותה את המרק.' },
    { who: 'circe', en: 'Oh no! My magic does not work on you!', he: 'אוי לא! הקסם שלי לא עובד עלייך!' },
    { who: 'circe', en: 'Please do not hurt me. I will help you.', he: 'בבקשה אל תפגעי בי. אני אעזור לך.' },
    { who: 'odysseus', en: 'Then turn my friends back into men!', he: 'אז החזירי את החברים שלי להיות בני אדם!' },
    { who: 'circe', en: 'Find each pig. I will turn it back.', he: 'מצאי כל חזיר. אני אחזיר אותו.' },
  ],
  CirceEnd: [
    { who: 'circe', en: 'Your friends are men again. I am your friend now.', he: 'החברים שלך שוב בני אדם. אני החברה שלך עכשיו.' },
    { who: 'circe', en: 'Next you will meet the Sirens. They sing beautiful songs.', he: 'בהמשך תפגשי את הסירנות. הן שרות שירים יפים.' },
    { who: 'circe', en: 'Do not listen to them! Put wax in your ears.', he: 'אל תקשיבו להן! שימו שעווה באוזניים.' },
  ],
  Sirens1: [
    { who: 'log', en: 'The sea is very quiet. The Sirens are near.', he: 'הים שקט מאוד. הסירנות קרובות.' },
    { who: 'odysseus', en: 'I want to hear the song. But I must not go to them.', he: 'אני רוצה לשמוע את השיר. אבל אסור לי ללכת אליהן.' },
    { who: 'odysseus', en: 'Help my sailors first. Read my notes.', he: 'עזרי קודם למלחים שלי. קראי את הפתקים שלי.' },
  ],
  Sirens2: [
    { who: 'log', en: 'Now the Sirens start to sing.', he: 'עכשיו הסירנות מתחילות לשיר.' },
    { who: 'odysseus', en: 'Only you can steer the ship. Follow my notes!', he: 'רק את יכולה לנווט את הספינה. עקבי אחרי הפתקים שלי!' },
    { who: 'siren', en: 'The Sirens send notes too. Do not follow them!', he: 'גם הסירנות שולחות פתקים. אל תעקבי אחריהם!' },
    { who: 'log', en: 'Use LEFT and RIGHT to steer.', he: 'השתמשי בחצים ימינה ושמאלה כדי לנווט.' },
  ],
  SirensEnd: [
    { who: 'log', en: 'The song stops. You did it!', he: 'השיר נגמר. הצלחת!' },
    { who: 'odysseus', en: 'You did not listen to the Sirens. You are very brave!', he: 'לא הקשבת לסירנות. את אמיצה מאוד!' },
  ],
  Strait1: [
    { who: 'log', en: 'Now the sea is narrow. There are two monsters here.', he: 'עכשיו הים צר. יש פה שתי מפלצות.' },
    { who: 'log', en: 'Scylla has six heads. She lives in a dark cave.', he: 'לסקילה יש שישה ראשים. היא גרה במערה חשוכה.' },
    { who: 'log', en: 'Charybdis is a giant water circle. She pulls ships down.', he: 'כריבדיס היא מערבולת ענקית. היא מושכת ספינות למטה.' },
    { who: 'odysseus', en: 'You cannot see them well. Read my notes!', he: 'את לא יכולה לראות אותן טוב. קראי את הפתקים שלי!' },
    { who: 'log', en: 'UP to row. LEFT and RIGHT to steer.', he: 'למעלה כדי לחתור. ימינה ושמאלה כדי לנווט.' },
  ],
  StraitEnd: [
    { who: 'odysseus', en: 'We passed Scylla and Charybdis!', he: 'עברנו את סקילה וכריבדיס!' },
    { who: 'odysseus', en: 'Ithaca is close now.', he: 'איתקה קרובה עכשיו.' },
  ],
  Storm1: [
    { who: 'poseidon', en: 'I am Poseidon! You will not go home!', he: 'אני פוסידון! אתם לא תחזרו הביתה!' },
    { who: 'athena', en: 'I am Athena. I will help you in the storm.', he: 'אני אתנה. אני אעזור לך בסערה.' },
    { who: 'athena', en: 'It is dark. Read my notes and move the ship.', he: 'חשוך. קראי את הפתקים שלי והזיזי את הספינה.' },
  ],
  Ithaca: [
    { who: 'log', en: 'The storm is over. The sun is shining.', he: 'הסערה נגמרה. השמש זורחת.' },
    { who: 'log', en: 'You see an island. It is Ithaca!', he: 'את רואה אי. זו איתקה!' },
    { who: 'argos', en: 'An old dog runs to Odysseus. His name is Argos.', he: 'כלב זקן רץ אל אודיסאוס. קוראים לו ארגוס.' },
    { who: 'argos', en: 'Argos knows him after twenty years!', he: 'ארגוס מכיר אותו אחרי עשרים שנה!' },
    { who: 'penelope', en: 'Penelope hugs Odysseus. He is home at last!', he: 'פנלופה מחבקת את אודיסאוס. הוא סוף סוף בבית!' },
    { who: 'odysseus', en: 'Thank you, my brave friend!', he: 'תודה, חברה אמיצה שלי!' },
  ],
};

// Captain's log: what happened, when she is back on the ship after an island
const VOY_LOG = [
  [{ who: 'log', en: 'Captain\'s log: All the sailors are back.', he: 'יומן הקפטן: כל המלחים חזרו.' },
   { who: 'log', en: 'Now we need food. We sail on.', he: 'עכשיו אנחנו צריכים אוכל. אנחנו ממשיכים להפליג.' }],
  [{ who: 'log', en: 'Captain\'s log: We escaped from the Cyclops!', he: 'יומן הקפטן: ברחנו מהקיקלופ!' },
   { who: 'log', en: 'But he called his father, Poseidon.', he: 'אבל הוא קרא לאבא שלו, פוסידון.' },
   { who: 'poseidon', en: 'Now Poseidon is very angry.', he: 'עכשיו פוסידון כועס מאוד.' }],
  [{ who: 'log', en: 'Captain\'s log: Circe is our friend now.', he: 'יומן הקפטן: קירקה החברה שלנו עכשיו.' },
   { who: 'log', en: 'She told us about the Sirens.', he: 'היא סיפרה לנו על הסירנות.' }],
  [{ who: 'log', en: 'Captain\'s log: We heard the Sirens, but we did not stop!', he: 'יומן הקפטן: שמענו את הסירנות, אבל לא עצרנו!' },
   { who: 'log', en: 'Next: two monsters in a narrow sea.', he: 'הבא: שתי מפלצות בים צר.' }],
  [{ who: 'log', en: 'Captain\'s log: We are almost home!', he: 'יומן הקפטן: אנחנו כמעט בבית!' },
   { who: 'log', en: 'But dark clouds are in front of us.', he: 'אבל עננים שחורים לפנינו.' }],
];

// Messages in bottles on the map (extra reading, extra gold): [rock, english, hebrew]
const VOY_ROCKS = [
  ['bird', 'Gold is next to the rock with a bird.', 'הזהב ליד הסלע עם הציפור.'],
  ['tree', 'Gold is next to the rock with a little tree.', 'הזהב ליד הסלע עם העץ הקטן.'],
  ['flag', 'Gold is next to the rock with a red flag.', 'הזהב ליד הסלע עם הדגל האדום.'],
  ['shell', 'Gold is next to the rock with a big shell.', 'הזהב ליד הסלע עם הצדף הגדול.'],
];
