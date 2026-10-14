#!/usr/bin/env bash
# 公開対象アプリの検出。
#
# 使い方:
#   scripts/detect-apps.sh all                  # 全アプリ
#   scripts/detect-apps.sh <base-sha> <head-sha> # 差分で変更のあったアプリだけ
#
# アプリ = リポジトリ直下のフォルダで wrangler.jsonc / wrangler.json / wrangler.toml を持つもの。
# 先頭が "_" や "." のフォルダ (_template など) は対象外。
# 結果は JSON 配列で標準出力に出す。例: ["calc","timer"]
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

all_apps() {
  local d
  for d in */; do
    d="${d%/}"
    case "$d" in _*|.*|node_modules) continue ;; esac
    if [ -f "$d/wrangler.jsonc" ] || [ -f "$d/wrangler.json" ] || [ -f "$d/wrangler.toml" ]; then
      echo "$d"
    fi
  done
}

to_json() { jq -R -s -c 'split("\n") | map(select(length > 0))'; }

mode="${1:-}"
if [ "$mode" = "all" ]; then
  all_apps | to_json
  exit 0
fi

base="${1:-}"
head="${2:-HEAD}"

# 初回 push (before が全0) や、履歴に base が無い場合は全アプリ扱いにする
if [ -z "$base" ] || [[ "$base" =~ ^0+$ ]] || ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  all_apps | to_json
  exit 0
fi

changed="$(git diff --name-only "$base" "$head" | cut -d/ -f1 | sort -u)"
all_apps | while read -r app; do
  if printf '%s\n' "$changed" | grep -qx -- "$app"; then echo "$app"; fi
done | to_json
