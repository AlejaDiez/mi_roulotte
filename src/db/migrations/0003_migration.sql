ALTER TABLE `stages` RENAME COLUMN "modified_at" TO "updated_at";--> statement-breakpoint
ALTER TABLE `trips` RENAME COLUMN "modified_at" TO "updated_at";--> statement-breakpoint
--> triggers
DROP TRIGGER IF EXISTS `update_modified_at_on_stages`;
DROP TRIGGER IF EXISTS `update_updated_at_on_stages`;
CREATE TRIGGER `update_updated_at_on_stages`
AFTER UPDATE ON `stages`
FOR EACH ROW
BEGIN
    UPDATE `stages`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id` AND `trip_id` = OLD.`trip_id`;
END;
DROP TRIGGER IF EXISTS `update_modified_at_on_trips`;
DROP TRIGGER IF EXISTS `update_updated_at_on_trips`;
CREATE TRIGGER `update_updated_at_on_trips`
AFTER UPDATE ON `trips`
FOR EACH ROW
BEGIN
    UPDATE `trips`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
--> statement-breakpoint
CREATE TABLE `otps` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`info` text
);
REPLACE INTO `roles` (`id`, `info`)
    VALUES (
        'admin',
        'Usuario con todos los permisos del sistema'
    ),
    (
        'editor',
        'Usuario con permisos para crear y editar contenido, pero sin acceso a configuraciones avanzadas'
    ),
    (
        'viewer',
        'Usuario con permisos solo para ver contenido, sin capacidad de edición'
    );
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`refresh_token` text NOT NULL,
	`revoked` integer DEFAULT false NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
    `two_factor_authentication` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`role`) REFERENCES `roles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> triggers
DROP TRIGGER IF EXISTS `update_updated_at_on_users`;
CREATE TRIGGER `update_updated_at_on_users`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    UPDATE `users`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
--> statement-breakpoint
DROP TRIGGER IF EXISTS `validate_comment_stage`;
DROP TRIGGER IF EXISTS `validate_comment_stage_on_update`;
DROP TRIGGER IF EXISTS `validate_trip_allow_comments`;
DROP TRIGGER IF EXISTS `validate_stage_allow_comments`;
DROP TRIGGER IF EXISTS `delete_comments_on_stage_deleted`;
DROP TRIGGER IF EXISTS `update_modified_at_on_comments`;
DROP TRIGGER IF EXISTS `update_updated_at_on_comments`;
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`trip_id` text NOT NULL,
	`stage_id` text,
	`username` text NOT NULL,
	`email` text,
	`content` text NOT NULL,
	`replied_to` text,
	`user_agent` text,
	`ip_address` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`replied_to`) REFERENCES `comments`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "trip_id", "stage_id", "username", "email", "content", "replied_to", "user_agent", "ip_address", "created_at", "updated_at") SELECT "id", "trip_id", "stage_id", "username", "email", "content", "replied_to", "user_agent", "ip_address", "created_at", "updated_at" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
--> triggers
CREATE TRIGGER `validate_comment_stage`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `stages`
        WHERE `id` = NEW.`stage_id` AND `trip_id` = NEW.`trip_id`
    )
BEGIN
    SELECT RAISE(ABORT, 'FOREIGN KEY constraint failed');
END;
CREATE TRIGGER `validate_comment_stage_on_update`
BEFORE UPDATE ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `stages`
        WHERE `id` = NEW.`stage_id` AND `trip_id` = NEW.`trip_id`
    )
BEGIN
    SELECT RAISE(ABORT, 'FOREIGN KEY constraint failed');
END;
CREATE TRIGGER `validate_trip_allow_comments`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `trips`
        WHERE `id` = NEW.`trip_id`
            AND `allow_comments` = 1
    )
BEGIN
    SELECT RAISE(ABORT, 'Trip does not allow comments');
END;
CREATE TRIGGER `validate_stage_allow_comments`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `stages`
        WHERE `trip_id` = NEW.`trip_id`
            AND `id` = NEW.`stage_id`
            AND `allow_comments` = 1
    )
BEGIN
    SELECT RAISE(ABORT, 'Stage does not allow comments');
END;
CREATE TRIGGER `delete_comments_on_stage_deleted`
BEFORE DELETE ON `stages`
FOR EACH ROW
BEGIN
    DELETE FROM `comments`
    WHERE `stage_id` = OLD.`id`
        AND `trip_id` = OLD.`trip_id`;
END;
CREATE TRIGGER `update_updated_at_on_comments`
AFTER UPDATE ON `comments`
FOR EACH ROW
BEGIN
    UPDATE `comments`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
