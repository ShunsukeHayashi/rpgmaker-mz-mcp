import * as fs from "fs/promises";
import * as path from "path";

export interface PerformanceReport {
  projectSize: number;
  mapCount: number;
  eventCount: number;
  largestMaps: Array<{ name: string; size: number }>;
  assetCount: { images: number; audio: number };
  recommendations: string[];
}

export async function analyzePerformance(projectPath: string): Promise<{ success: boolean; report?: PerformanceReport; error?: string }> {
  try {
    const report: PerformanceReport = {
      projectSize: 0,
      mapCount: 0,
      eventCount: 0,
      largestMaps: [],
      assetCount: { images: 0, audio: 0 },
      recommendations: []
    };

    // Analyze maps
    const mapsFile = path.join(projectPath, "data", "MapInfos.json");
    const maps = JSON.parse(await fs.readFile(mapsFile, "utf-8"));
    report.mapCount = Object.keys(maps).filter(k => maps[k]).length;

    // Count events
    for (const [id, mapInfo] of Object.entries(maps)) {
      if (!mapInfo) continue;
      try {
        const mapFile = path.join(projectPath, "data", `Map${String(id).padStart(3, "0")}.json`);
        const mapData = JSON.parse(await fs.readFile(mapFile, "utf-8"));
        const eventCount = mapData.events?.filter((e: any) => e).length || 0;
        report.eventCount += eventCount;
      } catch {}
    }

    // Generate recommendations
    if (report.mapCount > 50) {
      report.recommendations.push("Consider splitting into multiple projects");
    }
    if (report.eventCount > 500) {
      report.recommendations.push("High event count may impact performance");
    }

    return { success: true, report };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}