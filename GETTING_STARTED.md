# 🎮 RPG Maker MZ MCP - はじめてのガイド

**初心者の方でも安心！** このガイドを読めば、5分でRPGゲームを作れます。

---

## 📚 目次

1. [このツールでできること](#このツールでできること)
2. [セットアップ（初回のみ）](#セットアップ初回のみ)
3. [3分でゲームを作る](#3分でゲームを作る)
4. [基本的な使い方](#基本的な使い方)
5. [よくある質問](#よくある質問)

---

## 🌟 このツールでできること

### ✨ 一番簡単な方法：**1コマンドで完全なRPGを自動生成**

```bash
npx rpgmaker-mz-mcp auto-create "/path/to/MyGame" "あなたのゲームアイデア"
```

たった1行で以下が全て自動生成されます：

- ✅ ゲームプロジェクト
- ✅ マップ（町、ダンジョンなど）
- ✅ キャラクター（主人公、仲間）
- ✅ 敵キャラクター
- ✅ クエスト
- ✅ バトルシステム
- ✅ AI生成画像（オプション）

**所要時間：3〜7分 → すぐにプレイ可能！**

---

## ⚙️ セットアップ（初回のみ）

### ステップ1: Node.jsをインストール

まだインストールしていない場合：

1. https://nodejs.org/ にアクセス
2. 「LTS版」をダウンロード
3. インストーラーを実行

確認方法：
```bash
node --version
# v18.0.0 以上であればOK
```

### ステップ2: RPG Maker MZ MCPをインストール

```bash
npm install -g rpgmaker-mz-mcp
```

### ステップ3: Gemini APIキーを取得（AI機能を使う場合）

1. https://makersuite.google.com/app/apikey にアクセス
2. 「Create API Key」をクリック
3. キーをコピー

設定方法：
```bash
export GEMINI_API_KEY="AIzaYourKeyHere"
```

Mac/Linuxの場合は `~/.bashrc` や `~/.zshrc` に追加すると永続化できます。

---

## 🚀 3分でゲームを作る

### 最速の方法：自動生成

```bash
# 1. ゲームを自動生成（AI機能なし・高速）
npx rpgmaker-mz-mcp auto-create "/Users/yourname/MyFirstRPG" "fantasy adventure" --no-assets --no-optimize

# 2. RPG Maker MZで開く
open "/Users/yourname/MyFirstRPG/Game.rpgproject"

# 3. ゲーム → テストプレイ で遊べます！
```

**所要時間：30秒〜1分**

### フル機能版（AI画像生成あり）

```bash
# Gemini APIキーが必要
export GEMINI_API_KEY="your_key_here"

npx rpgmaker-mz-mcp auto-create "/Users/yourname/MyFantasyRPG" "fantasy adventure with dragons"

# 所要時間：5〜7分
# キャラクター画像・敵画像なども自動生成されます
```

---

## 📖 基本的な使い方

### 方法1: CLIコマンド（コマンドライン）

#### 新しいプロジェクトを作る

```bash
npx rpgmaker-mz-mcp create "/path/to/MyGame" "My Game Title"
```

**説明:**
- `/path/to/MyGame` - ゲームを保存する場所
- `"My Game Title"` - ゲームのタイトル

#### マップを追加する

```bash
# まず、プロジェクトを作成してから実行
npx rpgmaker-mz-mcp create "/Users/me/MyGame" "Test Game"

# その後、マップを作成
# （注: CLIには個別のマップ作成コマンドはありません。MCPツールまたはRPG Maker MZで追加してください）
```

---

### 方法2: MCPツール（Claude Codeなどから）

Claude Codeやその他のMCPクライアントから使う場合：

```
"ファンタジーRPGを作成してください"
```

と伝えるだけで、Claudeが自動的に適切なツールを呼び出してゲームを作成します。

---

## 🎯 ステップバイステップ：手動でゲームを組み立てる

自動生成ではなく、一つずつ丁寧に作りたい場合：

### ステップ1: プロジェクト作成

```typescript
await create_project({
  project_path: "/Users/yourname/MyRPG",
  game_title: "Hero's Journey"
});
```

**何が起こるか:**
- プロジェクトフォルダが作成されます
- 基本的なファイル構造ができあがります
- RPG Maker MZで開けるようになります

---

### ステップ2: マップ作成

```typescript
await create_map({
  project_path: "/Users/yourname/MyRPG",
  map_id: 2,  // ID 1 は既に存在するため 2 から始める
  name: "開始の村",
  width: 20,  // マップの横幅（マス数）
  height: 15  // マップの縦幅（マス数）
});
```

**何が起こるか:**
- 「開始の村」という名前のマップができます
- サイズは20×15マス
- まだ何も配置されていない空のマップです

---

### ステップ3: NPCを配置

```typescript
await add_event({
  project_path: "/Users/yourname/MyRPG",
  map_id: 2,
  event_id: 1,
  name: "村長",
  x: 10,  // マップ上の位置（横）
  y: 10   // マップ上の位置（縦）
});
```

**何が起こるか:**
- マップID 2（開始の村）に「村長」が配置されます
- 位置は (10, 10) です
- まだ何もしゃべりません（次のステップで設定）

---

### ステップ4: NPCに会話を設定

```typescript
// まず「テキスト表示」コマンドを追加
await add_event_command({
  project_path: "/Users/yourname/MyRPG",
  map_id: 2,
  event_id: 1,
  page_index: 0,
  code: 101,  // テキスト表示の開始
  parameters: ["", 0, 0, 2]  // 基本設定
});

// 実際の会話内容を追加
await add_event_command({
  project_path: "/Users/yourname/MyRPG",
  map_id: 2,
  event_id: 1,
  page_index: 0,
  code: 401,  // 会話テキスト
  parameters: ["ようこそ、勇者よ！\nこの村に平和を取り戻してくれ！"]
});
```

**何が起こるか:**
- 村長に話しかけると「ようこそ、勇者よ！...」と表示されます
- `\n` で改行できます

---

### ステップ5: 主人公キャラクターを作る

```typescript
await add_actor({
  project_path: "/Users/yourname/MyRPG",
  id: 1,
  name: "アレックス"
});
```

**何が起こるか:**
- プレイヤーキャラクター「アレックス」が作成されます
- パーティーに加えることができます

---

### ステップ6: RPG Maker MZで確認

```bash
open "/Users/yourname/MyRPG/Game.rpgproject"
```

RPG Maker MZが起動したら：
1. **ゲーム → テストプレイ** をクリック
2. ゲームが起動します
3. 村長に話しかけてみましょう！

---

## 🤖 AI機能を使った高速開発

### シナリオ自動生成

```typescript
await generate_and_implement_scenario({
  project_path: "/Users/yourname/MyRPG",
  theme: "中世ファンタジー。勇者がドラゴンを倒す物語",
  style: "壮大で感動的",
  length: "short"  // "short", "medium", "long" から選択
});
```

**何が起こるか:**
- AIがストーリーを考えます
- マップが3〜5個作られます
- キャラクター・NPCが配置されます
- 会話内容も自動で設定されます
- すぐに遊べるゲームが完成！

**所要時間：1〜2分**

---

### AI画像生成

```typescript
await generate_asset({
  project_path: "/Users/yourname/MyRPG",
  assetType: "character",  // キャラクタースプライト
  prompt: "勇敢な騎士。銀色の鎧、赤いマント。ドット絵",
  filename: "Knight.png"
});
```

**何が起こるか:**
- AIが指定した内容の画像を生成
- RPG Maker MZ用の正しいサイズで作成
- プロジェクトの `img/characters/Knight.png` に保存
- すぐにRPG Maker MZで使用可能

**所要時間：30秒〜1分**

---

## 🎨 アセットタイプ一覧

| タイプ | 説明 | サイズ | 用途 |
|--------|------|--------|------|
| `character` | キャラクタースプライト | 144×192px | プレイヤー・NPC |
| `face` | 顔グラフィック | 144×144px | 会話画面 |
| `enemy` | 敵キャラクター | 816×624px | バトル画面 |
| `tileset` | タイルセット | 768×768px | マップの地形 |
| `battleback` | 戦闘背景 | 1000×740px | バトル背景 |
| `sv_actor` | サイドビューバトラー | 576×384px | 戦闘アニメ |
| `picture` | ピクチャー | 816×624px | イベント画像 |

---

## 💡 よくある質問

### Q1: プログラミング知識は必要ですか？

**A:** 基本的には不要です！

- **超簡単:** `auto-create` コマンド1行でゲーム完成
- **Claude Code使用:** 普通の日本語で指示するだけ
- **手動作成:** サンプルコードをコピペでOK

### Q2: RPG Maker MZは必要ですか？

**A:** はい、最終的な編集とプレイには必要です。

- このツール: ゲームデータを自動生成
- RPG Maker MZ: データを開いて編集・テストプレイ

### Q3: どのくらいの時間でゲームができますか？

**A:** 用途によります：

| 目的 | 時間 | コマンド |
|------|------|----------|
| プロトタイプ | 30秒 | `auto-create` (--no-assets) |
| 基本ゲーム | 3分 | `auto-create` (デフォルト) |
| フル機能 | 5〜7分 | `auto-create` (全オプション) |
| 手動作成 | 30分〜 | 個別ツール使用 |

### Q4: 生成されたゲームは編集できますか？

**A:** もちろん！

1. 自動生成でベースを作成
2. RPG Maker MZで開く
3. 好きなように編集・カスタマイズ
4. 完全にあなたのゲームです

### Q5: どんなゲームが作れますか？

**A:** あらゆるジャンルのRPG：

- ファンタジー冒険
- サイバーパンク探偵
- SF宇宙オペラ
- ホラーサバイバル
- 学園もの
- その他、あなたの想像力次第！

### Q6: APIキーが必要なのはいつですか？

**A:** AI機能を使う時のみ：

| 機能 | APIキー必要？ |
|------|--------------|
| プロジェクト作成 | ❌ 不要 |
| マップ作成 | ❌ 不要 |
| イベント作成 | ❌ 不要 |
| **AIシナリオ生成** | ✅ **必要** |
| **AI画像生成** | ✅ **必要** |
| 自動生成（--no-assets） | ❌ 不要 |

### Q7: エラーが出たらどうすればいいですか？

**A:** エラーメッセージを確認してください：

```bash
# ログファイルを見る
tail -f /tmp/rpgmaker-mz-mcp.log
```

よくあるエラー：
- **APIキーエラー**: `export GEMINI_API_KEY="your_key"`
- **パスエラー**: 絶対パスを使用（例: `/Users/...`）
- **権限エラー**: `chmod` でパーミッション変更

---

## 📝 コマンド一覧（簡単な順）

### レベル1: 超簡単（推奨）

```bash
# 1コマンドでゲーム完成
npx rpgmaker-mz-mcp auto-create "/path/to/game" "your game idea"
```

### レベル2: 基本操作

```bash
# プロジェクト作成
npx rpgmaker-mz-mcp create "/path/to/game" "Game Title"

# シナリオ生成
npx rpgmaker-mz-mcp generate-scenario "/path/to/game" --theme "fantasy"

# バトルシステム生成
npx rpgmaker-mz-mcp generate-battles "/path/to/game" --difficulty normal
```

### レベル3: MCPツール（Claude Codeなど）

Claude Codeで以下のように指示：

```
"ファンタジーRPGを作って"
"宿屋のイベントを追加して"
"ボス戦を実装して"
```

---

## 🎓 チュートリアル：初めてのRPG作成

### 例：シンプルなファンタジーRPG

#### ステップ1: 自動生成で土台を作る

```bash
npx rpgmaker-mz-mcp auto-create \
  "/Users/yourname/Documents/RMMZ/MyFantasyGame" \
  "brave knight fights evil dragon to save princess" \
  --title "Dragon Quest" \
  --length short \
  --difficulty normal
```

待つこと2〜3分...

```
🎉 ゲーム作成完了！
📊 Summary:
   🗺️  Maps: 3
   👤 Actors: 2
   👹 Enemies: 5
   🎯 Quests: 3
```

#### ステップ2: RPG Maker MZで開く

```bash
open "/Users/yourname/Documents/RMMZ/MyFantasyGame/Game.rpgproject"
```

#### ステップ3: 内容を確認

RPG Maker MZで：
1. **データベース** を開いてキャラクター確認
2. **マップ** を開いて配置確認
3. **ゲーム → テストプレイ** で動作確認

#### ステップ4: カスタマイズ（任意）

好きなように編集：
- マップのタイル配置変更
- キャラクター画像差し替え
- 会話内容修正
- アイテム追加
- BGM設定

完成！🎉

---

## 🔧 トラブルシューティング

### エラー: "GEMINI_API_KEY not provided"

**解決策:**
```bash
export GEMINI_API_KEY="AIzaYourKeyHere"
```

または、AI機能を使わない：
```bash
npx rpgmaker-mz-mcp auto-create "/path" "concept" --no-assets
```

---

### エラー: "Project path already exists"

**解決策:**
別のパスを使うか、既存のプロジェクトを削除：
```bash
rm -rf /path/to/existing/project
```

---

### エラー: "Permission denied"

**解決策:**
パーミッションを変更：
```bash
chmod -R 755 /path/to/your/project
```

---

### プロジェクトが開けない

**確認事項:**
1. `Game.rpgproject` ファイルが存在するか
2. `data/` フォルダが存在するか
3. RPG Maker MZが正しくインストールされているか

---

## 📚 次のステップ

### 初心者向け
1. ✅ このガイドで自動生成を試す
2. ✅ RPG Maker MZで生成されたゲームを開く
3. ✅ 少しずつカスタマイズしてみる
4. ✅ [WORKFLOWS.md](./WORKFLOWS.md) で応用例を学ぶ

### 中級者向け
1. [CLAUDE_CODE_INSTRUCTIONS.md](./CLAUDE_CODE_INSTRUCTIONS.md) - Claude Code連携
2. [AUTONOMOUS_CREATION.md](./AUTONOMOUS_CREATION.md) - 自律生成の詳細
3. MCPツールを個別に使ってみる

### 上級者向け
1. [DEVELOPMENT.md](./DEVELOPMENT.md) - 開発者ガイド
2. [ERROR_HANDLING.md](./ERROR_HANDLING.md) - エラーハンドリング
3. プラグイン開発、カスタムスクリプト追加

---

## 💬 サポート

### 困ったときは

1. **ログを確認:**
   ```bash
   tail -f /tmp/rpgmaker-mz-mcp.log
   ```

2. **Issues報告:**
   https://github.com/ShunsukeHayashi/rpgmaker-mz-mcp/issues

3. **ドキュメント:**
   - [README.md](./README.md) - 全機能リファレンス
   - [WORKFLOWS.md](./WORKFLOWS.md) - ワークフロー例
   - [ERROR_HANDLING.md](./ERROR_HANDLING.md) - エラー対処法

---

## 🎉 さあ、始めましょう！

### 今すぐ試す（30秒コース）

```bash
npx rpgmaker-mz-mcp auto-create \
  "/tmp/QuickTest" \
  "fantasy adventure" \
  --no-assets \
  --no-optimize
```

### 本格的に作る（5分コース）

```bash
export GEMINI_API_KEY="your_key"

npx rpgmaker-mz-mcp auto-create \
  "/Users/yourname/Documents/RMMZ/MyEpicRPG" \
  "epic fantasy adventure with dragons and magic kingdoms" \
  --length medium \
  --characters 5 \
  --enemies 10
```

---

**🎮 あなたの夢のRPGを作りましょう！**

何か困ったことがあれば、いつでも質問してください。
一緒に素晴らしいゲームを作りましょう！✨