-- 1) Add business_id to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS business_id INT;

-- 2) Backfill existing rows to business_id = 1 (since you already have business 1)
UPDATE categories
SET business_id = 1
WHERE business_id IS NULL;

ALTER TABLE categories
ALTER COLUMN business_id SET NOT NULL;

ALTER TABLE categories
ADD CONSTRAINT IF NOT EXISTS categories_business_id_fkey
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories(business_id);

-- 3) Add business_id to training_items
ALTER TABLE training_items
ADD COLUMN IF NOT EXISTS business_id INT;

UPDATE training_items
SET business_id = 1
WHERE business_id IS NULL;

ALTER TABLE training_items
ALTER COLUMN business_id SET NOT NULL;

ALTER TABLE training_items
ADD CONSTRAINT IF NOT EXISTS training_items_business_id_fkey
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_training_items_business_id ON training_items(business_id);

-- 4) Optional but recommended: prevent cross-business linking:
-- training_items.category_id should refer to a category in the SAME business.
-- We'll enforce it at the application layer for MVP (SQL constraint is more complex).