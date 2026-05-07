import { describe, expect, it } from "vitest";
import { addScore, createGame, type GameState, killPlayer, nextWave } from "../../src/core/game.ts";

const baseGame = (): GameState => createGame({ startingLives: 3 });

describe("createGame", () => {
  it("starts with score 0, lives = startingLives, wave 1, status running", () => {
    const g = baseGame();
    expect(g.score).toBe(0);
    expect(g.lives).toBe(3);
    expect(g.wave).toBe(1);
    expect(g.status).toBe("running");
    expect(g.hiScore).toBe(0);
  });

  it("accepts a starting hi-score", () => {
    const g = createGame({ startingLives: 3, hiScore: 1234 });
    expect(g.hiScore).toBe(1234);
  });
});

describe("addScore", () => {
  it("adds the given amount to the running score", () => {
    const g = addScore(baseGame(), 30);
    expect(g.score).toBe(30);
  });

  it("updates hi-score when the score surpasses it", () => {
    const g = addScore(addScore(baseGame(), 30), 100);
    expect(g.hiScore).toBe(130);
  });

  it("preserves hi-score when the score is below it", () => {
    const g = createGame({ startingLives: 3, hiScore: 500 });
    const next = addScore(g, 30);
    expect(next.hiScore).toBe(500);
  });
});

describe("killPlayer", () => {
  it("decrements lives", () => {
    const g = killPlayer(baseGame());
    expect(g.lives).toBe(2);
    expect(g.status).toBe("running");
  });

  it("ends the game when lives reach 0", () => {
    let g = baseGame();
    for (let i = 0; i < 3; i++) g = killPlayer(g);
    expect(g.lives).toBe(0);
    expect(g.status).toBe("game-over");
  });

  it("never produces negative lives", () => {
    let g = baseGame();
    for (let i = 0; i < 5; i++) g = killPlayer(g);
    expect(g.lives).toBe(0);
  });
});

describe("nextWave", () => {
  it("increments wave number and keeps the score", () => {
    const g = nextWave(addScore(baseGame(), 50));
    expect(g.wave).toBe(2);
    expect(g.score).toBe(50);
  });
});
