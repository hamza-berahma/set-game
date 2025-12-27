import pool from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface Match {
    match_id: string;
    room_id: string;
    deck_seed: any | null;
    status: string;
    started_at: Date | null;
    finished_at: Date | null;
    timer_duration_seconds: number | null;
}

export interface CreateMatchData {
    room_id: string;
    deck_seed?: any;
    timer_duration_seconds?: number | null;
}

export class MatchRepository {
    async create(data: CreateMatchData): Promise<Match> {
        try {
            const matchId = uuidv4();
            const result = await pool.query(
                `INSERT INTO matches (match_id, room_id, deck_seed, status, started_at, timer_duration_seconds)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [
                    matchId,
                    data.room_id,
                    JSON.stringify(data.deck_seed || null),
                    "in_progress",
                    new Date(),
                    data.timer_duration_seconds || null,
                ]
            );
            return result.rows[0];
        } catch (err) {
            console.error("Error in create:", err);
            throw err;
        }
    }

    async findById(matchId: string): Promise<Match | null> {
        try {
            const result = await pool.query(
                `SELECT * FROM matches WHERE match_id = $1`,
                [matchId]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in findById:", err);
            return null;
        }
    }

    async findByRoomId(roomId: string): Promise<Match | null> {
        try {
            const result = await pool.query(
                `SELECT * FROM matches WHERE room_id = $1 ORDER BY started_at DESC LIMIT 1`,
                [roomId]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in findByRoomId:", err);
            return null;
        }
    }

    async updateStatus(matchId: string, status: string, finishedAt?: Date): Promise<Match | null> {
        try {
            const result = await pool.query(
                `UPDATE matches SET status = $1, finished_at = $2 WHERE match_id = $3 RETURNING *`,
                [status, finishedAt || null, matchId]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in updateStatus:", err);
            return null;
        }
    }
}

