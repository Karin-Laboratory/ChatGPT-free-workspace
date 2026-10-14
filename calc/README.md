# calc

ブラウザで動く関数電卓。 https://apps.karin-lab.com/calc/

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
npm run build   # calc/dist/ に出力 (公開用は node scripts/build.mjs)
```

## 公開の仕組み

リポジトリ直下の `node scripts/build.mjs` が、このアプリのテストとビルドを行って `dist/calc/` にまとめます。
`main` へ push すると Cloudflare が自動で公開します。詳しくは [リポジトリの README](../README.md) を参照してください。
