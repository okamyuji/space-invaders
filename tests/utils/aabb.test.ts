import { describe, expect, it } from "vitest";
import { intersects, type Rect } from "../../src/utils/aabb.ts";

const r = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });

describe("intersects (axis-aligned bounding box)", () => {
  it("returns true when two rectangles overlap", () => {
    expect(intersects(r(0, 0, 10, 10), r(5, 5, 10, 10))).toBe(true);
  });

  it("returns false when rectangles are completely separated horizontally", () => {
    expect(intersects(r(0, 0, 10, 10), r(20, 0, 10, 10))).toBe(false);
  });

  it("returns false when rectangles are completely separated vertically", () => {
    expect(intersects(r(0, 0, 10, 10), r(0, 20, 10, 10))).toBe(false);
  });

  it("returns false when rectangles only touch on an edge (open intervals)", () => {
    // Right edge of A == left edge of B → not overlapping in pixel-space.
    expect(intersects(r(0, 0, 10, 10), r(10, 0, 10, 10))).toBe(false);
  });

  it("returns true when one rectangle fully contains another", () => {
    expect(intersects(r(0, 0, 100, 100), r(40, 40, 5, 5))).toBe(true);
  });

  it("is symmetric", () => {
    const a = r(3, 4, 8, 8);
    const b = r(7, 6, 5, 5);
    expect(intersects(a, b)).toBe(intersects(b, a));
  });
});
