DROP TRIGGER IF EXISTS `update_updated_at_on_sessions`;
CREATE TRIGGER `update_updated_at_on_sessions`
AFTER UPDATE ON `sessions`
FOR EACH ROW
BEGIN
    UPDATE `sessions`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id` AND `uid` = OLD.`uid`;
END;
