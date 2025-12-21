import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get("/health", (req: Request, res: Response) => {
    res.json({
        status: "ok",
    });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error : ", err);
    res.status(500).json({
        error: "internal server error",
        message: err.message,
    });
});

app.listen(PORT, () => {
    console.log(`listening at port ${PORT}`);
});
