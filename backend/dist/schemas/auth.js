"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, "Must have 3 or more char")
        .max(20, "Must have 20 or less char")
        .regex(/^[a-zA-Z0-9_]+$/, "Only numbers, letters, or underscores"),
    email: zod_1.z.email({ message: "please provide a valid email" }),
    password: zod_1.z.string().min(6, "Must be at least 6 char"),
});
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, "Username required"),
    password: zod_1.z.string().min(1, "Password required"),
});
