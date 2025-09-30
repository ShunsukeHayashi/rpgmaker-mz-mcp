import * as fs from "fs/promises";
import * as path from "path";
import { FileHelper, Logger, validateProjectPath } from "./error-handling.js";

/**
 * データベースインデックスシステム
 * RPG Maker MZの全データベースを高速検索可能に
 */

export interface DatabaseIndex {
  projectPath: string;
  lastUpdated: string;
  actors: Map<number, any>;
  classes: Map<number, any>;
  skills: Map<number, any>;
  items: Map<number, any>;
  weapons: Map<number, any>;
  armors: Map<number, any>;
  enemies: Map<number, any>;
  troops: Map<number, any>;
  states: Map<number, any>;
  animations: Map<number, any>;
  tilesets: Map<number, any>;
  commonEvents: Map<number, any>;
  nameIndex: Map<string, { type: string; id: number }[]>;
}

export interface SearchOptions {
  type?: string[];
  nameContains?: string;
  idRange?: { min?: number; max?: number };
  hasProperty?: string;
}

export interface SearchResult {
  type: string;
  id: number;
  name: string;
  data: any;
}

/**
 * データベースインデックスを構築
 */
export async function buildDatabaseIndex(projectPath: string): Promise<DatabaseIndex> {
  await validateProjectPath(projectPath);
  await Logger.info("Building database index", { projectPath });

  const dataDir = path.join(projectPath, "data");
  const index: DatabaseIndex = {
    projectPath,
    lastUpdated: new Date().toISOString(),
    actors: new Map(),
    classes: new Map(),
    skills: new Map(),
    items: new Map(),
    weapons: new Map(),
    armors: new Map(),
    enemies: new Map(),
    troops: new Map(),
    states: new Map(),
    animations: new Map(),
    tilesets: new Map(),
    commonEvents: new Map(),
    nameIndex: new Map()
  };

  // 各データベースファイルを読み込み
  const databases = [
    { file: "Actors.json", map: index.actors, type: "actor" },
    { file: "Classes.json", map: index.classes, type: "class" },
    { file: "Skills.json", map: index.skills, type: "skill" },
    { file: "Items.json", map: index.items, type: "item" },
    { file: "Weapons.json", map: index.weapons, type: "weapon" },
    { file: "Armors.json", map: index.armors, type: "armor" },
    { file: "Enemies.json", map: index.enemies, type: "enemy" },
    { file: "Troops.json", map: index.troops, type: "troop" },
    { file: "States.json", map: index.states, type: "state" },
    { file: "Animations.json", map: index.animations, type: "animation" },
    { file: "Tilesets.json", map: index.tilesets, type: "tileset" },
    { file: "CommonEvents.json", map: index.commonEvents, type: "commonEvent" }
  ];

  for (const { file, map, type } of databases) {
    try {
      const data = await FileHelper.readJSON(path.join(dataDir, file));

      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (item && item.id !== undefined) {
            map.set(item.id, item);

            // 名前インデックスに追加
            if (item.name) {
              const key = item.name.toLowerCase();
              if (!index.nameIndex.has(key)) {
                index.nameIndex.set(key, []);
              }
              index.nameIndex.get(key)!.push({ type, id: item.id });
            }
          }
        }
      }
    } catch (error) {
      await Logger.warn(`Failed to load ${file}`, { error });
    }
  }

  const totalEntries =
    index.actors.size +
    index.classes.size +
    index.skills.size +
    index.items.size +
    index.weapons.size +
    index.armors.size +
    index.enemies.size +
    index.troops.size +
    index.states.size +
    index.animations.size +
    index.tilesets.size +
    index.commonEvents.size;

  await Logger.info("Database index built", {
    totalEntries,
    uniqueNames: index.nameIndex.size
  });

  return index;
}

/**
 * データベースを検索
 */
export async function searchDatabase(
  projectPath: string,
  options: SearchOptions
): Promise<{ success: boolean; results?: SearchResult[]; error?: string }> {
  try {
    await Logger.info("Searching database", { projectPath, options });

    const index = await buildDatabaseIndex(projectPath);
    const results: SearchResult[] = [];

    // 検索対象のタイプを決定
    const types = options.type || [
      "actor",
      "class",
      "skill",
      "item",
      "weapon",
      "armor",
      "enemy",
      "troop",
      "state",
      "animation",
      "tileset",
      "commonEvent"
    ];

    for (const type of types) {
      let dataMap: Map<number, any>;

      switch (type) {
        case "actor":
          dataMap = index.actors;
          break;
        case "class":
          dataMap = index.classes;
          break;
        case "skill":
          dataMap = index.skills;
          break;
        case "item":
          dataMap = index.items;
          break;
        case "weapon":
          dataMap = index.weapons;
          break;
        case "armor":
          dataMap = index.armors;
          break;
        case "enemy":
          dataMap = index.enemies;
          break;
        case "troop":
          dataMap = index.troops;
          break;
        case "state":
          dataMap = index.states;
          break;
        case "animation":
          dataMap = index.animations;
          break;
        case "tileset":
          dataMap = index.tilesets;
          break;
        case "commonEvent":
          dataMap = index.commonEvents;
          break;
        default:
          continue;
      }

      for (const [id, data] of dataMap.entries()) {
        // ID範囲フィルター
        if (options.idRange) {
          if (options.idRange.min !== undefined && id < options.idRange.min) continue;
          if (options.idRange.max !== undefined && id > options.idRange.max) continue;
        }

        // 名前検索フィルター
        if (options.nameContains) {
          const name = (data.name || "").toLowerCase();
          if (!name.includes(options.nameContains.toLowerCase())) continue;
        }

        // プロパティ存在フィルター
        if (options.hasProperty) {
          if (!(options.hasProperty in data)) continue;
        }

        results.push({
          type,
          id,
          name: data.name || `${type} ${id}`,
          data
        });
      }
    }

    await Logger.info("Database search complete", {
      resultsCount: results.length
    });

    return { success: true, results };
  } catch (error) {
    await Logger.error("Failed to search database", { projectPath, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * ID でデータベースエントリを取得
 */
export async function getDatabaseEntry(
  projectPath: string,
  type: string,
  id: number
): Promise<{ success: boolean; entry?: any; error?: string }> {
  try {
    const index = await buildDatabaseIndex(projectPath);

    let dataMap: Map<number, any> | undefined;

    switch (type) {
      case "actor":
        dataMap = index.actors;
        break;
      case "class":
        dataMap = index.classes;
        break;
      case "skill":
        dataMap = index.skills;
        break;
      case "item":
        dataMap = index.items;
        break;
      case "weapon":
        dataMap = index.weapons;
        break;
      case "armor":
        dataMap = index.armors;
        break;
      case "enemy":
        dataMap = index.enemies;
        break;
      case "troop":
        dataMap = index.troops;
        break;
      default:
        return {
          success: false,
          error: `Unknown database type: ${type}`
        };
    }

    const entry = dataMap.get(id);

    if (!entry) {
      return {
        success: false,
        error: `Entry not found: ${type} ${id}`
      };
    }

    return { success: true, entry };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * データベース統計を生成
 */
export async function getDatabaseStatistics(
  projectPath: string
): Promise<{
  success: boolean;
  stats?: {
    actors: number;
    classes: number;
    skills: number;
    items: number;
    weapons: number;
    armors: number;
    enemies: number;
    troops: number;
    states: number;
    animations: number;
    tilesets: number;
    commonEvents: number;
    total: number;
  };
  error?: string;
}> {
  try {
    const index = await buildDatabaseIndex(projectPath);

    const stats = {
      actors: index.actors.size,
      classes: index.classes.size,
      skills: index.skills.size,
      items: index.items.size,
      weapons: index.weapons.size,
      armors: index.armors.size,
      enemies: index.enemies.size,
      troops: index.troops.size,
      states: index.states.size,
      animations: index.animations.size,
      tilesets: index.tilesets.size,
      commonEvents: index.commonEvents.size,
      total:
        index.actors.size +
        index.classes.size +
        index.skills.size +
        index.items.size +
        index.weapons.size +
        index.armors.size +
        index.enemies.size +
        index.troops.size +
        index.states.size +
        index.animations.size +
        index.tilesets.size +
        index.commonEvents.size
    };

    return { success: true, stats };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * データベース全体のコンテキストドキュメントを生成
 */
export async function generateDatabaseContext(projectPath: string): Promise<{ success: boolean; context?: string; error?: string }> {
  try {
    await Logger.info("Generating database context", { projectPath });

    const index = await buildDatabaseIndex(projectPath);

    let context = `# 🗄️ Database Context Report\n\n`;
    context += `**Project**: ${projectPath}\n`;
    context += `**Generated**: ${new Date().toLocaleString("ja-JP")}\n\n`;
    context += `---\n\n`;

    // Statistics
    context += `## 📊 Statistics\n\n`;
    context += `| Type | Count |\n`;
    context += `|------|-------|\n`;
    context += `| 👤 Actors | ${index.actors.size} |\n`;
    context += `| 🎓 Classes | ${index.classes.size} |\n`;
    context += `| ⚡ Skills | ${index.skills.size} |\n`;
    context += `| 🎒 Items | ${index.items.size} |\n`;
    context += `| 🗡️ Weapons | ${index.weapons.size} |\n`;
    context += `| 🛡️ Armors | ${index.armors.size} |\n`;
    context += `| 👹 Enemies | ${index.enemies.size} |\n`;
    context += `| ⚔️ Troops | ${index.troops.size} |\n`;
    context += `| 💫 States | ${index.states.size} |\n`;
    context += `| 🎬 Animations | ${index.animations.size} |\n`;
    context += `| 🗺️ Tilesets | ${index.tilesets.size} |\n`;
    context += `| 📅 Common Events | ${index.commonEvents.size} |\n`;
    context += `\n`;

    // Actors
    if (index.actors.size > 0) {
      context += `## 👤 Actors (${index.actors.size})\n\n`;
      context += `| ID | Name | Class | Level |\n`;
      context += `|----|------|-------|-------|\n`;
      for (const [id, actor] of index.actors) {
        context += `| ${id} | ${actor.name} | ${actor.classId} | ${actor.initialLevel} |\n`;
      }
      context += `\n`;
    }

    // Enemies
    if (index.enemies.size > 0) {
      context += `## 👹 Enemies (${index.enemies.size})\n\n`;
      context += `| ID | Name | HP | EXP | Gold |\n`;
      context += `|----|------|----|-----|------|\n`;
      for (const [id, enemy] of index.enemies) {
        const hp = enemy.params ? enemy.params[0] : 0;
        context += `| ${id} | ${enemy.name} | ${hp} | ${enemy.exp} | ${enemy.gold} |\n`;
      }
      context += `\n`;
    }

    // Skills
    if (index.skills.size > 0) {
      context += `## ⚡ Skills (${index.skills.size})\n\n`;
      context += `| ID | Name | MP Cost | Type |\n`;
      context += `|----|------|---------|------|\n`;
      for (const [id, skill] of index.skills) {
        const stypeId = skill.stypeId || 0;
        context += `| ${id} | ${skill.name} | ${skill.mpCost || 0} | ${stypeId} |\n`;
      }
      context += `\n`;
    }

    // Items
    if (index.items.size > 0) {
      context += `## 🎒 Items (${index.items.size})\n\n`;
      context += `| ID | Name | Type | Description |\n`;
      context += `|----|------|------|-------------|\n`;
      for (const [id, item] of index.items) {
        const desc = (item.description || "").substring(0, 50);
        context += `| ${id} | ${item.name} | ${item.itypeId || 0} | ${desc} |\n`;
      }
      context += `\n`;
    }

    // Troops
    if (index.troops.size > 0) {
      context += `## ⚔️ Troops (${index.troops.size})\n\n`;
      context += `| ID | Name | Members |\n`;
      context += `|----|------|----------|\n`;
      for (const [id, troop] of index.troops) {
        const memberCount = troop.members ? troop.members.length : 0;
        context += `| ${id} | ${troop.name} | ${memberCount} |\n`;
      }
      context += `\n`;
    }

    await Logger.info("Database context generated");

    return { success: true, context };
  } catch (error) {
    await Logger.error("Failed to generate database context", { projectPath, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 名前でデータベースエントリを検索
 */
export async function findByName(
  projectPath: string,
  name: string
): Promise<{ success: boolean; results?: SearchResult[]; error?: string }> {
  try {
    const index = await buildDatabaseIndex(projectPath);
    const results: SearchResult[] = [];
    const searchKey = name.toLowerCase();

    // 名前インデックスから検索
    for (const [indexedName, entries] of index.nameIndex) {
      if (indexedName.includes(searchKey)) {
        for (const entry of entries) {
          const dataMap = getDataMap(index, entry.type);
          const data = dataMap?.get(entry.id);
          if (data) {
            results.push({
              type: entry.type,
              id: entry.id,
              name: data.name,
              data
            });
          }
        }
      }
    }

    return { success: true, results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 複雑な検索クエリ
 */
export async function queryDatabase(
  projectPath: string,
  query: {
    type?: string;
    where?: Record<string, any>;
    orderBy?: string;
    limit?: number;
  }
): Promise<{ success: boolean; results?: any[]; error?: string }> {
  try {
    const index = await buildDatabaseIndex(projectPath);
    const results: any[] = [];

    const dataMap = query.type ? getDataMap(index, query.type) : null;

    if (dataMap) {
      for (const [id, data] of dataMap) {
        // where 条件チェック
        if (query.where) {
          let matches = true;
          for (const [key, value] of Object.entries(query.where)) {
            if (data[key] !== value) {
              matches = false;
              break;
            }
          }
          if (!matches) continue;
        }

        results.push(data);
      }
    }

    // Sort
    if (query.orderBy && results.length > 0) {
      results.sort((a, b) => {
        const aVal = a[query.orderBy!];
        const bVal = b[query.orderBy!];
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
    }

    // Limit
    if (query.limit && results.length > query.limit) {
      return { success: true, results: results.slice(0, query.limit) };
    }

    return { success: true, results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Helper: タイプに応じたMapを取得
 */
function getDataMap(index: DatabaseIndex, type: string): Map<number, any> | undefined {
  switch (type) {
    case "actor":
      return index.actors;
    case "class":
      return index.classes;
    case "skill":
      return index.skills;
    case "item":
      return index.items;
    case "weapon":
      return index.weapons;
    case "armor":
      return index.armors;
    case "enemy":
      return index.enemies;
    case "troop":
      return index.troops;
    case "state":
      return index.states;
    case "animation":
      return index.animations;
    case "tileset":
      return index.tilesets;
    case "commonEvent":
      return index.commonEvents;
    default:
      return undefined;
  }
}