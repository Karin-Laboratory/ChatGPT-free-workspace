# claude-workspace 運用ルール

このリポジトリは、Claude との会話だけで Web アプリを次々に作って公開するためのモノレポ。
ユーザーは「〇〇アプリを作って、公開して」と言うだけ。インフラ手順は説明せず、できる操作は確認を挟まず実行する。

## 構成

- 1アプリ = リポジトリ直下の1フォルダ (`calc/`, `timer/` ...)。フォルダ名は小文字英数字とハイフン。
- 公開URLは `https://<フォルダ名>-claude.karin-lab.com`。Worker 名は `<フォルダ名>-claude`。
- `_template/` は新規アプリの雛形 (静的アセット Worker)。`scripts/` は共通スクリプト。
- 公開は `.github/workflows/deploy.yml` が行う。main への push で「変更のあったアプリだけ」を
  検証 → テスト・ビルド → `wrangler deploy` → 公開URLの HTTP 200 確認、まで自動で進む。
  Cloudflare 側での Worker 作成・ドメイン設定は初回デプロイで自動的に行われる (アプリごとの手作業は無い)。

## 「〇〇アプリを作って」と言われたら

1. `scripts/new-app.sh <名前> "<表示タイトル>"` で雛形を作る (既存フォルダは上書きされない)。
2. そのフォルダの中だけでアプリを実装する。ビルドが必要なら `package.json` を置き、
   `npm test` / `npm run build` を用意し、`wrangler.jsonc` の `assets.directory` を出力先に合わせる。
3. ローカルで `scripts/validate-app.sh <名前>` と、(あれば) テスト・ビルドを実行して通す。
4. commit して main に push する。
5. `gh run list -R Karin-Laboratory/claude-workspace --limit 3` と `gh run view <id>` で Actions の結果を見る。
   公開URLの確認は Actions の「公開URLの動作確認」ステップ (HTTP 200 と本文あり) が行う。
   可能なら WebFetch でも公開URLを開いて表示内容を確認する (サンドボックスのシェルから karin-lab.com へは繋がらない)。
6. ユーザーには URL と、実際に確認できた結果だけを報告する。確認できていないことを「できた」と言わない。

## 守ること

- 既存アプリのフォルダや、他の Worker・ドメイン (karin-* や mykeep など) に触れない。
  `validate-app.sh` が name と routes を `<フォルダ名>-claude` 系に限定している。このチェックを緩めない。
- Cloudflare の無料枠に収める。有料サービス・不要な外部 API は使わない。
  KV / D1 / R2 を使うのは必要なときだけで、先にユーザーに一言伝える。
- 認証情報 (API トークン等) をリポジトリ・ログ・会話に書かない。`account_id` も wrangler 設定に書かない。
- 一度公開したアプリの修正も、main への push だけで自動デプロイされる。
- フォルダを削除しても Worker は削除されない (自動では消さない)。消す場合は必ずユーザーに確認する。

## この環境でできないこと (実機で確認済み)

- Actions のシークレット登録: GitHub への API はプロキシで遮断されている。
- Cloudflare API のシェルからの直接実行と API トークンの発行: 遮断または手段なし。
  Cloudflare MCP は Worker・KV・D1・R2 の参照や管理に使えるが、Worker 新規作成やドメイン設定のツールは無い。
- したがって `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` の登録だけは、初回に1回だけユーザーの手作業になる
  (README の「初回セットアップ」)。登録済みかどうかは、Actions の公開ステップが
  「シークレットが未登録」というエラーで落ちるかどうかで分かる。未登録なら、その1回の手順だけを案内する。
- 登録後に、未公開のアプリを公開し直すには、失敗した Actions の実行で「Re-run failed jobs」を押すか、
  「Run workflow」でアプリ名を指定する。
