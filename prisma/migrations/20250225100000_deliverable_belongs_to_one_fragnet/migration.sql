-- Deliverable belongs to exactly one Fragnet: add fragnet_id, backfill from join table, drop join table.

-- Add nullable column
ALTER TABLE "deliverables" ADD COLUMN IF NOT EXISTS "fragnet_id" TEXT;

-- Backfill: assign each deliverable to one fragnet (first by id from join table)
UPDATE "deliverables" d
SET "fragnet_id" = (
  SELECT fd."fragnet_id"
  FROM "fragnet_deliverables" fd
  WHERE fd."deliverable_id" = d."id"
  ORDER BY fd."fragnet_id"
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM "fragnet_deliverables" fd WHERE fd."deliverable_id" = d."id"
);

-- Remove deliverables that were never assigned to any fragnet (no row in join table)
DELETE FROM "deliverables" WHERE "fragnet_id" IS NULL;

-- Enforce NOT NULL and FK
ALTER TABLE "deliverables" ALTER COLUMN "fragnet_id" SET NOT NULL;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_fragnet_id_fkey" FOREIGN KEY ("fragnet_id") REFERENCES "fragnets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop join table
DROP TABLE "fragnet_deliverables";
