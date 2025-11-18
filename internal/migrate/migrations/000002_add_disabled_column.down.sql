-- Remove disabled column from functions table
ALTER TABLE functions DROP COLUMN disabled;

-- Drop index for disabled functions
DROP INDEX IF EXISTS idx_functions_disabled;
