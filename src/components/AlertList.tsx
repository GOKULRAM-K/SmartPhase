// src/components/AlertList.tsx
import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DoneIcon from "@mui/icons-material/Done";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type AlertItem = {
  id: string;
  nodeId: string;
  severity: "critical" | "warn" | "info";
  summary: string;
  ts: string;
};

type Props = {
  items: AlertItem[];
  onAcknowledge?: (id: string) => void;
  maxItems?: number;
};

export default function AlertList({
  items,
  onAcknowledge,
  maxItems = 6,
}: Props) {
  const slice = items.slice(0, maxItems);
  return (
    <List dense>
      {slice.map((it) => {
        const timeAgo = dayjs(it.ts).fromNow();
        const isCritical = it.severity === "critical";
        const avatar = isCritical ? (
          <ErrorOutlineIcon />
        ) : it.severity === "warn" ? (
          <ReportProblemIcon />
        ) : (
          <ReportProblemIcon />
        );
        return (
          <ListItem
            key={it.id}
            secondaryAction={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {timeAgo}
                </Typography>
                <IconButton
                  edge="end"
                  aria-label="ack"
                  onClick={() => onAcknowledge?.(it.id)}
                  size="small"
                >
                  <DoneIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: isCritical
                    ? "#ffecec"
                    : it.severity === "warn"
                    ? "#fff8ea"
                    : "#eef7ff",
                  color: isCritical ? "#c62828" : "#b85d00",
                }}
              >
                {avatar}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                    {it.summary}
                  </Typography>
                  <Chip
                    label={it.severity.toUpperCase()}
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor: isCritical ? "#ffebeb" : "#fff8ea",
                      color: isCritical ? "#c62828" : "#b85d00",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              }
              secondary={
                <span style={{ fontSize: 12 }}>
                  {it.nodeId} • {timeAgo}
                </span>
              }
            />
          </ListItem>
        );
      })}
      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
          No alerts
        </Typography>
      )}
    </List>
  );
}
