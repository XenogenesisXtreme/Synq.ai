CREATE TABLE `recall_artifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notebookId` int NOT NULL,
	`kind` varchar(40) NOT NULL,
	`title` varchar(255) NOT NULL,
	`markdown` text NOT NULL,
	`citations` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recall_artifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `recall_artifacts` ADD CONSTRAINT `recall_artifacts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recall_artifacts` ADD CONSTRAINT `recall_artifacts_notebookId_notebooks_id_fk` FOREIGN KEY (`notebookId`) REFERENCES `notebooks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `recall_artifacts_user_created_idx` ON `recall_artifacts` (`userId`,`createdAt`);