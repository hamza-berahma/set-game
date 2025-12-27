BEGIN;

-- Ensure game_rooms table has all necessary columns for room settings
-- (lobby_settings JSONB already exists, but we'll add a comment for clarity)
COMMENT ON COLUMN game_rooms.lobby_settings IS 'JSONB storing room settings: {maxPlayers, timerDuration, isPrivate, roomName}';

-- Ensure matches table tracks timer settings
ALTER TABLE matches ADD COLUMN IF NOT EXISTS timer_duration_seconds INTEGER DEFAULT NULL;
COMMENT ON COLUMN matches.timer_duration_seconds IS 'Timer duration in seconds for this match (NULL = no timer)';

-- Add game_event_log table for comprehensive event logging
CREATE TABLE IF NOT EXISTS game_event_log (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(match_id) ON DELETE CASCADE,
    room_id VARCHAR(255), -- Store room ID as string (can be UUID or custom format)
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_game_event_log_match_id ON game_event_log(match_id);
CREATE INDEX IF NOT EXISTS idx_game_event_log_room_id ON game_event_log(room_id);
CREATE INDEX IF NOT EXISTS idx_game_event_log_user_id ON game_event_log(user_id);
CREATE INDEX IF NOT EXISTS idx_game_event_log_event_type ON game_event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_game_event_log_created_at ON game_event_log(created_at);

COMMENT ON TABLE game_event_log IS 'Comprehensive log of all game events: room creation, player join/leave, game start/end, timer events, moves, etc.';

COMMIT;

