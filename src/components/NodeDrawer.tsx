// src/components/NodeDrawer.tsx
import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import StatusBadge from "./StatusBadge";

type NodeFull = {
  id: string;
  name?: string;
  feeder?: string;
  district?: string;
  lat?: number;
  lon?: number;
  status?: "operational" | "degraded" | "critical";
  mode?: "auto" | "manual";
  last_telemetry?: {
    ts?: string;
    vuf?: number;
    v_a?: number;
    v_b?: number;
    v_c?: number;
    neutral_current?: number;
  };
};

type Props = {
  open: boolean;
  node?: NodeFull | null;
  onClose: () => void;
  onApplyBalance: (id: string) => Promise<void> | void;
  onToggleMode: (id: string, mode: "auto" | "manual") => Promise<void> | void;
  busy?: boolean;
};

export default function NodeDrawer({
  open,
  node,
  onClose,
  onApplyBalance,
  onToggleMode,
  busy,
}: Props) {
  if (!node) {
    return (
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: 360, p: 2 }}>No node selected</Box>
      </Drawer>
    );
  }

  const vuf = node.last_telemetry?.vuf ?? NaN;
  const mode = node.mode ?? "auto";

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 3 }}>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box>
              <Typography variant="h6">{node.name || node.id}</Typography>
              <Typography variant="body2" color="text.secondary">
                {node.feeder} • {node.district}
              </Typography>
            </Box>
            <Box sx={{ ml: "auto" }}>
              <StatusBadge status={node.status ?? "operational"} />
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Voltage Unbalance Factor
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {isNaN(vuf) ? "--" : `${vuf}%`}
              </Typography>
              <Chip label={`Mode: ${mode}`} size="small" />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Last updated:{" "}
              {node.last_telemetry?.ts
                ? new Date(node.last_telemetry.ts).toLocaleString()
                : "—"}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">
              Phase Voltages / Neutral
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              V_a: {node.last_telemetry?.v_a ?? "--"} V • V_b:{" "}
              {node.last_telemetry?.v_b ?? "--"} V • V_c:{" "}
              {node.last_telemetry?.v_c ?? "--"} V
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Neutral: {node.last_telemetry?.neutral_current ?? "--"} A
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">Controls</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                onClick={() => onApplyBalance(node.id)}
                disabled={busy}
              >
                {busy ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Apply Balance"
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  onToggleMode(node.id, mode === "auto" ? "manual" : "auto")
                }
                disabled={busy}
              >
                Switch to {mode === "auto" ? "Manual" : "Auto"}
              </Button>
              <Button
                variant="text"
                color="error"
                onClick={() => {
                  /* placeholder for emergency */
                }}
                disabled
              >
                Emergency
              </Button>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              Actions are recorded in Events. Quick Balance applies a single
              corrective step.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2">Recent events (mock)</Typography>
            <Typography variant="body2" color="text.secondary">
              Auto-balance reduced VUF from 3.2% → 0.9% (5 minutes ago)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manual step applied (20 minutes ago)
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
}
