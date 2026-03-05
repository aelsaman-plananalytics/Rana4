import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { standardId, name, description } = req.body as {
      standardId?: string;
      name?: string;
      description?: string;
    };
    if (name === undefined || name === null || String(name).trim() === "") {
      res.status(400).json({ error: "name is required" });
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
    const fragnet = await prisma.fragnet.create({
      data: {
        standardId: standard.id,
        name: String(name).trim(),
        description: description != null ? String(description) : null,
      },
    });
    res.status(201).json(fragnet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create fragnet" });
  }
}

export async function getByStandardId(req: Request, res: Response): Promise<void> {
  try {
    const { standardId } = req.params;
    const standard = await prisma.standard.findUnique({
      where: { id: standardId },
      include: { fragnets: { orderBy: { createdAt: "desc" } } },
    });
    if (!standard) {
      res.status(404).json({ error: "Standard not found" });
      return;
    }
    res.json(standard.fragnets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fragnets" });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const fragnet = await prisma.fragnet.findUnique({ where: { id } });
    if (!fragnet) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }
    res.json(fragnet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fragnet" });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description } = req.body as { name?: string; description?: string };
    const existing = await prisma.fragnet.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }
    const fragnet = await prisma.fragnet.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(description !== undefined && { description: String(description) }),
      },
    });
    res.json(fragnet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update fragnet" });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.fragnet.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }
    await prisma.fragnet.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete fragnet" });
  }
}
