import { describe, expect, it } from "vitest";
import { evaluate, format } from "../src/calc.js";

const ev = (s, o) => evaluate(s, o);

describe("四則演算と優先順位", () => {
  it("基本演算", () => {
    expect(ev("1+2*3")).toBe(7);
    expect(ev("(1+2)*3")).toBe(9);
    expect(ev("10/4")).toBe(2.5);
    expect(ev("2-3-4")).toBe(-5);
  });
  it("単項マイナスとべき乗", () => {
    expect(ev("-2^2")).toBe(-4);
    expect(ev("2^3^2")).toBe(512);
    expect(ev("2^-1")).toBe(0.5);
  });
  it("暗黙の乗算", () => {
    expect(ev("2pi")).toBeCloseTo(2 * Math.PI);
    expect(ev("3(4+5)")).toBe(27);
    expect(ev("2sqrt(9)")).toBe(6);
  });
  it("%と階乗", () => {
    expect(ev("50%")).toBe(0.5);
    expect(ev("5!")).toBe(120);
    expect(ev("0!")).toBe(1);
    expect(() => ev("2.5!")).toThrow();
  });
  it("×÷−記号", () => {
    expect(ev("6×7÷2−1")).toBe(20);
  });
});

describe("関数", () => {
  it("度数法の三角関数", () => {
    expect(ev("sin(30)", { angle: "deg" })).toBeCloseTo(0.5, 12);
    expect(ev("cos(60)", { angle: "deg" })).toBeCloseTo(0.5, 12);
    expect(ev("tan(45)", { angle: "deg" })).toBeCloseTo(1, 12);
  });
  it("ラジアンの三角関数", () => {
    expect(ev("sin(pi/2)", { angle: "rad" })).toBeCloseTo(1, 12);
  });
  it("逆三角関数", () => {
    expect(ev("asin(0.5)", { angle: "deg" })).toBeCloseTo(30, 10);
    expect(ev("atan(1)", { angle: "rad" })).toBeCloseTo(Math.PI / 4, 12);
  });
  it("対数・指数・根", () => {
    expect(ev("log(1000)")).toBeCloseTo(3, 12);
    expect(ev("ln(e)")).toBeCloseTo(1, 12);
    expect(ev("exp(0)")).toBe(1);
    expect(ev("sqrt(16)")).toBe(4);
    expect(ev("cbrt(27)")).toBeCloseTo(3, 12);
    expect(ev("nroot(3,27)")).toBeCloseTo(3, 12);
    expect(ev("pow(2,10)")).toBe(1024);
    expect(ev("mod(10,3)")).toBe(1);
  });
  it("括弧なしの関数呼び出し", () => {
    expect(ev("sqrt 16")).toBe(4);
  });
  it("Ans", () => {
    expect(ev("ans*2", { ans: 21 })).toBe(42);
  });
});

describe("エラー", () => {
  it("不正な式", () => {
    expect(() => ev("")).toThrow();
    expect(() => ev("1+")).toThrow();
    expect(() => ev("(1+2")).toThrow();
    expect(() => ev("1+2)")).toThrow();
    expect(() => ev("foo(1)")).toThrow();
    expect(() => ev("1 $ 2")).toThrow();
  });
  it("eval相当の文字列は実行されない", () => {
    expect(() => ev("alert(1)")).toThrow();
    expect(() => ev("constructor")).toThrow();
  });
});

describe("format", () => {
  it("浮動小数点誤差を丸める", () => {
    expect(format(0.1 + 0.2)).toBe("0.3");
    expect(format(Math.sin(Math.PI))).toBe("1.22464679915e-16");
  });
  it("特殊値", () => {
    expect(format(1 / 0)).toBe("∞");
    expect(format(-1 / 0)).toBe("-∞");
    expect(format(NaN)).toBe("NaN");
    expect(format(-0)).toBe("0");
  });
  it("大きな値は指数表記", () => {
    expect(format(1e20)).toBe("1e20");
  });
});
