DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT', 'COMPLIANCE_OFFICER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PortfolioType" AS ENUM ('RETAIL', 'OFFICE', 'INDUSTRIAL', 'RESIDENTIAL', 'MIXED_USE', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "RegulatoryStatus" AS ENUM ('INSIDE_ACT', 'OUTSIDE_1954_ACT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "OccupancyStatus" AS ENUM ('FULLY_OCCUPIED', 'PARTIALLY_OCCUPIED', 'VACANT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "UnitType" AS ENUM ('SHOP', 'OFFICE', 'WAREHOUSE', 'APARTMENT', 'STORAGE', 'PARKING', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "UnitStatus" AS ENUM ('OCCUPIED', 'VACANT', 'UNDER_MAINTENANCE', 'RESERVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" SERIAL NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "token_version" INTEGER NOT NULL DEFAULT 0,
  "last_login_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "clients" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "unified_management_status" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "companies" (
  "id" SERIAL NOT NULL,
  "client_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "email_sender_name" TEXT,
  "email_sender_address" TEXT,
  "email_reply_to_address" TEXT,
  "email_signature" TEXT,
  "vat_status" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "estates" (
  "id" SERIAL NOT NULL,
  "client_id" INTEGER NOT NULL,
  "company_id" INTEGER,
  "name" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "estates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "portfolios" (
  "id" SERIAL NOT NULL,
  "estate_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "type" "PortfolioType" NOT NULL DEFAULT 'OTHER',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "properties" (
  "id" SERIAL NOT NULL,
  "portfolio_id" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "size_nia" DECIMAL(12,2),
  "size_gia" DECIMAL(12,2),
  "size_it2a" DECIMAL(12,2),
  "size_gea" DECIMAL(12,2),
  "eaves_height" DECIMAL(8,2),
  "apex_height" DECIMAL(8,2),
  "regulatory_status" "RegulatoryStatus" NOT NULL DEFAULT 'INSIDE_ACT',
  "occupancy_status" "OccupancyStatus" NOT NULL DEFAULT 'VACANT',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "units" (
  "id" SERIAL NOT NULL,
  "property_id" INTEGER NOT NULL,
  "unit_number" TEXT NOT NULL,
  "type" "UnitType" NOT NULL DEFAULT 'OTHER',
  "status" "UnitStatus" NOT NULL DEFAULT 'VACANT',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_is_active_idx" ON "User"("is_active");
CREATE INDEX IF NOT EXISTS "clients_name_idx" ON "clients"("name");
CREATE INDEX IF NOT EXISTS "companies_client_id_idx" ON "companies"("client_id");
CREATE INDEX IF NOT EXISTS "companies_name_idx" ON "companies"("name");
CREATE INDEX IF NOT EXISTS "estates_client_id_idx" ON "estates"("client_id");
CREATE INDEX IF NOT EXISTS "estates_company_id_idx" ON "estates"("company_id");
CREATE INDEX IF NOT EXISTS "estates_name_idx" ON "estates"("name");
CREATE INDEX IF NOT EXISTS "portfolios_estate_id_idx" ON "portfolios"("estate_id");
CREATE INDEX IF NOT EXISTS "portfolios_name_idx" ON "portfolios"("name");
CREATE INDEX IF NOT EXISTS "properties_portfolio_id_idx" ON "properties"("portfolio_id");
CREATE INDEX IF NOT EXISTS "properties_name_idx" ON "properties"("name");
CREATE INDEX IF NOT EXISTS "properties_occupancy_status_idx" ON "properties"("occupancy_status");
CREATE INDEX IF NOT EXISTS "units_property_id_idx" ON "units"("property_id");
CREATE INDEX IF NOT EXISTS "units_status_idx" ON "units"("status");

DO $$ BEGIN
  ALTER TABLE "companies" ADD CONSTRAINT "companies_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "estates" ADD CONSTRAINT "estates_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "estates" ADD CONSTRAINT "estates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "properties" ADD CONSTRAINT "properties_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "units" ADD CONSTRAINT "units_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
