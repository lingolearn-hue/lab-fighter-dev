import type { FighterInput } from "./FighterInput";

export interface KeyBindings {
  left: string;
  right: string;
  jump: string;
  crouch: string;
  light: string;
  heavy: string;
  block: string;
}

export const PLAYER1_KEYS: KeyBindings = {
  left: "KeyA",
  right: "KeyD",
  jump: "KeyW",
  crouch: "KeyS",
  light: "KeyF",
  heavy: "KeyG",
  block: "KeyH",
};

export const PLAYER2_KEYS: KeyBindings = {
  left: "ArrowLeft",
  right: "ArrowRight",
  jump: "ArrowUp",
  crouch: "ArrowDown",
  light: "Comma",
  heavy: "Period",
  block: "Slash",
};

const ALL_BOUND_CODES = new Set([
  ...Object.values(PLAYER1_KEYS),
  ...Object.values(PLAYER2_KEYS),
]);

export class KeyboardSource {
  private held = new Set<string>();
  private justPressed = new Set<string>();

  constructor() {
    window.addEventListener("keydown", (e) => {
      if (ALL_BOUND_CODES.has(e.code)) e.preventDefault();
      if (!this.held.has(e.code)) this.justPressed.add(e.code);
      this.held.add(e.code);
    });
    window.addEventListener("keyup", (e) => {
      if (ALL_BOUND_CODES.has(e.code)) e.preventDefault();
      this.held.delete(e.code);
    });
  }

  /** Call once per frame, after reading input for all players. */
  endFrame(): void {
    this.justPressed.clear();
  }

  read(bindings: KeyBindings): FighterInput {
    const left = this.held.has(bindings.left);
    const right = this.held.has(bindings.right);
    return {
      moveDir: (right ? 1 : 0) - (left ? 1 : 0),
      jumpPressed: this.justPressed.has(bindings.jump),
      lightPressed: this.justPressed.has(bindings.light),
      heavyPressed: this.justPressed.has(bindings.heavy),
      blockHeld: this.held.has(bindings.block),
    };
  }
}
