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

// Handle CORS before creating server (for proper middleware order)
const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173');

// Normalize CORS origins: trim whitespace and remove trailing slashes
const corsOrigins: string[] | '*' = corsOrigin === '*' 
    ? '*' 
    : corsOrigin.split(',').map(origin => origin.trim().replace(/\/+$/, ''));

const httpServer = createServer(app);
initializeSocket(httpServer);

// CORS configuration - must be before routes
if (corsOrigin === '*') {
    console.log('CORS Configuration: Allowing all origins (*)');
    // When using credentials: true, we must return the actual origin, not '*'
    app.use(cors({
        origin: (origin, callback) => {
            // For requests with origin, return it (allows all origins with credentials)
            // For requests without origin, allow them (like same-origin or curl)
            if (origin) {
                callback(null, origin);
            } else {
                callback(null, true);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        maxAge: 86400,
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
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        maxAge: 86400,
    }));
}

// Request logging middleware (for debugging)
app.use((req: Request, res: Response, next: express.NextFunction) => {
    if (req.method === 'OPTIONS' || req.path.startsWith('/api')) {
        console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
    }
    next();
});

// Explicit OPTIONS handler for CORS preflight (before JSON parser)
// Express 5 doesn't support '*' as route path, so handle OPTIONS in middleware
app.use((req: Request, res: Response, next: express.NextFunction) => {
    if (req.method === 'OPTIONS') {
        const origin = req.headers.origin;
        console.log(`OPTIONS preflight - Origin: ${origin}`);
        if (origin) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            res.header('Access-Control-Max-Age', '86400');
        }
        return res.sendStatus(204);
    }
    next();
});

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

// Error handler - must be last (4 parameters required for Express error handler)
app.use((err: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
    const error = err instanceof Error ? err : new Error(String(err));
    
    // CORS errors should be handled by cors middleware, but just in case
    if (error.message && error.message.includes('CORS')) {
        console.error("CORS error:", error.message);
        return res.status(403).json({
            error: "CORS error",
            message: error.message,
        });
    }
    
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    // Don't send error details in production
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message;
    
    res.status(500).json({
        error: "internal server error",
        message: message,
    });
});

// Initialize Redis (non-blocking)
initializeRedis();

const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

// Add process error handlers (must be before server starts)
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    console.error('Stack:', err.stack);
    // Don't exit - let Railway handle restarts
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    // Don't exit - let Railway handle restarts
});

// Keep process alive
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Start server
try {
    httpServer.listen(port, "0.0.0.0", () => {
        console.log(`✓ Server listening on 0.0.0.0:${port}`);
        console.log(`✓ Socket.IO server initialized`);
        console.log(`✓ Health check available at http://0.0.0.0:${port}/health`);
        console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✓ Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
        console.log(`✓ Server ready to accept connections`);
    });
} catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
}

// Handle server errors
httpServer.on('error', (err: NodeJS.ErrnoException) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
    }
    // Don't exit immediately - let Railway handle restarts
    console.error('Server will attempt to restart...');
});