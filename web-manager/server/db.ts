import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, servers, serverMods, backups, commandLogs, InsertServer, InsertServerMod, InsertBackup, InsertCommandLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Server queries
export async function createServer(server: InsertServer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(servers).values(server);
}

export async function getServers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(servers);
}

export async function getServer(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateServer(id: string, data: Partial<InsertServer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(servers).set(data).where(eq(servers.id, id));
}

export async function deleteServer(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(servers).where(eq(servers.id, id));
}

// Server mods queries
export async function getServerMods(serverId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(serverMods).where(eq(serverMods.serverId, serverId));
}

export async function createServerMod(mod: InsertServerMod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(serverMods).values(mod);
}

export async function deleteServerMod(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(serverMods).where(eq(serverMods.id, id));
}

export async function updateServerMod(id: string, data: Partial<InsertServerMod>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(serverMods).set(data).where(eq(serverMods.id, id));
}

// Backup queries
export async function getBackups(serverId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(backups).where(eq(backups.serverId, serverId));
}

export async function createBackup(backup: InsertBackup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(backups).values(backup);
}

export async function deleteBackup(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(backups).where(eq(backups.id, id));
}

// Command log queries
export async function createCommandLog(log: InsertCommandLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(commandLogs).values(log);
}

export async function getCommandLogs(serverId?: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  if (serverId) {
    return await db.select().from(commandLogs).where(eq(commandLogs.serverId, serverId)).limit(limit);
  }
  return await db.select().from(commandLogs).limit(limit);
}

export async function updateCommandLog(id: string, data: Partial<InsertCommandLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(commandLogs).set(data).where(eq(commandLogs.id, id));
}
