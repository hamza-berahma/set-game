import pool from "../config/database";

export interface MatchResult {
    match_id: string;
    user_id: string;
    score: number;
    rank: number;
    duration_played_ms: number;
}

export interface CreateMatchResultData {
    match_id: string;
    user_id: string;
    score: number;
    rank: number;
    duration_played_ms: number;
}

export class MatchResultRepository {
    async upsert(data: CreateMatchResultData): Promise<MatchResult> {
        try {
            const result = await pool.query(
                `INSERT INTO match_results (match_id, user_id, score, rank, duration_played_ms)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (match_id, user_id) 
                 DO UPDATE SET score = $3, rank = $4, duration_played_ms = $5
                 RETURNING *`,
                [
                    data.match_id,
                    data.user_id,
                    data.score,
                    data.rank,
                    data.duration_played_ms,
                ]
            );
            return result.rows[0];
        } catch (err) {
            console.error("Error in upsert:", err);
            throw err;
        }
    }

    async getResultsByMatch(matchId: string): Promise<MatchResult[]> {
        try {
            const result = await pool.query(
                `SELECT * FROM match_results WHERE match_id = $1 ORDER BY rank ASC, score DESC`,
                [matchId]
            );
            return result.rows;
        } catch (err) {
            console.error("Error in getResultsByMatch:", err);
            return [];
        }
    }

    async getResultsByUser(userId: string): Promise<MatchResult[]> {
        try {
            const result = await pool.query(
                `SELECT * FROM match_results WHERE user_id = $1 ORDER BY score DESC`,
                [userId]
            );
            return result.rows;
        } catch (err) {
            console.error("Error in getResultsByUser:", err);
            return [];
        }
    }
}

