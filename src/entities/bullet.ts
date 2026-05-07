import type { Rect } from "../utils/aabb.ts";

export type BulletOwner = "player" | "invader";

export type Bullet = {
  readonly x: number;
  readonly y: number;
  readonly vy: number;
  readonly owner: BulletOwner;
  readonly alive: boolean;
};

export type CreateBulletArgs = {
  readonly x: number;
  readonly y: number;
  readonly vy: number;
  readonly owner: BulletOwner;
  readonly alive?: boolean;
};

export function createBullet({ x, y, vy, owner, alive = true }: CreateBulletArgs): Bullet {
  return { x, y, vy, owner, alive };
}

export function stepBullet(b: Bullet, dt: number): Bullet {
  return { ...b, y: b.y + b.vy * dt };
}

export type BulletField = {
  readonly top: number;
  readonly bottom: number;
};

export function isOutOfBounds(b: Bullet, field: BulletField): boolean {
  return b.y < field.top || b.y > field.bottom;
}

const BULLET_W = 2;
const BULLET_H = 6;

export function bulletRect(b: Bullet): Rect {
  return { x: b.x - BULLET_W / 2, y: b.y, w: BULLET_W, h: BULLET_H };
}
