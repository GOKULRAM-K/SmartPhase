// src/types/operations.ts
export type EventSeverity = "info" | "warn" | "critical";

export type EventType =
  | "telemetry"
  | "alert"
  | "auto-balance"
  | "manual-command"
  | "system";

export type EventItem = {
  id: string;
  ts: string; // ISO timestamp
  type: EventType;
  nodeId?: string;
  severity?: EventSeverity;
  summary: string;
  details?: Record<string, any>;
};

export type CommandName = "quick-balance" | "switch-mode" | "restart";

export type CommandItem = {
  id: string;
  ts: string; // ISO timestamp when created
  nodeIds: string[]; // one or many
  command: CommandName;
  params?: Record<string, any>;
  initiatedBy?: string;
  status: "queued" | "running" | "success" | "failed";
  result?: string;
};
