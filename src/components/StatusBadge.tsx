// src/components/StatusBadge.tsx
import React from "react";
import Chip from "@mui/material/Chip";

export default function StatusBadge({
  status,
}: {
  status: "operational" | "degraded" | "critical";
}) {
  const map = {
    operational: { label: "Operational", color: "success" as const },
    degraded: { label: "Degraded", color: "warning" as const },
    critical: { label: "Critical", color: "error" as const },
  };
  const s = map[status];
  return <Chip label={s.label} color={s.color} size="small" />;
}
