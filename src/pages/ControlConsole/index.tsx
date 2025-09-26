// src/pages/ControlConsole/index.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { MOCK_NODES } from "../../utils/mockNodes";

type CommandType =
  | "quick_balance"
  | "toggle_mode"
  | "toggle_ssr"
  | "set_threshold"
  | "set_voltage_limit"
  | "set_neutral_limit"
  | "ping_node"
  | "rebalance_all"
  | "restart_node"
  | "acknowledge_alerts"
  | "inject_test_event"
  | "custom_json";

export default function ControlConsolePage() {
  const districts = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_NODES.map((n) => n.district).filter((d): d is string => !!d)
        )
      ),
    []
  );

  const [district, setDistrict] = useState<string>("");
  const [nodeId, setNodeId] = useState<string>("");
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  const availableNodes = useMemo(
    () => MOCK_NODES.filter((n) => n.district === district),
    [district]
  );

  // helper: send a command
  const sendCommand = (cmd: CommandType, params: Record<string, any> = {}) => {
    if (!district || !nodeId) {
      alert("Please select district and node first.");
      return;
    }
    const payload = { nodeId, cmd, params };
    console.log("Sending command:", payload);
    setSnack({ open: true, msg: `Sent ${cmd} to ${nodeId}` });
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Control Console
      </Typography>

      {/* Selectors */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>District</InputLabel>
          <Select
            value={district}
            label="District"
            onChange={(e) => {
              setDistrict(e.target.value);
              setNodeId("");
            }}
          >
            {districts.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }} disabled={!district}>
          <InputLabel>Node</InputLabel>
          <Select
            value={nodeId}
            label="Node"
            onChange={(e) => setNodeId(e.target.value)}
          >
            {availableNodes.map((n) => (
              <MenuItem key={n.id} value={n.id}>
                {n.name} ({n.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Command Cards: rows with 3 columns each */}
      <Stack spacing={3}>
        {/* Row 1 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Quick Balance</Typography>
            <TextField
              size="small"
              type="number"
              label="Threshold"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendCommand("quick_balance", {
                    threshold: Number((e.target as HTMLInputElement).value),
                  });
                }
              }}
            />
            <Button
              sx={{ mt: 1 }}
              variant="contained"
              onClick={() => sendCommand("quick_balance", { threshold: 1.0 })}
            >
              Default (1.0)
            </Button>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Toggle Mode</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => sendCommand("toggle_mode", { mode: "auto" })}
              >
                Auto
              </Button>
              <Button
                variant="outlined"
                onClick={() => sendCommand("toggle_mode", { mode: "manual" })}
              >
                Manual
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Toggle SSR</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => sendCommand("toggle_ssr", { state: "on" })}
              >
                On
              </Button>
              <Button
                variant="outlined"
                onClick={() => sendCommand("toggle_ssr", { state: "off" })}
              >
                Off
              </Button>
            </Stack>
          </Paper>
        </Stack>

        {/* Row 2 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Set VUF Threshold</Typography>
            <TextField
              size="small"
              type="number"
              label="VUF Limit"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendCommand("set_threshold", {
                    vuf_limit: Number((e.target as HTMLInputElement).value),
                  });
                }
              }}
            />
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Set Voltage Limit</Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                size="small"
                type="number"
                label="Min V"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendCommand("set_voltage_limit", {
                      min_v: Number((e.target as HTMLInputElement).value),
                    });
                  }
                }}
              />
              <TextField
                size="small"
                type="number"
                label="Max V"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendCommand("set_voltage_limit", {
                      max_v: Number((e.target as HTMLInputElement).value),
                    });
                  }
                }}
              />
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Set Neutral Limit</Typography>
            <TextField
              size="small"
              type="number"
              label="Neutral (A)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendCommand("set_neutral_limit", {
                    limit: Number((e.target as HTMLInputElement).value),
                  });
                }
              }}
            />
          </Paper>
        </Stack>

        {/* Row 3 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Ping Node</Typography>
            <Button
              variant="contained"
              onClick={() => sendCommand("ping_node")}
            >
              Ping
            </Button>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Rebalance All</Typography>
            <Button
              variant="contained"
              onClick={() =>
                sendCommand("rebalance_all", { strategy: "equalize" })
              }
            >
              Run Rebalance
            </Button>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Restart Node</Typography>
            <Button
              variant="contained"
              color="warning"
              onClick={() => sendCommand("restart_node", { delay: 5 })}
            >
              Restart (5s delay)
            </Button>
          </Paper>
        </Stack>

        {/* Row 4 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Acknowledge Alerts</Typography>
            <Button
              variant="outlined"
              onClick={() =>
                sendCommand("acknowledge_alerts", {
                  ids: ["evt-123", "evt-124"],
                })
              }
            >
              Acknowledge Sample
            </Button>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Inject Test Event</Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() =>
                sendCommand("inject_test_event", {
                  type: "overload",
                  severity: "critical",
                })
              }
            >
              Inject Overload
            </Button>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle1">Custom JSON</Typography>
            <TextField
              multiline
              fullWidth
              minRows={4}
              placeholder='{"myParam":123}'
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  try {
                    const parsed = JSON.parse(
                      (e.target as HTMLInputElement).value
                    );
                    sendCommand("custom_json", parsed);
                  } catch {
                    alert("Invalid JSON");
                  }
                }
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Press Ctrl+Enter to send
            </Typography>
          </Paper>
        </Stack>
      </Stack>

      {/* Snackbar feedback */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
