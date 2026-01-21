CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`figureId` int NOT NULL,
	`galaxyId` int NOT NULL,
	`year` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`achievementType` varchar(50) NOT NULL,
	`civilizationImpact` int,
	`historicalSignificance` int,
	`triggeredEvents` json,
	`enabledTechnologies` json,
	`influencedBeliefs` json,
	`collaborators` json,
	`opposition` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `civilizationEvolution` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civilizationId` int NOT NULL,
	`survivalFitness` decimal(3,2) NOT NULL,
	`culturalFitness` decimal(3,2) NOT NULL,
	`technologicalFitness` decimal(3,2) NOT NULL,
	`expansionFitness` decimal(3,2) NOT NULL,
	`expansionistStrategy` decimal(3,2) NOT NULL,
	`peacefulStrategy` decimal(3,2) NOT NULL,
	`innovativeStrategy` decimal(3,2) NOT NULL,
	`culturalStrategy` decimal(3,2) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `civilizationEvolution_id` PRIMARY KEY(`id`),
	CONSTRAINT `civilizationEvolution_civilizationId_unique` UNIQUE(`civilizationId`)
);
--> statement-breakpoint
CREATE TABLE `civilizationHarmonic` (
	`id` int AUTO_INCREMENT NOT NULL,
	`civilizationId` int NOT NULL,
	`harmonyFrequency` decimal(6,2) NOT NULL,
	`phaseCoherence` decimal(3,2) NOT NULL,
	`unityCoefficient` decimal(3,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `civilizationHarmonic_id` PRIMARY KEY(`id`),
	CONSTRAINT `civilizationHarmonic_civilizationId_unique` UNIQUE(`civilizationId`)
);
--> statement-breakpoint
CREATE TABLE `civilizationRelationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`civilizationAId` int NOT NULL,
	`civilizationBId` int NOT NULL,
	`alignment` decimal(3,2) NOT NULL,
	`harmonyDistance` decimal(3,2) NOT NULL,
	`causalCoupling` decimal(3,2) NOT NULL,
	`lastInteractionYear` int,
	`eventTypes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `civilizationRelationships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventAuthenticity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`unityCoefficient` decimal(3,2) NOT NULL,
	`constraintSatisfaction` decimal(3,2) NOT NULL,
	`sacredGapScore` decimal(3,2) NOT NULL,
	`authenticityScore` decimal(3,2) NOT NULL,
	`confidenceScore` decimal(3,2) NOT NULL,
	`validationViolations` json,
	`generationPrompt` text,
	`llmModel` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventAuthenticity_id` PRIMARY KEY(`id`),
	CONSTRAINT `eventAuthenticity_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `eventHarmonic` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`harmonyFrequency` decimal(6,2) NOT NULL,
	`phaseCoherence` decimal(3,2) NOT NULL,
	`resonanceVectorSound` decimal(3,2),
	`resonanceVectorLight` decimal(3,2),
	`resonanceVectorTime` decimal(3,2),
	`causalStrength` decimal(3,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventHarmonic_id` PRIMARY KEY(`id`),
	CONSTRAINT `eventHarmonic_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `genealogies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`civilizationId` int NOT NULL,
	`lineageName` varchar(255) NOT NULL,
	`founderFigureId` int NOT NULL,
	`generations` json NOT NULL,
	`dominantTraits` json,
	`culturalInfluence` int,
	`powerDuration` int,
	`majorAchievements` json,
	`conflicts` json,
	`alliances` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `genealogies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historicalMemory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`figureId` int NOT NULL,
	`civilizationId` int NOT NULL,
	`memoryStrength` decimal(3,2) NOT NULL DEFAULT '1.00',
	`publicPerception` varchar(100),
	`mythologization` decimal(3,2) NOT NULL DEFAULT '0.00',
	`lastMentionedYear` int,
	`mentionCount` int NOT NULL DEFAULT 0,
	`currentInfluence` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `historicalMemory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notableFigures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`galaxyId` int NOT NULL,
	`civilizationId` int NOT NULL,
	`speciesId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameOrigin` varchar(255),
	`birthYear` int NOT NULL,
	`deathYear` int,
	`archetype` varchar(50) NOT NULL,
	`primaryRole` varchar(100),
	`secondaryRoles` json,
	`attributes` json NOT NULL,
	`influence` int NOT NULL DEFAULT 0,
	`legacyScore` int NOT NULL DEFAULT 0,
	`mentors` json,
	`students` json,
	`allies` json,
	`rivals` json,
	`family` json,
	`generation` int NOT NULL DEFAULT 0,
	`lineageId` varchar(36),
	`birthEventId` int,
	`deathEventId` int,
	`majorEvents` json,
	`speciesTraits` json,
	`culturalTraits` json,
	`generatedBy` varchar(50) NOT NULL DEFAULT 'llm',
	`generationPrompt` text,
	`llmModel` varchar(255),
	`confidenceScore` decimal(3,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notableFigures_id` PRIMARY KEY(`id`)
);
