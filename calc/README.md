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

`main` への push (`calc/` 以下の変更時) で GitHub Actions (リポジトリ直下の `.github/workflows/calc.yml`) が
テスト → ビルド → `wrangler deploy` を実行し、Cloudflare Workers の
静的アセットとして `calc-claude.karin-lab.com` に公開します。
プルリクエストではテストとビルドのみ実行します。

### 初回セットアップ

1. Cloudflare に `karin-lab.com` のゾーンがあることを確認する
2. Cloudflare の API トークンを作成する (テンプレート「Edit Cloudflare Workers」)
3. GitHub リポジトリの Settings → Secrets and variables → Actions に登録する
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. `main` に push する (初回デプロイ時にカスタムドメインの DNS レコードと証明書が自動作成される)
