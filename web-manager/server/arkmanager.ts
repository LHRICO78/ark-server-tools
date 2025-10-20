import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Path to arkmanager script - adjust based on installation
const ARKMANAGER_PATH = "/usr/local/bin/arkmanager";

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Execute an arkmanager command
 */
export async function executeArkCommand(
  command: string,
  instance?: string
): Promise<CommandResult> {
  try {
    const instanceArg = instance ? `@${instance}` : "";
    const fullCommand = `${ARKMANAGER_PATH} ${command} ${instanceArg}`;

    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout: 300000, // 5 minutes timeout
    });

    return {
      success: true,
      output: stdout || stderr || "Command executed successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message || "Unknown error",
    };
  }
}

/**
 * Start a server instance
 */
export async function startServer(instance: string): Promise<CommandResult> {
  return executeArkCommand("start", instance);
}

/**
 * Stop a server instance
 */
export async function stopServer(instance: string): Promise<CommandResult> {
  return executeArkCommand("stop", instance);
}

/**
 * Restart a server instance
 */
export async function restartServer(instance: string): Promise<CommandResult> {
  return executeArkCommand("restart", instance);
}

/**
 * Get server status
 */
export async function getServerStatus(instance: string): Promise<CommandResult> {
  return executeArkCommand("status", instance);
}

/**
 * Update server
 */
export async function updateServer(instance: string): Promise<CommandResult> {
  return executeArkCommand("update", instance);
}

/**
 * Check for updates
 */
export async function checkUpdate(instance: string): Promise<CommandResult> {
  return executeArkCommand("checkupdate", instance);
}

/**
 * Create backup
 */
export async function createBackup(instance: string): Promise<CommandResult> {
  return executeArkCommand("backup", instance);
}

/**
 * Restore backup
 */
export async function restoreBackup(
  instance: string,
  backupPath?: string
): Promise<CommandResult> {
  const command = backupPath ? `restore ${backupPath}` : "restore";
  return executeArkCommand(command, instance);
}

/**
 * Install mod
 */
export async function installMod(
  instance: string,
  modId: string
): Promise<CommandResult> {
  return executeArkCommand(`installmod ${modId}`, instance);
}

/**
 * Uninstall mod
 */
export async function uninstallMod(
  instance: string,
  modId: string
): Promise<CommandResult> {
  return executeArkCommand(`uninstallmod ${modId}`, instance);
}

/**
 * Enable mod
 */
export async function enableMod(
  instance: string,
  modId: string
): Promise<CommandResult> {
  return executeArkCommand(`enablemod ${modId}`, instance);
}

/**
 * Disable mod
 */
export async function disableMod(
  instance: string,
  modId: string
): Promise<CommandResult> {
  return executeArkCommand(`disablemod ${modId}`, instance);
}

/**
 * Check mod updates
 */
export async function checkModUpdate(instance: string): Promise<CommandResult> {
  return executeArkCommand("checkmodupdate", instance);
}

/**
 * Broadcast message
 */
export async function broadcastMessage(
  instance: string,
  message: string
): Promise<CommandResult> {
  return executeArkCommand(`broadcast "${message}"`, instance);
}

/**
 * Execute RCON command
 */
export async function executeRconCommand(
  instance: string,
  command: string
): Promise<CommandResult> {
  return executeArkCommand(`rconcmd "${command}"`, instance);
}

/**
 * Save world
 */
export async function saveWorld(instance: string): Promise<CommandResult> {
  return executeArkCommand("saveworld", instance);
}

/**
 * List instances
 */
export async function listInstances(): Promise<CommandResult> {
  return executeArkCommand("list-instances --brief");
}

