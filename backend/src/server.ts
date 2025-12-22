import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import pool from "./config/database";
import authRoutes from "./routes/auth";
import { authenticate } from "./middleware/auth";
import { initializeSocket } from "./socket/socket";

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

app.use(cors());
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use("/api/auth", authRoutes);

app.get("/api/profile", authenticate, (req: Request, res: Response) => {
    res.json({
        message: "This is a protected route",
        user: req.user,
    });
});

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

httpServer.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
    console.log(`Socket.IO server initialized`);
});