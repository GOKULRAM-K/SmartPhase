import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Nodes from "./pages/Nodes";
import NodeDetail from "./pages/NodeDetail";
import Operations from "./pages/Operations";
import Insights from "./pages/Insights";
import ControlConsole from "./pages/ControlConsole";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nodes" element={<Nodes />} />
        <Route path="/nodes/:id" element={<NodeDetail />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/console" element={<ControlConsole />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
