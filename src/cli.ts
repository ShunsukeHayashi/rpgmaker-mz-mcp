#!/usr/bin/env node
import { Command } from 'commander';
import { createNewProject } from './game-creation-tools.js';
import { generateAndImplementScenario } from './scenario-generation.js';
import { generateAndImplementBattleSystem } from './battle-system.js';
import { createGameAutonomously } from './autonomous-creator.js';

const program = new Command();

program
  .name('rpgmaker-mz-mcp')
  .description('CLI for RPG Maker MZ MCP Server')
  .version('0.1.0');

program
  .command('create <path> <title>')
  .description('Create a new RPG Maker MZ project')
  .action(async (path: string, title: string) => {
    console.log(`Creating project: ${title}`);
    const result = await createNewProject(path, title);
    if (result.success) {
      console.log('✅ Project created successfully!');
    } else {
      console.error('❌ Failed to create project');
    }
  });

program
  .command('generate-scenario <path>')
  .description('Generate and implement a complete RPG scenario')
  .option('-t, --theme <theme>', 'Game theme', 'fantasy adventure')
  .option('-s, --style <style>', 'Game style', 'epic')
  .option('-l, --length <length>', 'Game length', 'medium')
  .action(async (path: string, options: any) => {
    console.log(`Generating scenario...`);
    const result = await generateAndImplementScenario({
      projectPath: path,
      theme: options.theme,
      style: options.style,
      length: options.length
    });
    if (result.success) {
      console.log('✅ Scenario generated and implemented!');
    } else {
      console.error('❌ Failed:', result.error);
    }
  });

program
  .command('generate-battles <path>')
  .description('Generate battle system')
  .option('-d, --difficulty <difficulty>', 'Difficulty', 'normal')
  .option('-c, --count <count>', 'Enemy count', '10')
  .action(async (path: string, options: any) => {
    console.log(`Generating battle system...`);
    const result = await generateAndImplementBattleSystem({
      projectPath: path,
      difficulty: options.difficulty,
      battleType: 'traditional',
      enemyCount: parseInt(options.count)
    });
    if (result.success) {
      console.log('✅ Battle system generated!');
    } else {
      console.error('❌ Failed:', result.error);
    }
  });

program
  .command('auto-create <path> <concept>')
  .description('Autonomously create a complete RPG game from a concept')
  .option('-t, --title <title>', 'Game title (auto-generated if not provided)')
  .option('-l, --length <length>', 'Game length (short/medium/long)', 'medium')
  .option('-d, --difficulty <difficulty>', 'Difficulty (easy/normal/hard)', 'normal')
  .option('--no-assets', 'Skip asset generation')
  .option('--no-optimize', 'Skip optimization')
  .option('--characters <count>', 'Number of character assets to generate', '3')
  .option('--enemies <count>', 'Number of enemy assets to generate', '5')
  .option('--tilesets <count>', 'Number of tileset assets to generate', '1')
  .action(async (path: string, concept: string, options: any) => {
    console.log(`\n🎮 ========================================`);
    console.log(`🤖 AUTONOMOUS RPG CREATION`);
    console.log(`🎮 ========================================\n`);
    console.log(`📝 Concept: ${concept}`);
    console.log(`📁 Path: ${path}`);
    console.log(`⏱️ Length: ${options.length}`);
    console.log(`💪 Difficulty: ${options.difficulty}\n`);

    const result = await createGameAutonomously({
      projectPath: path,
      concept: concept,
      gameTitle: options.title,
      length: options.length,
      difficulty: options.difficulty,
      generateAssets: options.assets,
      assetCount: {
        characters: parseInt(options.characters),
        enemies: parseInt(options.enemies),
        tilesets: parseInt(options.tilesets)
      },
      optimize: options.optimize
    });

    if (!result.success) {
      console.error('\n❌ Autonomous creation failed:', result.error);
      process.exit(1);
    }
  });

program.parse();