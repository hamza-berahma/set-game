BEGIN;

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GameRooms table
CREATE TABLE game_rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    current_match_id UUID NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lobby_settings JSONB
);

-- RoomParticipants table
CREATE TABLE room_participants (
    room_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES game_rooms(room_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Matches table
CREATE TABLE matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES game_rooms(room_id),
    deck_seed JSONB,
    status VARCHAR(20) DEFAULT 'in_progress',
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

-- MatchResults table
CREATE TABLE match_results (
    match_id UUID NOT NULL REFERENCES matches(match_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    score INTEGER,
    rank INTEGER,
    duration_played_ms INTEGER,
    PRIMARY KEY (match_id, user_id)
);

-- GameStates table (for event sourcing/replay - currently not actively used)
-- Reserved for future replay functionality
CREATE TABLE game_states (
    state_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(match_id),
    triggering_move_id UUID NULL,
    board_cards JSONB,
    sequence_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Moves table (for event sourcing/replay - currently not actively used)
-- Reserved for future replay functionality and move history
CREATE TABLE moves (
    move_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(match_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    previous_state_id UUID NULL REFERENCES game_states(state_id),
    offset_ms INTEGER,
    payload JSONB,
    server_received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- GameRooms
CREATE UNIQUE INDEX idx_game_rooms_room_code ON game_rooms(room_code);
CREATE INDEX idx_game_rooms_current_match ON game_rooms(current_match_id);

-- RoomParticipants
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);

-- Matches
CREATE INDEX idx_matches_room_id ON matches(room_id);

-- MatchResults
CREATE INDEX idx_match_results_user_id ON match_results(user_id);
CREATE INDEX idx_match_results_match_id ON match_results(match_id);

-- Moves
CREATE INDEX idx_moves_match_id ON moves(match_id);
CREATE INDEX idx_moves_user_id ON moves(user_id);
CREATE INDEX idx_moves_previous_state_id ON moves(previous_state_id);

-- GameStates
CREATE INDEX idx_game_states_match_id ON game_states(match_id);
CREATE INDEX idx_game_states_triggering_move_id ON game_states(triggering_move_id);

COMMIT;