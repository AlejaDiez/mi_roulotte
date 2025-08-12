DROP TRIGGER IF EXISTS `validate_comment_stage`;
CREATE TRIGGER `validate_comment_stage`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
BEGIN
    SELECT
        CASE
            WHEN NOT EXISTS (
                SELECT 1 FROM `stages`
                WHERE `id` = NEW.`stage_id` AND `trip_id` = NEW.`trip_id`
            )
        THEN RAISE(ABORT, 'FOREIGN KEY constraint failed')
    END;
END;
