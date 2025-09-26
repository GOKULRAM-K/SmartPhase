// src/components/MapToolbar.tsx
import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

// type-only import to satisfy verbatimModuleSyntax-safe TS configs
import type { SelectChangeEvent } from "@mui/material/Select";

type Props = {
  districts: string[];
  selectedDistrict?: string | null;
  onDistrictChange: (v: string | null) => void;
  modeFilter: "all" | "auto" | "manual";
  onModeChange: (m: "all" | "auto" | "manual") => void;
  vufThreshold: number;
  onVufChange: (v: number) => void;
  onSearch: (q: string) => void;
  showClusters: boolean;
  setShowClusters: (b: boolean) => void;
  showHeat: boolean;
  setShowHeat: (b: boolean) => void;
};

export default function MapToolbar({
  districts,
  selectedDistrict,
  onDistrictChange,
  modeFilter,
  onModeChange,
  vufThreshold,
  onVufChange,
  onSearch,
  showClusters,
  setShowClusters,
  showHeat,
  setShowHeat,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        mb: 2,
        flexWrap: "wrap",
      }}
    >
      <TextField
        size="small"
        placeholder="Search node ID..."
        onChange={(e) => onSearch(e.target.value)}
        sx={{ minWidth: 220 }}
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>District</InputLabel>
        <Select
          value={selectedDistrict ?? ""}
          label="District"
          onChange={(e: SelectChangeEvent) =>
            onDistrictChange(e.target.value ? e.target.value : null)
          }
        >
          <MenuItem value="">All</MenuItem>
          {districts.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ToggleButtonGroup
        value={modeFilter}
        exclusive
        onChange={(_, v) => v && onModeChange(v as any)}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="auto">Auto</ToggleButton>
        <ToggleButton value="manual">Manual</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ width: 200, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption">VUF ≥</Typography>
        <Slider
          value={vufThreshold}
          onChange={(_, v) => onVufChange(v as number)}
          valueLabelDisplay="auto"
          min={0}
          max={10}
          step={0.1}
          sx={{ width: 120 }}
        />
      </Box>

      <Chip label="Legend: " />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Box
          sx={{
            width: 14,
            height: 14,
            bgcolor: "#2ecc71",
            borderRadius: "50%",
            border: "2px solid #fff",
          }}
        />
        <Typography variant="caption">Operational</Typography>
        <Box
          sx={{
            width: 14,
            height: 14,
            bgcolor: "#ff9f43",
            borderRadius: "50%",
            border: "2px solid #fff",
            ml: 1,
          }}
        />
        <Typography variant="caption">Degraded</Typography>
        <Box
          sx={{
            width: 14,
            height: 14,
            bgcolor: "#ff3b30",
            borderRadius: "50%",
            border: "2px solid #fff",
            ml: 1,
          }}
        />
        <Typography variant="caption">Critical</Typography>
      </Box>

      <Button
        variant={showClusters ? "contained" : "outlined"}
        size="small"
        onClick={() => setShowClusters(!showClusters)}
      >
        Clusters
      </Button>
      <Button
        variant={showHeat ? "contained" : "outlined"}
        size="small"
        onClick={() => setShowHeat(!showHeat)}
      >
        Heatmap
      </Button>
    </Box>
  );
}
