# RPG Maker MZ MCP Server

完全なRPG Maker MZゲーム開発のためのMCPサーバー。MCP toolsのみでRPGゲームを完全に作成可能。

## 機能

### プロジェクト管理
- **create_project** - 新規プロジェクト作成
- **list_projects** - プロジェクト一覧
- **read_project_info** - プロジェクト情報読み取り
- **generate_project_context** - プロジェクトのコンテキストドキュメント生成
- **analyze_project_structure** - プロジェクト構造分析
- **extract_game_design_patterns** - ゲームデザインパターン抽出

### マップ編集
- **create_map** - 新規マップ作成
- **list_maps** - マップ一覧
- **read_map** - マップデータ読み取り
- **update_map_tile** - マップタイル更新

### イベント編集
- **add_event** - イベント追加
- **add_event_command** - イベントコマンド追加
  - コマンド例:
    - 101: テキスト表示
    - 201: プレイヤー移動
    - 122: 変数操作
    - 111: 条件分岐
    - その他RPG Maker MZ全イベントコマンド対応

### データベース編集
- **add_actor** - アクター追加
- **add_class** - クラス追加
- **add_skill** - スキル追加
- **add_item** - アイテム追加
- **update_database** - データベース更新（Actors, Classes, Skills, Items, Weapons, Armors等）

### プラグイン管理
- **list_plugins** - プラグイン一覧

## セットアップ

```bash
npm install
npm run build
```

## MCP設定

MCP設定ファイルに追加:

```json
{
  "mcpServers": {
    "rpgmaker-mz": {
      "command": "node",
      "args": ["/Users/shunsuke/rpgmaker-mz-mcp/dist/index.js"]
    }
  }
}
```

## 使用例

### 新規ゲーム作成
```typescript
// 1. プロジェクト作成
create_project({
  project_path: "/path/to/MyGame",
  game_title: "My RPG Game"
})

// 2. マップ作成
create_map({
  project_path: "/path/to/MyGame",
  map_id: 2,
  name: "Town",
  width: 20,
  height: 15
})

// 3. イベント追加
add_event({
  project_path: "/path/to/MyGame",
  map_id: 2,
  event_id: 1,
  name: "NPC",
  x: 10,
  y: 10
})

// 4. テキスト表示コマンド追加
add_event_command({
  project_path: "/path/to/MyGame",
  map_id: 2,
  event_id: 1,
  page_index: 0,
  code: 101,
  parameters: [...]
})

// 5. アクター追加
add_actor({
  project_path: "/path/to/MyGame",
  id: 1,
  name: "Hero"
})
```

## 開発状況

✅ プロジェクト作成・管理
✅ マップ作成・編集
✅ イベント作成・編集
✅ データベース編集
✅ コンテキストエンジニアリング
✅ 完全なゲーム作成ワークフロー

**MCP toolsのみでRPG Maker MZゲームを完全に作成可能です！**