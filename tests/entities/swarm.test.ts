import { describe, expect, it } from "vitest";
import {
  aliveCount,
  createSwarm,
  killAt,
  type Swarm,
  swarmRect,
  tickSwarm,
} from "../../src/entities/swarm.ts";

const baseField = { left: 10, right: 488 } as const;
const baseConfig = {
  rows: 5,
  cols: 11,
  cellW: 16,
  cellH: 12,
  gapX: 4,
  gapY: 4,
  startY: 40,
  field: baseField,
} as const;

const baseSwarm = (): Swarm => createSwarm(baseConfig);

describe("createSwarm", () => {
  it("creates a 5x11 grid of alive invaders", () => {
    const s = baseSwarm();
    expect(s.invaders.length).toBe(55);
    expect(s.invaders.every((inv) => inv.alive)).toBe(true);
  });

  it("assigns row 0 (top) the highest score value", () => {
    const s = baseSwarm();
    const top = s.invaders.find((i) => i.row === 0);
    const bottom = s.invaders.find((i) => i.row === 4);
    expect(top).toBeDefined();
    expect(bottom).toBeDefined();
    if (top && bottom) {
      expect(top.value).toBeGreaterThan(bottom.value);
    }
  });

  it("starts the formation moving right", () => {
    const s = baseSwarm();
    expect(s.dir).toBe(1);
  });
});

describe("animation frame", () => {
  it("toggles between 0 and 1 on each tick", () => {
    const s0 = baseSwarm();
    expect(s0.frame).toBe(0);
    const s1 = tickSwarm(s0, { stepX: 2, stepY: 8 });
    expect(s1.frame).toBe(1);
    const s2 = tickSwarm(s1, { stepX: 2, stepY: 8 });
    expect(s2.frame).toBe(0);
  });
});

describe("aliveCount", () => {
  it("counts only alive invaders", () => {
    const s = baseSwarm();
    expect(aliveCount(s)).toBe(55);
    const after = killAt(s, 0);
    expect(aliveCount(after)).toBe(54);
  });
});

describe("swarmRect", () => {
  it("computes the bounding rect across alive invaders only", () => {
    const s = baseSwarm();
    const rect = swarmRect(s);
    expect(rect).not.toBeNull();
    if (rect) {
      const cellsX = baseConfig.cols * baseConfig.cellW + (baseConfig.cols - 1) * baseConfig.gapX;
      expect(rect.w).toBe(cellsX);
    }
  });

  it("returns null when no invader is alive", () => {
    let s = baseSwarm();
    for (let i = 0; i < s.invaders.length; i++) s = killAt(s, i);
    expect(swarmRect(s)).toBeNull();
  });
});

describe("tickSwarm", () => {
  it("advances one step horizontally without descending while inside the field", () => {
    const s = baseSwarm();
    const next = tickSwarm(s, { stepX: 2, stepY: 8 });
    expect(next.dir).toBe(1);
    expect(
      next.invaders.every((inv, i) => {
        const before = s.invaders[i];
        return before !== undefined && inv.x === before.x + 2 && inv.y === before.y;
      }),
    ).toBe(true);
  });

  it("flips direction and descends when reaching the right edge", () => {
    let s = baseSwarm();
    // Push the swarm right until any alive invader would exceed field.right.
    for (let guard = 0; guard < 1000; guard++) {
      const r = swarmRect(s);
      if (!r) break;
      if (r.x + r.w + 2 > baseField.right) break;
      s = tickSwarm(s, { stepX: 2, stepY: 8 });
    }
    const beforeY = s.invaders[0]?.y ?? 0;
    const flipped = tickSwarm(s, { stepX: 2, stepY: 8 });
    expect(flipped.dir).toBe(-1);
    expect(flipped.invaders[0]?.y).toBe(beforeY + 8);
  });

  it("flips direction and descends when reaching the left edge", () => {
    let s = { ...baseSwarm(), dir: -1 as -1 | 1 };
    for (let guard = 0; guard < 1000; guard++) {
      const r = swarmRect(s);
      if (!r) break;
      if (r.x - 2 < baseField.left) break;
      s = tickSwarm(s, { stepX: 2, stepY: 8 });
    }
    const beforeY = s.invaders[0]?.y ?? 0;
    const flipped = tickSwarm(s, { stepX: 2, stepY: 8 });
    expect(flipped.dir).toBe(1);
    expect(flipped.invaders[0]?.y).toBe(beforeY + 8);
  });
});
