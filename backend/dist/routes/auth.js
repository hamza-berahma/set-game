"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserRepository_1 = require("../repositories/UserRepository");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../schemas/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const userRepository = new UserRepository_1.UserRepository();
router.post("/register", (0, validation_1.validate)(auth_1.registerSchema), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({
                error: "User already exists",
                message: "username already taken",
            });
        }
        const password_hash = await (0, password_1.hashPassword)(password);
        const user = await userRepository.create({
            username,
            email,
            password_hash,
        });
        const token = (0, jwt_1.generateToken)({
            user_id: user.user_id,
            username: user.username,
        });
        const response = {
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
            },
        };
        res.status(201).json(response);
    }
    catch (err) {
        console.error("Registration error:", err);
        if (err && typeof err === "object" && "code" in err && err.code === "23505") {
            return res.status(409).json({
                error: "User already exists",
                message: "Email is already registered",
            });
        }
        const errorMessage = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({
            error: "Registration failed",
            message: errorMessage,
        });
    }
});
router.post("/login", (0, validation_1.validate)(auth_1.loginSchema), async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userRepository.findByUsername(username);
        if (!user) {
            return res.status(401).json({
                error: "Invalid Credentials",
                message: "Username or password is incorrect",
            });
        }
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: "Invalid credentials",
                message: "Username or password is incorrect",
            });
        }
        const token = (0, jwt_1.generateToken)({
            user_id: user.user_id,
            username: user.username,
        });
        const response = {
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
            },
        };
        res.json(response);
    }
    catch (err) {
        console.error("Login error : ", err);
        const errorMessage = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({
            error: "Login failed",
            message: errorMessage,
        });
    }
});
exports.default = router;
