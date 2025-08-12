DROP TRIGGER IF EXISTS `validate_trip_allow_comments`;
CREATE TRIGGER `validate_trip_allow_comments`
BEFORE INSERT ON `comments`
FOR EACH ROW
WHEN NEW.`stage_id` IS NULL
BEGIN
    SELECT
        CASE
            WHEN NOT EXISTS (
                SELECT 1
                FROM `trips`
                WHERE `id` = NEW.`trip_id`
                  AND `allow_comments` = 1
            )
        THEN RAISE(ABORT, 'Trip does not allow comments')
    END;
END;
