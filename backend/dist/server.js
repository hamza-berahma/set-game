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
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const httpServer = (0, http_1.createServer)(app);
(0, socket_1.initializeSocket)(httpServer);
const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173');
app.use((0, cors_1.default)({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(origin => origin.trim()),
    credentials: true,
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
(0, redis_1.initializeRedis)();
const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
// Start server
httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
    console.log(`Socket.IO server initialized`);
    console.log(`Health check available at http://0.0.0.0:${port}/health`);
});
// Handle server errors
httpServer.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
    }
    process.exit(1);
});
