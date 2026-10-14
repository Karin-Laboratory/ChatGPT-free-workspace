# claude-workspace 運用ルール

Claude との会話だけで Web アプリを次々に作って公開するためのモノレポ。
ユーザー (初心者を想定) は「〇〇アプリを作って、公開して」と言うだけ。
インフラの手順は説明せず、AI にできる操作は確認を挟まず実行する。

## 仕組み

- 1アプリ = リポジトリ直下の1フォルダ (`calc/`, `timer/` ...)。フォルダ名は小文字英数字とハイフン。
- **Cloudflare の Worker は1つだけ** (`claude-workspace`)。`dist/` を静的アセットとして配信し、
  公開URLは `https://apps.karin-lab.com/<フォルダ名>/`。アプリを足しても Cloudflare 側の設定は増えない。
- Cloudflare の Workers Builds が GitHub に接続済みで、`main` への push のたびに `dist/` を自動デプロイする
  (ビルドコマンドは使わない。`dist/` はコミット済みの完成品を配信する)。
- `dist/` は `node scripts/build.mjs` が生成する。**手で編集しない。** 全アプリのテストとビルドが全部通ったときだけ
  入れ替わるので、1つのアプリが壊れても公開中のものは壊れない。
- GitHub Actions (`.github/workflows/ci.yml`) は検証専用。同じビルドを再実行し、`dist/` のコミット漏れとテスト失敗を検出する。

## 「〇〇アプリを作って」と言われたら

1. `scripts/new-app.sh <名前> "<表示タイトル>"` で雛形を作る (既存フォルダは上書きされない)。
2. そのフォルダの中だけでアプリを実装する。
   - 既定はビルド不要の静的アプリ: `<名前>/public/index.html` (CSS・JS も `public/` に置く)。
   - ビルドが必要なら `<名前>/package.json` に `build` (と `test`) を用意し、出力先を `<名前>/dist` にする。
     Vite なら `base: "./"` にする。
   - アセットの参照は必ず相対パスにする (アプリは `/<名前>/` の下で配信される)。
   - 表示名と説明は `<名前>/app.json` の `title` / `description` (トップページに載る)。
3. `node scripts/build.mjs` を実行して、全アプリのテストとビルドを通す。`dist/` が更新される。
4. `dist/` を含めて commit し、`main` に push する。
5. `gh run list -R Karin-Laboratory/claude-workspace --limit 3` で CI の結果を確認する。
6. ユーザーには URL と、**実際に確認できたことだけ**を報告する。
   Workers Builds のログは見られない。公開URLを開けないときは、公開済みとは言わず「未確認」と伝える。

## 守ること

- 他のアプリのフォルダ、`wrangler.jsonc`、`dist/` の手編集、`.github/` には、頼まれない限り触れない。
- Cloudflare の無料枠に収める。静的アセットの配信は無料。1バージョンあたり 20,000 ファイル・1ファイル 25MiB まで。
  有料サービス、不要な外部 API、サーバー側の処理 (Worker のコード・KV・D1・R2) は、先にユーザーに確認する。
- リポジトリは公開。API キーなどの秘密情報をファイルに書かない。
- アプリを消すときはフォルダを削除して `node scripts/build.mjs` を実行し、`dist/` も一緒にコミットする。

## この環境でできないこと (実機で確認済み)

- Cloudflare 側の初回接続 (Workers Builds のプロジェクト作成): Cloudflare MCP に作成ツールが無く、
  シェルから Cloudflare API へは繋がらない。ダッシュボードで1回だけ、ユーザーの操作が必要 (README 参照)。
- GitHub Actions のシークレット登録: API がプロキシで遮断されている。この仕組みはシークレットを使わない。
- Cloudflare の API トークンの発行: 手段が無い。この仕組みは Workers Builds が自動作成するトークンを使う。
- 初回接続が済んでいなければ、公開は行われていない。その場合は README の「初回セットアップ」の1回分だけを案内する。
