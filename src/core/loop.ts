import { type GameState, addScore, killPlayer, nextWave, winGame } from "./game.ts";
import {
  type Bullet,
  bulletRect,
  createBullet,
  isOutOfBounds,
  stepBullet,
} from "../entities/bullet.ts";
import { type Bunker, damageBunker } from "../entities/bunker.ts";
import { type Player, fire, step as stepPlayer } from "../entities/player.ts";
import { type Swarm, aliveCount, killAt, tickSwarm } from "../entities/swarm.ts";
import { intersects, type Rect } from "../utils/aabb.ts";

export type Input = {
  readonly axis: -1 | 0 | 1;
  readonly fire: boolean;
};

export type World = {
  readonly game: GameState;
  readonly player: Player;
  readonly swarm: Swarm;
  readonly bunkers: ReadonlyArray<Bunker>;
  readonly playerBullets: ReadonlyArray<Bullet>;
  readonly invaderBullets: ReadonlyArray<Bullet>;
  readonly stepAccum: number;
};

export type CreateWorldArgs = Omit<World, "stepAccum"> & { readonly stepAccum?: number };

export function createWorld(w: CreateWorldArgs): World {
  return { ...w, stepAccum: w.stepAccum ?? 0 };
}

const PLAYER_SPEED = 140;
const PLAYER_BULLET_SPEED = 360;
const PLAYER_FIRE_COOLDOWN = 0.6;
const PLAYER_H = 8;
const FIELD_TOP = 0;
const FIELD_BOTTOM = 280;
const SWARM_TICK_BASE = 0.6;
// Y at which the invader formation is considered to have reached the ground.
// Matches the green ground line drawn at y=264 in render.ts.
const GROUND_Y = 256;

function playerRect(p: Player): Rect {
  return { x: p.x, y: p.y, w: p.width, h: PLAYER_H };
}

function invaderRectAt(s: Swarm, idx: number): Rect | null {
  const inv = s.invaders[idx];
  if (!inv || !inv.alive) return null;
  return { x: inv.x, y: inv.y, w: inv.w, h: inv.h };
}

function resolvePlayerBulletsVsSwarm(
  bullets: ReadonlyArray<Bullet>,
  swarm: Swarm,
  game: GameState,
): { bullets: Bullet[]; swarm: Swarm; game: GameState } {
  let nextSwarm = swarm;
  let nextGame = game;
  const survivors: Bullet[] = [];
  for (const b of bullets) {
    let consumed = false;
    const br = bulletRect(b);
    for (let i = 0; i < nextSwarm.invaders.length; i++) {
      const r = invaderRectAt(nextSwarm, i);
      if (!r) continue;
      if (intersects(br, r)) {
        const hit = nextSwarm.invaders[i];
        if (hit) nextGame = addScore(nextGame, hit.value);
        nextSwarm = killAt(nextSwarm, i);
        consumed = true;
        break;
      }
    }
    if (!consumed) survivors.push(b);
  }
  return { bullets: survivors, swarm: nextSwarm, game: nextGame };
}

function resolveBulletsVsBunkers(
  bullets: ReadonlyArray<Bullet>,
  bunkers: ReadonlyArray<Bunker>,
): { bullets: Bullet[]; bunkers: Bunker[] } {
  let nextBunkers: Bunker[] = bunkers.slice();
  const survivors: Bullet[] = [];
  for (const b of bullets) {
    let consumed = false;
    const br = bulletRect(b);
    for (let i = 0; i < nextBunkers.length; i++) {
      const target = nextBunkers[i];
      if (!target) continue;
      const result = damageBunker(target, br);
      if (result.hit) {
        nextBunkers[i] = result.bunker;
        consumed = true;
        break;
      }
    }
    if (!consumed) survivors.push(b);
  }
  return { bullets: survivors, bunkers: nextBunkers };
}

function resolveInvadersVsBunkers(swarm: Swarm, bunkers: ReadonlyArray<Bunker>): Bunker[] {
  const next: Bunker[] = bunkers.slice();
  for (const inv of swarm.invaders) {
    if (!inv.alive) continue;
    const r: Rect = { x: inv.x, y: inv.y, w: inv.w, h: inv.h };
    for (let i = 0; i < next.length; i++) {
      const target = next[i];
      if (!target) continue;
      const result = damageBunker(target, r);
      if (result.hit) next[i] = result.bunker;
    }
  }
  return next;
}

function resolveInvaderBulletsVsPlayer(
  bullets: ReadonlyArray<Bullet>,
  player: Player,
  game: GameState,
): { bullets: Bullet[]; game: GameState } {
  if (bullets.length === 0) return { bullets: [], game };
  const pr = playerRect(player);
  const survivors: Bullet[] = [];
  let nextGame = game;
  let hitCount = 0;
  for (const b of bullets) {
    if (intersects(bulletRect(b), pr)) {
      hitCount++;
      continue;
    }
    survivors.push(b);
  }
  for (let i = 0; i < hitCount; i++) nextGame = killPlayer(nextGame);
  return { bullets: survivors, game: nextGame };
}

export function advance(world: World, input: Input, dt: number): World {
  if (world.game.status !== "running") return world;

  // Player movement and firing.
  let player = stepPlayer(world.player, { dt, axis: input.axis }, { speed: PLAYER_SPEED });
  let playerBullets: Bullet[] = world.playerBullets.slice();
  if (input.fire) {
    const result = fire(player, { cooldown: PLAYER_FIRE_COOLDOWN });
    if (result.fired) {
      player = result.player;
      playerBullets.push(
        createBullet({
          x: result.origin.x,
          y: result.origin.y,
          vy: -PLAYER_BULLET_SPEED,
          owner: "player",
        }),
      );
    }
  }

  // Step bullets.
  playerBullets = playerBullets.map((b) => stepBullet(b, dt));
  let invaderBullets = world.invaderBullets.map((b) => stepBullet(b, dt));

  // Step swarm using a stepAccum-based cadence so movement is steady, dt-friendly.
  let swarm = world.swarm;
  let stepAccum = world.stepAccum + dt;
  const alive = aliveCount(swarm);
  const total = swarm.invaders.length || 1;
  const tickInterval = Math.max(0.05, SWARM_TICK_BASE * (alive / total));
  while (stepAccum >= tickInterval) {
    swarm = tickSwarm(swarm, { stepX: 4, stepY: 8 });
    stepAccum -= tickInterval;
  }

  // Collisions: player bullets vs swarm.
  let game = world.game;
  ({
    bullets: playerBullets,
    swarm,
    game,
  } = resolvePlayerBulletsVsSwarm(playerBullets, swarm, game));

  // Collisions: bullets vs bunkers (both directions).
  let bunkers: ReadonlyArray<Bunker> = world.bunkers;
  ({ bullets: playerBullets, bunkers } = resolveBulletsVsBunkers(playerBullets, bunkers));
  ({ bullets: invaderBullets, bunkers } = resolveBulletsVsBunkers(invaderBullets, bunkers));

  // Invaders erode bunkers on contact (1978 rule: aliens destroy shields by touching them).
  bunkers = resolveInvadersVsBunkers(swarm, bunkers);

  // Collisions: invader bullets vs player.
  ({ bullets: invaderBullets, game } = resolveInvaderBulletsVsPlayer(invaderBullets, player, game));

  // Prune off-field bullets.
  const fieldRange = { top: FIELD_TOP, bottom: FIELD_BOTTOM };
  playerBullets = playerBullets.filter((b) => !isOutOfBounds(b, fieldRange));
  invaderBullets = invaderBullets.filter((b) => !isOutOfBounds(b, fieldRange));

  // Lose condition: any alive invader has reached the ground line.
  // 1978 rule: game ends regardless of remaining lives.
  if (swarm.invaders.some((inv) => inv.alive && inv.y + inv.h >= GROUND_Y)) {
    game = { ...game, status: "game-over", lives: 0 };
  } else if (aliveCount(swarm) === 0) {
    // Win condition: cleared the wave.
    game = nextWave(winGame(game));
  }

  return {
    game,
    player,
    swarm,
    bunkers,
    playerBullets,
    invaderBullets,
    stepAccum,
  };
}
