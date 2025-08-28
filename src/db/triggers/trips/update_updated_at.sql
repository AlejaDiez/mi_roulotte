DROP TRIGGER IF EXISTS `update_updated_at_on_trips`;
CREATE TRIGGER `update_updated_at_on_trips`
AFTER UPDATE ON `trips`
FOR EACH ROW
BEGIN
    UPDATE `trips`
    SET `updated_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
