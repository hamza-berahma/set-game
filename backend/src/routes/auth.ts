import { Router, Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../schemas/auth";
import { AuthResponse } from "../types/auth";
import { validate } from "../middleware/validation";

const router = Router();
const userRepository = new UserRepository();

router.post("/register", validate(registerSchema), async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({
                error: "User already exists",
                message: "username already taken",
            });
        }

        const password_hash = await hashPassword(password);

        const user = await userRepository.create({
            username,
            email,
            password_hash,
        });

        const token = generateToken({
            user_id: user.user_id,
            username: user.username,
        });

        const response: AuthResponse = {
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
            },
        };

        res.status(201).json(response);
    } catch (err: unknown) {
        console.error("Registration error:", err);

        if (err && typeof err === "object" && "code" in err && err.code === "23505") {
            return res.status(409).json({
                error: "User already exists",
                message: "Email is already registered",
            });
        }

        res.status(500).json({
            error: "Registration failed",
            message: err.message || "Internal server error",
        });
    }
});

router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const user = await userRepository.findByUsername(username);
        if (!user) {
            return res.status(401).json({
                error: "Invalid Credentials",
                message: "Username or password is incorrect",
            });
        }

        const isPasswordValid = await comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: "Invalid credentials",
                message: "Username or password is incorrect",
            });
        }

        const token = generateToken({
            user_id: user.user_id,
            username: user.username,
        });

        const response: AuthResponse = {
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
            },
        };
        res.json(response);
    } catch (err: unknown) {
        console.error("Login error : ", err);
        const errorMessage = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({
            error: "Login failed",
            message: errorMessage,
        });
    }
});

export default router;
