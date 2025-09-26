// src/pages/Home/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// react-leaflet
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";

// MUI
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";

// icons
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

// utils
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// local components (ensure these exist)
import KpiCard from "../../components/KpiCard";
import AlertList from "../../components/AlertList";
import MapMarker from "../../components/MapMarker";
import type { NodeShort } from "../../components/MapMarker";
import NodeDrawer from "../../components/NodeDrawer";
import MapToolBar from "../../components/MapToolBar";
import ClusterLayer from "../../components/ClusterLayer";
import RecentEvents from "../../components/RecentEvents"; // paste this file if missing
import { SAMPLE_FEEDERS } from "../../utils/geo";

// runtime leaflet plugins (side-effect)
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.heat";

/* ---------------- Types ---------------- */
type NodeType = {
  id: string;
  name?: string;
  lat: number;
  lon: number;
  status: "operational" | "degraded" | "critical";
  vuf: number;
  feeder?: string;
  district?: string;
  mode?: "auto" | "manual";
  last_telemetry?: {
    ts: string;
    vuf: number;
    v_a: number;
    v_b: number;
    v_c: number;
    neutral_current: number;
  };
};

type EventItem = {
  id: string;
  nodeId?: string;
  type: "auto-balance" | "manual-command" | "alert" | "info";
  summary: string;
  ts: string;
};

/* ---------------- Mock nodes (clustered by city) ---------------- */
const CITY_CENTERS: Record<
  string,
  { lat: number; lon: number; district?: string }
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

function genClusteredNodes(scatterDeg = 0.015) {
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

const MOCK_NODES: NodeType[] = genClusteredNodes(0.015);

const MOCK_ALERTS = [
  {
    id: "AL-01",
    nodeId: MOCK_NODES[4].id,
    severity: "critical",
    summary: "High VUF spike",
    ts: new Date().toISOString(),
  },
  {
    id: "AL-02",
    nodeId: MOCK_NODES[12].id,
    severity: "warn",
    summary: "Neutral current rising",
    ts: new Date().toISOString(),
  },
];

/* ---------------- HeatLayer (leaflet.heat) ---------------- */
function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || points.length === 0) return;
    // @ts-ignore
    const heat = (L as any)
      .heatLayer(points, { radius: 25, blur: 30, maxZoom: 17 })
      .addTo(map);
    return () => {
      try {
        if (map && heat && map.hasLayer && map.hasLayer(heat))
          map.removeLayer(heat);
      } catch (e) {}
    };
  }, [map, points]);
  return null;
}

/* ---------------- Home component ---------------- */
export default function Home() {
  // map ref + bounds
  const mapRef = useRef<L.Map | null>(null);
  const keralaBounds = L.latLngBounds(
    L.latLng(7.7, 74.0),
    L.latLng(12.5, 78.2)
  );

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busyNode, setBusyNode] = useState<string | null>(null);

  // toolbar state
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<"all" | "auto" | "manual">(
    "all"
  );
  const [vufThreshold, setVufThreshold] = useState<number>(0);
  const [searchQ, setSearchQ] = useState<string>("");

  // map toggles
  const [showClusters, setShowClusters] = useState(true);
  const [showHeat, setShowHeat] = useState(false);
  const [heatPoints, setHeatPoints] = useState<[number, number, number][]>([]);
  const [pulseNode, setPulseNode] = useState<string | null>(null);
  const pulseTimerRef = useRef<number | null>(null);

  // events (feed)
  const [events, setEvents] = useState<EventItem[]>(
    MOCK_ALERTS.map((a, i) => ({
      id: `EV-${i + 1}`,
      nodeId: a.nodeId,
      type: a.severity === "critical" ? "alert" : "info",
      summary: a.summary,
      ts: a.ts,
    }))
  );

  // districts (type-safe)
  const districts: string[] = useMemo(() => {
    const vals = MOCK_NODES.map((n) => n.district);
    const onlyStrings = vals.filter(
      (d): d is string => typeof d === "string" && d.trim().length > 0
    );
    return Array.from(new Set(onlyStrings));
  }, []);

  // filtered nodes
  const filtered = useMemo(() => {
    return MOCK_NODES.filter((n) => {
      if (selectedDistrict && n.district !== selectedDistrict) return false;
      if (modeFilter !== "all" && n.mode !== modeFilter) return false;
      if (n.vuf < vufThreshold) return false;
      if (
        searchQ &&
        !n.id.toLowerCase().includes(searchQ.toLowerCase()) &&
        !(n.name || "").toLowerCase().includes(searchQ.toLowerCase())
      )
        return false;
      return true;
    });
  }, [selectedDistrict, modeFilter, vufThreshold, searchQ]);

  // heat points computation
  useEffect(() => {
    if (showHeat)
      setHeatPoints(
        filtered.map((n) => [n.lat, n.lon, Math.min(1, n.vuf / 5)])
      );
    else setHeatPoints([]);
  }, [showHeat, filtered]);

  // fit map to filtered nodes once mapRef is ready or filtered changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || filtered.length === 0) return;
    try {
      const latLngs = filtered.map((n) => [n.lat, n.lon] as [number, number]);
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds.pad(0.15), { maxZoom: 12 });
    } catch (e) {}
  }, [filtered]);

  // ensure map max bounds when mapRef becomes available
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    try {
      map.setMaxBounds(keralaBounds);
      // @ts-ignore - sometimes options are readonly in types
      map.options.maxBoundsViscosity = 0.7;
    } catch (e) {}
  }, [mapRef.current]);

  // KPI helpers
  function makeSparkline(base: number, points = 12, jitter = 0.25) {
    const arr: number[] = [];
    let val = base;
    for (let i = 0; i < points; i++) {
      val = Math.max(0, +(val + (Math.random() - 0.5) * jitter).toFixed(2));
      arr.push(val);
    }
    return arr;
  }

  const kpis = useMemo(() => {
    const total = MOCK_NODES.length;
    const avgVuf = total
      ? +(MOCK_NODES.reduce((s, n) => s + n.vuf, 0) / total).toFixed(2)
      : 0;
    const critical = MOCK_ALERTS.filter(
      (a: any) => a.severity === "critical"
    ).length;
    const online = total;
    const prevAvgVuf = Math.max(0, +(avgVuf - Math.random() * 0.3).toFixed(2));
    const deltaAvg = +(avgVuf - prevAvgVuf).toFixed(2);
    return {
      total,
      online,
      critical,
      avgVuf,
      deltaAvg,
      sparkVuf: makeSparkline(avgVuf, 14, 0.2),
      sparkOnline: makeSparkline(online, 14, 0.6).map((v) => Math.round(v)),
      sparkCritical: makeSparkline(critical, 14, 0.6).map((v) =>
        Math.max(0, Math.round(v))
      ),
    };
  }, [MOCK_NODES, MOCK_ALERTS]);

  // actions
  const handleViewDetails = (id: string) => {
    setSelectedNodeId(id);
    setDrawerOpen(true);
  };
  const handleQuickBalance = async (id: string) => {
    setBusyNode(id);
    await new Promise((r) => setTimeout(r, 900));
    setBusyNode(null);
    setPulseNode(id);
    if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = window.setTimeout(() => setPulseNode(null), 2200);

    const newEvent: EventItem = {
      id: `EV-${Date.now()}`, // unique id
      nodeId: id,
      type: "manual-command",
      summary: `Quick balance triggered for ${id}`,
      ts: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev].slice(0, 200));
  };

  const handleToggleMode = async (id: string, mode: "auto" | "manual") => {
    setBusyNode(id);
    await new Promise((r) => setTimeout(r, 700));
    setBusyNode(null);

    const newEvent: EventItem = {
      id: `EV-${Date.now()}`,
      nodeId: id,
      type: "manual-command",
      summary: `Mode switched ${id} → ${mode}`,
      ts: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev].slice(0, 200));
  };

  const selectedNode = MOCK_NODES.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <Box sx={{ width: "100%" }}>
      <MapToolBar
        districts={districts}
        selectedDistrict={selectedDistrict}
        onDistrictChange={setSelectedDistrict}
        modeFilter={modeFilter}
        onModeChange={setModeFilter}
        vufThreshold={vufThreshold}
        onVufChange={setVufThreshold}
        onSearch={setSearchQ}
        showClusters={showClusters}
        setShowClusters={setShowClusters}
        showHeat={showHeat}
        setShowHeat={setShowHeat}
      />

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Map area */}
        <Box
          component={Paper}
          sx={{
            flex: { xs: "1 1 auto", md: "0 1 65%" },
            p: 2,
            height: { xs: "auto", md: 520 },
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            System Map
          </Typography>

          <Box
            sx={{
              height: { xs: 360, md: 440 },
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <MapContainer
              center={[10.0, 76.5]}
              zoom={7}
              style={{ height: "100%", borderRadius: 8 }}
              ref={mapRef as any}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <GeoJSON
                data={SAMPLE_FEEDERS as any}
                style={() => ({
                  color: "#0B57D0",
                  weight: 1,
                  fillOpacity: 0.05,
                })}
                onEachFeature={(feature, layer) => {
                  const name = feature.properties?.name || "Feeder";
                  layer.on("click", () => {
                    setSelectedDistrict(null);
                    alert(`Clicked feeder: ${name} (demo)`);
                  });
                }}
              />

              {showHeat && <HeatLayer points={heatPoints} />}

              {showClusters ? (
                <ClusterLayer
                  nodes={filtered as any}
                  onViewDetails={handleViewDetails}
                  onQuickBalance={handleQuickBalance}
                  highlightIds={
                    searchQ
                      ? filtered
                          .filter((n) =>
                            n.id.toLowerCase().includes(searchQ.toLowerCase())
                          )
                          .map((n) => n.id)
                      : []
                  }
                  pulseId={pulseNode}
                />
              ) : (
                filtered.map((n) => (
                  <MapMarker
                    key={n.id}
                    node={n as NodeShort}
                    onViewDetails={handleViewDetails}
                    onQuickBalance={handleQuickBalance}
                    highlight={
                      !!searchQ &&
                      n.id.toLowerCase().includes(searchQ.toLowerCase())
                    }
                    pulse={pulseNode === n.id}
                  />
                ))
              )}
            </MapContainer>
          </Box>
        </Box>

        {/* Right column: KPIs, Alerts, Recent Actions */}
        <Box
          sx={{
            flex: { xs: "1 1 auto", md: "0 1 32%" },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* KPI grid: 2 columns on md+, 2 columns stacked on small screens */}
          {/* KPI grid: 2 columns on md+, stacked on xs */}
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box
              className="kpi-grid"
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr" },
                alignItems: "stretch",
              }}
            >
              <Box sx={{ minWidth: 140 }}>
                <KpiCard
                  title="Total Nodes"
                  value={kpis.total}
                  accent="blue"
                  help="Total transformer nodes onboarded"
                />
              </Box>

              <Box sx={{ minWidth: 140 }}>
                <KpiCard
                  title="Avg VUF (5m)"
                  value={`${kpis.avgVuf}%`}
                  delta={kpis.deltaAvg}
                  accent={
                    kpis.avgVuf >= 3
                      ? "red"
                      : kpis.avgVuf >= 1.5
                      ? "amber"
                      : "green"
                  }
                  help="Average Voltage Unbalance Factor across nodes (last 5 minutes)"
                />
              </Box>

              <Box sx={{ minWidth: 140 }}>
                <KpiCard
                  title="Online"
                  value={kpis.online}
                  accent="green"
                  help="Nodes reporting telemetry in the recent window"
                />
              </Box>

              <Box sx={{ minWidth: 140 }}>
                <KpiCard
                  title="Critical Alerts"
                  value={kpis.critical}
                  accent="red"
                  help="Active critical alerts"
                />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1">Top Alerts</Typography>
            <AlertList
              items={MOCK_ALERTS as any}
              onAcknowledge={(id) => console.log("ack", id)}
            />
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recent Actions
            </Typography>
            <List dense>
              {[
                {
                  id: "ra1",
                  nodeId: "ND-005",
                  type: "auto-balance",
                  ts: new Date(Date.now() - 5 * 60 * 1000),
                },
                {
                  id: "ra2",
                  nodeId: "ND-012",
                  type: "manual",
                  ts: new Date(Date.now() - 20 * 60 * 1000),
                },
                {
                  id: "ra3",
                  nodeId: "ND-021",
                  type: "manual",
                  ts: new Date(Date.now() - 45 * 60 * 1000),
                },
              ].map((act) => (
                <ListItem key={act.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          act.type === "auto-balance" ? "#e9f7ef" : "#eef6ff",
                        color:
                          act.type === "auto-balance" ? "#007a2f" : "#0b57d0",
                        width: 28,
                        height: 28,
                      }}
                    >
                      {act.type === "auto-balance" ? "A" : "M"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {act.type === "auto-balance"
                          ? "Auto-balance"
                          : "Manual balance"}{" "}
                        applied to {act.nodeId}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(act.ts).fromNow()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Recent events full panel */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Events
          </Typography>
          <RecentEvents items={events} onClear={() => setEvents([])} />
        </Paper>
      </Box>

      {/* Node drawer */}
      <NodeDrawer
        open={drawerOpen}
        node={selectedNode as any}
        onClose={() => setDrawerOpen(false)}
        onApplyBalance={async (id) => handleQuickBalance(id)}
        onToggleMode={async (id, mode) => handleToggleMode(id, mode)}
        busy={busyNode !== null}
      />
    </Box>
  );
}
