import pool from "../config/database";

export type EventType =
    | "room_created"
    | "player_joined"
    | "player_left"
    | "game_started"
    | "game_ended"
    | "set_found"
    | "timer_started"
    | "timer_ended"
    | "move_made"
    | "card_selected"
    | "error";

export interface EventData {
    [key: string]: any;
}

/**
 * Service for logging game events to the database
 */
export class EventLogService {
    /**
     * Log an event to the database
     */
    async logEvent(
        eventType: EventType,
        data: {
            matchId?: string;
            roomId?: string;
            userId?: string;
            eventData?: EventData;
        }
    ): Promise<void> {
        try {
            const { matchId, roomId, userId, eventData } = data;

            // Convert eventData to JSON string if provided
            const eventDataJson = eventData ? JSON.stringify(eventData) : null;
            
            // Handle UUID validation for user_id (must be valid UUID for foreign key constraint)
            let userIdValue: string | null = null;
            if (userId) {
                // Check if it's a valid UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(userId)) {
                    userIdValue = userId;
                } else {
                    // If not a UUID, store as null to avoid foreign key constraint violation
                    // This can happen if we're using string IDs instead of UUIDs
                    // The event will still be logged, just without user_id reference
                }
            }

            await pool.query(
                `INSERT INTO game_event_log (match_id, room_id, user_id, event_type, event_data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [matchId || null, roomId || null, userIdValue, eventType, eventDataJson]
            );
        } catch (error: any) {
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
    async logRoomCreated(roomId: string, userId: string, settings: any): Promise<void> {
        await this.logEvent("room_created", {
            roomId,
            userId,
            eventData: { settings },
        });
    }

    /**
     * Log player joining
     */
    async logPlayerJoined(roomId: string, userId: string, matchId?: string): Promise<void> {
        await this.logEvent("player_joined", {
            roomId,
            userId,
            matchId,
        });
    }

    /**
     * Log player leaving
     */
    async logPlayerLeft(roomId: string, userId: string, matchId?: string): Promise<void> {
        await this.logEvent("player_left", {
            roomId,
            userId,
            matchId,
        });
    }

    /**
     * Log game start
     */
    async logGameStarted(roomId: string, matchId: string): Promise<void> {
        await this.logEvent("game_started", {
            roomId,
            matchId,
        });
    }

    /**
     * Log game end
     */
    async logGameEnded(roomId: string, matchId: string, scores?: Record<string, number>): Promise<void> {
        await this.logEvent("game_ended", {
            roomId,
            matchId,
            eventData: { scores },
        });
    }

    /**
     * Log SET found
     */
    async logSetFound(
        roomId: string,
        matchId: string,
        userId: string,
        cardIds: string[],
        score: number
    ): Promise<void> {
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
    async logTimerEvent(
        roomId: string,
        matchId: string,
        eventType: "timer_started" | "timer_ended",
        duration?: number
    ): Promise<void> {
        await this.logEvent(eventType, {
            roomId,
            matchId,
            eventData: { duration },
        });
    }

    /**
     * Log move/card selection
     */
    async logMove(
        roomId: string,
        matchId: string,
        userId: string,
        cardIds: string[],
        offsetMs: number
    ): Promise<void> {
        await this.logEvent("move_made", {
            roomId,
            matchId,
            userId,
            eventData: { cardIds, offsetMs },
        });
    }
}

