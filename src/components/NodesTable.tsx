// src/components/NodesTable.tsx
import React, { useMemo, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";
import TablePagination from "@mui/material/TablePagination";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

import type { NodeType } from "../utils/mockNodes";

type Props = {
  nodes: NodeType[];
  onView: (id: string) => void;
  onToggleMode: (id: string, mode: "auto" | "manual") => void;
};

type Order = "asc" | "desc";
type OrderBy = keyof NodeType | "vuf";

function compareValues(a: any, b: any, order: Order) {
  if (a == null && b == null) return 0;
  if (a == null) return order === "asc" ? -1 : 1;
  if (b == null) return order === "asc" ? 1 : -1;

  if (typeof a === "number" && typeof b === "number")
    return order === "asc" ? a - b : b - a;
  return order === "asc"
    ? String(a).localeCompare(String(b))
    : String(b).localeCompare(String(a));
}

export default function NodesTable({ nodes, onView, onToggleMode }: Props) {
  const [orderBy, setOrderBy] = useState<OrderBy>("id");
  const [order, setOrder] = useState<Order>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const sorted = useMemo(() => {
    const arr = nodes.slice();
    arr.sort((a, b) => {
      const av = (a as any)[orderBy];
      const bv = (b as any)[orderBy];
      return compareValues(av, bv, order);
    });
    return arr;
  }, [nodes, orderBy, order]);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const pageRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "id" ? order : false}>
                <TableSortLabel
                  active={orderBy === "id"}
                  direction={orderBy === "id" ? order : "asc"}
                  onClick={() => handleRequestSort("id")}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Feeder</TableCell>
              <TableCell>District</TableCell>
              <TableCell sortDirection={orderBy === "vuf" ? order : false}>
                <TableSortLabel
                  active={orderBy === "vuf"}
                  direction={orderBy === "vuf" ? order : "asc"}
                  onClick={() => handleRequestSort("vuf")}
                >
                  VUF (%)
                </TableSortLabel>
              </TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pageRows.map((n) => (
              <TableRow key={n.id} hover>
                <TableCell>{n.id}</TableCell>
                <TableCell>{n.name}</TableCell>
                <TableCell>{n.feeder}</TableCell>
                <TableCell>{n.district}</TableCell>
                <TableCell>{n.vuf.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={n.mode ?? "auto"} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={n.status}
                    size="small"
                    color={
                      n.status === "critical"
                        ? "error"
                        : n.status === "degraded"
                        ? "warning"
                        : "success"
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Tooltip title="View details">
                      <IconButton size="small" onClick={() => onView(n.id)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Mode">
                      <IconButton
                        size="small"
                        onClick={() =>
                          onToggleMode(
                            n.id,
                            n.mode === "auto" ? "manual" : "auto"
                          )
                        }
                      >
                        <SwapHorizIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  No nodes match the filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 8, 12, 20]}
        component="div"
        count={nodes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
}
