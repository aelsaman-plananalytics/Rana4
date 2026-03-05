/**
 * Excel (.xlsx) export for a single Fragnet.
 * Structure and columns match Primavera P6 Spreadsheet Import template.
 *
 * If NO deliverables: export activities normally (TASK = activities, TASKPRED = relationships).
 *
 * If deliverables exist: block-based duplication per deliverable:
 * - For each deliverable, create a block: deliverable row + duplicate of ALL activities.
 * - IDs sequential across sheet (no reuse between blocks).
 * - Relationships: deliverable → entry activity (FS, 0) and all internal relationships within block.
 * - Empty row between blocks in TASK only (except after last block).
 */

import * as XLSX from "xlsx";

type DeliverableForExport = {
  id: string;
  name: string;
  bestDuration: number;
  likelyDuration: number;
  createdAt: Date;
};

type ActivityForExport = {
  id: string;
  name: string;
  bestDuration: number;
  likelyDuration: number;
  createdAt: Date;
};

type RelationshipForExport = {
  predecessorActivityId: string;
  successorActivityId: string;
  relationshipType: string;
  lag: number;
};

/** Deterministic sort: created_at asc, then id asc. */
function sortByCreatedAt<T extends { createdAt: Date; id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const tA = new Date(a.createdAt).getTime();
    const tB = new Date(b.createdAt).getTime();
    if (tA !== tB) return tA - tB;
    return a.id.localeCompare(b.id);
  });
}

/** Entry activity = activity with no predecessor in this fragnet. If multiple, earliest created. */
function findEntryActivity(
  activities: ActivityForExport[],
  relationships: RelationshipForExport[]
): ActivityForExport | null {
  const successorIds = new Set(relationships.map((r) => r.successorActivityId));
  const withNoPredecessor = activities.filter((a) => !successorIds.has(a.id));
  if (withNoPredecessor.length === 0) return null;
  const sorted = sortByCreatedAt(withNoPredecessor);
  return sorted[0] ?? null;
}

/** P6 TASK sheet: row = [task_code, task_name, status_code, wbs_id, proj_id, orig_dur_hr_cnt, delete_record_flag]. Duration: days → hours (8h/day). */
const TASK_DB_HEADERS = ["task_code", "task_name", "status_code", "wbs_id", "proj_id", "orig_dur_hr_cnt", "delete_record_flag"];
const TASK_USER_HEADERS = ["Activity ID", "Activity Name", "Activity Status", "WBS Code", "Project ID", "Original Duration (hr)", "Delete This Row"];
const ACTIVITY_STATUS = "Not Started";
const WBS_CODE = "RANA4-WBS";

/** P6 TASKPRED sheet: row = [pred_task_id, task_id, pred_type, pred_proj_id, proj_id, lag_hr_cnt, delete_record_flag]. Lag in days → hours (8h/day). */
const TASKPRED_DB_HEADERS = ["pred_task_id", "task_id", "pred_type", "pred_proj_id", "proj_id", "lag_hr_cnt", "delete_record_flag"];
const TASKPRED_USER_HEADERS = ["Predecessor", "Successor", "Relationship Type", "Predecessor Project", "Successor Project", "Lag(d)", "Delete This Row"];

function daysToHours(days: number): number {
  return days * 8;
}

export type ExportScenario = "best" | "likely";

/**
 * Generate xlsx buffer for fragnet export (P6 Spreadsheet Import format).
 * - Two header rows per sheet: database field names, then user-friendly names.
 * - TASK: task_code, task_name, status_code, wbs_id, proj_id, orig_dur_hr_cnt, delete_record_flag.
 * - TASKPRED: pred_task_id, task_id, pred_type, pred_proj_id, proj_id, lag_hr_cnt, delete_record_flag.
 * - Block duplication per deliverable unchanged; empty rows only in TASK.
 */
export function generateFragnetXlsx(
  deliverables: DeliverableForExport[],
  activities: ActivityForExport[],
  relationships: RelationshipForExport[],
  scenario: ExportScenario,
  projectId: string,
  unassignedDeliverables?: DeliverableForExport[]
): Buffer {
  const durationField = scenario === "best" ? "bestDuration" : "likelyDuration";
  const taskDataRows: (string | number | null)[][] = [];
  const taskPredDataRows: (string | number | null)[][] = [];
  let nextId = 1000;
  const sortedActivities = sortByCreatedAt(activities);
  const entryActivity = findEntryActivity(activities, relationships);

  if (deliverables.length === 0) {
    // No deliverables: export activities normally (current behaviour)
    const activityMap = new Map<string, string>();
    sortedActivities.forEach((a, idx) => {
      activityMap.set(a.id, `A${1000 + idx}`);
    });
    nextId = 1000 + sortedActivities.length;
    sortedActivities.forEach((a) => {
      taskDataRows.push([
        activityMap.get(a.id)!,
        a.name,
        ACTIVITY_STATUS,
        WBS_CODE,
        projectId,
        daysToHours(a[durationField]),
        null,
      ]);
    });
    relationships.forEach((r) => {
      const predId = activityMap.get(r.predecessorActivityId) ?? r.predecessorActivityId;
      const succId = activityMap.get(r.successorActivityId) ?? r.successorActivityId;
      taskPredDataRows.push([predId, succId, r.relationshipType, projectId, projectId, daysToHours(r.lag), null]);
    });
  } else {
    // Block-based duplication per deliverable
    const sortedDeliverables = sortByCreatedAt(deliverables);

    for (let i = 0; i < sortedDeliverables.length; i++) {
      const d = sortedDeliverables[i];

      const deliverableExportId = `A${nextId++}`;
      taskDataRows.push([
        deliverableExportId,
        d.name,
        ACTIVITY_STATUS,
        WBS_CODE,
        projectId,
        daysToHours(d[durationField]),
        null,
      ]);

      const activityMapInBlock = new Map<string, string>();
      sortedActivities.forEach((a) => {
        activityMapInBlock.set(a.id, `A${nextId++}`);
      });
      sortedActivities.forEach((a) => {
        taskDataRows.push([
          activityMapInBlock.get(a.id)!,
          a.name,
          ACTIVITY_STATUS,
          WBS_CODE,
          projectId,
          daysToHours(a[durationField]),
          null,
        ]);
      });

      if (entryActivity) {
        const entryExportId = activityMapInBlock.get(entryActivity.id);
        if (entryExportId) {
          taskPredDataRows.push([deliverableExportId, entryExportId, "FS", projectId, projectId, daysToHours(0), null]);
        }
      }

      relationships.forEach((r) => {
        const predId = activityMapInBlock.get(r.predecessorActivityId);
        const succId = activityMapInBlock.get(r.successorActivityId);
        if (predId && succId) {
          taskPredDataRows.push([predId, succId, r.relationshipType, projectId, projectId, daysToHours(r.lag), null]);
        }
      });

      if (i < sortedDeliverables.length - 1) {
        taskDataRows.push(["", "", "", "", "", "", null]);
      }
    }
  }

  // Append blocks for unassigned deliverables (no fragnet)
  if (unassignedDeliverables && unassignedDeliverables.length > 0) {
    const sortedUnassigned = sortByCreatedAt(unassignedDeliverables);
    if (taskDataRows.length > 0) {
      taskDataRows.push(["", "", "", "", "", "", null]);
    }
    for (let i = 0; i < sortedUnassigned.length; i++) {
      const d = sortedUnassigned[i];
      const deliverableExportId = `A${nextId++}`;
      taskDataRows.push([
        deliverableExportId,
        d.name,
        ACTIVITY_STATUS,
        WBS_CODE,
        projectId,
        daysToHours(d[durationField]),
        null,
      ]);
      const activityMapInBlock = new Map<string, string>();
      sortedActivities.forEach((a) => {
        activityMapInBlock.set(a.id, `A${nextId++}`);
      });
      sortedActivities.forEach((a) => {
        taskDataRows.push([
          activityMapInBlock.get(a.id)!,
          a.name,
          ACTIVITY_STATUS,
          WBS_CODE,
          projectId,
          daysToHours(a[durationField]),
          null,
        ]);
      });
      if (entryActivity) {
        const entryExportId = activityMapInBlock.get(entryActivity.id);
        if (entryExportId) {
          taskPredDataRows.push([deliverableExportId, entryExportId, "FS", projectId, projectId, daysToHours(0), null]);
        }
      }
      relationships.forEach((r) => {
        const predId = activityMapInBlock.get(r.predecessorActivityId);
        const succId = activityMapInBlock.get(r.successorActivityId);
        if (predId && succId) {
          taskPredDataRows.push([predId, succId, r.relationshipType, projectId, projectId, daysToHours(r.lag), null]);
        }
      });
      if (i < sortedUnassigned.length - 1) {
        taskDataRows.push(["", "", "", "", "", "", null]);
      }
    }
  }

  const taskAoa = [TASK_DB_HEADERS, TASK_USER_HEADERS, ...taskDataRows];
  const taskPredAoa = [TASKPRED_DB_HEADERS, TASKPRED_USER_HEADERS, ...taskPredDataRows];

  const workbook = XLSX.utils.book_new();
  const taskSheet = XLSX.utils.aoa_to_sheet(taskAoa);
  const taskPredSheet = XLSX.utils.aoa_to_sheet(taskPredAoa);

  XLSX.utils.book_append_sheet(workbook, taskSheet, "TASK");
  XLSX.utils.book_append_sheet(workbook, taskPredSheet, "TASKPRED");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
