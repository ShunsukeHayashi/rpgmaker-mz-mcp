import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface OptimizationOptions {
  projectPath: string;
  assetTypes?: ("images" | "audio" | "all")[];
  quality?: number; // 0-100
  removeUnused?: boolean;
}

export interface OptimizationResult {
  success: boolean;
  originalSize?: number;
  optimizedSize?: number;
  savings?: number;
  files?: number;
  error?: string;
}

export async function optimizeAssets(options: OptimizationOptions): Promise<OptimizationResult> {
  try {
    const types = options.assetTypes || ["all"];
    let totalOriginal = 0;
    let totalOptimized = 0;
    let filesProcessed = 0;

    if (types.includes("images") || types.includes("all")) {
      const imgResult = await optimizeImages(options);
      totalOriginal += imgResult.originalSize || 0;
      totalOptimized += imgResult.optimizedSize || 0;
      filesProcessed += imgResult.files || 0;
    }

    if (types.includes("audio") || types.includes("all")) {
      const audioResult = await optimizeAudio(options);
      totalOriginal += audioResult.originalSize || 0;
      totalOptimized += audioResult.optimizedSize || 0;
      filesProcessed += audioResult.files || 0;
    }

    if (options.removeUnused) {
      await removeUnusedAssets(options.projectPath);
    }

    const savings = totalOriginal - totalOptimized;
    const savingsPercent = totalOriginal > 0 ? (savings / totalOriginal * 100).toFixed(2) : "0";

    return {
      success: true,
      originalSize: totalOriginal,
      optimizedSize: totalOptimized,
      savings,
      files: filesProcessed
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function optimizeImages(options: OptimizationOptions): Promise<OptimizationResult> {
  const imgDir = path.join(options.projectPath, "img");
  let originalSize = 0;
  let optimizedSize = 0;
  let filesProcessed = 0;

  try {
    const files = await getAllFiles(imgDir, [".png", ".jpg", ".jpeg"]);

    for (const file of files) {
      const stats = await fs.stat(file);
      originalSize += stats.size;

      // Simulate optimization (in real impl, use sharp or imagemin)
      const content = await fs.readFile(file);
      const quality = options.quality || 85;
      // In production: use sharp or imagemin for actual optimization
      // For now, just track the size
      optimizedSize += stats.size; // Would be smaller after optimization

      filesProcessed++;
    }

    return {
      success: true,
      originalSize,
      optimizedSize,
      files: filesProcessed
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function optimizeAudio(options: OptimizationOptions): Promise<OptimizationResult> {
  const audioDir = path.join(options.projectPath, "audio");
  let originalSize = 0;
  let optimizedSize = 0;
  let filesProcessed = 0;

  try {
    const files = await getAllFiles(audioDir, [".ogg", ".m4a", ".mp3"]);

    for (const file of files) {
      const stats = await fs.stat(file);
      originalSize += stats.size;
      optimizedSize += stats.size; // Would be smaller after optimization
      filesProcessed++;
    }

    return {
      success: true,
      originalSize,
      optimizedSize,
      files: filesProcessed
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function getAllFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...await getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory might not exist
  }

  return files;
}

async function removeUnusedAssets(projectPath: string): Promise<void> {
  // Analyze all game data to find which assets are actually used
  const usedAssets = await analyzeUsedAssets(projectPath);

  // Check img directory
  const imgFiles = await getAllFiles(path.join(projectPath, "img"), [".png", ".jpg", ".jpeg"]);
  for (const file of imgFiles) {
    const filename = path.basename(file);
    if (!usedAssets.images.has(filename)) {
      // This asset is not used
      // In production: await fs.unlink(file);
      console.log(`Would remove unused: ${filename}`);
    }
  }

  // Check audio directory
  const audioFiles = await getAllFiles(path.join(projectPath, "audio"), [".ogg", ".m4a", ".mp3"]);
  for (const file of audioFiles) {
    const filename = path.basename(file);
    if (!usedAssets.audio.has(filename)) {
      console.log(`Would remove unused: ${filename}`);
    }
  }
}

async function analyzeUsedAssets(projectPath: string): Promise<{ images: Set<string>; audio: Set<string> }> {
  const used = {
    images: new Set<string>(),
    audio: new Set<string>()
  };

  try {
    // Read all data files and extract asset references
    const dataDir = path.join(projectPath, "data");
    const files = await fs.readdir(dataDir);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = await fs.readFile(path.join(dataDir, file), "utf-8");
        const data = JSON.parse(content);

        // Extract asset references (character names, face names, etc.)
        extractAssetReferences(data, used);
      }
    }
  } catch {
    // Error reading data
  }

  return used;
}

function extractAssetReferences(obj: any, used: { images: Set<string>; audio: Set<string> }): void {
  if (typeof obj !== "object" || obj === null) return;

  for (const key in obj) {
    const value = obj[key];

    // Look for common asset reference fields
    if (typeof value === "string") {
      if (key.includes("characterName") || key.includes("faceName") || key.includes("battlerName")) {
        used.images.add(value + ".png");
      }
    } else if (typeof value === "object" && value !== null) {
      // Check for audio objects with name property
      if (key.includes("bgm") || key.includes("bgs") || key.includes("me") || key.includes("se")) {
        if ("name" in value && typeof value.name === "string") {
          used.audio.add(value.name + ".ogg");
        }
      }
      extractAssetReferences(value, used);
    }
  }
}

export async function getProjectSize(projectPath: string): Promise<{ totalSize: number; breakdown: Record<string, number> }> {
  const breakdown: Record<string, number> = {};

  const dirs = ["img", "audio", "data", "js", "movies"];

  for (const dir of dirs) {
    const dirPath = path.join(projectPath, dir);
    try {
      breakdown[dir] = await getDirectorySize(dirPath);
    } catch {
      breakdown[dir] = 0;
    }
  }

  const totalSize = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return { totalSize, breakdown };
}

async function getDirectorySize(dir: string): Promise<number> {
  let size = 0;

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        size += await getDirectorySize(fullPath);
      } else {
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }
  } catch {
    // Directory might not exist
  }

  return size;
}