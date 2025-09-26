import React from "react";
import { Link } from "react-router-dom";

export default function TopNav() {
  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: 12,
    padding: 12,
    alignItems: "center",
    background: "#ffffff",
    borderBottom: "1px solid #e6e9ef",
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "#0b57d0",
    fontWeight: 600,
  };

  return (
    <div style={navStyle}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>
        CLB — Change-Load_Balancer
      </div>
      <div style={{ marginLeft: 24, display: "flex", gap: 12 }}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
        <Link to="/nodes" style={linkStyle}>
          Nodes
        </Link>
        <Link to="/operations" style={linkStyle}>
          Operations
        </Link>
        <Link to="/insights" style={linkStyle}>
          Insights
        </Link>
        <Link to="/console" style={linkStyle}>
          Control Console
        </Link>
      </div>
      <div style={{ marginLeft: "auto", color: "#666" }}>Demo Mode</div>
    </div>
  );
}
