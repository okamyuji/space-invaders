import { describe, expect, it } from "vitest";
import { type Bunker, createBunker, damageBunker, isCellAlive } from "../../src/entities/bunker.ts";

const cfg = { x: 100, y: 200, cols: 22, rows: 16, cellSize: 2 } as const;

describe("createBunker", () => {
  it("starts with all cells alive", () => {
    const b: Bunker = createBunker(cfg);
    expect(b.cells.length).toBe(cfg.cols * cfg.rows);
    expect(b.cells.every((alive) => alive)).toBe(true);
  });

  it("exposes the same x/y/size used to create it", () => {
    const b = createBunker(cfg);
    expect(b.x).toBe(100);
    expect(b.y).toBe(200);
    expect(b.cellSize).toBe(2);
  });
});

describe("isCellAlive", () => {
  it("returns false for cells outside the grid", () => {
    const b = createBunker(cfg);
    expect(isCellAlive(b, -1, 0)).toBe(false);
    expect(isCellAlive(b, 0, -1)).toBe(false);
    expect(isCellAlive(b, cfg.cols, 0)).toBe(false);
    expect(isCellAlive(b, 0, cfg.rows)).toBe(false);
  });
});

describe("damageBunker", () => {
  it("destroys cells overlapping a bullet rect and reports a hit", () => {
    const b = createBunker(cfg);
    const result = damageBunker(b, { x: 100, y: 200, w: 2, h: 6 });
    expect(result.hit).toBe(true);
    // Top-left 1x3 cells should be cleared.
    expect(isCellAlive(result.bunker, 0, 0)).toBe(false);
    expect(isCellAlive(result.bunker, 0, 1)).toBe(false);
    expect(isCellAlive(result.bunker, 0, 2)).toBe(false);
    // Surrounding cells survive.
    expect(isCellAlive(result.bunker, 1, 0)).toBe(true);
  });

  it("reports no hit when the rect misses the bunker entirely", () => {
    const b = createBunker(cfg);
    const result = damageBunker(b, { x: 1000, y: 1000, w: 2, h: 6 });
    expect(result.hit).toBe(false);
    expect(result.bunker).toBe(b);
  });

  it("reports no hit when the rect overlaps the bunker bounds but only already-dead cells", () => {
    const b1 = damageBunker(createBunker(cfg), { x: 100, y: 200, w: 2, h: 6 });
    const b2 = damageBunker(b1.bunker, { x: 100, y: 200, w: 2, h: 6 });
    expect(b2.hit).toBe(false);
  });
});
