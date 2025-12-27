# Database Event Logging

This document explains how database event logging works in the SET game backend.

## Overview

All game events are automatically logged to the `game_event_log` table for:
- Analytics and debugging
- Game replay capabilities
- User activity tracking
- Performance monitoring

## Setup

### 1. Run Migration

First, create the event logging table:

```bash
psql -U setgame -d setgame -f backend/migrations/002_room_settings_and_logging.sql
```

### 2. Verify Setup

Test that event logging is working:

```bash
cd backend
npx ts-node src/scripts/verify-event-logging.ts
```

You should see:
```
✅ game_event_log table exists
✅ Event logged successfully
✅ Event found in database
✅ Event logging is working correctly!
```

## Logged Events

The following events are automatically logged:

| Event Type | When It's Logged | Data Stored |
|------------|------------------|-------------|
| `game_started` | When a new game is created | roomId, matchId |
| `player_joined` | When a player joins a room | roomId, userId, matchId |
| `player_left` | When a player leaves a room | roomId, userId, matchId |
| `set_found` | When a player finds a valid SET | roomId, userId, matchId, cardIds, score |
| `move_made` | When a player makes a move | roomId, userId, matchId, cardIds, timestamp |
| `game_ended` | When a game finishes | roomId, matchId, final scores |

## Viewing Logged Events

### View All Recent Events

```sql
SELECT * FROM game_event_log 
ORDER BY created_at DESC 
LIMIT 50;
```

### View Events by Type

```sql
SELECT event_type, COUNT(*) as count 
FROM game_event_log 
GROUP BY event_type 
ORDER BY count DESC;
```

### View Recent Player Activity

```sql
SELECT 
    e.event_type,
    e.room_id,
    u.username,
    e.created_at
FROM game_event_log e
LEFT JOIN users u ON e.user_id = u.user_id
WHERE e.event_type IN ('player_joined', 'player_left', 'set_found')
ORDER BY e.created_at DESC
LIMIT 100;
```

### View Game Statistics

```sql
-- Games started today
SELECT COUNT(*) as games_started
FROM game_event_log
WHERE event_type = 'game_started'
  AND DATE(created_at) = CURRENT_DATE;

-- Average SETs found per game
SELECT 
    room_id,
    COUNT(*) as sets_found
FROM game_event_log
WHERE event_type = 'set_found'
GROUP BY room_id
ORDER BY sets_found DESC;
```

## Error Handling

- **Missing Table**: If the table doesn't exist, events are silently ignored (no errors)
- **Database Errors**: Non-critical errors are logged but don't break the game
- **Invalid UUIDs**: If user_id is not a valid UUID, it's stored as NULL (event still logged)

## Event Data Structure

Each event log entry contains:

```typescript
{
  event_id: UUID,           // Unique event identifier
  match_id: UUID | null,    // Match/game identifier
  room_id: VARCHAR(255),    // Room identifier (can be UUID or custom format)
  user_id: UUID | null,     // User identifier (must be valid UUID)
  event_type: VARCHAR(50),  // Type of event (see EventType)
  event_data: JSONB | null, // Additional event-specific data
  created_at: TIMESTAMP     // When the event occurred
}
```

## Integration

Event logging is integrated into:

- **Socket Handlers** (`backend/src/socket/socket.ts`):
  - `join-room` → logs `player_joined` and `game_started`
  - `leave-room` → logs `player_left`
  - `game:select:cards` → logs `set_found` and `move_made`
  - Game end → logs `game_ended`

All logging happens asynchronously and does not block game operations.

