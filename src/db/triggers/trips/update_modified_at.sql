DROP TRIGGER IF EXISTS `update_modified_at_on_trips`;
CREATE TRIGGER `update_modified_at_on_trips`
AFTER UPDATE ON `trips`
FOR EACH ROW
BEGIN
    UPDATE `trips`
    SET `modified_at` = unixepoch()
    WHERE `id` = OLD.`id`;
END;
