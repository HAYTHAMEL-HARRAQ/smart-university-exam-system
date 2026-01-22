CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`entityType` varchar(64),
	`entityId` int,
	`oldValue` json,
	`newValue` json,
	`description` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alerts` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `examSessions` ADD `submittedAt` timestamp;--> statement-breakpoint
ALTER TABLE `examSessions` ADD `percentageScore` decimal(5,2);--> statement-breakpoint
ALTER TABLE `examSessions` ADD `passed` boolean;--> statement-breakpoint
ALTER TABLE `exams` ADD `passingScore` decimal(10,2);--> statement-breakpoint
ALTER TABLE `exams` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `fraudAnalytics` ADD `dismissedIncidents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `fraudAnalytics` ADD `averageSessionScore` decimal(5,2);--> statement-breakpoint
ALTER TABLE `fraudAnalytics` ADD `passRate` decimal(5,2);--> statement-breakpoint
ALTER TABLE `incidents` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `deletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);