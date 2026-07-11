/* ============================================================
   PANCAKE PARTY! — The Great Food Stack
   A physics stacking game for kids. Matter.js + Canvas 2D.
   ============================================================ */
'use strict';

const { Engine, Composite, Bodies, Body, Events } = Matter;

// ---------- Logical canvas size ----------
const W = 480, H = 800;
const PLATE_Y = 716;          // y of the tray centre
const DISPENSER_Y = 96;       // y of the cloud dispenser

// ============================================================
// Topping catalog
// shape is always a chamfered rect (stable + puffy), `round`
// only changes how it is DRAWN. Sizes in px, colors are [top,
// bottom] of the gradient.
// ============================================================
const T = {
  // --- pancakes ---
  butter:     { label:'Butter',      w:54, h:24, corner:8,  art:'cyl',                    base:'#ffe98c', dark:'#e8a83c', density:.0012, friction:1.0 },
  cream:      { label:'Whipped cream',w:66, h:32, corner:14, art:'swirl',                 base:'#ffffff', dark:'#ddd2f0', density:.0008, friction:1.1 },
  strawberry: { label:'Strawberry',  w:44, h:34, corner:12, art:'berry',                  base:'#ff6b81', dark:'#c9304a', density:.0012, friction:.95 },
  jam:        { label:'Jam',         w:62, h:22, corner:10, art:'blob',                   base:'#c05be0', dark:'#842fa8', density:.0011, friction:1.15 },
  scoop:      { label:'Ice cream',   w:54, h:42, corner:15, art:'scoop',                  base:'#ffd2e4', dark:'#ef86b8', density:.001, friction:.9 },
  banana:     { label:'Banana slice',w:58, h:18, corner:8,  art:'cyl', deco:'banana',     base:'#ffefad', dark:'#e8c25a', density:.001, friction:1.0 },
  // --- pizza ---
  cheese:     { label:'Cheese',      w:90, h:18, corner:8,  art:'cyl', deco:'holes',      base:'#ffe066', dark:'#e8a52e', density:.0011, friction:1.1 },
  ham:        { label:'Ham',         w:78, h:14, corner:6,  art:'cyl',                    base:'#ffc2cd', dark:'#e87b93', density:.0012, friction:1.0 },
  pepperoni:  { label:'Pepperoni',   w:48, h:38, corner:13, art:'cyl', deco:'pepperoni',  base:'#e8564a', dark:'#96201c', density:.0014, friction:.95 },
  mushroom:   { label:'Mushroom',    w:52, h:30, corner:12, art:'mushroom',               base:'#f7ecd9', dark:'#bd9668', density:.0009, friction:1.0 },
  olive:      { label:'Olive',       w:32, h:24, corner:9,  art:'cyl', deco:'olive',      base:'#7d8c45', dark:'#3d4519', density:.0012, friction:.9 },
  pepper:     { label:'Green pepper',w:70, h:16, corner:7,  art:'pepperstrip',            base:'#8fdc5e', dark:'#4a9629', density:.001, friction:1.0 },
  // --- burger ---
  patty:      { label:'Beef patty',  w:86, h:22, corner:10, art:'cyl', deco:'char',       base:'#9c6238', dark:'#57301a', density:.002,  friction:1.15 },
  chzslice:   { label:'Cheese slice',w:90, h:12, corner:5,  art:'cyl',                    base:'#ffd23a', dark:'#e8931c', density:.001, friction:1.1 },
  lettuce:    { label:'Lettuce',     w:92, h:16, corner:7,  art:'ruffle',                 base:'#b5ed7d', dark:'#57ad33', density:.0007, friction:1.05 },
  tomato:     { label:'Tomato slice',w:80, h:14, corner:6,  art:'cyl', deco:'tomato',     base:'#ff6b52', dark:'#c22e1f', density:.0011, friction:1.0 },
  pickle:     { label:'Bouncy pickle',w:36, h:26, corner:10, art:'cyl', deco:'pickle',    base:'#8cc95e', dark:'#3e701f', density:.001, friction:.9, restitution:.32 },
  bacon:      { label:'Bacon',       w:84, h:12, corner:5,  art:'bacon',                  base:'#c25a3d', dark:'#87301a', density:.0012, friction:1.0 },
  onion:      { label:'Onion ring',  w:42, h:30, corner:11, art:'cyl', deco:'onion',      base:'#fdf3ff', dark:'#c9aede', density:.0008, friction:.9, restitution:.22 },
  // --- taco ---
  meat:       { label:'Taco meat',   w:74, h:24, corner:10, art:'crumble',                base:'#a86b3d', dark:'#5c3013', density:.0018, friction:1.15 },
  shreds:     { label:'Cheese shreds',w:66, h:18, corner:8, art:'shreds',                 base:'#ffc25e', dark:'#e88a1d', density:.0009, friction:1.05 },
  chili:      { label:'Chili pepper',w:56, h:20, corner:9,  art:'chili',                  base:'#ff5240', dark:'#a8180c', density:.001, friction:.95 },
  tomcube:    { label:'Tomato cubes',w:44, h:20, corner:7,  art:'cubes',                  base:'#ff7a63', dark:'#c23a26', density:.0011, friction:1.0 },
  guac:       { label:'Guacamole',   w:66, h:24, corner:11, art:'blob', deco:'chunks',    base:'#b3e068', dark:'#5f9629', density:.001, friction:1.2 },
  sourcream:  { label:'Sour cream',  w:58, h:20, corner:9,  art:'swirl',                  base:'#ffffff', dark:'#ded6c4', density:.0008, friction:1.15 },
  // --- sundae ---
  scoopP:     { label:'Berry scoop', w:56, h:42, corner:15, art:'scoop',                  base:'#ffd2e4', dark:'#ef86b8', density:.001, friction:.85 },
  scoopC:     { label:'Choco scoop', w:56, h:42, corner:15, art:'scoop',                  base:'#b3805c', dark:'#6b3f22', density:.001, friction:.85 },
  scoopM:     { label:'Minty scoop', w:56, h:42, corner:15, art:'scoop', deco:'chips',    base:'#bdf2d8', dark:'#5cb388', density:.001, friction:.85 },
  whip:       { label:'Whipped swirl',w:60, h:30, corner:13, art:'swirl',                 base:'#ffffff', dark:'#ddd2f0', density:.0008, friction:.95 },
  cherry:     { label:'Cherry',      w:30, h:24, corner:9,  art:'cherry',                 base:'#ff4d6d', dark:'#a8102e', density:.0011, friction:.85 },
  wafer:      { label:'Wafer',       w:78, h:12, corner:5,  art:'cyl', deco:'waffle',     base:'#f2c98a', dark:'#c28c4a', density:.0009, friction:1.0 },
  // --- candy bowl (kända godissorter) ---
  winegum:    { label:'Vingummi',    w:46, h:26, corner:12, art:'gummy',                  base:'#ff5b6b', dark:'#c62740', density:.0013, friction:1.1 },
  winegum2:   { label:'Vingummi',    w:46, h:26, corner:12, art:'gummy',                  base:'#5bd08a', dark:'#2a9455', density:.0013, friction:1.1 },
  kexchoklad: { label:'Kexchoklad',  w:78, h:20, corner:5,  art:'kex',                    base:'#8a5a34', dark:'#4f3018', density:.0016, friction:1.35 },
  dumle:      { label:'Dumle',       w:38, h:36, corner:16, art:'dumle',                  base:'#7a4a26', dark:'#4a2c14', density:.0015, friction:1.0 },
  bubs:       { label:'Bubs',        w:44, h:28, corner:13, art:'bubs',                   base:'#ff9dc4', dark:'#3a2a2a', density:.0013, friction:1.05 },
  bil:        { label:'Bil',         w:52, h:26, corner:8,  art:'car',                    base:'#ffd23a', dark:'#e07a1c', density:.0012, friction:1.2 },
  jelly:      { label:'Geléhjärta',  w:40, h:34, corner:14, art:'jellyheart',             base:'#ff4d8d', dark:'#c21f5f', density:.0013, friction:1.0 },
};

// ============================================================
// Levels
// ============================================================
const LEVELS = [
  { id:'pancakes', name:'Pancake Peak', emoji:'🥞', dish:'pancake',
    sky:['#8ec9ff','#ffd9a8'], hill:'#ffb26b', hill2:'#ff8f5e',
    target:6,  sweep:1.0, dropEvery:3600,
    pool:['butter','cream','strawberry','jam','scoop','banana'],
    wrong:['pepperoni','olive','patty'],
    intro:'Stack 6 yummy toppings on the pancakes!' },
  { id:'pizza', name:'Pizza Tower', emoji:'🍕', dish:'pizza',
    sky:['#ffbe76','#ff7979'], hill:'#e05656', hill2:'#c23e3e',
    target:8,  sweep:1.12, dropEvery:3100,
    pool:['cheese','ham','pepperoni','mushroom','olive','pepper'],
    wrong:['strawberry','scoop','cherry'],
    intro:'Mamma mia! Stack 8 pizza toppings!' },
  { id:'burger', name:'Burger Mountain', emoji:'🍔', dish:'burger',
    sky:['#7ed6df','#f6e58d'], hill:'#6ab04c', hill2:'#4f8c38',
    target:9,  sweep:1.25, dropEvery:2800,
    pool:['patty','chzslice','lettuce','tomato','pickle','bacon','onion'],
    wrong:['banana','cream','jam'],
    intro:'Watch out — pickles are bouncy! Stack 9!' },
  { id:'taco', name:'Taco Volcano', emoji:'🌮', dish:'taco',
    sky:['#f8c291','#e55039'], hill:'#b3552d', hill2:'#8e3e1f',
    target:10, sweep:1.35, dropEvery:2500, wind:true,
    pool:['meat','shreds','chili','tomcube','guac','sourcream'],
    wrong:['whip','scoopP','cherry'],
    intro:'A windy one! Stack 10 in the crunchy shell!' },
  { id:'sundae', name:'Sundae Sky', emoji:'🍨', dish:'sundae',
    sky:['#c8a2ff','#ffc2dc'], hill:'#9b6bd6', hill2:'#7d4fbd',
    target:12, sweep:1.5, dropEvery:2200, slippery:true,
    pool:['scoopP','scoopC','scoopM','whip','cherry','wafer'],
    wrong:['olive','pepper','ham'],
    intro:'Slippery scoops! Stack 12 to the sky!' },
  { id:'candy', name:'Candy Bowl', emoji:'🍬', dish:'bowl',
    sky:['#ff9ecf','#a7d8ff'], hill:'#e05fa8', hill2:'#b83f88',
    target:9, sweep:1.4, dropEvery:2400, sticky:true,
    pool:['winegum','kexchoklad','dumle','bubs','winegum2','bil','jelly'],
    wrong:['olive','pepper','mushroom'],
    intro:'Fånga godiset i skålen! Vingummi, Dumle, Kexchoklad…' },
];

// ============================================================
// Save data
// ============================================================
const SAVE_KEY = 'pancakePartySave1';
let save = { stars:{}, best:{}, muted:false, controls:'camera', easy:false };
try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) {}
function persist(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

// ============================================================
// Teeny synth (no audio assets)
// ============================================================
const Snd = {
  ctx: null,
  ensure(){ if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) this.ctx = new AC(); } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  tone(f, dur, type = 'sine', vol = .18, delay = 0, slide = 0){
    if (save.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(.001, t0 + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t0); o.stop(t0 + dur + .02);
  },
  click(){ this.tone(520, .06, 'triangle', .12); },
  drop(){ this.tone(300, .1, 'square', .08, 0, -140); },
  land(){ this.tone(340, .1, 'sine', .2, 0, 60); },
  perfect(n){ this.tone(560 + n * 90, .12, 'triangle', .2); this.tone(840 + n * 90, .14, 'triangle', .16, .07); },
  miss(){ this.tone(240, .3, 'sawtooth', .12, 0, -160); this.tone(120, .25, 'square', .1, .12, -60); },
  nom(){ this.tone(180, .08, 'square', .15); this.tone(140, .1, 'square', .15, .09); },
  wobble(){ this.tone(880, .09, 'triangle', .14); this.tone(880, .09, 'triangle', .14, .14); },
  win(){ [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .18, 'triangle', .2, i * .12)); },
  fail(){ [392, 330, 262, 196].forEach((f, i) => this.tone(f, .25, 'triangle', .16, i * .16)); },
};

// ============================================================
// Camera hand control — no ML model needed: we track the motion
// centroid of the (mirrored) webcam image and steer the plate
// with it. A still scene holds the plate in place.
// ============================================================
const Cam = {
  active: false, starting: false, failed: false,
  video: null, stream: null, cv: null, cctx: null,
  prev: null, x: null, seen: 0, ready: false,
  CW: 64, CH: 48,

  async start(){
    if (this.active || this.starting) return this.active;
    this.starting = true;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no camera api');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });
      if (!this.video) {
        this.video = document.createElement('video');
        this.video.setAttribute('playsinline', '');
        this.video.muted = true;
        this.cv = document.createElement('canvas');
        this.cv.width = this.CW; this.cv.height = this.CH;
        this.cctx = this.cv.getContext('2d', { willReadFrequently: true });
      }
      this.video.srcObject = this.stream;
      await this.video.play();
      this.prev = null; this.x = null; this.ready = false;
      this.active = true; this.failed = false;
    } catch (e) {
      this.failed = true; this.active = false;
    }
    this.starting = false;
    return this.active;
  },

  stop(){
    if (this.stream) for (const t of this.stream.getTracks()) t.stop();
    this.stream = null; this.active = false; this.ready = false; this.x = null; this.prev = null;
  },

  tick(){
    if (!this.active || !this.video || this.video.readyState < 2) { this.ready = false; return; }
    const cw = this.CW, ch = this.CH;
    this.cctx.drawImage(this.video, 0, 0, cw, ch);
    let img;
    try { img = this.cctx.getImageData(0, 0, cw, ch).data; } catch (e) { return; }
    if (!this.prev) {
      this.prev = new Float32Array(cw * ch);
      for (let i = 0; i < cw * ch; i++) this.prev[i] = (img[i * 4] + img[i * 4 + 1] + img[i * 4 + 2]) / 3;
      return;
    }
    let count = 0, sx = 0;
    for (let i = 0; i < cw * ch; i++) {
      const j = i * 4;
      const g = (img[j] + img[j + 1] + img[j + 2]) / 3;
      const d = Math.abs(g - this.prev[i]);
      this.prev[i] = g;
      if (d > 22) { count++; sx += i % cw; }
    }
    if (count > 7) {
      const mx = 1 - (sx / count) / (cw - 1);   // mirror: your hand, your side
      this.x = this.x == null ? mx : this.x + (mx - this.x) * .3;
      this.seen = performance.now();
    }
    this.ready = this.x != null && performance.now() - this.seen < 2000;
  },
};

function cameraOn(){ return save.controls === 'camera' && Cam.active; }

// ============================================================
// Game state
// ============================================================
const G = {
  state: 'title',      // title | select | play | settling | win | fail | end
  levelIndex: 0,
  engine: null,
  plate: null, plateY: 0, plateTargetX: W / 2,
  toppings: [],        // live topping bodies
  landedStack: [],     // landed bodies bottom -> top
  falling: null,       // the currently dropping body
  queue: [],           // upcoming topping ids
  preview: null,       // topping def waiting in the dispenser
  previewWrong: false, // is the waiting item a "wrong" hazard?
  raider: null,        // a hungry gummy bear falling from the cloud
  raiderCd: 0,         // ms until another raider may appear
  shakeMeter: 0,       // how hard the player is shaking the plate
  platePrevVX: 0,
  misses: 0, landed: 0, score: 0, combo: 1,
  disp: { t: 0, x: W / 2 },
  autoT: 0,            // ms until the dispenser auto-drops
  wind: { on: false, t: 0 },
  particles: [],
  bears: [],           // mini gummy bears running along the bottom
  slowmo: 0, slowmoCd: 0,
  rescue: 0, rescueSide: 0, rescueSaved: false,
  shake: 0,
  stateT: 0,           // ms in current state
  spawnDelay: 0,
  keys: {},
  time: 0,
};

// seeded pseudo-random decorations (stable per body)
function seededPts(seed, n){
  let s = seed * 2654435761 % 4294967296;
  const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const pts = [];
  for (let i = 0; i < n; i++) pts.push([rnd() * 2 - 1, rnd() * 2 - 1, rnd()]);
  return pts;
}

// ============================================================
// DOM
// ============================================================
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const DPR = Math.min(2, window.devicePixelRatio || 1);
canvas.width = W * DPR; canvas.height = H * DPR;

const screens = { title: $('screen-title'), levels: $('screen-levels'), end: $('screen-end') };
function showScreen(name){
  for (const k in screens) screens[k].classList.toggle('hidden', k !== name);
  $('hud').classList.toggle('hidden', name !== null);
}

function updateHUD(){
  $('hud-hearts').textContent = `😋 ${G.misses}`;
  const lv = LEVELS[G.levelIndex];
  $('hud-level').textContent = `${lv.emoji} ${lv.name}`;
  $('hud-progress').textContent = `${G.landed} / ${lv.target}`;
  $('hud-score').textContent = `⭐ ${G.score}`;
}
function flashCombo(text){
  const b = $('combo-badge');
  b.textContent = text;
  b.classList.remove('hidden');
  b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
  clearTimeout(flashCombo.t);
  flashCombo.t = setTimeout(() => b.classList.add('hidden'), 1400);
}

function starStr(n){
  let s = '';
  for (let i = 0; i < 3; i++) s += i < n ? '★' : '<span class="off">★</span>';
  return s;
}

function buildLevelList(){
  const list = $('level-list');
  list.innerHTML = '';
  LEVELS.forEach((lv, i) => {
    const unlocked = i === 0 || (save.stars[LEVELS[i - 1].id] || 0) > 0;
    const btn = document.createElement('button');
    btn.className = 'level-card' + (unlocked ? '' : ' locked');
    btn.innerHTML = `
      <div class="lv-emoji">${unlocked ? lv.emoji : '🔒'}</div>
      <div><div class="lv-name">${lv.name}</div>
      <div class="lv-sub">${unlocked ? `Stack ${lv.target} toppings` : 'Earn a star to unlock'}</div></div>
      <div class="lv-stars">${starStr(save.stars[lv.id] || 0)}</div>`;
    if (unlocked) btn.addEventListener('click', () => { Snd.ensure(); Snd.click(); startLevel(i); });
    list.appendChild(btn);
  });
}

// ============================================================
// Level lifecycle
// ============================================================
function makePlate(lv){
  const cx = W / 2;
  const opts = { friction: 1.6, frictionStatic: 3, restitution: 0, density: .05 };
  const parts = [Bodies.rectangle(cx, PLATE_Y, 172, 16, { ...opts, chamfer: { radius: 7 } })];
  switch (lv.dish) {
    case 'pancake': parts.push(Bodies.rectangle(cx, PLATE_Y - 24, 142, 32, { ...opts, chamfer: { radius: 7 } })); break;
    case 'pizza':   parts.push(Bodies.rectangle(cx, PLATE_Y - 18, 160, 20, { ...opts, chamfer: { radius: 9 } })); break;
    case 'burger':  parts.push(Bodies.rectangle(cx, PLATE_Y - 23, 138, 30, { ...opts, chamfer: { radius: 13 } })); break;
    case 'taco':
      parts.push(Bodies.rectangle(cx - 37, PLATE_Y - 32, 94, 13, { ...opts, angle:  0.82, chamfer: { radius: 5 } }));
      parts.push(Bodies.rectangle(cx + 37, PLATE_Y - 32, 94, 13, { ...opts, angle: -0.82, chamfer: { radius: 5 } }));
      break;
    case 'sundae':
      parts.push(Bodies.rectangle(cx, PLATE_Y - 16, 110, 14, { ...opts, chamfer: { radius: 6 } }));
      parts.push(Bodies.rectangle(cx - 57, PLATE_Y - 38, 13, 56, { ...opts, angle:  0.22, chamfer: { radius: 5 } }));
      parts.push(Bodies.rectangle(cx + 57, PLATE_Y - 38, 13, 56, { ...opts, angle: -0.22, chamfer: { radius: 5 } }));
      break;
    case 'bowl':
      // rounded candy bowl: wide flat base + two tall upright walls that
      // cradle the sweets so they don't roll straight back out
      parts.push(Bodies.rectangle(cx, PLATE_Y - 12, 128, 16, { ...opts, chamfer: { radius: 8 } }));
      parts.push(Bodies.rectangle(cx - 68, PLATE_Y - 42, 15, 68, { ...opts, angle:  0.26, chamfer: { radius: 6 } }));
      parts.push(Bodies.rectangle(cx + 68, PLATE_Y - 42, 15, 68, { ...opts, angle: -0.26, chamfer: { radius: 6 } }));
      break;
  }
  const plate = Body.create({ parts, inertia: Infinity, friction: 1.6, frictionStatic: 3 });
  plate.sleepThreshold = Infinity;   // the player's plate must never doze off
  Body.setPosition(plate, { x: cx, y: plate.position.y });
  return plate;
}

function refillQueue(lv){
  const pool = lv.pool.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  G.queue.push(...pool);
}

function startLevel(i){
  G.levelIndex = i;
  const lv = LEVELS[i];

  G.engine = Engine.create({ positionIterations: 10, velocityIterations: 8, enableSleeping: true });
  G.engine.gravity.y = 1;

  G.plate = makePlate(lv);
  G.plateY = G.plate.position.y;
  G.plateTargetX = W / 2;
  Composite.add(G.engine.world, G.plate);

  // wide sensor floor: anything that touches it gets munched
  const floor = Bodies.rectangle(W / 2, H + 26, W * 4, 60, { isStatic: true, isSensor: true, label: 'floor' });
  Composite.add(G.engine.world, floor);

  Events.on(G.engine, 'collisionStart', e => {
    for (const pair of e.pairs) {
      const a = pair.bodyA, b = pair.bodyB;
      const floorHit = a.label === 'floor' ? b : (b.label === 'floor' ? a : null);
      if (floorHit && floorHit.plugin && (floorHit.plugin.def || floorHit.plugin.raider)) { munch(floorHit); continue; }

      // a wrong item that reaches the dish/stack knocks things away hard
      const wrongBod = (a.plugin && a.plugin.wrong && !a.plugin.bonked) ? a
                     : (b.plugin && b.plugin.wrong && !b.plugin.bonked) ? b : null;
      if (wrongBod) {
        const other = wrongBod === a ? b : a;
        if (other === G.plate || (other.plugin && other.plugin.state === 'landed')) bonkStack(wrongBod);
      }

      for (const bod of [a, b]) {
        if (!bod.plugin || !bod.plugin.def) continue;
        // squishy catch: soft food absorbs most of the impact on first touch
        if (bod === G.falling && !bod.plugin.touched && !bod.plugin.wrong)
          Body.setVelocity(bod, { x: bod.velocity.x * .32, y: bod.velocity.y * .32 });
        bod.plugin.touched = true;
      }
    }
  });

  G.toppings = []; G.landedStack = []; G.falling = null;
  G.queue = []; refillQueue(lv);
  G.preview = null; G.previewWrong = false;
  G.raider = null; G.raiderCd = 7000 + Math.random() * 6000;
  G.shakeMeter = 0; G.platePrevVX = 0;
  G.misses = 0; G.landed = 0; G.score = 0; G.combo = 1;
  G.disp.t = Math.random() * 6; G.wind = { on: false, t: 0 };
  G.particles = [];
  G.bears = spawnBears();
  G.slowmo = 0; G.slowmoCd = 0; G.rescue = 0; G.rescueSaved = false; G.shake = 0;
  G.spawnDelay = 400;
  G.state = 'play'; G.stateT = 0;

  showScreen(null);
  updateHUD();
  textPop(W / 2, 300, lv.intro, '#ffffff', 2600, 19);

  if (save.controls === 'camera' && !Cam.active) {
    Cam.start().then(ok => {
      if (ok) {
        textPop(W / 2, 360, 'Wave your hand ✋ to steer!', '#ffffff', 2600, 19);
      } else {
        save.controls = 'touch'; persist(); syncControls();
        textPop(W / 2, 360, 'No camera found — touch control on!', '#ffffff', 2600, 17);
      }
    });
  } else if (save.controls === 'camera') {
    textPop(W / 2, 360, 'Wave your hand ✋ to steer!', '#ffffff', 2600, 19);
  }
}

function destroyLevel(){
  if (G.engine) { Events.off(G.engine); Engine.clear(G.engine); }
  G.engine = null; G.plate = null; G.toppings = []; G.falling = null;
}

// ============================================================
// Toppings: spawn / drop / land / munch
// ============================================================
function nextPreview(){
  const lv = LEVELS[G.levelIndex];
  // every so often the cloud grabs the wrong thing — steer away from it!
  // (easy mode keeps it simple for the littlest — no wrong items)
  if (!save.easy && lv.wrong && G.landed >= 2 && G.landed < lv.target - 1 && Math.random() < .22) {
    G.preview = T[lv.wrong[Math.floor(Math.random() * lv.wrong.length)]];
    G.previewWrong = true;
  } else {
    if (!G.queue.length) refillQueue(lv);
    G.preview = T[G.queue.shift()];
    G.previewWrong = false;
  }
  G.autoT = lv.dropEvery;   // countdown until the cloud lets go by itself
}

function dropTopping(){
  if (G.state !== 'play' || !G.preview || G.falling) return;
  const def = G.preview;
  const wrong = G.previewWrong;
  const lv = LEVELS[G.levelIndex];
  const easy = save.easy && !wrong;
  const body = Bodies.rectangle(G.disp.x, DISPENSER_Y + 34, def.w, def.h, {
    chamfer: { radius: Math.min(def.corner, Math.min(def.w, def.h) / 2 - 1) },
    density: (def.density || .0011) * (wrong ? 1.7 : 1),
    // flat pieces (short height) grip much harder so they sit still and
    // don't slide off the dish — this covers butter/meat (h24) too.
    // Easy mode maxes grip on everything so almost nothing slides off.
    friction: easy ? 6 : (def.friction || 1) * (def.h <= 26 ? 2.1 : 1.15) * (lv.slippery ? .65 : 1) * (lv.sticky ? 1.5 : 1),
    frictionStatic: easy ? 14 : (def.h <= 26 ? 6 : 3.4) * (lv.sticky ? 1.4 : 1),
    frictionAir: easy ? .09 : (lv.sticky ? .07 : .035),   // sticky candy stops rolling fast
    restitution: wrong ? .55 : (easy ? 0 : (lv.sticky ? 0 : (def.restitution || .04))),
  });
  body.plugin = { def, state: 'falling', touched: false, settle: 0, wrong, bonked: false, seed: Math.floor(Math.random() * 99999) + 1 };
  // soft food resists spinning — fewer pieces tumbling onto their edge
  Body.setInertia(body, body.inertia * (wrong ? 1.4 : (easy ? 7 : (lv.sticky ? 4.5 : 3.2))));
  Body.setAngularVelocity(body, (Math.random() - .5) * .03);
  Composite.add(G.engine.world, body);
  G.toppings.push(body);
  G.falling = body;
  G.preview = null;
  G.previewWrong = false;
  Snd.drop();
}

function stackTopX(){
  return G.landedStack.length ? G.landedStack[G.landedStack.length - 1].position.x : G.plate.position.x;
}

function confirmLand(b){
  const lv = LEVELS[G.levelIndex];
  const dx = Math.abs(b.position.x - stackTopX());
  b.plugin.state = 'landed';
  G.landedStack.push(b);
  G.falling = null;
  G.landed++;

  // easy mode: remember where it was caught relative to the plate so we can
  // lock it there every frame — landed pieces then ride rigidly with the
  // plate and never glide toward each other
  if (save.easy) b.plugin.restDX = b.position.x - G.plate.position.x;

  const perfect = dx < 15;
  if (perfect) {
    G.combo++;
    // perfect drops "set" a little: calm the piece and grip harder
    Body.setAngularVelocity(b, 0);
    b.friction = Math.max(b.friction, Math.min(1.5, b.friction + .25));  // never lower easy-mode grip
    const pts = G.combo > 2 ? `YUM! ×${G.combo}` : 'PERFECT!';
    flashCombo(pts);
    textPop(b.position.x, b.position.y - 40, `+${100 * G.combo}`, '#ffdf5e', 1100, 20);
    sparkle(b.position.x, b.position.y, 14);
    Snd.perfect(Math.min(G.combo, 6));
  } else {
    G.combo = 1;
    textPop(b.position.x, b.position.y - 36, '+100', '#ffffff', 900, 16);
    Snd.land();
  }
  G.score += 100 * (perfect ? G.combo : 1);
  updateHUD();

  if (!lv.wind || G.landed < 4) { /* wind starts later */ }
  if (lv.wind && G.landed >= 4 && !G.wind.on) {
    G.wind.on = true;
    textPop(W / 2, 260, '💨 Whoo! Windy!', '#ffffff', 2000, 20);
  }

  if (G.landed >= lv.target) {
    G.state = 'settling'; G.stateT = 0;
    textPop(W / 2, 300, 'Hold it steadyyy…', '#ffffff', 1600, 20);
  } else {
    G.spawnDelay = 420;
  }
}

function munch(b){
  if (!b.plugin || b.plugin.munched) return;
  b.plugin.munched = true;
  Composite.remove(G.engine.world, b);
  G.toppings = G.toppings.filter(t => t !== b);

  // a raider bear falling to the floor is just a scampering bear, no fuss
  if (b.plugin.raider) { if (G.raider && G.raider.body === b) G.raider = null; return; }

  const wasLanded = b.plugin.state === 'landed';
  if (wasLanded) {
    G.landedStack = G.landedStack.filter(t => t !== b);
    G.landed = Math.max(0, G.landed - 1);
  }
  if (G.falling === b) G.falling = null;

  const fx = Math.max(30, Math.min(W - 30, b.position.x));
  crumbs(fx, Math.min(b.position.y, H - 30), b.plugin.def.dark, 10);
  sendBearTo(fx);
  Snd.nom();

  // a wrong item falling away is a GOOD dodge — never a miss, but we must
  // still re-arm the dispenser or the cloud sweeps forever with no new item
  if (b.plugin.wrong && !wasLanded) {
    if (!G.falling && !G.preview && G.spawnDelay <= 0) G.spawnDelay = 500;
    return;
  }

  if (G.state === 'play' || G.state === 'settling') {
    G.misses++;
    G.combo = 1;
    G.shake = 320;
    Snd.miss();
    updateHUD();
    if (G.state === 'settling') { G.state = 'play'; G.stateT = 0; }
    if (!G.falling && !G.preview) G.spawnDelay = 500;
  }
}

// a wrong item slams into the stack: shove the nearby pieces away hard
function bonkStack(w){
  w.plugin.bonked = true;
  G.shake = 420;
  textPop(w.position.x, w.position.y - 30, 'BONK!', '#ff5b6b', 1000, 24);
  Snd.miss();
  for (const t of G.toppings) {
    if (t === w || !t.plugin.def) continue;
    const dx = t.position.x - w.position.x, dy = t.position.y - w.position.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d > 120) continue;
    Matter.Sleeping.set(t, false);
    const k = .06 * (1 - d / 120);
    Body.applyForce(t, t.position, { x: (dx / d) * k * t.mass, y: (dy / d) * k * t.mass - .01 * t.mass });
    Body.setAngularVelocity(t, (Math.random() - .5) * .3);
  }
  // the wrong item bounces off and gets cleared shortly after
  Body.setVelocity(w, { x: w.velocity.x * .4, y: -6 });
  if (G.falling === w) { G.falling = null; if (!G.preview) G.spawnDelay = 500; }
  w.plugin.removeAt = G.time + 1400;
}

// ============================================================
// Win / fail
// ============================================================
function beginWin(){
  G.state = 'win'; G.stateT = 0;
  for (const bear of G.bears) bear.cheer = 1;
  for (let i = 0; i < 90; i++) confettiP();
  Snd.win();

  const lv = LEVELS[G.levelIndex];
  const stars = G.misses === 0 ? 3 : G.misses <= 2 ? 2 : 1;
  save.stars[lv.id] = Math.max(save.stars[lv.id] || 0, stars);
  save.best[lv.id] = Math.max(save.best[lv.id] || 0, G.score);
  persist();
}

function showEnd(won){
  G.state = 'end';
  const lv = LEVELS[G.levelIndex];
  const stars = won ? (G.misses === 0 ? 3 : G.misses <= 2 ? 2 : 1) : 0;
  $('end-emoji').textContent = won ? lv.emoji : '😋';
  $('end-title').textContent = won ? 'Dish complete!' : 'The gummy bears feasted!';
  $('end-stars').innerHTML = starStr(stars);
  $('end-score').textContent = `Score: ${G.score}` + (save.best[lv.id] ? `  ·  Best: ${save.best[lv.id]}` : '');
  $('end-msg').textContent = won
    ? (stars === 3 ? 'WOW! A perfect dish — the gummy bears got nothing!' : `The gummy bears grabbed ${G.misses} snack${G.misses === 1 ? '' : 's'} — drop fewer for more stars!`)
    : '"Yum yum yum!" — the gummy bears';
  const next = $('btn-next');
  next.classList.toggle('hidden', !won || G.levelIndex >= LEVELS.length - 1);
  showScreen('end');
}

// ============================================================
// Particles & popups
// ============================================================
function textPop(x, y, text, color, life, size){
  G.particles.push({ type: 'text', x, y, vy: -.03, text, color, life, maxLife: life, size });
}
function sparkle(x, y, n){
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = .05 + Math.random() * .25;
    G.particles.push({ type: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - .1, life: 700, maxLife: 700, color: ['#ffe25e', '#fff', '#ffb0d8'][i % 3], size: 3 + Math.random() * 4 });
  }
}
function crumbs(x, y, color, n){
  for (let i = 0; i < n; i++)
    G.particles.push({ type: 'crumb', x: x + (Math.random() - .5) * 30, y, vx: (Math.random() - .5) * .3, vy: -.2 - Math.random() * .25, life: 800, maxLife: 800, color, size: 3 + Math.random() * 5 });
}
function confettiP(){
  G.particles.push({ type: 'confetti', x: Math.random() * W, y: -20 - Math.random() * 200, vx: (Math.random() - .5) * .1, vy: .1 + Math.random() * .15, spin: Math.random() * Math.PI, vspin: (Math.random() - .5) * .01, life: 4200, maxLife: 4200, color: ['#ff6b81', '#ffe25e', '#7ee06e', '#6ec8ff', '#c78bff'][Math.floor(Math.random() * 5)], size: 5 + Math.random() * 6 });
}
function updateParticles(dt){
  for (const p of G.particles) {
    p.life -= dt;
    p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt;
    if (p.type === 'spark' || p.type === 'crumb') p.vy += .0012 * dt;
    if (p.type === 'confetti') { p.spin += p.vspin * dt; p.x += Math.sin(p.y * .02) * .4; }
  }
  G.particles = G.particles.filter(p => p.life > 0 && p.y < H + 40);
}

// ============================================================
// Physics step
// ============================================================
const STEP = 1000 / 60;

function stepGame(){
  const lv = LEVELS[G.levelIndex];
  const dt = STEP;
  G.stateT += dt;
  G.time += dt;

  if (!G.engine) return;

  // --- plate control ---
  if (cameraOn()) Cam.tick();
  if (G.state === 'play' || G.state === 'settling') {
    if (G.keys.ArrowLeft || G.keys.a) G.plateTargetX -= .5 * dt;
    if (G.keys.ArrowRight || G.keys.d) G.plateTargetX += .5 * dt;
    if (cameraOn() && Cam.ready) G.plateTargetX = 96 + Cam.x * (W - 192);
  }
  G.plateTargetX = Math.max(96, Math.min(W - 96, G.plateTargetX));
  const vx = Math.max(-9, Math.min(9, (G.plateTargetX - G.plate.position.x) * .14));
  Body.setVelocity(G.plate, { x: vx, y: 0 });
  Body.setPosition(G.plate, { x: G.plate.position.x, y: G.plateY });
  Body.setAngle(G.plate, 0);
  Body.setAngularVelocity(G.plate, 0);

  // how vigorously is the plate being shaken? (used to fling off a raider)
  if (Math.sign(vx) !== Math.sign(G.platePrevVX) && Math.abs(vx) > 4)
    G.shakeMeter += 1;                       // a firm direction reversal
  G.shakeMeter = Math.max(0, G.shakeMeter - dt * .004);
  G.platePrevVX = vx;

  // --- dispenser sweep ---
  if (G.state === 'play') {
    const wander = .6 + .55 * Math.sin(G.disp.t * .43 + 1.7) * Math.sin(G.disp.t * .19);
    G.disp.t += dt * .0011 * lv.sweep * (.55 + Math.abs(wander));
    const amp = (W / 2 - 78) * (.55 + .45 * Math.sin(G.disp.t * .31 + .8));
    G.disp.x = W / 2 + Math.sin(G.disp.t) * amp;
    if (G.spawnDelay > 0) {
      G.spawnDelay -= dt;
      if (G.spawnDelay <= 0 && !G.preview && !G.falling) nextPreview();
    }
    // self-heal: if somehow nothing is coming and nothing is falling, the
    // cloud must always eventually offer a new item (never sweep empty)
    else if (!G.preview && !G.falling && G.spawnDelay <= 0) G.spawnDelay = 500;
    // the cloud drops the topping by itself when the countdown runs out
    if (G.preview && !G.falling) {
      G.autoT -= dt;
      if (G.autoT <= 0) dropTopping();
    }
    // once in a while a hungry gummy bear tumbles out of the cloud
    // (no scary raiders in easy mode)
    G.raiderCd -= dt;
    if (!save.easy && G.raiderCd <= 0 && !G.raider && G.landed >= 2) spawnRaider();
  }

  // --- wind gimmick ---
  if (G.wind.on && (G.state === 'play' || G.state === 'settling')) {
    G.wind.t += dt;
    const fx = Math.sin(G.wind.t * .0011) * .00017;
    for (const b of G.toppings) {
      Matter.Sleeping.set(b, false);
      Body.applyForce(b, b.position, { x: fx * b.mass, y: 0 });
    }
  }

  // a resting tower may sleep (rock solid), but it must wake up and feel
  // real physics as soon as the plate moves under it
  if (Math.abs(vx) > .8) for (const b of G.toppings) Matter.Sleeping.set(b, false);

  // --- physics ---
  const scale = G.slowmo > 0 ? .35 : 1;
  Engine.update(G.engine, dt * scale);
  if (G.slowmo > 0) G.slowmo -= dt;
  if (G.slowmoCd > 0) G.slowmoCd -= dt;

  // easy mode: pin every landed piece to its catch-offset on the plate so
  // the stack rides rigidly and pieces can't slide/glide into each other
  if (save.easy && (G.state === 'play' || G.state === 'settling')) {
    const px = G.plate.position.x;
    for (const b of G.landedStack) {
      if (b.plugin.restDX === undefined) continue;
      Matter.Sleeping.set(b, false);
      Body.setPosition(b, { x: px + b.plugin.restDX, y: b.position.y });
      Body.setVelocity(b, { x: 0, y: Math.min(0, b.velocity.y) });
      Body.setAngularVelocity(b, 0);
      Body.setAngle(b, b.angle * .8);   // ease upright into a tidy stack
    }
  }

  // --- landing check ---
  const f = G.falling;
  if (f && f.plugin.touched && !f.plugin.wrong) {
    const sp = Math.hypot(f.velocity.x, f.velocity.y);
    f.plugin.settle = sp < 1.6 ? f.plugin.settle + 1 : 0;
    f.plugin.touchMs = (f.plugin.touchMs || 0) + dt;
    // confirm on a clean settle, OR as a fallback once a piece has been in
    // contact a while and is at least slow-ish — stops a jostling candy in
    // the bowl (or a raider-jostled piece) from permanently blocking the drop
    if (f.plugin.settle >= 16 || (f.plugin.touchMs > 1500 && sp < 3.2) || f.plugin.touchMs > 4500) confirmLand(f);
  } else if (f && f.plugin.wrong && f.plugin.touched) {
    // a wrong item that somehow settled without bonking: release the turn
    f.plugin.touchMs = (f.plugin.touchMs || 0) + dt;
    if (f.plugin.touchMs > 700) { G.falling = null; if (!G.preview) G.spawnDelay = 500; }
  }

  // clear spent wrong items
  for (const b of G.toppings.slice())
    if (b.plugin.removeAt && G.time > b.plugin.removeAt) munch(b);

  // --- hungry raider bear from the cloud ---
  updateRaider(dt);

  // --- wobble rescue: a real, rewardable save ---
  // Only fires when the top of the tower is genuinely toppling (drifted far
  // AND actively sliding further out), never on a stack that's just resting
  // a little off-centre. Steering the plate under the lean pulls the tower
  // back upright; recover it in time for a bonus.
  if ((G.state === 'play' || G.state === 'settling') && G.landedStack.length >= 3
      && G.rescue <= 0 && G.slowmoCd <= 0) {
    const top = G.landedStack[G.landedStack.length - 1];
    const lean = top.position.x - G.plate.position.x;
    const toppling = Math.abs(lean) > 46
      && Math.sign(top.velocity.x || 0) === Math.sign(lean)
      && Math.abs(top.velocity.x) > .25;
    if (toppling) {
      G.rescue = 2100; G.slowmo = 2100; G.slowmoCd = 3800;
      G.rescueSide = Math.sign(lean); G.rescueSaved = false;
      textPop(W / 2, 250, '⚡ Quick! Steer under it!', '#ffffff', 1500, 20);
      Snd.wobble();
    }
  }
  if (G.rescue > 0 && (G.state === 'play' || G.state === 'settling')) {
    G.rescue -= dt;
    const top = G.landedStack[G.landedStack.length - 1];
    if (top) {
      const lean = top.position.x - G.plate.position.x;
      // ASSIST: while the player steers the plate toward the lean, pull the
      // upper pieces back over the base so the drag has real, visible effect
      const steerToward = Math.sign(G.plateTargetX - G.plate.position.x) === G.rescueSide;
      if (steerToward && !G.rescueSaved) {
        for (let i = 1; i < G.landedStack.length; i++) {
          const b = G.landedStack[i];
          Matter.Sleeping.set(b, false);
          Body.applyForce(b, b.position, { x: -G.rescueSide * .0008 * b.mass, y: 0 });
          // bleed off the outward topple so a firm steer visibly recovers it
          if (Math.sign(b.velocity.x) === G.rescueSide)
            Body.setVelocity(b, { x: b.velocity.x * .82, y: b.velocity.y });
        }
      }
      // SAVED once the tower comes back over the base
      if (!G.rescueSaved && Math.abs(lean) < 54) {
        G.rescueSaved = true;
        G.rescue = Math.min(G.rescue, 260);
        G.score += 200; G.combo = Math.min(G.combo + 1, 9);
        textPop(top.position.x, top.position.y - 42, 'SAVED! +200', '#7ee06e', 1300, 22);
        sparkle(top.position.x, top.position.y, 16);
        for (const b of G.landedStack) Body.setAngularVelocity(b, b.angularVelocity * .3);
        Snd.perfect(5); updateHUD();
      }
    }
    if (G.rescue <= 0) G.slowmo = Math.min(G.slowmo, 0);
  }

  // --- safety net: remove anything far off screen ---
  for (const b of G.toppings.slice()) {
    if (b.position.y > H + 130 || Math.abs(b.position.x - W / 2) > W * 1.5) munch(b);
  }

  // --- settling -> win ---
  if (G.state === 'settling' && G.stateT > 1600) beginWin();

  // --- end transitions ---
  if (G.state === 'win' && G.stateT > 1900) showEnd(true);

  updateBears(dt);
  if (G.shake > 0) G.shake -= dt;

  updateParticles(dt);
}

// ============================================================
// Rendering helpers — glossy puffy style
// ============================================================
function rr(x, y, w, h, r){
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex, f){
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r * f)));
  g = Math.max(0, Math.min(255, Math.round(g * f)));
  b = Math.max(0, Math.min(255, Math.round(b * f)));
  return `rgb(${r},${g},${b})`;
}

// puffy body: vertical gradient + rim + glossy highlight
function puffy(x, y, w, h, r, top, bottom, round){
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  if (round) { ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); }
  else rr(x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = shade(typeof bottom === 'string' && bottom[0] === '#' ? bottom : '#888888', .75);
  ctx.lineWidth = 2;
  ctx.stroke();
  // gloss
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath();
  ctx.ellipse(x + w * .32, y + h * .26, w * .24, h * .16, -.3, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================
// Food art — soft dimensional "candy clay" renderer
// Every food is drawn at the origin, upright, inside its
// physics bounding box (w × h). Light comes from the top left.
// ============================================================
const TAU = Math.PI * 2;

function sheen(x, y, rx, ry, a, rot){
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || -.4, 0, TAU); ctx.fill();
}

// ball with 3D radial shading + specular dot
function ball(x, y, rx, ry, base, dark){
  const g = ctx.createRadialGradient(x - rx * .4, y - ry * .5, rx * .12, x, y, Math.max(rx, ry) * 1.25);
  g.addColorStop(0, shade(base, 1.18));
  g.addColorStop(.55, base);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = shade(dark, .85); ctx.lineWidth = 1.6; ctx.stroke();
  sheen(x - rx * .35, y - ry * .45, rx * .3, ry * .22, .55);
}

// the workhorse: a glossy squat cylinder (any sliced / flat food),
// top face gets an optional decoration callback(rx, ry)
function cylinder(w, h, base, dark, deco){
  const rx = w / 2;
  const ry = Math.min(h * .34, rx * .55);
  const yT = -h / 2 + ry, yB = h / 2 - ry;

  // side wall
  const gs = ctx.createLinearGradient(0, yT, 0, yB + ry);
  gs.addColorStop(0, shade(base, .9));
  gs.addColorStop(1, dark);
  ctx.fillStyle = gs;
  ctx.beginPath();
  ctx.moveTo(-rx, yT);
  ctx.lineTo(-rx, yB);
  ctx.ellipse(0, yB, rx, ry, 0, Math.PI, 0, true);   // bottom bulge
  ctx.lineTo(rx, yT);
  ctx.ellipse(0, yT, rx, ry, 0, 0, Math.PI, false);  // under the lid
  ctx.fill();

  // lid
  const gt = ctx.createLinearGradient(-rx * .6, yT - ry, rx * .3, yT + ry);
  gt.addColorStop(0, shade(base, 1.16));
  gt.addColorStop(1, base);
  ctx.fillStyle = gt;
  ctx.beginPath(); ctx.ellipse(0, yT, rx, ry, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1.2; ctx.stroke();

  // silhouette outline
  ctx.strokeStyle = shade(dark, .82); ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, yT, rx, ry, 0, Math.PI, 0, false);  // top rim
  ctx.lineTo(rx, yB);
  ctx.ellipse(0, yB, rx, ry, 0, 0, Math.PI, false);
  ctx.closePath(); ctx.stroke();

  sheen(-rx * .32, yT - ry * .2, rx * .4, ry * .5, .4);
  if (deco) { ctx.save(); ctx.translate(0, yT); deco(rx, ry); ctx.restore(); }
}

// decorations painted on a cylinder lid (coords already at lid centre)
const LID = {
  banana(rx, ry){
    ctx.fillStyle = 'rgba(255,252,222,.9)';
    ctx.beginPath(); ctx.ellipse(0, 0, rx * .72, ry * .68, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c9a23e';
    for (const a of [.6, 2.7, 4.6]) {
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * rx * .2, Math.sin(a) * ry * .25, 2, 1.2, a, 0, TAU); ctx.fill();
    }
  },
  holes(rx, ry){
    ctx.fillStyle = 'rgba(150,100,10,.5)';
    for (const [x, y, r] of [[-.4, -.2, .16], [.1, .3, .12], [.45, -.25, .13], [-.05, -.4, .09]]) {
      ctx.beginPath(); ctx.ellipse(x * rx, y * ry, r * rx, r * rx * ry / rx * 2.4, 0, 0, TAU); ctx.fill();
    }
  },
  pepperoni(rx, ry){
    ctx.strokeStyle = 'rgba(120,20,15,.55)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, 0, rx * .82, ry * .78, 0, 0, TAU); ctx.stroke();
    for (const [x, y, r, w] of [[-.35, -.1, .1, 1], [.2, .25, .08, 1], [.4, -.3, .07, 0], [-.1, .45, .06, 0], [.05, -.15, .07, 1], [-.5, .3, .06, 0]]) {
      ctx.fillStyle = w ? 'rgba(255,220,200,.75)' : 'rgba(110,15,12,.6)';
      ctx.beginPath(); ctx.ellipse(x * rx, y * ry, r * rx, r * rx * .7, .4, 0, TAU); ctx.fill();
    }
  },
  tomato(rx, ry){
    ctx.fillStyle = 'rgba(255,150,130,.85)';
    ctx.beginPath(); ctx.ellipse(0, 0, rx * .78, ry * .72, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,200,.9)';
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * rx * .42, Math.sin(a) * ry * .4, rx * .16, ry * .2, a, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,120,100,1)';
    ctx.beginPath(); ctx.ellipse(0, 0, rx * .14, ry * .16, 0, 0, TAU); ctx.fill();
  },
  pickle(rx, ry){
    ctx.strokeStyle = 'rgba(240,255,200,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, rx * .68, ry * .62, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,225,.8)';
    for (const a of [.4, 1.6, 2.9, 4.2, 5.4]) {
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * rx * .38, Math.sin(a) * ry * .35, 1.8, 1.2, a, 0, TAU); ctx.fill();
    }
  },
  onion(rx, ry){
    ctx.fillStyle = 'rgba(160,120,190,.35)';
    ctx.beginPath(); ctx.ellipse(0, ry * .05, rx * .55, ry * .5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, rx * .72, ry * .66, 0, 0, TAU); ctx.stroke();
  },
  olive(rx, ry){
    ctx.fillStyle = '#2c3510';
    ctx.beginPath(); ctx.ellipse(0, 0, rx * .42, ry * .45, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e85c40';
    ctx.beginPath(); ctx.ellipse(0, ry * .05, rx * .22, ry * .24, 0, 0, TAU); ctx.fill();
  },
  char(rx, ry){
    ctx.strokeStyle = 'rgba(60,28,10,.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const [x0, y0, x1, y1] of [[-.6, -.2, -.15, -.35], [-.3, .3, .3, .2], [.15, -.3, .6, -.1]]) {
      ctx.beginPath(); ctx.moveTo(x0 * rx, y0 * ry); ctx.lineTo(x1 * rx, y1 * ry); ctx.stroke();
    }
  },
  waffle(rx, ry){
    ctx.strokeStyle = 'rgba(140,90,40,.5)'; ctx.lineWidth = 1.6;
    for (const t of [-.5, 0, .5]) {
      ctx.beginPath(); ctx.moveTo(-rx * .85, t * ry); ctx.lineTo(rx * .85, t * ry); ctx.stroke();
    }
    for (const t of [-.66, -.33, 0, .33, .66]) {
      ctx.beginPath(); ctx.moveTo(t * rx, -ry * .8); ctx.lineTo(t * rx, ry * .8); ctx.stroke();
    }
  },
};

// custom silhouettes
const ART = {
  cyl(def){ cylinder(def.w, def.h, def.base, def.dark, LID[def.deco]); },

  swirl(def){
    const { w, h, base, dark } = def;
    // soft-serve: three squashy lobes + a curled tip
    ball(0, h * .26, w * .48, h * .3, base, dark);
    ball(0, -h * .02, w * .37, h * .26, base, dark);
    ball(w * .04, -h * .28, w * .23, h * .2, base, dark);
    ctx.strokeStyle = shade(dark, .96); ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(w * .16, -h * .4); ctx.quadraticCurveTo(w * .3, -h * .52, w * .2, -h * .58); ctx.stroke();
  },

  scoop(def){
    const { w, h, base, dark } = def;
    const rx = w / 2;
    // dome with a scalloped melt edge
    const g = ctx.createRadialGradient(-rx * .35, -h * .3, rx * .15, 0, -h * .05, rx * 1.35);
    g.addColorStop(0, shade(base, 1.15));
    g.addColorStop(.6, base);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-rx, h * .18);
    ctx.ellipse(0, h * .18, rx, h * .66, 0, Math.PI, 0, false); // dome
    for (let i = 3; i >= 0; i--) {                              // 4 melt bumps
      const x0 = -rx + (i + 1) * (w / 4), x1 = -rx + i * (w / 4);
      ctx.arc((x0 + x1) / 2, h * .18, w / 8, 0, Math.PI, false);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(dark, .85); ctx.lineWidth = 2; ctx.stroke();
    sheen(-rx * .35, -h * .22, rx * .34, h * .18, .5);
    if (def.deco === 'chips') {
      ctx.fillStyle = '#4a2f1d';
      for (const [x, y] of [[-.4, -.1], [.1, -.3], [.35, .0], [-.1, .1], [.2, .3]]) {
        ctx.beginPath(); ctx.ellipse(x * rx, y * h * .4, 2.4, 1.8, .5, 0, TAU); ctx.fill();
      }
    }
  },

  berry(def){
    const { w, h, base, dark } = def;
    const rx = w / 2;
    const g = ctx.createRadialGradient(-rx * .3, -h * .25, rx * .1, 0, 0, rx * 1.4);
    g.addColorStop(0, shade(base, 1.15));
    g.addColorStop(.55, base);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();                                  // plump heart
    ctx.moveTo(0, h * .5);
    ctx.bezierCurveTo(-w * .68, h * .16, -w * .5, -h * .52, 0, -h * .3);
    ctx.bezierCurveTo(w * .5, -h * .52, w * .68, h * .16, 0, h * .5);
    ctx.fill();
    ctx.strokeStyle = shade(dark, .85); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,235,190,.85)';          // seeds
    for (const [x, y] of [[-.25, -.05], [.25, -.05], [0, .12], [-.14, .3], [.14, .3], [0, -.22]]) {
      ctx.beginPath(); ctx.ellipse(x * w, y * h, 1.6, 2.4, 0, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#5fae35';                        // leafy crown
    for (const a of [-.9, -.3, .3, .9]) {
      ctx.beginPath(); ctx.ellipse(a * w * .16, -h * .38, 6.5, 3, a * .7 - .2, 0, TAU); ctx.fill();
    }
    sheen(-w * .18, -h * .16, w * .16, h * .12, .45);
  },

  cherry(def){
    const { w, h, base, dark } = def;
    ball(0, h * .08, w * .48, h * .42, base, dark);
    ctx.strokeStyle = '#5a8c2e'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -h * .3); ctx.quadraticCurveTo(w * .18, -h * .75, w * .34, -h * .62); ctx.stroke();
    sheen(-w * .16, -h * .1, w * .13, h * .12, .7);
  },

  blob(def){
    const { w, h, base, dark } = def;
    const g = ctx.createRadialGradient(-w * .2, -h * .3, w * .08, 0, 0, w * .75);
    g.addColorStop(0, shade(base, 1.14));
    g.addColorStop(.6, base);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();                                  // squishy blob + drips
    ctx.ellipse(0, -h * .08, w * .5, h * .38, 0, 0, TAU);
    ctx.ellipse(-w * .22, h * .28, w * .13, h * .22, 0, 0, TAU);
    ctx.ellipse(w * .18, h * .3, w * .1, h * .18, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = shade(dark, .88); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -h * .08, w * .5, h * .38, 0, 0, TAU); ctx.stroke();
    if (def.deco === 'chunks') {
      ctx.fillStyle = shade(dark, 1.25);
      for (const [x, y] of [[-.28, -.15], [.1, .05], [.3, -.2], [-.05, -.3]]) {
        ctx.beginPath(); ctx.ellipse(x * w, y * h, 3.4, 2.6, .4, 0, TAU); ctx.fill();
      }
    }
    sheen(-w * .2, -h * .26, w * .18, h * .12, .5);
  },

  ruffle(def){
    const { w, h, base, dark } = def;
    const n = 7, rx = w / 2;
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, shade(base, 1.08));
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();                                  // frilly leaf
    ctx.moveTo(-rx, 0);
    for (let i = 0; i < n; i++)
      ctx.quadraticCurveTo(-rx + (i + .5) * (w / n), -h * (i % 2 ? .9 : .55), -rx + (i + 1) * (w / n), 0);
    for (let i = n - 1; i >= 0; i--)
      ctx.quadraticCurveTo(-rx + (i + .5) * (w / n), h * (i % 2 ? .55 : .9), -rx + i * (w / n), 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(dark, .85); ctx.lineWidth = 1.8; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-rx * .8, 0); ctx.quadraticCurveTo(0, -h * .2, rx * .8, 0); ctx.stroke();
  },

  bacon(def){
    const { w, h, base, dark } = def;
    const rx = w / 2, amp = h * .5;
    const wave = (y0, dir) => {
      ctx.moveTo(-rx, y0);
      ctx.quadraticCurveTo(-rx * .5, y0 + dir * amp, 0, y0);
      ctx.quadraticCurveTo(rx * .5, y0 - dir * amp, rx, y0);
    };
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, base);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    wave(-h * .34, 1);
    ctx.lineTo(rx, h * .34);
    ctx.quadraticCurveTo(rx * .5, h * .34 - amp, 0, h * .34);
    ctx.quadraticCurveTo(-rx * .5, h * .34 + amp, -rx, h * .34);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(dark, .85); ctx.lineWidth = 1.8; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,225,205,.85)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); wave(0, 1); ctx.stroke();
  },

  crumble(def){
    const { w, h, base, dark } = def;
    for (const [x, y, r] of [[-.32, .12, .21], [.02, .2, .23], [.34, .1, .2], [-.16, -.14, .2], [.18, -.16, .19], [.0, -.02, .18]])
      ball(x * w, y * h, r * w, r * w * .8, shade(base, .92 + r), dark);
  },

  shreds(def){
    const { w, h, base, dark } = def;
    ctx.lineCap = 'round';
    const strands = [[-.4, .2, -.25, -.25, .05], [-.2, -.2, .0, .25, -.1], [.05, .2, .2, -.22, .15],
                     [.25, -.18, .42, .18, .0], [-.35, -.05, -.1, .05, .3], [.1, -.02, .38, -.05, -.3]];
    for (let i = 0; i < strands.length; i++) {
      const [x0, y0, x1, y1, bend] = strands[i];
      ctx.strokeStyle = i % 2 ? base : shade(dark, 1.15);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x0 * w, y0 * h);
      ctx.quadraticCurveTo((x0 + x1) / 2 * w + bend * w * .3, (y0 + y1) / 2 * h - h * .3, x1 * w, y1 * h);
      ctx.stroke();
    }
  },

  chili(def){
    const { w, h, base, dark } = def;
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, shade(base, 1.12));
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();                                  // curved pod, tip right
    ctx.moveTo(-w * .42, -h * .28);
    ctx.quadraticCurveTo(w * .1, -h * .62, w * .48, -h * .05);
    ctx.quadraticCurveTo(w * .3, h * .12, w * .1, h * .3);
    ctx.quadraticCurveTo(-w * .3, h * .5, -w * .46, h * .05);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(dark, .85); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#5a9633';                        // stem cap
    ctx.beginPath();
    ctx.ellipse(-w * .44, -h * .1, w * .1, h * .26, .3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#4a7d2a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * .48, -h * .26); ctx.quadraticCurveTo(-w * .56, -h * .55, -w * .44, -h * .62); ctx.stroke();
    sheen(-w * .1, -h * .3, w * .2, h * .12, .45, -.15);
  },

  cubes(def){
    const { w, h, base, dark } = def;
    for (const [cx, cy, s] of [[-.3, .1, .42], [.08, -.05, .46], [.36, .12, .38]]) {
      const x = cx * w, y = cy * h, r = s * h;
      ctx.fillStyle = shade(base, 1.1);                       // top face
      ctx.beginPath();
      ctx.moveTo(x - r, y - r * .5); ctx.lineTo(x - r * .4, y - r); ctx.lineTo(x + r, y - r * .6); ctx.lineTo(x + r * .4, y - r * .1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = dark;                                   // front face
      rr(x - r, y - r * .5, r * 1.4, r * 1.2, 2); ctx.fill();
      ctx.fillStyle = base;
      rr(x - r * .85, y - r * .35, r * 1.1, r * .9, 2); ctx.fill();
      sheen(x - r * .4, y - r * .1, r * .3, r * .2, .4);
    }
  },

  mushroom(def){
    const { w, h, base, dark } = def;
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, shade(base, 1.1));
    g.addColorStop(1, shade(base, .92));
    ctx.fillStyle = g;
    ctx.beginPath();                                  // cross-section: cap + stem
    ctx.moveTo(-w * .5, -h * .05);
    ctx.ellipse(0, -h * .05, w * .5, h * .42, 0, Math.PI, 0, false);
    ctx.lineTo(w * .16, -h * .05);
    ctx.lineTo(w * .13, h * .5);
    ctx.lineTo(-w * .13, h * .5);
    ctx.lineTo(-w * .16, -h * .05);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = shade(dark, 1.25); ctx.lineWidth = 1.4;   // gills
    for (const t of [-.36, -.24, .24, .36]) {
      ctx.beginPath(); ctx.moveTo(t * w, -h * .04); ctx.lineTo(t * w * .55, h * .06); ctx.stroke();
    }
    sheen(-w * .2, -h * .3, w * .18, h * .12, .4);
  },

  pepperstrip(def){
    const { w, h, base, dark } = def;
    const g = ctx.createLinearGradient(0, -h, 0, h / 2);
    g.addColorStop(0, shade(base, 1.1));
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();                                  // arched strip
    ctx.moveTo(-w * .5, h * .28);
    ctx.quadraticCurveTo(0, -h * .95, w * .5, h * .28);
    ctx.lineTo(w * .34, h * .5);
    ctx.quadraticCurveTo(0, -h * .25, -w * .34, h * .5);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(dark, .85); ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * .36, h * .16); ctx.quadraticCurveTo(0, -h * .6, w * .36, h * .16); ctx.stroke();
  },

  // ---- candy ----
  gummy(def){       // vingummi — bright translucent jelly
    const { w, h, base, dark } = def;
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, shade(base, 1.3));
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    rr(-w / 2, -h / 2, w, h, def.corner); ctx.fill();
    ctx.strokeStyle = shade(dark, .9); ctx.lineWidth = 1.8; ctx.stroke();
    // sugar-dusted matte edge
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
    rr(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, def.corner - 3); ctx.stroke();
    sheen(-w * .18, -h * .2, w * .22, h * .16, .6);
  },

  kex(def){         // Kexchoklad — ridged chocolate wafer bar
    const { w, h, base, dark } = def;
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, shade(base, 1.15));
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    rr(-w / 2, -h / 2, w, h, def.corner); ctx.fill();
    ctx.strokeStyle = shade(dark, .8); ctx.lineWidth = 2; ctx.stroke();
    // vertical ridges
    ctx.strokeStyle = 'rgba(60,30,15,.4)'; ctx.lineWidth = 1.6;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * w * .16, -h * .38); ctx.lineTo(i * w * .16, h * .38); ctx.stroke();
    }
    sheen(-w * .28, -h * .22, w * .3, h * .16, .35);
  },

  dumle(def){       // Dumle — glossy toffee-chocolate drop
    const { w, h, base, dark } = def;
    ball(0, h * .04, w * .5, h * .5, base, dark);
    // little dipped swirl on top
    ctx.strokeStyle = shade(dark, .7); ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(w * .04, -h * .18, w * .12, .2, Math.PI * 1.3); ctx.stroke();
    sheen(-w * .18, -h * .18, w * .16, h * .14, .7);
  },

  bubs(def){        // Bubs — two-tone rounded skull/bean shape
    const { w, h, dark } = def;
    ball(-w * .02, 0, w * .5, h * .5, '#ff9dc4', '#e05f92');   // pink half
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0, 0, w * .5, h * .5, 0, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, '#5a4a4a'); g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, h * .04, w, h);                       // dark (licorice) bottom
    ctx.restore();
    ctx.strokeStyle = 'rgba(120,60,90,.7)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(0, 0, w * .5, h * .5, 0, 0, TAU); ctx.stroke();
    sheen(-w * .2, -h * .22, w * .18, h * .14, .6);
  },

  car(def){         // Ahlgrens bilar — foam candy car
    const { w, h, base, dark } = def;
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, shade(base, 1.15)); g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();                                          // body + cabin
    ctx.moveTo(-w * .48, h * .3);
    ctx.lineTo(-w * .4, -h * .05);
    ctx.lineTo(-w * .16, -h * .05);
    ctx.lineTo(-w * .06, -h * .42);
    ctx.lineTo(w * .16, -h * .42);
    ctx.lineTo(w * .24, -h * .05);
    ctx.lineTo(w * .42, -h * .05);
    ctx.lineTo(w * .48, h * .3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(dark, .85); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.6)';                  // window
    rr(-w * .08, -h * .34, w * .2, h * .24, 3); ctx.fill();
    ctx.fillStyle = '#3a2a2a';                               // wheels
    ctx.beginPath(); ctx.arc(-w * .26, h * .32, h * .16, 0, TAU); ctx.arc(w * .26, h * .32, h * .16, 0, TAU); ctx.fill();
  },

  jellyheart(def){  // geléhjärta — glossy jelly heart
    const { w, h, base, dark } = def;
    const g = ctx.createRadialGradient(-w * .2, -h * .2, w * .08, 0, 0, w * .6);
    g.addColorStop(0, shade(base, 1.3)); g.addColorStop(.6, base); g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, h * .42);
    ctx.bezierCurveTo(-w * .7, h * .0, -w * .5, -h * .5, 0, -h * .16);
    ctx.bezierCurveTo(w * .5, -h * .5, w * .7, h * .0, 0, h * .42);
    ctx.fill();
    ctx.strokeStyle = shade(dark, .9); ctx.lineWidth = 1.8; ctx.stroke();
    sheen(-w * .16, -h * .12, w * .16, h * .12, .6);
  },
};

function drawFood(def){
  (ART[def.art] || ART.cyl)(def);
}

function drawTopping(b){
  const def = b.plugin.def;
  ctx.save();
  ctx.translate(b.position.x, b.position.y);
  ctx.rotate(b.angle);
  // soft contact shadow
  ctx.fillStyle = 'rgba(60,20,60,.16)';
  ctx.beginPath();
  ctx.ellipse(0, def.h / 2 + 3, def.w * .44, 4.5, 0, 0, TAU);
  ctx.fill();
  drawFood(def);
  ctx.restore();
}

// ---------- the dish + plate ----------
function drawPlate(){
  const lv = LEVELS[G.levelIndex];
  const p = G.plate.position;
  ctx.save();
  ctx.translate(p.x, G.plateY);

  // shadow on "floor glow"
  ctx.fillStyle = 'rgba(50,15,60,.25)';
  ctx.beginPath(); ctx.ellipse(0, 30, 105, 10, 0, 0, Math.PI * 2); ctx.fill();

  // tray
  puffy(-88, -9, 176, 18, 9, '#ffffff', '#cfc0e8');

  // dish base
  switch (lv.dish) {
    case 'pancake':
      for (let i = 0; i < 3; i++) puffy(-71 + i * 2, -14 - (i + 1) * 12, 142 - i * 4, 15, 8, '#f5c069', '#c98b3d');
      puffy(-18, -52, 36, 12, 5, '#ffe27a', '#f0b32c'); // butter on top
      break;
    case 'pizza':
      puffy(-80, -28, 160, 12, 6, '#e8b25e', '#b57f33');           // crust
      puffy(-72, -26, 144, 8, 4, '#ff6b52', '#d84a33');            // sauce
      break;
    case 'burger':
      puffy(-69, -40, 138, 32, 16, '#f2b45e', '#c9832f');          // bun
      ctx.fillStyle = '#fff3d8';
      for (const [sx, sy] of [[-30, -30], [0, -34], [28, -29], [-14, -24], [16, -23]]) {
        ctx.beginPath(); ctx.ellipse(sx, sy, 2.6, 1.8, .4, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'taco':
      ctx.save(); ctx.rotate(0);
      ctx.save(); ctx.translate(-37, -32); ctx.rotate(0.82); puffy(-47, -6.5, 94, 13, 5, '#f5cb72', '#c99b42'); ctx.restore();
      ctx.save(); ctx.translate(37, -32); ctx.rotate(-0.82); puffy(-47, -6.5, 94, 13, 5, '#f5cb72', '#c99b42'); ctx.restore();
      ctx.restore();
      break;
    case 'sundae':
      puffy(-55, -23, 110, 14, 6, '#dff3ff', '#a8c9e8');
      ctx.save(); ctx.translate(-57, -38); ctx.rotate(0.22); puffy(-6.5, -28, 13, 56, 5, '#eaf7ff', '#a8c9e8'); ctx.restore();
      ctx.save(); ctx.translate(57, -38); ctx.rotate(-0.22); puffy(-6.5, -28, 13, 56, 5, '#eaf7ff', '#a8c9e8'); ctx.restore();
      break;
    case 'bowl': {
      // glossy translucent candy bowl
      const g = ctx.createLinearGradient(0, -46, 0, -6);
      g.addColorStop(0, 'rgba(255,180,225,.55)');
      g.addColorStop(1, 'rgba(210,120,190,.85)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-74, -48);
      ctx.quadraticCurveTo(-84, -8, -58, -6);
      ctx.lineTo(58, -6);
      ctx.quadraticCurveTo(84, -8, 74, -48);
      ctx.quadraticCurveTo(0, -30, -74, -48);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c94f9a'; ctx.lineWidth = 3; ctx.stroke();
      // rim
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-74, -48); ctx.quadraticCurveTo(0, -30, 74, -48); ctx.stroke();
      // shine
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      ctx.beginPath(); ctx.ellipse(-40, -30, 12, 16, .5, 0, Math.PI * 2); ctx.fill();
      break;
    }
  }

  // little face on the tray, mood follows tower lean
  let mood = 'happy';
  if (G.landedStack.length >= 2) {
    const top = G.landedStack[G.landedStack.length - 1];
    const risk = Math.abs(top.position.x - p.x) / 95;
    mood = risk > .75 ? 'panic' : risk > .45 ? 'worried' : 'happy';
  }
  ctx.fillStyle = '#5a4470';
  ctx.beginPath(); ctx.arc(-13, 0, 3, 0, Math.PI * 2); ctx.arc(13, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5a4470'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'happy') ctx.arc(0, 1, 5.5, .3, Math.PI - .3);
  else if (mood === 'worried') ctx.arc(0, 8, 4, Math.PI * 1.15, Math.PI * 1.85);
  else ctx.ellipse(0, 5, 3.4, 4.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ---------- Mini gummy bears (they scamper along the floor and
//            gobble up any topping that tumbles off the dish) ----------
const BEAR_COLORS = [
  ['#ff5b6b', '#c62740'],  // red
  ['#7ee06e', '#3aa63f'],  // green
  ['#ffd23a', '#e89a1c'],  // yellow
  ['#ff9d3a', '#e06a1c'],  // orange
  ['#66c8ff', '#2b8fd6'],  // blue
  ['#e06bff', '#a12fd6'],  // purple
];
const BEAR_FLOOR = H - 26;

function spawnBears(){
  const bears = [];
  const n = 4;
  for (let i = 0; i < n; i++) {
    const col = BEAR_COLORS[i % BEAR_COLORS.length];
    bears.push({
      x: 60 + i * (W - 120) / (n - 1),
      tx: 60 + Math.random() * (W - 120),
      base: col[0], dark: col[1],
      face: 1,                       // toward-travel facing (-1 / +1)
      phase: Math.random() * TAU,    // leg wiggle
      speed: .13 + Math.random() * .05,
      eat: 0, cheer: 0, idleT: 500 + Math.random() * 1500,
      scale: .82 + Math.random() * .3,
    });
  }
  return bears;
}

// send the nearest free bear scurrying to a dropped snack
function sendBearTo(x){
  if (!G.bears.length) return;
  let best = null, bd = 1e9;
  for (const b of G.bears) {
    if (b.eat > 0) continue;
    const d = Math.abs(b.x - x);
    if (d < bd) { bd = d; best = b; }
  }
  (best || G.bears[0]).tx = Math.max(24, Math.min(W - 24, x));
  (best || G.bears[0]).chase = true;
}

function updateBears(dt){
  for (const b of G.bears) {
    if (b.cheer > 0) { b.cheer = Math.max(0, b.cheer - dt / 1400); }
    if (b.eat > 0) { b.eat = Math.max(0, b.eat - dt / 480); b.phase += dt * .02; continue; }

    const dx = b.tx - b.x;
    const dist = Math.abs(dx);
    if (dist > 4) {
      const step = Math.sign(dx) * Math.min(dist, b.speed * dt);
      b.x += step;
      b.face = Math.sign(dx) || b.face;
      b.phase += Math.abs(step) * .12;   // legs move as it runs
    } else if (b.chase) {
      // arrived at a fallen snack → chomp!
      b.eat = 1; b.chase = false;
      textPop(b.x, BEAR_FLOOR - 34, 'NOM!', '#ff8fb0', 800, 20);
    } else {
      b.idleT -= dt;
      if (b.idleT <= 0) {              // pick a new spot and wander there
        b.tx = 40 + Math.random() * (W - 80);
        b.idleT = 600 + Math.random() * 2200;
      }
    }
    b.x = Math.max(20, Math.min(W - 20, b.x));
  }
}

function drawBear(b){
  const t = G.time;
  const bob = b.eat > 0 ? Math.abs(Math.sin(t * .03)) * 3 : 0;
  const cheer = b.cheer > 0 ? Math.abs(Math.sin(t * .02)) * 6 : 0;
  const y = BEAR_FLOOR - bob - cheer;
  const s = b.scale;
  ctx.save();
  ctx.translate(b.x, y);
  ctx.scale(s * b.face, s);

  // shadow
  ctx.fillStyle = 'rgba(50,15,60,.18)';
  ctx.beginPath(); ctx.ellipse(0, 20, 15, 4, 0, 0, TAU); ctx.fill();

  const jelly = (cx, cy, rx, ry) => {
    const g = ctx.createRadialGradient(cx - rx * .35, cy - ry * .4, rx * .15, cx, cy, Math.max(rx, ry) * 1.3);
    g.addColorStop(0, shade(b.base, 1.25));
    g.addColorStop(.6, b.base);
    g.addColorStop(1, b.dark);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fill();
  };

  // running legs (wiggle with phase)
  const lw = Math.sin(b.phase) * 4;
  jelly(-7, 16 + lw, 6, 7);
  jelly(7, 16 - lw, 6, 7);
  // arms
  jelly(-13, 2, 5, 6);
  jelly(13, 2, 5, 6);
  // belly
  jelly(0, 6, 13, 14);
  // ears
  jelly(-9, -16, 5, 5);
  jelly(9, -16, 5, 5);
  // head
  jelly(0, -9, 11, 10);
  // snout highlight
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath(); ctx.ellipse(-3, -12, 4, 3, -.4, 0, TAU); ctx.fill();

  // face
  ctx.fillStyle = '#3a2033';
  if (b.eat > 0) {
    // open happy mouth chomping
    ctx.beginPath(); ctx.arc(2, -6, 3.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -3, 3, 2.4, 0, 0, TAU); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(-4, -10, 1.5, 0, TAU); ctx.arc(4, -10, 1.5, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(1, -6, 1.4, 0, TAU); ctx.fill(); // nose
  }
  ctx.restore();
}

function drawBears(){
  for (const b of G.bears) drawBear(b);
}

// ---------- Raider: a big hungry gummy bear that falls from the cloud ----------
const RAIDER = ['#c86bff', '#7a2fc9'];

function spawnRaider(){
  const x = 110 + Math.random() * (W - 220);
  const body = Bodies.circle(x, DISPENSER_Y + 40, 24, {
    density: .0016, friction: 1.1, frictionStatic: 2, restitution: .12, frictionAir: .02,
  });
  body.plugin = { raider: true };
  Composite.add(G.engine.world, body);
  G.raider = { body, state: 'falling', eatT: 0, life: 0, blink: 0 };
  G.raiderCd = 15000 + Math.random() * 10000;
  G.shakeMeter = 0;
  textPop(W / 2, 205, '🐻 Hungry bear! Shake it off!', '#ffd23a', 2400, 20);
  Snd.wobble();
}

function updateRaider(dt){
  const r = G.raider;
  if (!r || !G.engine) return;
  const b = r.body;
  r.life += dt; r.blink -= dt; if (r.blink < -140) r.blink = 1800 + Math.random() * 2200;

  if (b.position.y > H + 60) { munch(b); return; }   // fell past the floor → gone

  const speed = Math.hypot(b.velocity.x, b.velocity.y);

  if (r.state === 'falling') {
    if (speed < 2.4 && Math.abs(b.position.x - G.plate.position.x) < 92 && b.position.y > 380) {
      r.state = 'onplate'; r.eatT = 950; G.shakeMeter = 0;
    }
  } else if (r.state === 'onplate') {
    if (Math.abs(b.position.x - G.plate.position.x) > 100) { r.state = 'falling'; return; }
    Matter.Sleeping.set(b, false);
    // it eventually waddles off on its own so it can never sit forever
    r.onPlateMs = (r.onPlateMs || 0) + dt;
    if (r.onPlateMs > 9000) {
      r.state = 'flung';
      Body.setVelocity(b, { x: (b.position.x < W / 2 ? -1 : 1) * 6, y: -8 });
      textPop(b.position.x, b.position.y - 40, 'Burp! 🐻', '#ffd23a', 1200, 20);
      return;
    }
    // SHAKE the plate hard to fling the bear off before it eats everything
    if (G.shakeMeter >= 4) {
      r.state = 'flung';
      Body.setVelocity(b, { x: (b.position.x < W / 2 ? -1 : 1) * 9, y: -11.5 });
      Body.setAngularVelocity(b, (Math.random() - .5) * .6);
      textPop(b.position.x, b.position.y - 42, 'WHEE! 🐻', '#7ee06e', 1300, 22);
      G.shakeMeter = 0;
      return;
    }
    // otherwise it gobbles a topping off the top every so often
    r.eatT -= dt;
    if (r.eatT <= 0) {
      r.eatT = 800;
      if (G.landedStack.length) {
        munch(G.landedStack[G.landedStack.length - 1]);   // counts as a miss
        textPop(b.position.x, b.position.y - 28, 'NOM!', '#ff5b6b', 700, 20);
      }
    }
  } else if (r.state === 'flung') {
    if (b.position.y > H + 60 || b.position.x < -40 || b.position.x > W + 40 || r.life > 7000) { munch(b); return; }
  }
}

function drawRaider(){
  const r = G.raider;
  if (!r || !r.body) return;
  const b = r.body;
  const eating = r.state === 'onplate';
  ctx.save();
  ctx.translate(b.position.x, b.position.y);
  ctx.rotate(b.angle * .5);
  const S = 1.9;
  // shadow
  ctx.fillStyle = 'rgba(50,15,60,.18)';
  ctx.beginPath(); ctx.ellipse(0, 22 * S, 16 * S, 4, 0, 0, TAU); ctx.fill();
  const jelly = (cx, cy, rx, ry) => {
    const g = ctx.createRadialGradient(cx - rx * .35, cy - ry * .4, rx * .15, cx, cy, Math.max(rx, ry) * 1.3);
    g.addColorStop(0, shade(RAIDER[0], 1.25)); g.addColorStop(.6, RAIDER[0]); g.addColorStop(1, RAIDER[1]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fill();
  };
  const wig = Math.sin(G.time * .02) * 3;
  jelly(-7 * S, 15 * S + wig, 6 * S, 6 * S);
  jelly(7 * S, 15 * S - wig, 6 * S, 6 * S);
  jelly(-13 * S, 2 * S, 5 * S, 6 * S);
  jelly(13 * S, 2 * S, 5 * S, 6 * S);
  jelly(0, 5 * S, 13 * S, 13 * S);
  jelly(-9 * S, -15 * S, 5 * S, 5 * S);
  jelly(9 * S, -15 * S, 5 * S, 5 * S);
  jelly(0, -8 * S, 11 * S, 10 * S);
  ctx.fillStyle = '#3a2033';
  const blink = r.blink < 0;
  if (eating) {
    // big chomping mouth
    ctx.beginPath(); ctx.ellipse(0, -2 * S, 6 * S, (4 + Math.abs(Math.sin(G.time * .03)) * 3) * S, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ff7da0'; ctx.beginPath(); ctx.ellipse(0, 0, 3 * S, 2 * S, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3a2033';
    ctx.beginPath(); ctx.arc(-5 * S, -12 * S, 1.8 * S, 0, TAU); ctx.arc(5 * S, -12 * S, 1.8 * S, 0, TAU); ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(-4 * S, -11 * S, 1.6 * S, blink ? .4 * S : 1.8 * S, 0, 0, TAU);
    ctx.ellipse(4 * S, -11 * S, 1.6 * S, blink ? .4 * S : 1.8 * S, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -7 * S, 1.6 * S, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ---------- dispenser cloud ----------
function drawDispenser(){
  if (G.state !== 'play' && G.state !== 'settling') return;
  const x = G.disp.x, y = DISPENSER_Y - 30;
  ctx.save();
  ctx.translate(x, y);
  // cloud
  ctx.fillStyle = '#ffffff';
  for (const [cx, cy, r] of [[-22, 4, 16], [0, -4, 20], [22, 4, 16], [0, 8, 18]]) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(180,160,220,.35)';
  ctx.beginPath(); ctx.ellipse(0, 14, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // hanging preview topping
  if (G.preview && G.state === 'play') {
    const def = G.preview;
    const lv = LEVELS[G.levelIndex];
    const frac = Math.max(0, G.autoT / lv.dropEvery);
    const urgent = G.autoT < 900;
    const sway = Math.sin(G.time * .004) * .06 + (urgent ? Math.sin(G.time * .04) * .04 : 0);
    ctx.save();
    ctx.translate(x, y + 26);
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(Math.sin(sway) * 30, 26); ctx.stroke();
    ctx.translate(Math.sin(sway) * 30, 26 + def.h / 2);
    ctx.rotate(sway);
    drawFood(def);
    if (G.previewWrong) {   // red warning ring so kids know to dodge it
      const rad = Math.max(def.w, def.h) * .62;
      ctx.strokeStyle = '#ff2d2d'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, rad, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-rad * .7, -rad * .7); ctx.lineTo(rad * .7, rad * .7); ctx.stroke();
    }
    ctx.restore();

    // countdown bar above the cloud — the topping drops when it empties
    const bw = 56, bx = x - bw / 2, by = y - 38;
    ctx.fillStyle = 'rgba(90,60,120,.3)';
    rr(bx, by, bw, 9, 4.5); ctx.fill();
    ctx.fillStyle = urgent ? '#ff6e6e' : '#ffffff';
    rr(bx, by, Math.max(9, bw * frac), 9, 4.5); ctx.fill();

    // topping name under the preview (red "Yuck!" for a wrong item)
    ctx.font = '800 14px "Baloo 2","Comic Sans MS",ui-rounded,sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(90,30,90,.55)';
    const ly = y + 62 + def.h;
    const label = G.previewWrong ? `❌ ${def.label}?` : def.label;
    ctx.strokeText(label, x, ly);
    ctx.fillStyle = G.previewWrong ? '#ff5b5b' : '#ffffff';
    ctx.fillText(label, x, ly);
  }
}

// ---------- background ----------
let clouds = [];
for (let i = 0; i < 5; i++) clouds.push({ x: Math.random() * W, y: 90 + Math.random() * 260, s: .5 + Math.random() * .8, v: .006 + Math.random() * .012 });

function drawBG(){
  const lv = LEVELS[G.levelIndex] || LEVELS[0];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, lv.sky[0]);
  g.addColorStop(1, lv.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // sun
  ctx.fillStyle = 'rgba(255,255,235,.7)';
  ctx.beginPath(); ctx.arc(W - 70, 90, 38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,235,.25)';
  ctx.beginPath(); ctx.arc(W - 70, 90, 56, 0, Math.PI * 2); ctx.fill();

  // drifting clouds
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  for (const c of clouds) {
    c.x += c.v * STEP * (G.wind.on ? 4 : 1);
    if (c.x > W + 60) c.x = -60;
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.s, c.s);
    for (const [cx, cy, r] of [[-20, 4, 13], [0, -2, 17], [20, 4, 13]]) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // dreamy cloud sea at the bottom (two tinted banks)
  const bank = (yBase, color, rBase, phase) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.rect(0, yBase + rBase * .4, W, H - yBase);
    for (let i = 0; i <= 7; i++) {
      const bx = i * (W / 7) + Math.sin(i * 2.4 + phase) * 18;
      const by = yBase + Math.sin(i * 1.7 + phase + G.time * .0004) * 10;
      const r = rBase * (0.75 + 0.5 * Math.abs(Math.sin(i * 3.1 + phase)));
      ctx.moveTo(bx + r, by);
      ctx.arc(bx, by, r, 0, TAU);
    }
    ctx.fill();
  };
  bank(H - 115, shade(lv.hill2, 1.35), 52, 1.3);
  bank(H - 55,  shade(lv.hill, 1.5),  62, 4.1);

  // twinkling sparkles in the air
  for (let i = 0; i < 18; i++) {
    const sx = (i * 137.5) % W;
    const sy = 120 + ((i * 211.3) % (H - 320));
    const tw = Math.abs(Math.sin(G.time * .0012 + i * 1.7));
    if (tw < .35) continue;
    ctx.globalAlpha = (tw - .35) * .9;
    ctx.fillStyle = '#ffffff';
    const r = 1.2 + tw * 2.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy - r * 2); ctx.quadraticCurveTo(sx + r * .5, sy - r * .5, sx + r * 2, sy);
    ctx.quadraticCurveTo(sx + r * .5, sy + r * .5, sx, sy + r * 2);
    ctx.quadraticCurveTo(sx - r * .5, sy + r * .5, sx - r * 2, sy);
    ctx.quadraticCurveTo(sx - r * .5, sy - r * .5, sx, sy - r * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // wind streaks
  if (G.wind.on) {
    const dir = Math.sin(G.wind.t * .0011);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const yy = 180 + i * 110 + Math.sin(G.time * .002 + i) * 20;
      const xx = (G.time * .12 * Math.sign(dir) + i * 140) % (W + 160) - 80;
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.quadraticCurveTo(xx + 30 * Math.sign(dir), yy - 6, xx + 60 * Math.sign(dir), yy);
      ctx.stroke();
    }
  }
}

function drawParticles(){
  for (const p of G.particles) {
    const a = Math.max(0, Math.min(1, p.life / (p.maxLife * .5)));
    ctx.globalAlpha = a;
    if (p.type === 'text') {
      ctx.font = `900 ${p.size}px "Baloo 2","Comic Sans MS",ui-rounded,sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(90,30,90,.65)';
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    } else if (p.type === 'confetti') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function render(){
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (G.shake > 0) ctx.translate((Math.random() - .5) * 7, (Math.random() - .5) * 7);

  drawBG();

  if (G.engine) {
    drawPlate();
    for (const b of G.toppings) drawTopping(b);
    drawRaider();
    drawDispenser();
    drawBears();
  }
  drawParticles();

  // "SHAKE!" prompt while a raider is sitting on the plate
  if (G.raider && G.raider.state === 'onplate') {
    const pulse = .6 + .4 * Math.abs(Math.sin(G.time * .012));
    ctx.font = '900 26px "Baloo 2","Comic Sans MS",ui-rounded,sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(90,30,90,.6)';
    ctx.strokeText('↔ SHAKE IT OFF! ↔', W / 2, 300);
    ctx.fillStyle = `rgba(255,${Math.round(120 + 100 * pulse)},60,1)`;
    ctx.fillText('↔ SHAKE IT OFF! ↔', W / 2, 300);
    // shake progress
    const bw = 180, bx = W / 2 - bw / 2, by = 316;
    ctx.fillStyle = 'rgba(90,60,120,.35)'; rr(bx, by, bw, 12, 6); ctx.fill();
    ctx.fillStyle = '#7ee06e'; rr(bx, by, Math.min(bw, bw * G.shakeMeter / 4), 12, 6); ctx.fill();
  }

  // slow-mo vignette
  if (G.slowmo > 0) {
    ctx.fillStyle = 'rgba(120,80,255,.1)';
    ctx.fillRect(0, 0, W, H);
  }

  // little mirrored camera preview so kids see themselves steering
  if (cameraOn() && (G.state === 'play' || G.state === 'settling') && Cam.video && Cam.video.readyState >= 2) {
    const pw = 92, ph = 69, px = W - pw - 10, py = H - ph - 12;
    ctx.save();
    rr(px - 3, py - 3, pw + 6, ph + 6, 10);
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
    rr(px, py, pw, ph, 8); ctx.clip();
    ctx.translate(px + pw, py); ctx.scale(-1, 1);           // mirror
    ctx.drawImage(Cam.video, 0, 0, pw, ph);
    ctx.restore();
    if (Cam.ready) {
      const hx = px + Cam.x * pw;
      ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(hx, py); ctx.lineTo(hx, py + ph); ctx.stroke();
      ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('✋', hx, py - 6);
    }
  }
}

// ============================================================
// Input
// ============================================================
function canvasX(e){
  const r = canvas.getBoundingClientRect();
  return (e.clientX - r.left) * (W / r.width);
}
let ptr = { down: false, x0: 0, t0: 0, moved: 0 };

function onPress(x){
  Snd.ensure();
  ptr.down = true; ptr.x0 = x; ptr.t0 = performance.now(); ptr.moved = 0;
}
function onMove(x, isHover){
  if (ptr.down) ptr.moved = Math.max(ptr.moved, Math.abs(x - ptr.x0));
  if (G.state !== 'play' && G.state !== 'settling') return;
  if (cameraOn()) return; // camera steers; touch only drops
  // mouse hover steers directly; a touch/press must actually DRAG before it
  // steers, so that a quick "drop" tap far from the plate doesn't lurch it
  if (isHover || (ptr.down && ptr.moved > 12)) G.plateTargetX = x;
}
function onRelease(){
  if (!ptr.down) return;
  ptr.down = false;
  if (ptr.moved < 14 && performance.now() - ptr.t0 < 400) dropTopping();
}

if (window.PointerEvent) {
  canvas.addEventListener('pointerdown', e => { onPress(canvasX(e)); canvas.setPointerCapture(e.pointerId); e.preventDefault(); });
  canvas.addEventListener('pointermove', e => onMove(canvasX(e), e.pointerType === 'mouse' && !ptr.down));
  canvas.addEventListener('pointerup', () => onRelease());
  canvas.addEventListener('pointercancel', () => { ptr.down = false; });
} else {
  // fallback for old browsers without pointer events
  canvas.addEventListener('touchstart', e => { onPress(canvasX(e.touches[0])); e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchmove', e => { onMove(canvasX(e.touches[0]), false); e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchend', e => { onRelease(); e.preventDefault(); }, { passive: false });
  canvas.addEventListener('mousedown', e => onPress(canvasX(e)));
  canvas.addEventListener('mousemove', e => onMove(canvasX(e), !ptr.down));
  canvas.addEventListener('mouseup', () => onRelease());
}
canvas.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener('keydown', e => {
  G.keys[e.key] = true;
  if ((e.key === ' ' || e.key === 'ArrowDown' || e.key === 'Enter') && G.state === 'play') {
    Snd.ensure(); dropTopping(); e.preventDefault();
  }
});
window.addEventListener('keyup', e => { G.keys[e.key] = false; });

// ---------- buttons ----------
$('btn-play').addEventListener('click', () => { Snd.ensure(); Snd.click(); buildLevelList(); showScreen('levels'); });
$('btn-back-title').addEventListener('click', () => { Snd.click(); showScreen('title'); });
$('btn-retry').addEventListener('click', () => { Snd.click(); destroyLevel(); startLevel(G.levelIndex); });
$('btn-next').addEventListener('click', () => { Snd.click(); destroyLevel(); startLevel(Math.min(LEVELS.length - 1, G.levelIndex + 1)); });
$('btn-map').addEventListener('click', () => { Snd.click(); destroyLevel(); Cam.stop(); buildLevelList(); showScreen('levels'); });
$('btn-quit').addEventListener('click', () => { Snd.click(); destroyLevel(); Cam.stop(); buildLevelList(); showScreen('levels'); });

function syncControls(){
  $('btn-controls').textContent = save.controls === 'camera' ? '🎥 Camera control' : '👆 Touch control';
  $('btn-cam').textContent = save.controls === 'camera' ? '🎥' : '👆';
  $('hint-controls').innerHTML = save.controls === 'camera'
    ? 'Wave your hand left and right to steer the plate!<br>Tap to make the cloud drop early.'
    : 'Drag to steer the plate and catch the falling toppings!<br>Tap to make the cloud drop early.';
}
function toggleControls(){
  Snd.ensure(); Snd.click();
  save.controls = save.controls === 'camera' ? 'touch' : 'camera';
  persist(); syncControls();
  if (save.controls === 'camera') {
    Cam.start().then(ok => {
      if (!ok) {
        save.controls = 'touch'; persist(); syncControls();
        if (G.engine) textPop(W / 2, 360, 'No camera found — touch control on!', '#ffffff', 2600, 17);
      } else if (G.engine) {
        textPop(W / 2, 360, 'Wave your hand ✋ to steer!', '#ffffff', 2200, 19);
      }
    });
  } else {
    Cam.stop();
  }
}
$('btn-controls').addEventListener('click', toggleControls);
$('btn-cam').addEventListener('click', toggleControls);
syncControls();

// ---- Easy mode (for the littlest): max grip, no hazards ----
const easyBtn = $('btn-easy');
function syncEasy(){
  easyBtn.textContent = `🧸 Easy mode: ${save.easy ? 'On' : 'Off'}`;
  easyBtn.classList.toggle('easy-on', save.easy);
}
easyBtn.addEventListener('click', () => {
  save.easy = !save.easy; persist(); syncEasy(); Snd.ensure(); Snd.click();
});
syncEasy();

const muteBtn = $('btn-mute');
function syncMute(){ muteBtn.textContent = save.muted ? '🔇' : '🔊'; }
muteBtn.addEventListener('click', () => { save.muted = !save.muted; persist(); syncMute(); Snd.ensure(); Snd.click(); });
syncMute();

// ============================================================
// Main loop (fixed timestep)
// ============================================================
let last = performance.now(), acc = 0;
function loop(now){
  requestAnimationFrame(loop);
  acc += Math.min(50, now - last);
  last = now;
  while (acc >= STEP) {
    if (G.engine && G.state !== 'end') stepGame();
    else { G.time += STEP; updateParticles(STEP); }
    acc -= STEP;
  }
  render();
}

showScreen('title');
requestAnimationFrame(loop);
