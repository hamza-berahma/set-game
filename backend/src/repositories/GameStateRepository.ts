import pool from "../config/database";
import { v4 as uuidv4 } from "uuid";
import type { Card } from "../types/game";

export interface GameStateRecord {
    state_id: string;
    match_id: string;
    triggering_move_id: string | null;
    board_cards: Card[];
    sequence_number: number;
    created_at: Date;
}

export interface CreateGameStateData {
    match_id: string;
    triggering_move_id?: string | null;
    board_cards: Card[];
    sequence_number: number;
}

export class GameStateRepository {
    async saveState(data: CreateGameStateData): Promise<GameStateRecord> {
        try {
            const stateId = uuidv4();
            const result = await pool.query(
                `INSERT INTO game_states (state_id, match_id, triggering_move_id, board_cards, sequence_number)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [
                    stateId,
                    data.match_id,
                    data.triggering_move_id || null,
                    JSON.stringify(data.board_cards),
                    data.sequence_number,
                ]
            );
            return {
                ...result.rows[0],
                board_cards: JSON.parse(result.rows[0].board_cards),
            };
        } catch (err) {
            console.error("Error in saveState:", err);
            throw err;
        }
    }

    async getStatesByMatch(matchId: string): Promise<GameStateRecord[]> {
        try {
            const result = await pool.query(
                `SELECT * FROM game_states WHERE match_id = $1 ORDER BY sequence_number ASC`,
                [matchId]
            );
            return result.rows.map((row) => ({
                ...row,
                board_cards: JSON.parse(row.board_cards),
            }));
        } catch (err) {
            console.error("Error in getStatesByMatch:", err);
            return [];
        }
    }

    async getLatestState(matchId: string): Promise<GameStateRecord | null> {
        try {
            const result = await pool.query(
                `SELECT * FROM game_states WHERE match_id = $1 ORDER BY sequence_number DESC LIMIT 1`,
                [matchId]
            );
            if (result.rows.length === 0) {
                return null;
            }
            return {
                ...result.rows[0],
                board_cards: JSON.parse(result.rows[0].board_cards),
            };
        } catch (err) {
            console.error("Error in getLatestState:", err);
            return null;
        }
    }

    async findById(stateId: string): Promise<GameStateRecord | null> {
        try {
            const result = await pool.query(
                `SELECT * FROM game_states WHERE state_id = $1`,
                [stateId]
            );
            if (result.rows.length === 0) {
                return null;
            }
            return {
                ...result.rows[0],
                board_cards: JSON.parse(result.rows[0].board_cards),
            };
        } catch (err) {
            console.error("Error in findById:", err);
            return null;
        }
    }
}

