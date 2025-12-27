import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import pool from "../config/database";
import { z } from "zod";

const router = Router();

const updateProfileSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
    profile_picture: z.string().regex(/^([1-9]|1[0-2])$/).optional(),
});

router.get("/profile", authenticate, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.user_id;

        const checkColumns = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('profile_picture', 'time_spent_playing')
        `);

        const hasProfilePicture = checkColumns.rows.some(r => r.column_name === 'profile_picture');
        const hasTimeSpent = checkColumns.rows.some(r => r.column_name === 'time_spent_playing');

        let query = `SELECT user_id, username, email, created_at`;
        if (hasProfilePicture) {
            query += `, COALESCE(profile_picture, '1') as profile_picture`;
        } else {
            query += `, '1' as profile_picture`;
        }
        if (hasTimeSpent) {
            query += `, COALESCE(time_spent_playing, 0) as time_spent_playing`;
        } else {
            query += `, 0 as time_spent_playing`;
        }
        query += ` FROM users WHERE user_id = $1`;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.rows[0];
        res.json({ user });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        res.status(500).json({ message: `Error fetching profile: ${message}` });
    }
});

router.put("/profile", authenticate, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.user_id;
        const validatedData = updateProfileSchema.parse(req.body);

        const existingUser = await pool.query(
            `SELECT username FROM users WHERE username = $1 AND user_id != $2`,
            [validatedData.username, userId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: "Username already taken" });
        }

        const updateFields: string[] = [];
        const updateValues: unknown[] = [];
        let paramIndex = 1;

        if (validatedData.username) {
            updateFields.push(`username = $${paramIndex++}`);
            updateValues.push(validatedData.username);
        }

        if (validatedData.profile_picture) {
            updateFields.push(`profile_picture = $${paramIndex++}`);
            updateValues.push(validatedData.profile_picture);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        updateValues.push(userId);

        const checkColumns = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('profile_picture', 'time_spent_playing')
        `);

        const hasProfilePicture = checkColumns.rows.some(r => r.column_name === 'profile_picture');
        const hasTimeSpent = checkColumns.rows.some(r => r.column_name === 'time_spent_playing');

        let returnFields = 'user_id, username, email, created_at';
        if (hasProfilePicture) {
            returnFields += ', profile_picture';
        } else {
            returnFields += ", '1' as profile_picture";
        }
        if (hasTimeSpent) {
            returnFields += ', time_spent_playing';
        } else {
            returnFields += ', 0 as time_spent_playing';
        }

        const result = await pool.query(
            `UPDATE users SET ${updateFields.join(", ")} WHERE user_id = $${paramIndex}
             RETURNING ${returnFields}`,
            updateValues
        );

        res.json({ user: result.rows[0] });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Validation error", errors: error.issues });
        }

        const message = error instanceof Error ? error.message : "Internal server error";
        res.status(500).json({ message: `Error updating profile: ${message}` });
    }
});

export default router;

