import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { standardId, noteText } = req.body as { standardId?: string; noteText?: string };
    if (noteText === undefined || noteText === null || String(noteText).trim() === "") {
      res.status(400).json({ error: "noteText is required" });
      return;
    }
    if (!standardId || String(standardId).trim() === "") {
      res.status(400).json({ error: "standardId is required" });
      return;
    }
    const standard = await prisma.standard.findUnique({ where: { id: standardId } });
    if (!standard) {
      res.status(404).json({ error: "Standard not found" });
      return;
    }
    const note = await prisma.assuranceNote.create({
      data: {
        standardId: standard.id,
        noteText: String(noteText).trim(),
      },
    });
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create assurance note" });
  }
}

export async function getByStandardId(req: Request, res: Response): Promise<void> {
  try {
    const { standardId } = req.params;
    const standard = await prisma.standard.findUnique({
      where: { id: standardId },
      include: { assuranceNotes: { orderBy: { createdAt: "desc" } } },
    });
    if (!standard) {
      res.status(404).json({ error: "Standard not found" });
      return;
    }
    res.json(standard.assuranceNotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assurance notes" });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.assuranceNote.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Assurance note not found" });
      return;
    }
    await prisma.assuranceNote.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete assurance note" });
  }
}
