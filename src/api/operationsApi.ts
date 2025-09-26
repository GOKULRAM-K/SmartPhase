// src/api/operationsApi.ts
import type { CommandItem } from "../types/operations";

/**
 * Mock operations API for frontend demo.
 * - sendCommand: returns Promise<CommandItem>
 * - scheduleCommand: returns Promise<CommandItem>
 * - exportAudit: returns Promise<string> (CSV content)
 *
 * These are all client-side mocks with small delays.
 */

function randDelay(min = 500, max = 1500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function sendCommandMock(payload: {
  nodeIds: string[];
  command: CommandItem["command"];
  params?: Record<string, any>;
  initiatedBy?: string;
}): Promise<CommandItem> {
  const id = `CMD-${Date.now()}`;
  const created: CommandItem = {
    id,
    ts: new Date().toISOString(),
    nodeIds: payload.nodeIds,
    command: payload.command,
    params: payload.params,
    initiatedBy: payload.initiatedBy ?? "DemoOperator",
    status: "running",
  };

  // simulate processing
  await new Promise((r) => setTimeout(r, randDelay()));
  // random success/fail for fun (mostly success)
  const ok = Math.random() > 0.08;
  created.status = ok ? "success" : "failed";
  created.result = ok ? "ok" : "simulated failure";

  return created;
}

export async function scheduleCommandMock(payload: {
  nodeIds: string[];
  command: CommandItem["command"];
  runAt: string; // ISO
  initiatedBy?: string;
}): Promise<CommandItem> {
  const id = `SCH-${Date.now()}`;
  const item: CommandItem = {
    id,
    ts: new Date().toISOString(),
    nodeIds: payload.nodeIds,
    command: payload.command,
    params: { scheduledFor: payload.runAt },
    initiatedBy: payload.initiatedBy ?? "DemoOperator",
    status: "queued",
  };
  // immediate resolve (scheduler simulated in front-end)
  await new Promise((r) => setTimeout(r, 300));
  return item;
}

export async function exportAuditCsvMock(audit: CommandItem[]) {
  // simple CSV
  const header = ["id,ts,command,nodeIds,initiatedBy,status,result"];
  const rows = audit.map((c) =>
    [
      c.id,
      c.ts,
      c.command,
      `"${(c.nodeIds || []).join("|")}"`,
      c.initiatedBy ?? "",
      c.status,
      c.result ?? "",
    ].join(",")
  );
  const csv = header.concat(rows).join("\n");
  // simulate small delay
  await new Promise((r) => setTimeout(r, 300));
  return csv;
}
