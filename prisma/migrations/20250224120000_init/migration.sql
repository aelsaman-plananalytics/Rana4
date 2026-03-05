-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('FS', 'SS', 'FF', 'SF');

-- CreateTable
CREATE TABLE "standards" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assurance_notes" (
    "id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,
    "note_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assurance_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fragnets" (
    "id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fragnets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "fragnet_id" TEXT NOT NULL,
    "activity_code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "best_duration" INTEGER NOT NULL,
    "likely_duration" INTEGER NOT NULL,
    "assurance_note_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL,
    "fragnet_id" TEXT NOT NULL,
    "predecessor_activity_id" TEXT NOT NULL,
    "successor_activity_id" TEXT NOT NULL,
    "relationship_type" "RelationshipType" NOT NULL,
    "lag" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "best_duration" INTEGER NOT NULL,
    "likely_duration" INTEGER NOT NULL,
    "assurance_note_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activities_fragnet_id_activity_code_key" ON "activities"("fragnet_id", "activity_code");

-- AddForeignKey
ALTER TABLE "assurance_notes" ADD CONSTRAINT "assurance_notes_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fragnets" ADD CONSTRAINT "fragnets_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_fragnet_id_fkey" FOREIGN KEY ("fragnet_id") REFERENCES "fragnets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_assurance_note_id_fkey" FOREIGN KEY ("assurance_note_id") REFERENCES "assurance_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_fragnet_id_fkey" FOREIGN KEY ("fragnet_id") REFERENCES "fragnets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_predecessor_activity_id_fkey" FOREIGN KEY ("predecessor_activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_successor_activity_id_fkey" FOREIGN KEY ("successor_activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_assurance_note_id_fkey" FOREIGN KEY ("assurance_note_id") REFERENCES "assurance_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
