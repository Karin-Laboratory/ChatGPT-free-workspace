# claude-workspace

Claude との会話で作った Web アプリを、フォルダ単位で管理して Cloudflare Workers で公開するモノレポ。
新しいアプリは、Claude に「〇〇アプリを作って、公開して」と頼むだけで追加できる。

| アプリ | 公開URL |
| --- | --- |
| [calc](calc/) 関数電卓 | https://apps.karin-lab.com/calc/ |

一覧ページ: https://apps.karin-lab.com/

## 仕組み

- 1アプリ = 直下の1フォルダ。公開URLは `https://apps.karin-lab.com/<フォルダ名>/`
- Cloudflare の Worker は1つだけ。全アプリの完成品 (`dist/`) をまとめて配信する
- `main` へ push すると、Cloudflare Workers Builds が自動で公開する (GitHub Actions も API トークンも使わない)
- 新しいアプリを足しても、Cloudflare の画面操作・トークン登録・コマンド入力は要らない

## 初回セットアップ (1回だけ)

1. Cloudflare ダッシュボード → Workers & Pages → Create → Import a repository (Continue with GitHub)
2. このリポジトリ (`claude-workspace`) を選ぶ
3. 設定は何も変えずに「デプロイ」を押す
   (プロジェクト名はリポジトリ名のままでよい。`wrangler.jsonc` の `name` と同じ)

公開URLのドメイン (`apps.karin-lab.com`) は `wrangler.jsonc` の `routes` で指定している。
`karin-lab.com` が同じ Cloudflare アカウントにあれば、初回のデプロイで自動的に割り当てられる。
自分のドメインが無い場合は、`routes` を消して `"workers_dev": true` にすると
`https://claude-workspace.<アカウント名>.workers.dev/<フォルダ名>/` で公開される。

## 構成

```text
claude-workspace/
├── calc/            アプリ (1フォルダ = 1アプリ)
├── _template/       新規アプリの雛形
├── scripts/         build.mjs (全アプリのテスト・ビルド・dist 生成), new-app.sh (雛形から作成)
├── dist/            公開される完成品 (build.mjs が生成。手で編集しない)
├── wrangler.jsonc   Worker の設定 (全アプリで共通)
├── CLAUDE.md        Claude 向けの運用ルール
└── .github/workflows/ci.yml   検証専用 (公開はしない)
```
