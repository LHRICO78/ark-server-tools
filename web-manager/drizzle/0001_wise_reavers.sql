CREATE TABLE `backups` (
	`id` varchar(64) NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`filePath` text NOT NULL,
	`fileSize` varchar(64),
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `backups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commandLogs` (
	`id` varchar(64) NOT NULL,
	`serverId` varchar(64),
	`userId` varchar(64),
	`command` varchar(255) NOT NULL,
	`status` enum('success','error','running') NOT NULL DEFAULT 'running',
	`output` text,
	`error` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `commandLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serverMods` (
	`id` varchar(64) NOT NULL,
	`serverId` varchar(64) NOT NULL,
	`modId` varchar(64) NOT NULL,
	`modName` varchar(255),
	`enabled` enum('true','false') NOT NULL DEFAULT 'true',
	`modType` enum('game','map','tc') NOT NULL DEFAULT 'game',
	`loadOrder` varchar(10) DEFAULT '0',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `serverMods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`instanceName` varchar(255) NOT NULL,
	`serverMap` varchar(255) DEFAULT 'TheIsland',
	`maxPlayers` varchar(10) DEFAULT '70',
	`serverPort` varchar(10) DEFAULT '7777',
	`queryPort` varchar(10) DEFAULT '27015',
	`rconPort` varchar(10) DEFAULT '32330',
	`rconPassword` varchar(255),
	`status` enum('online','offline','starting','stopping','updating') NOT NULL DEFAULT 'offline',
	`autoStart` enum('true','false') NOT NULL DEFAULT 'false',
	`autoUpdate` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `servers_id` PRIMARY KEY(`id`),
	CONSTRAINT `servers_instanceName_unique` UNIQUE(`instanceName`)
);
--> statement-breakpoint
ALTER TABLE `backups` ADD CONSTRAINT `backups_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commandLogs` ADD CONSTRAINT `commandLogs_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commandLogs` ADD CONSTRAINT `commandLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `serverMods` ADD CONSTRAINT `serverMods_serverId_servers_id_fk` FOREIGN KEY (`serverId`) REFERENCES `servers`(`id`) ON DELETE cascade ON UPDATE no action;