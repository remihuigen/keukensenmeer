CREATE TABLE `project_images` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`pathname` text NOT NULL,
	`orientation` text DEFAULT 'landscape' NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`mime` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`is_main_image` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "min_width" CHECK("project_images"."width" >= 300),
	CONSTRAINT "max_width" CHECK("project_images"."width" <= 6000),
	CONSTRAINT "min_height" CHECK("project_images"."height" >= 300),
	CONSTRAINT "max_height" CHECK("project_images"."height" <= 6000)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`public_title` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`sorting_priority` integer DEFAULT 50 NOT NULL,
	`styles` text NOT NULL,
	`description` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "sorting_priority_range" CHECK("projects"."sorting_priority" >= 0 AND "projects"."sorting_priority" <= 100)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);