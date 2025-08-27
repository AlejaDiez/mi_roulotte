CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`two_factor_authentication` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`role`) REFERENCES `roles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "email", "password", "role", "is_active", "email_verified", "two_factor_authentication", "created_at", "updated_at") SELECT "id", "username", "email", "password", "role", "is_active", "email_verified", "two_factor_authentication", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
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
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_otps` (
	`uid` text PRIMARY KEY NOT NULL,
	`code` text(6) DEFAULT (printf('%06d', ABS(RANDOM()) % 1000000)) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`uid`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_otps`("uid", "code", "created_at", "expires_at") SELECT "uid", "code", "created_at", "expires_at" FROM `otps`;--> statement-breakpoint
DROP TABLE `otps`;--> statement-breakpoint
ALTER TABLE `__new_otps` RENAME TO `otps`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`uid` text NOT NULL,
    `refresh` text(6) NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`uid`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "uid", "refresh", "user_agent", "ip_address", "created_at", "updated_at", "expires_at") SELECT "id", "uid", '000000' AS "refresh", "user_agent", "ip_address", "created_at", "updated_at", "expires_at" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;
--> triggers
DROP TRIGGER IF EXISTS `update_updated_at_on_sessions`;
CREATE TRIGGER `update_updated_at_on_sessions`
AFTER UPDATE ON `sessions`
FOR EACH ROW
BEGIN
    UPDATE `sessions`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id` AND `uid` = OLD.`uid`;
END;
