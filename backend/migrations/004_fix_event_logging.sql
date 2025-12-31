BEGIN;

-- Fix room_id type in game_event_log - keep as VARCHAR to support any room ID format
-- Room IDs can be UUIDs or custom strings, so we use VARCHAR for flexibility
-- Drop and recreate the column to ensure proper type
ALTER TABLE game_event_log DROP COLUMN IF EXISTS room_id;

-- Add room_id as VARCHAR (supports both UUIDs and custom string IDs)
ALTER TABLE game_event_log ADD COLUMN room_id VARCHAR(255);

-- Create index for room_id lookups
CREATE INDEX IF NOT EXISTS idx_game_event_log_room_id ON game_event_log(room_id);

COMMENT ON COLUMN game_event_log.room_id IS 'Room ID (VARCHAR) - can be UUID or custom string format';

COMMIT;

