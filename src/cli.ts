#!/usr/bin/env node
import { Command } from 'commander';
import { createNewProject } from './game-creation-tools.js';
import { generateAndImplementScenario } from './scenario-generation.js';
import { generateAndImplementBattleSystem } from './battle-system.js';

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

program.parse();