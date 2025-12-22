"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserRepository {
    async findById(id) {
        try {
            const result = await database_1.default.query(`SELECT * FROM users WHERE user_id = $1`, [id]);
            return result.rows[0] || null;
        }
        catch (err) {
            console.error("Error in find by ID: ", err);
            throw err;
        }
    }
    async findByUsername(username) {
        try {
            const result = await database_1.default.query(`SELECT * FROM users WHERE username = $1`, [username]);
            return result.rows[0] || null;
        }
        catch (err) {
            console.error("Error in findByUsername: ", err);
            throw err;
        }
    }
    async create(userData) {
        try {
            const result = await database_1.default.query(`INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *`, [userData.username, userData.email, userData.password_hash]);
            return result.rows[0];
        }
        catch (err) {
            console.error("Error in create:", err);
            throw err;
        }
    }
    async update(id, updates) {
        try {
            const fields = [];
            const values = [];
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
            const result = await database_1.default.query(`UPDATE users SET ${fields.join(", ")} WHERE user_id = $${paramCount} RETURNING *`, values);
            return result.rows[0] || null;
        }
        catch (err) {
            console.error("Error in update: ", err);
            throw err;
        }
    }
}
exports.UserRepository = UserRepository;
