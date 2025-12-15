# Database Schema

## 1\. Core Identity & Lobby

### `Users`

  * **Purpose:** Central identity management.
  * **Key Fields:** `user_id` (PK), `username`, `password_hash`, `email`.

### `GameRooms`

  * **Purpose:** Long-lived lobbies where users gather. Persists between matches.
  * **Key Fields:**
      * `room_code`: 6-char entry code.
      * `current_match_id`: **Nullable**. Points to the currently active `Matches` row. Set to NULL when game ends.
      * `lobby_settings`: JSONB for config (max players, public/private).

### `RoomParticipants`

  * **Purpose:** Junction table linking Users to Rooms.
  * **Key Constraint:** **Composite Primary Key** `(room_id, user_id)`. Prevents double-joining.
  * **Key Fields:**
      * `role`: Enum (`host`, `player`, `spectator`).
      * `is_active`: Boolean for connection status (online/offline).

## 2\. Match Engine

### `Matches`

  * **Purpose:** A single game instance. A Room can host infinite Matches over time.
  * **Key Fields:**
      * `deck_seed`: JSONB. The RNG seed used to generate the deck. Critical for replay verification.
      * `status`: Enum (`in_progress`, `finished`, `aborted`).

### `MatchResults`

  * **Purpose:** Final stats for a completed match.
  * **Key Constraint:** **Composite Primary Key** `(match_id, user_id)`.
  * **Key Fields:** `score`, `rank`, `duration_played_ms`.

## 3\. Event Sourcing & Replay

### `Moves`

  * **Purpose:** Immutable log of every player action. Used for replays and cheat detection.
  * **Key Fields:**
      * `offset_ms`: Time in milliseconds from match start (for frame-perfect replay).
      * `previous_state_id`: **Nullable**. Links to the `GameStates` row that existed *before* this move. NULL for the first move if applicable.
      * `payload`: JSONB. Context (e.g., `{"cards": [1, 5, 9]}`).

### `GameStates`

  * **Purpose:** Snapshots of the board (12 cards) after every valid move.
  * **Key Fields:**
      * `triggering_move_id`: **Nullable**. The move that caused this state. NULL for the "Genesis" state (State 0).
      * `sequence_number`: Integer (0, 1, 2...) ordering the states within a match.


## ER Diagram

```mermaid
---
config:
  theme: neutral
  layout: elk
---
erDiagram
    %% RELATIONSHIPS
    Users ||--o{ RoomParticipants : "joins"
    GameRooms ||--o{ RoomParticipants : "contains"
    
    GameRooms ||--o{ Matches : "history"
    GameRooms |o--|| Matches : "current_active_match"

    Matches ||--o{ MatchResults : "yields"
    Users ||--o{ MatchResults : "earns"
    
    Matches ||--o{ GameStates : "snapshots"
    Matches ||--o{ Moves : "logs"
    
    %% Audit Chain
    GameStates |o--|| Moves : "triggered_by (nullable)"
    Moves |o--|| GameStates : "after_state (nullable)"

    %% TABLES
    Users {
        uuid user_id PK
        string username
        string email
    }

    GameRooms {
        uuid room_id PK
        string room_code UK
        uuid current_match_id FK "Nullable"
    }

    RoomParticipants {
        uuid room_id PK,FK
        uuid user_id PK,FK
        enum role "host, player, spectator"
        boolean is_active
    }

    Matches {
        uuid match_id PK
        uuid room_id FK
        jsonb deck_seed
        enum status
    }

    MatchResults {
        uuid match_id PK,FK
        uuid user_id PK,FK
        integer score
        integer rank
    }

    Moves {
        uuid move_id PK
        uuid match_id FK
        uuid previous_state_id FK "Nullable"
        integer offset_ms
        jsonb payload
    }

    GameStates {
        uuid state_id PK
        uuid match_id FK
        uuid triggering_move_id FK "Nullable"
        jsonb board_cards
        integer sequence_number
    }
```