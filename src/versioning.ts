import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function initVersionControl(projectPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    await execAsync("git init", { cwd: projectPath });

    // Create .gitignore
    const gitignore = `node_modules/
*.log
.DS_Store
save/
`;
    await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore, "utf-8");

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function createSnapshot(projectPath: string, message: string): Promise<{ success: boolean; commit?: string; error?: string }> {
  try {
    await execAsync("git add -A", { cwd: projectPath });
    const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd: projectPath });
    return { success: true, commit: stdout.trim() };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function createBackup(projectPath: string, backupDir: string): Promise<{ success: boolean; backup?: string; error?: string }> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    // Copy project
    await fs.cp(projectPath, backupPath, { recursive: true });

    return { success: true, backup: backupPath };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}