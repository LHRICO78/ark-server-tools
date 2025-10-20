import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as arkmanager from "./arkmanager";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  servers: router({
    list: protectedProcedure.query(async () => {
      return await db.getServers();
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getServer(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          instanceName: z.string(),
          serverMap: z.string().optional(),
          maxPlayers: z.string().optional(),
          serverPort: z.string().optional(),
          queryPort: z.string().optional(),
          rconPort: z.string().optional(),
          rconPassword: z.string().optional(),
          autoStart: z.enum(["true", "false"]).optional(),
          autoUpdate: z.enum(["true", "false"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = crypto.randomUUID();
        await db.createServer({ id, ...input });
        return { id };
      }),

    updateConfig: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          serverMap: z.string().optional(),
          maxPlayers: z.string().optional(),
          serverPort: z.string().optional(),
          queryPort: z.string().optional(),
          rconPort: z.string().optional(),
          rconPassword: z.string().optional(),
          autoStart: z.enum(["true", "false"]).optional(),
          autoUpdate: z.enum(["true", "false"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateServer(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteServer(input.id);
        return { success: true };
      }),

    start: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.id);
        if (!server) throw new Error("Server not found");

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.id,
          userId: ctx.user.id,
          command: "start",
          status: "running",
        });

        await db.updateServer(input.id, { status: "starting" });

        const result = await arkmanager.startServer(server.instanceName);

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        await db.updateServer(input.id, {
          status: result.success ? "online" : "offline",
        });

        return result;
      }),

    stop: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.id);
        if (!server) throw new Error("Server not found");

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.id,
          userId: ctx.user.id,
          command: "stop",
          status: "running",
        });

        await db.updateServer(input.id, { status: "stopping" });

        const result = await arkmanager.stopServer(server.instanceName);

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        await db.updateServer(input.id, { status: "offline" });

        return result;
      }),

    restart: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.id);
        if (!server) throw new Error("Server not found");

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.id,
          userId: ctx.user.id,
          command: "restart",
          status: "running",
        });

        await db.updateServer(input.id, { status: "starting" });

        const result = await arkmanager.restartServer(server.instanceName);

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        await db.updateServer(input.id, {
          status: result.success ? "online" : "offline",
        });

        return result;
      }),

    status: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const server = await db.getServer(input.id);
        if (!server) throw new Error("Server not found");

        const result = await arkmanager.getServerStatus(server.instanceName);
        return result;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.id);
        if (!server) throw new Error("Server not found");

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.id,
          userId: ctx.user.id,
          command: "update",
          status: "running",
        });

        await db.updateServer(input.id, { status: "updating" });

        const result = await arkmanager.updateServer(server.instanceName);

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        await db.updateServer(input.id, {
          status: result.success ? "online" : "offline",
        });

        return result;
      }),

    broadcast: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          message: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.id);
        if (!server) throw new Error("Server not found");

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.id,
          userId: ctx.user.id,
          command: `broadcast: ${input.message}`,
          status: "running",
        });

        const result = await arkmanager.broadcastMessage(
          server.instanceName,
          input.message
        );

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        return result;
      }),

    rcon: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          command: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.id);
        if (!server) throw new Error("Server not found");

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.id,
          userId: ctx.user.id,
          command: `rcon: ${input.command}`,
          status: "running",
        });

        const result = await arkmanager.executeRconCommand(
          server.instanceName,
          input.command
        );

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        return result;
      }),
  }),

  mods: router({
    list: protectedProcedure
      .input(z.object({ serverId: z.string() }))
      .query(async ({ input }) => {
        return await db.getServerMods(input.serverId);
      }),

    install: protectedProcedure
      .input(
        z.object({
          serverId: z.string(),
          modId: z.string(),
          modName: z.string().optional(),
          modType: z.enum(["game", "map", "tc"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.serverId);
        if (!server) throw new Error("Server not found");

        const id = crypto.randomUUID();
        await db.createServerMod({
          id,
          serverId: input.serverId,
          modId: input.modId,
          modName: input.modName,
          modType: input.modType || "game",
          enabled: "true",
        });

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.serverId,
          userId: ctx.user.id,
          command: `installmod ${input.modId}`,
          status: "running",
        });

        const result = await arkmanager.installMod(
          server.instanceName,
          input.modId
        );

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        return result;
      }),

    uninstall: protectedProcedure
      .input(
        z.object({
          serverId: z.string(),
          modId: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.serverId);
        if (!server) throw new Error("Server not found");

        const mods = await db.getServerMods(input.serverId);
        const mod = mods.find((m) => m.modId === input.modId);
        if (mod) {
          await db.deleteServerMod(mod.id);
        }

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.serverId,
          userId: ctx.user.id,
          command: `uninstallmod ${input.modId}`,
          status: "running",
        });

        const result = await arkmanager.uninstallMod(
          server.instanceName,
          input.modId
        );

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        return result;
      }),

    enable: protectedProcedure
      .input(
        z.object({
          serverId: z.string(),
          modId: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.serverId);
        if (!server) throw new Error("Server not found");

        const mods = await db.getServerMods(input.serverId);
        const mod = mods.find((m) => m.modId === input.modId);
        if (mod) {
          await db.updateServerMod(mod.id, { enabled: "true" });
        }

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.serverId,
          userId: ctx.user.id,
          command: `enablemod ${input.modId}`,
          status: "running",
        });

        const result = await arkmanager.enableMod(
          server.instanceName,
          input.modId
        );

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        return result;
      }),

    disable: protectedProcedure
      .input(
        z.object({
          serverId: z.string(),
          modId: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.serverId);
        if (!server) throw new Error("Server not found");

        const mods = await db.getServerMods(input.serverId);
        const mod = mods.find((m) => m.modId === input.modId);
        if (mod) {
          await db.updateServerMod(mod.id, { enabled: "false" });
        }

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.serverId,
          userId: ctx.user.id,
          command: `disablemod ${input.modId}`,
          status: "running",
        });

        const result = await arkmanager.disableMod(
          server.instanceName,
          input.modId
        );

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        return result;
      }),
  }),

  backups: router({
    list: protectedProcedure
      .input(z.object({ serverId: z.string() }))
      .query(async ({ input }) => {
        return await db.getBackups(input.serverId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          serverId: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.serverId);
        if (!server) throw new Error("Server not found");

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.serverId,
          userId: ctx.user.id,
          command: "backup",
          status: "running",
        });

        const result = await arkmanager.createBackup(server.instanceName);

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        if (result.success) {
          const id = crypto.randomUUID();
          const fileName = `backup-${Date.now()}.tar.gz`;
          await db.createBackup({
            id,
            serverId: input.serverId,
            fileName,
            filePath: `/path/to/backups/${fileName}`,
            description: input.description,
          });
        }

        return result;
      }),

    restore: protectedProcedure
      .input(
        z.object({
          serverId: z.string(),
          backupId: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const server = await db.getServer(input.serverId);
        if (!server) throw new Error("Server not found");

        let backupPath: string | undefined;
        if (input.backupId) {
          const backups = await db.getBackups(input.serverId);
          const backup = backups.find((b) => b.id === input.backupId);
          if (backup) {
            backupPath = backup.filePath;
          }
        }

        const logId = crypto.randomUUID();
        await db.createCommandLog({
          id: logId,
          serverId: input.serverId,
          userId: ctx.user.id,
          command: `restore ${backupPath || "latest"}`,
          status: "running",
        });

        const result = await arkmanager.restoreBackup(
          server.instanceName,
          backupPath
        );

        await db.updateCommandLog(logId, {
          status: result.success ? "success" : "error",
          output: result.output,
          error: result.error,
        });

        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteBackup(input.id);
        return { success: true };
      }),
  }),

  logs: router({
    list: protectedProcedure
      .input(
        z.object({
          serverId: z.string().optional(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await db.getCommandLogs(input.serverId, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
