DROP TRIGGER IF EXISTS `delete_comments_on_stage_deleted`;
CREATE TRIGGER `delete_comments_on_stage_deleted`
BEFORE DELETE ON `stages`
FOR EACH ROW
BEGIN
    DELETE FROM `comments`
    WHERE `stage_id` = OLD.`id`
        AND `trip_id` = OLD.`trip_id`;
END;