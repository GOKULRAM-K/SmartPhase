// src/pages/Operations/index.tsx
import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import type { EventItem, CommandItem } from "../../types/operations";
import useEventFeed from "../../hooks/useEventFeed";
import OperationsHeader from "../../components/OperationsHeader";
import EventFeed from "../../components/EventFeed";
import ControlPanel from "../../components/ControlPanel";
import SchedulerPanel from "../../components/SchedulerPanel";
import SimulationControls from "../../components/SimulationControls";
import AuditTrail from "../../components/AuditTrail";
import { sendCommandMock, scheduleCommandMock } from "../../api/operationsApi";
import { MOCK_NODES } from "../../utils/mockNodes";
import type { NodeType } from "../../utils/mockNodes";

export default function OperationsPage() {
  // event feed hook
  const { events, running, start, pause, injectEvent, setRate, clearAll } =
    useEventFeed(1200, 1000);

  // audit trail of commands
  const [audit, setAudit] = useState<CommandItem[]>([]);

  // global auto mode (demo toggle)
  const [globalAuto, setGlobalAuto] = useState(true);

  // nodes for control panel
  const nodes: NodeType[] = MOCK_NODES;

  // KPIs derived
  const kpis = useMemo(() => {
    const total = events.length;
    const critical = events.filter((e) => e.severity === "critical").length;
    const alerts = events.filter((e) => e.type === "alert").length;
    return { total, critical, alerts };
  }, [events]);

  const handleSendCommand = async (payload: {
    nodeIds: string[];
    command: CommandItem["command"];
    params?: any;
  }) => {
    // call mock API
    const res = await sendCommandMock({
      nodeIds: payload.nodeIds,
      command: payload.command,
      params: payload.params,
    });
    // push audit
    setAudit((prev) => [res, ...prev].slice(0, 500));
    // inject a manual-command event for the feed
    injectEvent({
      id: `EV-CMD-${Date.now()}`,
      ts: new Date().toISOString(),
      type: "manual-command",
      nodeId: payload.nodeIds[0],
      severity: "info",
      summary: `Manual command ${payload.command} -> ${payload.nodeIds.length} node(s)`,
      details: { result: res.result },
    } as EventItem);
  };

  const handleSchedule = async (payload: {
    nodeIds: string[];
    command: CommandItem["command"];
    runAt: string;
  }) => {
    const res = await scheduleCommandMock({
      nodeIds: payload.nodeIds,
      command: payload.command,
      runAt: payload.runAt,
    });
    setAudit((prev) => [res, ...prev]);
  };

  return (
    <Box>
      <OperationsHeader
        events={events}
        running={running}
        onToggleFeed={() => (running ? pause() : start())}
        onClearEvents={() => clearAll()}
        onGlobalModeToggle={(v) => setGlobalAuto(v)}
        globalAutoMode={globalAuto}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <EventFeed
            events={events}
            onInject={injectEvent}
            onClear={() => clearAll()}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <ControlPanel nodes={nodes} onSendCommand={handleSendCommand} />
          <SchedulerPanel
            nodes={nodes}
            onSchedule={async (p) => {
              await handleSchedule(p);
              alert("Scheduled");
            }}
          />
          <SimulationControls
            rateMs={1200}
            setRateMs={(ms) => setRate(ms)}
            injectEvent={injectEvent}
            pause={() => pause()}
            start={() => start()}
          />
        </Grid>

        <Grid item xs={12}>
          <AuditTrail audit={audit} />
        </Grid>
      </Grid>
    </Box>
  );
}
