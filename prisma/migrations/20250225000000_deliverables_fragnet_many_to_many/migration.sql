-- CreateTable: many-to-many between fragnets and deliverables
CREATE TABLE "fragnet_deliverables" (
    "fragnet_id" TEXT NOT NULL,
    "deliverable_id" TEXT NOT NULL,

    CONSTRAINT "fragnet_deliverables_pkey" PRIMARY KEY ("fragnet_id","deliverable_id")
);

-- Migrate existing data: assign each deliverable to all fragnets under its standard
INSERT INTO "fragnet_deliverables" ("fragnet_id", "deliverable_id")
SELECT f.id, d.id
FROM "deliverables" d
JOIN "fragnets" f ON f.standard_id = d.standard_id;

-- AddForeignKey
ALTER TABLE "fragnet_deliverables" ADD CONSTRAINT "fragnet_deliverables_fragnet_id_fkey" FOREIGN KEY ("fragnet_id") REFERENCES "fragnets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fragnet_deliverables" ADD CONSTRAINT "fragnet_deliverables_deliverable_id_fkey" FOREIGN KEY ("deliverable_id") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop FKs and columns from deliverables
ALTER TABLE "deliverables" DROP CONSTRAINT IF EXISTS "deliverables_standard_id_fkey";
ALTER TABLE "deliverables" DROP CONSTRAINT IF EXISTS "deliverables_assurance_note_id_fkey";
ALTER TABLE "deliverables" DROP COLUMN IF EXISTS "standard_id";
ALTER TABLE "deliverables" DROP COLUMN IF EXISTS "assurance_note_id";
