"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
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
app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`);
});
