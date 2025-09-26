// src/pages/Insights/index.tsx
import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { MOCK_NODES } from "../../utils/mockNodes";

type TimeWindow = "1h" | "3h" | "6h";

const COLORS = [
  "#0B57D0",
  "#08912c",
  "#F59E0B",
  "#E11D48",
  "#7C3AED",
  "#06B6D4",
  "#F97316",
];

function makeTimeseries(avgBase: number, minutes: number, step = 5) {
  const points: { ts: string; vuf: number }[] = [];
  const now = Date.now();
  for (let t = minutes; t >= 0; t -= step) {
    const time = new Date(now - t * 60 * 1000);
    const hh = time.getHours().toString().padStart(2, "0");
    const mm = time.getMinutes().toString().padStart(2, "0");
    const jitter = (Math.random() - 0.5) * 0.6;
    const v = Math.max(0, +(avgBase + jitter).toFixed(2));
    points.push({ ts: `${hh}:${mm}`, vuf: v });
  }
  return points;
}

function bucketVuf(v: number) {
  if (v < 0.5) return "<0.5";
  if (v < 1.0) return "0.5-1.0";
  if (v < 1.5) return "1.0-1.5";
  if (v < 2.5) return "1.5-2.5";
  if (v < 3.5) return "2.5-3.5";
  return ">=3.5";
}

const InsightsPage: React.FC = () => {
  const districts = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_NODES.map((n) => n.district).filter((d): d is string =>
            Boolean(d)
          )
        )
      ),
    []
  );
  const [districtFilter, setDistrictFilter] = useState<string | "all">("all");
  const [modeFilter, setModeFilter] = useState<"all" | "auto" | "manual">(
    "all"
  );
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("1h");
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredNodes = useMemo(() => {
    return MOCK_NODES.filter((n) => {
      if (districtFilter !== "all" && n.district !== districtFilter)
        return false;
      if (modeFilter !== "all" && n.mode !== modeFilter) return false;
      return true;
    });
  }, [districtFilter, modeFilter]);

  const kpis = useMemo(() => {
    const avgVuf =
      filteredNodes.length > 0
        ? +(
            filteredNodes.reduce(
              (a, b) => a + (b.last_telemetry?.vuf ?? b.vuf ?? 0),
              0
            ) / filteredNodes.length
          ).toFixed(2)
        : 0;
    const critical = filteredNodes.filter(
      (n) => (n.last_telemetry?.vuf ?? n.vuf) >= 3
    ).length;
    const avgNeutral =
      filteredNodes.length > 0
        ? +(
            filteredNodes.reduce(
              (a, b) => a + (b.last_telemetry?.neutral_current ?? 0),
              0
            ) / filteredNodes.length
          ).toFixed(1)
        : 0;
    return { avgVuf, critical, avgNeutral, nodes: filteredNodes.length };
  }, [filteredNodes]);

  const minutes = timeWindow === "1h" ? 60 : timeWindow === "3h" ? 180 : 360;
  const tsData = useMemo(() => {
    const base = kpis.avgVuf || 1.2;
    return makeTimeseries(base, minutes, 5);
  }, [kpis.avgVuf, minutes, refreshKey]);

  const vufBuckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of filteredNodes) {
      const v = n.last_telemetry?.vuf ?? n.vuf;
      const k = bucketVuf(v);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    const order = ["<0.5", "0.5-1.0", "1.0-1.5", "1.5-2.5", "2.5-3.5", ">=3.5"];
    return order.map((k, i) => ({
      name: k,
      value: map.get(k) ?? 0,
      color: COLORS[i % COLORS.length],
    }));
  }, [filteredNodes]);

  const alertsByDistrict = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of filteredNodes) {
      const v = n.last_telemetry?.vuf ?? n.vuf;
      if (v >= 2.0) {
        map.set(
          n.district ?? "Unknown",
          (map.get(n.district ?? "Unknown") ?? 0) + 1
        );
      }
    }
    return Array.from(map.entries()).map(([k, v], idx) => ({
      name: k,
      value: v,
      color: COLORS[idx % COLORS.length],
    }));
  }, [filteredNodes]);

  const topNodes = useMemo(() => {
    return filteredNodes
      .slice()
      .sort(
        (a, b) =>
          (b.last_telemetry?.vuf ?? b.vuf) - (a.last_telemetry?.vuf ?? a.vuf)
      )
      .slice(0, 10);
  }, [filteredNodes]);

  const fmt2 = (v: number | string | undefined | null) =>
    typeof v === "number" ? v.toFixed(2) : String(v ?? "-");

  const chartHeight = { xs: 240, md: 360 };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Insights & Analytics
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>District</InputLabel>
              <Select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                {districts.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mode</InputLabel>
              <Select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Window</InputLabel>
              <Select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
              >
                <MenuItem value="1h">1 hour</MenuItem>
                <MenuItem value="3h">3 hours</MenuItem>
                <MenuItem value="6h">6 hours</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh simulated data">
              <IconButton onClick={() => setRefreshKey((k) => k + 1)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export CSV
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Row 1 */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            KPIs
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {fmt2(kpis.avgVuf)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Avg VUF
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box>
              <Typography
                variant="h6"
                color={kpis.critical > 0 ? "error.main" : "text.primary"}
              >
                {kpis.critical}
              </Typography>
              <Typography variant="caption">Critical</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{fmt2(kpis.avgNeutral)} A</Typography>
              <Typography variant="caption">Avg Neutral</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{kpis.nodes}</Typography>
              <Typography variant="caption">Nodes</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, flex: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Avg VUF (time series)
          </Typography>
          <Box sx={{ mt: 1, width: "100%", height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ts" />
                <YAxis />
                <RTooltip />
                <Line
                  dataKey="vuf"
                  stroke="#0B57D0"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Stack>

      {/* Row 2 */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            VUF Distribution
          </Typography>
          <Box sx={{ mt: 1, width: "100%", height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vufBuckets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="value">
                  {vufBuckets.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Alerts by District
          </Typography>
          <Box sx={{ mt: 1, width: "100%", height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertsByDistrict}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={80}
                  label
                >
                  {alertsByDistrict.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Legend />
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Stack>

      {/* Row 3: full table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Top nodes by VUF
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Feeder</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell align="right">VUF (%)</TableCell>
              <TableCell align="right">Neutral (A)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topNodes.map((n) => (
              <TableRow key={n.id}>
                <TableCell>{n.id}</TableCell>
                <TableCell>{n.name}</TableCell>
                <TableCell>{n.district}</TableCell>
                <TableCell>{n.feeder}</TableCell>
                <TableCell>{n.mode}</TableCell>
                <TableCell align="right">
                  {(n.last_telemetry?.vuf ?? n.vuf).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {n.last_telemetry?.neutral_current ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default InsightsPage;
