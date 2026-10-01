export const CharacterState = {
  Idle: "idle",
  Walk: "walk",
  Crouch: "crouch",
  Jump: "jump",
  Fall: "fall",
  Attack: "attack",
  Block: "block",
  Hitstun: "hitstun",
  Knockdown: "knockdown",
  Victory: "victory",
  Defeat: "defeat",
} as const;

export type CharacterState = (typeof CharacterState)[keyof typeof CharacterState];
