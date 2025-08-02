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
--> triggers
CREATE TRIGGER IF NOT EXISTS `update_modified_at_on_trips`
AFTER UPDATE ON `trips`
FOR EACH ROW
BEGIN
    UPDATE `trips`
    SET `modified_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
