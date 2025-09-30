# 🎮 RPG Maker MZ MCP Tools - 完全ガイド

RPG Maker MZ公式ガイド準拠のMCPツール使用方法

**参考**: https://rpgmakerofficial.com/product/mz/guide/

---

## 📚 目次

1. [基本概念](#基本概念)
2. [プロジェクト管理](#プロジェクト管理)
3. [マップ編集](#マップ編集)
4. [イベントシステム](#イベントシステム)
5. [データベース管理](#データベース管理)
6. [AI機能](#ai機能)
7. [実践ワークフロー](#実践ワークフロー)

---

## 🎯 基本概念

### RPG Maker MZの構造

RPGゲームは以下の要素で構成されます：

```
RPGゲーム
├── プロジェクト設定 (System.json)
├── マップ (Map001.json, Map002.json...)
│   ├── タイル配置
│   └── イベント
├── データベース
│   ├── アクター (プレイヤーキャラ)
│   ├── クラス (職業)
│   ├── スキル (技・魔法)
│   ├── アイテム (道具)
│   ├── 敵キャラクター
│   └── 部隊編成
└── アセット (画像・音声)
```

### MCPツールでできること

- ✅ **完全自動生成**: コンセプトから完成まで3分
- ✅ **手動作成**: 細かくコントロール
- ✅ **ハイブリッド**: AIと手動の組み合わせ

---

## 🏗️ プロジェクト管理

### プロジェクト新規作成

```typescript
await create_project({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame",
  game_title: "勇者の冒険"
});
```

**作成されるもの**:
```
MyGame/
├── Game.rpgproject    (プロジェクトファイル)
├── data/             (ゲームデータ)
│   ├── System.json
│   ├── MapInfos.json
│   ├── Map001.json
│   └── ... (各種データベース)
├── img/              (画像)
│   ├── characters/
│   ├── faces/
│   ├── enemies/
│   └── ...
├── audio/            (音声)
│   ├── bgm/
│   ├── bgs/
│   ├── me/
│   └── se/
└── js/plugins/       (プラグイン)
```

### プロジェクト一覧表示

```typescript
await list_projects({
  directory: "/Users/yourname/Documents/RMMZ"
});
```

### プロジェクト情報取得

```typescript
await read_project_info({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame"
});
```

### プロジェクト構造分析

```typescript
await analyze_project_structure({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame"
});
```

**取得情報**:
- マップ数・イベント数
- キャラクター・敵の数
- アセット数・サイズ
- プラグイン一覧

---

## 🗺️ マップ編集

### マップの概念

マップ = ゲームの舞台（町、ダンジョン、フィールドなど）

- **サイズ**: 幅×高さ（タイル数）
- **タイル**: 地面・壁・装飾などの画像チップ
- **イベント**: NPCや宝箱などの動作するオブジェクト

### マップ作成

```typescript
await create_map({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame",
  map_id: 2,        // 1は既に存在するので2から
  name: "開始の町",
  width: 25,        // 横25タイル
  height: 20        // 縦20タイル
});
```

**推奨サイズ**:
- 小さな部屋: 15×15
- 町: 20×20 〜 30×30
- ダンジョン: 25×25 〜 40×40
- ワールドマップ: 50×50 〜 100×100

### マップ一覧表示

```typescript
await list_maps({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame"
});
```

### マップデータ読み取り

```typescript
await read_map({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame",
  map_id: "Map001"
});
```

### タイル配置

```typescript
await update_map_tile({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame",
  map_id: 2,
  x: 10,
  y: 5,
  layer: 0,      // 0=下層, 1=中層, 2=上層
  tile_id: 2816  // タイルID
});
```

**タイルレイヤー**:
- **Layer 0**: 地面（草・床など）
- **Layer 1**: 装飾（木・岩など）
- **Layer 2**: 上層（屋根など）
- **Layer 3**: 影・特殊効果

---

## 🎭 イベントシステム

### イベントとは

イベント = マップ上で動作するオブジェクト

**種類**:
- NPC（会話）
- 宝箱
- ショップ
- ドア・移動ポイント
- ボス戦トリガー
- カットシーン

### イベント作成

```typescript
await add_event({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame",
  map_id: 2,
  event_id: 1,
  name: "村長",
  x: 15,
  y: 10
});
```

### イベントコマンド追加

イベントが実行するアクションを設定：

#### 基本的なメッセージ表示

```typescript
// ステップ1: メッセージウィンドウ設定
await add_event_command({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame",
  map_id: 2,
  event_id: 1,
  page_index: 0,
  code: 101,
  parameters: ["", 0, 0, 2]
});

// ステップ2: 実際のメッセージ
await add_event_command({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame",
  map_id: 2,
  event_id: 1,
  page_index: 0,
  code: 401,
  parameters: ["ようこそ、我が村へ！"]
});

// ステップ3: 終了
await add_event_command({
  project_path: "/Users/yourname/Documents/RMMZ/MyGame",
  map_id: 2,
  event_id: 1,
  page_index: 0,
  code: 0,
  parameters: []
});
```

### 主要イベントコマンド

| Code | コマンド名 | 用途 | パラメータ例 |
|------|-----------|------|------------|
| **メッセージ系** ||||
| 101 | テキスト表示 | 会話開始 | `["", 0, 0, 2]` |
| 401 | テキスト | 会話内容 | `["セリフ"]` |
| 102 | 選択肢の表示 | 選択肢 | `[["はい", "いいえ"]]` |
| 402 | 選択肢分岐 | 分岐処理 | `[0, "はい"]` |
| **アイテム・所持金** ||||
| 125 | 所持金の増減 | ゴールド | `[0, 0, 100]` (100G増加) |
| 126 | アイテム増減 | アイテム入手 | `[1, 0, 0, 1]` (ID1を1個) |
| 127 | 武器の増減 | 武器入手 | `[1, 0, 0, 1]` |
| 128 | 防具の増減 | 防具入手 | `[1, 0, 0, 1]` |
| **パーティー** ||||
| 129 | パーティー編成 | メンバー追加 | `[0, 1, 1]` (アクター1追加) |
| **移動** ||||
| 201 | 場所移動 | マップ移動 | `[0, 2, 10, 10, 2, 0]` |
| **バトル** ||||
| 301 | バトル開始 | 戦闘開始 | `[0, 1, true, false]` |
| 601 | 勝った場合 | 勝利分岐 | `[]` |
| 602 | 逃げた場合 | 逃走分岐 | `[]` |
| 603 | 負けた場合 | 敗北分岐 | `[]` |
| **その他** ||||
| 111 | 条件分岐 | if文 | スイッチ・変数チェック |
| 122 | 変数の操作 | 変数設定 | `[1, 1, 0, 0, 10]` |
| 123 | セルフスイッチ | フラグON | `["A", 0]` |
| 302 | ショップの処理 | ショップ | `[[1,2,3]]` (アイテムID) |
| 314 | 全回復 | HP/MP回復 | `[]` |

### 実践例：宝箱イベント

```typescript
// 1. 宝箱イベント作成
await add_event({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 5,
  name: "宝箱",
  x: 12,
  y: 8
});

// 2. メッセージ
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 5,
  page_index: 0,
  code: 101,
  parameters: ["", 0, 0, 2]
});

await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 5,
  page_index: 0,
  code: 401,
  parameters: ["宝箱を開けた！"]
});

// 3. アイテム入手
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 5,
  page_index: 0,
  code: 126,
  parameters: [1, 0, 0, 1]  // アイテムID:1を1個
});

// 4. セルフスイッチON（開封済み）
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 5,
  page_index: 0,
  code: 123,
  parameters: ["A", 0]
});

// 5. 終了
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 5,
  page_index: 0,
  code: 0,
  parameters: []
});
```

### 実践例：ショップイベント

```typescript
// 1. ショップNPC作成
await add_event({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 6,
  name: "武器屋",
  x: 18,
  y: 12
});

// 2. メッセージ
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 6,
  page_index: 0,
  code: 101,
  parameters: ["", 0, 0, 2]
});

await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 6,
  page_index: 0,
  code: 401,
  parameters: ["いらっしゃい！武器を見ていくかい？"]
});

// 3. ショップ処理
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 6,
  page_index: 0,
  code: 302,
  parameters: [[1, 2, 3, 4, 5]]  // 販売する武器ID
});

// 4. 終了
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 6,
  page_index: 0,
  code: 0,
  parameters: []
});
```

### 実践例：宿屋イベント

```typescript
// メッセージ
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 7,
  page_index: 0,
  code: 101,
  parameters: ["", 0, 0, 2]
});

await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 7,
  page_index: 0,
  code: 401,
  parameters: ["宿屋へようこそ。50Gで休んでいきますか？"]
});

// 選択肢
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 7,
  page_index: 0,
  code: 102,
  parameters: [["はい", "いいえ"]]
});

// 「はい」の場合
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 7,
  page_index: 0,
  code: 402,
  parameters: [0, "はい"]
});

// ゴールド減少
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 7,
  page_index: 0,
  code: 125,
  parameters: [0, 0, 50]  // 50G減少
});

// 全回復
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 7,
  page_index: 0,
  code: 314,
  parameters: []
});

// 終了
await add_event_command({
  project_path: "/path/to/project",
  map_id: 2,
  event_id: 7,
  page_index: 0,
  code: 0,
  parameters: []
});
```

---

## 💾 データベース管理

### アクター（プレイヤーキャラ）

```typescript
await add_actor({
  project_path: "/path/to/project",
  id: 1,
  name: "勇者アレックス",
  class_id: 1,        // クラスID
  initial_level: 1,   // 初期レベル
  max_level: 99,      // 最大レベル
  character_name: "Actor1",  // キャラクター画像
  face_name: "Actor1"        // 顔画像
});
```

### クラス（職業）

```typescript
await add_class({
  project_path: "/path/to/project",
  id: 1,
  name: "戦士",
  traits: [
    { code: 31, dataId: 1, value: 1.2 }  // HP成長率120%
  ]
});
```

### スキル（技・魔法）

```typescript
await add_skill({
  project_path: "/path/to/project",
  id: 10,
  name: "ファイアボール",
  description: "炎の玉で敵を攻撃",
  mp_cost: 15,
  damage_formula: "a.mat * 4 - b.mdf * 2",
  scope: 1,  // 1=敵単体, 2=敵全体
  occasion: 1  // 1=バトルのみ
});
```

### アイテム

```typescript
await add_item({
  project_path: "/path/to/project",
  id: 1,
  name: "回復薬",
  description: "HPを50回復する",
  scope: "single",     // single=単体, all=全体
  occasion: "always",  // always=いつでも, battle=戦闘中
  effects: [
    { code: 11, dataId: 0, value1: 0, value2: 50 }  // HP回復50
  ]
});
```

### 敵キャラクター

```typescript
await add_enemy({
  project_path: "/path/to/project",
  id: 1,
  name: "ゴブリン",
  battler_name: "Goblin",
  params: [100, 10, 20, 15, 10, 10, 20, 10], // HP,MP,攻,防,魔攻,魔防,敏,運
  exp: 50,
  gold: 30,
  drop_items: [
    { kind: 2, dataId: 1, denominator: 3 }  // 1/3の確率でアイテム1
  ]
});
```

---

## 🤖 AI機能

### シナリオ自動生成

```typescript
await generate_and_implement_scenario({
  project_path: "/path/to/project",
  theme: "中世ファンタジー。勇者がドラゴンを倒して王女を救う",
  style: "壮大で感動的、王道のヒーローストーリー",
  length: "medium"  // short=1-2時間, medium=3-5時間, long=8-12時間
});
```

**自動生成されるもの**:
- ✅ ストーリープロット
- ✅ 3〜10個のマップ
- ✅ 主人公・仲間キャラクター
- ✅ NPC・会話イベント
- ✅ 宝箱・アイテム
- ✅ スキル設定

### バトルシステム生成

```typescript
await generate_and_implement_battle_system({
  project_path: "/path/to/project",
  difficulty: "normal",  // easy, normal, hard
  battleType: "traditional",  // traditional, tactical, fast-paced
  enemyCount: 10
});
```

**生成内容**:
- 敵キャラクター×10
- スキル設定
- 部隊編成（ランダムエンカウント用）
- バランス調整済み

### クエストシステム生成

```typescript
await generate_quest_system({
  project_path: "/path/to/project",
  questCount: 5,
  theme: "fantasy adventure"
});
```

**クエストタイプ**:
- kill: 敵を倒す
- collect: アイテム収集
- talk: NPCと会話
- visit: 場所訪問
- escort: 護衛
- investigate: 調査

### AI画像生成

```typescript
await generate_asset({
  project_path: "/path/to/project",
  assetType: "character",
  prompt: "勇敢な騎士、銀色の鎧、赤いマント、金髪、RPGツクール用ドット絵、3x4グリッド",
  filename: "Knight.png"
});
```

**アセットタイプと仕様**:

| タイプ | サイズ | グリッド | 用途 |
|--------|--------|----------|------|
| character | 144×192px | 3×4 | キャラクタースプライト |
| face | 144×144px | 2×2 | 顔グラフィック |
| enemy | 816×624px | - | 敵キャラ |
| tileset | 768×768px | 24×24 | タイルセット |
| battleback | 1000×740px | - | 戦闘背景 |
| sv_actor | 576×384px | 9×6 | サイドビューバトラー |

---

## 🔧 実践ワークフロー

### ワークフロー1: ゼロから手動で作る

```typescript
// 1. プロジェクト作成
await create_project({
  project_path: "/path/to/MyRPG",
  game_title: "勇者の旅"
});

// 2. マップ作成
await create_map({
  project_path: "/path/to/MyRPG",
  map_id: 2,
  name: "スタートの村",
  width: 20,
  height: 15
});

// 3. 主人公作成
await add_actor({
  project_path: "/path/to/MyRPG",
  id: 1,
  name: "アレックス"
});

// 4. 村長NPC
await add_event({
  project_path: "/path/to/MyRPG",
  map_id: 2,
  event_id: 1,
  name: "村長",
  x: 10,
  y: 8
});

// 5. 村長の会話
await add_event_command({...}); // code: 101
await add_event_command({...}); // code: 401
await add_event_command({...}); // code: 0

// 6. 宝箱
await add_event({...});  // 宝箱イベント
// ... イベントコマンド追加

// 7. 完成！
```

**所要時間**: 30分〜1時間

---

### ワークフロー2: AIで高速生成

```typescript
// ワンステップでゲーム完成
await generate_and_implement_scenario({
  project_path: "/path/to/MyRPG",
  theme: "中世ファンタジー冒険。勇者がドラゴンを倒す",
  style: "epic",
  length: "short"
});
```

**所要時間**: 1〜2分

---

### ワークフロー3: 最速（完全自動）

```bash
# CLIコマンド1つ
npx rpgmaker-mz-mcp auto-create "/path/to/MyRPG" "fantasy dragon adventure"
```

**所要時間**: 30秒〜3分

---

## 🔍 データベース検索・分析

### データベース統計

```typescript
await getDatabaseStatistics({
  project_path: "/path/to/project"
});
```

**取得情報**:
- アクター数
- 敵キャラ数
- スキル数
- アイテム数
- など全データベースの統計

### 名前で検索

```typescript
await searchDatabase({
  project_path: "/path/to/project",
  type: ["enemy"],
  nameContains: "dragon"
});
```

### ID範囲で検索

```typescript
await searchDatabase({
  project_path: "/path/to/project",
  type: ["item"],
  idRange: { min: 1, max: 10 }
});
```

---

## 📊 アセット分析

### アセットコンテキスト生成

```typescript
await generateAssetContext({
  project_path: "/path/to/project"
});
```

**生成内容**:
- 全アセット一覧
- 使用状況（どのマップ・キャラで使用されているか）
- 未使用アセット検出
- サイズ分析
- 最適化推奨

### アセット使用マッピング

```typescript
await generateAssetMapping({
  project_path: "/path/to/project"
});
```

**結果例**:
```json
{
  "Knight.png": ["Actor 1", "Map 2"],
  "Dragon.png": ["Enemy 5", "Troop 3"],
  "Potion.png": []  // 未使用
}
```

---

## 💡 ベストプラクティス

### 1. ID管理

```
マップID:   1, 2, 3, 4... と連番
イベントID: 各マップ内で 1, 2, 3... と連番
アクターID: 1, 2, 3... と連番
アイテムID: 1, 2, 3... と連番
```

### 2. 段階的開発

```
Phase 1: プロジェクト作成 + 基本マップ
Phase 2: 主要キャラクター・イベント配置
Phase 3: バトルシステム実装
Phase 4: アセット生成
Phase 5: バランス調整
Phase 6: テストプレイ・修正
```

### 3. バックアップ

```typescript
// 重要な変更前に
await create_snapshot({
  project_path: "/path/to/project",
  message: "Chapter 1 complete"
});

// またはバックアップ
await create_backup({
  project_path: "/path/to/project",
  backup_dir: "/path/to/backups"
});
```

### 4. パフォーマンス確認

```typescript
await analyze_performance({
  project_path: "/path/to/project"
});
```

---

## 🎓 学習パス

### 初心者（1日目）

```bash
# 1. 自動生成で完成品を見る
npx rpgmaker-mz-mcp auto-create "/path" "fantasy" --no-assets

# 2. RPG Maker MZで開いて構造を確認
# 3. データベースやイベントを眺める
```

### 初心者（2日目）

```typescript
// 1. 新しいプロジェクト作成
await create_project({...});

// 2. マップを1つ追加
await create_map({...});

// 3. NPCを1人配置
await add_event({...});
await add_event_command({...});
```

### 中級者

```typescript
// AIと手動を組み合わせ
await generate_and_implement_scenario({...});  // ベース生成
await add_event({...});                       // カスタムNPC追加
await generate_asset({...});                  // 画像生成
```

### 上級者

```typescript
// 完全制御
await create_project({...});
await create_map({...});
// ... 全てのツールを駆使
await optimize_assets({...});
await auto_balance_stats({...});
```

---

## 📚 参考資料

### 公式リソース
- **RPG Maker MZ公式ガイド**: https://rpgmakerofficial.com/product/mz/guide/
- **イベントコマンドリファレンス**: RPG Maker MZ内のヘルプ参照

### 本プロジェクトのドキュメント
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - 初心者向け
- **[WORKFLOWS.md](./WORKFLOWS.md)** - ワークフロー集
- **[AUTONOMOUS_CREATION.md](./AUTONOMOUS_CREATION.md)** - 自動生成
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - エラー対処

---

## 🎯 実践課題

### 課題1: シンプルな町を作る（30分）

1. プロジェクト作成
2. 町のマップ作成（20×15）
3. 村長NPC配置＋会話
4. 武器屋配置＋ショップ
5. 宿屋配置＋回復
6. 宝箱配置×2

### 課題2: AIで冒険ゲーム作成（5分）

```bash
npx rpgmaker-mz-mcp auto-create \
  "/path/to/Adventure" \
  "brave knight saves princess from dragon castle" \
  --length short
```

### 課題3: カスタムダンジョン（1時間）

1. AIでベース生成
2. ダンジョンマップ追加
3. ボス戦イベント追加
4. 宝箱・罠配置
5. BGM設定

---

**🎮 さあ、RPG Maker MZ MCPツールでゲーム開発を始めましょう！**