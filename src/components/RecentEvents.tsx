// src/components/RecentEvents.tsx
import React, { useEffect, useRef, useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type EventItem = {
  id: string;
  nodeId?: string;
  type: "auto-balance" | "manual-command" | "alert" | "info";
  summary: string;
  ts: string;
};

type Props = {
  items: EventItem[];
  onClear?: () => void;
};

export default function RecentEvents({ items, onClear }: Props) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // auto scroll to bottom when items change
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [items]);

  const filtered = items.filter((it) => {
    if (typeFilter !== "all" && it.type !== typeFilter) return false;
    if (
      q &&
      !(
        it.summary.toLowerCase().includes(q.toLowerCase()) ||
        (it.nodeId || "").toLowerCase().includes(q.toLowerCase())
      )
    )
      return false;
    return true;
  });

  return (
    <Paper
      sx={{
        p: 1,
        borderRadius: 2,
        height: 260,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
        <InputBase
          placeholder="Search events or node..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ ml: 1, flex: 1 }}
          startAdornment={<SearchIcon sx={{ mr: 1 }} />}
        />
        {q && (
          <IconButton size="small" onClick={() => setQ("")}>
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Box>
          <Typography variant="caption" color="text.secondary">
            Filter
          </Typography>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              padding: "4px 8px",
            }}
          >
            <option value="all">All</option>
            <option value="auto-balance">Auto-balance</option>
            <option value="manual-command">Manual</option>
            <option value="alert">Alert</option>
            <option value="info">Info</option>
          </select>
        </Box>
      </Box>

      <Box ref={listRef} sx={{ overflowY: "auto", flex: 1 }}>
        <List dense>
          {filtered.map((ev) => (
            <ListItem
              key={ev.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                  {ev.summary}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(ev.ts).fromNow()}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {ev.nodeId ? `Node: ${ev.nodeId}` : ev.type}
              </Typography>
            </ListItem>
          ))}
          {filtered.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              No events
            </Typography>
          )}
        </List>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Live events (real-time)
        </Typography>
        <Box>
          <IconButton size="small" onClick={() => onClear?.()}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
