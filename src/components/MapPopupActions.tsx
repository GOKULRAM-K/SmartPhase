// src/components/MapPopupActions.tsx
import React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

type Props = {
  nodeId: string;
  onViewDetails: (id: string) => void;
  onQuickBalance: (id: string) => void;
};

export default function MapPopupActions({
  nodeId,
  onViewDetails,
  onQuickBalance,
}: Props) {
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
      <Button
        size="small"
        variant="outlined"
        onClick={() => onViewDetails(nodeId)}
      >
        View Details
      </Button>
      <Button
        size="small"
        variant="contained"
        color="secondary"
        onClick={() => onQuickBalance(nodeId)}
      >
        Quick Balance
      </Button>
    </Stack>
  );
}
