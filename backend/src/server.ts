import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import pool from "./config/database";
import { initializeRedis } from "./config/redis";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import { authenticate } from "./middleware/auth";
import { initializeSocket } from "./socket/socket";

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173');
app.use(cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(origin => origin.trim()),
    credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);

app.get("/health", (req: Request, res: Response) => {
    res.json({
        status: "ok",
    });
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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error : ", err);
    res.status(500).json({
        error: "internal server error",
        message: err.message,
    });
});

initializeRedis();

httpServer.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
    console.log(`Socket.IO server initialized`);
});