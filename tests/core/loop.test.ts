import { describe, expect, it } from "vitest";
import { createBullet } from "../../src/entities/bullet.ts";
import { createBunker } from "../../src/entities/bunker.ts";
import { createPlayer } from "../../src/entities/player.ts";
import { createSwarm } from "../../src/entities/swarm.ts";
import { createGame } from "../../src/core/game.ts";
import { type World, advance, createWorld, type Input } from "../../src/core/loop.ts";

const FIELD = { left: 10, right: 488 } as const;

const makeWorld = (): World =>
  createWorld({
    game: createGame({ startingLives: 3 }),
    player: createPlayer({ field: FIELD, width: 20, y: 240 }),
    swarm: createSwarm({
      rows: 5,
      cols: 11,
      cellW: 16,
      cellH: 12,
      gapX: 4,
      gapY: 4,
      startY: 40,
      field: FIELD,
    }),
    bunkers: [createBunker({ x: 60, y: 200, cols: 22, rows: 16, cellSize: 2 })],
    playerBullets: [],
    invaderBullets: [],
  });

const NO_INPUT: Input = { axis: 0, fire: false };

describe("advance: player bullet hits invader", () => {
  it("removes the invader, removes the bullet, adds score", () => {
    const world = makeWorld();
    const firstInvader = world.swarm.invaders[0];
    expect(firstInvader).toBeDefined();
    if (!firstInvader) return;
    // Spawn a bullet 1px below the first invader, moving up — guaranteed hit on next tick.
    const bullet = createBullet({
      x: firstInvader.x + firstInvader.w / 2,
      y: firstInvader.y + firstInvader.h - 1,
      vy: -10,
      owner: "player",
    });
    const start: World = { ...world, playerBullets: [bullet] };
    const next = advance(start, NO_INPUT, 1 / 60);
    expect(next.swarm.invaders[0]?.alive).toBe(false);
    expect(next.playerBullets.length).toBe(0);
    expect(next.game.score).toBeGreaterThan(0);
  });
});

describe("advance: invader bullet hits player", () => {
  it("decrements lives and clears the offending bullet", () => {
    const world = makeWorld();
    const bullet = createBullet({
      x: world.player.x + world.player.width / 2,
      y: world.player.y - 1,
      vy: 10,
      owner: "invader",
    });
    const start: World = { ...world, invaderBullets: [bullet] };
    const next = advance(start, NO_INPUT, 1 / 60);
    expect(next.game.lives).toBe(2);
    expect(next.invaderBullets.length).toBe(0);
  });
});

describe("advance: bullets that leave the field are pruned", () => {
  it("drops player bullets past the top edge", () => {
    const world = makeWorld();
    const stray = createBullet({ x: 100, y: -5, vy: -1, owner: "player" });
    const next = advance({ ...world, playerBullets: [stray] }, NO_INPUT, 1 / 60);
    expect(next.playerBullets.length).toBe(0);
  });
});

describe("advance: input triggers fire", () => {
  it("creates a player bullet and applies a cooldown", () => {
    const world = makeWorld();
    const next = advance(world, { axis: 0, fire: true }, 1 / 60);
    expect(next.playerBullets.length).toBe(1);
    expect(next.player.fireCooldown).toBeGreaterThan(0);
  });

  it("does not fire while on cooldown", () => {
    const world = makeWorld();
    const after1 = advance(world, { axis: 0, fire: true }, 1 / 60);
    const after2 = advance(after1, { axis: 0, fire: true }, 1 / 60);
    expect(after2.playerBullets.length).toBe(1);
  });
});
