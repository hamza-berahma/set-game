"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLogService = void 0;
const database_1 = __importDefault(require("../config/database"));
class EventLogService {
    async logEvent(eventType, data) {
        try {
            const { matchId, roomId, userId, eventData } = data;
            const eventDataJson = eventData ? JSON.stringify(eventData) : null;
            let userIdValue = null;
            if (userId) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(userId)) {
                    userIdValue = userId;
                }
            }
            // Convert roomId to UUID if it's a valid UUID string, otherwise null
            let roomIdValue = null;
            if (roomId) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(roomId)) {
                    roomIdValue = roomId;
                }
            }
            await database_1.default.query(`INSERT INTO game_event_log (match_id, room_id, user_id, event_type, event_data)
                 VALUES ($1, $2, $3, $4, $5)`, [matchId || null, roomIdValue, userIdValue, eventType, eventDataJson]);
        }
        catch (error) {
            if (error && typeof error === "object" && "code" in error && error.code !== '42P01') {
                const errorMessage = "message" in error && typeof error.message === "string" ? error.message : String(error);
                console.error("Error logging event:", errorMessage);
            }
        }
    }
    async logRoomCreated(roomId, userId, settings) {
        await this.logEvent("room_created", {
            roomId,
            userId,
            eventData: { settings },
        });
    }
    async logPlayerJoined(roomId, userId, matchId) {
        await this.logEvent("player_joined", {
            roomId,
            userId,
            matchId,
        });
    }
    async logPlayerLeft(roomId, userId, matchId) {
        await this.logEvent("player_left", {
            roomId,
            userId,
            matchId,
        });
    }
    async logGameStarted(roomId, matchId) {
        await this.logEvent("game_started", {
            roomId,
            matchId,
        });
    }
    async logGameEnded(roomId, matchId, scores) {
        await this.logEvent("game_ended", {
            roomId,
            matchId,
            eventData: { scores },
        });
    }
    async logSetFound(roomId, matchId, userId, cardIds, score) {
        await this.logEvent("set_found", {
            roomId,
            matchId,
            userId,
            eventData: { cardIds, score },
        });
    }
    async logTimerEvent(roomId, matchId, eventType, duration) {
        await this.logEvent(eventType, {
            roomId,
            matchId,
            eventData: { duration },
        });
    }
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
