// src/components/ClusterLayer.tsx
import React, { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

type NodeShort = {
  id: string;
  name?: string;
  lat: number;
  lon: number;
  status: "operational" | "degraded" | "critical" | string;
  vuf: number;
  feeder?: string;
  district?: string;
};

type Props = {
  nodes: NodeShort[];
  onViewDetails: (id: string) => void;
  onQuickBalance: (id: string) => void;
  highlightIds?: string[];
  pulseId?: string | null;
};

function createDivIconHtml(color: string, borderColor: string, pulse = false) {
  const pulseHtml = pulse
    ? `<span class="marker-pulse" style="background:${color}"></span>`
    : "";
  return `
    <div class="clb-marker" style="width:34px;height:34px;position:relative">
      ${pulseHtml}
      <div class="clb-marker-outline" style="position:absolute;left:0;top:0;width:34px;height:34px;border-radius:50%;box-shadow:0 0 0 3px rgba(255,255,255,0.95)"></div>
      <div class="clb-marker-body" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;background:${color};border:3px solid ${borderColor};box-shadow:0 2px 6px rgba(8,15,40,0.12)"></div>
    </div>
  `;
}

function createDivIcon(node: NodeShort, highlight = false, pulse = false) {
  const color =
    node.status === "critical"
      ? "#ff3b30"
      : node.status === "degraded"
      ? "#ff9f43"
      : "#2ecc71";
  const borderColor = highlight ? "#0B57D0" : "rgba(255,255,255,0.95)";
  const html = createDivIconHtml(color, borderColor, pulse);

  return L.divIcon({
    className: "clb-div-icon",
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

export default function ClusterLayer({
  nodes,
  onViewDetails,
  onQuickBalance,
  highlightIds = [],
  pulseId,
}: Props) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // @ts-ignore markercluster plugin
    const clusterGroup = (L as any).markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: function (cluster: any) {
        const markers = cluster.getAllChildMarkers();
        const avgVuf =
          markers.reduce((acc: number, m: any) => acc + (m.vuf || 0), 0) /
          Math.max(1, markers.length);
        const color =
          avgVuf >= 3 ? "#ff3b30" : avgVuf >= 1.5 ? "#ff9f43" : "#2ecc71";
        const count = cluster.getChildCount();
        const html = `<div style="background:${color};width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;box-shadow:0 4px 12px rgba(8,15,40,0.12)"><div>${count}</div></div>`;
        return L.divIcon({
          html,
          className: "clb-cluster-icon",
          iconSize: L.point(46, 46, true),
        });
      },
    });

    const markerRefs: L.Marker[] = [];

    nodes.forEach((n) => {
      if (n.lat == null || n.lon == null) return;

      const marker = L.marker([n.lat, n.lon], {
        icon: createDivIcon(n, highlightIds.includes(n.id), pulseId === n.id),
      });

      // ✅ attach metadata directly (don’t overwrite options!)
      (marker as any).vuf = n.vuf;
      (marker as any).nodeId = n.id;

      const popupHtml = `<div style="min-width:200px"><strong>${
        n.name || n.id
      }</strong><div>VUF: ${
        n.vuf
      }%</div><div style="margin-top:8px"><button data-node="${
        n.id
      }" class="clb-popup-view">View</button>&nbsp;<button data-node="${
        n.id
      }" class="clb-popup-balance">Quick Balance</button></div></div>`;
      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onViewDetails(n.id);
      });

      marker.on("popupopen", (ev: any) => {
        const popupNode = ev.popup?.getElement?.() ?? ev.popup._contentNode;
        if (!popupNode) return;
        const btnView = popupNode.querySelector(
          ".clb-popup-view"
        ) as HTMLButtonElement | null;
        const btnBal = popupNode.querySelector(
          ".clb-popup-balance"
        ) as HTMLButtonElement | null;
        if (btnView) btnView.onclick = () => onViewDetails(n.id);
        if (btnBal) btnBal.onclick = () => onQuickBalance(n.id);
      });

      markerRefs.push(marker);
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    // cluster click popup with top-5 nodes
    const onClusterClick = (ev: any) => {
      const cluster = ev.layer;
      const childMarkers = cluster.getAllChildMarkers() as any[];
      if (!childMarkers || childMarkers.length === 0) return;

      const listHtmlItems = childMarkers
        .map((m) => ({
          id: m.nodeId ?? "node",
          v: m.vuf ?? 0,
          name: m.nodeId ?? "Node",
        }))
        .sort((a, b) => b.v - a.v)
        .slice(0, 5)
        .map(
          (t) =>
            `<li style="margin-bottom:6px"><strong style="font-size:13px">${escapeHtml(
              t.name || t.id
            )}</strong> <span style="color:#666;font-size:12px;margin-left:6px">(${
              t.v
            }% VUF)</span> <button data-node="${
              t.id
            }" class="clb-list-view" style="margin-left:8px;padding:4px 8px;border-radius:6px;border:none;background:#0B57D0;color:#fff;font-size:12px;cursor:pointer">View</button> <button data-node="${
              t.id
            }" class="clb-list-balance" style="margin-left:6px;padding:4px 8px;border-radius:6px;border:none;background:#00A896;color:#fff;font-size:12px;cursor:pointer">Quick</button></li>`
        )
        .join("");

      const popupHtml = `<div style="min-width:220px;"><div style="font-weight:700;margin-bottom:8px">Top nodes in cluster (${childMarkers.length})</div><ul style="list-style:none;padding:0;margin:0">${listHtmlItems}</ul></div>`;

      const popup = L.popup({ maxWidth: 320 })
        .setLatLng(cluster.getLatLng())
        .setContent(popupHtml)
        .openOn(map);

      map.once("popupopen", () => {
        const container = (popup as any)._container as HTMLElement | null;
        if (!container) return;
        const viewButtons = container.querySelectorAll(".clb-list-view");
        const balButtons = container.querySelectorAll(".clb-list-balance");
        viewButtons.forEach((b) => {
          b.addEventListener("click", (e) => {
            const id = (e.currentTarget as HTMLElement).getAttribute(
              "data-node"
            );
            if (id) onViewDetails(id);
            map.closePopup(popup);
          });
        });
        balButtons.forEach((b) => {
          b.addEventListener("click", (e) => {
            const id = (e.currentTarget as HTMLElement).getAttribute(
              "data-node"
            );
            if (id) onQuickBalance(id);
            map.closePopup(popup);
          });
        });
      });
    };

    clusterGroup.on("clusterclick", onClusterClick);

    try {
      if (markerRefs.length > 0) {
        const group = L.featureGroup(markerRefs);
        map.fitBounds(group.getBounds().pad(0.25), { maxZoom: 12 });
      }
    } catch {
      /* ignore */
    }

    return () => {
      try {
        clusterGroup.off("clusterclick", onClusterClick);
        markerRefs.forEach((m) => {
          try {
            clusterGroup.removeLayer(m);
            m.remove();
          } catch {
            /* ignore */
          }
        });
        if (map.hasLayer(clusterGroup)) map.removeLayer(clusterGroup);
      } catch {
        /* ignore */
      }
    };
  }, [
    map,
    JSON.stringify(nodes.map((n) => n.id + "|" + n.vuf)),
    highlightIds.join(","),
    pulseId,
  ]);

  return null;
}

function escapeHtml(s: string | null | undefined) {
  if (!s) return "";
  return String(s).replace(/[&<>"'`=\/]/g, function (c) {
    return (
      {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
      } as any
    )[c];
  });
}
