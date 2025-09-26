// src/api/apiClient.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000",
});

// ----------- Nodes -------------
export async function getNodes() {
  const res = await api.get("/api/nodes");
  return res.data;
}

export async function getNode(nodeId: string) {
  const res = await api.get(`/api/nodes/${nodeId}`);
  return res.data;
}

export async function getTelemetry(nodeId: string) {
  const res = await api.get(`/api/nodes/${nodeId}/telemetry`);
  return res.data;
}

// ----------- Commands -------------
export async function sendCommand(payload: {
  nodeIds: string[];
  command: string;
  params?: any;
}) {
  const res = await api.post("/api/commands", payload);
  return res.data;
}

// ----------- Events -------------
export async function getEvents() {
  const res = await api.get("/api/events");
  return res.data;
}
