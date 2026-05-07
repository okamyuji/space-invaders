import { describe, expect, it } from "vitest";
import { clamp } from "../../src/utils/math.ts";

describe("clamp", () => {
  it("returns the value unchanged when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns the lower bound when below range", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it("returns the upper bound when above range", () => {
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it("returns the bound itself when value equals it", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("works with negative ranges", () => {
    expect(clamp(-50, -20, -5)).toBe(-20);
    expect(clamp(0, -20, -5)).toBe(-5);
  });

  it("throws when min is greater than max (programmer error)", () => {
    expect(() => clamp(5, 10, 0)).toThrow();
  });
});
