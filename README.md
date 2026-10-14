# claude-workspace

Claude との会話で作った Web アプリを、フォルダ単位で管理して Cloudflare Workers に公開するモノレポ。

| アプリ | 公開URL |
| --- | --- |
| [calc](calc/) 関数電卓 | https://calc-claude.karin-lab.com |

- 1アプリ = 直下の1フォルダ。公開URLは `https://<フォルダ名>-claude.karin-lab.com`
- `main` へ push すると、変更のあったアプリだけが自動でテスト・ビルド・公開される
- 新しいアプリは `scripts/new-app.sh <名前> "<タイトル>"` で `_template/` から作る
- 運用ルールは [CLAUDE.md](CLAUDE.md) を参照

## 初回セットアップ (1回だけ)

アプリごとの設定は不要。以下はリポジトリ全体で1回だけ行う。

1. Cloudflare ダッシュボード → My Profile → API Tokens → Create Token
   → テンプレート「Edit Cloudflare Workers」。ゾーンは `karin-lab.com` を含める
   (Account: Workers Scripts 編集 / Zone: Workers Routes 編集 が含まれる)
2. GitHub のリポジトリ → Settings → Secrets and variables → Actions → New repository secret
   - `CLOUDFLARE_API_TOKEN`: 手順1で作ったトークン
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare ダッシュボード URL の `dash.cloudflare.com/` の直後の文字列
3. Actions タブで、失敗している最新の実行を開き「Re-run failed jobs」を押す
   (登録前に push した分のアプリが、これで公開される)

## 公開の仕組み

`.github/workflows/deploy.yml` が、直下に `wrangler.jsonc` を持つフォルダをアプリとして扱う。

1. 変更のあったアプリを検出 (`scripts/detect-apps.sh`)
2. 公開ルールを検証 (`scripts/validate-app.sh`): Worker 名とドメインは `<フォルダ名>-claude` 系のみ許可
3. `package.json` があれば `npm ci` / `npm test` / `npm run build`
4. `wrangler deploy` (Worker とカスタムドメインは初回デプロイで自動作成)
5. 公開URLが HTTP 200 を返すか確認

プルリクエストでは 1〜3 だけを行い、公開はしない。
