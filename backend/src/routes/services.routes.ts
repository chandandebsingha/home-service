import { Router } from 'express';
import { ServicesController } from '../controllers/services.controller';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware';
import { validateRequest, Validators } from '../middleware/validation.middleware';
import { services, serviceCategories, serviceTypes } from '../../drizzle/schema';
import { db } from '../db';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Ensure meta tables exist (for dev environments where migrations weren't run)
async function ensureMetaTables(): Promise<void> {
  // service_categories
  await db.execute(sql`
    create table if not exists service_categories (
      id serial primary key,
      name text not null,
      description text,
      created_at timestamp default now() not null,
      updated_at timestamp default now() not null
    )
  `);
  // service_types
  await db.execute(sql`
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

// Public endpoints
router.get('/', ServicesController.list);
router.get('/:id', ServicesController.getById);

// Admin-only endpoints
router.post(
  '/',
  authenticateToken,
  authorizeAdmin,
  validateRequest([
    { field: 'name', validator: Validators.isString, message: 'name must be a string' },
    { field: 'price', validator: Validators.isNumber, message: 'price must be a number' },
    { field: 'description', validator: Validators.isString, message: 'description must be a string', optional: true },
    { field: 'serviceType', validator: Validators.isString, message: 'serviceType must be a string', optional: true },
    { field: 'categoryId', validator: Validators.isNumber, message: 'categoryId must be a number', optional: true },
    { field: 'serviceTypeId', validator: Validators.isNumber, message: 'serviceTypeId must be a number', optional: true },
    { field: 'durationMinutes', validator: Validators.isNumber, message: 'durationMinutes must be a number', optional: true },
    { field: 'availability', validator: Validators.isBoolean, message: 'availability must be a boolean', optional: true },
    { field: 'timeSlots', validator: Validators.isString, message: 'timeSlots must be a string', optional: true },
  ]),
  ServicesController.create
);

export default router;

// Additional lightweight endpoints for categories and types
router.get('/meta/categories', async (req, res) => {
  try {
    await ensureMetaTables();
    // Use raw SQL to avoid issues if schema hot-reload isn't in sync
    const result: any = await db.execute(sql`select id, name, description, created_at as "createdAt", updated_at as "updatedAt" from service_categories order by id desc`);
    const rows = Array.isArray(result) ? result : result?.rows || [];
    res.json({ success: true, data: rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to fetch categories' });
  }
});

router.get('/meta/types', async (req, res) => {
  try {
    await ensureMetaTables();
    const categoryId = req.query.categoryId ? parseInt(String(req.query.categoryId), 10) : undefined;
    const result: any = categoryId
      ? await db.execute(sql`select id, category_id as "categoryId", name, description, created_at as "createdAt", updated_at as "updatedAt" from service_types where category_id = ${categoryId} order by id desc`)
      : await db.execute(sql`select id, category_id as "categoryId", name, description, created_at as "createdAt", updated_at as "updatedAt" from service_types order by id desc`);
    const rows = Array.isArray(result) ? result : result?.rows || [];
    res.json({ success: true, data: rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to fetch service types' });
  }
});

// Admin create meta
router.post('/meta/categories', authenticateToken, authorizeAdmin, async (req, res): Promise<void> => {
  try {
    await ensureMetaTables();
    const body = req.body || {};
    if (!body.name) { res.status(400).json({ success: false, error: 'name is required' }); return; }
    const result: any = await db.execute(sql`insert into service_categories (name, description) values (${body.name}, ${body.description || null}) returning id, name, description, created_at as "createdAt", updated_at as "updatedAt"`);
    const created = Array.isArray(result) ? result[0] : result?.rows?.[0];
    res.status(201).json({ success: true, data: created || null });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to create category' });
  }
});

router.post('/meta/types', authenticateToken, authorizeAdmin, async (req, res): Promise<void> => {
  try {
    await ensureMetaTables();
    const body = req.body || {};
    if (!body.name) { res.status(400).json({ success: false, error: 'name is required' }); return; }
    if (!body.categoryId) { res.status(400).json({ success: false, error: 'categoryId is required' }); return; }
    const result: any = await db.execute(sql`insert into service_types (category_id, name, description) values (${Number(body.categoryId)}, ${body.name}, ${body.description || null}) returning id, category_id as "categoryId", name, description, created_at as "createdAt", updated_at as "updatedAt"`);
    const created = Array.isArray(result) ? result[0] : result?.rows?.[0];
    res.status(201).json({ success: true, data: created || null });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to create service type' });
  }
});
