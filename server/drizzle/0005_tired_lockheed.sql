CREATE TABLE `assessment_checkpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`checkpoint` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`score` integer,
	`notes` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assessment_checkpoint_unique` ON `assessment_checkpoints` (`assessment_id`,`checkpoint`);--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`ai_tool` text NOT NULL,
	`department` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`tags` text NOT NULL,
	`estimated_metrics` text NOT NULL,
	`estimated_costs` text NOT NULL,
	`submitted_by` text NOT NULL,
	`submitter_team` text NOT NULL,
	`submitted_by_id` text NOT NULL,
	`promoted_to_use_case_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`submitted_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`promoted_to_use_case_id`) REFERENCES `use_cases`(`id`) ON UPDATE no action ON DELETE no action
);
