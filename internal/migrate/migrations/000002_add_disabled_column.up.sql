-- Add disabled column to functions table
ALTER TABLE functions ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0;

-- Create index for disabled functions
CREATE INDEX IF NOT EXISTS idx_functions_disabled ON functions(disabled);
