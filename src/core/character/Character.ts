import { CharacterState } from "./CharacterState";
import type { AttackData } from "../combat/AttackData";
import { totalFrames } from "../combat/AttackData";
import { attackHitboxWorldBox, boxesOverlap, type Box } from "../combat/hitDetection";
import type { FighterInput } from "../input/FighterInput";

export interface CharacterEvents {
  onHealthChanged?: (current: number, max: number) => void;
  onKnockedDown?: () => void;
  onDefeated?: () => void;
  onAnimation?: (name: string, loop: boolean) => void;
}

const HURTBOX_SIZE = { x: 0.7, y: 1.8 };
const HURTBOX_OFFSET = { x: 0, y: 0.9 };

export class Character {
  // World state
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  facingRight = true;

  // Config
  maxHealth = 100;
  moveSpeed = 4.5;
  jumpVelocity = 7.0;
  gravity = 18.0;
  attacks: AttackData[] = [];

  // Runtime
  health = this.maxHealth;
  state: CharacterState = CharacterState.Idle;
  opponent: Character | null = null;
  onGround = true;
  readonly groundY = 0;

  private attackFrame = 0;
  private activeAttack: AttackData | null = null;
  private hitstunFramesLeft = 0;
  private knockdownTimeLeft = 0;
  private alreadyHitThisAttack = false;
  private currentAnimation = "";

  readonly name: string;
  events: CharacterEvents;

  constructor(name: string, events: CharacterEvents = {}) {
    this.name = name;
    this.events = events;
  }

  reset(x: number, y: number, facingRight: boolean): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facingRight = facingRight;
    this.health = this.maxHealth;
    this.state = CharacterState.Idle;
    this.activeAttack = null;
    this.hitstunFramesLeft = 0;
    this.knockdownTimeLeft = 0;
    this.events.onHealthChanged?.(this.health, this.maxHealth);
  }

  /** Advance one frame. dt in seconds, input already read for this frame. */
  update(dt: number, input: FighterInput): void {
    switch (this.state) {
      case CharacterState.Hitstun:
        this.hitstunFramesLeft -= 1;
        this.vx = moveToward(this.vx, 0, this.moveSpeed * dt * 4);
        if (this.hitstunFramesLeft <= 0) this.setState(CharacterState.Idle);
        break;
      case CharacterState.Knockdown:
        this.knockdownTimeLeft -= dt;
        this.vx = moveToward(this.vx, 0, this.moveSpeed * dt * 4);
        if (this.knockdownTimeLeft <= 0) this.setState(CharacterState.Idle);
        break;
      case CharacterState.Attack:
        this.processAttack();
        break;
      case CharacterState.Defeat:
      case CharacterState.Victory:
        this.vx = 0;
        break;
      default:
        this.processFreeState(dt, input);
    }

    this.applyGravity(dt);
    this.faceOpponent();

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    if (this.y <= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
  }

  private processFreeState(_dt: number, input: FighterInput): void {
    if (input.lightPressed || input.heavyPressed) {
      const index = input.lightPressed ? 0 : 1;
      if (index < this.attacks.length) {
        this.startAttack(this.attacks[index]);
        return;
      }
    }

    if (input.blockHeld && this.onGround) {
      this.setState(CharacterState.Block);
      this.vx = 0;
      return;
    }
    if (this.state === CharacterState.Block && !input.blockHeld) {
      this.setState(CharacterState.Idle);
    }

    this.vx = input.moveDir * this.moveSpeed;

    if (input.jumpPressed && this.onGround) {
      this.vy = this.jumpVelocity;
      this.onGround = false;
    }

    if (!this.onGround) {
      this.setState(this.vy > 0 ? CharacterState.Jump : CharacterState.Fall);
    } else if (Math.abs(input.moveDir) > 0.01) {
      this.setState(CharacterState.Walk);
      this.playLoop("walk");
    } else {
      this.setState(CharacterState.Idle);
      this.playLoop("idle");
    }
  }

  private applyGravity(dt: number): void {
    if (!this.onGround) this.vy -= this.gravity * dt;
  }

  private faceOpponent(): void {
    if (!this.opponent) return;
    this.facingRight = this.opponent.x >= this.x;
  }

  private startAttack(attack: AttackData): void {
    this.activeAttack = attack;
    this.attackFrame = 0;
    this.alreadyHitThisAttack = false;
    this.setState(CharacterState.Attack);
    this.play(attack.animationName);
    const dir = this.facingRight ? 1 : -1;
    this.vx += attack.selfMovement.x * dir;
  }

  private processAttack(): void {
    if (!this.activeAttack) {
      this.setState(CharacterState.Idle);
      return;
    }
    this.attackFrame += 1;
    const total = totalFrames(this.activeAttack);
    if (this.attackFrame >= total) {
      this.activeAttack = null;
      this.setState(CharacterState.Idle);
    }
  }

  /** True while this character's active attack's hitbox is "live" this frame. */
  get hitboxActiveThisFrame(): boolean {
    if (this.state !== CharacterState.Attack || !this.activeAttack) return false;
    const a = this.activeAttack;
    return this.attackFrame > a.startupFrames && this.attackFrame <= a.startupFrames + a.activeFrames;
  }

  getHurtbox(): Box {
    return {
      x: this.x + HURTBOX_OFFSET.x,
      y: this.y + HURTBOX_OFFSET.y,
      halfWidth: HURTBOX_SIZE.x / 2,
      halfHeight: HURTBOX_SIZE.y / 2,
    };
  }

  getActiveHitbox(): Box | null {
    if (!this.hitboxActiveThisFrame || !this.activeAttack) return null;
    return attackHitboxWorldBox(this.x, this.y, this.facingRight, this.activeAttack.hitboxOffset, this.activeAttack.hitboxSize);
  }

  /** Checks this character's active hitbox against the opponent's hurtbox and applies the hit once per attack. */
  checkHitAgainst(target: Character): void {
    if (this.alreadyHitThisAttack) return;
    const hitbox = this.getActiveHitbox();
    if (!hitbox || !this.activeAttack) return;
    if (boxesOverlap(hitbox, target.getHurtbox())) {
      this.alreadyHitThisAttack = true;
      target.receiveHit(this.activeAttack, this);
    }
  }

  receiveHit(attack: AttackData, attacker: Character): void {
    const blocking = this.state === CharacterState.Block && attack.canBeBlocked;
    const dir = attacker.facingRight ? -1 : 1;

    if (blocking) {
      this.vx = attack.knockback.x * dir * 0.4;
      this.hitstunFramesLeft = attack.blockstunFrames;
      this.setState(CharacterState.Hitstun);
      return;
    }

    this.health = Math.max(0, this.health - attack.damage);
    this.events.onHealthChanged?.(this.health, this.maxHealth);
    this.vx = attack.knockback.x * dir;
    if (attack.isLauncher) this.vy = attack.knockback.y;

    if (this.health <= 0) {
      this.setState(CharacterState.Defeat);
      this.events.onDefeated?.();
      return;
    }

    if (attack.isLauncher) {
      this.knockdownTimeLeft = 0.9;
      this.setState(CharacterState.Knockdown);
      this.play("knockdown");
      this.events.onKnockedDown?.();
    } else {
      this.hitstunFramesLeft = attack.hitstunFrames;
      this.setState(CharacterState.Hitstun);
      this.play("hit");
    }
  }

  private setState(next: CharacterState): void {
    this.state = next;
  }

  private play(animName: string): void {
    this.currentAnimation = animName;
    this.events.onAnimation?.(animName, false);
  }

  private playLoop(animName: string): void {
    if (this.currentAnimation === animName) return;
    this.currentAnimation = animName;
    this.events.onAnimation?.(animName, true);
  }
}

function moveToward(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}
