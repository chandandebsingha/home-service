"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const db_1 = require("../db");
const schema_1 = require("../../build/drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class ServiceService {
    static ensureTable() {
        if (!schema_1.services) {
            throw new Error('Services table is not initialized. Ensure drizzle/schema exports services and server restarted.');
        }
        return schema_1.services;
    }
    static async create(newService) {
        const servicesTable = this.ensureTable();
        const [created] = await db_1.db.insert(servicesTable).values(newService).returning();
        return created;
    }
    static async list(limit = 50, offset = 0, filters) {
        const servicesTable = this.ensureTable();
        const whereClauses = [];
        if (filters?.categoryId)
            whereClauses.push((0, drizzle_orm_1.eq)(servicesTable.categoryId, filters.categoryId));
        if (filters?.serviceTypeId)
            whereClauses.push((0, drizzle_orm_1.eq)(servicesTable.serviceTypeId, filters.serviceTypeId));
        const where = whereClauses.length === 0 ? undefined : (whereClauses.length === 1 ? whereClauses[0] : (0, drizzle_orm_1.and)(...whereClauses));
        const query = db_1.db.select().from(servicesTable).limit(limit).offset(offset);
        const all = where ? await query.where(where) : await query;
        return all;
    }
    static async getById(id) {
        const servicesTable = this.ensureTable();
        const rows = await db_1.db.select().from(servicesTable).where((0, drizzle_orm_1.eq)(servicesTable.id, id)).limit(1);
        return rows[0] || null;
    }
    static async listByProvider(providerId) {
        const servicesTable = this.ensureTable();
        const rows = await db_1.db.select().from(servicesTable).where((0, drizzle_orm_1.eq)(servicesTable.providerId, providerId));
        return rows;
    }
    static async update(id, updates) {
        const servicesTable = this.ensureTable();
        const [updated] = await db_1.db.update(servicesTable).set(updates).where((0, drizzle_orm_1.eq)(servicesTable.id, id)).returning();
        return updated;
    }
    static async delete(id) {
        const servicesTable = this.ensureTable();
        await db_1.db.delete(servicesTable).where((0, drizzle_orm_1.eq)(servicesTable.id, id));
        return true;
    }
}
exports.ServiceService = ServiceService;
//# sourceMappingURL=service.service.js.map