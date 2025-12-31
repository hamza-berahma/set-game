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

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
initializeSocket(httpServer);

const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173');
app.use(cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(origin => origin.trim()),
    credentials: true,
}));
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

app.use((err: Error, _req: Request, res: Response) => {
    console.error("Error : ", err);
    res.status(500).json({
        error: "internal server error",
        message: err.message,
    });
});

initializeRedis();

const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

// Start server
httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
    console.log(`Socket.IO server initialized`);
    console.log(`Health check available at http://0.0.0.0:${port}/health`);
});

// Handle server errors
httpServer.on('error', (err: NodeJS.ErrnoException) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
    }
    process.exit(1);
});