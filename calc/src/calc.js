// 関数電卓の数式エンジン (eval を使わない再帰下降パーサ)

const FUNCS = {
  sin: (x, c) => Math.sin(c.toRad(x)),
  cos: (x, c) => Math.cos(c.toRad(x)),
  tan: (x, c) => Math.tan(c.toRad(x)),
  asin: (x, c) => c.fromRad(Math.asin(x)),
  acos: (x, c) => c.fromRad(Math.acos(x)),
  atan: (x, c) => c.fromRad(Math.atan(x)),
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  asinh: (x) => Math.asinh(x),
  acosh: (x) => Math.acosh(x),
  atanh: (x) => Math.atanh(x),
  ln: (x) => Math.log(x),
  log: (x) => Math.log10(x),
  log2: (x) => Math.log2(x),
  exp: (x) => Math.exp(x),
  sqrt: (x) => Math.sqrt(x),
  cbrt: (x) => Math.cbrt(x),
  abs: (x) => Math.abs(x),
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  round: (x) => Math.round(x),
  fact: (x) => factorial(x),
};

const CONSTS = { pi: Math.PI, e: Math.E };

export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) throw new Error("階乗は0以上の整数のみ");
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function tokenize(src) {
  const s = src
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/\s+/g, "");
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/[0-9.]/.test(ch)) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
      if (!m) throw new Error("数値の形式が不正です");
      // 'e' が定数 e と衝突しないよう、指数部は数字が続く場合のみ消費する
      tokens.push({ t: "num", v: parseFloat(m[0]) });
      i += m[0].length;
    } else if (/[a-z]/i.test(ch)) {
      const m = /^(log2|[a-z]+)/i.exec(s.slice(i));
      tokens.push({ t: "id", v: m[0].toLowerCase() });
      i += m[0].length;
    } else if ("+-*/^()!%,".includes(ch)) {
      tokens.push({ t: "op", v: ch });
      i++;
    } else {
      throw new Error(`使用できない文字: ${ch}`);
    }
  }
  return tokens;
}

/**
 * 式を評価する。
 * @param {string} src 数式
 * @param {{angle?: "deg"|"rad", ans?: number}} opts
 */
export function evaluate(src, opts = {}) {
  const angle = opts.angle ?? "deg";
  const ctx = {
    toRad: (x) => (angle === "deg" ? (x * Math.PI) / 180 : x),
    fromRad: (x) => (angle === "deg" ? (x * 180) / Math.PI : x),
  };
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v) => peek() && peek().t === "op" && peek().v === v;
  const eat = (v) => {
    if (!isOp(v)) throw new Error(`"${v}" が必要です`);
    pos++;
  };

  // expr := term (('+'|'-') term)*
  function expr() {
    let v = term();
    while (isOp("+") || isOp("-")) {
      const op = tokens[pos++].v;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  // term := unary (('*'|'/'|implicit) unary)*
  function term() {
    let v = unary();
    for (;;) {
      if (isOp("*")) {
        pos++;
        v *= unary();
      } else if (isOp("/")) {
        pos++;
        v /= unary();
      } else if (startsOperand()) {
        v *= unary(); // 暗黙の乗算: 2pi, 3(4+5)
      } else break;
    }
    return v;
  }

  function startsOperand() {
    const t = peek();
    return !!t && (t.t === "num" || t.t === "id" || (t.t === "op" && t.v === "("));
  }

  // unary := ('-'|'+') unary | power
  function unary() {
    if (isOp("-")) {
      pos++;
      return -unary();
    }
    if (isOp("+")) {
      pos++;
      return unary();
    }
    return power();
  }

  // power := postfix ('^' unary)?   (右結合, -2^2 = -4)
  function power() {
    const base = postfix();
    if (isOp("^")) {
      pos++;
      return Math.pow(base, unary());
    }
    return base;
  }

  // postfix := primary ('!' | '%')*
  function postfix() {
    let v = primary();
    for (;;) {
      if (isOp("!")) {
        pos++;
        v = factorial(v);
      } else if (isOp("%")) {
        pos++;
        v /= 100;
      } else break;
    }
    return v;
  }

  function primary() {
    const t = peek();
    if (!t) throw new Error("式が途中で終わっています");
    if (t.t === "num") {
      pos++;
      return t.v;
    }
    if (t.t === "op" && t.v === "(") {
      pos++;
      const v = expr();
      eat(")");
      return v;
    }
    if (t.t === "id") {
      pos++;
      if (t.v === "ans") return opts.ans ?? 0;
      if (Object.hasOwn(CONSTS, t.v)) return CONSTS[t.v];
      if (t.v === "pow" || t.v === "mod" || t.v === "nroot") {
        eat("(");
        const a = expr();
        eat(",");
        const b = expr();
        eat(")");
        if (t.v === "pow") return Math.pow(a, b);
        if (t.v === "mod") return a % b;
        return Math.pow(b, 1 / a);
      }
      if (Object.hasOwn(FUNCS, t.v)) {
        // sin(30) / sin 30 のどちらも許可
        const arg = isOp("(") ? (pos++, (() => { const v = expr(); eat(")"); return v; })()) : unary();
        return FUNCS[t.v](arg, ctx);
      }
      throw new Error(`未定義の識別子: ${t.v}`);
    }
    throw new Error(`予期しない記号: ${t.v}`);
  }

  if (tokens.length === 0) throw new Error("式が空です");
  const result = expr();
  if (pos < tokens.length) throw new Error(`解釈できない記号: ${tokens[pos].v}`);
  return result;
}

/** 表示用に整形 (浮動小数点誤差を丸める) */
export function format(n) {
  if (Number.isNaN(n)) return "NaN";
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "-∞";
  if (Object.is(n, -0)) return "0";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) {
    return Number(n.toPrecision(12)).toExponential().replace("e+", "e");
  }
  return String(Number(n.toPrecision(12)));
}
