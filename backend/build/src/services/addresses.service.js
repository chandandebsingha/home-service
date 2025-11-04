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
exports.AddressesService = void 0;
const db_1 = require("../db");
const schema = __importStar(require("../../drizzle/schema"));
const drizzle_orm_1 = require("drizzle-orm");
class AddressesService {
    static async create(payload) {
        const [created] = await db_1.db
            .insert(schema.address)
            .values(payload)
            .returning();
        return created;
    }
    static async listByUser(userId) {
        const rows = await db_1.db
            .select()
            .from(schema.address)
            .where((0, drizzle_orm_1.eq)(schema.address.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema.address.createdAt));
        return rows;
    }
    static async unsetDefaultForUser(userId) {
        await db_1.db
            .update(schema.address)
            .set({ isDefault: false })
            .where((0, drizzle_orm_1.eq)(schema.address.userId, userId));
    }
    static async getById(id) {
        const rows = await db_1.db
            .select()
            .from(schema.address)
            .where((0, drizzle_orm_1.eq)(schema.address.id, id))
            .limit(1);
        return rows[0] || null;
    }
    static async update(id, payload) {
        const [updated] = await db_1.db
            .update(schema.address)
            .set(payload)
            .where((0, drizzle_orm_1.eq)(schema.address.id, id))
            .returning();
        return updated;
    }
    static async remove(id) {
        const [deleted] = await db_1.db
            .delete(schema.address)
            .where((0, drizzle_orm_1.eq)(schema.address.id, id))
            .returning();
        return deleted;
    }
}
exports.AddressesService = AddressesService;
//# sourceMappingURL=addresses.service.js.map