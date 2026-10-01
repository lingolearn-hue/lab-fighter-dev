import type { AttackData } from "../../core/combat/AttackData";

export const LIGHT_JAB: AttackData = {
  name: "light_jab",
  startupFrames: 4,
  activeFrames: 3,
  recoveryFrames: 8,
  damage: 5,
  knockback: { x: 2.0, y: 0 },
  hitstunFrames: 12,
  blockstunFrames: 6,
  isLauncher: false,
  hitboxOffset: { x: 0.6, y: 1.1 },
  hitboxSize: { x: 0.5, y: 0.4 },
  canBeBlocked: true,
  isGrab: false,
  selfMovement: { x: 0.5, y: 0 },
  animationName: "attack_light",
};

export const HEAVY_SWING: AttackData = {
  name: "heavy_swing",
  startupFrames: 10,
  activeFrames: 4,
  recoveryFrames: 18,
  damage: 12,
  knockback: { x: 5.0, y: 4.0 },
  hitstunFrames: 20,
  blockstunFrames: 12,
  isLauncher: true,
  hitboxOffset: { x: 0.8, y: 1.0 },
  hitboxSize: { x: 0.7, y: 0.6 },
  canBeBlocked: true,
  isGrab: false,
  selfMovement: { x: 1.0, y: 0 },
  animationName: "attack_heavy",
};

export const SCIENTIST_ATTACKS: AttackData[] = [LIGHT_JAB, HEAVY_SWING];
