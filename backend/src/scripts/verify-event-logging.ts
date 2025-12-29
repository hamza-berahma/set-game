/**
 * Script to verify event logging is working correctly
 * Run with: npx ts-node src/scripts/verify-event-logging.ts
 */

import pool from "../config/database";
import { EventLogService } from "../services/EventLogService";

async function verifyEventLogging() {
    console.log("Verifying event logging setup...\n");

    // Check if table exists
    try {
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'game_event_log'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.error("❌ game_event_log table does not exist!");
            console.log("Run the migration: psql -U setgame -d setgame -f backend/migrations/002_room_settings_and_logging.sql\n");
            process.exit(1);
        }
        console.log("✅ game_event_log table exists");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("❌ Error checking table:", error.message);
        process.exit(1);
    }

    // Test logging an event
    const eventLogService = new EventLogService();
    const testRoomId = `test-room-${Date.now()}`;
    const testUserId = "00000000-0000-0000-0000-000000000000"; // Dummy UUID for testing
    
    try {
        console.log("\nTesting event logging...");
        await eventLogService.logEvent("room_created", {
            roomId: testRoomId,
            userId: testUserId,
            eventData: { test: true, timestamp: new Date().toISOString() },
        });
        console.log("✅ Event logged successfully");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("❌ Error logging test event:", error.message);
        process.exit(1);
    }

    // Verify event was stored
    try {
        console.log("\nVerifying event was stored...");
        const result = await pool.query(
            `SELECT * FROM game_event_log WHERE room_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [testRoomId]
        );
        
        if (result.rows.length === 0) {
            console.error("❌ Event was not found in database!");
            process.exit(1);
        }
        
        const event = result.rows[0];
        console.log("✅ Event found in database:");
        console.log(`   Event ID: ${event.event_id}`);
        console.log(`   Event Type: ${event.event_type}`);
        console.log(`   Room ID: ${event.room_id}`);
        console.log(`   Created At: ${event.created_at}`);
        console.log(`   Event Data: ${JSON.stringify(event.event_data)}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("❌ Error verifying event:", error.message);
        process.exit(1);
    }

    // Clean up test event
    try {
        await pool.query(`DELETE FROM game_event_log WHERE room_id = $1`, [testRoomId]);
        console.log("\n✅ Test event cleaned up");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.warn("⚠️  Warning: Could not clean up test event:", error.message);
    }

    console.log("\n✅ Event logging is working correctly!");
}

verifyEventLogging()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });

