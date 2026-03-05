import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { generateFragnetXlsx, type ExportScenario } from "../services/export.service.js";

const VALID_SCENARIOS: ExportScenario[] = ["best", "likely"];

export async function exportFragnet(req: Request, res: Response): Promise<void> {
  try {
    const { fragnetId } = req.params;
    const body = req.body as {
      scenario?: string;
      projectName?: string;
      projectId?: string;
      unassignedDeliverableIds?: string[];
    };

    const scenario = body.scenario;
    const projectName = body.projectName;
    const projectId = body.projectId;
    const unassignedDeliverableIds = Array.isArray(body.unassignedDeliverableIds)
      ? body.unassignedDeliverableIds.filter((id) => typeof id === "string" && id.trim() !== "")
      : [];

    if (scenario === undefined || scenario === null || String(scenario).trim() === "") {
      res.status(400).json({ error: "scenario is required" });
      return;
    }
    if (!VALID_SCENARIOS.includes(scenario as ExportScenario)) {
      res.status(400).json({ error: "scenario must be 'best' or 'likely'" });
      return;
    }
    if (projectName === undefined || projectName === null || String(projectName).trim() === "") {
      res.status(400).json({ error: "projectName is required" });
      return;
    }
    if (projectId === undefined || projectId === null || String(projectId).trim() === "") {
      res.status(400).json({ error: "projectId is required" });
      return;
    }

    const fragnet = await prisma.fragnet.findUnique({
      where: { id: fragnetId },
      include: {
        activities: { orderBy: { createdAt: "asc" } },
        relationships: true,
        deliverables: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!fragnet) {
      res.status(404).json({ error: "Fragnet not found" });
      return;
    }

    const deliverablesForExport = fragnet.deliverables.map((d) => ({
      id: d.id,
      name: d.name,
      bestDuration: d.bestDuration,
      likelyDuration: d.likelyDuration,
      createdAt: d.createdAt,
    }));

    let unassignedForExport: { id: string; name: string; bestDuration: number; likelyDuration: number; createdAt: Date }[] = [];
    if (unassignedDeliverableIds.length > 0) {
      const unassigned = await prisma.deliverable.findMany({
        where: { fragnetId: null, id: { in: unassignedDeliverableIds } },
        orderBy: { createdAt: "asc" },
      });
      unassignedForExport = unassigned.map((d) => ({
        id: d.id,
        name: d.name,
        bestDuration: d.bestDuration,
        likelyDuration: d.likelyDuration,
        createdAt: d.createdAt,
      }));
    }

    const buffer = generateFragnetXlsx(
      deliverablesForExport,
      fragnet.activities.map((a) => ({
        id: a.id,
        name: a.name,
        bestDuration: a.bestDuration,
        likelyDuration: a.likelyDuration,
        createdAt: a.createdAt,
      })),
      fragnet.relationships.map((r) => ({
        predecessorActivityId: r.predecessorActivityId,
        successorActivityId: r.successorActivityId,
        relationshipType: r.relationshipType,
        lag: r.lag,
      })),
      scenario as ExportScenario,
      String(projectId).trim(),
      unassignedForExport
    );

    const filename = `fragnet-${String(projectId).trim()}-${scenario}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export fragnet" });
  }
}
