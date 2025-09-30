import * as fs from "fs/promises";
import * as path from "path";
import {
  getDefaultSystem,
  getDefaultMapInfo,
  getDefaultMap,
  getDefaultEvent,
  getDefaultActor,
  getDefaultClass,
  getDefaultSkill,
  getDefaultItem,
  getDefaultProjectStructure
} from "./templates.js";

export async function createNewProject(projectPath: string, gameTitle: string) {
  // Create directory structure
  const dirs = [
    "audio/bgm",
    "audio/bgs",
    "audio/me",
    "audio/se",
    "data",
    "effects",
    "img/animations",
    "img/battlebacks1",
    "img/battlebacks2",
    "img/characters",
    "img/enemies",
    "img/faces",
    "img/parallaxes",
    "img/pictures",
    "img/sv_actors",
    "img/sv_enemies",
    "img/system",
    "img/tilesets",
    "img/titles1",
    "img/titles2",
    "js/plugins",
    "movies"
  ];

  for (const dir of dirs) {
    await fs.mkdir(path.join(projectPath, dir), { recursive: true });
  }

  // Create Game.rpgproject file
  const projectFile = `RPGMZ 1.0.0`;
  await fs.writeFile(path.join(projectPath, "Game.rpgproject"), projectFile, "utf-8");

  // Create System.json
  const system = getDefaultSystem(gameTitle);
  await fs.writeFile(
    path.join(projectPath, "data", "System.json"),
    JSON.stringify(system, null, 0),
    "utf-8"
  );

  // Create initial map
  const mapInfos = [null, getDefaultMapInfo(1, "MAP001")];
  await fs.writeFile(
    path.join(projectPath, "data", "MapInfos.json"),
    JSON.stringify(mapInfos, null, 0),
    "utf-8"
  );

  const map001 = getDefaultMap(1, "MAP001");
  await fs.writeFile(
    path.join(projectPath, "data", "Map001.json"),
    JSON.stringify(map001, null, 0),
    "utf-8"
  );

  // Create empty database files
  await fs.writeFile(path.join(projectPath, "data", "Actors.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Classes.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Skills.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Items.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Weapons.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Armors.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Enemies.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Troops.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "States.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Animations.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "Tilesets.json"), JSON.stringify([null], null, 0), "utf-8");
  await fs.writeFile(path.join(projectPath, "data", "CommonEvents.json"), JSON.stringify([null], null, 0), "utf-8");

  return { success: true, message: `Project created at ${projectPath}` };
}

export async function createMap(projectPath: string, mapId: number, name: string, width = 17, height = 13) {
  // Read MapInfos
  const mapInfosPath = path.join(projectPath, "data", "MapInfos.json");
  const mapInfosContent = await fs.readFile(mapInfosPath, "utf-8");
  const mapInfos = JSON.parse(mapInfosContent);

  // Add new map info
  mapInfos[mapId] = getDefaultMapInfo(mapId, name);
  await fs.writeFile(mapInfosPath, JSON.stringify(mapInfos, null, 0), "utf-8");

  // Create map file
  const map = getDefaultMap(mapId, name, width, height);
  const mapFilename = `Map${String(mapId).padStart(3, "0")}.json`;
  await fs.writeFile(
    path.join(projectPath, "data", mapFilename),
    JSON.stringify(map, null, 0),
    "utf-8"
  );

  return { success: true, mapId, name };
}

export async function updateMapTile(
  projectPath: string,
  mapId: number,
  x: number,
  y: number,
  layer: number,
  tileId: number
) {
  const mapFilename = `Map${String(mapId).padStart(3, "0")}.json`;
  const mapPath = path.join(projectPath, "data", mapFilename);
  const mapContent = await fs.readFile(mapPath, "utf-8");
  const map = JSON.parse(mapContent);

  const index = (layer * map.height + y) * map.width + x;
  map.data[index] = tileId;

  await fs.writeFile(mapPath, JSON.stringify(map, null, 0), "utf-8");
  return { success: true };
}

export async function addEvent(
  projectPath: string,
  mapId: number,
  eventId: number,
  name: string,
  x: number,
  y: number
) {
  const mapFilename = `Map${String(mapId).padStart(3, "0")}.json`;
  const mapPath = path.join(projectPath, "data", mapFilename);
  const mapContent = await fs.readFile(mapPath, "utf-8");
  const map = JSON.parse(mapContent);

  const event = getDefaultEvent(eventId, name, x, y);
  map.events[eventId] = event;

  await fs.writeFile(mapPath, JSON.stringify(map, null, 0), "utf-8");
  return { success: true, eventId };
}

export async function updateEvent(
  projectPath: string,
  mapId: number,
  eventId: number,
  updates: any
) {
  const mapFilename = `Map${String(mapId).padStart(3, "0")}.json`;
  const mapPath = path.join(projectPath, "data", mapFilename);
  const mapContent = await fs.readFile(mapPath, "utf-8");
  const map = JSON.parse(mapContent);

  if (!map.events[eventId]) {
    throw new Error(`Event ${eventId} not found`);
  }

  Object.assign(map.events[eventId], updates);
  await fs.writeFile(mapPath, JSON.stringify(map, null, 0), "utf-8");
  return { success: true };
}

export async function addEventCommand(
  projectPath: string,
  mapId: number,
  eventId: number,
  pageIndex: number,
  command: { code: number; indent: number; parameters: any[] }
) {
  const mapFilename = `Map${String(mapId).padStart(3, "0")}.json`;
  const mapPath = path.join(projectPath, "data", mapFilename);
  const mapContent = await fs.readFile(mapPath, "utf-8");
  const map = JSON.parse(mapContent);

  if (!map.events[eventId]) {
    throw new Error(`Event ${eventId} not found`);
  }

  const page = map.events[eventId].pages[pageIndex];
  if (!page) {
    throw new Error(`Page ${pageIndex} not found`);
  }

  // Insert before the end command (code 0)
  page.list.splice(page.list.length - 1, 0, command);

  await fs.writeFile(mapPath, JSON.stringify(map, null, 0), "utf-8");
  return { success: true };
}

export async function addActor(projectPath: string, id: number, name: string) {
  const actorsPath = path.join(projectPath, "data", "Actors.json");
  const actorsContent = await fs.readFile(actorsPath, "utf-8");
  const actors = JSON.parse(actorsContent);

  actors[id] = getDefaultActor(id, name);
  await fs.writeFile(actorsPath, JSON.stringify(actors, null, 0), "utf-8");
  return { success: true, id };
}

export async function addClass(projectPath: string, id: number, name: string) {
  const classesPath = path.join(projectPath, "data", "Classes.json");
  const classesContent = await fs.readFile(classesPath, "utf-8");
  const classes = JSON.parse(classesContent);

  classes[id] = getDefaultClass(id, name);
  await fs.writeFile(classesPath, JSON.stringify(classes, null, 0), "utf-8");
  return { success: true, id };
}

export async function addSkill(projectPath: string, id: number, name: string) {
  const skillsPath = path.join(projectPath, "data", "Skills.json");
  const skillsContent = await fs.readFile(skillsPath, "utf-8");
  const skills = JSON.parse(skillsContent);

  skills[id] = getDefaultSkill(id, name);
  await fs.writeFile(skillsPath, JSON.stringify(skills, null, 0), "utf-8");
  return { success: true, id };
}

export async function addItem(projectPath: string, id: number, name: string) {
  const itemsPath = path.join(projectPath, "data", "Items.json");
  const itemsContent = await fs.readFile(itemsPath, "utf-8");
  const items = JSON.parse(itemsContent);

  items[id] = getDefaultItem(id, name);
  await fs.writeFile(itemsPath, JSON.stringify(items, null, 0), "utf-8");
  return { success: true, id };
}

export async function updateDatabase(
  projectPath: string,
  database: string,
  id: number,
  updates: any
) {
  const dbPath = path.join(projectPath, "data", `${database}.json`);
  const dbContent = await fs.readFile(dbPath, "utf-8");
  const data = JSON.parse(dbContent);

  if (!data[id]) {
    throw new Error(`${database} entry ${id} not found`);
  }

  Object.assign(data[id], updates);
  await fs.writeFile(dbPath, JSON.stringify(data, null, 0), "utf-8");
  return { success: true };
}