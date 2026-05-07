# space-invaders

ローカル単独で動作するSpace Invadersのクローン実装です。
TypeScriptとHTML5 Canvasだけで作っており、[Vite+](https://viteplus.dev/)のツールチェーン上でTDDを徹底しながら開発しました。

このリポジトリはZennの記事「AIペアプロを"バイブ"で終わらせない — TypeScript + TDD + Vite+ で作る規律あるSpace Invaders」と対になっています。

## 特徴

- 純粋なTypeScriptで書かれており、ゲームエンジンも実行時依存も持ちません。
- 内部解像度を498x280に固定したまま、`image-rendering: pixelated`を使ってビューポート全体に拡大表示します。
- 1978年版に忠実な挙動として、侵略者本体が砦に触れるたびに砦が削れる挙動、画面下端への到達で残機の有無に関わらずゲームオーバーになる挙動、生き残りが減るほど編隊の進行が速くなる挙動を実装しています。
- ASCIIアートで定義したスプライトを`parseSprite(["X.X", ".X."])`の一行でパースして`{w, h, bits[]}`に変換する小さなDSLを内蔵しています。
- ユニットテストが72本、Playwrightのスモークテストが2本走り、いずれも緑です。

## ツールスタック

| 用途                 | 採用ツール                                                                            |
| -------------------- | ------------------------------------------------------------------------------------- |
| ビルドと開発サーバー | [Vite 8](https://vite.dev/)を[Vite+](https://viteplus.dev/)経由(`vp`)で利用しています |
| テストランナー       | [Vitest 4](https://vitest.dev/)を`vp test`から呼び出しています                        |
| Linter               | [oxlint](https://oxc.rs/docs/guide/usage/linter)を`vp lint`から呼び出しています       |
| Formatter            | [oxfmt](https://oxc.rs/)を`vp fmt`から呼び出しています                                |
| パッケージマネージャ | [pnpm 10](https://pnpm.io/)をVite+に同梱された形で使っています                        |
| Gitフック管理        | [lefthook 2](https://lefthook.dev/)を採用しました                                     |
| シークレットスキャン | [gitleaks](https://github.com/gitleaks/gitleaks)を採用しました                        |
| End-to-Endテスト     | [Playwright](https://playwright.dev/)を採用しました                                   |
| CI                   | [GitHub Actions](https://docs.github.com/actions)で同等の品質ゲートを動かしています   |

## クイックスタート

依存関係を入れて開発サーバーを起動するだけで動かせます。

```bash
pnpm install            # 依存関係をインストールしてlefthookのフックも登録します
pnpm dev                # http://localhost:5173 で起動します
```

## 品質ゲート

ローカルのpre-commitおよびpre-pushと、CIの双方で全く同じ品質ゲートを通します。

```bash
pnpm run gate
# vp fmt --check && vp lint && tsc --noEmit && vp test run && vp build と等価です
```

pre-commitではこのゲートに先立って`gitleaks protect --staged`が走ります。シークレット混入をリモートに到達する前に止める設計です。

## スクリプト一覧

| スクリプト          | 説明                                                             |
| ------------------- | ---------------------------------------------------------------- |
| `pnpm dev`          | Vite開発サーバーを起動します                                     |
| `pnpm build`        | 本番向けに`dist/`へビルドします                                  |
| `pnpm preview`      | ビルド済みバンドルをローカルで配信します                         |
| `pnpm test`         | Vitestのユニットテストを一度だけ走らせます                       |
| `pnpm test:watch`   | Vitestをウォッチモードで起動します                               |
| `pnpm test:cov`     | V8カバレッジ付きでユニットテストを走らせます                     |
| `pnpm lint`         | oxlintを実行します                                               |
| `pnpm lint:fix`     | oxlintを自動修正モードで実行します                               |
| `pnpm fmt`          | oxfmtでフォーマット差分を確認します                              |
| `pnpm fmt:write`    | oxfmtでフォーマットを上書きします                                |
| `pnpm typecheck`    | `tsc --noEmit`で型チェックします                                 |
| `pnpm gate`         | フォーマット、Lint、型チェック、テスト、ビルドを直列で実行します |
| `pnpm test:e2e`     | Playwrightのe2eを実行します                                      |
| `pnpm test:all`     | ユニットテストとe2eをまとめて実行します                          |
| `pnpm secrets:scan` | 作業ツリー全体に対してgitleaksを走らせます                       |

## ディレクトリ構成

リポジトリ全体の見取り図を示します。

```
src/
├── core/
│   ├── game.ts        スコア、ハイスコア、ライフ、ステータスの純粋なドメイン状態
│   ├── input.ts       キーボード入力のアダプタ
│   ├── loop.ts        毎フレームの世界状態を遷移させる関数
│   ├── render.ts      Canvas2Dへの描画
│   └── sprites.ts     ASCIIピクセルアートDSLとスプライトカタログ
├── entities/
│   ├── bullet.ts      弾の更新と画面外判定
│   ├── bunker.ts      砦のセル単位破壊
│   ├── player.ts      自機の移動と発射クールダウン
│   └── swarm.ts       5x11編隊の左右移動と端到達時の降下
├── utils/
│   ├── aabb.ts        矩形の重なり判定
│   └── math.ts        clampユーティリティ
└── main.ts            requestAnimationFrameループとワイヤリング

tests/                 src/と同じ階層を辿るVitestのユニットテスト
e2e/                   Playwrightのスモークテスト
.github/workflows/     CI(gitleaks、品質ゲート、Playwright)
lefthook.yml           pre-commit、pre-push、commit-msgの設定
.gitleaks.toml         シークレットスキャン設定
```

## 操作方法

| キー      | 動作                               |
| --------- | ---------------------------------- |
| `←` / `→` | 自機を左右に動かします             |
| `Space`   | 弾を発射します                     |
| `Enter`   | ゲームオーバー後にリスタートします |

## 実装した1978年版の挙動

挙動は[Wikipediaの解説](https://en.wikipedia.org/wiki/Space_Invaders)と[classicgaming.ccのプレイガイド](https://classicgaming.cc/classics/space-invaders/play-guide)を参照して、次のように実装しました。

- 自機の弾と侵略者の弾は、いずれも砦をセル単位で削ります。
- 侵略者本体が砦と重なると、その重なった範囲のセルが削れていきます。
- 編隊が画面端に到達すると進行方向を反転し、同時に1段降下します。
- 編隊の進行速度は、生き残りの侵略者数が減るほど速くなります。
- 生きている侵略者のいずれかが地面ラインに到達した瞬間、残機の有無に関わらずゲームオーバーになります。
- 編隊を全滅させるとウェーブクリアになります。

## TDDの記録

各モジュールはRed→Green→Refactorのサイクルで作りました。テストは`src/`と同じ階層を辿るように`tests/`配下に置いています。要点を抜き出すと次の通りです。

- `intersects`は重なり、辺接触(開区間)、内包、対称性をテストでカバーしています。
- `Player`は境界クランプ、発射クールダウンの減衰、不変更新をテストでカバーしています。
- `Swarm`は左右両方向のエッジバウンス、降下挙動、2フレームのアニメーション切り替えをテストでカバーしています。
- `Bunker`はセル削れ、ミス、削れ済みへの再ヒットをテストでカバーしています。
- `advance`は弾と侵略者の衝突によるスコア加算、侵略者弾と自機の衝突、降下侵略者による砦削れ、地面到達によるゲームオーバーをテストでカバーしています。

## ライセンス

MITライセンスで公開しています。詳細は[LICENSE](./LICENSE)ファイルをご覧ください。
