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

リポジトリ共通のワークフロー (`../.github/workflows/deploy.yml`) が、`main` への push で
このフォルダに変更があるときだけテスト・ビルド・公開を行い、
`calc-claude.karin-lab.com` に反映します。設定は [リポジトリの README](../README.md) を参照してください。
