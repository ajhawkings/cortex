CREATE TABLE `gmail_sync_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`history_id` text,
	`last_sync_at` integer
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`lane` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`title` text NOT NULL,
	`snippet` text,
	`is_read` integer DEFAULT false NOT NULL,
	`gmail_message_id` text,
	`gmail_thread_id` text,
	`from_email` text,
	`from_name` text,
	`received_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`cleared_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_items_user_status` ON `items` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_items_user_lane` ON `items` (`user_id`,`lane`);--> statement-breakpoint
CREATE INDEX `idx_items_gmail_id` ON `items` (`gmail_message_id`);--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`options` text,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `property_values` (
	`item_id` text NOT NULL,
	`property_id` text NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE INDEX `idx_pv_item` ON `property_values` (`item_id`);