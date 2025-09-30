#!/usr/bin/env node
import { createNewProject, createMap } from "./dist/game-creation-tools.js";
import { generateScenarioWithGemini } from "./dist/scenario-generation.js";
import { generateAssetWithGemini } from "./dist/asset-generation.js";
import * as fs from "fs/promises";

console.log("🧪 Testing Error Handling\n");

let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    console.log(`▶️  ${name}`);
    await fn();
    console.log(`✅ PASS\n`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ FAIL: ${error.message}\n`);
    testsFailed++;
  }
}

// Test 1: Invalid project path (non-existent)
await test("Create project with invalid path validation", async () => {
  const result = await createNewProject("", "Test");
  if (result.success !== false) {
    throw new Error("Should have failed with empty path");
  }
  if (!result.error.includes("non-empty string")) {
    throw new Error(`Wrong error message: ${result.error}`);
  }
});

// Test 2: Invalid game title
await test("Create project with empty title", async () => {
  const result = await createNewProject("/tmp/test", "");
  if (result.success !== false) {
    throw new Error("Should have failed with empty title");
  }
});

// Test 3: Duplicate project creation
await test("Prevent duplicate project creation", async () => {
  const testPath = "/tmp/test-dup-project";

  // Clean up first
  try {
    await fs.rm(testPath, { recursive: true, force: true });
  } catch (e) {}

  // Create first time - should succeed
  const result1 = await createNewProject(testPath, "Test");
  if (!result1.success) {
    throw new Error("First creation should succeed");
  }

  // Create second time - should fail
  const result2 = await createNewProject(testPath, "Test");
  if (result2.success !== false) {
    throw new Error("Should fail when project already exists");
  }
  if (!result2.error.includes("already exists")) {
    throw new Error(`Wrong error message: ${result2.error}`);
  }

  // Cleanup
  await fs.rm(testPath, { recursive: true, force: true });
});

// Test 4: Invalid map ID
await test("Create map with invalid ID", async () => {
  const result = await createMap("/tmp/nonexistent", -1, "Test");
  if (result.success !== false) {
    throw new Error("Should fail with negative map ID");
  }
});

// Test 5: Invalid API key format
await test("Detect invalid API key format", async () => {
  // Create temp project first
  const testPath = "/tmp/test-api-key";
  try {
    await fs.rm(testPath, { recursive: true, force: true });
  } catch (e) {}

  await createNewProject(testPath, "Test");

  const result = await generateScenarioWithGemini({
    projectPath: testPath,
    theme: "test",
    style: "test",
    length: "short",
    apiKey: "invalid_key"
  });

  await fs.rm(testPath, { recursive: true, force: true });

  if (result.success !== false) {
    throw new Error("Should fail with invalid API key");
  }
  if (!result.error.includes("Invalid Gemini API key format")) {
    throw new Error(`Wrong error message: ${result.error}`);
  }
});

// Test 6: Missing API key
await test("Detect missing API key", async () => {
  // Save and clear env var
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  // Create temp project
  const testPath = "/tmp/test-no-key";
  try {
    await fs.rm(testPath, { recursive: true, force: true });
  } catch (e) {}

  await createNewProject(testPath, "Test");

  const result = await generateAssetWithGemini({
    projectPath: testPath,
    assetType: "character",
    prompt: "test",
    filename: "test.png"
  });

  // Restore env var and cleanup
  if (originalKey) {
    process.env.GEMINI_API_KEY = originalKey;
  }
  await fs.rm(testPath, { recursive: true, force: true });

  if (result.success !== false) {
    throw new Error("Should fail without API key");
  }
  if (!result.error.includes("API key is required")) {
    throw new Error(`Wrong error message: ${result.error}`);
  }
});

// Test 7: Invalid enum value
await test("Invalid length enum value", async () => {
  // Create temp project
  const testPath = "/tmp/test-enum";
  try {
    await fs.rm(testPath, { recursive: true, force: true });
  } catch (e) {}

  await createNewProject(testPath, "Test");

  const result = await generateScenarioWithGemini({
    projectPath: testPath,
    theme: "test",
    style: "test",
    length: "invalid",
    apiKey: "AIzaTest123"
  });

  await fs.rm(testPath, { recursive: true, force: true });

  if (result.success !== false) {
    throw new Error("Should fail with invalid enum");
  }
  if (!result.error.includes("must be one of")) {
    throw new Error(`Wrong error message: ${result.error}`);
  }
});

// Test 8: Invalid asset type
await test("Invalid asset type enum", async () => {
  // Create temp project
  const testPath = "/tmp/test-asset-type";
  try {
    await fs.rm(testPath, { recursive: true, force: true });
  } catch (e) {}

  await createNewProject(testPath, "Test");

  const result = await generateAssetWithGemini({
    projectPath: testPath,
    assetType: "invalid",
    prompt: "test",
    filename: "test.png",
    apiKey: "AIzaTest123"
  });

  await fs.rm(testPath, { recursive: true, force: true });

  if (result.success !== false) {
    throw new Error("Should fail with invalid asset type");
  }
  if (!result.error.includes("must be one of")) {
    throw new Error(`Wrong error message: ${result.error}`);
  }
});

// Results
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📊 Error Handling Test Results");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log("\n🎉 All error handling tests passed!");
} else {
  console.log(`\n⚠️  ${testsFailed} test(s) failed`);
  process.exit(1);
}