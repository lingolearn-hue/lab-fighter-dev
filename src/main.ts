import * as THREE from "three";
import "./style.css";

import { createScientist } from "./characters/scientist/Scientist";
import { CharacterView } from "./core/animation/CharacterView";
import { FightingCamera } from "./core/camera/FightingCamera";
import { KeyboardSource, PLAYER1_KEYS, PLAYER2_KEYS } from "./core/input/KeyboardSource";
import { buildLabStage2D } from "./stages/laboratory2d/LabStage2D";
import { MatchManager } from "./gameplay/match/MatchManager";
import { Hud } from "./ui/Hud";

const gameRoot = document.getElementById("game-root")!;
const hudRoot = document.getElementById("hud-root")!;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
gameRoot.insertBefore(renderer.domElement, hudRoot);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1c24);

const fightingCamera = new FightingCamera(window.innerWidth / window.innerHeight);
const spawns = buildLabStage2D(scene);

const viewA = new CharacterView(0x6fd3ff);
const viewB = new CharacterView(0xff8a65);
scene.add(viewA.group);
scene.add(viewB.group);

const hud = new Hud(hudRoot);

const playerA = createScientist("Player 1", {
  onHealthChanged: (cur, max) => hud.setHealth("a", cur, max),
  onAnimation: (name, loop) => viewA.playAnimation(name, loop),
});
const playerB = createScientist("Player 2", {
  onHealthChanged: (cur, max) => hud.setHealth("b", cur, max),
  onAnimation: (name, loop) => viewB.playAnimation(name, loop),
});

const match = new MatchManager(playerA, playerB, {
  onRoundStarted: (round) => hud.setRound(round),
  onRoundEnded: (winner) => hud.setMessage(winner ? `${winner.name} wins the round!` : "Draw!"),
  onMatchEnded: (winner) => hud.setMessage(winner ? `${winner.name} wins the match!` : "Draw!"),
  onTimerUpdated: (t) => hud.setTimer(t),
});

const keyboard = new KeyboardSource();

function startRound(): void {
  match.startRound(spawns.a, spawns.b);
}
startRound();

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  fightingCamera.setAspect(window.innerWidth / window.innerHeight);
});

let lastTime = performance.now();
let roundEndTimer: number | null = null;

function loop(now: number): void {
  requestAnimationFrame(loop);
  const dt = Math.min((now - lastTime) / 1000, 1 / 30);
  lastTime = now;

  const inputA = keyboard.read(PLAYER1_KEYS);
  const inputB = keyboard.read(PLAYER2_KEYS);
  keyboard.endFrame();

  if (match.roundActive) {
    playerA.update(dt, inputA);
    playerB.update(dt, inputB);
    playerA.checkHitAgainst(playerB);
    playerB.checkHitAgainst(playerA);
    match.update(dt);

    if (!match.roundActive && !match.matchOver && roundEndTimer === null) {
      roundEndTimer = window.setTimeout(() => {
        roundEndTimer = null;
        startRound();
      }, 2000);
    }
  }

  viewA.update(dt, playerA);
  viewB.update(dt, playerB);
  fightingCamera.update(dt, playerA, playerB);

  renderer.render(scene, fightingCamera.camera);
}
requestAnimationFrame(loop);
