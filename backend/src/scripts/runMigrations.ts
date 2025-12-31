import pool from "../config/database";
import { readFileSync } from "fs";
import { join } from "path";

// In production (compiled), migrations are in the same directory structure
// In development, they're in the src parent directory
const MIGRATIONS_DIR = join(__dirname, "../../migrations");

const migrations = [
    "001_initial_schema.sql",
    "002_room_settings_and_logging.sql",
    "003_user_profile.sql",
    "004_fix_event_logging.sql",
];

async function tableExists(tableName: string): Promise<boolean> {
    try {
        const result = await pool.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )`,
            [tableName]
        );
        return result.rows[0].exists;
    } catch (err) {
        console.error(`Error checking if table ${tableName} exists:`, err);
        return false;
    }
}

async function runMigration(filename: string): Promise<void> {
    const filePath = join(MIGRATIONS_DIR, filename);
    console.log(`Running migration: ${filename}`);
    
    try {
        const sql = readFileSync(filePath, "utf-8");
        await pool.query(sql);
        console.log(`✓ Migration ${filename} completed successfully`);
    } catch (err) {
        console.error(`✗ Migration ${filename} failed:`, err);
        throw err;
    }
}

export async function runMigrations(): Promise<void> {
    console.log("=== Running Database Migrations ===");
    
    try {
        // Check if users table exists (indicates migrations have run)
        const usersExists = await tableExists("users");
        
        if (usersExists) {
            console.log("✓ Database tables already exist, skipping migrations");
            return;
        }
        
        console.log("Database is empty, running migrations...");
        
        // Run migrations in order
        for (const migration of migrations) {
            await runMigration(migration);
        }
        
        console.log("=== All Migrations Completed ===");
    } catch (err) {
        console.error("=== Migration Failed ===");
        console.error("Error:", err);
        // Don't throw - let server start anyway (migrations can be run manually)
        console.warn("Server will continue, but database may not be fully set up");
        console.warn("Run migrations manually if needed");
    }
}

// Run migrations if this script is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => {
            console.log("Migrations complete");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Migrations failed:", err);
            process.exit(1);
        });
}

