DROP TRIGGER IF EXISTS `update_updated_at_on_stages`;
CREATE TRIGGER `update_updated_at_on_stages`
AFTER UPDATE ON `stages`
FOR EACH ROW
BEGIN
    UPDATE `stages`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id` AND `trip_id` = OLD.`trip_id`;
END;
