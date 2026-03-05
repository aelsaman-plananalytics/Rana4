import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

function parseDuration(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isInteger(n)) return null;
  return n;
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { fragnetId, name, bestDuration: bestDurationRaw, likelyDuration: likelyDurationRaw } = req.body as {
      fragnetId?: string;
      name?: string;
      bestDuration?: number;
      likelyDuration?: number;
    };

    const fragnetIdTrimmed =
      fragnetId !== undefined && fragnetId !== null && String(fragnetId).trim() !== ""
        ? String(fragnetId).trim()
        : null;

    if (fragnetIdTrimmed !== null) {
      const fragnet = await prisma.fragnet.findUnique({ where: { id: fragnetIdTrimmed } });
      if (!fragnet) {
        res.status(404).json({ error: "Fragnet not found" });
        return;
      }
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

    const deliverable = await prisma.deliverable.create({
      data: {
        fragnetId: fragnetIdTrimmed,
        name: String(name).trim(),
        bestDuration,
        likelyDuration,
      },
    });
    res.status(201).json(deliverable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create deliverable" });
  }
}

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const fragnetId = typeof req.query.fragnetId === "string" ? req.query.fragnetId.trim() : undefined;
    const deliverables = await prisma.deliverable.findMany({
      where: fragnetId ? { fragnetId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json(deliverables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch deliverables" });
  }
}

/** GET /deliverables/fragnet/:fragnetId – list deliverables for that fragnet */
export async function getByFragnetId(req: Request, res: Response): Promise<void> {
  try {
    const { fragnetId } = req.params;
    const fragnet = await prisma.fragnet.findUnique({ where: { id: fragnetId } });
    if (!fragnet) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }
    const deliverables = await prisma.deliverable.findMany({
      where: { fragnetId },
      orderBy: { createdAt: "asc" },
    });
    res.json(deliverables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch deliverables for fragnet" });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deliverable = await prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) {
      res.status(404).json({ error: "Deliverable not found" });
      return;
    }
    res.json(deliverable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch deliverable" });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { fragnetId: fragnetIdRaw, name, bestDuration: bestDurationRaw, likelyDuration: likelyDurationRaw } = req.body as {
      fragnetId?: string;
      name?: string;
      bestDuration?: number;
      likelyDuration?: number;
    };

    const existing = await prisma.deliverable.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Deliverable not found" });
      return;
    }

    const fragnetIdTrimmed =
      fragnetIdRaw !== undefined && fragnetIdRaw !== null
        ? (String(fragnetIdRaw).trim() || null)
        : undefined;
    if (fragnetIdTrimmed !== undefined) {
      if (fragnetIdTrimmed !== null) {
        const fragnet = await prisma.fragnet.findUnique({ where: { id: fragnetIdTrimmed } });
        if (!fragnet) {
          res.status(404).json({ error: "Fragnet not found" });
          return;
        }
      }
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

    const deliverable = await prisma.deliverable.update({
      where: { id },
      data: {
        ...(fragnetIdTrimmed !== undefined && { fragnetId: fragnetIdTrimmed }),
        ...(name !== undefined && { name: String(name).trim() }),
        ...(bestDurationRaw !== undefined && { bestDuration: parseDuration(bestDurationRaw)! }),
        ...(likelyDurationRaw !== undefined && { likelyDuration: parseDuration(likelyDurationRaw)! }),
      },
    });
    res.json(deliverable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update deliverable" });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.deliverable.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Deliverable not found" });
      return;
    }
    await prisma.deliverable.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete deliverable" });
  }
}
