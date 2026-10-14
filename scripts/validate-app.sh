#!/usr/bin/env bash
# 公開前の安全確認。ルール違反があれば非0で終了する。
#
# 使い方: scripts/validate-app.sh <アプリのフォルダ名>
#
# ルール:
#   - フォルダ名は小文字英数字とハイフン (先頭は英字)
#   - wrangler.jsonc の name は "<フォルダ名>-claude"
#   - routes は custom_domain の1件だけで、ホスト名は "<フォルダ名>-claude.karin-lab.com"
#   - account_id / zone_id / 絶対パスや ".." を含む assets.directory は禁止
# これにより、別アプリや既存の Worker・ドメインを誤って上書きできなくなる。
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

app="${1:?使い方: validate-app.sh <アプリのフォルダ名>}"
app="${app%/}"
domain_suffix="karin-lab.com"

if [[ ! "$app" =~ ^[a-z][a-z0-9-]{0,40}$ ]]; then
  echo "NG: フォルダ名 '$app' は小文字英数字とハイフンのみ (先頭は英字, 41文字以内)" >&2
  exit 1
fi
if [ ! -d "$app" ]; then
  echo "NG: フォルダ '$app' がありません" >&2
  exit 1
fi

cfg=""
for f in wrangler.jsonc wrangler.json; do
  if [ -f "$app/$f" ]; then cfg="$app/$f"; break; fi
done
if [ -z "$cfg" ]; then
  echo "NG: $app/wrangler.jsonc がありません (wrangler.toml は非対応)" >&2
  exit 1
fi

python3 - "$app" "$cfg" "$domain_suffix" <<'PY'
import json, sys

app, cfg, suffix = sys.argv[1:4]
text = open(cfg, encoding="utf-8").read()

def strip_jsonc(src: str) -> str:
    """コメントと末尾カンマを (文字列の中身には触れずに) 取り除く。"""
    out, i, n = [], 0, len(src)
    in_str = False
    while i < n:
        c = src[i]
        if in_str:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(src[i + 1]); i += 2; continue
            if c == '"':
                in_str = False
            i += 1; continue
        if c == '"':
            in_str = True; out.append(c); i += 1; continue
        if src.startswith("//", i):
            while i < n and src[i] != "\n": i += 1
            continue
        if src.startswith("/*", i):
            j = src.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        out.append(c); i += 1
    s = "".join(out)
    # 末尾カンマ除去 (文字列の外だけ)
    res, in_str, i = [], False, 0
    while i < len(s):
        c = s[i]
        if in_str:
            res.append(c)
            if c == "\\" and i + 1 < len(s):
                res.append(s[i + 1]); i += 2; continue
            if c == '"': in_str = False
            i += 1; continue
        if c == '"':
            in_str = True; res.append(c); i += 1; continue
        if c == ",":
            j = i + 1
            while j < len(s) and s[j].isspace(): j += 1
            if j < len(s) and s[j] in "}]":
                i += 1; continue
        res.append(c); i += 1
    return "".join(res)

errors = []
try:
    conf = json.loads(strip_jsonc(text))
except Exception as e:
    print(f"NG: {cfg} を解析できません: {e}", file=sys.stderr)
    sys.exit(1)

expected_name = f"{app}-claude"
expected_host = f"{app}-claude.{suffix}"

if conf.get("name") != expected_name:
    errors.append(f"name は '{expected_name}' にしてください (現在: {conf.get('name')!r})")

if "route" in conf:
    errors.append("'route' は使えません。routes に custom_domain を1件だけ指定してください")
routes = conf.get("routes")
ok_route = (
    isinstance(routes, list) and len(routes) == 1 and isinstance(routes[0], dict)
    and routes[0].get("pattern") == expected_host and routes[0].get("custom_domain") is True
    and set(routes[0]) <= {"pattern", "custom_domain"}
)
if not ok_route:
    errors.append(
        f'routes は [{{ "pattern": "{expected_host}", "custom_domain": true }}] の1件だけにしてください'
    )

for key in ("account_id", "zone_id"):
    if key in conf:
        errors.append(f"'{key}' は書かないでください (認証情報側で決まります)")

assets = conf.get("assets")
if isinstance(assets, dict) and "directory" in assets:
    d = str(assets["directory"])
    if d.startswith("/") or ".." in d.split("/"):
        errors.append(f"assets.directory は アプリ内の相対パスにしてください (現在: {d!r})")

if errors:
    print(f"NG: {cfg}", file=sys.stderr)
    for e in errors:
        print(f"  - {e}", file=sys.stderr)
    sys.exit(1)

print(f"OK: {app} -> https://{expected_host} (Worker: {expected_name})")
PY
