// src/hooks/useMockTelemetry.ts
import { useEffect, useRef, useState } from "react";
import { MOCK_NODES } from "../utils/mockNodes";
import type { NodeType } from "../utils/mockNodes";

export type Telemetry = {
  ts: string;
  vuf: number;
  v_a: number;
  v_b: number;
  v_c: number;
  neutral_current: number;
};

export type Alert = {
  id: string;
  ts: string;
  msg: string;
  nodeId: string;
};

type Callback = (t: Telemetry) => void;

export function useMockTelemetry() {
  const [nodes, setNodes] = useState<NodeType[]>(MOCK_NODES);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const subscribers = useRef<Map<string, Callback[]>>(new Map());

  // simulate telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => {
          const jitter = (Math.random() - 0.5) * 0.4;
          const vuf = Math.max(0, +(n.vuf + jitter).toFixed(2));
          const tele: Telemetry = {
            ts: new Date().toISOString(),
            vuf,
            v_a: 230 + Math.round(Math.random() * 4 - 2),
            v_b: 229 + Math.round(Math.random() * 4 - 2),
            v_c: 231 + Math.round(Math.random() * 4 - 2),
            neutral_current: +(5 + Math.random() * 10).toFixed(1),
          };

          // generate alerts
          if (tele.vuf > 4.0) {
            setAlerts((prev) => [
              {
                id: `${n.id}-${Date.now()}`,
                ts: tele.ts,
                nodeId: n.id,
                msg: `⚠️ High VUF (${tele.vuf}) at ${n.name}`,
              },
              ...prev,
            ]);
          }
          if (tele.neutral_current > 15) {
            setAlerts((prev) => [
              {
                id: `${n.id}-${Date.now()}-nc`,
                ts: tele.ts,
                nodeId: n.id,
                msg: `⚠️ High Neutral Current (${tele.neutral_current} A) at ${n.name}`,
              },
              ...prev,
            ]);
          }

          // notify subscribers
          const subs = subscribers.current.get(n.id) || [];
          subs.forEach((cb) => cb(tele));

          return { ...n, vuf: tele.vuf, last_telemetry: tele };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // subscribe for live telemetry
  const subscribe = (nodeId: string, cb: Callback) => {
    if (!subscribers.current.has(nodeId)) {
      subscribers.current.set(nodeId, []);
    }
    subscribers.current.get(nodeId)!.push(cb);
    return () => {
      subscribers.current.set(
        nodeId,
        (subscribers.current.get(nodeId) || []).filter((c) => c !== cb)
      );
    };
  };

  // simulate sending command
  const sendCommand = (nodeId: string, cmd: string, params?: any) => {
    console.log("Mock sendCommand", { nodeId, cmd, params });
    setAlerts((prev) => [
      {
        id: `${nodeId}-${Date.now()}-cmd`,
        ts: new Date().toISOString(),
        nodeId,
        msg: `✅ Command '${cmd}' executed on ${nodeId}`,
      },
      ...prev,
    ]);
  };

  return { nodes, alerts, subscribe, sendCommand };
}
