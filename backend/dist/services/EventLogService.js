"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLogService = void 0;
const database_1 = __importDefault(require("../config/database"));
/**
 * Service for logging game events to the database
 */
class EventLogService {
    /**
     * Log an event to the database
     */
    async logEvent(eventType, data) {
        try {
            const { matchId, roomId, userId, eventData } = data;
            // Convert eventData to JSON string if provided
            const eventDataJson = eventData ? JSON.stringify(eventData) : null;
            // Handle UUID validation for user_id (must be valid UUID for foreign key constraint)
            let userIdValue = null;
            if (userId) {
                // Check if it's a valid UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(userId)) {
                    userIdValue = userId;
                }
                else {
                    // If not a UUID, store as null to avoid foreign key constraint violation
                    // This can happen if we're using string IDs instead of UUIDs
                    // The event will still be logged, just without user_id reference
                }
            }
            await database_1.default.query(`INSERT INTO game_event_log (match_id, room_id, user_id, event_type, event_data)
                 VALUES ($1, $2, $3, $4, $5)`, [matchId || null, roomId || null, userIdValue, eventType, eventDataJson]);
        }
        catch (error) {
            // Silently handle missing table or other database errors - event logging is optional
            // Only log if it's not a "table doesn't exist" error (migration not run yet)
            if (error?.code !== '42P01') {
                // Log unexpected errors, but don't spam
                console.error("Error logging event:", error?.message || error);
            }
            // Don't throw - event logging should not break the game
        }
    }
    /**
     * Log room creation
     */
    async logRoomCreated(roomId, userId, settings) {
        await this.logEvent("room_created", {
            roomId,
            userId,
            eventData: { settings },
        });
    }
    /**
     * Log player joining
     */
    async logPlayerJoined(roomId, userId, matchId) {
        await this.logEvent("player_joined", {
            roomId,
            userId,
            matchId,
        });
    }
    /**
     * Log player leaving
     */
    async logPlayerLeft(roomId, userId, matchId) {
        await this.logEvent("player_left", {
            roomId,
            userId,
            matchId,
        });
    }
    /**
     * Log game start
     */
    async logGameStarted(roomId, matchId) {
        await this.logEvent("game_started", {
            roomId,
            matchId,
        });
    }
    /**
     * Log game end
     */
    async logGameEnded(roomId, matchId, scores) {
        await this.logEvent("game_ended", {
            roomId,
            matchId,
            eventData: { scores },
        });
    }
    /**
     * Log SET found
     */
    async logSetFound(roomId, matchId, userId, cardIds, score) {
        await this.logEvent("set_found", {
            roomId,
            matchId,
            userId,
            eventData: { cardIds, score },
        });
    }
    /**
     * Log timer event
     */
    async logTimerEvent(roomId, matchId, eventType, duration) {
        await this.logEvent(eventType, {
            roomId,
            matchId,
            eventData: { duration },
        });
    }
    /**
     * Log move/card selection
     */
    async logMove(roomId, matchId, userId, cardIds, offsetMs) {
        await this.logEvent("move_made", {
            roomId,
            matchId,
            userId,
            eventData: { cardIds, offsetMs },
        });
    }
}
exports.EventLogService = EventLogService;
