// src/components/NodeFilters.tsx
import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

type Props = {
  districts: string[];
  district: string | null;
  onDistrictChange: (d: string | null) => void;
  mode: "all" | "auto" | "manual";
  onModeChange: (m: "all" | "auto" | "manual") => void;
  vufThreshold: number;
  onVufChange: (v: number) => void;
  searchQ: string;
  onSearch: (q: string) => void;
};

export default function NodeFilters({
  districts,
  district,
  onDistrictChange,
  mode,
  onModeChange,
  vufThreshold,
  onVufChange,
  searchQ,
  onSearch,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
        mb: 2,
      }}
    >
      <TextField
        size="small"
        placeholder="Search ID or name..."
        value={searchQ}
        onChange={(e) => onSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 220 }}
      />

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          displayEmpty
          value={district ?? ""}
          onChange={(e) =>
            onDistrictChange(e.target.value ? String(e.target.value) : null)
          }
          renderValue={(v) => (v ? String(v) : "All districts")}
        >
          <MenuItem value="">All districts</MenuItem>
          {districts.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={mode}
          onChange={(e) => onModeChange(e.target.value as any)}
        >
          <MenuItem value="all">All modes</MenuItem>
          <MenuItem value="auto">Auto</MenuItem>
          <MenuItem value="manual">Manual</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ width: 220, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption">VUF ≥</Typography>
        <Slider
          value={vufThreshold}
          onChange={(_, v) => onVufChange(Array.isArray(v) ? v[0] : v)}
          min={0}
          max={5}
          step={0.1}
          size="small"
          sx={{ flex: 1 }}
        />
        <Typography variant="caption" sx={{ minWidth: 40 }}>
          {vufThreshold.toFixed(1)}
        </Typography>
      </Box>
    </Box>
  );
}
