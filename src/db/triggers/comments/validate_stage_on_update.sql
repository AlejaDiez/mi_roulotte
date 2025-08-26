DROP TRIGGER IF EXISTS `validate_comment_stage_on_update`;
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
