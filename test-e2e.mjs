#!/usr/bin/env node
import {
  createNewProject,
  createMap,
  addEvent,
  addEventCommand,
  addActor,
  addClass
} from "./dist/game-creation-tools.js";
import * as fs from "fs/promises";
import * as path from "path";

const TEST_PROJECT_PATH = "/tmp/rpgmaker-test-project";

async function runE2ETests() {
  console.log("🧪 Starting E2E Tests for RPG Maker MZ MCP Server\n");

  try {
    // Clean up previous test
    try {
      await fs.rm(TEST_PROJECT_PATH, { recursive: true, force: true });
    } catch {}

    // Test 1: Create Project
    console.log("1️⃣  Testing project creation...");
    const createResult = await createNewProject(TEST_PROJECT_PATH, "Test RPG Game");
    if (!createResult.success) {
      throw new Error("Project creation failed");
    }
    console.log("✅ Project created successfully\n");

    // Test 2: Create Map
    console.log("2️⃣  Testing map creation...");
    const mapResult = await createMap(TEST_PROJECT_PATH, 2, "Test Town", 20, 15);
    if (!mapResult.success) {
      throw new Error("Map creation failed");
    }
    console.log("✅ Map created successfully\n");

    // Test 3: Create Class
    console.log("3️⃣  Testing class creation...");
    await addClass(TEST_PROJECT_PATH, 1, "Warrior");
    console.log("✅ Class created successfully\n");

    // Test 4: Create Actor
    console.log("4️⃣  Testing actor creation...");
    await addActor(TEST_PROJECT_PATH, 1, "Hero");
    console.log("✅ Actor created successfully\n");

    // Test 5: Create Event
    console.log("5️⃣  Testing event creation...");
    const eventResult = await addEvent(TEST_PROJECT_PATH, 2, 1, "Test NPC", 10, 10);
    if (!eventResult.success) {
      throw new Error("Event creation failed");
    }
    console.log("✅ Event created successfully\n");

    // Test 6: Add Event Command
    console.log("6️⃣  Testing event command...");
    await addEventCommand(TEST_PROJECT_PATH, 2, 1, 0, {
      code: 101,
      indent: 0,
      parameters: ["", 0, 0, 2]
    });
    await addEventCommand(TEST_PROJECT_PATH, 2, 1, 0, {
      code: 401,
      indent: 0,
      parameters: ["Hello, adventurer!"]
    });
    console.log("✅ Event commands added successfully\n");

    // Test 7: Verify Project Structure
    console.log("7️⃣  Verifying project structure...");
    const files = [
      "Game.rpgproject",
      "data/System.json",
      "data/MapInfos.json",
      "data/Map001.json",
      "data/Map002.json",
      "data/Actors.json",
      "data/Classes.json"
    ];

    for (const file of files) {
      const filePath = path.join(TEST_PROJECT_PATH, file);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      if (!exists) {
        throw new Error(`Missing file: ${file}`);
      }
    }
    console.log("✅ Project structure verified\n");

    // Test 8: Validate Data
    console.log("8️⃣  Validating project data...");
    const systemData = JSON.parse(await fs.readFile(path.join(TEST_PROJECT_PATH, "data/System.json"), "utf-8"));
    const mapInfos = JSON.parse(await fs.readFile(path.join(TEST_PROJECT_PATH, "data/MapInfos.json"), "utf-8"));
    const actorsData = JSON.parse(await fs.readFile(path.join(TEST_PROJECT_PATH, "data/Actors.json"), "utf-8"));

    if (systemData.gameTitle !== "Test RPG Game") {
      throw new Error("Game title mismatch");
    }
    if (!mapInfos[2] || mapInfos[2].name !== "Test Town") {
      throw new Error("Map data mismatch");
    }
    if (!actorsData[1] || actorsData[1].name !== "Hero") {
      throw new Error("Actor data mismatch");
    }
    console.log("✅ Project data validated\n");

    // Success!
    console.log("🎉 All E2E tests passed!");
    console.log(`\nTest project created at: ${TEST_PROJECT_PATH}`);
    console.log("You can open this in RPG Maker MZ to verify!\n");

    return true;
  } catch (error) {
    console.error("❌ E2E Test failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

runE2ETests();