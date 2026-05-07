import type { World } from "./loop.ts";
import { drawSprite, invaderSpritesByRow, spritePlayer } from "./sprites.ts";

const PALETTE = {
  bg: "#000",
  squid: "#ffffff",
  crab: "#22c55e",
  octopus: "#22d3ee",
  bunker: "#22c55e",
  player: "#22c55e",
  bullet: "#ffffff",
  text: "#ffffff",
} as const;

const ROW_COLORS = [PALETTE.squid, PALETTE.crab, PALETTE.crab, PALETTE.octopus, PALETTE.octopus];

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
  ctx.fillText("HI-SCORE", 200, 4);
  ctx.fillText(pad(world.game.hiScore, 4), 210, 14);
  ctx.fillText("SCORE<2>", 380, 4);
  ctx.fillText(pad(0, 4), 388, 14);
  ctx.fillText(`CREDIT 0${world.game.lives.toString().padStart(1, "0")}`, 380, 268);
  ctx.fillText(`${world.game.lives}`, 8, 268);

  // Ground line under the bunkers (classic 1978 look).
  ctx.fillStyle = PALETTE.player;
  ctx.fillRect(8, 264, canvas.width - 16, 1);

  // Invaders — 8x8 / 11x8 / 12x8 sprites scaled to fit each cell.
  for (const inv of world.swarm.invaders) {
    if (!inv.alive) continue;
    const frames = invaderSpritesByRow[inv.row];
    if (!frames) continue;
    const sprite = frames[world.swarm.frame];
    ctx.fillStyle = ROW_COLORS[inv.row] ?? PALETTE.squid;
    const scale = 1;
    const offsetX = Math.floor((inv.w - sprite.w * scale) / 2);
    const offsetY = Math.floor((inv.h - sprite.h * scale) / 2);
    drawSprite(ctx, sprite, inv.x + offsetX, inv.y + offsetY, scale);
  }

  // Bunkers — pixel grid (already pixel-art).
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
    const scale = Math.max(1, Math.floor(world.player.width / spritePlayer.w));
    const offsetX = Math.floor((world.player.width - spritePlayer.w * scale) / 2);
    drawSprite(ctx, spritePlayer, world.player.x + offsetX, world.player.y, scale);
  }

  // Bullets.
  ctx.fillStyle = PALETTE.bullet;
  for (const b of world.playerBullets) ctx.fillRect(b.x - 1, b.y, 2, 6);
  for (const b of world.invaderBullets) ctx.fillRect(b.x - 1, b.y, 2, 6);

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
