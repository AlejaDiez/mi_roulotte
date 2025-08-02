CREATE TRIGGER IF NOT EXISTS `update_modified_at_on_stages`
AFTER UPDATE ON `stages`
FOR EACH ROW
BEGIN
    UPDATE `stages`
    SET `modified_at` = unixepoch()
    WHERE `id` = OLD.`id` AND `trip_id` = OLD.`trip_id`;
END;
