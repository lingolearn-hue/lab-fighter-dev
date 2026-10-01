import { describe, it, expect } from "vitest";
import { boxesOverlap } from "../core/combat/hitDetection";
import { totalFrames } from "../core/combat/AttackData";
import { Character } from "../core/character/Character";
import { CharacterState } from "../core/character/CharacterState";
import { emptyInput } from "../core/input/FighterInput";
import { createScientist } from "../characters/scientist/Scientist";
import { LIGHT_JAB, HEAVY_SWING } from "../characters/scientist/attacks";
import { MatchManager } from "../gameplay/match/MatchManager";

describe("boxesOverlap", () => {
  it("detects overlap", () => {
    expect(boxesOverlap({ x: 0, y: 0, halfWidth: 1, halfHeight: 1 }, { x: 1, y: 0, halfWidth: 1, halfHeight: 1 })).toBe(true);
  });
  it("detects no overlap", () => {
    expect(boxesOverlap({ x: 0, y: 0, halfWidth: 1, halfHeight: 1 }, { x: 5, y: 0, halfWidth: 1, halfHeight: 1 })).toBe(false);
  });
});

describe("AttackData", () => {
  it("sums frame counts", () => {
    expect(totalFrames(LIGHT_JAB)).toBe(LIGHT_JAB.startupFrames + LIGHT_JAB.activeFrames + LIGHT_JAB.recoveryFrames);
  });
});

describe("Character movement & state", () => {
  it("walks when moveDir is nonzero and grounded", () => {
    const c = createScientist("A");
    c.reset(0, 0, true);
    c.update(1 / 60, { ...emptyInput(), moveDir: 1 });
    expect(c.state).toBe(CharacterState.Walk);
    expect(c.x).toBeGreaterThan(0);
  });

  it("jumps and leaves the ground", () => {
    const c = createScientist("A");
    c.reset(0, 0, true);
    c.update(1 / 60, { ...emptyInput(), jumpPressed: true });
    expect(c.onGround).toBe(false);
    expect(c.state).toBe(CharacterState.Jump);
  });

  it("enters attack state on light press and becomes idle again after total frames", () => {
    const c = createScientist("A");
    c.reset(0, 0, true);
    c.update(1 / 60, { ...emptyInput(), lightPressed: true });
    expect(c.state).toBe(CharacterState.Attack);
    const frames = totalFrames(LIGHT_JAB);
    for (let i = 0; i < frames; i++) c.update(1 / 60, emptyInput());
    expect(c.state).toBe(CharacterState.Idle);
  });
});

describe("Hit resolution", () => {
  it("damages the opponent and enters hitstun on a clean hit", () => {
    const attacker = createScientist("A");
    const defender = createScientist("B");
    attacker.reset(0, 0, true);
    defender.reset(0.6, 0, false); // inside light jab's hitbox range
    attacker.opponent = defender;

    attacker.update(1 / 60, { ...emptyInput(), lightPressed: true });
    // advance through startup to the first active frame
    for (let i = 0; i < LIGHT_JAB.startupFrames + 1; i++) attacker.update(1 / 60, emptyInput());
    attacker.checkHitAgainst(defender);

    expect(defender.health).toBeLessThan(defender.maxHealth);
    expect(defender.state).toBe(CharacterState.Hitstun);
  });

  it("blocks and takes no damage, only blockstun, when defender is blocking", () => {
    const attacker = createScientist("A");
    const defender = createScientist("B");
    attacker.reset(0, 0, true);
    defender.reset(0.6, 0, false);
    attacker.opponent = defender;
    defender.update(1 / 60, { ...emptyInput(), blockHeld: true });

    attacker.update(1 / 60, { ...emptyInput(), lightPressed: true });
    for (let i = 0; i < LIGHT_JAB.startupFrames + 1; i++) attacker.update(1 / 60, emptyInput());
    attacker.checkHitAgainst(defender);

    expect(defender.health).toBe(defender.maxHealth);
    expect(defender.state).toBe(CharacterState.Hitstun); // blockstun reuses hitstun state
  });

  it("knocks down the defender on a launcher attack when health remains", () => {
    const attacker = createScientist("A");
    const defender = createScientist("B");
    attacker.reset(0, 0, true);
    defender.reset(0.8, 0, false);
    attacker.opponent = defender;

    defender.receiveHit(HEAVY_SWING, attacker);
    expect(defender.state).toBe(CharacterState.Knockdown);
  });

  it("defeats the defender when health drops to zero", () => {
    const attacker = createScientist("A");
    const defender = createScientist("B");
    defender.reset(0, 0, false);
    defender.health = 1;
    defender.receiveHit(LIGHT_JAB, attacker);
    expect(defender.state).toBe(CharacterState.Defeat);
    expect(defender.health).toBe(0);
  });
});

describe("MatchManager", () => {
  it("awards the round to whoever is left standing on defeat", () => {
    const a = createScientist("A");
    const b = createScientist("B");
    let winner: Character | null | undefined;
    const match = new MatchManager(a, b, { onRoundEnded: (w) => (winner = w) });
    match.startRound({ x: -3, y: 0 }, { x: 3, y: 0 });
    b.health = 1;
    b.receiveHit(HEAVY_SWING, a);
    expect(winner).toBe(a);
    expect(match.winsA).toBe(1);
  });

  it("ends the match once a player reaches roundsToWin", () => {
    const a = createScientist("A");
    const b = createScientist("B");
    let matchEnded = false;
    const match = new MatchManager(a, b, { onMatchEnded: () => (matchEnded = true) });
    match.roundsToWin = 2;

    for (let round = 0; round < 2; round++) {
      match.startRound({ x: -3, y: 0 }, { x: 3, y: 0 });
      b.health = 1;
      b.receiveHit(HEAVY_SWING, a);
    }
    expect(matchEnded).toBe(true);
    expect(match.matchOver).toBe(true);
  });

  it("decides the round by remaining health on timeout", () => {
    const a = createScientist("A");
    const b = createScientist("B");
    let winner: Character | null | undefined;
    const match = new MatchManager(a, b, { onRoundEnded: (w) => (winner = w) });
    match.roundTimeSeconds = 1;
    match.startRound({ x: -3, y: 0 }, { x: 3, y: 0 });
    b.health = 50;
    match.update(2); // exceeds roundTimeSeconds
    expect(winner).toBe(a);
  });
});
