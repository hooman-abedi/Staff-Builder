CREATE TABLE IF NOT EXISTS training_item_completions (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  training_item_id INT NOT NULL REFERENCES training_items(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_training_item_completion_user_item
ON training_item_completions (user_id, training_item_id);

CREATE INDEX IF NOT EXISTS idx_training_item_completions_business_id
ON training_item_completions (business_id);

CREATE INDEX IF NOT EXISTS idx_training_item_completions_user_id
ON training_item_completions (user_id);

CREATE INDEX IF NOT EXISTS idx_training_item_completions_training_item_id
ON training_item_completions (training_item_id);