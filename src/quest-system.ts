import * as fs from "fs/promises";
import * as path from "path";

export interface Quest {
  id: number;
  name: string;
  description: string;
  objectives: Array<{
    id: number;
    description: string;
    type: "kill" | "collect" | "talk" | "visit";
    target: string;
    count: number;
    completed: boolean;
  }>;
  rewards: {
    exp?: number;
    gold?: number;
    items?: Array<{ id: number; count: number }>;
  };
  prerequisiteQuests?: number[];
  status: "available" | "active" | "completed" | "failed";
}

export async function generateQuestSystem(
  projectPath: string,
  questCount: number,
  theme: string,
  apiKey?: string
): Promise<{ success: boolean; quests?: Quest[]; error?: string }> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return { success: false, error: "GEMINI_API_KEY not provided" };
  }

  const prompt = `Generate ${questCount} RPG quests for theme: "${theme}".
Return JSON array of quests with structure:
{
  "id": 1,
  "name": "Quest name",
  "description": "Quest description",
  "objectives": [{"id": 1, "description": "Objective", "type": "kill", "target": "Goblin", "count": 5}],
  "rewards": {"exp": 100, "gold": 50, "items": []},
  "status": "available"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: 8192 }
        })
      }
    );

    const data = await response.json();
    const questsText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const quests = JSON.parse(questsText) as Quest[];

    // Save quests to project
    const questsFile = path.join(projectPath, "data", "Quests.json");
    await fs.writeFile(questsFile, JSON.stringify(quests, null, 2), "utf-8");

    return { success: true, quests };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}