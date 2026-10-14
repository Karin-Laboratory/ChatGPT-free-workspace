#!/usr/bin/env bash
# 新しいアプリのフォルダを _template から作る。
#
# 使い方: scripts/new-app.sh <アプリ名> [表示タイトル]
#   例:   scripts/new-app.sh timer "タイマー"
#
# 公開URLは https://apps.karin-lab.com/<アプリ名>/ になる。
# 既存のフォルダは絶対に上書きしない。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

name="${1:?使い方: new-app.sh <アプリ名> [表示タイトル]}"
title="${2:-$name}"

if [[ ! "$name" =~ ^[a-z][a-z0-9-]{0,40}$ ]]; then
  echo "NG: アプリ名 '$name' は小文字英数字とハイフンのみ (先頭は英字, 41文字以内)" >&2
  exit 1
fi
case "$name" in
  scripts|dist|node_modules) echo "NG: '$name' は予約名です" >&2; exit 1 ;;
esac
if [ -e "$name" ]; then
  echo "NG: '$name' は既に存在します (既存アプリは変更しません)" >&2
  exit 1
fi

cp -r _template "$name"

python3 - "$name" "$title" <<'PY'
import html, json, pathlib, sys
name, title = sys.argv[1:3]
for p in pathlib.Path(name).rglob("*"):
    if not p.is_file():
        continue
    s = p.read_text(encoding="utf-8")
    if p.suffix == ".json":
        s = s.replace("__TITLE__", json.dumps(title, ensure_ascii=False)[1:-1])
    else:
        s = s.replace("__TITLE__", html.escape(title))
    p.write_text(s.replace("__APP__", name), encoding="utf-8")
PY

echo "作成しました: $name/ (公開URL: https://apps.karin-lab.com/$name/)"
echo "次: $name/ の中でアプリを実装し、node scripts/build.mjs で全体をビルドしてください"
