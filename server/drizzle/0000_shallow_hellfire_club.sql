CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`description` text NOT NULL,
	`problem_being_solved` text NOT NULL,
	`effectiveness_rating` integer NOT NULL,
	`tips` text NOT NULL,
	`category` text NOT NULL,
	`ai_tool` text NOT NULL,
	`use_case_id` text,
	`tags` text NOT NULL,
	`submitted_by` text NOT NULL,
	`submitted_by_id` text NOT NULL,
	`approval_status` text NOT NULL,
	`reviewed_by` text,
	`review_notes` text,
	`reviewed_at` text,
	`rating` real DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`use_case_id`) REFERENCES `use_cases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submitted_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_tokens_token_unique` ON `refresh_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `use_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`what_was_built` text NOT NULL,
	`key_learnings` text NOT NULL,
	`metrics` text NOT NULL,
	`category` text NOT NULL,
	`ai_tool` text NOT NULL,
	`department` text NOT NULL,
	`impact` text NOT NULL,
	`effort` text NOT NULL,
	`status` text NOT NULL,
	`tags` text NOT NULL,
	`submitted_by` text NOT NULL,
	`submitter_team` text NOT NULL,
	`submitted_by_id` text NOT NULL,
	`approval_status` text NOT NULL,
	`reviewed_by` text,
	`review_notes` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`submitted_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`password` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);