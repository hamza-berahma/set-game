import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import pool from "./config/database";
import { initializeRedis } from "./config/redis";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import roomsRoutes from "./routes/rooms";
import { initializeSocket } from "./socket/socket";

// Startup validation
console.log("=== Server Startup ===");
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'NOT SET - Database connection will fail!'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'NOT SET - Authentication will fail!'}`);
console.log(`PORT: ${process.env.PORT || '5000 (default)'}`);
console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'not set (using defaults)'}`);

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
    console.warn("⚠️  WARNING: DATABASE_URL not set in production!");
    console.warn("   Please add PostgreSQL service and link DATABASE_URL in Railway");
}

if (!process.env.JWT_SECRET) {
    console.warn("⚠️  WARNING: JWT_SECRET not set!");
    console.warn("   Authentication will not work. Generate one with: openssl rand -base64 32");
}

if (!process.env.NODE_ENV) {
    console.warn("⚠️  WARNING: NODE_ENV not set!");
    console.warn("   Set NODE_ENV=production in Railway for optimal configuration");
}

if (!process.env.CORS_ORIGIN && process.env.NODE_ENV === 'production') {
    console.warn("⚠️  WARNING: CORS_ORIGIN not set in production!");
    console.warn("   CORS errors will occur. Set CORS_ORIGIN to your frontend URL in Railway");
    console.warn("   Example: CORS_ORIGIN=https://your-frontend.railway.app");
    console.warn("   Note: Trailing slashes are automatically removed");
}

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
initializeSocket(httpServer);

const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173');

// Normalize CORS origins: trim whitespace and remove trailing slashes
const corsOrigins: string[] | '*' = corsOrigin === '*' 
    ? '*' 
    : corsOrigin.split(',').map(origin => origin.trim().replace(/\/+$/, ''));

if (corsOrigin === '*') {
    console.log('CORS Configuration: Allowing all origins (*)');
    app.use(cors({
        origin: (origin, callback) => {
            // When credentials: true, we must return the actual origin string, not '*' or true
            if (!origin) {
                // Requests with no origin (like Postman, curl) - allow but no credentials
                return callback(null, true);
            }
            // Return the actual origin to allow it with credentials
            callback(null, origin);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    }));
} else {
    const allowedList = (corsOrigins as string[]).join(', ');
    console.log(`CORS Configuration: Allowing ${allowedList}`);
    
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin
            if (!origin) {
                return callback(null, true);
            }
            
            // Normalize incoming origin
            const normalizedOrigin = origin.trim().replace(/\/+$/, '');
            const allowedOrigins = corsOrigins as string[];
            
            // Check if normalized origin matches any allowed origin
            const matched = allowedOrigins.some(allowed => {
                const normalizedAllowed = allowed.trim().replace(/\/+$/, '');
                return normalizedAllowed === normalizedOrigin;
            });
            
            if (matched) {
                // Return the matched origin (use original from allowed list for consistency)
                const matchedOrigin = allowedOrigins.find(allowed => {
                    const normalizedAllowed = allowed.trim().replace(/\/+$/, '');
                    return normalizedAllowed === normalizedOrigin;
                });
                return callback(null, matchedOrigin || normalizedOrigin);
            }
            
            // Debug logging
            console.warn(`CORS blocked origin: "${origin}"`);
            console.warn(`Allowed origins: ${allowedList}`);
            callback(new Error(`CORS: Origin not allowed`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
}
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);
app.use("/api/rooms", roomsRoutes);

// Simple health check - just confirms server is running
// Railway may check either /health or /healthcheck
const healthCheck = (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
};

app.get("/health", healthCheck);
app.get("/healthcheck", healthCheck);

// Readiness check - confirms database connectivity
app.get("/health/ready", async (_req: Request, res: Response) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({
            status: "ready",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Readiness check failed:", err);
        res.status(503).json({
            status: "not ready",
            database: "disconnected",
            message: "Database connection failed",
        });
    }
});

app.get("/users", async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * from users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database had and error");
    }
});

// Error handler - must be last
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
    // CORS errors should be handled by cors middleware, but just in case
    if (err.message && err.message.includes('CORS')) {
        console.error("CORS error:", err.message);
        return res.status(403).json({
            error: "CORS error",
            message: err.message,
        });
    }
    
    console.error("Error:", err);
    res.status(500).json({
        error: "internal server error",
        message: err.message,
    });
});

// Initialize Redis (non-blocking)
initializeRedis();

const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

// Add process error handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Don't exit - log and continue
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit - log and continue
});

// Start server
httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
    console.log(`Socket.IO server initialized`);
    console.log(`Health check available at http://0.0.0.0:${port}/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
});

// Handle server errors
httpServer.on('error', (err: NodeJS.ErrnoException) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
    }
    // Don't exit immediately - let Railway handle restarts
    console.error('Server will attempt to restart...');
});