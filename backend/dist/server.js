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
const auth_2 = require("./middleware/auth");
const socket_1 = require("./socket/socket");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const httpServer = (0, http_1.createServer)(app);
const io = (0, socket_1.initializeSocket)(httpServer);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
app.use("/api/auth", auth_1.default);
app.get("/api/profile", auth_2.authenticate, (req, res) => {
    res.json({
        message: "This is a protected route",
        user: req.user,
    });
});
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
    });
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
app.use((err, req, res, next) => {
    console.error("Error : ", err);
    res.status(500).json({
        error: "internal server error",
        message: err.message,
    });
});
// Initialize Redis
(0, redis_1.initializeRedis)();
httpServer.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
    console.log(`Socket.IO server initialized`);
});
