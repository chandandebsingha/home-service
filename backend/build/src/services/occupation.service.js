"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupationService = void 0;
const db_1 = require("../db");
const schema_1 = require("../../build/drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
class OccupationService {
    static ensureTable() {
        if (!schema_1.occupations) {
            throw new Error('Occupations table is not initialized. Rebuild the backend so build/drizzle/schema.js includes occupations.');
        }
        return schema_1.occupations;
    }
    static async create(newOccupation) {
        const tbl = this.ensureTable();
        const [created] = await db_1.db.insert(tbl).values(newOccupation).returning();
        return created;
    }
    static async list() {
        const tbl = this.ensureTable();
        const all = await db_1.db.select().from(tbl).where((0, drizzle_orm_1.eq)(tbl.isActive, true));
        return all;
    }
    static async getById(id) {
        const tbl = this.ensureTable();
        const rows = await db_1.db.select().from(tbl).where((0, drizzle_orm_1.eq)(tbl.id, id)).limit(1);
        return rows[0] || null;
    }
    static async update(id, updates) {
        const tbl = this.ensureTable();
        const [updated] = await db_1.db.update(tbl).set(updates).where((0, drizzle_orm_1.eq)(tbl.id, id)).returning();
        return updated;
    }
    static async delete(id) {
        const tbl = this.ensureTable();
        await db_1.db.delete(tbl).where((0, drizzle_orm_1.eq)(tbl.id, id));
        return true;
    }
}
exports.OccupationService = OccupationService;
//# sourceMappingURL=occupation.service.js.map