import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
}

function parseDuration(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isInteger(n)) return null;
  return n;
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const {
      fragnetId,
      activityCode,
      name,
      bestDuration: bestDurationRaw,
      likelyDuration: likelyDurationRaw,
      assuranceNoteId,
    } = req.body as {
      fragnetId?: string;
      activityCode?: string;
      name?: string;
      bestDuration?: number;
      likelyDuration?: number;
      assuranceNoteId?: string | null;
    };

    if (!fragnetId || String(fragnetId).trim() === "") {
      res.status(400).json({ error: "fragnetId is required" });
      return;
    }
    if (activityCode === undefined || activityCode === null || String(activityCode).trim() === "") {
      res.status(400).json({ error: "activityCode is required" });
      return;
    }
    if (name === undefined || name === null || String(name).trim() === "") {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const bestDuration = parseDuration(bestDurationRaw);
    const likelyDuration = parseDuration(likelyDurationRaw);
    if (bestDuration === null || bestDuration < 1) {
      res.status(400).json({ error: "bestDuration must be a positive integer" });
      return;
    }
    if (likelyDuration === null || likelyDuration < 1) {
      res.status(400).json({ error: "likelyDuration must be a positive integer" });
      return;
    }

    const fragnet = await prisma.fragnet.findUnique({ where: { id: fragnetId } });
    if (!fragnet) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }

    const assuranceNoteIdTrimmed =
      assuranceNoteId != null && String(assuranceNoteId).trim() !== ""
        ? String(assuranceNoteId).trim()
        : null;
    if (assuranceNoteIdTrimmed) {
      const note = await prisma.assuranceNote.findUnique({ where: { id: assuranceNoteIdTrimmed } });
      if (!note) {
        res.status(400).json({ error: "Assurance note not found" });
        return;
      }
      if (note.standardId !== fragnet.standardId) {
        res.status(400).json({ error: "Assurance note must belong to the same standard as the fragnet" });
        return;
      }
    }

    const activity = await prisma.activity.create({
      data: {
        fragnetId: fragnet.id,
        activityCode: String(activityCode).trim(),
        name: String(name).trim(),
        bestDuration,
        likelyDuration,
        assuranceNoteId: assuranceNoteIdTrimmed,
      },
    });
    res.status(201).json(activity);
  } catch (err) {
    if (isPrismaUniqueViolation(err)) {
      res.status(400).json({ error: "activityCode already exists for this fragnet" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create activity" });
  }
}

export async function getByFragnetId(req: Request, res: Response): Promise<void> {
  try {
    const { fragnetId } = req.params;
    const fragnet = await prisma.fragnet.findUnique({
      where: { id: fragnetId },
      include: { activities: { orderBy: { activityCode: "asc" } } },
    });
    if (!fragnet) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }
    res.json(fragnet.activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, bestDuration: bestDurationRaw, likelyDuration: likelyDurationRaw, assuranceNoteId } = req.body as {
      name?: string;
      bestDuration?: number;
      likelyDuration?: number;
      assuranceNoteId?: string | null;
    };

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }

    if (bestDurationRaw !== undefined) {
      const bestDuration = parseDuration(bestDurationRaw);
      if (bestDuration === null || bestDuration < 1) {
        res.status(400).json({ error: "bestDuration must be a positive integer" });
        return;
      }
    }
    if (likelyDurationRaw !== undefined) {
      const likelyDuration = parseDuration(likelyDurationRaw);
      if (likelyDuration === null || likelyDuration < 1) {
        res.status(400).json({ error: "likelyDuration must be a positive integer" });
        return;
      }
    }

    const assuranceNoteIdTrimmed =
      assuranceNoteId !== undefined
        ? assuranceNoteId != null && String(assuranceNoteId).trim() !== ""
          ? String(assuranceNoteId).trim()
          : null
        : undefined;
    if (assuranceNoteIdTrimmed !== undefined && assuranceNoteIdTrimmed !== null) {
      const fragnet = await prisma.fragnet.findUnique({ where: { id: existing.fragnetId } });
      const note = await prisma.assuranceNote.findUnique({ where: { id: assuranceNoteIdTrimmed } });
      if (!note || !fragnet || note.standardId !== fragnet.standardId) {
        res.status(400).json({ error: "Assurance note must belong to the same standard as the fragnet" });
        return;
      }
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(bestDurationRaw !== undefined && { bestDuration: parseDuration(bestDurationRaw)! }),
        ...(likelyDurationRaw !== undefined && { likelyDuration: parseDuration(likelyDurationRaw)! }),
        ...(assuranceNoteId !== undefined && { assuranceNoteId: assuranceNoteIdTrimmed ?? null }),
      },
    });
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update activity" });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }
    await prisma.activity.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
}
