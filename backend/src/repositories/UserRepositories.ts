import pool from "../config/database";
import { User, UpdateUserData, CreateUserData } from "../types/user";

export class UserRepository {
    async findById(id: string): Promise<User | null> {
        try {
            const result = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [id]);
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in find by ID: ", err);
            throw err;
        }
    }

    async findByUsername(username: string): Promise<User | null> {
        try {
            const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in findByUsername: ", err);
            throw err;
        }
    }

    async create(userData: CreateUserData): Promise<User> {
        try {
            const result = await pool.query(
                `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
                [userData.username, userData.email, userData.password_hash],
            );
            return result.rows[0];
        } catch (err) {
            console.error("Error in create:", err);
            throw err;
        }
    }

    async update(id: string, updates: UpdateUserData): Promise<User | null> {
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let paramCount = 1;

            if (updates.username !== undefined) {
                fields.push(`username = $${paramCount++}`);
                values.push(updates.username);
            }
            if (updates.email !== undefined) {
                fields.push(`email = $${paramCount++}`);
                values.push(updates.email);
            }
            if (updates.password_hash !== undefined) {
                fields.push(`password_hash = $${paramCount++}`);
                values.push(updates.password_hash);
            }

            if (fields.length === 0) {
                return this.findById(id);
            }
            values.push(id);
            const result = await pool.query(
                `UPDATE users SET ${fields.join(", ")} WHERE user_id = $${paramCount} RETURNING *`,
                values,
            );
            return result.rows[0] || null;
        } catch (err) {
            console.error("Error in update: ", err);
            throw err;
        }
    }
}
