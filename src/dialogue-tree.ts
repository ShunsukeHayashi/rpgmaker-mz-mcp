export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices?: Array<{
    text: string;
    nextNodeId: string;
    condition?: string;
  }>;
  actions?: Array<{
    type: "setVariable" | "giveItem" | "startQuest";
    params: any;
  }>;
}

export async function generateDialogueTree(
  character: string,
  context: string,
  depth: number,
  apiKey?: string
): Promise<{ success: boolean; tree?: DialogueNode[]; error?: string }> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) return { success: false, error: "API key missing" };

  const prompt = `Generate dialogue tree for character "${character}" in context: "${context}".
Create ${depth} levels of branching dialogue.
Return JSON array of dialogue nodes with choices.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    const data = await response.json();
    const tree = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
    return { success: true, tree };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}