// src/components/MapMarker.tsx
import React, { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import MapPopupActions from "./MapPopupActions";
import StatusBadge from "./StatusBadge";

export type NodeShort = {
  id: string;
  name?: string;
  lat: number;
  lon: number;
  status: "operational" | "degraded" | "critical" | string;
  vuf: number;
};

type Props = {
  node: NodeShort;
  onViewDetails: (id: string) => void;
  onQuickBalance: (id: string) => void;
  highlight?: boolean;
  pulse?: boolean;
};

export default function MapMarker({
  node,
  onViewDetails,
  onQuickBalance,
  highlight,
  pulse,
}: Props) {
  // inside MapMarker component - replace the icon useMemo with this version
  const icon = useMemo(() => {
    const color =
      node.status === "critical"
        ? "#ff3b30"
        : node.status === "degraded"
        ? "#ff9f43"
        : "#2ecc71";
    const borderColor = highlight ? "#0B57D0" : "rgba(255,255,255,0.95)";
    const pulseHtml = pulse
      ? `<span class="marker-pulse" style="background:${color}"></span>`
      : "";

    // single unified marker container (smaller)
    const html = `
    <div class="clb-marker" style="width:34px;height:34px;">
      ${pulseHtml}
      <div class="clb-marker-outline" style="width:34px;height:34px;border-radius:50%;"></div>
      <div class="clb-marker-body" style="width:22px;height:22px;background:${color};border-color:${borderColor};"></div>
    </div>
  `;

    return L.divIcon({
      className: "clb-div-icon",
      html,
      iconSize: [34, 34], // total html dimensions
      iconAnchor: [17, 17], // center (so circle sits on exact lat/lon)
      popupAnchor: [0, -18], // popup above marker
    });
  }, [node.status, highlight, pulse]);

  return node.lat != null && node.lon != null ? (
    <Marker position={[node.lat, node.lon]} icon={icon}>
      <Popup minWidth={220}>
        <div style={{ minWidth: 220 }}>
          <strong>{node.name || node.id}</strong>
          <div style={{ marginTop: 6 }}>
            VUF: <strong>{node.vuf}%</strong>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={node.status as any} />
            </div>
          </div>
          <MapPopupActions
            nodeId={node.id}
            onViewDetails={onViewDetails}
            onQuickBalance={onQuickBalance}
          />
        </div>
      </Popup>
    </Marker>
  ) : null;
}
