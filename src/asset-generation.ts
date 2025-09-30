import * as fs from "fs/promises";
import * as path from "path";
import {
  Validator,
  APIHelper,
  Logger,
  createErrorResponse,
  validateProjectPath,
  validateGeminiAPIKey
} from "./error-handling.js";

// Gemini 2.5 Flash (nanobanana) integration for asset generation
export interface AssetGenerationRequest {
  projectPath: string;
  assetType: "character" | "face" | "tileset" | "battleback" | "enemy" | "sv_actor" | "picture";
  prompt: string;
  filename: string;
  apiKey?: string;
}

export interface AssetSpecs {
  character: { width: 144, height: 192, grid: "3x4" };
  face: { width: 144, height: 144, grid: "2x2" };
  tileset: { width: 768, height: 768, grid: "24x24 tiles" };
  battleback: { width: 1000, height: 740 };
  enemy: { width: 816, height: 624 };
  sv_actor: { width: 576, height: 384, grid: "9x6" };
  picture: { width: 816, height: 624 };
}

const ASSET_SPECS: AssetSpecs = {
  character: { width: 144, height: 192, grid: "3x4" },
  face: { width: 144, height: 144, grid: "2x2" },
  tileset: { width: 768, height: 768, grid: "24x24 tiles" },
  battleback: { width: 1000, height: 740 },
  enemy: { width: 816, height: 624 },
  sv_actor: { width: 576, height: 384, grid: "9x6" },
  picture: { width: 816, height: 624 }
};

export async function generateAssetWithGemini(request: AssetGenerationRequest): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Validate inputs
    await validateProjectPath(request.projectPath);
    Validator.requireEnum(
      request.assetType,
      "assetType",
      ["character", "face", "tileset", "battleback", "enemy", "sv_actor", "picture"] as const
    );
    Validator.requireString(request.prompt, "prompt");
    Validator.requireString(request.filename, "filename");

    const apiKey = validateGeminiAPIKey(request.apiKey);

    await Logger.info("Generating asset with Gemini", {
      projectPath: request.projectPath,
      assetType: request.assetType,
      filename: request.filename
    });

    const specs = ASSET_SPECS[request.assetType];
    const enhancedPrompt = buildPrompt(request.assetType, request.prompt, specs);

    // Call Gemini 2.5 Flash API with image generation
    const response = await APIHelper.fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 1.0,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      return { success: false, error: `API error: ${response.statusText}` };
    }

    const data = await response.json();

    // Extract image data (assuming Gemini returns base64 or URL)
    // Note: Gemini 2.5 Flash may not support direct image generation
    // This is a placeholder for the actual implementation
    const imageData = extractImageData(data);

    if (!imageData) {
      return { success: false, error: "No image data in response" };
    }

    // Save image to appropriate directory
    const assetPath = getAssetPath(request.projectPath, request.assetType);
    await fs.mkdir(assetPath, { recursive: true });

    const fullPath = path.join(assetPath, request.filename);
    await saveImage(fullPath, imageData);

    return { success: true, path: fullPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function buildPrompt(assetType: string, userPrompt: string, specs: any): string {
  let prompt = `Create a pixel art sprite for RPG Maker MZ.\n\n`;
  prompt += `Asset Type: ${assetType}\n`;
  prompt += `Dimensions: ${specs.width}x${specs.height} pixels\n`;

  if (specs.grid) {
    prompt += `Grid Layout: ${specs.grid}\n`;
  }

  prompt += `\nDescription: ${userPrompt}\n\n`;
  prompt += `Style Requirements:\n`;
  prompt += `- Pixel art style suitable for RPG Maker MZ\n`;
  prompt += `- Transparent background (PNG format)\n`;
  prompt += `- Clean, professional sprites\n`;

  switch (assetType) {
    case "character":
      prompt += `- Character sprite sheet with 3 columns (down, left, right, up) and 4 rows (animation frames)\n`;
      prompt += `- Each character tile is 48x48 pixels\n`;
      break;
    case "face":
      prompt += `- 2x2 grid of facial expressions\n`;
      prompt += `- Each face is 144x144 pixels\n`;
      break;
    case "tileset":
      prompt += `- Tileset with consistent style\n`;
      prompt += `- Each tile is 48x48 pixels\n`;
      break;
    case "sv_actor":
      prompt += `- Side-view battler sprite sheet\n`;
      prompt += `- 9 columns x 6 rows for battle animations\n`;
      break;
  }

  return prompt;
}

function getAssetPath(projectPath: string, assetType: string): string {
  const assetDirs: Record<string, string> = {
    character: "img/characters",
    face: "img/faces",
    tileset: "img/tilesets",
    battleback: "img/battlebacks1",
    enemy: "img/enemies",
    sv_actor: "img/sv_actors",
    picture: "img/pictures"
  };

  return path.join(projectPath, assetDirs[assetType] || "img");
}

function extractImageData(apiResponse: any): string | null {
  // Extract image from Gemini API response
  // This depends on the actual API response format
  try {
    if (apiResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      return apiResponse.candidates[0].content.parts[0].inlineData.data;
    }
    return null;
  } catch {
    return null;
  }
}

async function saveImage(filePath: string, imageData: string) {
  // imageData could be base64 or binary
  if (imageData.startsWith("data:image")) {
    // Data URI format
    const base64Data = imageData.split(",")[1];
    await fs.writeFile(filePath, Buffer.from(base64Data, "base64"));
  } else {
    // Assume base64
    await fs.writeFile(filePath, Buffer.from(imageData, "base64"));
  }
}

// Alternative: Use Imagen 3 or other image generation APIs
export async function generateAssetWithImagen(request: AssetGenerationRequest): Promise<{ success: boolean; path?: string; error?: string }> {
  // Placeholder for Imagen 3 integration
  return { success: false, error: "Imagen 3 integration not implemented yet" };
}

// Generate multiple assets in batch
export async function generateAssetBatch(requests: AssetGenerationRequest[]): Promise<Array<{ success: boolean; path?: string; error?: string }>> {
  const results = [];
  for (const request of requests) {
    const result = await generateAssetWithGemini(request);
    results.push(result);
  }
  return results;
}

// Describe existing asset for AI analysis
export async function describeAsset(
  projectPath: string,
  assetType: string,
  filename: string,
  apiKey?: string
): Promise<{ success: boolean; description?: string; error?: string }> {
  const assetPath = path.join(getAssetPath(projectPath, assetType), filename);

  try {
    const imageBuffer = await fs.readFile(assetPath);
    const base64Image = imageBuffer.toString("base64");

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return { success: false, error: "GEMINI_API_KEY not provided" };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Describe this RPG Maker MZ asset in detail. Include style, colors, content, and suggestions for usage."
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: base64Image
                }
              }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      return { success: false, error: `API error: ${response.statusText}` };
    }

    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return { success: true, description };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}