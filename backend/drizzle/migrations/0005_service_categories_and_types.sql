-- Create service categories and service types tables, and link them to services

-- 1) Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2) Service Types (sub-categories)
CREATE TABLE IF NOT EXISTS service_types (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3) Link to existing services table
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_type_id INTEGER REFERENCES service_types(id) ON DELETE SET NULL;

-- Optional: simple indexes
CREATE INDEX IF NOT EXISTS idx_service_types_category_id ON service_types(category_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_service_type_id ON services(service_type_id);


