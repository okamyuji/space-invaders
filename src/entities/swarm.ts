import type { Rect } from "../utils/aabb.ts";
import type { FieldBounds } from "./player.ts";

export type Invader = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly row: number;
  readonly col: number;
  readonly value: number;
  readonly alive: boolean;
};

export type SwarmDir = -1 | 1;

export type Swarm = {
  readonly invaders: ReadonlyArray<Invader>;
  readonly dir: SwarmDir;
  readonly field: FieldBounds;
  readonly frame: 0 | 1;
};

export type SwarmConfig = {
  readonly rows: number;
  readonly cols: number;
  readonly cellW: number;
  readonly cellH: number;
  readonly gapX: number;
  readonly gapY: number;
  readonly startY: number;
  readonly field: FieldBounds;
};

const ROW_VALUES = [30, 20, 20, 10, 10] as const;

function valueForRow(row: number): number {
  return ROW_VALUES[row] ?? 10;
}

export function createSwarm(cfg: SwarmConfig): Swarm {
  const totalW = cfg.cols * cfg.cellW + (cfg.cols - 1) * cfg.gapX;
  const startX = (cfg.field.left + cfg.field.right) / 2 - totalW / 2;
  const invaders: Invader[] = [];
  for (let row = 0; row < cfg.rows; row++) {
    for (let col = 0; col < cfg.cols; col++) {
      invaders.push({
        x: startX + col * (cfg.cellW + cfg.gapX),
        y: cfg.startY + row * (cfg.cellH + cfg.gapY),
        w: cfg.cellW,
        h: cfg.cellH,
        row,
        col,
        value: valueForRow(row),
        alive: true,
      });
    }
  }
  return { invaders, dir: 1, field: cfg.field, frame: 0 };
}

export function aliveCount(s: Swarm): number {
  let n = 0;
  for (const inv of s.invaders) {
    if (inv.alive) n++;
  }
  return n;
}

export function killAt(s: Swarm, index: number): Swarm {
  const target = s.invaders[index];
  if (!target || !target.alive) return s;
  const next = s.invaders.slice();
  next[index] = { ...target, alive: false };
  return { ...s, invaders: next };
}

export function swarmRect(s: Swarm): Rect | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let any = false;
  for (const inv of s.invaders) {
    if (!inv.alive) continue;
    any = true;
    if (inv.x < minX) minX = inv.x;
    if (inv.y < minY) minY = inv.y;
    if (inv.x + inv.w > maxX) maxX = inv.x + inv.w;
    if (inv.y + inv.h > maxY) maxY = inv.y + inv.h;
  }
  if (!any) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export type TickConfig = {
  readonly stepX: number;
  readonly stepY: number;
};

export function tickSwarm(s: Swarm, cfg: TickConfig): Swarm {
  const rect = swarmRect(s);
  if (!rect) return s;
  const nextFrame: 0 | 1 = s.frame === 0 ? 1 : 0;
  const dx = s.dir * cfg.stepX;
  const wouldExceedRight = s.dir === 1 && rect.x + rect.w + dx > s.field.right;
  const wouldExceedLeft = s.dir === -1 && rect.x + dx < s.field.left;
  if (wouldExceedRight || wouldExceedLeft) {
    const nextDir: SwarmDir = s.dir === 1 ? -1 : 1;
    const invaders = s.invaders.map((inv) => ({ ...inv, y: inv.y + cfg.stepY }));
    return { ...s, dir: nextDir, invaders, frame: nextFrame };
  }
  const invaders = s.invaders.map((inv) => ({ ...inv, x: inv.x + dx }));
  return { ...s, invaders, frame: nextFrame };
}
