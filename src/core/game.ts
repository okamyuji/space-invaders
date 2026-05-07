export type GameStatus = "running" | "game-over" | "won";

export type GameState = {
  readonly score: number;
  readonly hiScore: number;
  readonly lives: number;
  readonly wave: number;
  readonly status: GameStatus;
};

export type CreateGameArgs = {
  readonly startingLives: number;
  readonly hiScore?: number;
};

export function createGame({ startingLives, hiScore = 0 }: CreateGameArgs): GameState {
  return {
    score: 0,
    hiScore,
    lives: startingLives,
    wave: 1,
    status: "running",
  };
}

export function addScore(g: GameState, amount: number): GameState {
  const score = g.score + amount;
  const hiScore = score > g.hiScore ? score : g.hiScore;
  return { ...g, score, hiScore };
}

export function killPlayer(g: GameState): GameState {
  const lives = Math.max(0, g.lives - 1);
  const status: GameStatus = lives === 0 ? "game-over" : g.status;
  return { ...g, lives, status };
}

export function nextWave(g: GameState): GameState {
  return { ...g, wave: g.wave + 1 };
}

export function winGame(g: GameState): GameState {
  return { ...g, status: "won" };
}
