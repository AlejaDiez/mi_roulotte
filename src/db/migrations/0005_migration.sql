DROP TABLE `roles`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'reader' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`two_factor_authentication` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "email", "password", "role", "is_active", "email_verified", "two_factor_authentication", "created_at", "updated_at") SELECT "id", "username", "email", "password", "role", "is_active", "email_verified", "two_factor_authentication", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
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
