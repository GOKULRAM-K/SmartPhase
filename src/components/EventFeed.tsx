// src/components/EventFeed.tsx
import React, { useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import type { EventItem } from "../types/operations";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type Props = {
  events: EventItem[];
  onInject?: (ev: EventItem) => void;
  onClear?: () => void;
  autoScroll?: boolean;
  setAutoScroll?: (v: boolean) => void;
};

export default function EventFeed({
  events,
  onInject,
  onClear,
  autoScroll = true,
  setAutoScroll,
}: Props) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (severityFilter !== "all" && e.severity !== severityFilter)
        return false;
      if (
        q &&
        !`${e.summary} ${e.nodeId ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase())
      )
        return false;
      return true;
    });
  }, [events, typeFilter, severityFilter, q]);

  return (
    <Paper
      sx={{ p: 1, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
        <TextField
          size="small"
          placeholder="Search events..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          select
          size="small"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ width: 160 }}
        >
          <MenuItem value="all">All types</MenuItem>
          <MenuItem value="telemetry">Telemetry</MenuItem>
          <MenuItem value="alert">Alert</MenuItem>
          <MenuItem value="manual-command">Manual</MenuItem>
          <MenuItem value="system">System</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          sx={{ width: 120 }}
        >
          <MenuItem value="all">All severities</MenuItem>
          <MenuItem value="info">Info</MenuItem>
          <MenuItem value="warn">Warn</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
        </TextField>

        <IconButton
          size="small"
          onClick={() => {
            setQ("");
            setTypeFilter("all");
            setSeverityFilter("all");
          }}
        >
          <ClearIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List dense>
          {filtered.map((e) => (
            <ListItem
              key={e.id}
              sx={{ py: 0.75, borderBottom: "1px solid rgba(0,0,0,0.04)" }}
            >
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {e.summary}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {e.nodeId ? `${e.nodeId} • ` : ""}
                        {dayjs(e.ts).fromNow()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      {e.severity ? (
                        <Chip
                          label={e.severity}
                          size="small"
                          color={
                            e.severity === "critical"
                              ? "error"
                              : e.severity === "warn"
                              ? "warning"
                              : "default"
                          }
                        />
                      ) : null}
                      <Chip label={e.type} size="small" />
                    </Box>
                  </Box>
                }
                secondary={e.details ? JSON.stringify(e.details) : null}
              />
            </ListItem>
          ))}
          {filtered.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No events
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      <Divider />
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Chip label={`Showing ${filtered.length}`} size="small" />
        <Box sx={{ flex: 1 }} />
        <IconButton size="small" onClick={() => onClear?.()}>
          <ClearIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
