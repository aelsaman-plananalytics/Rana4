import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { name, description } = req.body as { name?: string; description?: string };
    if (name === undefined || name === null || String(name).trim() === "") {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const standard = await prisma.standard.create({
      data: {
        name: String(name).trim(),
        description: description != null ? String(description) : null,
      },
    });
    res.status(201).json(standard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create standard" });
  }
}

export async function getAll(_req: Request, res: Response): Promise<void> {
  try {
    const standards = await prisma.standard.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(standards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch standards" });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const standard = await prisma.standard.findUnique({ where: { id } });
    if (!standard) {
      res.status(404).json({ error: "Standard not found" });
      return;
    }
    res.json(standard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch standard" });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description } = req.body as { name?: string; description?: string };
    const existing = await prisma.standard.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Standard not found" });
      return;
    }
    const standard = await prisma.standard.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(description !== undefined && { description: String(description) }),
      },
    });
    res.json(standard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update standard" });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.standard.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Standard not found" });
      return;
    }
    await prisma.standard.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete standard" });
  }
}
