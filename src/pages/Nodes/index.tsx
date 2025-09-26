// src/pages/Nodes/index.tsx
import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import NodeFilters from "../../components/NodeFilters";
import NodesTable from "../../components/NodesTable";
import NodeDrawer from "../../components/NodeDrawer";
import { MOCK_NODES } from "../../utils/mockNodes"; // runtime import
import type { NodeType } from "../../utils/mockNodes"; // TYPE-ONLY import (important)

export default function NodesPage() {
  // use shared mock nodes (fresh copy to avoid mutation)
  const [nodes, setNodes] = useState<NodeType[]>(() => MOCK_NODES.slice());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // filter state (lifted to page)
  const [district, setDistrict] = useState<string | null>(null);
  const [mode, setMode] = useState<"all" | "auto" | "manual">("all");
  const [vufThreshold, setVufThreshold] = useState<number>(0);
  const [searchQ, setSearchQ] = useState<string>("");

  const districts = useMemo(() => {
    const vals = nodes.map((n) => n.district);
    return Array.from(new Set(vals.filter((d): d is string => !!d)));
  }, [nodes]);

  const filtered = useMemo(() => {
    return nodes.filter((n) => {
      if (district && n.district !== district) return false;
      if (mode !== "all" && n.mode !== mode) return false;
      if (n.vuf < vufThreshold) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (
          !n.id.toLowerCase().includes(q) &&
          !(n.name || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [nodes, district, mode, vufThreshold, searchQ]);

  const handleView = (id: string) => {
    setSelectedNodeId(id);
    setDrawerOpen(true);
  };

  const handleToggleMode = (id: string, newMode: "auto" | "manual") => {
    // update local mock immutably so React re-renders
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, mode: newMode } : n))
    );
    setSelectedNodeId(id);
    setDrawerOpen(true);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Nodes</Typography>
        <Typography variant="body2" color="text.secondary">
          Search, filter and operate on transformer nodes.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <NodeFilters
            districts={districts}
            district={district}
            onDistrictChange={setDistrict}
            mode={mode}
            onModeChange={setMode}
            vufThreshold={vufThreshold}
            onVufChange={setVufThreshold}
            searchQ={searchQ}
            onSearch={setSearchQ}
          />
        </Box>
      </Paper>

      <NodesTable
        nodes={filtered}
        onView={handleView}
        onToggleMode={(id, m) => handleToggleMode(id, m)}
      />

      <NodeDrawer
        open={drawerOpen}
        node={selectedNode as any}
        onClose={() => setDrawerOpen(false)}
        onApplyBalance={async (id) => alert(`Mock balance ${id}`)}
        onToggleMode={async (id, mode) => alert(`Mock set ${id} -> ${mode}`)}
        busy={false}
      />
    </Box>
  );
}
