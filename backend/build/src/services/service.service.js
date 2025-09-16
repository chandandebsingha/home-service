"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const db_1 = require("../db");
const schema_1 = require("../../drizzle/schema");
class ServiceService {
    static async create(newService) {
        const [created] = await db_1.db.insert(schema_1.services).values(newService).returning();
        return created;
    }
    static async list() {
        const all = await db_1.db.select().from(schema_1.services);
        return all;
    }
}
exports.ServiceService = ServiceService;
//# sourceMappingURL=service.service.js.map