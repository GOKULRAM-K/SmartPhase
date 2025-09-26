// src/components/KpiCard.tsx
import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

type KpiCardProps = {
  title: string;
  value: string | number;
  delta?: number | null; // positive = up, negative = down, 0 = flat
  help?: string;
  accent?: "green" | "amber" | "red" | "blue";
};

const ACCENT_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: "#e9f7ef", text: "#08912c" },
  amber: { bg: "#fff7ed", text: "#b85d00" },
  red: { bg: "#fff4f4", text: "#c62828" },
  blue: { bg: "#eef6ff", text: "#0b57d0" },
};

export default function KpiCard({
  title,
  value,
  delta,
  help,
  accent = "blue",
}: KpiCardProps) {
  const col = ACCENT_COLORS[accent] ?? ACCENT_COLORS.blue;
  const deltaSign =
    typeof delta === "number"
      ? delta > 0
        ? "up"
        : delta < 0
        ? "down"
        : "flat"
      : null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 96,
        boxShadow: "0 6px 18px rgba(11,87,208,0.06)",
        background: "#fff",
      }}
    >
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700 }}
        >
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{ mt: 0.75, fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          {value}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
        {typeof delta === "number" ? (
          <Chip
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {delta > 0 ? (
                  <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                ) : delta < 0 ? (
                  <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                ) : (
                  <TrendingFlatIcon sx={{ fontSize: 16 }} />
                )}
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {Math.abs(delta).toFixed(2)}%
                </Typography>
              </Box>
            }
            size="small"
            sx={{
              bgcolor:
                delta > 0 ? "#eaf7ee" : delta < 0 ? "#fff4f4" : "#f3f5f7",
              color: delta > 0 ? "#007a2f" : delta < 0 ? "#b71c1c" : "#6b7280",
              fontWeight: 700,
            }}
          />
        ) : null}

        {help ? (
          <Tooltip title={help}>
            <Chip
              label="info"
              size="small"
              sx={{ bgcolor: col.bg, color: col.text, fontWeight: 700 }}
            />
          </Tooltip>
        ) : null}
      </Box>
    </Paper>
  );
}
