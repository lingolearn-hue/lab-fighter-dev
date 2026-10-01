export interface FighterInput {
  moveDir: number; // -1, 0, or 1
  jumpPressed: boolean; // true only on the frame the key was pressed
  lightPressed: boolean;
  heavyPressed: boolean;
  blockHeld: boolean;
}

export function emptyInput(): FighterInput {
  return { moveDir: 0, jumpPressed: false, lightPressed: false, heavyPressed: false, blockHeld: false };
}
