import { createGame } from "./core/game.ts";
import { createKeyboard } from "./core/input.ts";
import { advance, createWorld, type World } from "./core/loop.ts";
import { render } from "./core/render.ts";
import { createBunker } from "./entities/bunker.ts";
import { createPlayer } from "./entities/player.ts";
import { createSwarm } from "./entities/swarm.ts";

const FIELD = { left: 8, right: 490 } as const;

function freshWorld(hiScore: number): World {
  return createWorld({
    game: createGame({ startingLives: 3, hiScore }),
    player: createPlayer({ field: FIELD, width: 22, y: 244 }),
    swarm: createSwarm({
      rows: 5,
      cols: 11,
      cellW: 14,
      cellH: 10,
      gapX: 4,
      gapY: 4,
      startY: 36,
      field: FIELD,
    }),
    bunkers: [70, 170, 270, 370].map((x) =>
      createBunker({ x, y: 210, cols: 22, rows: 12, cellSize: 2 }),
    ),
    playerBullets: [],
    invaderBullets: [],
  });
}

function main(): void {
  const canvas = document.getElementById("game") as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const keyboard = createKeyboard();
  let world = freshWorld(0);
  let last = performance.now();

  const tick = (now: number): void => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (world.game.status === "game-over" && keyboard.enterPressed()) {
      world = freshWorld(world.game.hiScore);
    } else {
      world = advance(world, keyboard.snapshot(), dt);
    }
    render(ctx, world);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

main();
