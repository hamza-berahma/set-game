import pool from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface MovePayload {
    cardIds?: string[];
    selectedCards?: unknown[];
    [key: string]: unknown;
}

export interface Move {
    move_id: string;
    match_id: string;
    user_id: string;
    previous_state_id: string | null;
    offset_ms: number;
    payload: MovePayload;
    server_received_at: Date;
}

export interface CreateMoveData {
    match_id: string;
    user_id: string;
    previous_state_id?: string | null;
    offset_ms: number;
    payload: MovePayload;
}

export class MoveRepository {
    async create(data: CreateMoveData): Promise<Move> {
        try {
            const moveId = uuidv4();
            const result = await pool.query(
                `INSERT INTO moves (move_id, match_id, user_id, previous_state_id, offset_ms, payload)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [
                    moveId,
                    data.match_id,
                    data.user_id,
                    data.previous_state_id || null,
                    data.offset_ms,
                    JSON.stringify(data.payload),
                ]
            );
            return {
                ...result.rows[0],
                payload: JSON.parse(result.rows[0].payload),
            };
        } catch (err) {
            console.error("Error in create:", err);
            throw err;
        }
    }

    async getMovesByMatch(matchId: string): Promise<Move[]> {
        try {
            const result = await pool.query(
                `SELECT * FROM moves WHERE match_id = $1 ORDER BY server_received_at ASC`,
                [matchId]
            );
            return result.rows.map((row) => ({
                ...row,
                payload: JSON.parse(row.payload),
            }));
        } catch (err) {
            console.error("Error in getMovesByMatch:", err);
            return [];
        }
    }

    async getMovesByUser(userId: string, matchId?: string): Promise<Move[]> {
        try {
            let query = `SELECT * FROM moves WHERE user_id = $1`;
            const params: (string | undefined)[] = [userId];
            if (matchId) {
                query += ` AND match_id = $2`;
                params.push(matchId);
            }
            query += ` ORDER BY server_received_at ASC`;
            const result = await pool.query(query, params);
            return result.rows.map((row) => ({
                ...row,
                payload: JSON.parse(row.payload),
            }));
        } catch (err) {
            console.error("Error in getMovesByUser:", err);
            return [];
        }
    }

    async findById(moveId: string): Promise<Move | null> {
        try {
            const result = await pool.query(
                `SELECT * FROM moves WHERE move_id = $1`,
                [moveId]
            );
            if (result.rows.length === 0) {
                return null;
            }
            return {
                ...result.rows[0],
                payload: JSON.parse(result.rows[0].payload),
            };
        } catch (err) {
            console.error("Error in findById:", err);
            return null;
        }
    }
}

