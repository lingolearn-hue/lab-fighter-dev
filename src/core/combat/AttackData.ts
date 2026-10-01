export interface AttackData {
  name: string;

  // Timing, in frames at 60 FPS
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;

  // Damage & impact
  damage: number;
  knockback: { x: number; y: number };
  hitstunFrames: number;
  blockstunFrames: number;
  isLauncher: boolean;

  // Hitbox (local offset/size relative to the attacker, facing-right space)
  hitboxOffset: { x: number; y: number };
  hitboxSize: { x: number; y: number };

  // Behavior
  canBeBlocked: boolean;
  isGrab: boolean;
  selfMovement: { x: number; y: number };
  animationName: string;
}

export function totalFrames(attack: AttackData): number {
  return attack.startupFrames + attack.activeFrames + attack.recoveryFrames;
}
