import { describe, expect, it } from "vitest";
import { createPlayer, fire, type Player, step } from "../../src/entities/player.ts";

const baseField = { left: 10, right: 488 } as const;

describe("createPlayer", () => {
  it("starts centered between field bounds", () => {
    const p = createPlayer({ field: baseField, width: 20, y: 240 });
    expect(p.x).toBeCloseTo((baseField.left + baseField.right) / 2 - 10);
    expect(p.y).toBe(240);
    expect(p.alive).toBe(true);
    expect(p.fireCooldown).toBe(0);
  });
});

describe("step", () => {
  const p0: Player = createPlayer({ field: baseField, width: 20, y: 240 });

  it("moves left when input is -1", () => {
    const p = step(p0, { dt: 1 / 60, axis: -1 }, { speed: 120 });
    expect(p.x).toBeLessThan(p0.x);
  });

  it("moves right when input is +1", () => {
    const p = step(p0, { dt: 1 / 60, axis: 1 }, { speed: 120 });
    expect(p.x).toBeGreaterThan(p0.x);
  });

  it("does not exit the left field boundary", () => {
    const far = { ...p0, x: baseField.left };
    const p = step(far, { dt: 1, axis: -1 }, { speed: 9999 });
    expect(p.x).toBe(baseField.left);
  });

  it("does not exit the right field boundary (accounts for width)", () => {
    const far = { ...p0, x: baseField.right - 20 };
    const p = step(far, { dt: 1, axis: 1 }, { speed: 9999 });
    expect(p.x).toBe(baseField.right - 20);
  });

  it("decreases fireCooldown but never below zero", () => {
    const hot = { ...p0, fireCooldown: 0.1 };
    const cool = step(hot, { dt: 0.5, axis: 0 }, { speed: 0 });
    expect(cool.fireCooldown).toBe(0);
  });

  it("returns a new object (immutable update)", () => {
    const p = step(p0, { dt: 0, axis: 0 }, { speed: 0 });
    expect(p).not.toBe(p0);
  });
});

describe("fire", () => {
  it("returns a bullet origin and resets cooldown when ready", () => {
    const p = createPlayer({ field: baseField, width: 20, y: 240 });
    const result = fire(p, { cooldown: 0.5 });
    expect(result.fired).toBe(true);
    if (result.fired) {
      expect(result.origin.x).toBe(p.x + 10);
      expect(result.origin.y).toBe(p.y);
      expect(result.player.fireCooldown).toBe(0.5);
    }
  });

  it("refuses to fire while on cooldown", () => {
    const hot = { ...createPlayer({ field: baseField, width: 20, y: 240 }), fireCooldown: 0.2 };
    const result = fire(hot, { cooldown: 0.5 });
    expect(result.fired).toBe(false);
  });

  it("refuses to fire when player is dead", () => {
    const dead = { ...createPlayer({ field: baseField, width: 20, y: 240 }), alive: false };
    const result = fire(dead, { cooldown: 0.5 });
    expect(result.fired).toBe(false);
  });
});
