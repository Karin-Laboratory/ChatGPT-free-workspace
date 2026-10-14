"""Standalone Japanese scientific calculator for Windows (Python/Tkinter)."""
import ast
import math
import operator
import tkinter as tk
from tkinter import messagebox, ttk

BINOPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
          ast.Div: operator.truediv, ast.Pow: operator.pow, ast.Mod: operator.mod}
UNOPS = {ast.UAdd: operator.pos, ast.USub: operator.neg}


class ScientificCalculator:
    def __init__(self, root):
        self.root = root
        root.title("関数電卓")
        root.geometry("460x590")
        root.minsize(390, 500)
        root.configure(padx=12, pady=12)
        self.expression = tk.StringVar()
        self.degrees = tk.BooleanVar(value=True)
        self._make_ui()
        root.bind("<Return>", lambda _e: self.calculate())
        root.bind("<Escape>", lambda _e: self.clear())
        root.bind("<BackSpace>", lambda _e: self.backspace())

    def _make_ui(self):
        display = ttk.Entry(self.root, textvariable=self.expression,
                            font=("Segoe UI", 22), justify="right")
        display.pack(fill="x", ipady=12, pady=(0, 8))
        display.focus_set()
        mode = ttk.Frame(self.root)
        mode.pack(fill="x", pady=(0, 8))
        ttk.Label(mode, text="角度単位:").pack(side="left")
        ttk.Radiobutton(mode, text="度 (DEG)", variable=self.degrees,
                        value=True).pack(side="left", padx=5)
        ttk.Radiobutton(mode, text="ラジアン (RAD)", variable=self.degrees,
                        value=False).pack(side="left", padx=5)

        rows = [
            [("sin", "sin("), ("cos", "cos("), ("tan", "tan("), ("√", "sqrt("), ("⌫", "BACK")],
            [("(", "("), (")", ")"), ("xʸ", "^"), ("log", "log("), ("ln", "ln(")],
            [("∛", "cbrt("), ("π", "pi"), ("e", "e"), ("÷", "/"), ("AC", "CLEAR")],
            [("7", "7"), ("8", "8"), ("9", "9"), ("×", "*"), ("−", "-")],
            [("4", "4"), ("5", "5"), ("6", "6"), ("+", "+"), ("%", "%")],
            [("1", "1"), ("2", "2"), ("3", "3"), ("x²", "^2"), ("=", "EVAL")],
            [("0", "0"), (".", "."), ("±", "NEGATE"), ("C", "CLEAR"), ("Ans", "ANS")],
        ]
        grid = ttk.Frame(self.root)
        grid.pack(fill="both", expand=True)
        for r, row in enumerate(rows):
            grid.rowconfigure(r, weight=1)
            for c, (label, value) in enumerate(row):
                grid.columnconfigure(c, weight=1)
                ttk.Button(grid, text=label, command=lambda v=value: self.press(v)).grid(
                    row=r, column=c, sticky="nsew", padx=3, pady=3, ipady=7)
        ttk.Label(self.root, text="Enter: 計算   Esc: 全消去   Backspace: 1文字削除").pack(
            anchor="w", pady=(8, 0))
        self.answer = 0

    def press(self, value):
        s = self.expression.get()
        if value == "CLEAR":
            self.clear()
        elif value == "BACK":
            self.backspace()
        elif value == "EVAL":
            self.calculate()
        elif value == "NEGATE":
            self.expression.set(f"-({s})" if s else "-")
        elif value == "ANS":
            self.expression.set(s + str(self.answer))
        else:
            self.expression.set(s + value)

    def clear(self):
        self.expression.set("")

    def backspace(self):
        self.expression.set(self.expression.get()[:-1])

    def evaluate(self, source):
        source = source.replace("^", "**").replace("π", "pi").strip()
        if not source:
            raise ValueError("計算式を入力してください")
        degrees = self.degrees.get()

        def trig(fn):
            return lambda x: fn(math.radians(x) if degrees else x)
        def cbrt(x):
            return math.copysign(abs(x) ** (1.0 / 3.0), x)

        funcs = {
            "sin": trig(math.sin), "cos": trig(math.cos), "tan": trig(math.tan),
            "sqrt": math.sqrt, "cbrt": cbrt, "log": math.log10, "ln": math.log,
            "abs": abs, "floor": math.floor, "ceil": math.ceil,
        }
        names = {"pi": math.pi, "e": math.e, **funcs}
        tree = ast.parse(source, mode="eval")

        def visit(node):
            if isinstance(node, ast.Expression):
                return visit(node.body)
            if isinstance(node, ast.Constant) and type(node.value) in (int, float):
                return node.value
            if isinstance(node, ast.Name) and node.id in names:
                return names[node.id]
            if isinstance(node, ast.BinOp) and type(node.op) in BINOPS:
                return BINOPS[type(node.op)](visit(node.left), visit(node.right))
            if isinstance(node, ast.UnaryOp) and type(node.op) in UNOPS:
                return UNOPS[type(node.op)](visit(node.operand))
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                fn = funcs.get(node.func.id)
                if fn is None or len(node.args) != 1 or node.keywords:
                    raise ValueError("関数または引数が正しくありません")
                return fn(visit(node.args[0]))
            raise ValueError("使用できない式です")

        result = visit(tree)
        if isinstance(result, complex) or not isinstance(result, (int, float)):
            raise ValueError("実数の範囲で計算できません")
        if isinstance(result, float) and not math.isfinite(result):
            raise ValueError("計算結果が有限値ではありません")
        return result

    def calculate(self):
        try:
            result = self.evaluate(self.expression.get())
            self.answer = result
            self.expression.set(f"{result:.12g}" if isinstance(result, float) else str(result))
        except (ValueError, SyntaxError, ZeroDivisionError, OverflowError, TypeError) as exc:
            messagebox.showerror("計算エラー", str(exc) or "計算できません", parent=self.root)


def main():
    root = tk.Tk()
    try:
        ttk.Style().theme_use("vista")
    except tk.TclError:
        pass
    ScientificCalculator(root)
    root.mainloop()


if __name__ == "__main__":
    main()
