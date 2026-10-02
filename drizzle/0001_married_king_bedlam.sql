CREATE TABLE `assessment_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assessmentId` int NOT NULL,
	`answer` text NOT NULL,
	`outcome` enum('submitted','evaluated','invalidated') NOT NULL DEFAULT 'submitted',
	`score` int,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessment_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notebookId` int NOT NULL,
	`notebookVersion` int NOT NULL,
	`kind` enum('knowledge_check','exam_review') NOT NULL,
	`prompt` text NOT NULL,
	`answerGuide` text,
	`position` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lecture_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`sourceType` enum('pasted_text','text_file') NOT NULL,
	`fileName` varchar(255),
	`mimeType` varchar(120),
	`content` text NOT NULL,
	`durationSeconds` int,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorCode` varchar(80),
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lecture_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mastery_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notebookId` int NOT NULL,
	`conceptKey` varchar(160) NOT NULL,
	`conceptLabel` varchar(255) NOT NULL,
	`level` int NOT NULL DEFAULT 0,
	`confidence` int NOT NULL DEFAULT 0,
	`dueAt` timestamp,
	`lastReviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mastery_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notebooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceId` int NOT NULL,
	`processingRunId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`schemaVersion` varchar(32) NOT NULL,
	`status` enum('draft','ready','archived') NOT NULL DEFAULT 'draft',
	`note` json NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notebooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processing_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceId` int NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`promptVersion` varchar(64) NOT NULL,
	`modelId` varchar(128),
	`schemaVersion` varchar(32) NOT NULL,
	`inputTokens` int,
	`outputTokens` int,
	`durationMs` int,
	`errorCode` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processing_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`masteryItemId` int NOT NULL,
	`status` enum('recommended','started','completed','skipped') NOT NULL DEFAULT 'recommended',
	`scheduledFor` timestamp NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `assessment_attempts` ADD CONSTRAINT `assessment_attempts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessment_attempts` ADD CONSTRAINT `assessment_attempts_assessmentId_assessments_id_fk` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_notebookId_notebooks_id_fk` FOREIGN KEY (`notebookId`) REFERENCES `notebooks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lecture_sources` ADD CONSTRAINT `lecture_sources_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mastery_items` ADD CONSTRAINT `mastery_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mastery_items` ADD CONSTRAINT `mastery_items_notebookId_notebooks_id_fk` FOREIGN KEY (`notebookId`) REFERENCES `notebooks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notebooks` ADD CONSTRAINT `notebooks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notebooks` ADD CONSTRAINT `notebooks_sourceId_lecture_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `lecture_sources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notebooks` ADD CONSTRAINT `notebooks_processingRunId_processing_runs_id_fk` FOREIGN KEY (`processingRunId`) REFERENCES `processing_runs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `processing_runs` ADD CONSTRAINT `processing_runs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `processing_runs` ADD CONSTRAINT `processing_runs_sourceId_lecture_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `lecture_sources`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revisions` ADD CONSTRAINT `revisions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revisions` ADD CONSTRAINT `revisions_masteryItemId_mastery_items_id_fk` FOREIGN KEY (`masteryItemId`) REFERENCES `mastery_items`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `assessment_attempts_user_assessment_idx` ON `assessment_attempts` (`userId`,`assessmentId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `assessments_notebook_idx` ON `assessments` (`notebookId`,`position`);--> statement-breakpoint
CREATE INDEX `lecture_sources_user_status_idx` ON `lecture_sources` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `mastery_items_user_due_idx` ON `mastery_items` (`userId`,`dueAt`);--> statement-breakpoint
CREATE INDEX `notebooks_user_updated_idx` ON `notebooks` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `processing_runs_source_idx` ON `processing_runs` (`sourceId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `revisions_user_schedule_idx` ON `revisions` (`userId`,`scheduledFor`);