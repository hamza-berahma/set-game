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
    [key: string]: unknown;
}

export class EventLogService {
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

            const eventDataJson = eventData ? JSON.stringify(eventData) : null;
            
            let userIdValue: string | null = null;
            if (userId) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(userId)) {
                    userIdValue = userId;
                }
            }

            await pool.query(
                `INSERT INTO game_event_log (match_id, room_id, user_id, event_type, event_data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [matchId || null, roomId || null, userIdValue, eventType, eventDataJson]
            );
        } catch (error: unknown) {
            if (error && typeof error === "object" && "code" in error && error.code !== '42P01') {
                const errorMessage = "message" in error && typeof error.message === "string" ? error.message : String(error);
                console.error("Error logging event:", errorMessage);
            }
        }
    }

    async logRoomCreated(roomId: string, userId: string, settings: unknown): Promise<void> {
        await this.logEvent("room_created", {
            roomId,
            userId,
            eventData: { settings },
        });
    }

    async logPlayerJoined(roomId: string, userId: string, matchId?: string): Promise<void> {
        await this.logEvent("player_joined", {
            roomId,
            userId,
            matchId,
        });
    }

    async logPlayerLeft(roomId: string, userId: string, matchId?: string): Promise<void> {
        await this.logEvent("player_left", {
            roomId,
            userId,
            matchId,
        });
    }

    async logGameStarted(roomId: string, matchId: string): Promise<void> {
        await this.logEvent("game_started", {
            roomId,
            matchId,
        });
    }

    async logGameEnded(roomId: string, matchId: string, scores?: Record<string, number>): Promise<void> {
        await this.logEvent("game_ended", {
            roomId,
            matchId,
            eventData: { scores },
        });
    }

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

