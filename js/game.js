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
};

// ============================================================
// Levels
// ============================================================
const LEVELS = [
  { id:'pancakes', name:'Pancake Peak', emoji:'🥞', dish:'pancake',
    sky:['#8ec9ff','#ffd9a8'], hill:'#ffb26b', hill2:'#ff8f5e',
    target:6,  sweep:1.0, dropEvery:3600,
    pool:['butter','cream','strawberry','jam','scoop','banana'],
    intro:'Stack 6 yummy toppings on the pancakes!' },
  { id:'pizza', name:'Pizza Tower', emoji:'🍕', dish:'pizza',
    sky:['#ffbe76','#ff7979'], hill:'#e05656', hill2:'#c23e3e',
    target:8,  sweep:1.12, dropEvery:3100,
    pool:['cheese','ham','pepperoni','mushroom','olive','pepper'],
    intro:'Mamma mia! Stack 8 pizza toppings!' },
  { id:'burger', name:'Burger Mountain', emoji:'🍔', dish:'burger',
    sky:['#7ed6df','#f6e58d'], hill:'#6ab04c', hill2:'#4f8c38',
    target:9,  sweep:1.25, dropEvery:2800,
    pool:['patty','chzslice','lettuce','tomato','pickle','bacon','onion'],
    intro:'Watch out — pickles are bouncy! Stack 9!' },
  { id:'taco', name:'Taco Volcano', emoji:'🌮', dish:'taco',
    sky:['#f8c291','#e55039'], hill:'#b3552d', hill2:'#8e3e1f',
    target:10, sweep:1.35, dropEvery:2500, wind:true,
    pool:['meat','shreds','chili','tomcube','guac','sourcream'],
    intro:'A windy one! Stack 10 in the crunchy shell!' },
  { id:'sundae', name:'Sundae Sky', emoji:'🍨', dish:'sundae',
    sky:['#c8a2ff','#ffc2dc'], hill:'#9b6bd6', hill2:'#7d4fbd',
    target:12, sweep:1.5, dropEvery:2200, slippery:true,
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
  autoT: 0,            // ms until the dispenser auto-drops
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
  G.autoT = lv.dropEvery;   // countdown until the cloud lets go by itself
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
    // the cloud drops the topping by itself when the countdown runs out
    if (G.preview && !G.falling) {
      G.autoT -= dt;
      if (G.autoT <= 0) dropTopping();
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
    ctx.restore();

    // countdown bar above the cloud — the topping drops when it empties
    const bw = 56, bx = x - bw / 2, by = y - 38;
    ctx.fillStyle = 'rgba(90,60,120,.3)';
    rr(bx, by, bw, 9, 4.5); ctx.fill();
    ctx.fillStyle = urgent ? '#ff6e6e' : '#ffffff';
    rr(bx, by, Math.max(9, bw * frac), 9, 4.5); ctx.fill();

    // topping name under the preview
    ctx.font = '800 14px "Baloo 2","Comic Sans MS",ui-rounded,sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(90,30,90,.55)';
    const ly = y + 62 + def.h;
    ctx.strokeText(def.label, x, ly);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(def.label, x, ly);
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
