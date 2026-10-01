# Lab Fighter

Version: 0.3 — 2026-10-01

An open-source, physics-aware laboratory-themed fighting game. A lab-coated
scientist fights in classic arcade fighting-game style. See `Spec` for the
full design document.

**Tech stack**: TypeScript, Three.js (rendering), Rapier (physics, planned),
Vite (build/dev), Vitest (tests). Runs as a static site — no server, no
native engine export step. Previously prototyped in Godot 4.x/GDScript;
that approach was abandoned in favor of this stack for simpler, verifiable
deployment (plain static build vs. a game-engine web export pipeline).

## Status

**Prototype 1** (in progress): one scientist, one 2D laboratory stage, local
two-player combat.

Implemented:
- Core `Character` class — engine-agnostic movement/jump/crouch/block/attack
  state machine, hitstun, knockdown (`src/core/character/`)
- Data-driven attack system (`AttackData` — light jab, heavy swing) (`src/core/combat/`)
- Pure-function hit detection (AABB overlap), independent of rendering
- Health, round timer, best-of-3 round/match flow (`src/gameplay/match/`)
- Side-view orthographic fighting camera (`src/core/camera/`)
- Placeholder lab stage geometry — floor, back wall, two lab benches (`src/stages/`)
- Placeholder procedural character animation (idle/walk/attack/hit/knockdown)
  on a capsule mesh — no external art yet (`src/core/animation/`)
- HUD: health bars, timer, round/match messages (`src/ui/`)
- Unit tests for hit detection, attack timing, character state transitions,
  and match flow (`src/__tests__/`) — run independently of the renderer

Not yet implemented (see `Spec` for full roadmap): AI, combos, special
attacks, 3D stage mode, real character/environment art and animation, audio,
input remapping UI, save system, Rapier-driven physics interactions
(currently movement/knockback use simple kinematic integration, not rigid
body physics).

## Requirements

- Node.js 20+

## Running

```bash
npm install
npm run dev       # local dev server
npm test          # unit tests
npm run build     # production build to dist/
```

Controls (placeholder, remappable later):
- Player 1: A/D move, W jump, S crouch, F light attack, G heavy attack, H block
- Player 2: Arrow keys move/jump/crouch, Numpad 1 light attack, Numpad 2 heavy attack, Numpad 3 block

## Project structure

See `Spec` for the full architecture rationale. High level:

```
src/
├── core/         # character, combat, physics, animation, input, camera
├── characters/   # per-character definitions (scientist)
├── stages/       # laboratory2d, laboratory3d (future)
├── gameplay/     # match, rounds, scoring, training
├── ai/           # (future)
├── ui/           # HUD
└── __tests__/    # unit tests, run independently of rendering
```

## Deployment

`.github/workflows/deploy.yml` runs tests and the production build on every
push to `main`, and deploys `dist/` to GitHub Pages via GitHub Actions.

## License

MIT (see `LICENSE`). Third-party library and asset attributions are tracked
in `ATTRIBUTIONS.md`.
