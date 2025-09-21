"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const db_1 = require("../db");
const schema = __importStar(require("../../drizzle/schema"));
const drizzle_orm_1 = require("drizzle-orm");
class BookingService {
    static async ensureServiceExists(serviceId) {
        const rows = await db_1.db.select().from(schema.services).where((0, drizzle_orm_1.eq)(schema.services.id, serviceId)).limit(1);
        return !!rows[0];
    }
    static async create(payload) {
        const [created] = await db_1.db.insert(schema.bookings).values(payload).returning();
        return created;
    }
    static async listByUser(userId) {
        const rows = await db_1.db.select().from(schema.bookings).where((0, drizzle_orm_1.eq)(schema.bookings.userId, userId)).orderBy((0, drizzle_orm_1.desc)(schema.bookings.createdAt));
        return rows;
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=booking.service.js.map