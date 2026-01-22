CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`alertType` enum('phone_detected','multiple_faces','off_screen_gaze','suspicious_audio','unauthorized_person','unusual_behavior','network_anomaly','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`confidenceScore` decimal(5,2) NOT NULL,
	`description` text,
	`videoClipUrl` text,
	`videoClipStartTime` int,
	`videoClipDuration` int,
	`metadata` json,
	`acknowledged` boolean NOT NULL DEFAULT false,
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `examSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int NOT NULL,
	`studentId` int NOT NULL,
	`startedAt` timestamp NOT NULL,
	`endedAt` timestamp,
	`status` enum('not_started','in_progress','submitted','paused','abandoned','flagged') NOT NULL DEFAULT 'not_started',
	`biometricVerified` boolean NOT NULL DEFAULT false,
	`biometricVerifiedAt` timestamp,
	`score` decimal(10,2),
	`videoRecordingUrl` text,
	`videoMetadata` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`suspiciousActivityCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `examSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`courseCode` varchar(64) NOT NULL,
	`department` varchar(255) NOT NULL,
	`description` text,
	`duration` int NOT NULL,
	`totalQuestions` int,
	`maxScore` decimal(10,2),
	`scheduledAt` timestamp NOT NULL,
	`endAt` timestamp,
	`status` enum('draft','scheduled','active','completed','cancelled') NOT NULL DEFAULT 'draft',
	`detectionSensitivity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`requiresBiometric` boolean NOT NULL DEFAULT true,
	`allowedDevices` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fraudAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int,
	`courseCode` varchar(64),
	`department` varchar(255),
	`period` varchar(32),
	`totalExamSessions` int NOT NULL DEFAULT 0,
	`flaggedSessions` int NOT NULL DEFAULT 0,
	`confirmedIncidents` int NOT NULL DEFAULT 0,
	`fraudRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`commonAlertTypes` json,
	`averageConfidenceScore` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fraudAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`incidentType` enum('cheating_confirmed','unauthorized_assistance','technical_violation','false_positive','other') NOT NULL,
	`severity` enum('minor','moderate','major','critical') NOT NULL DEFAULT 'moderate',
	`description` text NOT NULL,
	`status` enum('pending','investigating','resolved','appealed','dismissed') NOT NULL DEFAULT 'pending',
	`reportedBy` int NOT NULL,
	`investigatedBy` int,
	`resolution` text,
	`recommendedAction` varchar(255),
	`evidenceUrls` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoEvidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`alertId` int,
	`incidentId` int,
	`videoUrl` text NOT NULL,
	`fileSize` int,
	`duration` int,
	`startTime` int,
	`endTime` int,
	`contentType` varchar(64) NOT NULL DEFAULT 'video/mp4',
	`storageKey` varchar(512) NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 90,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videoEvidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','proctor','student') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `studentId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhotoUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_studentId_unique` UNIQUE(`studentId`);