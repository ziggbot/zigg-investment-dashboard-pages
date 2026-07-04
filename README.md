# 🥞 Pancake Party! — The Great Food Stack

A silly physics stacking game for kids, playable in any browser (desktop + touch).

**Play it:** open `index.html`, or visit the GitHub Pages site for this repo.

## How to play

- A cloud dispenser swings across the top of the screen carrying the next topping.
- **Tap / click / press space** to drop the topping.
- **Drag (or move the mouse / use ← →)** to steer the dish at the bottom — you *catch* the falling toppings and keep the wobbly tower balanced. Real physics, real wobble!
- Anything that falls gets gobbled by **Munchy**, the hungry monster (and costs a heart).
- Stack the target number of toppings and hold the tower steady to finish the dish.

## Levels

| Dish | Goal | Twist |
| --- | --- | --- |
| 🥞 Pancake Peak | 6 toppings | Learn the ropes: butter, cream, berries… |
| 🍕 Pizza Tower | 8 toppings | Faster dispenser, rolling pepperoni |
| 🍔 Burger Mountain | 9 toppings | Bouncy pickles and onion rings! |
| 🌮 Taco Volcano | 10 toppings | Wind gusts + a tricky V-shaped shell |
| 🍨 Sundae Sky | 12 toppings | Slippery scoops, top speed |

## Gamification

- **Hearts = stars**: finish with all 3 hearts for a 3-star dish. Stars unlock the next level.
- **Perfect drops**: land dead-centre for combos ("YUM! ×3") — bonus points, sparkles, and the piece grips a little better.
- **Wobble rescue**: when the tower leans critically, time slows down for a heroic save.
- **Toppling is comedy, not failure**: Munchy happily devours whatever falls — "BURP! Build me another one!"
- Progress (stars, best scores, mute) is saved in `localStorage`.

## Tech

- Plain HTML/CSS/JavaScript — no build step, no external requests.
- [Matter.js](https://brm.io/matter-js/) (vendored in `js/matter.min.js`) for real 2D rigid-body physics.
- Canvas 2D renderer with a glossy, puffy hand-drawn style; WebAudio synth for all sounds (no audio assets).
