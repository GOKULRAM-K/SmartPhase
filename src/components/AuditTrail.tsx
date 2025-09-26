// src/components/AuditTrail.tsx
import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import type { CommandItem } from "../types/operations";
import { exportAuditCsvMock } from "../api/operationsApi";

type Props = {
  audit: CommandItem[];
};

export default function AuditTrail({ audit }: Props) {
  const doExport = async () => {
    const csv = await exportAuditCsvMock(audit);
    // create download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Button variant="outlined" onClick={doExport}>
        Export CSV
      </Button>

      <Table size="small" sx={{ mt: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Command</TableCell>
            <TableCell>Nodes</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Result</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {audit.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.id}</TableCell>
              <TableCell>{new Date(c.ts).toLocaleString()}</TableCell>
              <TableCell>{c.command}</TableCell>
              <TableCell>
                {(c.nodeIds || []).slice(0, 5).join(", ")}
                {(c.nodeIds || []).length > 5 ? "..." : ""}
              </TableCell>
              <TableCell>{c.status}</TableCell>
              <TableCell>{c.result ?? ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
