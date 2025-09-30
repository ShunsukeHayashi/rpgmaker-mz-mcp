# RPG Maker MZ リソースマッピング完全ガイド

**作成日**: 2025-10-01
**対象**: RPG Maker MZ v1.9.1
**インストールパス**: `/Users/shunsuke/Library/Application Support/Steam/steamapps/common/RPG Maker MZ`

---

## 📊 リソース統計

| カテゴリ | ファイル数 | サイズ | 場所 |
|---|---|---|---|
| **DLCリソース** | 1,319 | 76MB | `dlc/` |
| **ジェネレーター** | 4,227 | 19MB | `generator/` |
| **アプリケーション** | - | 1.2GB | `RPGMZ.app/` |
| **合計** | 5,546+ | ~1.3GB | - |

---

## 🗂️ ディレクトリ構造

```
RPG Maker MZ/
├── RPGMZ.app/              # アプリケーション本体 (1.2GB)
│   ├── Contents/
│   │   ├── MacOS/          # 実行ファイル
│   │   ├── Frameworks/     # フレームワーク
│   │   ├── PlugIns/        # プラグイン
│   │   └── Resources/      # アプリリソース
│
├── dlc/                    # DLCパック (76MB, 1,319ファイル)
│   ├── BasicResources/     # 基本リソースパック
│   │   ├── generator/      # キャラクタージェネレーター素材
│   │   ├── pictures/       # ピクチャ素材
│   │   ├── plugins/        # プラグイン
│   │   ├── system/         # システム画像
│   │   └── tilesets/       # タイルセット
│   │
│   ├── FantasyResourcePack/  # ファンタジーリソースパック
│   │   ├── bgm/            # BGM
│   │   └── img/            # 画像素材
│   │
│   ├── NpcResourcePack/    # NPCリソースパック
│   │   ├── Generator/      # ジェネレーター設定
│   │   ├── characters/     # キャラクター画像
│   │   ├── faces/          # 顔画像
│   │   └── pictures/       # ピクチャ
│   │
│   └── RemakeMapResourcePack/  # リメイクマップパック
│       ├── MV_SampleMap_en/
│       ├── MV_SampleMap_ja/
│       ├── VXA_SampleMap_en/
│       ├── VXA_SampleMap_ja/
│       └── img/
│
└── generator/              # キャラクタージェネレーター (19MB, 4,227ファイル)
    ├── Face/               # 顔画像パーツ
    │   ├── Female/
    │   ├── Kid/
    │   └── Male/
    ├── SV/                 # サイドビュー画像パーツ
    │   ├── Female/
    │   ├── Kid/
    │   └── Male/
    ├── TV/                 # トップビュー画像パーツ
    │   ├── Female/
    │   ├── Kid/
    │   └── Male/
    ├── TVD/                # トップビュー（ダメージ）
    │   ├── Female/
    │   ├── Kid/
    │   └── Male/
    └── Variation/          # バリエーション
        ├── Female/
        ├── Kid/
        └── Male/
```

---

## 📦 DLCリソース詳細

### 1. BasicResources

#### Plugins (プラグイン)

**Official Plugins** (`dlc/BasicResources/plugins/official/`)
- `CustomLogo.js` - カスタムロゴ
- `EventCommandByCode.js` - イベントコマンド拡張
- `ExtraImage.js` - 追加画像機能
- `ExtraWindow.js` - 追加ウィンドウ
- `MaterialBase.js` - マテリアルベース
- `OverpassTile.js` - 通過可能タイル
- `PluginCommonBase.js` - プラグイン共通ベース
- `RegionBase.js` - リージョンベース
- `TextScriptBase.js` - テキストスクリプト
- `UniqueDataLoader.js` - ユニークデータローダー

**Launch Plugins** (`dlc/BasicResources/plugins/launch/`)
主要なプラグイン:
- `Yami_8DirEx.js` - 8方向移動拡張
- `EventReSpawn.js` - イベント再出現
- `StartUpFullScreen.js` - フルスクリーン起動
- `ShakeOnDamage.js` - ダメージ時シェイク
- `Foreground.js` - 前景表示
- `SimplePassiveSkillMZ.js` - パッシブスキル
- `MessageWindowPopup.js` - メッセージポップアップ
- `wasdKeyMZ.js` - WASDキー操作
- `BattleVoiceMZ.js` - 戦闘ボイス
- `AltMenuScreen2MZ.js` - 代替メニュー画面
- `ScreenZoom.js` - 画面ズーム
- `PictureAnimation.js` - ピクチャアニメーション

#### System Resources
- `Logo.png` (15KB) - デフォルトロゴ
- `Logo1.png` (12KB) - 代替ロゴ

#### Generator Parts
キャラクター生成用のパーツ素材が格納されています。

### 2. FantasyResourcePack

**BGM** (`dlc/FantasyResourcePack/bgm/`)
- `RPGM-FantasyResource01.ogg` (96kbps / 500kbps)
- `RPGM-FantasyResource02.ogg` (96kbps / 500kbps)

**Images** (`dlc/FantasyResourcePack/img/`)
- `characters/` - Soldiers.png, Soldiers_down.png
- `face/` - Soldiers.png
- `enemies/` - Scholar.png, Soldier_male.png, Soldier_female.png
- `sv_actors/` - サイドビューアクター
- `sv_enemies/` - サイドビュー敵キャラ
- `generator/` - JSON設定ファイル

### 3. NpcResourcePack

**Generator** - キャラクター生成用設定
**Characters** - NPCキャラクター画像
**Faces** - NPC顔画像
**Pictures** - NPC関連ピクチャ

### 4. RemakeMapResourcePack

RPG Maker MV / VX Aceからのリメイク用サンプルマップ
- 英語版・日本語版の両方を収録
- 完成したマップのサンプルとして利用可能

---

## 🎨 キャラクタージェネレーター

### ジェネレーター構造

4つのビュータイプ × 3つの性別カテゴリ = 12のメインカテゴリ

**ビュータイプ**:
1. **Face** - 顔画像（メニュー、会話用）
2. **SV** (Side View) - サイドビュー戦闘用
3. **TV** (Top View) - トップビュー（マップ歩行用）
4. **TVD** (Top View Damage) - トップビューダメージ版

**性別カテゴリ**:
- Female (女性)
- Kid (子供)
- Male (男性)

### パーツの種類

各カテゴリに以下のパーツが含まれます:
- **Body** - 体（肌の色）
- **FrontHair** - 前髪
- **RearHair** - 後ろ髪
- **Eyes** - 目
- **Ears** - 耳
- **BeastEars** - 獣耳
- **Nose** - 鼻
- **Mouth** - 口
- **Beard** - ひげ（Male）
- **Clothing1** - 服（下層）
- **Clothing2** - 服（上層）
- **Cloak** - マント
- **AccA** - アクセサリA
- **AccB** - アクセサリB
- **Glasses** - 眼鏡
- **Weapon** - 武器（SV専用）

### カラーバリエーション

パーツ名の末尾に `_c` が付くファイルはカラーバリエーション:
- `SV_FrontHair_p06.png` - 基本色
- `SV_FrontHair_p06_c.png` - カラーバリエーション

### Odd-Eye Bodies

特殊な虹彩色のバリエーション:
- `left_blue/` - 左目が青
- `left_green/` - 左目が緑
- `left_red/` - 左目が赤
- `left_yellow/` - 左目が黄色

---

## 🔧 プロジェクトへの適用方法

### リソースのコピー

新規プロジェクトにリソースを追加する場合:

```bash
# DLCリソースからコピー
cp -r "/Users/shunsuke/Library/Application Support/Steam/steamapps/common/RPG Maker MZ/dlc/FantasyResourcePack/bgm" "/path/to/your/project/audio/"

# ジェネレーターパーツからコピー
cp -r "/Users/shunsuke/Library/Application Support/Steam/steamapps/common/RPG Maker MZ/generator" "/path/to/your/project/"
```

### プラグインの追加

1. プラグインファイルをコピー:
```bash
cp "/Users/shunsuke/Library/Application Support/Steam/steamapps/common/RPG Maker MZ/dlc/BasicResources/plugins/official/PluginName.js" "/path/to/your/project/js/plugins/"
```

2. RPG Maker MZエディタでプラグイン管理から有効化

---

## 📁 プロジェクトとの対応関係

### ゲームプロジェクト構造

```
YourGame/
├── audio/
│   ├── bgm/        ← dlc/.../bgm からコピー
│   ├── bgs/
│   ├── me/
│   └── se/
├── data/
│   ├── System.json ← ゲーム設定
│   ├── MapXXX.json ← マップデータ
│   └── ...
├── effects/        ← エフェクト
├── img/
│   ├── characters/ ← generator で生成 or dlc からコピー
│   ├── faces/      ← generator で生成 or dlc からコピー
│   ├── sv_actors/  ← generator で生成 or dlc からコピー
│   └── ...
└── js/
    └── plugins/    ← dlc/.../plugins からコピー
```

---

## 🎯 MCPツールでの活用

### リソース参照

MCPツールで自動生成する際のリソース参照:

```javascript
// ジェネレーターパーツの参照
const generatorBase = "/Users/shunsuke/Library/Application Support/Steam/steamapps/common/RPG Maker MZ/generator";

// DLCリソースの参照
const dlcBase = "/Users/shunsuke/Library/Application Support/Steam/steamapps/common/RPG Maker MZ/dlc";

// FantasyResourcePackのBGM
const fantasyBGM = `${dlcBase}/FantasyResourcePack/bgm/ogg/96kbps/RPGM-FantasyResource01.ogg`;
```

### アセット自動配置

プロジェクト作成時に自動的にリソースをコピー:
1. 必要なDLCパックを特定
2. プロジェクトディレクトリに適切なリソースをコピー
3. データベースに参照を登録

---

## 📋 チェックリスト

### 新規プロジェクト作成時

- [ ] プロジェクトディレクトリ作成
- [ ] 基本ディレクトリ構造作成（audio, data, img, js, effects）
- [ ] デフォルトリソースのコピー
- [ ] System.jsonの初期設定
- [ ] MapInfos.jsonの作成
- [ ] 必要なプラグインのコピーと設定

### リソース追加時

- [ ] DLCパスの確認
- [ ] ターゲットディレクトリの確認
- [ ] ファイル名の重複チェック
- [ ] データベースへの登録
- [ ] エディタでの確認

---

## 🚨 注意事項

### ライセンスとクレジット

- **BasicResources**: RPG Maker MZのライセンスに従う
- **FantasyResourcePack**: クレジット表記必要（`credit.txt`参照）
- **NpcResourcePack**: クレジット表記必要
- **ジェネレーター**: 生成したキャラクターは自由に利用可能

### パフォーマンス考慮

- **大量のファイルコピーは避ける**: 必要なリソースのみ選択的にコピー
- **画像サイズの最適化**: 必要に応じてリサイズ
- **BGM品質**: 96kbpsで十分な場合が多い（500kbpsは高品質だがサイズ大）

### バージョン管理

- リソースファイルは`.gitignore`に追加することを推奨
- プロジェクトにはリソースのコピー手順を文書化
- MCPツールで自動化する場合は、リソースパスを環境変数で管理

---

## 🔗 関連ファイル

- [PROJECT_INDEX.md](file:///Users/shunsuke/Dev/CreatorsRevolution/Test/PROJECT_INDEX.md) - プロジェクトインデックス
- [CLAUDE.md](file:///Users/shunsuke/Dev/RPG/CLAUDE.md) - 開発ガイドライン

---

## 📞 参考情報

**RPG Maker MZ 公式サイト**: https://www.rpgmakerweb.com/products/rpg-maker-mz
**コミュニティフォーラム**: https://forums.rpgmakerweb.com/
**プラグインドキュメント**: RPG Maker MZ内のヘルプメニュー参照
