# 🎮 RPG Maker MZ MCP Server

<div align="center">

**完全なRPG Maker MZゲーム開発のためのMCPサーバー**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

**MCP toolsのみでRPGゲームを完全に作成可能 + AI画像生成対応！**

📖 **[初心者向けガイド](./GETTING_STARTED.md)** | [特徴](#-特徴) • [インストール](#-セットアップ) • [使用例](#-使用例) • [ツール一覧](#-利用可能なツール)

</div>

## 🌟 特徴

このMCPサーバーは、**RPG Maker MZの完全なゲーム開発環境**をプログラマティックに提供します。GUIを開くことなく、コードやAIエージェントを使って本格的なRPGゲームを作成できます。

### 🎯 主な特徴

- 🤖 **🆕 自律的全自動ゲーム作成**: コンセプトを入力するだけで3-7分で完全なRPGを生成！
- 🚀 **完全なプロジェクト作成**: ゼロからRPG Maker MZプロジェクトを生成
- 🗺️ **マップエディタ**: プログラマティックにマップとタイルを編集
- 🎭 **イベントシステム**: 複雑なゲームイベントとストーリーを実装
- 📊 **データベース管理**: アクター、スキル、アイテムなど全データ編集
- 🎨 **AI画像生成**: Gemini 2.5 Flash (nanobanana) でゲームアセットを自動生成
- 📖 **AIシナリオ生成**: Gemini APIで完全なストーリー・マップ・イベントを自動生成
- 🔧 **MCP統合**: Model Context Protocolを使った完全なツールチェーン

### 🤖 自律的全自動ゲーム作成（NEW!）

**わずか1行のコマンドで完全なRPGを生成！**

```bash
npx rpgmaker-mz-mcp auto-create "/games/MyRPG" "fantasy adventure with dragons"
```

**または Claude Code で:**
```
"cyberpunk detective story" というコンセプトでRPGを自動生成して
```

**自動実行される8ステップ:**
1. ✅ プロジェクト作成
2. ✅ コンセプト分析
3. ✅ シナリオ生成（マップ・キャラ・イベント）
4. ✅ バトルシステム（敵・スキル）
5. ✅ クエストシステム
6. ✅ AI画像アセット生成
7. ✅ ステータスバランス調整
8. ✅ プロジェクト最適化

**⏱️ 所要時間: 3-7分 → 即プレイ可能！**

詳細は [AUTONOMOUS_CREATION.md](./AUTONOMOUS_CREATION.md) を参照。

### 🎨 AI画像生成（NEW!）

Gemini 2.5 Flash APIを使用して、RPG Maker MZ用のアセットを自動生成：

- **キャラクタースプライト** (144x192px, 3x4グリッド)
- **フェイスグラフィック** (144x144px, 2x2グリッド)
- **タイルセット** (768x768px)
- **バトルバック** (1000x740px)
- **エネミーグラフィック** (816x624px)
- **サイドビューバトラー** (576x384px, 9x6グリッド)
- **ピクチャー** (816x624px)

## 📦 利用可能なツール

### 🎮 プロジェクト管理
| ツール | 説明 |
|--------|------|
| `create_project` | 新規プロジェクト作成 |
| `list_projects` | プロジェクト一覧表示 |
| `read_project_info` | プロジェクト情報読み取り |
| `generate_project_context` | コンテキストドキュメント生成 |
| `analyze_project_structure` | プロジェクト構造分析 |
| `extract_game_design_patterns` | ゲームデザインパターン抽出 |

### 🗺️ マップ編集
| ツール | 説明 |
|--------|------|
| `create_map` | 新規マップ作成 |
| `list_maps` | マップ一覧表示 |
| `read_map` | マップデータ読み取り |
| `update_map_tile` | タイル更新 |

### 🎭 イベント編集
| ツール | 説明 |
|--------|------|
| `add_event` | イベント追加 |
| `add_event_command` | イベントコマンド追加 |

**対応イベントコマンド例:**
- `101` - テキスト表示
- `201` - プレイヤー移動
- `122` - 変数操作
- `111` - 条件分岐
- その他RPG Maker MZ全コマンド対応

### 📊 データベース編集
| ツール | 説明 |
|--------|------|
| `add_actor` | アクター追加 |
| `add_class` | クラス追加 |
| `add_skill` | スキル追加 |
| `add_item` | アイテム追加 |
| `update_database` | 全データベース更新 |

### 🎨 AI画像生成
| ツール | 説明 |
|--------|------|
| `generate_asset` | Gemini 2.5 Flashでアセット生成 |
| `generate_asset_batch` | 複数アセットのバッチ生成 |
| `describe_asset` | 既存アセットのAI分析 |

### 🤖 自律的ゲーム作成（NEW!）
| ツール | 説明 |
|--------|------|
| `autonomous_create_game` | コンセプトから完全なRPGを自動生成（8ステップ全自動） |

### 📖 AIシナリオ生成
| ツール | 説明 |
|--------|------|
| `generate_scenario` | Gemini AIで完全なRPGシナリオ生成 |
| `implement_scenario` | 生成されたシナリオをプロジェクトに実装 |
| `generate_and_implement_scenario` | シナリオ生成と実装をワンステップで |
| `generate_scenario_variations` | 複数のシナリオバリエーション生成 |

### 🔌 プラグイン管理
| ツール | 説明 |
|--------|------|
| `list_plugins` | プラグイン一覧表示 |

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Gemini API Key (AI画像生成を使用する場合)

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/ShunsukeHayashi/rpgmaker-mz-mcp.git
cd rpgmaker-mz-mcp

# 依存関係をインストール
npm install

# ビルド
npm run build
```

### MCP設定

Claude Desktop または他のMCPクライアントの設定ファイルに追加:

```json
{
  "mcpServers": {
    "rpgmaker-mz": {
      "command": "node",
      "args": ["/path/to/rpgmaker-mz-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-gemini-api-key-here"
      }
    }
  }
}
```

### 環境変数

AI画像生成機能を使用する場合、以下の環境変数を設定:

```bash
export GEMINI_API_KEY="your-api-key"
```

## 💡 使用例

### 基本的なゲーム作成フロー

```typescript
// 1️⃣ プロジェクト作成
create_project({
  project_path: "/path/to/MyFantasyRPG",
  game_title: "Fantasy Adventure"
})

// 2️⃣ マップ作成
create_map({
  project_path: "/path/to/MyFantasyRPG",
  map_id: 2,
  name: "Town Square",
  width: 25,
  height: 20
})

// 3️⃣ NPCイベント追加
add_event({
  project_path: "/path/to/MyFantasyRPG",
  map_id: 2,
  event_id: 1,
  name: "Town Elder",
  x: 12,
  y: 10
})

// 4️⃣ 会話イベント追加
add_event_command({
  project_path: "/path/to/MyFantasyRPG",
  map_id: 2,
  event_id: 1,
  page_index: 0,
  code: 101,  // Show Text
  parameters: ["", 0, 0, 2]
})

add_event_command({
  project_path: "/path/to/MyFantasyRPG",
  map_id: 2,
  event_id: 1,
  page_index: 0,
  code: 401,  // Text continuation
  parameters: ["Welcome to our town, traveler!"]
})

// 5️⃣ プレイヤーキャラクター追加
add_actor({
  project_path: "/path/to/MyFantasyRPG",
  id: 1,
  name: "Hero"
})

add_class({
  project_path: "/path/to/MyFantasyRPG",
  id: 1,
  name: "Warrior"
})
```

### 🎨 AI画像生成の使用例

```typescript
// キャラクタースプライト生成
generate_asset({
  project_path: "/path/to/MyFantasyRPG",
  asset_type: "character",
  prompt: "A brave knight with silver armor and red cape, pixel art style, walking animation sprite sheet",
  filename: "Knight.png"
})

// フェイスグラフィック生成
generate_asset({
  project_path: "/path/to/MyFantasyRPG",
  asset_type: "face",
  prompt: "Female mage with blue robes and long purple hair, multiple expressions (normal, happy, sad, angry)",
  filename: "Mage_Face.png"
})

// バッチ生成
generate_asset_batch({
  requests: [
    {
      project_path: "/path/to/MyFantasyRPG",
      asset_type: "enemy",
      prompt: "Fire dragon boss, menacing pose",
      filename: "Dragon.png"
    },
    {
      project_path: "/path/to/MyFantasyRPG",
      asset_type: "enemy",
      prompt: "Goblin warrior with wooden club",
      filename: "Goblin.png"
    }
  ]
})

// 既存アセット分析
describe_asset({
  project_path: "/path/to/MyFantasyRPG",
  asset_type: "character",
  filename: "Knight.png"
})
// → "This character sprite shows a knight in silver armor..."
```

### 📖 AIシナリオ自動生成（超強力！）

```typescript
// ワンコマンドで完全なRPGを生成！
generate_and_implement_scenario({
  project_path: "/path/to/MyFantasyRPG",
  theme: "medieval fantasy adventure with dragons",
  style: "epic and heroic",
  length: "medium"
})

// 生成される内容:
// - ストーリーと世界観
// - マップ（町、ダンジョン、フィールドなど）
// - キャラクター（主人公、仲間、NPC）
// - イベント（会話、クエスト、バトル）
// - アイテムとスキル
// すべて自動で実装されます！

// 複数バリエーション生成して比較
generate_scenario_variations({
  project_path: "/path/to/MyFantasyRPG",
  theme: "cyberpunk detective story",
  style: "noir and mysterious",
  length: "short",
  count: 3
})
// → 3つの異なるストーリーを生成して最適なものを選択
```

### 📊 プロジェクト分析

```typescript
// プロジェクト構造分析
analyze_project_structure({
  project_path: "/path/to/MyFantasyRPG"
})

// コンテキスト生成
generate_project_context({
  project_path: "/path/to/MyFantasyRPG",
  include_maps: true,
  include_events: true,
  include_plugins: true
})

// デザインパターン抽出
extract_game_design_patterns({
  project_path: "/path/to/MyFantasyRPG"
})
```

## 🎯 ユースケース

### 1. 🤖 完全自動ゲーム生成
```
"ファンタジーRPGを作って" → AIが自動でストーリー、マップ、キャラ、イベントを生成！
```

### 2. 🎨 AI駆動の開発ワークフロー
```
シナリオ生成 → アセット生成 → 実装 → 完成
全てAIがサポート
```

### 3. 📚 ゲームプロトタイプ大量生成
```
複数のストーリーコンセプトを試して、最適なものを選択
```

### 4. 🔄 プログラマティックなゲーム開発
```
Pythonスクリプトやワークフローツールからゲームを生成
```

### 5. 🧪 テストデータ自動生成
```
ゲームエンジンのテスト用プロジェクトを即座に作成
```

### 6. 🎓 教育・学習
```
RPG Maker MZの学習用サンプルを自動生成
```

## 📊 開発状況

| 機能 | 状態 |
|------|------|
| ✅ プロジェクト作成・管理 | 完了 |
| ✅ マップ作成・編集 | 完了 |
| ✅ イベント作成・編集 | 完了 |
| ✅ データベース編集 | 完了 |
| ✅ AI画像生成 (Gemini 2.5 Flash) | 完了 |
| ✅ AIシナリオ自動生成 | **NEW!** |
| ✅ コンテキストエンジニアリング | 完了 |
| ✅ 完全なゲーム作成ワークフロー | 完了 |

## 🌟 特筆機能

### 🚀 ワンコマンドRPG生成
```bash
# たった1つのコマンドで完全なRPGゲームが生成されます
generate_and_implement_scenario({
  theme: "your game idea",
  style: "your preferred style",
  length: "short"
})
# → 数分でプレイ可能なRPGが完成！
```

### 🎨 完全AI駆動開発
- **シナリオ**: Gemini AIが自動生成
- **アセット**: Gemini 2.5 Flashが画像生成
- **実装**: MCPツールが自動実装
- **結果**: 完全に動作するRPG Maker MZプロジェクト

## 🤝 コントリビューション

Pull Requestsを歓迎します！

## 📄 ライセンス

MIT License

## 🔗 リンク

- [RPG Maker MZ 公式](https://rpgmakerofficial.com/product/mz/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Gemini API](https://ai.google.dev/)

---

<div align="center">

**🎮 MCP toolsのみでRPG Maker MZゲームを完全に作成可能！ 🎮**

Made with ❤️ by [ShunsukeHayashi](https://github.com/ShunsukeHayashi)

</div>