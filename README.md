# space-invaders

Local-only Space Invaders clone built with TypeScript and HTML5 Canvas, developed
under strict TDD on the [Vite+](https://viteplus.dev/) toolchain.

The repository accompanies the Zenn article
"AIペアプロを"バイブ"で終わらせない — TypeScript + TDD + Vite+ で作る規律あるSpace Invaders".

## Highlights

- Pure TypeScript, no game framework, no runtime dependencies.
- Internal canvas resolution `498x280`, scaled to viewport with `image-rendering: pixelated`.
- 1978-faithful behaviour: invaders erode bunkers on contact, ground reach ends the
  game regardless of remaining lives, swarm cadence accelerates as ranks die.
- Pixel-art sprite DSL: `parseSprite(["X.X", ".X."])` → `{w, h, bits[]}`.
- 72 unit tests + 2 Playwright smoke tests, all green.

## Stack

| Concern            | Tool                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| Build / dev server | [Vite 8](https://vite.dev/) via [Vite+](https://viteplus.dev/) (`vp`) |
| Test runner        | [Vitest 4](https://vitest.dev/) via `vp test`                         |
| Linter             | [oxlint](https://oxc.rs/docs/guide/usage/linter) via `vp lint`        |
| Formatter          | [oxfmt](https://oxc.rs/) via `vp fmt`                                 |
| Package manager    | [pnpm 10](https://pnpm.io/) (bundled with Vite+)                      |
| Git hooks          | [lefthook 2](https://lefthook.dev/)                                   |
| Secret scan        | [gitleaks](https://github.com/gitleaks/gitleaks)                      |
| End-to-end         | [Playwright](https://playwright.dev/)                                 |
| CI                 | [GitHub Actions](https://docs.github.com/actions)                     |

## Quick start

```bash
pnpm install            # installs deps and registers lefthook hooks
pnpm dev                # http://localhost:5173
```

## Quality gate

The same gate runs locally (pre-commit, pre-push) and in CI:

```bash
pnpm run gate
# = vp fmt --check && vp lint && tsc --noEmit && vp test run && vp build
```

Pre-commit additionally runs `gitleaks protect --staged` before any other check,
so secret leaks are blocked before they ever touch a remote.

## Available scripts

| Script              | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `pnpm dev`          | Start the Vite dev server                              |
| `pnpm build`        | Production build to `dist/`                            |
| `pnpm preview`      | Serve the built bundle                                 |
| `pnpm test`         | Run Vitest unit tests once                             |
| `pnpm test:watch`   | Run Vitest in watch mode                               |
| `pnpm test:cov`     | Run Vitest with V8 coverage                            |
| `pnpm lint`         | Run oxlint                                             |
| `pnpm lint:fix`     | Run oxlint with autofix                                |
| `pnpm fmt`          | Check formatting with oxfmt                            |
| `pnpm fmt:write`    | Apply oxfmt formatting                                 |
| `pnpm typecheck`    | `tsc --noEmit`                                         |
| `pnpm gate`         | Full quality gate (fmt + lint + types + tests + build) |
| `pnpm test:e2e`     | Run Playwright e2e                                     |
| `pnpm test:all`     | Run unit + e2e                                         |
| `pnpm secrets:scan` | Run gitleaks on the working tree                       |

## Project structure

```
src/
├── core/
│   ├── game.ts        domain state (score, hi-score, lives, status)
│   ├── input.ts       keyboard adapter
│   ├── loop.ts        per-frame world transition function
│   ├── render.ts      Canvas2D renderer
│   └── sprites.ts     ASCII pixel-art DSL + sprite catalog
├── entities/
│   ├── bullet.ts
│   ├── bunker.ts
│   ├── player.ts
│   └── swarm.ts
├── utils/
│   ├── aabb.ts        rectangle intersection
│   └── math.ts        clamp
└── main.ts            entry point (RAF loop, world wiring)

tests/                 mirrors src/ structure (vitest unit tests)
e2e/                   Playwright smoke tests
.github/workflows/     CI (gitleaks, quality gate, Playwright)
lefthook.yml           local pre-commit / pre-push / commit-msg gate
.gitleaks.toml         secret scan config
```

## Controls

| Key       | Action                  |
| --------- | ----------------------- |
| `←` / `→` | Move the cannon         |
| `Space`   | Fire                    |
| `Enter`   | Restart after game over |

## Game rules implemented

The behaviour follows the original 1978 Taito arcade as documented on
[Wikipedia](https://en.wikipedia.org/wiki/Space_Invaders) and the
[classicgaming.cc Play Guide](https://classicgaming.cc/classics/space-invaders/play-guide):

- Player and invader bullets damage bunkers cell by cell.
- Invaders themselves erode bunkers when descending into them.
- The swarm flips horizontal direction and steps down at the field edges.
- Swarm cadence accelerates as more invaders die.
- The game ends when any alive invader reaches the ground line, regardless of
  remaining lives.
- Wave is cleared when all invaders are killed.

## TDD log

Each module was built with a Red → Green → Refactor cycle. Tests live in
`tests/` mirroring `src/`. Highlights:

- `intersects` covers overlap, edge-touch (open intervals), full containment, and
  symmetry.
- `Player` covers boundary clamp, fire cooldown decay, immutable updates.
- `Swarm` covers edge-bounce + descent in both directions and 2-frame animation
  toggle.
- `Bunker` covers cell erosion, miss, and idempotent re-hits.
- `advance` covers bullet vs invader scoring, invader-vs-player kill, bunker
  erosion by descending invaders, and ground-reach game-over.

## License

MIT.
