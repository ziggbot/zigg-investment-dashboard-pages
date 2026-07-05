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
  butter:     { label:'Butter',      w:54, h:24, corner:8,  base:'#ffe27a', dark:'#f0b32c', deco:'gloss',  density:.0012, friction:1.0 },
  cream:      { label:'Whipped cream',w:66, h:32, corner:14, base:'#ffffff', dark:'#e8e0f5', deco:'swirl', decoColor:'#d8cbee', density:.0008, friction:1.1, face:true },
  strawberry: { label:'Strawberry',  w:44, h:34, corner:12, round:true, base:'#ff6b81', dark:'#d63d55', deco:'seeds', decoColor:'#ffd9e0', stem:true, density:.0012, friction:.95, face:true },
  jam:        { label:'Jam blob',    w:62, h:22, corner:10, base:'#c05be0', dark:'#8e35b5', deco:'swirl', decoColor:'#e3a9f5', density:.0011, friction:1.15 },
  scoop:      { label:'Ice cream',   w:54, h:42, corner:15, round:true, base:'#ffc2dc', dark:'#f08bbb', deco:'swirl', decoColor:'#ffffff', density:.001, friction:.9, face:true },
  banana:     { label:'Banana slice',w:58, h:18, corner:8,  base:'#fff3b8', dark:'#f2d873', deco:'ring',  decoColor:'#e8c95a', density:.001, friction:1.0 },
  // --- pizza ---
  cheese:     { label:'Cheese',      w:90, h:18, corner:8,  base:'#ffdf5e', dark:'#f5b93a', deco:'holes', decoColor:'#e0a01f', density:.0011, friction:1.1 },
  ham:        { label:'Ham',         w:78, h:14, corner:6,  base:'#ffb3c1', dark:'#f57f97', deco:'gloss', density:.0012, friction:1.0 },
  pepperoni:  { label:'Pepperoni',   w:48, h:38, corner:13, round:true, base:'#e8564a', dark:'#b52e2e', deco:'dots', decoColor:'#8e1f1f', density:.0014, friction:.95, face:true },
  mushroom:   { label:'Mushroom',    w:52, h:30, corner:12, base:'#f2e3cf', dark:'#cdb193', deco:'cap',  decoColor:'#b58c62', density:.0009, friction:1.0 },
  olive:      { label:'Olive',       w:32, h:24, corner:9, round:true, base:'#6f7d3a', dark:'#454f1f', deco:'ring', decoColor:'#2f3714', density:.0012, friction:.9 },
  pepper:     { label:'Green pepper',w:70, h:16, corner:7,  base:'#8fdc5e', dark:'#55a832', deco:'gloss', density:.001, friction:1.0 },
  // --- burger ---
  patty:      { label:'Patty',       w:86, h:22, corner:10, base:'#9c6238', dark:'#6b3d1e', deco:'dots', decoColor:'#5a3015', density:.002,  friction:1.15 },
  chzslice:   { label:'Cheese slice',w:90, h:12, corner:5,  base:'#ffca3a', dark:'#f5a623', deco:'gloss', density:.001, friction:1.1 },
  lettuce:    { label:'Lettuce',     w:92, h:16, corner:7,  base:'#a5e86b', dark:'#5fbf3a', deco:'wavy', decoColor:'#7ed254', density:.0007, friction:1.05 },
  tomato:     { label:'Tomato',      w:80, h:14, corner:6,  base:'#ff6b5e', dark:'#d63c2e', deco:'gloss', density:.0011, friction:1.0 },
  pickle:     { label:'Bouncy pickle',w:36, h:26, corner:10, round:true, base:'#7dbf4e', dark:'#4e8c2a', deco:'dots', decoColor:'#3e6e21', density:.001, friction:.9, restitution:.45, face:true },
  bacon:      { label:'Bacon',       w:84, h:12, corner:5,  base:'#c96a4a', dark:'#96402a', deco:'stripes', decoColor:'#f0b394', density:.0012, friction:1.0 },
  onion:      { label:'Onion ring',  w:42, h:30, corner:11, round:true, base:'#f7ecff', dark:'#d9c4ea', deco:'ring', decoColor:'#c0a5d8', density:.0008, friction:.9, restitution:.3 },
  // --- taco ---
  meat:       { label:'Taco meat',   w:74, h:24, corner:10, base:'#a1663b', dark:'#71401f', deco:'dots', decoColor:'#5c3013', density:.0018, friction:1.15 },
  shreds:     { label:'Cheese shreds',w:66, h:18, corner:8, base:'#ffb84d', dark:'#f08a1d', deco:'stripes', decoColor:'#ffdf9e', density:.0009, friction:1.05 },
  chili:      { label:'Chili pepper',w:56, h:20, corner:9,  base:'#ff4d3a', dark:'#c22415', deco:'gloss', stem:true, density:.001, friction:.95, face:true },
  tomcube:    { label:'Tomato cubes',w:44, h:20, corner:7,  base:'#ff7a63', dark:'#d84a33', deco:'dots', decoColor:'#ffb4a3', density:.0011, friction:1.0 },
  guac:       { label:'Guacamole',   w:66, h:24, corner:11, base:'#a8d95a', dark:'#6fa832', deco:'swirl', decoColor:'#d2f0a0', density:.001, friction:1.2 },
  sourcream:  { label:'Sour cream',  w:58, h:20, corner:9,  base:'#ffffff', dark:'#e6e2d8', deco:'swirl', decoColor:'#d8d2c4', density:.0008, friction:1.15 },
  // --- sundae ---
  scoopP:     { label:'Berry scoop', w:56, h:42, corner:15, round:true, base:'#ffc2dc', dark:'#ef86b8', deco:'swirl', decoColor:'#ffffff', density:.001, friction:.85, face:true },
  scoopC:     { label:'Choco scoop', w:56, h:42, corner:15, round:true, base:'#a5714b', dark:'#77492b', deco:'swirl', decoColor:'#c99a72', density:.001, friction:.85, face:true },
  scoopM:     { label:'Minty scoop', w:56, h:42, corner:15, round:true, base:'#a7ecc9', dark:'#68c996', deco:'dots', decoColor:'#4da377', density:.001, friction:.85, face:true },
  whip:       { label:'Whippy swirl',w:60, h:30, corner:13, base:'#ffffff', dark:'#e9e2f7', deco:'swirl', decoColor:'#d5c8ec', density:.0008, friction:.95 },
  cherry:     { label:'Cherry',      w:30, h:24, corner:9, round:true, base:'#ff4d6d', dark:'#c21f3f', deco:'gloss', stem:true, density:.0011, friction:.85, face:true },
  wafer:      { label:'Wafer',       w:78, h:12, corner:5,  base:'#f2c98a', dark:'#d8a45c', deco:'stripes', decoColor:'#c2894a', density:.0009, friction:1.0 },
};

// ============================================================
// Levels
// ============================================================
const LEVELS = [
  { id:'pancakes', name:'Pancake Peak', emoji:'🥞', dish:'pancake',
    sky:['#8ec9ff','#ffd9a8'], hill:'#ffb26b', hill2:'#ff8f5e',
    target:6,  sweep:1.0,
    pool:['butter','cream','strawberry','jam','scoop','banana'],
    intro:'Stack 6 yummy toppings on the pancakes!' },
  { id:'pizza', name:'Pizza Tower', emoji:'🍕', dish:'pizza',
    sky:['#ffbe76','#ff7979'], hill:'#e05656', hill2:'#c23e3e',
    target:8,  sweep:1.12,
    pool:['cheese','ham','pepperoni','mushroom','olive','pepper'],
    intro:'Mamma mia! Stack 8 pizza toppings!' },
  { id:'burger', name:'Burger Mountain', emoji:'🍔', dish:'burger',
    sky:['#7ed6df','#f6e58d'], hill:'#6ab04c', hill2:'#4f8c38',
    target:9,  sweep:1.25,
    pool:['patty','chzslice','lettuce','tomato','pickle','bacon','onion'],
    intro:'Watch out — pickles are bouncy! Stack 9!' },
  { id:'taco', name:'Taco Volcano', emoji:'🌮', dish:'taco',
    sky:['#f8c291','#e55039'], hill:'#b3552d', hill2:'#8e3e1f',
    target:10, sweep:1.35, wind:true,
    pool:['meat','shreds','chili','tomcube','guac','sourcream'],
    intro:'A windy one! Stack 10 in the crunchy shell!' },
  { id:'sundae', name:'Sundae Sky', emoji:'🍨', dish:'sundae',
    sky:['#c8a2ff','#ffc2dc'], hill:'#9b6bd6', hill2:'#7d4fbd',
    target:12, sweep:1.5, slippery:true,
    pool:['scoopP','scoopC','scoopM','whip','cherry','wafer'],
    intro:'Slippery scoops! Stack 12 to the sky!' },
];

// ============================================================
// Save data
// ============================================================
const SAVE_KEY = 'pancakePartySave1';
let save = { stars:{}, best:{}, muted:false };
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
  hearts: 3, landed: 0, score: 0, combo: 1,
  disp: { t: 0, x: W / 2 },
  wind: { on: false, t: 0 },
  particles: [],
  munchy: { mouth: 0, blink: 0, drool: 0, happy: 0 },
  slowmo: 0, slowmoCd: 0,
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
  $('hud-hearts').textContent = '❤️'.repeat(G.hearts) + '🖤'.repeat(3 - G.hearts);
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
  const opts = { friction: 1.2, frictionStatic: 2, restitution: 0, density: .05 };
  const parts = [Bodies.rectangle(cx, PLATE_Y, 152, 16, { ...opts, chamfer: { radius: 7 } })];
  switch (lv.dish) {
    case 'pancake': parts.push(Bodies.rectangle(cx, PLATE_Y - 24, 128, 32, { ...opts, chamfer: { radius: 7 } })); break;
    case 'pizza':   parts.push(Bodies.rectangle(cx, PLATE_Y - 18, 148, 20, { ...opts, chamfer: { radius: 9 } })); break;
    case 'burger':  parts.push(Bodies.rectangle(cx, PLATE_Y - 23, 126, 30, { ...opts, chamfer: { radius: 13 } })); break;
    case 'taco':
      parts.push(Bodies.rectangle(cx - 34, PLATE_Y - 32, 86, 13, { ...opts, angle:  0.82, chamfer: { radius: 5 } }));
      parts.push(Bodies.rectangle(cx + 34, PLATE_Y - 32, 86, 13, { ...opts, angle: -0.82, chamfer: { radius: 5 } }));
      break;
    case 'sundae':
      parts.push(Bodies.rectangle(cx, PLATE_Y - 16, 98, 14, { ...opts, chamfer: { radius: 6 } }));
      parts.push(Bodies.rectangle(cx - 52, PLATE_Y - 38, 13, 56, { ...opts, angle:  0.22, chamfer: { radius: 5 } }));
      parts.push(Bodies.rectangle(cx + 52, PLATE_Y - 38, 13, 56, { ...opts, angle: -0.22, chamfer: { radius: 5 } }));
      break;
  }
  const plate = Body.create({ parts, inertia: Infinity, friction: 1.2, frictionStatic: 2 });
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
      if (floorHit && floorHit.plugin && floorHit.plugin.def) { munch(floorHit); continue; }
      for (const bod of [a, b]) {
        if (!bod.plugin || !bod.plugin.def) continue;
        // squishy catch: soft food absorbs most of the impact on first touch
        if (bod === G.falling && !bod.plugin.touched)
          Body.setVelocity(bod, { x: bod.velocity.x * .45, y: bod.velocity.y * .45 });
        bod.plugin.touched = true;
      }
    }
  });

  G.toppings = []; G.landedStack = []; G.falling = null;
  G.queue = []; refillQueue(lv);
  G.preview = null;
  G.hearts = 3; G.landed = 0; G.score = 0; G.combo = 1;
  G.disp.t = Math.random() * 6; G.wind = { on: false, t: 0 };
  G.particles = [];
  G.munchy = { mouth: 0, blink: 0, drool: 0, happy: 0 };
  G.slowmo = 0; G.slowmoCd = 0; G.shake = 0;
  G.spawnDelay = 400;
  G.state = 'play'; G.stateT = 0;

  showScreen(null);
  updateHUD();
  textPop(W / 2, 300, lv.intro, '#ffffff', 2600, 19);
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
  if (!G.queue.length) refillQueue(lv);
  G.preview = T[G.queue.shift()];
}

function dropTopping(){
  if (G.state !== 'play' || !G.preview || G.falling) return;
  const def = G.preview;
  const lv = LEVELS[G.levelIndex];
  const body = Bodies.rectangle(G.disp.x, DISPENSER_Y + 34, def.w, def.h, {
    chamfer: { radius: Math.min(def.corner, Math.min(def.w, def.h) / 2 - 1) },
    density: def.density || .0011,
    friction: (def.friction || 1) * (lv.slippery ? .55 : 1),
    frictionStatic: 2.5,
    frictionAir: .03,
    restitution: def.restitution || .04,
  });
  body.plugin = { def, state: 'falling', touched: false, settle: 0, seed: Math.floor(Math.random() * 99999) + 1 };
  // soft food resists spinning — fewer pieces tumbling onto their edge
  Body.setInertia(body, body.inertia * 2.4);
  Body.setAngularVelocity(body, (Math.random() - .5) * .03);
  Composite.add(G.engine.world, body);
  G.toppings.push(body);
  G.falling = body;
  G.preview = null;
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

  const perfect = dx < 15;
  if (perfect) {
    G.combo++;
    // perfect drops "set" a little: calm the piece and grip harder
    Body.setAngularVelocity(b, 0);
    b.friction = Math.min(1.5, b.friction + .25);
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
  G.munchy.drool = 1;
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

  if (b.plugin.state === 'landed') {
    G.landedStack = G.landedStack.filter(t => t !== b);
    G.landed = Math.max(0, G.landed - 1);
  }
  if (G.falling === b) G.falling = null;

  crumbs(b.position.x, Math.min(b.position.y, H - 30), b.plugin.def.dark, 10);
  textPop(Math.max(60, Math.min(W - 60, b.position.x)), H - 120, 'NOM!', '#ff8fb0', 900, 22);
  G.munchy.mouth = 1; G.munchy.happy = 1;
  Snd.nom();

  if (G.state === 'play' || G.state === 'settling') {
    G.hearts--;
    G.combo = 1;
    G.shake = 320;
    Snd.miss();
    updateHUD();
    if (G.hearts <= 0) { beginFail(); return; }
    if (G.state === 'settling') { G.state = 'play'; G.stateT = 0; }
    if (!G.falling && !G.preview) G.spawnDelay = 500;
  }
}

// ============================================================
// Win / fail
// ============================================================
function beginWin(){
  G.state = 'win'; G.stateT = 0;
  G.munchy.happy = 1;
  for (let i = 0; i < 90; i++) confettiP();
  Snd.win();

  const lv = LEVELS[G.levelIndex];
  const stars = Math.max(1, G.hearts);
  save.stars[lv.id] = Math.max(save.stars[lv.id] || 0, stars);
  save.best[lv.id] = Math.max(save.best[lv.id] || 0, G.score);
  persist();
}

function beginFail(){
  G.state = 'fail'; G.stateT = 0;
  G.munchy.mouth = 1; G.munchy.happy = 1;
  Snd.fail();
}

function showEnd(won){
  G.state = 'end';
  const lv = LEVELS[G.levelIndex];
  const stars = won ? Math.max(1, G.hearts) : 0;
  $('end-emoji').textContent = won ? lv.emoji : '😋';
  $('end-title').textContent = won ? 'Dish complete!' : 'Munchy ate your tower!';
  $('end-stars').innerHTML = starStr(stars);
  $('end-score').textContent = `Score: ${G.score}` + (save.best[lv.id] ? `  ·  Best: ${save.best[lv.id]}` : '');
  $('end-msg').textContent = won
    ? (stars === 3 ? 'WOW! A perfect dish — three stars!' : 'Yummy! Fewer drops for more stars!')
    : '"BURP! Delicious! Build me another one!" — Munchy';
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
  if (G.state === 'play' || G.state === 'settling') {
    if (G.keys.ArrowLeft || G.keys.a) G.plateTargetX -= .5 * dt;
    if (G.keys.ArrowRight || G.keys.d) G.plateTargetX += .5 * dt;
  }
  G.plateTargetX = Math.max(88, Math.min(W - 88, G.plateTargetX));
  const vx = Math.max(-10, Math.min(10, (G.plateTargetX - G.plate.position.x) * .16));
  Body.setVelocity(G.plate, { x: vx, y: 0 });
  Body.setPosition(G.plate, { x: G.plate.position.x, y: G.plateY });
  Body.setAngle(G.plate, 0);
  Body.setAngularVelocity(G.plate, 0);

  // --- dispenser sweep ---
  if (G.state === 'play') {
    G.disp.t += dt * .0011 * lv.sweep;
    G.disp.x = W / 2 + Math.sin(G.disp.t) * (W / 2 - 78);
    if (G.spawnDelay > 0) {
      G.spawnDelay -= dt;
      if (G.spawnDelay <= 0 && !G.preview && !G.falling) nextPreview();
    }
  }

  // --- wind gimmick ---
  if (G.wind.on && (G.state === 'play' || G.state === 'settling')) {
    G.wind.t += dt;
    const fx = Math.sin(G.wind.t * .0011) * .00025;
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

  // --- landing check ---
  const f = G.falling;
  if (f && f.plugin.touched) {
    const sp = Math.hypot(f.velocity.x, f.velocity.y);
    f.plugin.settle = sp < 1.6 ? f.plugin.settle + 1 : 0;
    if (f.plugin.settle >= 16) confirmLand(f);
  }

  // --- wobble rescue slow-mo ---
  if ((G.state === 'play' || G.state === 'settling') && G.landedStack.length >= 2 && G.slowmoCd <= 0) {
    const top = G.landedStack[G.landedStack.length - 1];
    const risk = Math.abs(top.position.x - G.plate.position.x) / 85;
    if (risk > .8) {
      G.slowmo = 900; G.slowmoCd = 6000;
      textPop(W / 2, 250, '😱 WOBBLE! Save it!', '#ffffff', 1400, 22);
      Snd.wobble();
    }
  }

  // --- safety net: remove anything far off screen ---
  for (const b of G.toppings.slice()) {
    if (b.position.y > H + 130 || Math.abs(b.position.x - W / 2) > W * 1.5) munch(b);
  }

  // --- settling -> win ---
  if (G.state === 'settling' && G.stateT > 1600) beginWin();

  // --- end transitions ---
  if (G.state === 'win' && G.stateT > 1900) showEnd(true);
  if (G.state === 'fail') {
    // munchy gobbles the tower piece by piece
    if (G.stateT > 250 && G.toppings.length && Math.floor(G.stateT / 180) !== Math.floor((G.stateT - dt) / 180)) {
      const b = G.toppings[G.toppings.length - 1];
      crumbs(b.position.x, b.position.y, b.plugin.def.dark, 8);
      Composite.remove(G.engine.world, b);
      G.toppings.pop();
      Snd.nom();
    }
    if (G.stateT > 1900) showEnd(false);
  }

  // --- munchy timers ---
  const m = G.munchy;
  m.mouth = Math.max(0, m.mouth - dt / 500);
  m.happy = Math.max(0, m.happy - dt / 1400);
  m.drool = Math.max(0, m.drool - dt / 2200);
  m.blink -= dt;
  if (m.blink < -150) m.blink = 2200 + Math.random() * 2400;

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

function drawFace(w, h, mood){
  // tiny sleepy face on the front of a topping
  const ey = -h * .06;
  ctx.fillStyle = '#3a2436';
  ctx.beginPath(); ctx.arc(-w * .16, ey, 2.6, 0, Math.PI * 2); ctx.arc(w * .16, ey, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a2436'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'worried') ctx.arc(0, h * .22, 4, Math.PI * 1.1, Math.PI * 1.9);
  else ctx.arc(0, h * .1, 5, .3, Math.PI - .3);
  ctx.stroke();
}

function drawTopping(b){
  const def = b.plugin.def;
  const w = def.w, h = def.h;
  ctx.save();
  ctx.translate(b.position.x, b.position.y);
  ctx.rotate(b.angle);

  // soft drop shadow under piece
  ctx.fillStyle = 'rgba(60,20,60,.18)';
  ctx.beginPath();
  ctx.ellipse(0, h / 2 + 3, w * .42, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  puffy(-w / 2, -h / 2, w, h, def.corner, def.base, def.dark, def.round);

  const pts = seededPts(b.plugin.seed, 6);
  ctx.lineCap = 'round';
  switch (def.deco) {
    case 'dots':
      ctx.fillStyle = def.decoColor;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(pts[i][0] * w * .3, pts[i][1] * h * .26, 2.4 + pts[i][2] * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'seeds':
      ctx.strokeStyle = def.decoColor; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const px = pts[i][0] * w * .3, py = pts[i][1] * h * .28;
        ctx.beginPath(); ctx.moveTo(px, py - 2); ctx.lineTo(px, py + 2); ctx.stroke();
      }
      break;
    case 'swirl':
      ctx.strokeStyle = def.decoColor; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(-w * .12, 0, h * .22, .4, Math.PI * 1.4); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * .2, h * .06, h * .15, Math.PI * .8, Math.PI * 1.9); ctx.stroke();
      break;
    case 'stripes':
      ctx.strokeStyle = def.decoColor; ctx.lineWidth = 3;
      for (const off of [-.22, 0, .22]) {
        ctx.beginPath();
        ctx.moveTo(-w * .38, off * h * 2);
        ctx.quadraticCurveTo(0, off * h * 2 + 3, w * .38, off * h * 2);
        ctx.stroke();
      }
      break;
    case 'holes':
      ctx.fillStyle = def.decoColor;
      for (const [hx, hy, hr] of [[-.26, -.1, 4], [.1, .15, 3], [.3, -.15, 3.5]]) {
        ctx.beginPath(); ctx.arc(hx * w, hy * h, hr, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'ring':
      ctx.strokeStyle = def.decoColor; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(0, 0, w * .22, h * .22, 0, 0, Math.PI * 2); ctx.stroke();
      break;
    case 'cap':
      ctx.fillStyle = def.decoColor;
      rr(-w * .18, -h * .1, w * .36, h * .55, 5); ctx.fill();
      break;
  }
  if (def.stem) {
    ctx.strokeStyle = '#4e8c2a'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(0, -h / 2 + 2); ctx.quadraticCurveTo(4, -h / 2 - 7, 9, -h / 2 - 9); ctx.stroke();
    ctx.fillStyle = '#6fbf3e';
    ctx.beginPath(); ctx.ellipse(10, -h / 2 - 9, 5, 3, .5, 0, Math.PI * 2); ctx.fill();
  }
  if (def.face) drawFace(w, h, b.plugin.state === 'falling' ? 'worried' : 'happy');
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
  ctx.beginPath(); ctx.ellipse(0, 30, 95, 10, 0, 0, Math.PI * 2); ctx.fill();

  // tray
  puffy(-78, -9, 156, 18, 9, '#ffffff', '#cfc0e8');

  // dish base
  switch (lv.dish) {
    case 'pancake':
      for (let i = 0; i < 3; i++) puffy(-64 + i * 2, -14 - (i + 1) * 12, 128 - i * 4, 15, 8, '#f5c069', '#c98b3d');
      puffy(-18, -52, 36, 12, 5, '#ffe27a', '#f0b32c'); // butter on top
      break;
    case 'pizza':
      puffy(-74, -28, 148, 12, 6, '#e8b25e', '#b57f33');           // crust
      puffy(-66, -26, 132, 8, 4, '#ff6b52', '#d84a33');            // sauce
      break;
    case 'burger':
      puffy(-63, -40, 126, 32, 16, '#f2b45e', '#c9832f');          // bun
      ctx.fillStyle = '#fff3d8';
      for (const [sx, sy] of [[-30, -30], [0, -34], [28, -29], [-14, -24], [16, -23]]) {
        ctx.beginPath(); ctx.ellipse(sx, sy, 2.6, 1.8, .4, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'taco':
      ctx.save(); ctx.rotate(0);
      ctx.save(); ctx.translate(-34, -32); ctx.rotate(0.82); puffy(-43, -6.5, 86, 13, 5, '#f5cb72', '#c99b42'); ctx.restore();
      ctx.save(); ctx.translate(34, -32); ctx.rotate(-0.82); puffy(-43, -6.5, 86, 13, 5, '#f5cb72', '#c99b42'); ctx.restore();
      ctx.restore();
      break;
    case 'sundae':
      puffy(-49, -23, 98, 14, 6, '#dff3ff', '#a8c9e8');
      ctx.save(); ctx.translate(-52, -38); ctx.rotate(0.22); puffy(-6.5, -28, 13, 56, 5, '#eaf7ff', '#a8c9e8'); ctx.restore();
      ctx.save(); ctx.translate(52, -38); ctx.rotate(-0.22); puffy(-6.5, -28, 13, 56, 5, '#eaf7ff', '#a8c9e8'); ctx.restore();
      break;
  }

  // little face on the tray, mood follows tower lean
  let mood = 'happy';
  if (G.landedStack.length >= 2) {
    const top = G.landedStack[G.landedStack.length - 1];
    const risk = Math.abs(top.position.x - p.x) / 85;
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

// ---------- Munchy the monster ----------
function drawMunchy(){
  const m = G.munchy;
  const t = G.time;
  const x = 58, y = H - 62 + Math.sin(t * .003) * 3;
  const excited = m.drool > 0 || G.state === 'settling';
  const mouthOpen = m.mouth > 0 || G.state === 'fail';

  ctx.save();
  ctx.translate(x, y);

  // body blob
  const g = ctx.createLinearGradient(0, -55, 0, 45);
  g.addColorStop(0, '#b48ef5');
  g.addColorStop(1, '#7d54c9');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, 48, 52 + (excited ? Math.sin(t * .02) * 2 : 0), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5d3ba3'; ctx.lineWidth = 2.5; ctx.stroke();

  // belly
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath(); ctx.ellipse(0, 18, 26, 22, 0, 0, Math.PI * 2); ctx.fill();

  // horns
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(s * 20, -46); ctx.quadraticCurveTo(s * 30, -66, s * 14, -58);
    ctx.closePath(); ctx.fill();
  }

  // eyes track the falling topping / dispenser
  const target = G.falling ? G.falling.position : { x: G.disp.x, y: DISPENSER_Y };
  const ang = Math.atan2(target.y - (y - 18), target.x - x);
  const blink = m.blink < 0;
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(s * 16, -18, 10, blink ? 1.6 : 11, 0, 0, Math.PI * 2); ctx.fill();
    if (!blink) {
      ctx.fillStyle = '#33204d';
      ctx.beginPath();
      ctx.arc(s * 16 + Math.cos(ang) * 4, -18 + Math.sin(ang) * 4, 4.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // mouth
  ctx.fillStyle = '#4d2160';
  ctx.beginPath();
  if (mouthOpen) {
    ctx.ellipse(0, 8, 16, 13 + m.mouth * 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff7da0'; // tongue
    ctx.beginPath(); ctx.ellipse(0, 15, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (excited || m.happy > 0) {
    ctx.arc(0, 4, 12, .15, Math.PI - .15); ctx.fill();
  } else {
    ctx.strokeStyle = '#4d2160'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 6, 9, .3, Math.PI - .3); ctx.stroke();
  }

  // drool when excited
  if (excited) {
    ctx.fillStyle = 'rgba(160,220,255,.85)';
    ctx.beginPath();
    ctx.ellipse(13, 20 + Math.sin(t * .008) * 3, 3.4, 6 + Math.sin(t * .008) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
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
    const sway = Math.sin(G.time * .004) * .06;
    ctx.save();
    ctx.translate(x, y + 26);
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(Math.sin(sway) * 30, 26); ctx.stroke();
    ctx.translate(Math.sin(sway) * 30, 26 + def.h / 2);
    ctx.rotate(sway);
    puffy(-def.w / 2, -def.h / 2, def.w, def.h, def.corner, def.base, def.dark, def.round);
    ctx.restore();
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

  // hills
  ctx.fillStyle = lv.hill2;
  ctx.beginPath();
  ctx.moveTo(0, H); ctx.lineTo(0, H - 120);
  ctx.quadraticCurveTo(W * .3, H - 210, W * .6, H - 130);
  ctx.quadraticCurveTo(W * .82, H - 80, W, H - 125);
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lv.hill;
  ctx.beginPath();
  ctx.moveTo(0, H); ctx.lineTo(0, H - 70);
  ctx.quadraticCurveTo(W * .25, H - 140, W * .55, H - 75);
  ctx.quadraticCurveTo(W * .8, H - 30, W, H - 70);
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

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
    drawMunchy();
    drawPlate();
    for (const b of G.toppings) drawTopping(b);
    drawDispenser();
  } else {
    drawMunchy();
  }
  drawParticles();

  // slow-mo vignette
  if (G.slowmo > 0) {
    ctx.fillStyle = 'rgba(120,80,255,.1)';
    ctx.fillRect(0, 0, W, H);
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
$('btn-map').addEventListener('click', () => { Snd.click(); destroyLevel(); buildLevelList(); showScreen('levels'); });
$('btn-quit').addEventListener('click', () => { Snd.click(); destroyLevel(); buildLevelList(); showScreen('levels'); });

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
