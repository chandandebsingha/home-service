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
exports.ServiceService = void 0;
const db_1 = require("../db");
const schema = __importStar(require("../../drizzle/schema"));
const drizzle_orm_1 = require("drizzle-orm");
class ServiceService {
    static ensureTable() {
        console.log('Checking schema.services:', schema.services);
        console.log('Schema keys:', Object.keys(schema));
        if (!schema.services) {
            throw new Error('Services table is not initialized. Ensure drizzle/schema exports services and server restarted.');
        }
        return schema.services;
    }
    static async create(newService) {
        const services = this.ensureTable();
        const [created] = await db_1.db.insert(services).values(newService).returning();
        return created;
    }
    static async list(limit = 50, offset = 0, filters) {
        const services = this.ensureTable();
        const whereClauses = [];
        if (filters?.categoryId)
            whereClauses.push((0, drizzle_orm_1.eq)(services.categoryId, filters.categoryId));
        if (filters?.serviceTypeId)
            whereClauses.push((0, drizzle_orm_1.eq)(services.serviceTypeId, filters.serviceTypeId));
        const where = whereClauses.length === 0 ? undefined : (whereClauses.length === 1 ? whereClauses[0] : (0, drizzle_orm_1.and)(...whereClauses));
        const query = db_1.db.select().from(services).limit(limit).offset(offset);
        const all = where ? await query.where(where) : await query;
        return all;
    }
    static async getById(id) {
        const services = this.ensureTable();
        const rows = await db_1.db.select().from(services).where((0, drizzle_orm_1.eq)(services.id, id)).limit(1);
        return rows[0] || null;
    }
}
exports.ServiceService = ServiceService;
//# sourceMappingURL=service.service.js.map