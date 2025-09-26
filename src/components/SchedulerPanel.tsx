// src/components/SchedulerPanel.tsx
import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import type { NodeType } from "../utils/mockNodes";

type Props = {
  nodes: NodeType[];
  onSchedule: (payload: {
    nodeIds: string[];
    command: "quick-balance" | "switch-mode" | "restart";
    runAt: string;
  }) => Promise<void>;
};

export default function SchedulerPanel({ nodes, onSchedule }: Props) {
  const [nodeId, setNodeId] = useState<string>("all");
  const [command, setCommand] = useState<
    "quick-balance" | "switch-mode" | "restart"
  >("quick-balance");
  const [minutes, setMinutes] = useState<number>(5);
  const nodeOptions = nodes.map((n) => n.id);

  const submit = async () => {
    const runAt = new Date(Date.now() + minutes * 60000).toISOString();
    const nodeIds = nodeId === "all" ? nodes.map((n) => n.id) : [nodeId];
    await onSchedule({ nodeIds, command, runAt });
    alert(
      `Scheduled ${command} for ${nodeIds.length} nodes at ${new Date(
        runAt
      ).toLocaleString()}`
    );
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Scheduler (Demo)
      </Typography>
      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
      >
        <TextField
          select
          size="small"
          value={nodeId}
          onChange={(e) => setNodeId(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All nodes</MenuItem>
          {nodeOptions.map((id) => (
            <MenuItem key={id} value={id}>
              {id}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={command}
          onChange={(e) => setCommand(e.target.value as any)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="quick-balance">Quick Balance</MenuItem>
          <MenuItem value="switch-mode">Switch Mode</MenuItem>
          <MenuItem value="restart">Restart</MenuItem>
        </TextField>

        <TextField
          type="number"
          size="small"
          value={minutes}
          onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))}
          sx={{ width: 100 }}
        />

        <Button variant="contained" onClick={submit}>
          Schedule
        </Button>
      </Box>
    </Paper>
  );
}
