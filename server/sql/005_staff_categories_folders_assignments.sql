-- 1) staff categories
CREATE TABLE IF NOT EXISTS staff_categories (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_categories_business_name
ON staff_categories (business_id, name);

CREATE INDEX IF NOT EXISTS idx_staff_categories_business_id
ON staff_categories (business_id);

-- 2) employee-category assignments (many-to-many)
CREATE TABLE IF NOT EXISTS employee_category_assignments (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_category_id INT NOT NULL REFERENCES staff_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_category_assignment
ON employee_category_assignments (user_id, staff_category_id);

CREATE INDEX IF NOT EXISTS idx_employee_category_assignments_business_id
ON employee_category_assignments (business_id);

CREATE INDEX IF NOT EXISTS idx_employee_category_assignments_user_id
ON employee_category_assignments (user_id);

CREATE INDEX IF NOT EXISTS idx_employee_category_assignments_staff_category_id
ON employee_category_assignments (staff_category_id);

-- 3) folders inside staff categories
CREATE TABLE IF NOT EXISTS folders (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  staff_category_id INT NOT NULL REFERENCES staff_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folders_business_id
ON folders (business_id);

CREATE INDEX IF NOT EXISTS idx_folders_staff_category_id
ON folders (staff_category_id);

-- optional uniqueness inside a category
CREATE UNIQUE INDEX IF NOT EXISTS uq_folders_staff_category_name
ON folders (staff_category_id, name);

-- 4) training_items: add folder_id, keep old category_id for now so nothing breaks yet
ALTER TABLE training_items
ADD COLUMN IF NOT EXISTS folder_id INT REFERENCES folders(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_training_items_folder_id
ON training_items (folder_id);