BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255) DEFAULT '1',
ADD COLUMN IF NOT EXISTS time_spent_playing INTEGER DEFAULT 0;

COMMENT ON COLUMN users.profile_picture IS 'User''s selected profile picture ID (references a preset pixel art avatar)';
COMMENT ON COLUMN users.time_spent_playing IS 'Total time user has spent playing games, in seconds';

COMMIT;

