import { z } from "zod";

export const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Must have 3 or more char")
        .max(20, "Must have 20 or less char")
        .regex(/^[a-zA-Z0-9_]+$/, "Only numbers, letters, or underscores"),
    email: z.email({ message: "please provide a valid email" }),
    password: z.string().min(6, "Must be at least 6 char"),
});

export const loginSchema = z.object({
    username: z.string().min(1, "Username required"),
    password: z.string().min(1, "Password required"),
});

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;