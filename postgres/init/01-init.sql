-- Run on first container start (only when data volume is empty)
-- Add any custom DB setup here, e.g. extensions:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'Postgres init completed.' AS status;
