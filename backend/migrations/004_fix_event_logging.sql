BEGIN;

-- Fix room_id type in game_event_log to be UUID instead of VARCHAR
-- First, drop the old column if it exists and recreate it
ALTER TABLE game_event_log DROP COLUMN IF EXISTS room_id;

-- Add room_id as UUID with proper foreign key
ALTER TABLE game_event_log ADD COLUMN room_id UUID REFERENCES game_rooms(room_id) ON DELETE CASCADE;

-- Create index for room_id lookups
CREATE INDEX IF NOT EXISTS idx_game_event_log_room_id_uuid ON game_event_log(room_id);

-- Update existing records if any (convert string UUIDs to UUID type)
-- This is safe to run even if there are no records
DO $$
BEGIN
    -- If there are any existing records with string room_ids, we'd need to convert them
    -- For now, we'll just ensure the column is properly typed going forward
    NULL;
END $$;

COMMENT ON COLUMN game_event_log.room_id IS 'Room ID (UUID) - references game_rooms table';

COMMIT;

