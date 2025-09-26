// src/components/OperationsHeader.tsx
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import type { EventItem } from "../types/operations";

type Props = {
  events: EventItem[];
  running: boolean;
  onToggleFeed: () => void;
  onClearEvents?: () => void;
  onGlobalModeToggle?: (val: boolean) => void;
  globalAutoMode?: boolean;
};

export default function OperationsHeader({
  events,
  running,
  onToggleFeed,
  onClearEvents,
  onGlobalModeToggle,
  globalAutoMode = true,
}: Props) {
  const total = events.length;
  const critical = events.filter((e) => e.severity === "critical").length;
  const alerts = events.filter((e) => e.type === "alert").length;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h6">Operations Console</Typography>
          <Typography variant="body2" color="text.secondary">
            Realtime events, manual controls and audit trail for the demo
            system.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`Events: ${total}`} />
          <Chip
            label={`Alerts: ${alerts}`}
            color={alerts > 0 ? "warning" : "default"}
          />
          <Chip
            label={`Critical: ${critical}`}
            color={critical > 0 ? "error" : "default"}
          />
          <Button size="small" variant="outlined" onClick={onToggleFeed}>
            {running ? "Pause Feed" : "Resume Feed"}
          </Button>
          <Button size="small" color="error" onClick={onClearEvents}>
            Clear
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption">Global Auto</Typography>
            <Switch
              checked={globalAutoMode}
              onChange={(e) => onGlobalModeToggle?.(e.target.checked)}
            />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
