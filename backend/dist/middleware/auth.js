"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
function authenticate(req, res, next) {
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
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (err) {
        return res.status(401).json({
            error: "Unauthorized",
            message: err.message || "Invalid or expired token",
        });
    }
}
