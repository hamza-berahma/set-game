import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "../types/auth";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
/* eslint-enable @typescript-eslint/no-namespace */

export function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Unauthorized",
                message: "No authorization token provided",
            });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Invalid authorization header format",
            });
        }
        const token = parts[1];

        const payload = verifyToken(token);

        req.user = payload;
        next();
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Invalid or expired token";
        return res.status(401).json({
            error: "Unauthorized",
            message: errorMessage,
        });
    }
}
