// src/hooks/useEventFeed.ts
import { useEffect, useRef, useState } from "react";
import type { EventItem } from "../types/operations";

/**
 * Simple mock event feed hook.
 *
 * Usage:
 * const { events, running, start, pause, injectEvent, setRate } = useEventFeed({ rateMs: 1200 });
 *
 * - events: EventItem[] (latest first)
 * - running: boolean
 * - start(): start automatic generation
 * - pause(): pause generation
 * - injectEvent(e): push a custom event immediately
 * - setRate(ms): change generation rate
 */
export function makeId(prefix = "E") {
  return `${prefix}-${Math.floor(Math.random() * 900000 + 100000)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function useEventFeed(initialRateMs = 1200, maxEvents = 1000) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [running, setRunning] = useState<boolean>(true);
  const rateRef = useRef<number>(initialRateMs);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // bootstrap with a couple of sample events
    const sample: EventItem[] = [
      {
        id: makeId("EV"),
        ts: nowIso(),
        type: "telemetry",
        nodeId: "ND-001",
        severity: "info",
        summary: "Telemetry: VUF 0.9%",
        details: { vuf: 0.9 },
      },
      {
        id: makeId("EV"),
        ts: nowIso(),
        type: "alert",
        nodeId: "ND-005",
        severity: "critical",
        summary: "High VUF detected",
        details: { vuf: 3.6 },
      },
    ];
    setEvents(sample);
  }, []);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // start interval
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      const e = generateRandomEvent();
      setEvents((prev) => {
        const next = [e, ...prev].slice(0, maxEvents);
        return next;
      });
    }, rateRef.current);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function setRate(ms: number) {
    rateRef.current = ms;
    if (running) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        const e = generateRandomEvent();
        setEvents((prev) => [e, ...prev].slice(0, maxEvents));
      }, rateRef.current);
    }
  }

  function pause() {
    setRunning(false);
  }

  function start() {
    setRunning(true);
  }

  function injectEvent(ev: EventItem) {
    const e = { ...ev, id: ev.id ?? makeId("EV"), ts: ev.ts ?? nowIso() };
    setEvents((prev) => [e, ...prev].slice(0, maxEvents));
  }

  function clearAll() {
    setEvents([]);
  }

  function generateRandomEvent(): EventItem {
    // small synthetic generator — realistic enough for demo
    const nodeSample = [
      "ND-005",
      "ND-012",
      "ND-021",
      "ND-033",
      "ND-004",
      "ND-017",
    ];
    const types: EventItem["type"][] = [
      "telemetry",
      "telemetry",
      "telemetry",
      "alert",
      "manual-command",
      "system",
    ];
    const type = randomFrom(types);
    let severity: EventItem["severity"] | undefined = undefined;
    let summary = "Telemetry update";

    if (type === "telemetry") {
      const vuf = +(Math.random() * 4).toFixed(2);
      severity = vuf >= 3 ? "critical" : vuf >= 1.5 ? "warn" : "info";
      summary = `Telemetry: VUF ${vuf}%`;
      return {
        id: makeId("EV"),
        ts: nowIso(),
        type,
        nodeId: randomFrom(nodeSample),
        severity,
        summary,
        details: { vuf },
      };
    } else if (type === "alert") {
      severity = randomFrom<EventItem["severity"]>(["warn", "critical"]);
      summary =
        severity === "critical"
          ? "High VUF detected"
          : "Neutral current rising";
      return {
        id: makeId("EV"),
        ts: nowIso(),
        type,
        nodeId: randomFrom(nodeSample),
        severity,
        summary,
        details: { note: "simulated alert" },
      };
    } else if (type === "manual-command") {
      summary = "Manual Quick Balance executed";
      return {
        id: makeId("EV"),
        ts: nowIso(),
        type,
        nodeId: randomFrom(nodeSample),
        severity: "info",
        summary,
        details: { result: "ok" },
      };
    } else {
      // system
      return {
        id: makeId("EV"),
        ts: nowIso(),
        type: "system",
        severity: "info",
        summary: randomFrom([
          "Heartbeat",
          "Scheduler ran pending jobs",
          "Sim injected event",
        ]),
      };
    }
  }

  return {
    events,
    running,
    start,
    pause,
    injectEvent,
    clearAll,
    setRate,
  };
}
