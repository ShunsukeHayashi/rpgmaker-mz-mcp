import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  createNewProject,
  createMap,
  addEvent,
  addActor,
  addClass
} from '../dist/game-creation-tools.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const TEST_PATH = '/tmp/rpgmaker-unit-test';

describe('RPG Maker MZ Game Creation', () => {
  beforeAll(async () => {
    await fs.rm(TEST_PATH, { recursive: true, force: true });
  });

  afterAll(async () => {
    await fs.rm(TEST_PATH, { recursive: true, force: true });
  });

  describe('Project Creation', () => {
    it('should create a new project', async () => {
      const result = await createNewProject(TEST_PATH, 'Unit Test Game');
      expect(result.success).toBe(true);

      const projectFile = path.join(TEST_PATH, 'Game.rpgproject');
      const exists = await fs.access(projectFile).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should create proper directory structure', async () => {
      const dirs = ['data', 'img', 'audio', 'js'];
      for (const dir of dirs) {
        const dirPath = path.join(TEST_PATH, dir);
        const exists = await fs.access(dirPath).then(() => true).catch(() => false);
        expect(exists).toBe(true);
      }
    });
  });

  describe('Map Creation', () => {
    it('should create a new map', async () => {
      const result = await createMap(TEST_PATH, 5, 'Test Map', 20, 15);
      expect(result.success).toBe(true);
      expect(result.mapId).toBe(5);

      const mapFile = path.join(TEST_PATH, 'data', 'Map005.json');
      const exists = await fs.access(mapFile).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should have correct map dimensions', async () => {
      const mapFile = path.join(TEST_PATH, 'data', 'Map005.json');
      const content = JSON.parse(await fs.readFile(mapFile, 'utf-8'));
      expect(content.width).toBe(20);
      expect(content.height).toBe(15);
    });
  });

  describe('Database Operations', () => {
    it('should create a new class', async () => {
      const result = await addClass(TEST_PATH, 10, 'Test Warrior');
      expect(result.success).toBe(true);

      const classesFile = path.join(TEST_PATH, 'data', 'Classes.json');
      const classes = JSON.parse(await fs.readFile(classesFile, 'utf-8'));
      expect(classes[10]).toBeDefined();
      expect(classes[10].name).toBe('Test Warrior');
    });

    it('should create a new actor', async () => {
      const result = await addActor(TEST_PATH, 10, 'Test Hero');
      expect(result.success).toBe(true);

      const actorsFile = path.join(TEST_PATH, 'data', 'Actors.json');
      const actors = JSON.parse(await fs.readFile(actorsFile, 'utf-8'));
      expect(actors[10]).toBeDefined();
      expect(actors[10].name).toBe('Test Hero');
    });
  });

  describe('Event Creation', () => {
    it('should create a new event', async () => {
      const result = await addEvent(TEST_PATH, 5, 1, 'Test NPC', 10, 10);
      expect(result.success).toBe(true);

      const mapFile = path.join(TEST_PATH, 'data', 'Map005.json');
      const map = JSON.parse(await fs.readFile(mapFile, 'utf-8'));
      expect(map.events[1]).toBeDefined();
      expect(map.events[1].name).toBe('Test NPC');
      expect(map.events[1].x).toBe(10);
      expect(map.events[1].y).toBe(10);
    });
  });
});