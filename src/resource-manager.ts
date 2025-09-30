import * as fs from "fs/promises";
import * as path from "path";
import { FileHelper, Logger, Validator, validateProjectPath } from "./error-handling.js";

/**
 * リソース＆プロンプト管理システム
 * MCPツールの発動にリソースとプロンプトを活用
 */

export interface Resource {
  id: string;
  type: "template" | "asset" | "scenario" | "data" | "custom";
  name: string;
  description?: string;
  content: any;
  metadata?: {
    tags?: string[];
    category?: string;
    author?: string;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: string[];
  resourceRefs?: string[];  // 参照するリソースID
  examples?: {
    input: Record<string, any>;
    output: string;
  }[];
}

export interface ResourceRegistry {
  projectPath: string;
  resources: Map<string, Resource>;
  prompts: Map<string, PromptTemplate>;
  lastUpdated: string;
}

/**
 * リソースレジストリを読み込み
 */
export async function loadResourceRegistry(projectPath: string): Promise<ResourceRegistry> {
  await validateProjectPath(projectPath);

  const registryPath = path.join(projectPath, "data", "ResourceRegistry.json");
  const registry: ResourceRegistry = {
    projectPath,
    resources: new Map(),
    prompts: new Map(),
    lastUpdated: new Date().toISOString()
  };

  try {
    const data = await FileHelper.readJSON(registryPath);

    if (data.resources) {
      for (const resource of data.resources) {
        registry.resources.set(resource.id, resource);
      }
    }

    if (data.prompts) {
      for (const prompt of data.prompts) {
        registry.prompts.set(prompt.id, prompt);
      }
    }

    registry.lastUpdated = data.lastUpdated || registry.lastUpdated;
  } catch (error) {
    // レジストリファイルが存在しない場合は新規作成
    await Logger.info("Creating new resource registry", { projectPath });
  }

  return registry;
}

/**
 * リソースレジストリを保存
 */
export async function saveResourceRegistry(registry: ResourceRegistry): Promise<void> {
  const registryPath = path.join(registry.projectPath, "data", "ResourceRegistry.json");

  const data = {
    projectPath: registry.projectPath,
    resources: Array.from(registry.resources.values()),
    prompts: Array.from(registry.prompts.values()),
    lastUpdated: new Date().toISOString()
  };

  await FileHelper.writeJSON(registryPath, data, true);
  await Logger.info("Resource registry saved", {
    resources: registry.resources.size,
    prompts: registry.prompts.size
  });
}

/**
 * リソースを登録
 */
export async function registerResource(
  projectPath: string,
  resource: Omit<Resource, "metadata"> & { metadata?: Partial<Resource["metadata"]> }
): Promise<{ success: boolean; resourceId?: string; error?: string }> {
  try {
    Validator.requireString(resource.id, "resource_id");
    Validator.requireString(resource.name, "resource_name");

    await Logger.info("Registering resource", { projectPath, resourceId: resource.id });

    const registry = await loadResourceRegistry(projectPath);

    const fullResource: Resource = {
      ...resource,
      metadata: {
        ...resource.metadata,
        createdAt: resource.metadata?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    registry.resources.set(resource.id, fullResource);
    await saveResourceRegistry(registry);

    return { success: true, resourceId: resource.id };
  } catch (error) {
    await Logger.error("Failed to register resource", { projectPath, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * プロンプトテンプレートを登録
 */
export async function registerPromptTemplate(
  projectPath: string,
  prompt: PromptTemplate
): Promise<{ success: boolean; promptId?: string; error?: string }> {
  try {
    Validator.requireString(prompt.id, "prompt_id");
    Validator.requireString(prompt.name, "prompt_name");
    Validator.requireString(prompt.template, "prompt_template");

    await Logger.info("Registering prompt template", { projectPath, promptId: prompt.id });

    const registry = await loadResourceRegistry(projectPath);
    registry.prompts.set(prompt.id, prompt);
    await saveResourceRegistry(registry);

    return { success: true, promptId: prompt.id };
  } catch (error) {
    await Logger.error("Failed to register prompt", { projectPath, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * プロンプトを実行（変数を展開）
 */
export async function executePrompt(
  projectPath: string,
  promptId: string,
  variables: Record<string, any>
): Promise<{ success: boolean; prompt?: string; error?: string }> {
  try {
    const registry = await loadResourceRegistry(projectPath);
    const promptTemplate = registry.prompts.get(promptId);

    if (!promptTemplate) {
      return {
        success: false,
        error: `Prompt template not found: ${promptId}`
      };
    }

    let prompt = promptTemplate.template;

    // 変数展開
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, "g"), String(value));
    }

    // リソース参照を展開
    if (promptTemplate.resourceRefs) {
      for (const resourceId of promptTemplate.resourceRefs) {
        const resource = registry.resources.get(resourceId);
        if (resource) {
          const placeholder = `{{resource:${resourceId}}}`;
          prompt = prompt.replace(
            new RegExp(placeholder, "g"),
            JSON.stringify(resource.content)
          );
        }
      }
    }

    await Logger.info("Prompt executed", { promptId, variablesCount: Object.keys(variables).length });

    return { success: true, prompt };
  } catch (error) {
    await Logger.error("Failed to execute prompt", { projectPath, promptId, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * リソースを取得
 */
export async function getResource(
  projectPath: string,
  resourceId: string
): Promise<{ success: boolean; resource?: Resource; error?: string }> {
  try {
    const registry = await loadResourceRegistry(projectPath);
    const resource = registry.resources.get(resourceId);

    if (!resource) {
      return {
        success: false,
        error: `Resource not found: ${resourceId}`
      };
    }

    return { success: true, resource };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * リソース一覧を取得
 */
export async function listResources(
  projectPath: string,
  filters?: {
    type?: Resource["type"];
    tags?: string[];
    category?: string;
  }
): Promise<{ success: boolean; resources?: Resource[]; error?: string }> {
  try {
    const registry = await loadResourceRegistry(projectPath);
    let resources = Array.from(registry.resources.values());

    // フィルタリング
    if (filters) {
      if (filters.type) {
        resources = resources.filter(r => r.type === filters.type);
      }
      if (filters.tags) {
        resources = resources.filter(r =>
          filters.tags!.some(tag => r.metadata?.tags?.includes(tag))
        );
      }
      if (filters.category) {
        resources = resources.filter(r => r.metadata?.category === filters.category);
      }
    }

    return { success: true, resources };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * プロンプトテンプレート一覧
 */
export async function listPromptTemplates(
  projectPath: string
): Promise<{ success: boolean; prompts?: PromptTemplate[]; error?: string }> {
  try {
    const registry = await loadResourceRegistry(projectPath);
    const prompts = Array.from(registry.prompts.values());
    return { success: true, prompts };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * デフォルトプロンプトテンプレートを初期化
 */
export async function initializeDefaultPrompts(projectPath: string): Promise<void> {
  const registry = await loadResourceRegistry(projectPath);

  // シナリオ生成用プロンプト
  registry.prompts.set("scenario_generation", {
    id: "scenario_generation",
    name: "Scenario Generation",
    description: "Generate RPG scenario from theme and style",
    template: `Create an RPG scenario with the following:
Theme: {{theme}}
Style: {{style}}
Length: {{length}}

Generate a complete scenario including:
- Story synopsis
- Maps ({{mapCount}} maps)
- Characters ({{characterCount}} characters)
- Events and dialogues
- Items and skills

Return as JSON.`,
    variables: ["theme", "style", "length", "mapCount", "characterCount"]
  });

  // 画像生成用プロンプト
  registry.prompts.set("asset_generation", {
    id: "asset_generation",
    name: "Asset Generation",
    description: "Generate game asset with specific requirements",
    template: `Generate {{assetType}} asset:
Description: {{description}}
Style: {{style}}
Technical requirements: {{specs}}

Create pixel art suitable for RPG Maker MZ.`,
    variables: ["assetType", "description", "style", "specs"]
  });

  // クエスト生成用プロンプト
  registry.prompts.set("quest_generation", {
    id: "quest_generation",
    name: "Quest Generation",
    description: "Generate RPG quests",
    template: `Generate {{questCount}} RPG quests for:
Theme: {{theme}}
Difficulty: {{difficulty}}

Each quest should include:
- Name and description
- Objectives ({{objectiveCount}} per quest)
- Rewards (exp, gold, items)

Return as JSON array.`,
    variables: ["questCount", "theme", "difficulty", "objectiveCount"]
  });

  await saveResourceRegistry(registry);
  await Logger.info("Default prompts initialized", { count: registry.prompts.size });
}

/**
 * リソースからプロンプトを生成
 */
export async function generatePromptFromResources(
  projectPath: string,
  promptId: string,
  resourceIds: string[],
  additionalVariables?: Record<string, any>
): Promise<{ success: boolean; prompt?: string; error?: string }> {
  try {
    const registry = await loadResourceRegistry(projectPath);
    const promptTemplate = registry.prompts.get(promptId);

    if (!promptTemplate) {
      return {
        success: false,
        error: `Prompt template not found: ${promptId}`
      };
    }

    // リソースからデータを取得
    const resourceData: Record<string, any> = {};
    for (const resourceId of resourceIds) {
      const resource = registry.resources.get(resourceId);
      if (resource) {
        resourceData[resourceId] = resource.content;
      }
    }

    // 変数をマージ
    const variables = {
      ...resourceData,
      ...additionalVariables
    };

    // プロンプト実行
    return await executePrompt(projectPath, promptId, variables);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}