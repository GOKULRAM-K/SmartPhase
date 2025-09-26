// src/components/SimulationControls.tsx
import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import type { EventItem } from "../types/operations";

type Props = {
  rateMs: number;
  setRateMs: (v: number) => void;
  injectEvent: (ev: EventItem) => void;
  pause: () => void;
  start: () => void;
};

export default function SimulationControls({
  rateMs,
  setRateMs,
  injectEvent,
  pause,
  start,
}: Props) {
  const [injectCount, setInjectCount] = useState(1);

  const doInject = () => {
    for (let i = 0; i < injectCount; i++) {
      injectEvent({
        id: `SIM-${Date.now()}-${i}`,
        ts: new Date().toISOString(),
        type: "alert",
        nodeId: "ND-005",
        severity: "critical",
        summary: "Simulated critical event",
      } as EventItem);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Simulation Controls
      </Typography>

      <Box
        sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}
      >
        <Button variant="outlined" onClick={() => start()}>
          Start Feed
        </Button>
        <Button variant="outlined" onClick={() => pause()}>
          Pause Feed
        </Button>

        <Box sx={{ width: 220, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption">Rate</Typography>
          <Slider
            min={200}
            max={5000}
            step={100}
            value={rateMs}
            onChange={(_, v) => setRateMs(Array.isArray(v) ? v[0] : v)}
            sx={{ width: 160 }}
          />
          <Typography variant="caption">{rateMs}ms</Typography>
        </Box>

        <Button variant="contained" onClick={doInject}>
          Inject {injectCount} Alert(s)
        </Button>

        <input
          type="number"
          min={1}
          value={injectCount}
          onChange={(e) => setInjectCount(Math.max(1, Number(e.target.value)))}
          style={{ width: 64 }}
        />
      </Box>
    </Paper>
  );
}
