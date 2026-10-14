# Windows 関数電卓

Python標準のTkinterで作った、Windows 10/11 64-bit向けの関数電卓です。GitHub ActionsがWindowsランナー上でEXEを自動ビルドします。利用者側にPythonのインストールは不要です。

## 機能
- 四則演算、括弧、べき乗、剰余
- sin / cos / tan（DEG / RAD切り替え）
- 平方根、立方根、常用対数 log、自然対数 ln
- π、e、Ans（直前の答え）
- キーボード入力、全消去、1文字削除

## EXEの取得方法
1. リポジトリの Actions タブを開く
2. **Build Scientific Calculator for Windows** を選択
3. 成功した実行を開き、Artifactsの `scientific-calculator-windows-x64` をダウンロード
4. ZIPを展開し、`ScientificCalculator.exe` を起動

EXEはGitHub Actionsの成果物として14日間保存されます。
