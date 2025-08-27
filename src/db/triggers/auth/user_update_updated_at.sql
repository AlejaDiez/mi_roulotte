DROP TRIGGER IF EXISTS `update_updated_at_on_users`;
CREATE TRIGGER `update_updated_at_on_users`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    UPDATE `users`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
