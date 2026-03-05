-- Make deliverable.fragnet_id optional so deliverables can exist with no fragnet.
ALTER TABLE "deliverables" ALTER COLUMN "fragnet_id" DROP NOT NULL;
