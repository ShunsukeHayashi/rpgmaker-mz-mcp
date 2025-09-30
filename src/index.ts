#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import {
  createNewProject,
  createMap,
  updateMapTile,
  addEvent,
  updateEvent,
  addEventCommand,
  addActor,
  addClass,
  addSkill,
  addItem,
  updateDatabase
} from "./game-creation-tools.js";
import {
  generateAssetWithGemini,
  generateAssetBatch,
  describeAsset,
  type AssetGenerationRequest
} from "./asset-generation.js";
import {
  generateScenarioWithGemini,
  implementScenario,
  generateAndImplementScenario,
  generateScenarioVariations,
  type ScenarioGenerationRequest
} from "./scenario-generation.js";
import { installPlugin, listInstalledPlugins, uninstallPlugin, enablePlugin } from "./plugin-manager.js";
import { optimizeAssets, getProjectSize } from "./asset-optimizer.js";
import { generateQuestSystem } from "./quest-system.js";
import { generateDialogueTree } from "./dialogue-tree.js";
import { autoBalanceStats } from "./stat-balancer.js";
import { translateProject } from "./localization.js";
import { initVersionControl, createSnapshot, createBackup } from "./versioning.js";
import { analyzePerformance } from "./profiler.js";
import { createGameAutonomously, type AutonomousCreationRequest } from "./autonomous-creator.js";
import { setupGlobalErrorHandlers, Logger } from "./error-handling.js";

const RPGMAKER_APP_PATH = "/Users/shunsuke/Applications/RPG Maker MZ.app";

// Setup global error handlers
setupGlobalErrorHandlers();

// RPG Maker MZ project structure tools
const server = new Server(
  {
    name: "rpgmaker-mz-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_projects",
        description: "List all RPG Maker MZ projects in a directory",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "Directory path to search for projects (defaults to ~/Documents)",
            },
          },
        },
      },
      {
        name: "read_project_info",
        description: "Read RPG Maker MZ project information (Game.rpgproject file)",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
          },
          required: ["project_path"],
        },
      },
      {
        name: "list_maps",
        description: "List all maps in an RPG Maker MZ project",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
          },
          required: ["project_path"],
        },
      },
      {
        name: "read_map",
        description: "Read a specific map file from an RPG Maker MZ project",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            map_id: {
              type: "string",
              description: "Map ID (e.g., 'Map001')",
            },
          },
          required: ["project_path", "map_id"],
        },
      },
      {
        name: "list_plugins",
        description: "List all plugins in an RPG Maker MZ project",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
          },
          required: ["project_path"],
        },
      },
      {
        name: "generate_project_context",
        description: "Generate comprehensive context documentation for an RPG Maker MZ project including structure, maps, events, and plugin information",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            include_maps: {
              type: "boolean",
              description: "Include detailed map information (default: true)",
            },
            include_events: {
              type: "boolean",
              description: "Include event data (default: true)",
            },
            include_plugins: {
              type: "boolean",
              description: "Include plugin information (default: true)",
            },
          },
          required: ["project_path"],
        },
      },
      {
        name: "analyze_project_structure",
        description: "Analyze RPG Maker MZ project structure and provide insights about maps, connections, events, and game flow",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
          },
          required: ["project_path"],
        },
      },
      {
        name: "extract_game_design_patterns",
        description: "Extract common game design patterns from the project (event patterns, map layouts, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
          },
          required: ["project_path"],
        },
      },
      {
        name: "create_project",
        description: "Create a new RPG Maker MZ project from scratch",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path where the project will be created",
            },
            game_title: {
              type: "string",
              description: "Title of the game",
            },
          },
          required: ["project_path", "game_title"],
        },
      },
      {
        name: "create_map",
        description: "Create a new map in the project",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            map_id: {
              type: "number",
              description: "Map ID number",
            },
            name: {
              type: "string",
              description: "Map name",
            },
            width: {
              type: "number",
              description: "Map width in tiles (default: 17)",
            },
            height: {
              type: "number",
              description: "Map height in tiles (default: 13)",
            },
          },
          required: ["project_path", "map_id", "name"],
        },
      },
      {
        name: "update_map_tile",
        description: "Update a tile on a map",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            map_id: {
              type: "number",
              description: "Map ID",
            },
            x: {
              type: "number",
              description: "X coordinate",
            },
            y: {
              type: "number",
              description: "Y coordinate",
            },
            layer: {
              type: "number",
              description: "Layer index (0-5)",
            },
            tile_id: {
              type: "number",
              description: "Tile ID from tileset",
            },
          },
          required: ["project_path", "map_id", "x", "y", "layer", "tile_id"],
        },
      },
      {
        name: "add_event",
        description: "Add a new event to a map",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            map_id: {
              type: "number",
              description: "Map ID",
            },
            event_id: {
              type: "number",
              description: "Event ID",
            },
            name: {
              type: "string",
              description: "Event name",
            },
            x: {
              type: "number",
              description: "X coordinate",
            },
            y: {
              type: "number",
              description: "Y coordinate",
            },
          },
          required: ["project_path", "map_id", "event_id", "name", "x", "y"],
        },
      },
      {
        name: "add_event_command",
        description: "Add a command to an event page (e.g., show text, transfer player, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            map_id: {
              type: "number",
              description: "Map ID",
            },
            event_id: {
              type: "number",
              description: "Event ID",
            },
            page_index: {
              type: "number",
              description: "Page index (0-based)",
            },
            code: {
              type: "number",
              description: "Command code (e.g., 101=Show Text, 201=Transfer Player, 122=Control Variables)",
            },
            parameters: {
              type: "array",
              description: "Command parameters",
            },
          },
          required: ["project_path", "map_id", "event_id", "page_index", "code", "parameters"],
        },
      },
      {
        name: "add_actor",
        description: "Add a new actor to the database",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            id: {
              type: "number",
              description: "Actor ID",
            },
            name: {
              type: "string",
              description: "Actor name",
            },
          },
          required: ["project_path", "id", "name"],
        },
      },
      {
        name: "add_class",
        description: "Add a new class to the database",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            id: {
              type: "number",
              description: "Class ID",
            },
            name: {
              type: "string",
              description: "Class name",
            },
          },
          required: ["project_path", "id", "name"],
        },
      },
      {
        name: "add_skill",
        description: "Add a new skill to the database",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            id: {
              type: "number",
              description: "Skill ID",
            },
            name: {
              type: "string",
              description: "Skill name",
            },
          },
          required: ["project_path", "id", "name"],
        },
      },
      {
        name: "add_item",
        description: "Add a new item to the database",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            id: {
              type: "number",
              description: "Item ID",
            },
            name: {
              type: "string",
              description: "Item name",
            },
          },
          required: ["project_path", "id", "name"],
        },
      },
      {
        name: "update_database",
        description: "Update an entry in any database (Actors, Classes, Skills, Items, Weapons, Armors, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            database: {
              type: "string",
              description: "Database name (e.g., 'Actors', 'Classes', 'Skills', 'Items')",
            },
            id: {
              type: "number",
              description: "Entry ID",
            },
            updates: {
              type: "object",
              description: "Object containing fields to update",
            },
          },
          required: ["project_path", "database", "id", "updates"],
        },
      },
      {
        name: "generate_asset",
        description: "Generate RPG Maker MZ asset using Gemini 2.5 Flash (characters, faces, tilesets, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            asset_type: {
              type: "string",
              enum: ["character", "face", "tileset", "battleback", "enemy", "sv_actor", "picture"],
              description: "Type of asset to generate",
            },
            prompt: {
              type: "string",
              description: "Description of the asset to generate",
            },
            filename: {
              type: "string",
              description: "Filename for the generated asset (with extension)",
            },
            api_key: {
              type: "string",
              description: "Gemini API key (optional, uses GEMINI_API_KEY env var if not provided)",
            },
          },
          required: ["project_path", "asset_type", "prompt", "filename"],
        },
      },
      {
        name: "generate_asset_batch",
        description: "Generate multiple RPG Maker MZ assets in batch",
        inputSchema: {
          type: "object",
          properties: {
            requests: {
              type: "array",
              description: "Array of asset generation requests",
              items: {
                type: "object",
                properties: {
                  project_path: { type: "string" },
                  asset_type: { type: "string" },
                  prompt: { type: "string" },
                  filename: { type: "string" },
                  api_key: { type: "string" },
                },
              },
            },
          },
          required: ["requests"],
        },
      },
      {
        name: "describe_asset",
        description: "Analyze and describe an existing RPG Maker MZ asset using Gemini 2.5 Flash",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            asset_type: {
              type: "string",
              description: "Type of asset",
            },
            filename: {
              type: "string",
              description: "Filename of the asset to analyze",
            },
            api_key: {
              type: "string",
              description: "Gemini API key (optional)",
            },
          },
          required: ["project_path", "asset_type", "filename"],
        },
      },
      {
        name: "generate_scenario",
        description: "Generate a complete RPG game scenario using Gemini AI (story, maps, characters, events, items)",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            theme: {
              type: "string",
              description: "Theme or genre of the game (e.g., 'fantasy adventure', 'sci-fi', 'horror')",
            },
            style: {
              type: "string",
              description: "Style or tone (e.g., 'lighthearted', 'dark', 'comedic', 'epic')",
            },
            length: {
              type: "string",
              enum: ["short", "medium", "long"],
              description: "Length of the game scenario",
            },
            api_key: {
              type: "string",
              description: "Gemini API key (optional)",
            },
          },
          required: ["project_path", "theme", "style", "length"],
        },
      },
      {
        name: "implement_scenario",
        description: "Implement a generated scenario into the RPG Maker MZ project",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            scenario: {
              type: "object",
              description: "Generated scenario object",
            },
          },
          required: ["project_path", "scenario"],
        },
      },
      {
        name: "generate_and_implement_scenario",
        description: "Generate and immediately implement a complete RPG scenario (all-in-one)",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            theme: {
              type: "string",
              description: "Theme or genre of the game",
            },
            style: {
              type: "string",
              description: "Style or tone",
            },
            length: {
              type: "string",
              enum: ["short", "medium", "long"],
              description: "Length of the game scenario",
            },
            api_key: {
              type: "string",
              description: "Gemini API key (optional)",
            },
          },
          required: ["project_path", "theme", "style", "length"],
        },
      },
      {
        name: "generate_scenario_variations",
        description: "Generate multiple variations of a scenario for comparison",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path to the RPG Maker MZ project directory",
            },
            theme: {
              type: "string",
              description: "Theme or genre",
            },
            style: {
              type: "string",
              description: "Style or tone",
            },
            length: {
              type: "string",
              enum: ["short", "medium", "long"],
              description: "Length of scenarios",
            },
            count: {
              type: "number",
              description: "Number of variations to generate",
            },
            api_key: {
              type: "string",
              description: "Gemini API key (optional)",
            },
          },
          required: ["project_path", "theme", "style", "length", "count"],
        },
      },
      {
        name: "autonomous_create_game",
        description: "Autonomously create a complete RPG game from a concept. This tool orchestrates all game creation steps: project setup, scenario generation, battle system, quests, assets, balancing, and optimization. Perfect for rapid game prototyping with minimal input.",
        inputSchema: {
          type: "object",
          properties: {
            project_path: {
              type: "string",
              description: "Path where the game project will be created",
            },
            concept: {
              type: "string",
              description: "Game concept/theme (e.g., 'fantasy adventure with dragons', 'cyberpunk detective story', 'space opera epic')",
            },
            game_title: {
              type: "string",
              description: "Game title (auto-generated from concept if not provided)",
            },
            length: {
              type: "string",
              enum: ["short", "medium", "long"],
              description: "Game length - short: 1-2hrs, medium: 3-5hrs, long: 8-12hrs",
            },
            difficulty: {
              type: "string",
              enum: ["easy", "normal", "hard"],
              description: "Game difficulty level",
            },
            generate_assets: {
              type: "boolean",
              description: "Whether to generate game assets using AI (default: true)",
            },
            asset_count: {
              type: "object",
              properties: {
                characters: {
                  type: "number",
                  description: "Number of character sprites to generate",
                },
                enemies: {
                  type: "number",
                  description: "Number of enemy sprites to generate",
                },
                tilesets: {
                  type: "number",
                  description: "Number of tilesets to generate",
                },
              },
              description: "Asset generation counts",
            },
            optimize: {
              type: "boolean",
              description: "Whether to optimize the project after creation (default: true)",
            },
            api_key: {
              type: "string",
              description: "Gemini API key (optional, uses GEMINI_API_KEY env var if not provided)",
            },
          },
          required: ["project_path", "concept"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_projects": {
        const searchDir = (args?.directory as string) || path.join(process.env.HOME!, "Documents");
        const entries = await fs.readdir(searchDir, { withFileTypes: true });
        const projects = [];

        for (const entry of entries) {
          if (entry.isDirectory()) {
            const projectFile = path.join(searchDir, entry.name, "Game.rpgproject");
            try {
              await fs.access(projectFile);
              projects.push({
                name: entry.name,
                path: path.join(searchDir, entry.name),
              });
            } catch {
              // Not an RPG Maker project
            }
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      }

      case "read_project_info": {
        const projectPath = args.project_path as string;
        const projectFile = path.join(projectPath, "Game.rpgproject");
        const content = await fs.readFile(projectFile, "utf-8");

        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      }

      case "list_maps": {
        const projectPath = args.project_path as string;
        const mapsFile = path.join(projectPath, "data", "MapInfos.json");
        const content = await fs.readFile(mapsFile, "utf-8");
        const maps = JSON.parse(content);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(maps, null, 2),
            },
          ],
        };
      }

      case "read_map": {
        const projectPath = args.project_path as string;
        const mapId = args.map_id as string;
        const mapFile = path.join(projectPath, "data", `${mapId}.json`);
        const content = await fs.readFile(mapFile, "utf-8");

        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      }

      case "list_plugins": {
        const projectPath = args.project_path as string;
        const pluginsDir = path.join(projectPath, "js", "plugins");
        const pluginsFile = path.join(pluginsDir, "..", "plugins.js");

        let plugins = [];
        try {
          const content = await fs.readFile(pluginsFile, "utf-8");
          plugins.push({ type: "config", file: "plugins.js", content });
        } catch {
          // No plugins.js file
        }

        const files = await fs.readdir(pluginsDir);
        const pluginFiles = files.filter((f) => f.endsWith(".js"));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ plugins, pluginFiles }, null, 2),
            },
          ],
        };
      }

      case "generate_project_context": {
        const projectPath = args.project_path as string;
        const includeMaps = args.include_maps !== false;
        const includeEvents = args.include_events !== false;
        const includePlugins = args.include_plugins !== false;

        let context = "# RPG Maker MZ Project Context\n\n";

        // Project info
        try {
          const projectFile = path.join(projectPath, "Game.rpgproject");
          const projectContent = await fs.readFile(projectFile, "utf-8");
          context += "## Project Information\n```\n" + projectContent + "\n```\n\n";
        } catch (e) {
          context += "## Project Information\nUnavailable\n\n";
        }

        // System data
        try {
          const systemFile = path.join(projectPath, "data", "System.json");
          const systemContent = await fs.readFile(systemFile, "utf-8");
          const system = JSON.parse(systemContent);
          context += "## System Settings\n";
          context += `- Game Title: ${system.gameTitle}\n`;
          context += `- Version: ${system.versionId || "N/A"}\n\n`;
        } catch (e) {
          // Skip if unavailable
        }

        // Maps
        if (includeMaps) {
          try {
            const mapsFile = path.join(projectPath, "data", "MapInfos.json");
            const mapsContent = await fs.readFile(mapsFile, "utf-8");
            const maps = JSON.parse(mapsContent);
            context += "## Maps\n";
            for (const [id, mapInfo] of Object.entries(maps)) {
              if (mapInfo && typeof mapInfo === "object" && "name" in mapInfo) {
                context += `- Map ${id}: ${mapInfo.name}\n`;

                if (includeEvents) {
                  try {
                    const mapFile = path.join(projectPath, "data", `Map${String(id).padStart(3, "0")}.json`);
                    const mapContent = await fs.readFile(mapFile, "utf-8");
                    const mapData = JSON.parse(mapContent);
                    const eventCount = mapData.events?.filter((e: any) => e !== null).length || 0;
                    context += `  - Events: ${eventCount}\n`;
                  } catch {
                    // Skip if map file unavailable
                  }
                }
              }
            }
            context += "\n";
          } catch (e) {
            context += "## Maps\nUnavailable\n\n";
          }
        }

        // Plugins
        if (includePlugins) {
          try {
            const pluginsDir = path.join(projectPath, "js", "plugins");
            const files = await fs.readdir(pluginsDir);
            const pluginFiles = files.filter((f) => f.endsWith(".js"));
            context += "## Plugins\n";
            for (const plugin of pluginFiles) {
              context += `- ${plugin}\n`;
            }
            context += "\n";
          } catch (e) {
            context += "## Plugins\nUnavailable\n\n";
          }
        }

        return {
          content: [
            {
              type: "text",
              text: context,
            },
          ],
        };
      }

      case "analyze_project_structure": {
        const projectPath = args.project_path as string;
        let analysis = "# Project Structure Analysis\n\n";

        try {
          const mapsFile = path.join(projectPath, "data", "MapInfos.json");
          const mapsContent = await fs.readFile(mapsFile, "utf-8");
          const maps = JSON.parse(mapsContent);

          const mapCount = Object.values(maps).filter((m) => m !== null).length;
          analysis += `## Overview\n- Total Maps: ${mapCount}\n\n`;

          analysis += "## Map Hierarchy\n";
          for (const [id, mapInfo] of Object.entries(maps)) {
            if (mapInfo && typeof mapInfo === "object" && "name" in mapInfo) {
              const parentId = "parentId" in mapInfo ? mapInfo.parentId : 0;
              const indent = parentId === 0 ? "" : "  ";
              analysis += `${indent}- ${mapInfo.name} (ID: ${id})\n`;
            }
          }
          analysis += "\n";

          // Event analysis
          let totalEvents = 0;
          const eventsByMap: Record<string, number> = {};

          for (const [id, mapInfo] of Object.entries(maps)) {
            if (mapInfo && typeof mapInfo === "object" && "name" in mapInfo) {
              try {
                const mapFile = path.join(projectPath, "data", `Map${String(id).padStart(3, "0")}.json`);
                const mapContent = await fs.readFile(mapFile, "utf-8");
                const mapData = JSON.parse(mapContent);
                const eventCount = mapData.events?.filter((e: any) => e !== null).length || 0;
                totalEvents += eventCount;
                if (eventCount > 0) {
                  eventsByMap[mapInfo.name as string] = eventCount;
                }
              } catch {
                // Skip
              }
            }
          }

          analysis += `## Event Statistics\n- Total Events: ${totalEvents}\n\n`;
          if (Object.keys(eventsByMap).length > 0) {
            analysis += "### Events by Map\n";
            for (const [mapName, count] of Object.entries(eventsByMap)) {
              analysis += `- ${mapName}: ${count} events\n`;
            }
          }

        } catch (e) {
          analysis += "Error analyzing project structure\n";
        }

        return {
          content: [
            {
              type: "text",
              text: analysis,
            },
          ],
        };
      }

      case "extract_game_design_patterns": {
        const projectPath = args.project_path as string;
        let patterns = "# Game Design Patterns\n\n";

        try {
          const mapsFile = path.join(projectPath, "data", "MapInfos.json");
          const mapsContent = await fs.readFile(mapsFile, "utf-8");
          const maps = JSON.parse(mapsContent);

          const eventPatterns: Record<string, number> = {};
          const commonEventCommands: Record<string, number> = {};

          for (const [id, mapInfo] of Object.entries(maps)) {
            if (mapInfo && typeof mapInfo === "object" && "name" in mapInfo) {
              try {
                const mapFile = path.join(projectPath, "data", `Map${String(id).padStart(3, "0")}.json`);
                const mapContent = await fs.readFile(mapFile, "utf-8");
                const mapData = JSON.parse(mapContent);

                if (mapData.events) {
                  for (const event of mapData.events) {
                    if (event && event.pages) {
                      for (const page of event.pages) {
                        if (page.list) {
                          for (const command of page.list) {
                            const cmdCode = command.code;
                            commonEventCommands[cmdCode] = (commonEventCommands[cmdCode] || 0) + 1;
                          }
                        }
                      }
                    }
                  }
                }
              } catch {
                // Skip
              }
            }
          }

          patterns += "## Common Event Commands\n";
          const sortedCommands = Object.entries(commonEventCommands)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

          for (const [code, count] of sortedCommands) {
            patterns += `- Command ${code}: ${count} occurrences\n`;
          }

        } catch (e) {
          patterns += "Error extracting patterns\n";
        }

        return {
          content: [
            {
              type: "text",
              text: patterns,
            },
          ],
        };
      }

      case "create_project": {
        const projectPath = args.project_path as string;
        const gameTitle = args.game_title as string;
        const result = await createNewProject(projectPath, gameTitle);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "create_map": {
        const projectPath = args.project_path as string;
        const mapId = args.map_id as number;
        const name = args.name as string;
        const width = (args.width as number) || 17;
        const height = (args.height as number) || 13;
        const result = await createMap(projectPath, mapId, name, width, height);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_map_tile": {
        const projectPath = args.project_path as string;
        const mapId = args.map_id as number;
        const x = args.x as number;
        const y = args.y as number;
        const layer = args.layer as number;
        const tileId = args.tile_id as number;
        const result = await updateMapTile(projectPath, mapId, x, y, layer, tileId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_event": {
        const projectPath = args.project_path as string;
        const mapId = args.map_id as number;
        const eventId = args.event_id as number;
        const name = args.name as string;
        const x = args.x as number;
        const y = args.y as number;
        const result = await addEvent(projectPath, mapId, eventId, name, x, y);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_event_command": {
        const projectPath = args.project_path as string;
        const mapId = args.map_id as number;
        const eventId = args.event_id as number;
        const pageIndex = args.page_index as number;
        const code = args.code as number;
        const parameters = args.parameters as any[];
        const command = { code, indent: 0, parameters };
        const result = await addEventCommand(projectPath, mapId, eventId, pageIndex, command);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_actor": {
        const projectPath = args.project_path as string;
        const id = args.id as number;
        const name = args.name as string;
        const result = await addActor(projectPath, id, name);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_class": {
        const projectPath = args.project_path as string;
        const id = args.id as number;
        const name = args.name as string;
        const result = await addClass(projectPath, id, name);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_skill": {
        const projectPath = args.project_path as string;
        const id = args.id as number;
        const name = args.name as string;
        const result = await addSkill(projectPath, id, name);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_item": {
        const projectPath = args.project_path as string;
        const id = args.id as number;
        const name = args.name as string;
        const result = await addItem(projectPath, id, name);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_database": {
        const projectPath = args.project_path as string;
        const database = args.database as string;
        const id = args.id as number;
        const updates = args.updates as any;
        const result = await updateDatabase(projectPath, database, id, updates);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "generate_asset": {
        const request: AssetGenerationRequest = {
          projectPath: args.project_path as string,
          assetType: args.asset_type as any,
          prompt: args.prompt as string,
          filename: args.filename as string,
          apiKey: args.api_key as string | undefined,
        };
        const result = await generateAssetWithGemini(request);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "generate_asset_batch": {
        const requests = args.requests as AssetGenerationRequest[];
        const results = await generateAssetBatch(requests);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "describe_asset": {
        const projectPath = args.project_path as string;
        const assetType = args.asset_type as string;
        const filename = args.filename as string;
        const apiKey = args.api_key as string | undefined;
        const result = await describeAsset(projectPath, assetType, filename, apiKey);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "generate_scenario": {
        const request: ScenarioGenerationRequest = {
          projectPath: args.project_path as string,
          theme: args.theme as string,
          style: args.style as string,
          length: args.length as "short" | "medium" | "long",
          apiKey: args.api_key as string | undefined,
        };
        const result = await generateScenarioWithGemini(request);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "implement_scenario": {
        const projectPath = args.project_path as string;
        const scenario = args.scenario as any;
        const result = await implementScenario(projectPath, scenario);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "generate_and_implement_scenario": {
        const request: ScenarioGenerationRequest = {
          projectPath: args.project_path as string,
          theme: args.theme as string,
          style: args.style as string,
          length: args.length as "short" | "medium" | "long",
          apiKey: args.api_key as string | undefined,
        };
        const result = await generateAndImplementScenario(request);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "generate_scenario_variations": {
        const request: ScenarioGenerationRequest = {
          projectPath: args.project_path as string,
          theme: args.theme as string,
          style: args.style as string,
          length: args.length as "short" | "medium" | "long",
          apiKey: args.api_key as string | undefined,
        };
        const count = args.count as number;
        const results = await generateScenarioVariations(request, count);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "autonomous_create_game": {
        const request: AutonomousCreationRequest = {
          projectPath: args.project_path as string,
          concept: args.concept as string,
          gameTitle: args.game_title as string | undefined,
          length: (args.length as "short" | "medium" | "long") || "medium",
          difficulty: (args.difficulty as "easy" | "normal" | "hard") || "normal",
          generateAssets: args.generate_assets !== false,
          assetCount: args.asset_count as any,
          optimize: args.optimize !== false,
        };

        const result = await createGameAutonomously(request);

        if (result.success) {
          let report = `🎉 Game creation completed successfully!\n\n`;
          report += `📁 Project: ${result.projectPath}\n\n`;

          if (result.summary) {
            report += `📊 Summary:\n`;
            report += `   🗺️  Maps: ${result.summary.totalMaps}\n`;
            report += `   👤 Actors: ${result.summary.totalActors}\n`;
            report += `   👹 Enemies: ${result.summary.totalEnemies}\n`;
            report += `   📍 Events: ${result.summary.totalEvents}\n`;
            report += `   🎯 Quests: ${result.summary.totalQuests}\n`;
            report += `   🎨 Assets: ${result.summary.assetsGenerated}\n`;
            report += `   💾 Size: ${result.summary.projectSize}\n`;
            report += `   ⏳ Playtime: ${result.summary.estimatedPlaytime}\n\n`;
          }

          if (result.steps) {
            report += `\n📋 Creation Steps:\n`;
            for (const step of result.steps) {
              const icon = step.status === "success" ? "✅" : step.status === "failed" ? "❌" : "⏭️";
              report += `${icon} ${step.step}\n`;
              if (step.error) {
                report += `   Error: ${step.error}\n`;
              }
            }
          }

          report += `\n✨ Open with RPG Maker MZ: ${path.join(result.projectPath!, "Game.rpgproject")}`;

          return {
            content: [{ type: "text", text: report }],
          };
        } else {
          return {
            content: [{ type: "text", text: `❌ Game creation failed: ${result.error}` }],
            isError: true,
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  try {
    await Logger.info("Starting RPG Maker MZ MCP Server");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("RPG Maker MZ MCP Server running on stdio");
    await Logger.info("Server started successfully");
  } catch (error) {
    await Logger.error("Failed to start server", { error });
    throw error;
  }
}

main().catch(async (error) => {
  console.error("Server error:", error);
  await Logger.error("Server crashed", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});