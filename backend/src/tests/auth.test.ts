import jwt from "jsonwebtoken";
import { generateToken, verifyToken } from "../utils/jwt";
import { hashPassword, comparePassword } from "../utils/password";
import { JwtPayload } from "../types/auth";

describe("Authentication Tests", () => {
    describe("JWT Token", () => {
        const originalSecret = process.env.JWT_SECRET;

        beforeEach(() => {
            process.env.JWT_SECRET = "test-secret-key";
        });

        afterEach(() => {
            process.env.JWT_SECRET = originalSecret;
        });

        it("should generate a valid token", () => {
            const payload: JwtPayload = {
                user_id: "test-user-id",
                username: "testuser",
            };

            const token = generateToken(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
            expect(token.length).toBeGreaterThan(0);
        });

        it("should verify a valid token", () => {
            const payload: JwtPayload = {
                user_id: "test-user-id",
                username: "testuser",
            };

            const token = generateToken(payload);
            const verified = verifyToken(token);

            expect(verified.user_id).toBe(payload.user_id);
            expect(verified.username).toBe(payload.username);
        });

        it("should throw error for invalid token", () => {
            expect(() => {
                verifyToken("invalid-token");
            }).toThrow("Invalid/Expired token");
        });

        it("should throw error for expired token", async () => {
            // Create a token with very short expiration
            const payload: JwtPayload = {
                user_id: "test-user-id",
                username: "testuser",
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET || "test-secret-key", {
                expiresIn: "1ms",
            });

            // Wait a bit for token to expire
            await new Promise((resolve) => setTimeout(resolve, 10));
            
            expect(() => {
                verifyToken(token);
            }).toThrow("Invalid/Expired token");
        });
    });

    describe("Password Hashing", () => {
        it("should hash a password", async () => {
            const password = "testpassword123";
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(typeof hash).toBe("string");
            expect(hash.length).toBeGreaterThan(0);
            expect(hash).not.toBe(password);
        });

        it("should verify correct password", async () => {
            const password = "testpassword123";
            const hash = await hashPassword(password);

            const isValid = await comparePassword(password, hash);
            expect(isValid).toBe(true);
        });

        it("should reject incorrect password", async () => {
            const password = "testpassword123";
            const wrongPassword = "wrongpassword";
            const hash = await hashPassword(password);

            const isValid = await comparePassword(wrongPassword, hash);
            expect(isValid).toBe(false);
        });

        it("should produce different hashes for same password", async () => {
            const password = "testpassword123";
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            // bcrypt should produce different hashes due to salt
            expect(hash1).not.toBe(hash2);
        });

        it("should verify both hashes of same password", async () => {
            const password = "testpassword123";
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            const isValid1 = await comparePassword(password, hash1);
            const isValid2 = await comparePassword(password, hash2);

            expect(isValid1).toBe(true);
            expect(isValid2).toBe(true);
        });
    });
});

