import { intersects, type Rect } from "../utils/aabb.ts";

export type Bunker = {
  readonly x: number;
  readonly y: number;
  readonly cols: number;
  readonly rows: number;
  readonly cellSize: number;
  readonly cells: ReadonlyArray<boolean>;
};

export type CreateBunkerArgs = {
  readonly x: number;
  readonly y: number;
  readonly cols: number;
  readonly rows: number;
  readonly cellSize: number;
};

export function createBunker({ x, y, cols, rows, cellSize }: CreateBunkerArgs): Bunker {
  const cells: boolean[] = Array.from({ length: cols * rows }, () => true);
  return { x, y, cols, rows, cellSize, cells };
}

export function isCellAlive(b: Bunker, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= b.cols || row >= b.rows) return false;
  return b.cells[row * b.cols + col] ?? false;
}

export type DamageResult = {
  readonly bunker: Bunker;
  readonly hit: boolean;
};

function bunkerOuterRect(b: Bunker): Rect {
  return { x: b.x, y: b.y, w: b.cols * b.cellSize, h: b.rows * b.cellSize };
}

export function damageBunker(b: Bunker, rect: Rect): DamageResult {
  if (!intersects(rect, bunkerOuterRect(b))) {
    return { bunker: b, hit: false };
  }
  const cells = b.cells.slice();
  let hit = false;
  for (let row = 0; row < b.rows; row++) {
    for (let col = 0; col < b.cols; col++) {
      const idx = row * b.cols + col;
      if (!cells[idx]) continue;
      const cellRect: Rect = {
        x: b.x + col * b.cellSize,
        y: b.y + row * b.cellSize,
        w: b.cellSize,
        h: b.cellSize,
      };
      if (intersects(rect, cellRect)) {
        cells[idx] = false;
        hit = true;
      }
    }
  }
  if (!hit) return { bunker: b, hit: false };
  return { bunker: { ...b, cells }, hit: true };
}
