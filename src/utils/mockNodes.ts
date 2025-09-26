// src/utils/mockNodes.ts
export type NodeType = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  status: "operational" | "degraded" | "critical";
  vuf: number;
  feeder: string; // required now
  district: string; // required now
  mode: "auto" | "manual"; // also always set in generator
  last_telemetry?: {
    ts: string;
    vuf: number;
    v_a: number;
    v_b: number;
    v_c: number;
    neutral_current: number;
  };
};

const CITY_CENTERS: Record<
  string,
  { lat: number; lon: number; district: string }
> = {
  Kannur: { lat: 11.8745, lon: 75.3704, district: "Kannur" },
  Kozhikode: { lat: 11.2588, lon: 75.7804, district: "Kozhikode" },
  Thrissur: { lat: 10.5276, lon: 76.2144, district: "Thrissur" },
  Kochi: { lat: 9.9312, lon: 76.2673, district: "Ernakulam" },
  Ernakulam: { lat: 9.9658, lon: 76.2413, district: "Ernakulam" },
  Alappuzha: { lat: 9.4981, lon: 76.3388, district: "Alappuzha" },
  Kollam: { lat: 8.8932, lon: 76.6141, district: "Kollam" },
  Thiruvananthapuram: {
    lat: 8.5241,
    lon: 76.9366,
    district: "Thiruvananthapuram",
  },
  Munnar: { lat: 10.0889, lon: 77.0595, district: "Idukki" },
  Guruvayur: { lat: 10.594, lon: 76.0413, district: "Thrissur" },
};

const CITY_DISTRIBUTION: [string, number][] = [
  ["Kannur", 3],
  ["Kozhikode", 2],
  ["Thrissur", 3],
  ["Kochi", 4],
  ["Ernakulam", 5],
  ["Alappuzha", 3],
  ["Kollam", 4],
  ["Thiruvananthapuram", 5],
  ["Munnar", 2],
  ["Guruvayur", 2],
];

export function genClusteredNodes(scatterDeg = 0.015): NodeType[] {
  const nodes: NodeType[] = [];
  let idx = 1;
  for (const [city, count] of CITY_DISTRIBUTION) {
    const center = CITY_CENTERS[city];
    if (!center) continue;
    for (let i = 0; i < count; i++) {
      const jitterLat = (Math.random() - 0.5) * scatterDeg;
      const jitterLon = (Math.random() - 0.5) * (scatterDeg * 1.2);
      const lat = +(center.lat + jitterLat).toFixed(5);
      const lon = +(center.lon + jitterLon).toFixed(5);
      const vuf = +(Math.random() * 4).toFixed(2);
      const status =
        vuf >= 3 ? "critical" : vuf >= 1.5 ? "degraded" : "operational";
      nodes.push({
        id: `ND-${String(idx).padStart(3, "0")}`,
        name: `${city} Node ${i + 1}`,
        lat,
        lon,
        status,
        vuf,
        feeder: `Feeder-${((idx - 1) % 8) + 1}`,
        district: center.district,
        mode: Math.random() > 0.5 ? "auto" : "manual",
        last_telemetry: {
          ts: new Date(
            Date.now() - Math.floor(Math.random() * 3600 * 1000)
          ).toISOString(),
          vuf,
          v_a: 220 + Math.round(Math.random() * 16),
          v_b: 220 + Math.round(Math.random() * 16),
          v_c: 220 + Math.round(Math.random() * 16),
          neutral_current: Math.round(Math.random() * 40),
        },
      });
      idx++;
    }
  }
  return nodes;
}

export const MOCK_NODES: NodeType[] = genClusteredNodes(0.015);
