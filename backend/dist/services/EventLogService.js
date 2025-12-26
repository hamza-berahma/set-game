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
            await database_1.default.query(`INSERT INTO game_event_log (match_id, room_id, user_id, event_type, event_data)
                 VALUES ($1, $2, $3, $4, $5)`, [matchId || null, roomId || null, userId || null, eventType, eventData ? JSON.stringify(eventData) : null]);
        }
        catch (error) {
            // Log but don't throw - event logging should not break the game
            console.error("Error logging event:", error);
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
