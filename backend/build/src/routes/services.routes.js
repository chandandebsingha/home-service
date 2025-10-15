"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_controller_1 = require("../controllers/services.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
async function ensureMetaTables() {
    await db_1.db.execute((0, drizzle_orm_1.sql) `
    create table if not exists service_categories (
      id serial primary key,
      name text not null,
      description text,
      created_at timestamp default now() not null,
      updated_at timestamp default now() not null
    )
  `);
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
router.get('/', services_controller_1.ServicesController.list);
router.get('/:id', services_controller_1.ServicesController.getById);
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, (0, validation_middleware_1.validateRequest)([
    { field: 'name', validator: validation_middleware_1.Validators.isString, message: 'name must be a string' },
    { field: 'price', validator: validation_middleware_1.Validators.isNumber, message: 'price must be a number' },
    { field: 'description', validator: validation_middleware_1.Validators.isString, message: 'description must be a string', optional: true },
    { field: 'serviceType', validator: validation_middleware_1.Validators.isString, message: 'serviceType must be a string', optional: true },
    { field: 'categoryId', validator: validation_middleware_1.Validators.isNumber, message: 'categoryId must be a number', optional: true },
    { field: 'serviceTypeId', validator: validation_middleware_1.Validators.isNumber, message: 'serviceTypeId must be a number', optional: true },
    { field: 'durationMinutes', validator: validation_middleware_1.Validators.isNumber, message: 'durationMinutes must be a number', optional: true },
    { field: 'availability', validator: validation_middleware_1.Validators.isBoolean, message: 'availability must be a boolean', optional: true },
    { field: 'timeSlots', validator: validation_middleware_1.Validators.isString, message: 'timeSlots must be a string', optional: true },
]), services_controller_1.ServicesController.create);
exports.default = router;
router.get('/meta/categories', async (req, res) => {
    try {
        await ensureMetaTables();
        const result = await db_1.db.execute((0, drizzle_orm_1.sql) `select id, name, description, created_at as "createdAt", updated_at as "updatedAt" from service_categories order by id desc`);
        const rows = Array.isArray(result) ? result : result?.rows || [];
        res.json({ success: true, data: rows });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e?.message || 'Failed to fetch categories' });
    }
});
router.get('/meta/types', async (req, res) => {
    try {
        await ensureMetaTables();
        const categoryId = req.query.categoryId ? parseInt(String(req.query.categoryId), 10) : undefined;
        const result = categoryId
            ? await db_1.db.execute((0, drizzle_orm_1.sql) `select id, category_id as "categoryId", name, description, created_at as "createdAt", updated_at as "updatedAt" from service_types where category_id = ${categoryId} order by id desc`)
            : await db_1.db.execute((0, drizzle_orm_1.sql) `select id, category_id as "categoryId", name, description, created_at as "createdAt", updated_at as "updatedAt" from service_types order by id desc`);
        const rows = Array.isArray(result) ? result : result?.rows || [];
        res.json({ success: true, data: rows });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e?.message || 'Failed to fetch service types' });
    }
});
router.post('/meta/categories', auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, async (req, res) => {
    try {
        await ensureMetaTables();
        const body = req.body || {};
        if (!body.name) {
            res.status(400).json({ success: false, error: 'name is required' });
            return;
        }
        const result = await db_1.db.execute((0, drizzle_orm_1.sql) `insert into service_categories (name, description) values (${body.name}, ${body.description || null}) returning id, name, description, created_at as "createdAt", updated_at as "updatedAt"`);
        const created = Array.isArray(result) ? result[0] : result?.rows?.[0];
        res.status(201).json({ success: true, data: created || null });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e?.message || 'Failed to create category' });
    }
});
router.post('/meta/types', auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, async (req, res) => {
    try {
        await ensureMetaTables();
        const body = req.body || {};
        if (!body.name) {
            res.status(400).json({ success: false, error: 'name is required' });
            return;
        }
        if (!body.categoryId) {
            res.status(400).json({ success: false, error: 'categoryId is required' });
            return;
        }
        const result = await db_1.db.execute((0, drizzle_orm_1.sql) `insert into service_types (category_id, name, description) values (${Number(body.categoryId)}, ${body.name}, ${body.description || null}) returning id, category_id as "categoryId", name, description, created_at as "createdAt", updated_at as "updatedAt"`);
        const created = Array.isArray(result) ? result[0] : result?.rows?.[0];
        res.status(201).json({ success: true, data: created || null });
    }
    catch (e) {
        res.status(500).json({ success: false, error: e?.message || 'Failed to create service type' });
    }
});
//# sourceMappingURL=services.routes.js.map