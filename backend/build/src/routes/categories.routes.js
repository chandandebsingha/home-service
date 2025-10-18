"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
async function ensureCategoriesTable() {
    await db_1.db.execute((0, drizzle_orm_1.sql) `
    create table if not exists service_categories (
      id serial primary key,
      name text not null,
      description text,
      created_at timestamp default now() not null,
      updated_at timestamp default now() not null
    )
  `);
}
async function ensureServiceTypesTable() {
    await db_1.db.execute((0, drizzle_orm_1.sql) `
		create table if not exists service_types (
			id serial primary key,
			category_id integer references service_categories(id),
			name text not null,
			description text,
			created_at timestamp default now() not null,
			updated_at timestamp default now() not null
		)
	`);
}
router.get("/", async (req, res) => {
    try {
        await ensureCategoriesTable();
        const result = await db_1.db.execute((0, drizzle_orm_1.sql) `select id, name, description, created_at as "createdAt", updated_at as "updatedAt" from service_categories order by id desc`);
        const rows = Array.isArray(result) ? result : result?.rows || [];
        res.json({ success: true, data: rows });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            error: e?.message || "Failed to fetch categories",
        });
    }
});
router.get("/:id", async (req, res) => {
    try {
        await ensureCategoriesTable();
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid id" });
            return;
        }
        const result = await db_1.db.execute((0, drizzle_orm_1.sql) `select id, name, description, created_at as "createdAt", updated_at as "updatedAt" from service_categories where id = ${id} limit 1`);
        const row = Array.isArray(result) ? result[0] : result?.rows?.[0];
        if (!row) {
            res.status(404).json({ success: false, error: "Category not found" });
            return;
        }
        res.json({ success: true, data: row });
    }
    catch (e) {
        res.status(500).json({
            success: false,
            error: e?.message || "Failed to fetch category",
        });
    }
});
router.get("/:id/types", async (req, res) => {
    try {
        await ensureCategoriesTable();
        await ensureServiceTypesTable();
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid id" });
            return;
        }
        const result = await db_1.db.execute((0, drizzle_orm_1.sql) `select id, category_id as "categoryId", name, description, created_at as "createdAt", updated_at as "updatedAt" from service_types where category_id = ${id} order by id desc`);
        const rows = Array.isArray(result) ? result : result?.rows || [];
        res.json({ success: true, data: rows });
    }
    catch (e) {
        res
            .status(500)
            .json({
            success: false,
            error: e?.message || "Failed to fetch service types",
        });
    }
});
exports.default = router;
//# sourceMappingURL=categories.routes.js.map