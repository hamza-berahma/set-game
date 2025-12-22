import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "you-kinda-not-so-super-secret";

const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN ||
    "24h") as jwt.SignOptions["expiresIn"];

export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

export function verifyToken(token: string): JwtPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (err) {
        throw new Error("Invalid/Expired token");
    }
}
