// Shared by all the mini-games: saved progress, the English voice and simple sound effects.

const Save = {
  key: 'demigodSave',
  get() {
    try { return Object.assign({ coins: 0, best: {} }, JSON.parse(localStorage.getItem(this.key)) || {}); }
    catch (e) { return { coins: 0, best: {} }; }
  },
  set(s) { try { localStorage.setItem(this.key, JSON.stringify(s)); } catch (e) {} },
  addCoins(n) { const s = this.get(); s.coins = (s.coins || 0) + n; this.set(s); return s.coins; },
  markDone(game, value) { const s = this.get(); s.best[game] = Math.max(s.best[game] || 0, value); this.set(s); },
};

// ---------- words: [english, emoji fallback, hebrew, hebrew gender] ----------
// Picture files live in assets/icons/<english with _ for spaces>.png; the emoji is used until a picture exists.
const WORD_LIST_1 = [ // first set (already learned)
  ['cat','🐱','חתול','m'], ['dog','🐶','כלב','m'], ['fish','🐟','דג','m'], ['frog','🐸','צפרדע','f'],
  ['owl','🦉','ינשוף','m'], ['horse','🐴','סוס','m'], ['lion','🦁','אריה','m'], ['snake','🐍','נחש','m'],
  ['apple','🍎','תפוח','m'], ['banana','🍌','בננה','f'], ['cake','🎂','עוגה','f'], ['ball','⚽','כדור','m'],
  ['star','⭐','כוכב','m'], ['sun','☀️','שמש','f'], ['moon','🌙','ירח','m'], ['tree','🌳','עץ','m'],
];
const WORD_LIST_2 = [ // current set
  ['bear','🐻','דוב','m'], ['rabbit','🐰','ארנב','m'], ['monkey','🐵','קוף','m'], ['elephant','🐘','פיל','m'],
  ['pizza','🍕','פיצה','f'], ['ice cream','🍦','גלידה','f'], ['egg','🥚','ביצה','f'], ['carrot','🥕','גזר','m'],
  ['hat','🎩','כובע','m'], ['shoe','👟','נעל','f'], ['umbrella','☂️','מטריה','f'], ['clock','⏰','שעון','m'],
  ['car','🚗','מכונית','f'], ['boat','⛵','סירה','f'], ['plane','✈️','מטוס','m'], ['bus','🚌','אוטובוס','m'],
];
const WORDS = WORD_LIST_2;
// List of art files that exist (assets/manifest.json, written by tools/manifest.py).
// Games call loadManifest() before starting and only request files that are listed; with no manifest, everything is tried.
let ASSETS = null;
function loadManifest() {
  return fetch('assets/manifest.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(list => { ASSETS = list ? new Set(list) : null; }).catch(() => {});
}
const assetExists = path => !ASSETS || ASSETS.has(path);
const iconKey = w => 'icon_' + w.replace(/ /g, '_');
const iconFile = w => 'assets/icons/' + w.replace(/ /g, '_') + '.png';

// English voice (browser text-to-speech for now)
let _voice = null;
function _pickVoice() {
  const v = speechSynthesis.getVoices();
  _voice = v.find(x => /en-US/.test(x.lang) && /female|zira|aria|jenny|samantha|google us/i.test(x.name)) || v.find(x => /^en/.test(x.lang)) || null;
}
if (window.speechSynthesis) { speechSynthesis.onvoiceschanged = _pickVoice; _pickVoice(); }
// Recorded voice (ElevenLabs, made by tools/make_voices.mjs) when there is a recording, browser voice otherwise.
// voice: undefined = the narrator, 'zeus' = Zeus (recordings in assets/audio/zeus/)
const audioFile = (text, voice) => 'assets/audio/' + (voice ? voice + '/' : '') + text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '.mp3';
let _clip = null;
const _clips = {};
function say(text, voice) {
  if (window.speechSynthesis) speechSynthesis.cancel();
  if (_clip) { _clip.pause(); _clip.currentTime = 0; }
  const f = audioFile(text, voice);
  if (ASSETS && ASSETS.has(f)) {
    _clip = _clips[f] = _clips[f] || new Audio(f);
    _clip.currentTime = 0;
    _clip.play().catch(() => {});
    return;
  }
  _speak(text, voice);
}
function _speak(text, voice) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  if (_voice) u.voice = _voice;
  u.lang = 'en-US'; u.rate = 0.85; u.pitch = voice === 'zeus' ? 0.6 : 1.05;
  speechSynthesis.speak(u);
}

// tiny synth for sound effects, no audio files needed
let _ac;
function tone(f1, f2, dur, type = 'square', vol = .1) {
  try {
    _ac = _ac || new AudioContext();
    const o = _ac.createOscillator(), g = _ac.createGain(); o.type = type;
    o.frequency.setValueAtTime(f1, _ac.currentTime); o.frequency.exponentialRampToValueAtTime(f2, _ac.currentTime + dur);
    g.gain.setValueAtTime(vol, _ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, _ac.currentTime + dur);
    o.connect(g).connect(_ac.destination); o.start(); o.stop(_ac.currentTime + dur);
  } catch (e) {}
}

// ---------- sharp rendering ----------
// The games are designed at 1280x720. Instead of drawing at that size and letting the browser stretch it (blurry),
// the canvas is HD times bigger and the cameras zoom in by HD, so everything is drawn at the screen's real resolution.
const HD = Math.max(1, Math.min(2.5, Math.ceil(Math.min(innerWidth / 1280, innerHeight / 720) * (window.devicePixelRatio || 1) * 4) / 4));

// Call every frame. Gives every text HD resolution, and (when a UI camera is used) shows screen-fixed things
// (scrollFactor 0) only on the UI camera and world things only on the main camera.
function hdTick(scene, uiCam) {
  const walk = (list, top) => {
    for (const o of list) {
      if (o.type === 'Text' && !o._hdText) { o._hdText = true; o.setResolution(HD); }
      if (top && uiCam && !o._hdCam) {
        o._hdCam = true;
        if (o.scrollFactorX === 0) scene.cameras.main.ignore(o); else uiCam.ignore(o);
      }
      if (o.list) walk(o.list, false);
    }
  };
  walk(scene.children.list, true);
}

function goToCamp() { speechSynthesis && speechSynthesis.cancel(); location.href = 'index.html'; }

// =====================================================================
//  GEAR from Hermes' Shop: a pet that goes with the hero, something on her head and a magic trail, in every game.
//  A game calls Gear.preload(this) in preload() and Gear.attach(this, this.heroImg) in create(); the rest happens by itself.
// =====================================================================
// id: [name, kind (pet / head / trail), price, picture ('' = drawn by code), what Hermes says, extra]
// pets: move = fly / walk / hop, size = part of her height, left = the picture looks to the left
const GEAR_ITEMS = {
  frog:     ['Green Frog', 'pet', 100, 'assets/shop/pet_frog.png', 'This is a green frog. Hop, hop, hop!', { move: 'hop', size: 0.26 }],
  cat:      ['Little Cat', 'pet', 120, 'assets/shop/pet_cat.png', 'This is a little cat. It walks with you.', { move: 'walk', size: 0.32 }],
  dog:      ['Happy Dog', 'pet', 120, 'assets/shop/pet_dog.png', 'This is a happy dog. It runs with you!', { move: 'walk', size: 0.36 }],
  rabbit:   ['White Rabbit', 'pet', 120, 'assets/shop/pet_rabbit.png', 'This is a white rabbit. It hops after you!', { move: 'hop', size: 0.32 }],
  owl:      ["Athena's Owl", 'pet', 150, 'assets/shop/pet_owl.png', 'This is the owl of Athena. It flies with you everywhere!', { move: 'fly', size: 0.34 }],
  monkey:   ['Funny Monkey', 'pet', 150, 'assets/shop/pet_monkey.png', 'This is a funny monkey. It follows you everywhere.', { move: 'walk', size: 0.36 }],
  elephant: ['Little Elephant', 'pet', 200, 'assets/shop/pet_elephant.png', 'This is a little elephant. It is big and kind.', { move: 'walk', size: 0.46 }],
  lion:     ['Little Lion', 'pet', 250, 'assets/shop/pet_lion.png', 'This is a little lion. It is brave like you!', { move: 'walk', size: 0.42 }],
  pegasus:  ['Baby Pegasus', 'pet', 500, 'assets/shop/pet_pegasus.png', 'This is a baby Pegasus. It has wings and it can fly!', { move: 'fly', size: 0.5 }],
  flowers:  ['Flower Crown', 'head', 120, '', 'This is a flower crown. It smells so nice!'],
  tiara:    ['Silver Tiara', 'head', 180, '', 'This is a silver tiara with a star.'],
  crown:    ['Golden Crown', 'head', 200, '', 'This is a golden crown. You look like a queen!'],
  hearts:   ['Pink Hearts', 'trail', 200, '', 'Little pink hearts follow you when you run!', { colors: [0xff7eb6, 0xffc2dc, 0xffffff] }],
  sparkles: ['Gold Sparkles', 'trail', 250, '', 'Golden sparkles follow you when you run!', { colors: [0xffd43b, 0xfff3a0, 0xffffff] }],
  lightning:["Zeus' Sparks", 'trail', 300, '', 'Blue sparks follow you, like the lightning of Zeus!', { colors: [0x4fd1ff, 0x9bd8ff, 0xffffff] }],
};
const Gear = {
  equipped() { const s = Save.get(); return s.equip || {}; },
  // a pet's picture: the Nano Banana side view (assets/shop/pet_<id>.png), or the old word-game icon if it is missing
  OLD_ICON: { pegasus: 'horse' },
  picOf(id) { const p = GEAR_ITEMS[id][3]; if (!p || GEAR_ITEMS[id][1] !== 'pet' || assetExists(p)) return p; return 'assets/icons/' + (this.OLD_ICON[id] || id) + '.png'; },
  preload(scene) {
    const e = this.equipped(), it = e.pet && GEAR_ITEMS[e.pet];
    if (it && it[3] && assetExists(this.picOf(e.pet)) && !scene.textures.exists('gear_' + e.pet)) scene.load.image('gear_' + e.pet, this.picOf(e.pet));
    if (e.head) this.VIEWS.forEach(v => { const f = `assets/shop/${e.head}_${v}.png`; if (ASSETS && ASSETS.has(f) && !scene.textures.exists(`gear_${e.head}_${v}`)) scene.load.image(`gear_${e.head}_${v}`, f); });
  },

  // ---------- pictures drawn by code ----------
  // head things: on a 120 x 84 canvas, in three views: 'front', 'side' (looking to the RIGHT; mirrored for left) and 'back'
  // trail bits: on 32 x 32, white (the game colours them)
  draw: {
    crown(x, v = 'front') {
      const pts = v === 'side' ? [[22, 76], [22, 34], [42, 52], [64, 12], [84, 50], [102, 30], [102, 76]]
                               : [[8, 76], [8, 30], [32, 50], [60, 8], [88, 50], [112, 30], [112, 76]];
      const shape = () => { x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.closePath(); };
      x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = '#2b1a0a'; shape(); x.stroke();
      const g = x.createLinearGradient(0, 8, 0, 76);
      g.addColorStop(0, v === 'back' ? '#f2df8a' : '#fff3a0'); g.addColorStop(0.5, v === 'back' ? '#e8b42e' : '#ffc93b'); g.addColorStop(1, '#c98a00');
      x.fillStyle = g; shape(); x.fill();
      if (v === 'side') { const s = x.createLinearGradient(22, 0, 102, 0); s.addColorStop(0, 'rgba(120,70,0,.35)'); s.addColorStop(0.5, 'rgba(120,70,0,0)'); x.fillStyle = s; shape(); x.fill(); }
      const bandL = v === 'side' ? 24 : 10, bandR = v === 'side' ? 100 : 110;
      x.fillStyle = '#e8a400'; x.fillRect(bandL, 60, bandR - bandL, 14);
      // gems on the front only: all three from the front, two on the front half from the side, none from the back
      const gems = v === 'front' ? [[30, '#e84545'], [60, '#3b82f6'], [90, '#3fbf6f']] : v === 'side' ? [[70, '#3b82f6'], [92, '#3fbf6f']] : [];
      gems.forEach(([gx, c]) => Gear.gem(x, gx, 67, v === 'side' ? 7 : 8, c));
      pts.filter((p, i) => i === 1 || i === 3 || i === 5).forEach(([bx, by]) => Gear.gem(x, bx, by, 7, '#fff3a0'));
    },
    tiara(x, v = 'front') {
      x.lineJoin = 'round'; x.lineCap = 'round';
      // the band: an arch from the front, rising toward the face from the side, a low arch from the back
      const band = v === 'front' ? () => { x.beginPath(); x.moveTo(8, 74); x.quadraticCurveTo(60, 20, 112, 74); }
                 : v === 'side'  ? () => { x.beginPath(); x.moveTo(14, 74); x.quadraticCurveTo(60, 70, 98, 50); }
                 :                 () => { x.beginPath(); x.moveTo(14, 74); x.quadraticCurveTo(60, 50, 106, 74); };
      x.lineWidth = 16; x.strokeStyle = '#2b1a0a'; band(); x.stroke();
      x.lineWidth = 9; x.strokeStyle = '#dfe6ee'; band(); x.stroke();
      x.lineWidth = 3; x.strokeStyle = '#ffffff'; band(); x.stroke();
      if (v === 'front') {
        Gear.star(x, 60, 30, 22, '#2b1a0a'); Gear.star(x, 60, 30, 16, '#9bd8ff'); Gear.star(x, 58, 28, 6, '#ffffff');
        [[30, 55], [90, 55]].forEach(([gx, gy]) => Gear.gem(x, gx, gy, 7, '#ff9bd2'));
      } else if (v === 'side') {
        // the star seen from the side: narrow, standing on the front of the band
        x.save(); x.translate(98, 34); x.scale(0.5, 1);
        Gear.star(x, 0, 0, 22, '#2b1a0a'); Gear.star(x, 0, 0, 16, '#9bd8ff'); x.restore();
        Gear.gem(x, 62, 66, 6, '#ff9bd2');
      }
    },
    flowers(x, v = 'front') {
      const band = v === 'side' ? [[12, 70], [60, 68], [108, 60]] : v === 'back' ? [[12, 72], [60, 58], [108, 72]] : [[10, 72], [60, 44], [110, 72]];
      const line = () => { x.beginPath(); x.moveTo(...band[0]); x.quadraticCurveTo(...band[1], ...band[2]); };
      x.lineWidth = 10; x.strokeStyle = '#2b1a0a'; line(); x.stroke();
      x.lineWidth = 5; x.strokeStyle = '#5fbf4a'; line(); x.stroke();
      const flowers = v === 'front' ? [[16, 68, '#ff7eb6', 1], [38, 58, '#ffd43b', 1], [60, 54, '#ffffff', 1], [82, 58, '#9bd8ff', 1], [104, 68, '#ff7eb6', 1]]
                    : v === 'side' ? [[26, 68, '#9bd8ff', 0.8], [56, 64, '#ffffff', 0.9], [86, 62, '#ffd43b', 1], [106, 58, '#ff7eb6', 1.1]]
                    :                [[22, 68, '#ffd43b', 0.85], [46, 61, '#ff7eb6', 0.85], [74, 61, '#9bd8ff', 0.85], [98, 68, '#ffffff', 0.85]];
      flowers.forEach(([fx, fy, c, k]) => {
        for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; x.fillStyle = '#2b1a0a'; x.beginPath(); x.arc(fx + Math.cos(a) * 8 * k, fy + Math.sin(a) * 8 * k, 7 * k, 0, 7); x.fill(); }
        for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; x.fillStyle = c; x.beginPath(); x.arc(fx + Math.cos(a) * 8 * k, fy + Math.sin(a) * 8 * k, 5 * k, 0, 7); x.fill(); }
        x.fillStyle = '#ffb000'; x.beginPath(); x.arc(fx, fy, 4.5 * k, 0, 7); x.fill();
      });
    },
    // trail bits: a heart, a star, a spark (white, the game colours them)
    hearts(x) { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(16, 28); x.bezierCurveTo(-6, 14, 4, -2, 16, 9); x.bezierCurveTo(28, -2, 38, 14, 16, 28); x.fill(); },
    sparkles(x) { Gear.star(x, 16, 16, 15, '#fff'); },
    lightning(x) { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(19, 1); x.lineTo(6, 18); x.lineTo(15, 18); x.lineTo(11, 31); x.lineTo(26, 12); x.lineTo(17, 12); x.closePath(); x.fill(); },
  },
  gem(x, gx, gy, r, c) {
    x.fillStyle = '#2b1a0a'; x.beginPath(); x.arc(gx, gy, r, 0, 7); x.fill();
    x.fillStyle = c; x.beginPath(); x.arc(gx, gy, r - 2.5, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(gx - r * 0.3, gy - r * 0.3, r * 0.25, 0, 7); x.fill();
  },
  star(x, cx, cy, r, c) {
    x.fillStyle = c; x.beginPath();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    x.closePath(); x.fill();
  },
  // a picture drawn by code, for the shop (any canvas) or the games (a texture)
  canvasSize(id) { return GEAR_ITEMS[id][1] === 'trail' ? [32, 32] : [120, 84]; },
  // the picture of a thing in one view: Nano Banana art (assets/shop/<id>_<view>.png, loaded in preload) or else drawn here
  texture(scene, id, view = 'front') {
    const kind = GEAR_ITEMS[id][1], key = kind === 'head' ? `gear_${id}_${view}` : 'gear_' + id;
    if (!scene.textures.exists(key)) { const [w, h] = this.canvasSize(id), c = scene.textures.createCanvas(key, w, h); this.draw[id](c.getContext(), view); c.refresh(); }
    return key;
  },
  VIEWS: ['front', 'side', 'back'],
  // which way she faces in the picture shown now: [view, mirrored?]
  // walking sheet rows: 0 toward us, 1 to the left, 2 to the right, 3 away; the jump picture looks to the right
  heroView(h) {
    const key = h.texture.key;
    if (key === 'hero_walk') { const row = Math.floor(+h.frame.name / 4); return row === 1 ? ['side', true] : row === 2 ? ['side', false] : row === 3 ? ['back', false] : ['front', false]; }
    if (key === 'hero_jump') return ['side', h.flipX];
    return ['front', false];
  },

  // ---------- where her head and feet are in one picture of the hero, measured once per picture ----------
  HEAD_FIX: { hero_jump: [90, 52, 46] },  // in the jump picture the braid flies right beside the head: [x, y of the head top, head width]
  NO_HEAD: ['hero_duck', 'hero_swim'],    // the shield covers her head / she lies in the water: nothing on the head then
  // How each head thing sits, for the Nano Banana pictures (made by tools/make_hats.py), per view:
  //   w  = width of the picture, in head widths        y = how far below the top of her head its anchor sits, in head widths
  //   oy = which height of the picture is the anchor (0 top, 0.5 middle, 1 bottom)        x = shift toward her face, in head widths
  // 'drawn' is for the simple pictures drawn by code (used only if the art is missing).
  HEAD_FIT: {
    drawn:   { w: 0.24, oy: 0.82 },
    flowers: { front: { w: 1.12, y: 0.27, oy: 0.5 }, side: { w: 1.08, y: 0.27, oy: 0.5 }, back: { w: 1.12, y: 0.27, oy: 0.5 } },
    tiara:   { front: { w: 1.02, y: 0.44, oy: 1 }, side: { w: 0.92, y: 0.44, oy: 0.8, x: 0.1 }, back: { w: 1.02, y: 0.44, oy: 1 } },
    crown:   { front: { w: 0.95, y: 0.27, oy: 1 }, side: { w: 0.95, y: 0.29, oy: 0.93 }, back: { w: 0.95, y: 0.27, oy: 1 } },
  },
  anchor(scene, key, frameName) {
    this._a = this._a || {};
    const id = key + ':' + frameName;
    if (!this._a[id]) {
      const f = scene.textures.getFrame(key, frameName), c = document.createElement('canvas');
      c.width = f.cutWidth; c.height = f.cutHeight;
      const x = c.getContext('2d'); x.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
      const d = x.getImageData(0, 0, c.width, c.height).data, solid = (i, y) => d[(y * c.width + i) * 4 + 3] > 60;
      let top = -1, bottom = 0;
      for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i++) if (solid(i, y)) { if (top < 0) top = y; bottom = y; break; }
      const h = Math.max(1, bottom - top + 1);
      // the head is the first part from the top that is as wide as a head (a flying braid or a raised hand is thinner)
      const widest = y => { let best = [0, 0], run = 0; for (let i = 0; i <= c.width; i++) { if (i < c.width && solid(i, y)) run++; else { if (run > best[0]) best = [run, i - run / 2]; run = 0; } } return best; };
      let headTop = top;
      for (let y = top; y < top + h * 0.4; y++) if (widest(y)[0] >= h * 0.12) { headTop = y; break; }
      let sx = 0, n = 0;
      for (let y = headTop; y < headTop + h * 0.06; y++) { const [wd, cx] = widest(y); if (wd) { sx += cx; n++; } }
      // how wide her head (with hair) is: the widest part a little below the top of the head
      let hw = 0;
      for (let y = headTop + Math.round(h * 0.03); y < headTop + h * 0.12; y++) hw = Math.max(hw, widest(y)[0]);
      const fix = this.HEAD_FIX[key];
      this._a[id] = { x: fix ? fix[0] : n ? sx / n : c.width / 2, y: fix ? fix[1] : Math.max(top, Math.round(headTop - h * 0.03)), hw: fix ? fix[2] : hw, feet: bottom, h, w: c.width, fh: c.height };
    }
    return this._a[id];
  },

  // ---------- in a game ----------
  // opts.state(): what she is doing now, for side-view games: 'ground', 'air' (a jump), 'climb', 'ride' or 'swim'.
  // Without it she is always on the ground (the top-down games).
  attach(scene, hero, opts = {}) {
    const e = this.equipped(), g = { scene, hero, facing: 1, lastX: hero.x, lastY: hero.y, t: 0, walked: 0, state: opts.state || (() => 'ground') };
    if (e.head && GEAR_ITEMS[e.head] && this.draw[e.head]) { g.headId = e.head; this.VIEWS.forEach(v => this.texture(scene, e.head, v)); g.head = scene.add.image(0, 0, this.texture(scene, e.head)).setOrigin(0.5, 0.82); }
    if (e.pet && GEAR_ITEMS[e.pet] && scene.textures.exists('gear_' + e.pet)) { g.pet = scene.add.image(hero.x, hero.y, 'gear_' + e.pet); g.petInfo = GEAR_ITEMS[e.pet][5]; }
    if (e.trail && GEAR_ITEMS[e.trail]) {
      g.trail = scene.add.particles(0, 0, this.texture(scene, e.trail), {
        lifespan: { min: 500, max: 900 }, speed: { min: 8, max: 45 }, gravityY: -40, rotate: { min: -40, max: 40 },
        // the size follows her size in this game (g.pScale is set every frame)
        scale: { onEmit: () => g.pScale || 0.5, onUpdate: (pt, key, t) => (g.pScale || 0.5) * (1 - t) },
        alpha: { start: 1, end: 0 }, tint: GEAR_ITEMS[e.trail][5].colors, emitting: false });
    }
    if (!g.head && !g.pet && !g.trail) return g;
    const tick = (time, delta) => this.update(g, Math.min(delta, 50) / 1000);
    scene.events.on('postupdate', tick);
    scene.events.once('shutdown', () => scene.events.off('postupdate', tick));
    return g;
  },
  update(g, dt) {
    const h = g.hero, sc = g.scene;
    if (!h.active || !h.frame) return;
    g.t += dt;
    const a = this.anchor(sc, h.texture.key, h.frame.name);
    const heroH = a.h * Math.abs(h.scaleY);
    // her standing height: measured only on the walking/standing pictures, kept while she ducks, swims or jumps
    if (h.texture.key === 'hero_walk' || h.texture.key === 'hero' || !g.standH) g.standH = heroH;
    const standH = g.standH;
    // which way she looks: from how she moves, or the mirrored picture
    const dx = h.x - g.lastX, dy = h.y - g.lastY; g.lastX = h.x; g.lastY = h.y;
    if (Math.abs(dx) > 0.3) g.facing = dx > 0 ? 1 : -1; else if (h.flipX) g.facing = -1;
    const moving = Math.hypot(dx, dy) > 0.5;
    // a point of the picture in the world (works with mirroring, size changes and tilting)
    const world = (px, py) => {
      const lx = (px - a.w / 2) * (h.flipX ? -1 : 1) * h.scaleX, ly = (py - h.originY * a.fh) * h.scaleY, r = h.rotation;
      return [h.x + lx * Math.cos(r) - ly * Math.sin(r), h.y + lx * Math.sin(r) + ly * Math.cos(r)];
    };
    const [hx, hy] = world(a.x, a.y), feetY = world(a.x, a.feet)[1];
    const show = h.visible && h.alpha > 0.05;
    if (g.head) {
      const r = h.rotation;
      const [view, mirror] = this.heroView(h), key = `gear_${g.headId}_${view}`;
      if (g.head.texture.key !== key) g.head.setTexture(key);
      g.head.setFlipX(mirror);
      g.head.setVisible(show && !this.NO_HEAD.includes(h.texture.key)).setAlpha(h.alpha).setDepth(h.depth + 0.5).setRotation(r);
      const tex = sc.textures.get(key).source[0], art = !tex.isCanvas && this.HEAD_FIT[g.headId];
      let down = heroH * 0.06, fwd = 0;
      if (art) {   // sized and placed by her head
        const fit = this.HEAD_FIT[g.headId][view], headW = a.hw * Math.abs(h.scaleX);
        g.head.setScale(headW * fit.w / tex.width).setOrigin(0.5, fit.oy);
        down = headW * fit.y; fwd = headW * (fit.x || 0) * (view === 'side' ? (mirror ? -1 : 1) : 1);
      } else g.head.setScale(heroH * this.HEAD_FIT.drawn.w / 120).setOrigin(0.5, this.HEAD_FIT.drawn.oy);
      g.head.setPosition(hx - Math.sin(r) * down + Math.cos(r) * fwd, hy + Math.cos(r) * down + Math.sin(r) * fwd);
    }
    if (g.pet) this.updatePet(g, dt, hx, hy, feetY, standH, show, h);
    if (g.trail) {
      g.trail.setDepth(h.depth - 0.2);
      if (moving && show) {
        g.walked += Math.hypot(dx, dy);
        const step = standH * 0.16;
        g.pScale = standH * 0.13 / 32;
        while (g.walked > step) {
          g.walked -= step;
          g.trail.emitParticleAt(h.x - g.facing * standH * 0.12 + (Math.random() - 0.5) * standH * 0.2, feetY - standH * (0.15 + Math.random() * 0.45), 1);
        }
      }
    }
  },
  updatePet(g, dt, hx, hy, feetY, H, show, h) {
    const p = g.pet, info = g.petInfo, fly = info.move === 'fly', size = H * info.size;
    const st = g.state();
    p.setDisplaySize(size, size * p.height / p.width).setOrigin(0.5, fly ? 0.5 : 1);
    if (st === 'ground') g.groundY = feetY;
    // flyers float beside her shoulder wherever she goes; walkers and hoppers stay on the ground:
    //   jump -> they keep running along the ground under her; climb / swim / Pegasus -> they sit and wait
    const wait = !fly && (st === 'climb' || st === 'swim' || st === 'ride');
    let tx = hx - g.facing * H * (fly ? 0.42 : 0.5);
    let ty = fly ? hy + H * 0.12 + Math.sin(g.t * 3.2) * H * 0.05 : (g.groundY ?? feetY);
    if (wait) { tx = p.x; ty = p.baseY ?? ty; }
    // she is back on the ground far away (after a climb, the Pegasus, the water): the pet pops over to her
    if (!fly && st === 'ground' && (Math.abs(tx - p.x) > H * 2.5 || Math.abs(ty - (p.baseY ?? ty)) > H * 0.6)) {
      p.x = tx; p.baseY = ty;
      this.scene_poof(g, tx, ty - size * 0.4, size);
    }
    const k = 1 - Math.exp(-dt * (fly ? 5 : 6));
    const vx = (tx - p.x) * k; p.x += vx; p.baseY = (p.baseY ?? ty) + (ty - (p.baseY ?? ty)) * k;
    let lift = 0;
    if (!wait && info.move === 'walk' && Math.abs(vx) > 0.3) lift = Math.abs(Math.sin(g.t * 14)) * H * 0.035;
    if (!wait && info.move === 'hop') lift = Math.max(0, Math.sin(g.t * (Math.abs(vx) > 0.3 ? 9 : 2.2))) * H * (Math.abs(vx) > 0.3 ? 0.12 : 0.03);
    p.y = p.baseY - lift;
    // it looks where it walks; while waiting it looks at her
    const lookLeft = wait ? h.x < p.x : Math.abs(vx) > 0.4 ? vx < 0 : g.facing < 0;
    p.setFlipX(info.left ? !lookLeft : lookLeft);
    p.setAngle(fly ? Phaser.Math.Clamp(vx * 1.2, -12, 12) : 0);
    p.setVisible(show || wait).setAlpha(wait ? 1 : h.alpha).setDepth(fly ? h.depth + 0.6 : h.depth - 0.1);
  },
  // a little puff of stars where the pet appears
  scene_poof(g, x, y, size) {
    const sc = g.scene, key = this.texture(sc, 'sparkles');
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, s = sc.add.image(x, y, key).setTint(0xfff3a0).setScale(size / 90).setDepth(g.pet.depth + 1);
      sc.tweens.add({ targets: s, x: x + Math.cos(a) * size * 0.7, y: y + Math.sin(a) * size * 0.5, alpha: 0, scale: 0, duration: 450, onComplete: () => s.destroy() });
    }
  },
  // her pet in a full-screen picture (the ending picture of a game): spot = where it stands in the picture's pixels,
  // fly = where a flying pet floats, size = its height in the picture's pixels; it looks toward lookX
  addToPicture(scene, img, { spot, fly, size, lookX }) {
    const e = this.equipped(), it = e.pet && GEAR_ITEMS[e.pet], key = 'gear_' + e.pet;
    if (!it || !scene.textures.exists(key)) return null;
    const flying = it[5].move === 'fly', [ix, iy] = flying ? fly : spot, s = img.scaleX;
    const x = img.x + (ix - img.width / 2) * s, y = img.y + (iy - img.height / 2) * s;
    const p = scene.add.image(x, y, key).setScrollFactor(0).setDepth(img.depth + 1).setOrigin(0.5, flying ? 0.5 : 1).setAlpha(0);
    const h = size * s * (flying ? 1.15 : 1);
    p.setDisplaySize(h * p.width / p.height, h).setFlipX(lookX * 1 < ix);
    scene.tweens.add({ targets: p, alpha: 1, duration: 900, delay: 300 });
    if (flying) scene.tweens.add({ targets: p, y: y - h * 0.12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    else scene.tweens.add({ targets: p, y: y - h * 0.15, duration: 220, yoyo: true, repeat: -1, repeatDelay: 900, ease: 'Quad.out' });
    return p;
  },
};
