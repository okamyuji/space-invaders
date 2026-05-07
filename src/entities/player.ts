import { clamp } from "../utils/math.ts";

export type FieldBounds = {
  readonly left: number;
  readonly right: number;
};

export type Player = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly alive: boolean;
  readonly fireCooldown: number;
  readonly field: FieldBounds;
};

export type CreatePlayerArgs = {
  readonly field: FieldBounds;
  readonly width: number;
  readonly y: number;
};

export function createPlayer({ field, width, y }: CreatePlayerArgs): Player {
  const center = (field.left + field.right) / 2 - width / 2;
  return { x: center, y, width, alive: true, fireCooldown: 0, field };
}

export type StepInput = {
  readonly dt: number;
  readonly axis: -1 | 0 | 1;
};

export type StepConfig = {
  readonly speed: number;
};

export function step(player: Player, input: StepInput, config: StepConfig): Player {
  const dx = input.axis * config.speed * input.dt;
  const nextX = clamp(player.x + dx, player.field.left, player.field.right - player.width);
  const nextCooldown = Math.max(0, player.fireCooldown - input.dt);
  return { ...player, x: nextX, fireCooldown: nextCooldown };
}

export type FireResult =
  | {
      readonly fired: true;
      readonly player: Player;
      readonly origin: { readonly x: number; readonly y: number };
    }
  | { readonly fired: false };

export type FireConfig = {
  readonly cooldown: number;
};

export function fire(player: Player, config: FireConfig): FireResult {
  if (!player.alive || player.fireCooldown > 0) {
    return { fired: false };
  }
  return {
    fired: true,
    player: { ...player, fireCooldown: config.cooldown },
    origin: { x: player.x + player.width / 2, y: player.y },
  };
}
