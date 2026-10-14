#!/usr/bin/env node
// 全アプリをビルドして dist/ にまとめる。Cloudflare は dist/ をそのまま配信する。
//
// 使い方: node scripts/build.mjs
//
// アプリ = リポジトリ直下のフォルダで、次のどちらかを満たすもの
//   - package.json に "build" スクリプトがある (ビルド結果は <アプリ>/dist)
//   - public/index.html がある (public/ をそのまま配信)
// 先頭が "_" や "." のフォルダ、scripts / dist / node_modules は対象外。
// <アプリ>/app.json に {"title": "...", "description": "..."} を置くと、トップページに表示される。
//
// どれか1つでも失敗したら dist/ は変更しない (公開中のアプリが壊れないようにするため)。
import { spawnSync } from "node:child_process";
import {
  cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const tmpDir = join(root, ".dist-tmp");
const SKIP = new Set(["scripts", "dist", "node_modules"]);
const NAME_RE = /^[a-z][a-z0-9-]{0,40}$/;

const fail = (msg) => {
  console.error(`\nNG: ${msg}`);
  rmSync(tmpDir, { recursive: true, force: true });
  process.exit(1);
};

const run = (cmd, args, cwd) => {
  console.log(`\n$ (${cwd.replace(root, ".") || "."}) ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) fail(`${cmd} ${args.join(" ")} が失敗しました (${cwd.replace(root, ".")})`);
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function discoverApps() {
  const apps = [];
  for (const e of readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith("_") || e.name.startsWith(".") || SKIP.has(e.name)) continue;
    const dir = join(root, e.name);
    const pkgPath = join(dir, "package.json");
    const hasPublic = existsSync(join(dir, "public", "index.html"));
    let hasBuild = false;
    if (existsSync(pkgPath)) {
      try {
        hasBuild = Boolean(JSON.parse(readFileSync(pkgPath, "utf-8")).scripts?.build);
      } catch {
        fail(`${e.name}/package.json を解析できません`);
      }
    }
    if (!hasBuild && !hasPublic) continue; // アプリではないフォルダ
    if (!NAME_RE.test(e.name)) fail(`フォルダ名 '${e.name}' は小文字英数字とハイフンのみ (先頭は英字, 41文字以内)`);
    let meta = {};
    const metaPath = join(dir, "app.json");
    if (existsSync(metaPath)) {
      try {
        meta = JSON.parse(readFileSync(metaPath, "utf-8"));
      } catch {
        fail(`${e.name}/app.json を解析できません`);
      }
    }
    apps.push({
      name: e.name,
      dir,
      hasBuild,
      title: meta.title || e.name,
      description: meta.description || "",
    });
  }
  return apps.sort((a, b) => a.name.localeCompare(b.name));
}

function portalHtml(apps) {
  const cards = apps
    .map(
      (a) => `      <li><a href="./${a.name}/"><strong>${esc(a.title)}</strong>` +
        (a.description ? `<span>${esc(a.description)}</span>` : "") + `</a></li>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <title>アプリ一覧</title>
  <style>
    :root { --bg: #f4f5f7; --panel: #fff; --ink: #1b1f27; --muted: #6a7280; --line: #dfe3ea; }
    @media (prefers-color-scheme: dark) { :root { --bg: #14171c; --panel: #1d2128; --ink: #eceff4; --muted: #98a1b0; --line: #2b313b; } }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif; }
    main { max-width: 640px; margin: 0 auto; padding: 32px 16px; }
    h1 { font-size: 20px; margin: 0 0 20px; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    a { display: grid; gap: 4px; padding: 14px 16px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; color: inherit; text-decoration: none; }
    a:hover { border-color: var(--muted); }
    span { font-size: 13px; color: var(--muted); }
  </style>
</head>
<body>
  <main>
    <h1>アプリ一覧</h1>
    <ul>
${cards}
    </ul>
  </main>
</body>
</html>
`;
}

const notFoundHtml = `<!doctype html>
<html lang="ja">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>見つかりません</title></head>
<body style="font-family: system-ui, sans-serif; padding: 32px;">
  <h1>ページが見つかりません</h1>
  <p><a href="/">アプリ一覧へ</a></p>
</body>
</html>
`;

const apps = discoverApps();
if (apps.length === 0) fail("アプリが1つも見つかりません");

rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });

for (const app of apps) {
  console.log(`\n=== ${app.name} ===`);
  let outDir = join(app.dir, "public");
  if (app.hasBuild) {
    const hasLock = existsSync(join(app.dir, "package-lock.json"));
    run("npm", [hasLock ? "ci" : "install", "--no-audit", "--no-fund"], app.dir);
    run("npm", ["test", "--if-present"], app.dir);
    run("npm", ["run", "build"], app.dir);
    outDir = join(app.dir, "dist");
  }
  if (!existsSync(join(outDir, "index.html"))) {
    fail(`${app.name}: ${outDir.replace(root, ".")}/index.html がありません`);
  }
  cpSync(outDir, join(tmpDir, app.name), { recursive: true });
}

writeFileSync(join(tmpDir, "index.html"), portalHtml(apps));
writeFileSync(join(tmpDir, "404.html"), notFoundHtml);
writeFileSync(
  join(tmpDir, "apps.json"),
  JSON.stringify(
    { apps: apps.map((a) => ({ name: a.name, title: a.title, path: `/${a.name}/` })) },
    null,
    2,
  ) + "\n",
);

// すべて成功したときだけ入れ替える
rmSync(distDir, { recursive: true, force: true });
renameSync(tmpDir, distDir);
console.log(`\nOK: ${apps.length} 個のアプリを dist/ にまとめました: ${apps.map((a) => a.name).join(", ")}`);
