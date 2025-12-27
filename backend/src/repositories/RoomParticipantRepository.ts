import pool from "../config/database";

export interface RoomParticipant {
    room_id: string;
    user_id: string;
    role: string;
    is_active: boolean;
    joined_at: Date;
}

export interface CreateRoomParticipantData {
    room_id: string;
    user_id: string;
    role?: string;
}

export class RoomParticipantRepository {
    async addParticipant(data: CreateRoomParticipantData): Promise<RoomParticipant> {
        try {
            const result = await pool.query(
                `INSERT INTO room_participants (room_id, user_id, role, is_active)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (room_id, user_id) 
                 DO UPDATE SET is_active = $4, joined_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [data.room_id, data.user_id, data.role || "player", true]
            );
            return result.rows[0];
        } catch (err) {
            console.error("Error in addParticipant:", err);
            throw err;
        }
    }

    async removeParticipant(roomId: string, userId: string): Promise<void> {
        try {
            await pool.query(
                `UPDATE room_participants SET is_active = false WHERE room_id = $1 AND user_id = $2`,
                [roomId, userId]
            );
        } catch (err) {
            console.error("Error in removeParticipant:", err);
        }
    }

    /**
     * Get all active participants for a room
     */
    async getActiveParticipants(roomId: string): Promise<RoomParticipant[]> {
        try {
            const result = await pool.query(
                `SELECT * FROM room_participants WHERE room_id = $1 AND is_active = true ORDER BY joined_at ASC`,
                [roomId]
            );
            return result.rows;
        } catch (err) {
            console.error("Error in getActiveParticipants:", err);
            return [];
        }
    }

    async getAllParticipants(roomId: string): Promise<RoomParticipant[]> {
        try {
            const result = await pool.query(
                `SELECT * FROM room_participants WHERE room_id = $1 ORDER BY joined_at ASC`,
                [roomId]
            );
            return result.rows;
        } catch (err) {
            console.error("Error in getAllParticipants:", err);
            return [];
        }
    }

    async isParticipant(roomId: string, userId: string): Promise<boolean> {
        try {
            const result = await pool.query(
                `SELECT 1 FROM room_participants WHERE room_id = $1 AND user_id = $2 AND is_active = true LIMIT 1`,
                [roomId, userId]
            );
            return result.rows.length > 0;
        } catch (err) {
            console.error("Error in isParticipant:", err);
            return false;
        }
    }
}

