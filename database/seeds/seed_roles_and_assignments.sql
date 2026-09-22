-- This is deliberately a DML seed, not a Flyway migration.
INSERT INTO `Role` (id, name, description, is_disabled)
VALUES
    (1, 'Superuser', 'Full administrative access', FALSE),
    (2, 'Editor', 'Can create and update content', FALSE),
    (3, 'ReadOnly', 'Can view content', FALSE)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    is_disabled = VALUES(is_disabled);

-- Every generated user receives ReadOnly.
INSERT IGNORE INTO `AppUserRole` (appuser_id, role_id)
SELECT id, 3
FROM `AppUser`
WHERE is_deleted = FALSE;

-- Even IDs receive Editor, which creates repeatable role combinations for any user range.
INSERT IGNORE INTO `AppUserRole` (appuser_id, role_id)
SELECT id, 2
FROM `AppUser`
WHERE is_deleted = FALSE AND MOD(id, 2) = 0;

-- The first user and every tenth ID receive Superuser.
INSERT IGNORE INTO `AppUserRole` (appuser_id, role_id)
SELECT id, 1
FROM `AppUser`
WHERE is_deleted = FALSE AND (id = (SELECT MIN(active_user.id) FROM `AppUser` AS active_user WHERE active_user.is_deleted = FALSE) OR MOD(id, 10) = 0);
