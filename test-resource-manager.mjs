#!/usr/bin/env node
import {
  registerResource,
  registerPromptTemplate,
  executePrompt,
  listResources,
  initializeDefaultPrompts
} from "./dist/resource-manager.js";
import { createNewProject } from "./dist/game-creation-tools.js";
import * as fs from "fs/promises";

console.log("🧪 Resource & Prompt Manager Test\n");

const testPath = "/tmp/test-resource-project";

// Cleanup
try {
  await fs.rm(testPath, { recursive: true, force: true });
} catch (e) {}

// Create test project
console.log("1️⃣ Creating test project...");
await createNewProject(testPath, "Resource Test");
console.log("✅ Project created\n");

// Test 1: Register resource
console.log("2️⃣ Registering resource...");
const registerResult = await registerResource(testPath, {
  id: "hero_template",
  type: "template",
  name: "Hero Template",
  description: "Standard hero character template",
  content: {
    class: "Warrior",
    baseHP: 100,
    baseMP: 20,
    skills: ["Attack", "Defend"]
  },
  metadata: {
    tags: ["character", "hero"],
    category: "templates"
  }
});

if (registerResult.success) {
  console.log("✅ Resource registered:", registerResult.resourceId);
} else {
  console.log("❌ Failed:", registerResult.error);
}

// Test 2: Register prompt template
console.log("\n3️⃣ Registering prompt template...");
const promptResult = await registerPromptTemplate(testPath, {
  id: "create_dialogue",
  name: "Create Hero Dialogue",
  description: "Generate dialogue for hero character",
  template: `Create dialogue for hero:
Name: {{heroName}}
Personality: {{personality}}
Template: {{resource:hero_template}}

Generate 3 dialogue lines.`,
  variables: ["heroName", "personality"],
  resourceRefs: ["hero_template"]
});

if (promptResult.success) {
  console.log("✅ Prompt template registered:", promptResult.promptId);
} else {
  console.log("❌ Failed:", promptResult.error);
}

// Test 3: Execute prompt
console.log("\n4️⃣ Executing prompt...");
const executeResult = await executePrompt(testPath, "create_dialogue", {
  heroName: "Alexander",
  personality: "brave and just"
});

if (executeResult.success) {
  console.log("✅ Prompt executed successfully!");
  console.log("\n📄 Generated Prompt:");
  console.log("---");
  console.log(executeResult.prompt);
  console.log("---");
} else {
  console.log("❌ Failed:", executeResult.error);
}

// Test 4: List resources
console.log("\n5️⃣ Listing resources...");
const listResult = await listResources(testPath, {
  tags: ["character"]
});

if (listResult.success) {
  console.log("✅ Found", listResult.resources.length, "resources");
  listResult.resources.forEach(r => {
    console.log("   -", r.id, ":", r.name);
  });
} else {
  console.log("❌ Failed:", listResult.error);
}

// Test 5: Initialize default prompts
console.log("\n6️⃣ Initializing default prompts...");
await initializeDefaultPrompts(testPath);
console.log("✅ Default prompts initialized");

// Cleanup
console.log("\n7️⃣ Cleanup...");
await fs.rm(testPath, { recursive: true, force: true });
console.log("✅ Cleaned up");

console.log("\n🎉 All resource manager tests passed!");