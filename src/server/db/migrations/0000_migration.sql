CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image` text,
	`video` text,
	`content` text DEFAULT '[]' NOT NULL,
	`keywords` text,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`modified_at` integer
);
