import React from "react";
import { useParams } from "react-router-dom";

export default function NodeDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1>Node Details — {id}</h1>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}
      >
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
          <h3>VUF Gauge (placeholder)</h3>
          <div style={{ height: 200 }}>Gauge will appear here</div>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
          <h3>Control Panel</h3>
          <button>Apply Balance (mock)</button>
        </div>
      </div>
      <div
        style={{
          marginTop: 16,
          background: "#fff",
          padding: 16,
          borderRadius: 8,
        }}
      >
        Time-series charts placeholder
      </div>
    </div>
  );
}
