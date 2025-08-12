CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` text NOT NULL,
	`stage_id` text,
	`username` text NOT NULL,
	`email` text,
	`content` text NOT NULL,
	`replied_to` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`modified_at` integer,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`replied_to`) REFERENCES `comments`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `trips` ADD `allow_comments` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `stages` ADD `allow_comments` integer DEFAULT false NOT NULL;
--> triggers
DROP TRIGGER IF EXISTS `validate_comment_stage`;
CREATE TRIGGER `validate_comment_stage`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
BEGIN
    SELECT
        CASE
            WHEN NOT EXISTS (
                SELECT 1 FROM `stages`
                WHERE `id` = NEW.`stage_id` AND `trip_id` = NEW.`trip_id`
            )
        THEN RAISE(ABORT, 'FOREIGN KEY constraint failed')
    END;
END;
DROP TRIGGER IF EXISTS `validate_comment_stage_on_update`;
CREATE TRIGGER `validate_comment_stage_on_update`
BEFORE UPDATE ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
BEGIN
    SELECT
        CASE
            WHEN NOT EXISTS (
                SELECT 1 FROM `stages`
                WHERE `id` = NEW.`stage_id` AND `trip_id` = NEW.`trip_id`
            )
        THEN RAISE(ABORT, 'FOREIGN KEY constraint failed')
    END;
END;
DROP TRIGGER IF EXISTS `validate_trip_allow_comments`;
CREATE TRIGGER `validate_trip_allow_comments`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NULL
BEGIN
    SELECT
        CASE
            WHEN NOT EXISTS (
                SELECT 1
                FROM `trips`
                WHERE `id` = NEW.`trip_id`
                  AND `allow_comments` = 1
            )
        THEN RAISE(ABORT, 'Trip does not allow comments')
    END;
END;
DROP TRIGGER IF EXISTS `validate_stage_allow_comments`;
CREATE TRIGGER `validate_stage_allow_comments`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
BEGIN
    SELECT
        CASE
            WHEN NOT EXISTS (
                SELECT 1
                FROM `stages`
                WHERE `trip_id` = NEW.`trip_id` AND `id` = NEW.`stage_id`
                  AND `allow_comments` = 1
            )
        THEN RAISE(ABORT, 'Stage does not allow comments')
    END;
END;
DROP TRIGGER IF EXISTS `delete_comments_on_stage_deleted`;
CREATE TRIGGER `delete_comments_on_stage_deleted`
BEFORE DELETE ON `stages`
FOR EACH ROW
BEGIN
    DELETE FROM `comments`
    WHERE `stage_id` = OLD.`id`
      AND `trip_id` = OLD.`trip_id`;
END;
DROP TRIGGER IF EXISTS `update_modified_at_on_comments`;
CREATE TRIGGER `update_modified_at_on_comments`
AFTER UPDATE ON `comments`
FOR EACH ROW
BEGIN
    UPDATE `comments`
    SET `modified_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
