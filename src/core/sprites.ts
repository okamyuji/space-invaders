// Pixel-art sprites encoded as ASCII rows. "X" / "x" = lit, "." = empty.
// Patterns are hand-tuned approximations of the 1978 arcade originals.

export type Sprite = {
  readonly w: number;
  readonly h: number;
  readonly bits: ReadonlyArray<boolean>;
};

export function parseSprite(rows: ReadonlyArray<string>): Sprite {
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  const bits: boolean[] = [];
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    if (row === undefined || row.length !== w) {
      throw new Error(`parseSprite: row ${y} width mismatch (expected ${w}, got ${row?.length})`);
    }
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      bits.push(ch === "X" || ch === "x");
    }
  }
  return { w, h, bits };
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  x: number,
  y: number,
  scale: number,
): void {
  for (let row = 0; row < sprite.h; row++) {
    for (let col = 0; col < sprite.w; col++) {
      if (sprite.bits[row * sprite.w + col]) {
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      }
    }
  }
}

// ── Top row: squid (30 pts) ─────────────────────────────────────────────────

export const spriteSquidA = parseSprite([
  "...XX...",
  "..XXXX..",
  ".XXXXXX.",
  "XX.XX.XX",
  "XXXXXXXX",
  ".X.XX.X.",
  "X......X",
  ".X....X.",
]);

export const spriteSquidB = parseSprite([
  "...XX...",
  "..XXXX..",
  ".XXXXXX.",
  "XX.XX.XX",
  "XXXXXXXX",
  "..X..X..",
  ".X.XX.X.",
  "X.X..X.X",
]);

// ── Middle rows: crab (20 pts) ──────────────────────────────────────────────

export const spriteCrabA = parseSprite([
  "..X.....X..",
  "...X...X...",
  "..XXXXXXX..",
  ".XX.XXX.XX.",
  "XXXXXXXXXXX",
  "X.XXXXXXX.X",
  "X.X.....X.X",
  "...XX.XX...",
]);

export const spriteCrabB = parseSprite([
  "..X.....X..",
  "X..X...X..X",
  "X.XXXXXXX.X",
  "XXX.XXX.XXX",
  "XXXXXXXXXXX",
  ".XXXXXXXXX.",
  "..X.....X..",
  ".X.......X.",
]);

// ── Bottom rows: octopus (10 pts) ───────────────────────────────────────────

export const spriteOctopusA = parseSprite([
  "..XXXXXXXX..",
  "XXXXXXXXXXXX",
  "XXX..XX..XXX",
  "XXXXXXXXXXXX",
  "...XXXXXX...",
  "..XX.XX.XX..",
  ".XX......XX.",
  "..XX....XX..",
]);

export const spriteOctopusB = parseSprite([
  "..XXXXXXXX..",
  "XXXXXXXXXXXX",
  "XXX..XX..XXX",
  "XXXXXXXXXXXX",
  "..XXX..XXX..",
  ".XX.XXXX.XX.",
  "XX........XX",
  "..XX....XX..",
]);

// ── Player cannon ───────────────────────────────────────────────────────────

export const spritePlayer = parseSprite([
  "......X......",
  ".....XXX.....",
  ".....XXX.....",
  ".XXXXXXXXXXX.",
  "XXXXXXXXXXXXX",
  "XXXXXXXXXXXXX",
  "XXXXXXXXXXXXX",
  "XXXXXXXXXXXXX",
]);

// ── UFO bonus ───────────────────────────────────────────────────────────────

export const spriteUfo = parseSprite([
  ".....XXXXXX.....",
  "...XXXXXXXXXX...",
  "..XXXXXXXXXXXX..",
  ".XX.XX.XX.XX.XX.",
  "XXXXXXXXXXXXXXXX",
  "...XXX....XXX...",
  "..XX.XX..XX.XX..",
]);

export const invaderSpritesByRow: ReadonlyArray<readonly [Sprite, Sprite]> = [
  [spriteSquidA, spriteSquidB],
  [spriteCrabA, spriteCrabB],
  [spriteCrabA, spriteCrabB],
  [spriteOctopusA, spriteOctopusB],
  [spriteOctopusA, spriteOctopusB],
];
