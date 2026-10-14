import { evaluate, format } from "./calc.js";

const $ = (id) => document.getElementById(id);
const exprEl = $("expr");
const resultEl = $("result");
const errorEl = $("error");
const historyEl = $("history");
const angleBtn = $("angle");

let angle = "deg";
let ans = 0;
let justEvaluated = false;

try {
  const saved = localStorage.getItem("calc.angle");
  if (saved === "deg" || saved === "rad") angle = saved;
} catch {
  /* localStorage が使えない環境では無視 */
}
renderAngle();

function renderAngle() {
  angleBtn.textContent = angle.toUpperCase();
}

function showError(msg) {
  errorEl.hidden = !msg;
  errorEl.textContent = msg || "";
}

function preview() {
  const src = exprEl.value;
  if (!src.trim()) {
    resultEl.textContent = "0";
    showError("");
    return;
  }
  try {
    resultEl.textContent = format(evaluate(src, { angle, ans }));
    showError("");
  } catch {
    // 入力途中の式ではエラーを出さず、結果だけ保持する
  }
}

function insert(text) {
  if (justEvaluated) {
    // 演算子なら結果に続けて入力、それ以外は新しい式を開始
    if (/^[+\-*/^!%]/.test(text)) exprEl.value = "ans";
    else exprEl.value = "";
    justEvaluated = false;
  }
  const el = exprEl;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, start) + text + el.value.slice(end);
  const caret = start + text.length;
  el.setSelectionRange(caret, caret);
  preview();
}

function backspace() {
  justEvaluated = false;
  const el = exprEl;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  if (start !== end) {
    el.value = el.value.slice(0, start) + el.value.slice(end);
    el.setSelectionRange(start, start);
  } else if (start > 0) {
    el.value = el.value.slice(0, start - 1) + el.value.slice(start);
    el.setSelectionRange(start - 1, start - 1);
  }
  preview();
}

function clearAll() {
  exprEl.value = "";
  justEvaluated = false;
  resultEl.textContent = "0";
  showError("");
}

function negate() {
  const v = exprEl.value.trim();
  exprEl.value = v.startsWith("-(") && v.endsWith(")") ? v.slice(2, -1) : `-(${v})`;
  preview();
}

function addHistory(src, out) {
  const li = document.createElement("li");
  li.textContent = `${src} = ${out}`;
  li.title = "クリックで式を再利用";
  li.addEventListener("click", () => {
    exprEl.value = src;
    justEvaluated = false;
    exprEl.focus();
    preview();
  });
  historyEl.append(li);
  while (historyEl.children.length > 30) historyEl.firstElementChild.remove();
  historyEl.scrollTop = historyEl.scrollHeight;
}

function run() {
  const src = exprEl.value;
  if (!src.trim()) return;
  try {
    const value = evaluate(src, { angle, ans });
    const out = format(value);
    resultEl.textContent = out;
    showError("");
    addHistory(src, out);
    if (Number.isFinite(value)) ans = value;
    justEvaluated = true;
  } catch (e) {
    showError(e.message);
  }
}

$("pad").addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  if (btn.dataset.ins != null) insert(btn.dataset.ins);
  else if (btn.dataset.act === "eval") run();
  else if (btn.dataset.act === "back") backspace();
  else if (btn.dataset.act === "clear") clearAll();
  else if (btn.dataset.act === "neg") negate();
});

angleBtn.addEventListener("click", () => {
  angle = angle === "deg" ? "rad" : "deg";
  try {
    localStorage.setItem("calc.angle", angle);
  } catch {
    /* 無視 */
  }
  renderAngle();
  preview();
});

exprEl.addEventListener("input", () => {
  justEvaluated = false;
  preview();
});

exprEl.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    ev.preventDefault();
    run();
  } else if (ev.key === "Escape") {
    clearAll();
  }
});

// 入力欄以外にフォーカスがあっても数字キーで入力できるようにする
document.addEventListener("keydown", (ev) => {
  if (ev.target === exprEl || ev.ctrlKey || ev.metaKey || ev.altKey) return;
  if (ev.target instanceof HTMLButtonElement && (ev.key === "Enter" || ev.key === " ")) return;
  if (ev.key === "Enter") {
    ev.preventDefault();
    run();
  } else if (ev.key.length === 1) {
    exprEl.focus();
  }
});

exprEl.focus();
