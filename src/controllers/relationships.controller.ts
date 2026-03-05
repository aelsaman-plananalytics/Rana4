import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

const RELATIONSHIP_TYPES = ["FS", "SS", "FF", "SF"] as const;

function isValidRelationshipType(value: unknown): value is "FS" | "SS" | "FF" | "SF" {
  return typeof value === "string" && RELATIONSHIP_TYPES.includes(value as (typeof RELATIONSHIP_TYPES)[number]);
}

function parseLag(value: unknown): number {
  if (value === undefined || value === null) return 0;
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isInteger(n)) return 0;
  return n;
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const {
      fragnetId,
      predecessorActivityId,
      successorActivityId,
      relationshipType,
      lag: lagRaw,
    } = req.body as {
      fragnetId?: string;
      predecessorActivityId?: string;
      successorActivityId?: string;
      relationshipType?: string;
      lag?: number;
    };

    if (!fragnetId || String(fragnetId).trim() === "") {
      res.status(400).json({ error: "fragnetId is required" });
      return;
    }
    if (!predecessorActivityId || String(predecessorActivityId).trim() === "") {
      res.status(400).json({ error: "predecessorActivityId is required" });
      return;
    }
    if (!successorActivityId || String(successorActivityId).trim() === "") {
      res.status(400).json({ error: "successorActivityId is required" });
      return;
    }
    if (!isValidRelationshipType(relationshipType)) {
      res.status(400).json({ error: "relationshipType must be one of FS, SS, FF, SF" });
      return;
    }
    if (predecessorActivityId === successorActivityId) {
      res.status(400).json({ error: "predecessorActivityId and successorActivityId must be different" });
      return;
    }

    const fragnet = await prisma.fragnet.findUnique({ where: { id: fragnetId } });
    if (!fragnet) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }

    const [predecessor, successor] = await Promise.all([
      prisma.activity.findUnique({ where: { id: predecessorActivityId } }),
      prisma.activity.findUnique({ where: { id: successorActivityId } }),
    ]);

    if (!predecessor) {
      res.status(400).json({ error: "Predecessor activity not found" });
      return;
    }
    if (!successor) {
      res.status(400).json({ error: "Successor activity not found" });
      return;
    }
    if (predecessor.fragnetId !== fragnetId) {
      res.status(400).json({ error: "Predecessor activity does not belong to this fragnet" });
      return;
    }
    if (successor.fragnetId !== fragnetId) {
      res.status(400).json({ error: "Successor activity does not belong to this fragnet" });
      return;
    }

    const existingRel = await prisma.relationship.findFirst({
      where: {
        fragnetId,
        predecessorActivityId: predecessor.id,
        successorActivityId: successor.id,
      },
    });
    if (existingRel) {
      res.status(400).json({ error: "Duplicate relationship: same predecessor and successor already exists for this fragnet" });
      return;
    }

    const relationship = await prisma.relationship.create({
      data: {
        fragnetId: fragnet.id,
        predecessorActivityId: predecessor.id,
        successorActivityId: successor.id,
        relationshipType,
        lag: parseLag(lagRaw),
      },
    });
    res.status(201).json(relationship);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create relationship" });
  }
}

export async function getByFragnetId(req: Request, res: Response): Promise<void> {
  try {
    const { fragnetId } = req.params;
    const fragnet = await prisma.fragnet.findUnique({
      where: { id: fragnetId },
      include: { relationships: true },
    });
    if (!fragnet) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }
    res.json(fragnet.relationships);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch relationships" });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.relationship.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Relationship not found" });
      return;
    }
    await prisma.relationship.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete relationship" });
  }
}
