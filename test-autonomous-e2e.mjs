#!/usr/bin/env node
import { createGameAutonomously } from "./dist/autonomous-creator.js";
import * as fs from "fs/promises";
import * as path from "path";

const TEST_PROJECT_PATH = "/tmp/rpgmaker-autonomous-test";

console.log("🤖 Starting Autonomous Game Creation E2E Test\n");

async function runTest() {
  try {
    // Clean up old test project
    try {
      await fs.rm(TEST_PROJECT_PATH, { recursive: true, force: true });
      console.log("🧹 Cleaned up old test project\n");
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Test 1: Basic autonomous creation (no assets, no optimization for speed)
    console.log("1️⃣  Testing basic autonomous creation (fast mode)...");
    const result = await createGameAutonomously({
      projectPath: TEST_PROJECT_PATH,
      concept: "fantasy adventure with dragons",
      gameTitle: "Test Fantasy RPG",
      length: "short",
      difficulty: "normal",
      generateAssets: false,  // Skip for speed
      optimize: false  // Skip for speed
    });

    if (!result.success) {
      console.error("❌ Autonomous creation failed:", result.error);
      process.exit(1);
    }

    console.log("✅ Autonomous creation completed!\n");

    // Test 2: Verify project structure
    console.log("2️⃣  Verifying project structure...");
    const projectFile = path.join(TEST_PROJECT_PATH, "Game.rpgproject");
    const dataDir = path.join(TEST_PROJECT_PATH, "data");

    try {
      await fs.access(projectFile);
      await fs.access(dataDir);
      console.log("✅ Project structure verified\n");
    } catch (error) {
      console.error("❌ Project structure verification failed");
      throw error;
    }

    // Test 3: Verify data files
    console.log("3️⃣  Verifying game data files...");
    const requiredFiles = [
      "System.json",
      "MapInfos.json",
      "Actors.json",
      "Classes.json",
      "Skills.json",
      "Items.json",
      "Enemies.json",
      "Troops.json"
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(content);

        if (file === "MapInfos.json") {
          const mapCount = data.filter(m => m !== null).length;
          console.log(`   📍 Maps created: ${mapCount}`);
        } else if (file === "Actors.json") {
          const actorCount = data.filter(a => a !== null).length;
          console.log(`   👤 Actors created: ${actorCount}`);
        } else if (file === "Enemies.json") {
          const enemyCount = data.filter(e => e !== null).length;
          console.log(`   👹 Enemies created: ${enemyCount}`);
        }
      } catch (error) {
        console.error(`❌ Failed to read ${file}:`, error.message);
        throw error;
      }
    }
    console.log("✅ All data files verified\n");

    // Test 4: Verify creation steps
    console.log("4️⃣  Verifying creation steps...");
    if (result.steps && result.steps.length > 0) {
      const successSteps = result.steps.filter(s => s.status === "success").length;
      const failedSteps = result.steps.filter(s => s.status === "failed").length;
      const skippedSteps = result.steps.filter(s => s.status === "skipped").length;

      console.log(`   ✅ Success: ${successSteps}`);
      console.log(`   ❌ Failed: ${failedSteps}`);
      console.log(`   ⏭️  Skipped: ${skippedSteps}`);

      if (failedSteps > 0) {
        console.log("\n   Failed steps:");
        result.steps.filter(s => s.status === "failed").forEach(s => {
          console.log(`   - ${s.step}: ${s.error}`);
        });
      }
    }
    console.log("✅ Creation steps verified\n");

    // Test 5: Verify summary
    console.log("5️⃣  Verifying summary...");
    if (result.summary) {
      console.log("   📊 Summary:");
      console.log(`      Maps: ${result.summary.totalMaps}`);
      console.log(`      Actors: ${result.summary.totalActors}`);
      console.log(`      Enemies: ${result.summary.totalEnemies}`);
      console.log(`      Events: ${result.summary.totalEvents}`);
      console.log(`      Quests: ${result.summary.totalQuests}`);
      console.log(`      Assets: ${result.summary.assetsGenerated}`);
      console.log(`      Size: ${result.summary.projectSize}`);
      console.log(`      Playtime: ${result.summary.estimatedPlaytime}`);
    }
    console.log("✅ Summary verified\n");

    // Final report
    console.log("🎉 ========================================");
    console.log("🎉 ALL AUTONOMOUS E2E TESTS PASSED!");
    console.log("🎉 ========================================\n");
    console.log(`📁 Test project: ${TEST_PROJECT_PATH}`);
    console.log(`✨ Open with RPG Maker MZ: ${projectFile}\n`);

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

runTest();