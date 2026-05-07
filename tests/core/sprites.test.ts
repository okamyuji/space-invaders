import { describe, expect, it } from "vitest";
import {
  type Sprite,
  drawSprite,
  parseSprite,
  spriteCrabA,
  spriteOctopusA,
  spritePlayer,
  spriteSquidA,
} from "../../src/core/sprites.ts";

type FillCall = [x: number, y: number, w: number, h: number];

function makeFakeCtx(): { ctx: CanvasRenderingContext2D; calls: FillCall[]; styles: string[] } {
  const calls: FillCall[] = [];
  const styles: string[] = [];
  const ctx = {
    fillRect: (x: number, y: number, w: number, h: number) => {
      calls.push([x, y, w, h]);
    },
    set fillStyle(v: string) {
      styles.push(v);
    },
    get fillStyle(): string {
      return styles[styles.length - 1] ?? "";
    },
  } as unknown as CanvasRenderingContext2D;
  return { ctx, calls, styles };
}

describe("parseSprite", () => {
  it("derives width/height from the source rows", () => {
    const s = parseSprite(["X.X", ".X."]);
    expect(s.w).toBe(3);
    expect(s.h).toBe(2);
  });

  it("treats X (and case-variants) as lit pixels and . as empty", () => {
    const s = parseSprite(["X.x"]);
    expect(s.bits).toEqual([true, false, true]);
  });

  it("throws when rows have inconsistent widths", () => {
    expect(() => parseSprite(["XX", "X"])).toThrow();
  });
});

describe("drawSprite", () => {
  it("calls fillRect only for lit pixels, scaled", () => {
    const sprite: Sprite = parseSprite(["X.X", ".X."]);
    const { ctx, calls } = makeFakeCtx();
    drawSprite(ctx, sprite, 10, 20, 1);
    expect(calls.length).toBe(3);
    expect(calls).toContainEqual([10, 20, 1, 1]);
    expect(calls).toContainEqual([12, 20, 1, 1]);
    expect(calls).toContainEqual([11, 21, 1, 1]);
  });

  it("scales each lit pixel by the given scale factor", () => {
    const sprite = parseSprite(["X"]);
    const { ctx, calls } = makeFakeCtx();
    drawSprite(ctx, sprite, 0, 0, 4);
    expect(calls).toEqual([[0, 0, 4, 4]]);
  });
});

describe("invader sprite catalog", () => {
  it("squid is 8x8", () => {
    expect(spriteSquidA.w).toBe(8);
    expect(spriteSquidA.h).toBe(8);
  });

  it("crab is 11x8", () => {
    expect(spriteCrabA.w).toBe(11);
    expect(spriteCrabA.h).toBe(8);
  });

  it("octopus is 12x8", () => {
    expect(spriteOctopusA.w).toBe(12);
    expect(spriteOctopusA.h).toBe(8);
  });

  it("player is 13x8", () => {
    expect(spritePlayer.w).toBe(13);
    expect(spritePlayer.h).toBe(8);
  });
});
