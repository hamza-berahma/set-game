import pool from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface GameRoom {
    room_id: string;
    room_code: string;
    current_match_id: string | null;
    created_at: Date;
    lobby_settings: any | null;
}

export interface CreateGameRoomData {
    room_code: string;
    lobby_settings?: any;
}

export class GameRoomRepository {
    private generateRoomCode(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async findByRoomId(roomId: string): Promise<GameRoom | null> {
        try {
            const uuidResult = await pool.query(
                `SELECT * FROM game_rooms WHERE room_id = $1`,
                [roomId]
            );
            if (uuidResult.rows.length > 0) {
                return uuidResult.rows[0];
            }

            const codeResult = await pool.query(
                `SELECT * FROM game_rooms WHERE room_code = $1`,
                [roomId]
            );
            return codeResult.rows[0] || null;
        } catch (err) {
            console.error("Error in findByRoomId:", err);
            return null;
        }
    }

    async findByRoomCode(roomCode: string): Promise<GameRoom | null> {
        try {
            const result = await pool.query(
                `SELECT * FROM game_rooms WHERE room_code = $1`,
                [roomCode]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in findByRoomCode:", err);
            return null;
        }
    }

    async create(roomId: string, data?: Partial<CreateGameRoomData>): Promise<GameRoom> {
        try {
            let roomCode = data?.room_code;
            if (!roomCode) {
                let attempts = 0;
                do {
                    roomCode = this.generateRoomCode();
                    const existing = await this.findByRoomCode(roomCode);
                    if (!existing) break;
                    attempts++;
                    if (attempts > 10) {
                        roomCode = Date.now().toString(36).substring(0, 6).toUpperCase();
                        break;
                    }
                } while (true);
            }

            const result = await pool.query(
                `INSERT INTO game_rooms (room_id, room_code, lobby_settings) 
                 VALUES ($1, $2, $3) RETURNING *`,
                [roomId, roomCode, JSON.stringify(data?.lobby_settings || null)]
            );
            return result.rows[0];
        } catch (err) {
            console.error("Error in create:", err);
            throw err;
        }
    }

    async updateCurrentMatch(roomId: string, matchId: string | null): Promise<GameRoom | null> {
        try {
            const result = await pool.query(
                `UPDATE game_rooms SET current_match_id = $1 WHERE room_id = $2 RETURNING *`,
                [matchId, roomId]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in updateCurrentMatch:", err);
            return null;
        }
    }

    async updateLobbySettings(roomId: string, settings: any): Promise<GameRoom | null> {
        try {
            const result = await pool.query(
                `UPDATE game_rooms SET lobby_settings = $1 WHERE room_id = $2 RETURNING *`,
                [JSON.stringify(settings), roomId]
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in updateLobbySettings:", err);
            return null;
        }
    }

    async findPublicRooms(): Promise<Array<GameRoom & { player_count: number; room_name?: string }>> {
        try {
            const result = await pool.query(
                `SELECT 
                    gr.room_id,
                    gr.room_code,
                    gr.current_match_id,
                    gr.created_at,
                    gr.lobby_settings,
                    COUNT(rp.user_id) FILTER (WHERE rp.is_active = true) as player_count
                FROM game_rooms gr
                LEFT JOIN room_participants rp ON gr.room_id = rp.room_id
                WHERE (gr.lobby_settings IS NULL 
                    OR gr.lobby_settings::text = 'null'
                    OR (gr.lobby_settings->>'isPrivate')::boolean IS NOT TRUE
                    OR (gr.lobby_settings->>'isPrivate')::boolean = false)
                GROUP BY gr.room_id
                HAVING COUNT(rp.user_id) FILTER (WHERE rp.is_active = true) < 
                    COALESCE((gr.lobby_settings->>'maxPlayers')::integer, 8)
                ORDER BY gr.created_at DESC
                LIMIT 20`,
                []
            );
            return result.rows.map(row => {
                const settings = typeof row.lobby_settings === 'string' 
                    ? (row.lobby_settings === 'null' ? null : JSON.parse(row.lobby_settings))
                    : row.lobby_settings;
                return {
                    ...row,
                    lobby_settings: settings || {},
                    room_name: settings?.roomName || null,
                };
            });
        } catch (err) {
            console.error("Error in findPublicRooms:", err);
            return [];
        }
    }
}

