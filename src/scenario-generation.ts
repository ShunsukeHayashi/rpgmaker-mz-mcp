import * as fs from "fs/promises";
import * as path from "path";
import {
  createMap,
  addEvent,
  addEventCommand,
  addActor,
  addClass,
  addSkill,
  addItem
} from "./game-creation-tools.js";

export interface ScenarioGenerationRequest {
  projectPath: string;
  theme: string;
  style: string;
  length: "short" | "medium" | "long";
  apiKey?: string;
}

export interface GeneratedScenario {
  title: string;
  synopsis: string;
  maps: Array<{
    id: number;
    name: string;
    description: string;
    width: number;
    height: number;
  }>;
  characters: Array<{
    id: number;
    name: string;
    classId: number;
    className: string;
    description: string;
  }>;
  events: Array<{
    mapId: number;
    eventId: number;
    name: string;
    x: number;
    y: number;
    dialogues: string[];
  }>;
  items: Array<{
    id: number;
    name: string;
    description: string;
    type: string;
  }>;
  skills: Array<{
    id: number;
    name: string;
    description: string;
    mpCost: number;
  }>;
}

export async function generateScenarioWithGemini(request: ScenarioGenerationRequest): Promise<{ success: boolean; scenario?: GeneratedScenario; error?: string }> {
  const apiKey = request.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY not provided" };
  }

  const prompt = buildScenarioPrompt(request);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 1.0,
            topK: 40,
            topP: 0.95,
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
    const scenarioText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!scenarioText) {
      return { success: false, error: "No scenario generated" };
    }

    const scenario = JSON.parse(scenarioText) as GeneratedScenario;
    return { success: true, scenario };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function buildScenarioPrompt(request: ScenarioGenerationRequest): string {
  const lengthGuide = {
    short: "3-5 maps, 2-3 characters, 5-8 events",
    medium: "5-10 maps, 4-6 characters, 10-15 events",
    long: "10-20 maps, 6-10 characters, 20-30 events"
  };

  return `Generate a complete RPG game scenario in JSON format for RPG Maker MZ.

Theme: ${request.theme}
Style: ${request.style}
Length: ${request.length} (${lengthGuide[request.length]})

Return a JSON object with the following structure:
{
  "title": "Game title",
  "synopsis": "Brief story synopsis",
  "maps": [
    {
      "id": 1,
      "name": "Map name",
      "description": "Map description",
      "width": 17,
      "height": 13
    }
  ],
  "characters": [
    {
      "id": 1,
      "name": "Character name",
      "classId": 1,
      "className": "Class name",
      "description": "Character description"
    }
  ],
  "events": [
    {
      "mapId": 1,
      "eventId": 1,
      "name": "Event name",
      "x": 10,
      "y": 10,
      "dialogues": ["Line 1", "Line 2"]
    }
  ],
  "items": [
    {
      "id": 1,
      "name": "Item name",
      "description": "Item description",
      "type": "consumable"
    }
  ],
  "skills": [
    {
      "id": 1,
      "name": "Skill name",
      "description": "Skill description",
      "mpCost": 10
    }
  ]
}

Create a cohesive, engaging RPG scenario with:
- A clear main quest and story arc
- Interesting characters with unique personalities
- Meaningful dialogues that advance the plot
- Appropriate maps for different story beats
- Items and skills that fit the theme
- Logical progression and pacing

IMPORTANT: Return ONLY valid JSON, no additional text.`;
}

export async function implementScenario(projectPath: string, scenario: GeneratedScenario): Promise<{ success: boolean; details?: any; error?: string }> {
  try {
    const results: any = {
      maps: [],
      characters: [],
      events: [],
      items: [],
      skills: []
    };

    // Create classes first
    const createdClasses = new Set<number>();
    for (const char of scenario.characters) {
      if (!createdClasses.has(char.classId)) {
        await addClass(projectPath, char.classId, char.className);
        createdClasses.add(char.classId);
      }
    }

    // Create characters/actors
    for (const char of scenario.characters) {
      const result = await addActor(projectPath, char.id, char.name);
      results.characters.push(result);
    }

    // Create maps
    for (const map of scenario.maps) {
      const result = await createMap(projectPath, map.id, map.name, map.width, map.height);
      results.maps.push(result);
    }

    // Create items
    for (const item of scenario.items) {
      const result = await addItem(projectPath, item.id, item.name);
      results.items.push(result);
    }

    // Create skills
    for (const skill of scenario.skills) {
      const result = await addSkill(projectPath, skill.id, skill.name);
      results.skills.push(result);
    }

    // Create events with dialogues
    for (const event of scenario.events) {
      // Add event
      await addEvent(projectPath, event.mapId, event.eventId, event.name, event.x, event.y);

      // Add dialogue commands
      for (let i = 0; i < event.dialogues.length; i++) {
        const dialogue = event.dialogues[i];

        if (i === 0) {
          // First dialogue uses Show Text command (101)
          await addEventCommand(projectPath, event.mapId, event.eventId, 0, {
            code: 101,
            indent: 0,
            parameters: ["", 0, 0, 2]
          });
        }

        // Add dialogue text (401)
        await addEventCommand(projectPath, event.mapId, event.eventId, 0, {
          code: 401,
          indent: 0,
          parameters: [dialogue]
        });
      }

      results.events.push({ eventId: event.eventId, mapId: event.mapId });
    }

    return { success: true, details: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function generateAndImplementScenario(request: ScenarioGenerationRequest): Promise<{ success: boolean; scenario?: GeneratedScenario; implementation?: any; error?: string }> {
  // Generate scenario
  const genResult = await generateScenarioWithGemini(request);

  if (!genResult.success || !genResult.scenario) {
    return { success: false, error: genResult.error };
  }

  // Implement scenario
  const implResult = await implementScenario(request.projectPath, genResult.scenario);

  if (!implResult.success) {
    return {
      success: false,
      scenario: genResult.scenario,
      error: `Scenario generated but implementation failed: ${implResult.error}`
    };
  }

  // Save scenario metadata
  try {
    const scenarioFile = path.join(request.projectPath, "scenario.json");
    await fs.writeFile(scenarioFile, JSON.stringify(genResult.scenario, null, 2), "utf-8");
  } catch {
    // Non-critical error
  }

  return {
    success: true,
    scenario: genResult.scenario,
    implementation: implResult.details
  };
}

// Generate multiple scenario variations
export async function generateScenarioVariations(
  request: ScenarioGenerationRequest,
  count: number
): Promise<Array<{ success: boolean; scenario?: GeneratedScenario; error?: string }>> {
  const results = [];

  for (let i = 0; i < count; i++) {
    const result = await generateScenarioWithGemini(request);
    results.push(result);
  }

  return results;
}