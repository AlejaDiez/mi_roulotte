DROP TRIGGER IF EXISTS `validate_stage_allow_comments`;
CREATE TRIGGER `validate_stage_allow_comments`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NOT NULL
    AND NOT EXISTS (
        SELECT 1
        FROM `stages`
        WHERE `trip_id` = NEW.`trip_id`
            AND `id` = NEW.`stage_id`
            AND `allow_comments` = 1
    )
BEGIN
    SELECT RAISE(ABORT, 'Stage does not allow comments');
END;