CREATE TABLE `agentConfigurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`maxConcurrentTasks` int NOT NULL DEFAULT 3,
	`taskTimeoutMinutes` int NOT NULL DEFAULT 30,
	`retryPolicy` enum('aggressive','moderate','conservative') NOT NULL DEFAULT 'moderate',
	`maxRetries` int NOT NULL DEFAULT 2,
	`enableFeatureDevelopment` boolean NOT NULL DEFAULT true,
	`enableBugFixes` boolean NOT NULL DEFAULT true,
	`enableDocumentation` boolean NOT NULL DEFAULT false,
	`sendNotifications` boolean NOT NULL DEFAULT true,
	`notificationEmail` varchar(320),
	`autoCommitChanges` boolean NOT NULL DEFAULT true,
	`autoCreateBranches` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentConfigurations_id` PRIMARY KEY(`id`),
	CONSTRAINT `agentConfigurations_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `agentExecutionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`executionDate` timestamp NOT NULL DEFAULT (now()),
	`tasksCompleted` int NOT NULL DEFAULT 0,
	`tasksFailed` int NOT NULL DEFAULT 0,
	`tasksSkipped` int NOT NULL DEFAULT 0,
	`totalExecutionTimeMinutes` decimal(8,2) NOT NULL DEFAULT '0',
	`averageTaskTimeMinutes` decimal(8,2),
	`successRate` decimal(3,2),
	`cpuUsagePercent` decimal(5,2),
	`memoryUsagePercent` decimal(5,2),
	`diskUsagePercent` decimal(5,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentExecutionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('feature','bug-fix','documentation','optimization','testing') NOT NULL,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('pending','in-progress','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`assignedAgent` varchar(64),
	`estimatedHours` decimal(5,2),
	`actualHours` decimal(5,2),
	`completionPercentage` int NOT NULL DEFAULT 0,
	`successMetrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agentWorkflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` int NOT NULL,
	`workflowType` enum('feature-development','bug-fix','documentation') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`currentStep` int NOT NULL DEFAULT 0,
	`totalSteps` int NOT NULL,
	`steps` json,
	`executionLog` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentWorkflows_id` PRIMARY KEY(`id`)
);
