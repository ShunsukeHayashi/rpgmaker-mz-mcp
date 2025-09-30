import * as path from "path";
import { createNewProject } from "./game-creation-tools.js";
import { generateAndImplementScenario, type ScenarioGenerationRequest } from "./scenario-generation.js";
import { generateAndImplementBattleSystem, type BattleSystemConfig } from "./battle-system.js";
import { generateQuestSystem, type Quest } from "./quest-system.js";
import { generateAssetBatch, type AssetGenerationRequest } from "./asset-generation.js";
import { autoBalanceStats } from "./stat-balancer.js";
import { optimizeAssets, type OptimizationOptions, getProjectSize } from "./asset-optimizer.js";

export interface AutonomousCreationRequest {
  projectPath: string;
  concept: string;
  gameTitle?: string;
  length?: "short" | "medium" | "long";
  difficulty?: "easy" | "normal" | "hard";
  generateAssets?: boolean;
  assetCount?: {
    characters?: number;
    enemies?: number;
    tilesets?: number;
  };
  optimize?: boolean;
}

export interface AutonomousCreationResult {
  success: boolean;
  projectPath?: string;
  steps?: {
    step: string;
    status: "success" | "failed" | "skipped";
    details?: any;
    error?: string;
  }[];
  error?: string;
  summary?: {
    totalMaps: number;
    totalActors: number;
    totalEnemies: number;
    totalEvents: number;
    totalQuests: number;
    assetsGenerated: number;
    projectSize?: string;
    estimatedPlaytime?: string;
  };
}

export async function createGameAutonomously(request: AutonomousCreationRequest): Promise<AutonomousCreationResult> {
  const steps: AutonomousCreationResult["steps"] = [];
  const startTime = Date.now();

  try {
    console.log(`🤖 Starting autonomous game creation: "${request.concept}"`);
    console.log(`📁 Project path: ${request.projectPath}`);

    // Step 1: Create Project
    console.log("\n📦 Step 1/8: Creating project...");
    try {
      const gameTitle = request.gameTitle || extractTitleFromConcept(request.concept);
      await createNewProject(request.projectPath, gameTitle);
      steps.push({
        step: "Project Creation",
        status: "success",
        details: { gameTitle, projectPath: request.projectPath }
      });
      console.log(`✅ Project created: ${gameTitle}`);
    } catch (error) {
      steps.push({
        step: "Project Creation",
        status: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }

    // Step 2: Analyze concept and determine game parameters
    console.log("\n🧠 Step 2/8: Analyzing concept and planning game...");
    const gameParams = analyzeConceptAndPlan(request);
    steps.push({
      step: "Concept Analysis",
      status: "success",
      details: gameParams
    });
    console.log(`✅ Game parameters determined:`, gameParams);

    // Step 3: Generate scenario
    console.log("\n📖 Step 3/8: Generating scenario...");
    try {
      const scenarioRequest: ScenarioGenerationRequest = {
        projectPath: request.projectPath,
        theme: request.concept,
        style: gameParams.style,
        length: request.length || "medium"
      };
      const scenarioResult = await generateAndImplementScenario(scenarioRequest);
      const mapsCount = scenarioResult.scenario?.maps?.length || 0;
      const actorsCount = scenarioResult.scenario?.characters?.length || 0;
      steps.push({
        step: "Scenario Generation",
        status: "success",
        details: {
          maps: mapsCount,
          actors: actorsCount,
          events: 0
        }
      });
      console.log(`✅ Scenario generated: ${mapsCount} maps, ${actorsCount} actors`);
    } catch (error) {
      steps.push({
        step: "Scenario Generation",
        status: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`⚠️ Scenario generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 4: Generate battle system
    console.log("\n⚔️ Step 4/8: Generating battle system...");
    try {
      const battleRequest: BattleSystemConfig = {
        projectPath: request.projectPath,
        difficulty: request.difficulty || "normal",
        battleType: gameParams.battleType,
        enemyCount: gameParams.enemyCount
      };
      const battleResult = await generateAndImplementBattleSystem(battleRequest);
      const enemiesCount = battleResult.battleSystem?.enemies?.length || 0;
      const troopsCount = battleResult.battleSystem?.troops?.length || 0;
      const skillsCount = battleResult.battleSystem?.skills?.length || 0;
      steps.push({
        step: "Battle System Generation",
        status: "success",
        details: {
          enemies: enemiesCount,
          troops: troopsCount,
          skills: skillsCount
        }
      });
      console.log(`✅ Battle system generated: ${enemiesCount} enemies, ${troopsCount} troops`);
    } catch (error) {
      steps.push({
        step: "Battle System Generation",
        status: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`⚠️ Battle system generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 5: Generate quest system
    console.log("\n🎯 Step 5/8: Generating quest system...");
    try {
      const questResult = await generateQuestSystem(
        request.projectPath,
        gameParams.questCount,
        request.concept
      );
      const questCount = questResult.quests?.length || 0;
      steps.push({
        step: "Quest System Generation",
        status: "success",
        details: { quests: questCount }
      });
      console.log(`✅ Quest system generated: ${questCount} quests`);
    } catch (error) {
      steps.push({
        step: "Quest System Generation",
        status: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`⚠️ Quest system generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 6: Generate assets
    if (request.generateAssets !== false) {
      console.log("\n🎨 Step 6/8: Generating game assets...");
      try {
        const assetRequests = prepareAssetRequests(request);
        const assetResults = await generateAssetBatch(assetRequests);
        const successCount = assetResults.filter(r => r.success).length;
        steps.push({
          step: "Asset Generation",
          status: "success",
          details: { assetsGenerated: successCount, totalRequested: assetRequests.length }
        });
        console.log(`✅ Assets generated: ${successCount}/${assetRequests.length}`);
      } catch (error) {
        steps.push({
          step: "Asset Generation",
          status: "failed",
          error: error instanceof Error ? error.message : String(error)
        });
        console.log(`⚠️ Asset generation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      steps.push({
        step: "Asset Generation",
        status: "skipped",
        details: { reason: "Asset generation disabled" }
      });
      console.log("⏭️ Asset generation skipped");
    }

    // Step 7: Balance stats
    console.log("\n⚖️ Step 7/8: Balancing game stats...");
    try {
      const balanceResult = await autoBalanceStats(
        request.projectPath,
        request.difficulty || "normal"
      );
      steps.push({
        step: "Stat Balancing",
        status: "success",
        details: balanceResult
      });
      console.log(`✅ Stats balanced`);
    } catch (error) {
      steps.push({
        step: "Stat Balancing",
        status: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`⚠️ Stat balancing failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 8: Optimize
    if (request.optimize !== false) {
      console.log("\n🚀 Step 8/8: Optimizing project...");
      try {
        const optimizeRequest: OptimizationOptions = {
          projectPath: request.projectPath,
          assetTypes: ["all"],
          quality: 85,
          removeUnused: true
        };
        const optimizeResult = await optimizeAssets(optimizeRequest);
        steps.push({
          step: "Project Optimization",
          status: "success",
          details: optimizeResult
        });
        console.log(`✅ Project optimized`);
      } catch (error) {
        steps.push({
          step: "Project Optimization",
          status: "failed",
          error: error instanceof Error ? error.message : String(error)
        });
        console.log(`⚠️ Optimization failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      steps.push({
        step: "Project Optimization",
        status: "skipped",
        details: { reason: "Optimization disabled" }
      });
      console.log("⏭️ Optimization skipped");
    }

    // Final Analysis
    console.log("\n📊 Analyzing final project...");
    const projectSize = await getProjectSize(request.projectPath);

    const summary = {
      totalMaps: 0, // Would need to count from MapInfos.json
      totalActors: 0,
      totalEnemies: 0,
      totalEvents: 0,
      totalQuests: steps.find(s => s.step === "Quest System Generation")?.details?.quests || 0,
      assetsGenerated: steps.find(s => s.step === "Asset Generation")?.details?.assetsGenerated || 0,
      projectSize: formatBytes(projectSize.totalSize || 0),
      estimatedPlaytime: estimatePlaytime(request.length || "medium")
    };

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n🎉 ========================================");
    console.log("🎉 GAME CREATION COMPLETE!");
    console.log("🎉 ========================================");
    console.log(`\n⏱️ Time taken: ${elapsedTime}s`);
    console.log(`\n📊 Summary:`);
    console.log(`   🗺️  Maps: ${summary.totalMaps}`);
    console.log(`   👤 Actors: ${summary.totalActors}`);
    console.log(`   👹 Enemies: ${summary.totalEnemies}`);
    console.log(`   📍 Events: ${summary.totalEvents}`);
    console.log(`   🎯 Quests: ${summary.totalQuests}`);
    console.log(`   🎨 Assets: ${summary.assetsGenerated}`);
    console.log(`   💾 Size: ${summary.projectSize}`);
    console.log(`   ⏳ Playtime: ${summary.estimatedPlaytime}`);
    console.log(`\n📂 Project: ${request.projectPath}`);
    console.log(`\n✅ Open with RPG Maker MZ: ${path.join(request.projectPath, "Game.rpgproject")}`);

    return {
      success: true,
      projectPath: request.projectPath,
      steps,
      summary
    };

  } catch (error) {
    console.log("\n❌ Game creation failed!");
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      steps
    };
  }
}

function extractTitleFromConcept(concept: string): string {
  // Simple title extraction from concept
  const words = concept.split(" ").slice(0, 3);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function analyzeConceptAndPlan(request: AutonomousCreationRequest): any {
  const concept = request.concept.toLowerCase();

  // Determine game style
  let style = "adventure";
  if (concept.includes("epic") || concept.includes("grand") || concept.includes("legend")) {
    style = "epic";
  } else if (concept.includes("dark") || concept.includes("horror") || concept.includes("mystery")) {
    style = "dark";
  } else if (concept.includes("comedy") || concept.includes("funny") || concept.includes("humor")) {
    style = "comedy";
  } else if (concept.includes("simple") || concept.includes("casual")) {
    style = "simple";
  }

  // Determine battle type
  let battleType = "traditional";
  if (concept.includes("tactical") || concept.includes("strategy")) {
    battleType = "tactical";
  } else if (concept.includes("fast") || concept.includes("action")) {
    battleType = "fast-paced";
  }

  // Determine content amounts based on length
  const length = request.length || "medium";
  let enemyCount = 10;
  let questCount = 5;

  if (length === "short") {
    enemyCount = 5;
    questCount = 3;
  } else if (length === "long") {
    enemyCount = 20;
    questCount = 10;
  }

  return {
    style,
    battleType,
    enemyCount,
    questCount
  };
}

function prepareAssetRequests(request: AutonomousCreationRequest): AssetGenerationRequest[] {
  const concept = request.concept;
  const assetCount = request.assetCount || {};

  const requests: AssetGenerationRequest[] = [];

  // Characters
  const characterCount = assetCount.characters || 3;
  for (let i = 0; i < characterCount; i++) {
    requests.push({
      projectPath: request.projectPath,
      assetType: "character",
      prompt: `${concept} character ${i + 1}, RPG sprite sheet`,
      filename: `Character${i + 1}.png`
    });
  }

  // Enemies
  const enemyCount = assetCount.enemies || 5;
  for (let i = 0; i < enemyCount; i++) {
    requests.push({
      projectPath: request.projectPath,
      assetType: "enemy",
      prompt: `${concept} enemy ${i + 1}, monster sprite`,
      filename: `Enemy${i + 1}.png`
    });
  }

  // Tilesets
  const tilesetCount = assetCount.tilesets || 1;
  for (let i = 0; i < tilesetCount; i++) {
    requests.push({
      projectPath: request.projectPath,
      assetType: "tileset",
      prompt: `${concept} themed tileset`,
      filename: `Tileset${i + 1}.png`
    });
  }

  return requests;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

function estimatePlaytime(length: string): string {
  switch (length) {
    case "short":
      return "1-2 hours";
    case "medium":
      return "3-5 hours";
    case "long":
      return "8-12 hours";
    default:
      return "3-5 hours";
  }
}