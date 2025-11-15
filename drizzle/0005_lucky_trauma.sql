ALTER TABLE `eventConnections` DROP FOREIGN KEY `eventConnections_galaxyId_galaxies_id_fk`;
--> statement-breakpoint
ALTER TABLE `eventConnections` DROP FOREIGN KEY `eventConnections_causeEventId_events_id_fk`;
--> statement-breakpoint
ALTER TABLE `eventConnections` DROP FOREIGN KEY `eventConnections_effectEventId_events_id_fk`;
--> statement-breakpoint
ALTER TABLE `historyDocuments` DROP FOREIGN KEY `historyDocuments_galaxyId_galaxies_id_fk`;
--> statement-breakpoint
ALTER TABLE `historyDocuments` DROP FOREIGN KEY `historyDocuments_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `simulationLogs` DROP FOREIGN KEY `simulationLogs_galaxyId_galaxies_id_fk`;
--> statement-breakpoint
ALTER TABLE `simulationLogs` MODIFY COLUMN `year` int NOT NULL;