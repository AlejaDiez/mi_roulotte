CREATE TABLE `stages` (
	`id` text NOT NULL,
	`trip_id` text NOT NULL,
	`name` text NOT NULL,
	`date` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image` text,
	`content` text DEFAULT '[]' NOT NULL,
	`keywords` text,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`modified_at` integer,
	PRIMARY KEY(`id`, `trip_id`),
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE cascade ON DELETE cascade
);
