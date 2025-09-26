// src/components/ControlPanel.tsx
import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import type { NodeType } from "../utils/mockNodes";
import CommandModal from "./CommandModal";

type Props = {
  nodes: NodeType[];
  onSendCommand: (payload: {
    nodeIds: string[];
    command: "quick-balance" | "switch-mode" | "restart";
    params?: any;
  }) => Promise<void>;
};

export default function ControlPanel({ nodes, onSendCommand }: Props) {
  const [selectedNode, setSelectedNode] = useState<string | "all">("all");
  const [command, setCommand] = useState<
    "quick-balance" | "switch-mode" | "restart"
  >("quick-balance");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modeTarget, setModeTarget] = useState<"auto" | "manual">("auto");

  const nodeOptions = nodes.map((n) => ({
    id: n.id,
    label: `${n.id} (${n.district ?? ""})`,
  }));

  const submit = () => {
    setConfirmOpen(true);
  };

  const doSend = async () => {
    const nodeIds =
      selectedNode === "all" ? nodes.map((n) => n.id) : [selectedNode];
    const params = command === "switch-mode" ? { mode: modeTarget } : {};
    await onSendCommand({ nodeIds, command, params });
    setConfirmOpen(false);
  };

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Manual Control
        </Typography>

        <Stack spacing={1}>
          <TextField
            select
            size="small"
            label="Target Node"
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value as any)}
          >
            <MenuItem value="all">All nodes (bulk)</MenuItem>
            {nodeOptions.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Command"
            value={command}
            onChange={(e) => setCommand(e.target.value as any)}
          >
            <MenuItem value="quick-balance">Quick Balance</MenuItem>
            <MenuItem value="switch-mode">Switch Mode</MenuItem>
            <MenuItem value="restart">Restart Device</MenuItem>
          </TextField>

          {command === "switch-mode" ? (
            <TextField
              select
              size="small"
              label="Mode"
              value={modeTarget}
              onChange={(e) => setModeTarget(e.target.value as any)}
            >
              <MenuItem value="auto">Auto</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
            </TextField>
          ) : null}

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" onClick={submit}>
              Send Command
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedNode("all");
                setCommand("quick-balance");
              }}
            >
              Reset
            </Button>
            <Chip label="Demo only" size="small" />
          </Box>
        </Stack>
      </Paper>

      <CommandModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSend}
        title="Confirm Command"
        content={
          <>
            <Typography variant="body2">
              You are about to send <strong>{command}</strong> to{" "}
              <strong>
                {selectedNode === "all"
                  ? `${nodes.length} nodes`
                  : selectedNode}
              </strong>
              .
            </Typography>
            {command === "switch-mode" && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Mode: <strong>{modeTarget}</strong>
              </Typography>
            )}
          </>
        }
      />
    </>
  );
}
