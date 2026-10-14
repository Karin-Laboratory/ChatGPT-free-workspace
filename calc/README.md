# calc-claude

ブラウザで動く関数電卓。 https://calc-claude.karin-lab.com

- 四則演算、べき乗、階乗、%、暗黙の乗算 (`2pi`, `3(4+5)`)
- 三角関数・逆三角関数・双曲線関数 (DEG / RAD 切替)
- `ln` `log` `log2` `exp` `sqrt` `cbrt` `abs` `pow(a,b)` `mod(a,b)` `nroot(n,x)`
- 定数 `pi` `e`、直前の結果 `ans`、履歴 (クリックで再利用)
- `eval` を使わない自前パーサ

## 開発

```sh
npm install
npm run dev     # 開発サーバ
npm test        # 数式エンジンのテスト
npm run build   # dist/ に出力
```

## 公開の仕組み

公開は Cloudflare Workers Builds が行います (Cloudflare ダッシュボードで
`claude-workspace` を接続済み)。`main` への push で `calc/` 以下に変更があると、
ビルドと `wrangler deploy` が走り、`calc-claude.karin-lab.com` に反映されます。
GitHub Actions (リポジトリ直下の `.github/workflows/calc.yml`) はテストとビルドの確認用です。

### Workers Builds の設定

| 項目 | 値 |
| --- | --- |
| プロジェクト名 | `calc-claude` (`wrangler.jsonc` の `name` と一致させる) |
| ルート ディレクトリ | `calc` |
| ビルド コマンド | `npm ci && npm test && npm run build` |
| デプロイ コマンド | `npx wrangler deploy` |
| ビルド監視パス | `calc/*` |

`karin-lab.com` のゾーンが同じ Cloudflare アカウントにあること。
