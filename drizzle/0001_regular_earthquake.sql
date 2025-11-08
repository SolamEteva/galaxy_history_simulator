CREATE TABLE `civilizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`speciesId` int NOT NULL,
	`planetId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`governmentType` varchar(100) NOT NULL,
	`yearFounded` int NOT NULL,
	`yearFallen` int,
	`populationEstimate` varchar(100),
	`technologyLevel` int NOT NULL,
	`militaryStrength` int NOT NULL,
	`culturalInfluence` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `civilizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`causeEventId` int NOT NULL,
	`effectEventId` int NOT NULL,
	`connectionType` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`year` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`speciesIds` json,
	`planetIds` json,
	`civilizationIds` json,
	`importance` int NOT NULL,
	`imageUrl` varchar(500),
	`imagePrompt` text,
	`generatedImageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `galaxies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`seed` varchar(64),
	`startYear` int NOT NULL DEFAULT 0,
	`currentYear` int NOT NULL DEFAULT 0,
	`endYear` int NOT NULL,
	`status` enum('created','running','paused','completed') NOT NULL DEFAULT 'created',
	`isPaused` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `galaxies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historyDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`format` enum('markdown','html','pdf') NOT NULL DEFAULT 'markdown',
	`fileUrl` varchar(500),
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `historyDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`starSystemName` varchar(255) NOT NULL,
	`planetType` enum('terrestrial','aquatic','desert','ice','volcanic','gas-giant','moon') NOT NULL,
	`habitability` int NOT NULL,
	`originSpeciesId` int,
	`currentSpeciesIds` json,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`year` int NOT NULL,
	`logType` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `simulationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `species` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`speciesType` varchar(100) NOT NULL,
	`originPlanetId` int,
	`yearOfOrigin` int NOT NULL,
	`yearOfSentience` int,
	`yearOfFirstCivilization` int,
	`yearOfSpaceflight` int,
	`traits` json,
	`physicalDescription` text,
	`culturalDescription` text,
	`color` varchar(7),
	`extinct` boolean NOT NULL DEFAULT false,
	`yearOfExtinction` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `species_id` PRIMARY KEY(`id`)
);
