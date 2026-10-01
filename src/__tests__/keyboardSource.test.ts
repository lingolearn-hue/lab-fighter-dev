// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { KeyboardSource, PLAYER1_KEYS, PLAYER2_KEYS } from "../core/input/KeyboardSource";

function press(code: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { code }));
}
function release(code: string) {
  window.dispatchEvent(new KeyboardEvent("keyup", { code }));
}

describe("KeyboardSource", () => {
  let source: KeyboardSource;

  beforeEach(() => {
    source = new KeyboardSource();
  });

  it("reports moveDir from held left/right keys", () => {
    press("KeyD");
    expect(source.read(PLAYER1_KEYS).moveDir).toBe(1);
    release("KeyD");
    press("KeyA");
    expect(source.read(PLAYER1_KEYS).moveDir).toBe(-1);
  });

  it("reports jumpPressed only on the frame the key goes down", () => {
    press("KeyW");
    expect(source.read(PLAYER1_KEYS).jumpPressed).toBe(true);
    source.endFrame();
    expect(source.read(PLAYER1_KEYS).jumpPressed).toBe(false); // still held, but not "just" pressed
  });

  it("tracks player 2 bindings independently of player 1", () => {
    press("ArrowRight");
    const p1 = source.read(PLAYER1_KEYS);
    const p2 = source.read(PLAYER2_KEYS);
    expect(p1.moveDir).toBe(0);
    expect(p2.moveDir).toBe(1);
  });

  it("reports blockHeld while the block key is held down", () => {
    press("KeyH");
    expect(source.read(PLAYER1_KEYS).blockHeld).toBe(true);
    release("KeyH");
    expect(source.read(PLAYER1_KEYS).blockHeld).toBe(false);
  });
});
