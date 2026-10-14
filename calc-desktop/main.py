import ast
import math
import operator
import tkinter as tk
from tkinter import messagebox, ttk

APP_TITLE = "関数電卓 — ChatGPT"
ALLOWED_BINARY = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
}
ALLOWED_UNARY = {ast.UAdd: operator.pos, ast.USub: operator.neg}


class Calculator:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_TITLE)
        self.root.geometry("440x600")
        self.root.minsize(380, 520)
        self.root.configure(padx=12, pady=12)
        self.degrees = tk.BooleanVar(value=True)
        self.expression = tk.StringVar()
        self.status = tk.StringVar(value="DEG")
        self._build_ui()
        self.root.bind("<Return>", lambda _e: self.calculate())
        self.root.bind("<KP_Enter>", lambda _e: self.calculate())
        self.root.bind("<Escape>", lambda _e: self.clear())
        self.root.bind("<BackSpace>", lambda _e: self.backspace())
        self.root.bind("<Key>", self._keyboard_insert)

    def _build_ui(self):
        display = ttk.Entry(self.root, textvariable=self.expression, font=("Segoe UI", 22), justify="right")
        display.pack(fill="x", ipady=12, pady=(0, 8))
        display.focus_set()
        bar = ttk.Frame(self.root)
        bar.pack(fill="x", pady=(0, 8))
        ttk.Label(bar, text="角度モード:").pack(side="left")
        ttk.Radiobutton(bar, text="DEG", variable=self.degrees, value=True, command=self._update_mode).pack(side="left", padx=4)
        ttk.Radiobutton(bar, text="RAD", variable=self.degrees, value=False, command=self._update_mode).pack(side="left", padx=4)
        ttk.Label(bar, textvariable=self.status).pack(side="right")

        rows = [
            [("sin", "sin("), ("cos", "cos("), ("tan", "tan("), ("√x", "sqrt("), ("⌫", "BACK")],
            [("(", "("), (")", ")"), ("xʸ", "^"), ("log", "log("), ("ln", "ln(")],
            [("cbrt", "cbrt("), ("⁴√x", "root4("), ("π", "pi"), ("e", "e"), ("÷", "/")],
            [("7", "7"), ("8", "8"), ("9", "9"), ("×", "*"), ("−", "-")],
            [("4", "4"), ("5", "5"), ("6", "6"), ("+", "+"), ("%", "%")],
            [("1", "1"), ("2", "2"), ("3", "3"), ("x²", "^2"), ("AC", "CLEAR")],
            [("0", "0"), (".", "."), ("±", "NEGATE"), ("=", "EVAL"), ("C", "CLEAR")],
        ]
        grid = ttk.Frame(self.root)
        grid.pack(fill="both", expand=True)
        for r, row in enumerate(rows):
            grid.rowconfigure(r, weight=1)
            for c, (label, value) in enumerate(row):
                grid.columnconfigure(c, weight=1)
                button = ttk.Button(grid, text=label, command=lambda v=value: self._press(v))
                button.grid(row=r, column=c, sticky="nsew", padx=3, pady=3, ipadx=2, ipady=7)
        ttk.Label(self.root, text="Enter: 計算   Esc: 全消去   Backspace: 1文字削除",
                  foreground="#555").pack(anchor="w", pady=(8, 0))

    def _update_mode(self):
        self.status.set("DEG" if self.degrees.get() else "RAD")

    def _press(self, value):
        if value == "CLEAR":
            self.clear()
        elif value == "BACK":
            self.backspace()
        elif value == "EVAL":
            self.calculate()
        elif value == "NEGATE":
            s = self.expression.get()
            self.expression.set(f"-({s})" if s else "-")
        else:
            self.expression.set(self.expression.get() + value)

    def clear(self):
        self.expression.set("")

    def backspace(self):
        self.expression.set(self.expression.get()[:-1])

    def _keyboard_insert(self, event):
        if event.keysym in ("Return", "KP_Enter", "Escape", "BackSpace"):
            return
        if event.char and (event.char.isdigit() or event.char in ".+-*/%^()"):
            # The Entry handles ordinary typing itself.
            return

    def _evaluate(self, text):
        text = text.replace("^", "**").replace("π", "pi").strip()
        if not text:
            raise ValueError("式を入力してください")
        mode_degrees = self.degrees.get()

        def sin(x): return math.sin(math.radians(x) if mode_degrees else x)
        def cos(x): return math.cos(math.radians(x) if mode_degrees else x)
        def tan(x): return math.tan(math.radians(x) if mode_degrees else x)
        def cbrt(x): return math.copysign(abs(x) ** (1 / 3), x)
        def root4(x):
            if x < 0: raise ValueError("負数の4乗根は実数ではありません")
            return x ** 0.25
        def log(x): return math.log10(x)
        def ln(x): return math.log(x)

        names = {
            "sin": sin, "cos": cos, "tan": tan,
            "sqrt": math.sqrt, "cbrt": cbrt, "root4": root4,
            "log": log, "ln": ln, "pi": math.pi, "e": math.e,
            "abs": abs, "floor": math.floor, "ceil": math.ceil,
        }
        tree = ast.parse(text, mode="eval")

        def visit(node):
            if isinstance(node, ast.Expression):
                return visit(node.body)
            if isinstance(node, ast.Constant) and type(node.value) in (int, float):
                return node.value
            if isinstance(node, ast.Name) and node.id in names:
                return names[node.id]
            if isinstance(node, ast.BinOp) and type(node.op) in ALLOWED_BINARY:
                left, right = visit(node.left), visit(node.right)
                return ALLOWED_BINARY[type(node.op)](left, right)
            if isinstance(node, ast.UnaryOp) and type(node.op) in ALLOWED_UNARY:
                return ALLOWED_UNARY[type(node.op)](visit(node.operand))
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in names:
                if node.func.id in ("pi", "e") or len(node.keywords) != 0 or len(node.args) != 1:
                    raise ValueError("関数の引数が正しくありません")
                fn = names[node.func.id]
                if not callable(fn):
                    raise ValueError("この項目は関数ではありません")
                return fn(visit(node.args[0]))
            raise ValueError("使用できない式です")

        result = visit(tree)
        if callable(result):
            raise ValueError("数値を入力してください")
        if isinstance(result, complex):
            raise ValueError("実数の範囲外です")
        if isinstance(result, float) and not math.isfinite(result):
            raise ValueError("計算結果が有限値ではありません")
        return result

    def calculate(self):
        try:
            result = self._evaluate(self.expression.get())
            if isinstance(result, float):
                rendered = f"{result:.12g}"
            else:
                rendered = str(result)
            self.expression.set(rendered)
        except (ValueError, SyntaxError, ZeroDivisionError, OverflowError, TypeError) as exc:
            messagebox.showerror("計算エラー", str(exc) or "この式は計算できません", parent=self.root)


def main():
    root = tk.Tk()
    try:
        ttk.Style().theme_use("vista")
    except tk.TclError:
        pass
    Calculator(root)
    root.mainloop()


if __name__ == "__main__":
    main()
