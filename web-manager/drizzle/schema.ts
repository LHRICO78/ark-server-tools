import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ARK Server instances
export const servers = mysqlTable("servers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  instanceName: varchar("instanceName", { length: 255 }).notNull().unique(),
  serverMap: varchar("serverMap", { length: 255 }).default("TheIsland"),
  maxPlayers: varchar("maxPlayers", { length: 10 }).default("70"),
  serverPort: varchar("serverPort", { length: 10 }).default("7777"),
  queryPort: varchar("queryPort", { length: 10 }).default("27015"),
  rconPort: varchar("rconPort", { length: 10 }).default("32330"),
  rconPassword: varchar("rconPassword", { length: 255 }),
  status: mysqlEnum("status", ["online", "offline", "starting", "stopping", "updating"]).default("offline").notNull(),
  autoStart: mysqlEnum("autoStart", ["true", "false"]).default("false").notNull(),
  autoUpdate: mysqlEnum("autoUpdate", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Server = typeof servers.$inferSelect;
export type InsertServer = typeof servers.$inferInsert;

// Server mods
export const serverMods = mysqlTable("serverMods", {
  id: varchar("id", { length: 64 }).primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull().references(() => servers.id, { onDelete: "cascade" }),
  modId: varchar("modId", { length: 64 }).notNull(),
  modName: varchar("modName", { length: 255 }),
  enabled: mysqlEnum("enabled", ["true", "false"]).default("true").notNull(),
  modType: mysqlEnum("modType", ["game", "map", "tc"]).default("game").notNull(),
  loadOrder: varchar("loadOrder", { length: 10 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ServerMod = typeof serverMods.$inferSelect;
export type InsertServerMod = typeof serverMods.$inferInsert;

// Server backups
export const backups = mysqlTable("backups", {
  id: varchar("id", { length: 64 }).primaryKey(),
  serverId: varchar("serverId", { length: 64 }).notNull().references(() => servers.id, { onDelete: "cascade" }),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  filePath: text("filePath").notNull(),
  fileSize: varchar("fileSize", { length: 64 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Backup = typeof backups.$inferSelect;
export type InsertBackup = typeof backups.$inferInsert;

// Command logs
export const commandLogs = mysqlTable("commandLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  serverId: varchar("serverId", { length: 64 }).references(() => servers.id, { onDelete: "set null" }),
  userId: varchar("userId", { length: 64 }).references(() => users.id, { onDelete: "set null" }),
  command: varchar("command", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["success", "error", "running"]).default("running").notNull(),
  output: text("output"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type CommandLog = typeof commandLogs.$inferSelect;
export type InsertCommandLog = typeof commandLogs.$inferInsert;
