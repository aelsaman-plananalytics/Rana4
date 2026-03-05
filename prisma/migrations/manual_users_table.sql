-- Run this in Neon SQL Editor (or any PostgreSQL client) if you cannot run
-- `npx prisma db push` (e.g. due to EPERM or missing Prisma CLI).
-- Creates the users table required for auth (signup/login).

CREATE TABLE IF NOT EXISTS "users" (
  "id"           TEXT NOT NULL,
  "email"        VARCHAR(255) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "name"         VARCHAR(255),
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
