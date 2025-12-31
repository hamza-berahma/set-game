"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const database_1 = __importDefault(require("./config/database"));
const redis_1 = require("./config/redis");
const auth_1 = __importDefault(require("./routes/auth"));
const profile_1 = __importDefault(require("./routes/profile"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const socket_1 = require("./socket/socket");
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
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const httpServer = (0, http_1.createServer)(app);
(0, socket_1.initializeSocket)(httpServer);
const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173');
// Normalize CORS origins: trim whitespace and remove trailing slashes
const corsOrigins = corsOrigin === '*'
    ? '*'
    : corsOrigin.split(',').map(origin => origin.trim().replace(/\/+$/, ''));
const corsOriginsList = corsOrigin === '*' ? 'all origins (*)' : corsOrigins.join(', ');
console.log(`CORS Configuration: Allowing ${corsOriginsList}`);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        if (corsOrigin === '*') {
            return callback(null, true);
        }
        // Normalize incoming origin (remove trailing slashes, trim)
        const normalizedOrigin = origin.trim().replace(/\/+$/, '');
        const allowedOrigins = corsOrigins;
        // Check if normalized origin matches any allowed origin
        const matchedOrigin = allowedOrigins.find(allowed => {
            const normalizedAllowed = allowed.trim().replace(/\/+$/, '');
            return normalizedAllowed === normalizedOrigin;
        });
        if (matchedOrigin) {
            // Return the matched origin (use the original allowed origin, not normalized)
            return callback(null, true);
        }
        // Debug logging
        console.warn(`❌ CORS blocked origin: "${origin}"`);
        console.warn(`   Normalized to: "${normalizedOrigin}"`);
        console.warn(`   Allowed origins: ${allowedOrigins.map(o => `"${o}"`).join(', ')}`);
        console.warn(`   Normalized allowed: ${allowedOrigins.map(o => `"${o.trim().replace(/\/+$/, '')}"`).join(', ')}`);
        callback(new Error(`CORS: Origin "${origin}" not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api", profile_1.default);
app.use("/api/rooms", rooms_1.default);
// Simple health check - just confirms server is running
// Railway may check either /health or /healthcheck
const healthCheck = (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
};
app.get("/health", healthCheck);
app.get("/healthcheck", healthCheck);
// Readiness check - confirms database connectivity
app.get("/health/ready", async (_req, res) => {
    try {
        await database_1.default.query("SELECT 1");
        res.status(200).json({
            status: "ready",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        console.error("Readiness check failed:", err);
        res.status(503).json({
            status: "not ready",
            database: "disconnected",
            message: "Database connection failed",
        });
    }
});
app.get("/users", async (req, res) => {
    try {
        const result = await database_1.default.query("SELECT * from users");
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Database had and error");
    }
});
app.use((err, _req, res) => {
    console.error("Error : ", err);
    res.status(500).json({
        error: "internal server error",
        message: err.message,
    });
});
// Initialize Redis (non-blocking)
(0, redis_1.initializeRedis)();
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
httpServer.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
    }
    // Don't exit immediately - let Railway handle restarts
    console.error('Server will attempt to restart...');
});
