import * as fs from "fs/promises";
import * as path from "path";
import { addSkill, addClass, updateDatabase } from "./game-creation-tools.js";

export interface BattleSystemConfig {
  projectPath: string;
  difficulty: "easy" | "normal" | "hard";
  battleType: "traditional" | "tactical" | "action";
  enemyCount: number;
  apiKey?: string;
}

export interface GeneratedBattleSystem {
  enemies: Array<{
    id: number;
    name: string;
    battlerName: string;
    params: number[]; // HP, MP, ATK, DEF, MAT, MDF, AGI, LUK
    exp: number;
    gold: number;
    dropItems: Array<{ kind: number; dataId: number; denominator: number }>;
    actions: Array<{ skillId: number; conditionType: number; rating: number }>;
  }>;
  troops: Array<{
    id: number;
    name: string;
    members: Array<{ enemyId: number; x: number; y: number; hidden: boolean }>;
    pages: Array<{ conditions: any; span: number; list: any[] }>;
  }>;
  skills: Array<{
    id: number;
    name: string;
    description: string;
    mpCost: number;
    tpCost: number;
    damage: { formula: string; type: number; elementId: number };
    effects: any[];
  }>;
}

const DIFFICULTY_MULTIPLIERS = {
  easy: { hp: 0.7, damage: 0.8, exp: 1.2 },
  normal: { hp: 1.0, damage: 1.0, exp: 1.0 },
  hard: { hp: 1.5, damage: 1.3, exp: 0.8 }
};

export async function generateBattleSystemWithAI(
  config: BattleSystemConfig
): Promise<{ success: boolean; battleSystem?: GeneratedBattleSystem; error?: string }> {
  const apiKey = config.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY not provided" };
  }

  const prompt = buildBattleSystemPrompt(config);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      return { success: false, error: `API error: ${response.statusText}` };
    }

    const data = await response.json();
    const battleSystemText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!battleSystemText) {
      return { success: false, error: "No battle system generated" };
    }

    const battleSystem = JSON.parse(battleSystemText) as GeneratedBattleSystem;
    return { success: true, battleSystem };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function buildBattleSystemPrompt(config: BattleSystemConfig): string {
  return `Generate a complete RPG battle system in JSON format for RPG Maker MZ.

Difficulty: ${config.difficulty}
Battle Type: ${config.battleType}
Enemy Count: ${config.enemyCount}

Return a JSON object with the following structure:
{
  "enemies": [
    {
      "id": 1,
      "name": "Enemy name",
      "battlerName": "",
      "params": [100, 20, 30, 25, 20, 20, 25, 10],
      "exp": 50,
      "gold": 30,
      "dropItems": [],
      "actions": [{"skillId": 1, "conditionType": 0, "rating": 5}]
    }
  ],
  "troops": [
    {
      "id": 1,
      "name": "Troop name",
      "members": [{"enemyId": 1, "x": 400, "y": 300, "hidden": false}],
      "pages": [{"conditions": {}, "span": 0, "list": [{"code": 0, "indent": 0, "parameters": []}]}]
    }
  ],
  "skills": [
    {
      "id": 10,
      "name": "Skill name",
      "description": "Skill description",
      "mpCost": 10,
      "tpCost": 0,
      "damage": {"formula": "a.atk * 2 - b.def", "type": 1, "elementId": 0},
      "effects": []
    }
  ]
}

Create ${config.enemyCount} diverse enemies with:
- Appropriate stats for ${config.difficulty} difficulty
- Varied attack patterns
- Logical drop items and rewards
- Battle formations (troops)

IMPORTANT: Return ONLY valid JSON, no additional text.`;
}

export async function implementBattleSystem(
  projectPath: string,
  battleSystem: GeneratedBattleSystem
): Promise<{ success: boolean; details?: any; error?: string }> {
  try {
    const results: any = { enemies: [], troops: [], skills: [] };

    // Add skills
    for (const skill of battleSystem.skills) {
      await addSkill(projectPath, skill.id, skill.name);
      await updateDatabase(projectPath, "Skills", skill.id, {
        description: skill.description,
        mpCost: skill.mpCost,
        tpCost: skill.tpCost,
        damage: skill.damage,
        effects: skill.effects
      });
      results.skills.push({ id: skill.id, name: skill.name });
    }

    // Add enemies
    const enemiesFile = path.join(projectPath, "data", "Enemies.json");
    const enemies = JSON.parse(await fs.readFile(enemiesFile, "utf-8"));

    for (const enemy of battleSystem.enemies) {
      enemies[enemy.id] = enemy;
      results.enemies.push({ id: enemy.id, name: enemy.name });
    }

    await fs.writeFile(enemiesFile, JSON.stringify(enemies, null, 0), "utf-8");

    // Add troops
    const troopsFile = path.join(projectPath, "data", "Troops.json");
    const troops = JSON.parse(await fs.readFile(troopsFile, "utf-8"));

    for (const troop of battleSystem.troops) {
      troops[troop.id] = troop;
      results.troops.push({ id: troop.id, name: troop.name });
    }

    await fs.writeFile(troopsFile, JSON.stringify(troops, null, 0), "utf-8");

    return { success: true, details: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function generateAndImplementBattleSystem(
  config: BattleSystemConfig
): Promise<{ success: boolean; battleSystem?: GeneratedBattleSystem; implementation?: any; error?: string }> {
  const genResult = await generateBattleSystemWithAI(config);

  if (!genResult.success || !genResult.battleSystem) {
    return { success: false, error: genResult.error };
  }

  const implResult = await implementBattleSystem(config.projectPath, genResult.battleSystem);

  if (!implResult.success) {
    return {
      success: false,
      battleSystem: genResult.battleSystem,
      error: `Battle system generated but implementation failed: ${implResult.error}`
    };
  }

  return {
    success: true,
    battleSystem: genResult.battleSystem,
    implementation: implResult.details
  };
}