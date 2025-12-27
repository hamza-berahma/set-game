# Running Database Migrations

The `game_event_log` table needs to be created for event logging to work. Follow these steps:

## Quick Start

```bash
# From project root
psql -U setgame -d setgame -f backend/migrations/002_room_settings_and_logging.sql
```

## Run the Migration

```bash
# Connect to your PostgreSQL database
psql -U setgame -d setgame

# Or if using Docker
sudo docker exec -it setgame-db psql -U setgame -d setgame
```

Then run the migration:

```sql
\i backend/migrations/002_room_settings_and_logging.sql
```

Or run it directly from the command line:

```bash
psql -U setgame -d setgame -f backend/migrations/002_room_settings_and_logging.sql
```

## Verify Migration

After running the migration, verify the table was created:

```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'game_event_log';
```

You should see `game_event_log` in the results.

## Verify Event Logging Works

After running the migration, you can verify event logging is working:

```bash
cd backend
npx ts-node src/scripts/verify-event-logging.ts
```

This script will:
- Check if the table exists
- Test logging an event
- Verify the event was stored
- Clean up the test event

## View Logged Events

To view logged events:

```sql
-- View all events
SELECT * FROM game_event_log ORDER BY created_at DESC LIMIT 50;

-- View events by type
SELECT event_type, COUNT(*) as count 
FROM game_event_log 
GROUP BY event_type 
ORDER BY count DESC;

-- View recent player joins
SELECT * FROM game_event_log 
WHERE event_type = 'player_joined' 
ORDER BY created_at DESC 
LIMIT 20;
```

## Note

**Event logging is optional** - the application will work fine without the `game_event_log` table. Event logging errors are silently ignored, and the game continues to function normally.

