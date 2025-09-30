import * as fs from "fs/promises";
import * as path from "path";
import { FileHelper, Logger, validateProjectPath } from "./error-handling.js";

/**
 * アセットコンテキストエンジニアリング
 * プロジェクト内の全アセットを分析し、使用状況・関連性・最適化提案を生成
 */

export interface AssetInfo {
  filename: string;
  path: string;
  type: "character" | "face" | "enemy" | "tileset" | "battleback" | "sv_actor" | "picture" | "audio" | "unknown";
  size: number;
  sizeFormatted: string;
  usedBy: {
    maps?: number[];
    actors?: number[];
    enemies?: number[];
    troops?: number[];
    items?: number[];
    skills?: number[];
  };
  usageCount: number;
  isUnused: boolean;
}

export interface AssetContextReport {
  projectPath: string;
  totalAssets: number;
  totalSize: number;
  totalSizeFormatted: string;
  assetsByType: Record<string, number>;
  assetsByUsage: {
    used: number;
    unused: number;
  };
  assets: AssetInfo[];
  recommendations: string[];
}

/**
 * プロジェクト内の全アセットを分析
 */
export async function analyzeProjectAssets(projectPath: string): Promise<AssetContextReport> {
  await validateProjectPath(projectPath);
  await Logger.info("Analyzing project assets", { projectPath });

  const assets: AssetInfo[] = [];
  const assetsByType: Record<string, number> = {};

  // 画像アセット
  const imageTypes = [
    { dir: "img/characters", type: "character" as const },
    { dir: "img/faces", type: "face" as const },
    { dir: "img/enemies", type: "enemy" as const },
    { dir: "img/tilesets", type: "tileset" as const },
    { dir: "img/battlebacks1", type: "battleback" as const },
    { dir: "img/battlebacks2", type: "battleback" as const },
    { dir: "img/sv_actors", type: "sv_actor" as const },
    { dir: "img/pictures", type: "picture" as const },
  ];

  for (const { dir, type } of imageTypes) {
    const dirPath = path.join(projectPath, dir);
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (file.match(/\.(png|jpg|jpeg)$/i)) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);

          const asset: AssetInfo = {
            filename: file,
            path: filePath,
            type,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            usedBy: {},
            usageCount: 0,
            isUnused: true
          };

          assets.push(asset);
          assetsByType[type] = (assetsByType[type] || 0) + 1;
        }
      }
    } catch (error) {
      // ディレクトリが存在しない場合はスキップ
    }
  }

  // 音声アセット
  const audioTypes = ["bgm", "bgs", "me", "se"];
  for (const audioType of audioTypes) {
    const dirPath = path.join(projectPath, "audio", audioType);
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (file.match(/\.(ogg|m4a|mp3)$/i)) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);

          const asset: AssetInfo = {
            filename: file,
            path: filePath,
            type: "audio",
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            usedBy: {},
            usageCount: 0,
            isUnused: true
          };

          assets.push(asset);
          assetsByType["audio"] = (assetsByType["audio"] || 0) + 1;
        }
      }
    } catch (error) {
      // ディレクトリが存在しない場合はスキップ
    }
  }

  // 使用状況を分析
  await analyzeAssetUsage(projectPath, assets);

  // 推奨事項を生成
  const recommendations = generateRecommendations(assets);

  const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
  const usedCount = assets.filter(a => !a.isUnused).length;
  const unusedCount = assets.filter(a => a.isUnused).length;

  await Logger.info("Asset analysis complete", {
    totalAssets: assets.length,
    used: usedCount,
    unused: unusedCount
  });

  return {
    projectPath,
    totalAssets: assets.length,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    assetsByType,
    assetsByUsage: {
      used: usedCount,
      unused: unusedCount
    },
    assets,
    recommendations
  };
}

/**
 * アセットの使用状況を分析
 */
async function analyzeAssetUsage(projectPath: string, assets: AssetInfo[]): Promise<void> {
  const dataDir = path.join(projectPath, "data");

  try {
    // Actors.json をチェック
    const actors = await FileHelper.readJSON(path.join(dataDir, "Actors.json"));
    for (const actor of actors) {
      if (!actor) continue;

      // キャラクター画像
      if (actor.characterName) {
        const asset = assets.find(a =>
          a.filename === `${actor.characterName}.png` && a.type === "character"
        );
        if (asset) {
          asset.usedBy.actors = asset.usedBy.actors || [];
          asset.usedBy.actors.push(actor.id);
          asset.usageCount++;
          asset.isUnused = false;
        }
      }

      // 顔画像
      if (actor.faceName) {
        const asset = assets.find(a =>
          a.filename === `${actor.faceName}.png` && a.type === "face"
        );
        if (asset) {
          asset.usedBy.actors = asset.usedBy.actors || [];
          asset.usedBy.actors.push(actor.id);
          asset.usageCount++;
          asset.isUnused = false;
        }
      }
    }

    // Enemies.json をチェック
    const enemies = await FileHelper.readJSON(path.join(dataDir, "Enemies.json"));
    for (const enemy of enemies) {
      if (!enemy) continue;

      if (enemy.battlerName) {
        const asset = assets.find(a =>
          a.filename === `${enemy.battlerName}.png` && a.type === "enemy"
        );
        if (asset) {
          asset.usedBy.enemies = asset.usedBy.enemies || [];
          asset.usedBy.enemies.push(enemy.id);
          asset.usageCount++;
          asset.isUnused = false;
        }
      }
    }

    // MapInfos.json でマップ一覧取得
    const mapInfos = await FileHelper.readJSON(path.join(dataDir, "MapInfos.json"));
    for (let i = 0; i < mapInfos.length; i++) {
      if (!mapInfos[i]) continue;

      try {
        const mapFile = `Map${String(i).padStart(3, "0")}.json`;
        const mapData = await FileHelper.readJSON(path.join(dataDir, mapFile));

        // タイルセット使用チェック
        if (mapData.tilesetId) {
          const tilesets = await FileHelper.readJSON(path.join(dataDir, "Tilesets.json"));
          const tileset = tilesets[mapData.tilesetId];
          if (tileset && tileset.tilesetNames) {
            for (const tilesetName of tileset.tilesetNames) {
              if (tilesetName) {
                const asset = assets.find(a =>
                  a.filename === `${tilesetName}.png` && a.type === "tileset"
                );
                if (asset) {
                  asset.usedBy.maps = asset.usedBy.maps || [];
                  asset.usedBy.maps.push(i);
                  asset.usageCount++;
                  asset.isUnused = false;
                }
              }
            }
          }
        }

        // BGM使用チェック
        if (mapData.bgm && mapData.bgm.name) {
          const asset = assets.find(a =>
            a.filename.startsWith(mapData.bgm.name) && a.type === "audio"
          );
          if (asset) {
            asset.usedBy.maps = asset.usedBy.maps || [];
            asset.usedBy.maps.push(i);
            asset.usageCount++;
            asset.isUnused = false;
          }
        }
      } catch (error) {
        // マップファイルが存在しない場合はスキップ
      }
    }
  } catch (error) {
    await Logger.warn("Failed to analyze asset usage", { error });
  }
}

/**
 * 推奨事項を生成
 */
function generateRecommendations(assets: AssetInfo[]): string[] {
  const recommendations: string[] = [];

  // 未使用アセット
  const unusedAssets = assets.filter(a => a.isUnused);
  if (unusedAssets.length > 0) {
    const unusedSize = unusedAssets.reduce((sum, a) => sum + a.size, 0);
    recommendations.push(
      `🗑️ ${unusedAssets.length}個の未使用アセットを削除すると ${formatBytes(unusedSize)} 節約できます`
    );
  }

  // 大きなファイル
  const largeAssets = assets.filter(a => a.size > 1024 * 1024); // 1MB以上
  if (largeAssets.length > 0) {
    recommendations.push(
      `📉 ${largeAssets.length}個の大きなファイルを最適化することを推奨します`
    );
  }

  // 重複の可能性
  const assetNames = assets.map(a => a.filename.toLowerCase());
  const duplicates = assetNames.filter((name, index) =>
    assetNames.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    recommendations.push(
      `⚠️ 同名のアセットが${duplicates.length}個あります（重複の可能性）`
    );
  }

  // 使用されているアセット数
  const usedAssets = assets.filter(a => !a.isUnused);
  if (usedAssets.length > 0) {
    recommendations.push(
      `✅ ${usedAssets.length}個のアセットが正しく使用されています`
    );
  }

  // アセットタイプのバランス
  const characterCount = assets.filter(a => a.type === "character").length;
  const enemyCount = assets.filter(a => a.type === "enemy").length;
  if (characterCount === 0 && enemyCount > 0) {
    recommendations.push(
      `💡 キャラクタースプライトを追加することを推奨します`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("✨ プロジェクトのアセット構成は良好です");
  }

  return recommendations;
}

/**
 * アセットコンテキストドキュメントを生成
 */
export async function generateAssetContext(projectPath: string): Promise<{ success: boolean; context?: string; error?: string }> {
  try {
    await Logger.info("Generating asset context", { projectPath });

    const report = await analyzeProjectAssets(projectPath);

    let context = `# 🎨 アセットコンテキストレポート\n\n`;
    context += `**プロジェクト**: ${projectPath}\n`;
    context += `**生成日時**: ${new Date().toLocaleString("ja-JP")}\n\n`;
    context += `---\n\n`;

    // サマリー
    context += `## 📊 サマリー\n\n`;
    context += `- **総アセット数**: ${report.totalAssets}個\n`;
    context += `- **総サイズ**: ${report.totalSizeFormatted}\n`;
    context += `- **使用中**: ${report.assetsByUsage.used}個\n`;
    context += `- **未使用**: ${report.assetsByUsage.unused}個\n\n`;

    // タイプ別統計
    context += `## 🗂️ タイプ別統計\n\n`;
    context += `| タイプ | 数量 |\n`;
    context += `|--------|------|\n`;
    for (const [type, count] of Object.entries(report.assetsByType)) {
      const icon = getTypeIcon(type);
      context += `| ${icon} ${type} | ${count} |\n`;
    }
    context += `\n`;

    // 使用状況詳細
    context += `## 📋 使用状況詳細\n\n`;

    // 使用中のアセット
    const usedAssets = report.assets.filter(a => !a.isUnused);
    if (usedAssets.length > 0) {
      context += `### ✅ 使用中のアセット (${usedAssets.length}個)\n\n`;
      context += `| ファイル名 | タイプ | サイズ | 使用箇所 |\n`;
      context += `|-----------|--------|--------|----------|\n`;
      for (const asset of usedAssets.slice(0, 20)) {
        const usage = formatUsage(asset.usedBy);
        context += `| ${asset.filename} | ${asset.type} | ${asset.sizeFormatted} | ${usage} |\n`;
      }
      if (usedAssets.length > 20) {
        context += `\n*...他 ${usedAssets.length - 20}個*\n`;
      }
      context += `\n`;
    }

    // 未使用のアセット
    const unusedAssets = report.assets.filter(a => a.isUnused);
    if (unusedAssets.length > 0) {
      context += `### 🗑️ 未使用アセット (${unusedAssets.length}個)\n\n`;
      context += `| ファイル名 | タイプ | サイズ |\n`;
      context += `|-----------|--------|--------|\n`;
      for (const asset of unusedAssets.slice(0, 20)) {
        context += `| ${asset.filename} | ${asset.type} | ${asset.sizeFormatted} |\n`;
      }
      if (unusedAssets.length > 20) {
        context += `\n*...他 ${unusedAssets.length - 20}個*\n`;
      }
      context += `\n`;

      const unusedSize = unusedAssets.reduce((sum, a) => sum + a.size, 0);
      context += `💡 **未使用アセットを削除すると ${formatBytes(unusedSize)} 節約できます**\n\n`;
    }

    // 推奨事項
    context += `## 💡 推奨事項\n\n`;
    for (const rec of report.recommendations) {
      context += `- ${rec}\n`;
    }
    context += `\n`;

    // 大きなファイル
    const largeAssets = report.assets
      .filter(a => a.size > 500 * 1024)
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    if (largeAssets.length > 0) {
      context += `## 📦 最大ファイル (Top 10)\n\n`;
      context += `| ファイル名 | タイプ | サイズ | 使用状況 |\n`;
      context += `|-----------|--------|--------|----------|\n`;
      for (const asset of largeAssets) {
        const status = asset.isUnused ? "❌ 未使用" : "✅ 使用中";
        context += `| ${asset.filename} | ${asset.type} | ${asset.sizeFormatted} | ${status} |\n`;
      }
      context += `\n`;
    }

    await Logger.info("Asset context generated", {
      totalAssets: report.totalAssets,
      used: report.assetsByUsage.used,
      unused: report.assetsByUsage.unused
    });

    return { success: true, context };
  } catch (error) {
    await Logger.error("Failed to generate asset context", { projectPath, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * アセットマッピングを生成（どのアセットがどこで使われているか）
 */
export async function generateAssetMapping(projectPath: string): Promise<{
  success: boolean;
  mapping?: Record<string, string[]>;
  error?: string;
}> {
  try {
    await Logger.info("Generating asset mapping", { projectPath });

    const report = await analyzeProjectAssets(projectPath);
    const mapping: Record<string, string[]> = {};

    for (const asset of report.assets) {
      const usageList: string[] = [];

      if (asset.usedBy.actors) {
        usageList.push(...asset.usedBy.actors.map(id => `Actor ${id}`));
      }
      if (asset.usedBy.enemies) {
        usageList.push(...asset.usedBy.enemies.map(id => `Enemy ${id}`));
      }
      if (asset.usedBy.maps) {
        usageList.push(...asset.usedBy.maps.map(id => `Map ${id}`));
      }
      if (asset.usedBy.troops) {
        usageList.push(...asset.usedBy.troops.map(id => `Troop ${id}`));
      }

      mapping[asset.filename] = usageList;
    }

    return { success: true, mapping };
  } catch (error) {
    await Logger.error("Failed to generate asset mapping", { projectPath, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 未使用アセットを自動削除
 */
export async function removeUnusedAssets(
  projectPath: string,
  dryRun = true
): Promise<{
  success: boolean;
  removed?: string[];
  savedSpace?: number;
  error?: string;
}> {
  try {
    await Logger.info("Removing unused assets", { projectPath, dryRun });

    const report = await analyzeProjectAssets(projectPath);
    const unusedAssets = report.assets.filter(a => a.isUnused);
    const removed: string[] = [];
    let savedSpace = 0;

    for (const asset of unusedAssets) {
      if (!dryRun) {
        await fs.unlink(asset.path);
      }
      removed.push(asset.filename);
      savedSpace += asset.size;
    }

    const message = dryRun
      ? `Would remove ${removed.length} files (${formatBytes(savedSpace)})`
      : `Removed ${removed.length} files (${formatBytes(savedSpace)})`;

    await Logger.info(message, { count: removed.length, savedSpace });

    return {
      success: true,
      removed,
      savedSpace
    };
  } catch (error) {
    await Logger.error("Failed to remove unused assets", { projectPath, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * ヘルパー関数
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

function formatUsage(usedBy: AssetInfo["usedBy"]): string {
  const parts: string[] = [];
  if (usedBy.actors?.length) parts.push(`Actor:${usedBy.actors.length}`);
  if (usedBy.enemies?.length) parts.push(`Enemy:${usedBy.enemies.length}`);
  if (usedBy.maps?.length) parts.push(`Map:${usedBy.maps.length}`);
  if (usedBy.troops?.length) parts.push(`Troop:${usedBy.troops.length}`);
  if (usedBy.items?.length) parts.push(`Item:${usedBy.items.length}`);
  if (usedBy.skills?.length) parts.push(`Skill:${usedBy.skills.length}`);
  return parts.length > 0 ? parts.join(", ") : "None";
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    character: "🚶",
    face: "😊",
    enemy: "👹",
    tileset: "🗺️",
    battleback: "⚔️",
    sv_actor: "🗡️",
    picture: "🖼️",
    audio: "🔊"
  };
  return icons[type] || "📄";
}