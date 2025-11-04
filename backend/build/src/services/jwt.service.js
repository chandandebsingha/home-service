"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../types/config");
class JwtService {
    static generateToken(payload, expiry = config_1.config.accessTokenExpiry, secret = config_1.config.jwtSecret) {
        const expiresIn = typeof expiry === 'number' ? `${expiry}s` : expiry;
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    static verifyToken(token, secret = config_1.config.jwtSecret) {
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    static generateAccessToken(userId, email, role) {
        const payload = { userId, email, role };
        return this.generateToken(payload, config_1.config.accessTokenExpiry);
    }
    static generateRefreshToken(userId, email, role) {
        const payload = { userId, email, role };
        return this.generateToken(payload, config_1.config.refreshTokenExpiry);
    }
}
exports.JwtService = JwtService;
//# sourceMappingURL=jwt.service.js.map