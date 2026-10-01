export interface Box {
  x: number;
  y: number;
  halfWidth: number;
  halfHeight: number;
}

/** Axis-aligned box overlap test. Pure function — no engine dependency. */
export function boxesOverlap(a: Box, b: Box): boolean {
  return (
    Math.abs(a.x - b.x) < a.halfWidth + b.halfWidth &&
    Math.abs(a.y - b.y) < a.halfHeight + b.halfHeight
  );
}

export function attackHitboxWorldBox(
  attackerX: number,
  attackerY: number,
  facingRight: boolean,
  offset: { x: number; y: number },
  size: { x: number; y: number }
): Box {
  const dir = facingRight ? 1 : -1;
  return {
    x: attackerX + offset.x * dir,
    y: attackerY + offset.y,
    halfWidth: size.x / 2,
    halfHeight: size.y / 2,
  };
}
