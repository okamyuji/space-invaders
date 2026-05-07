import { describe, expect, it } from "vitest";
import {
  type Bullet,
  bulletRect,
  createBullet,
  isOutOfBounds,
  stepBullet,
} from "../../src/entities/bullet.ts";

const upBullet = (overrides: Partial<Bullet> = {}): Bullet =>
  createBullet({ x: 100, y: 200, vy: -300, owner: "player", ...overrides });

describe("createBullet", () => {
  it("uses provided position, velocity, and owner", () => {
    const b = upBullet();
    expect(b.x).toBe(100);
    expect(b.y).toBe(200);
    expect(b.vy).toBe(-300);
    expect(b.owner).toBe("player");
    expect(b.alive).toBe(true);
  });
});

describe("stepBullet", () => {
  it("advances y by vy*dt", () => {
    const b = upBullet();
    const next = stepBullet(b, 0.5);
    expect(next.y).toBe(200 + -300 * 0.5);
  });

  it("does not mutate the input", () => {
    const b = upBullet();
    const next = stepBullet(b, 0.1);
    expect(next).not.toBe(b);
    expect(b.y).toBe(200);
  });
});

describe("isOutOfBounds", () => {
  const field = { top: 0, bottom: 280 };

  it("flags bullets above the top", () => {
    expect(isOutOfBounds({ ...upBullet(), y: -1 }, field)).toBe(true);
  });

  it("flags bullets below the bottom", () => {
    expect(isOutOfBounds({ ...upBullet(), y: 281 }, field)).toBe(true);
  });

  it("keeps bullets inside the field", () => {
    expect(isOutOfBounds({ ...upBullet(), y: 50 }, field)).toBe(false);
    expect(isOutOfBounds({ ...upBullet(), y: 0 }, field)).toBe(false);
    expect(isOutOfBounds({ ...upBullet(), y: 280 }, field)).toBe(false);
  });
});

describe("bulletRect", () => {
  it("returns a 2x6 collision box centered horizontally on the bullet", () => {
    const b = upBullet({ x: 50, y: 100 });
    const rect = bulletRect(b);
    expect(rect.x).toBe(50 - 1);
    expect(rect.y).toBe(100);
    expect(rect.w).toBe(2);
    expect(rect.h).toBe(6);
  });
});
