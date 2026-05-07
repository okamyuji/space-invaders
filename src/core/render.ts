import type { World } from "./loop.ts";

const PALETTE = {
  bg: "#000",
  invader: "#ffffff",
  bunker: "#22c55e",
  player: "#22c55e",
  bullet: "#ffffff",
  text: "#ffffff",
} as const;

export function render(ctx: CanvasRenderingContext2D, world: World): void {
  const { canvas } = ctx;
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // HUD.
  ctx.fillStyle = PALETTE.text;
  ctx.font = '8px "Courier New", monospace';
  ctx.textBaseline = "top";
  ctx.fillText("SCORE<1>", 16, 4);
  ctx.fillText(pad(world.game.score, 4), 16, 14);
  ctx.fillText("HI-SCORE", 110, 4);
  ctx.fillText(pad(world.game.hiScore, 4), 116, 14);
  ctx.fillText("SCORE<2>", 200, 4);
  ctx.fillText(pad(0, 4), 210, 14);
  ctx.fillText(`CREDIT 0${world.game.lives.toString().padStart(1, "0")}`, 380, 268);
  ctx.fillText(`${world.game.lives}`, 8, 268);

  // Invaders.
  ctx.fillStyle = PALETTE.invader;
  for (const inv of world.swarm.invaders) {
    if (!inv.alive) continue;
    ctx.fillRect(inv.x, inv.y, inv.w, inv.h);
  }

  // Bunkers.
  ctx.fillStyle = PALETTE.bunker;
  for (const b of world.bunkers) {
    for (let row = 0; row < b.rows; row++) {
      for (let col = 0; col < b.cols; col++) {
        if (!b.cells[row * b.cols + col]) continue;
        ctx.fillRect(b.x + col * b.cellSize, b.y + row * b.cellSize, b.cellSize, b.cellSize);
      }
    }
  }

  // Player.
  if (world.player.alive) {
    ctx.fillStyle = PALETTE.player;
    ctx.fillRect(world.player.x, world.player.y, world.player.width, 8);
  }

  // Bullets.
  ctx.fillStyle = PALETTE.bullet;
  for (const b of world.playerBullets) ctx.fillRect(b.x - 1, b.y, 2, 6);
  for (const b of world.invaderBullets) ctx.fillRect(b.x - 1, b.y, 2, 6);

  // Game-over banner.
  if (world.game.status === "game-over") {
    ctx.fillStyle = PALETTE.text;
    ctx.font = '16px "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 12);
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText("PRESS ENTER TO RESTART", canvas.width / 2, canvas.height / 2 + 8);
    ctx.textAlign = "start";
  }
}

function pad(n: number, width: number): string {
  return n.toString().padStart(width, "0");
}
