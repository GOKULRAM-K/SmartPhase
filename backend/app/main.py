# backend/app/main.py
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from .db import SessionLocal, Telemetry

import os
import json
# optional MQTT support
try:
    import paho.mqtt.publish as mqtt_publish
except Exception:
    mqtt_publish = None

import time, random
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from . import store, mock_nodes
from .mock_nodes import MOCK_NODES
from .store import push_event, list_events, store_command, push_telemetry, list_telemetry

# ------------------------------
# Global
# ------------------------------
NODES: Dict[str, Dict[str, Any]] = {n["id"]: n for n in MOCK_NODES}
REAL_NODE_ID = "ND-001"

app = FastAPI(title="Kerala Load Balancer API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Helpers
# ------------------------------
def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"

def gen_cmd_id() -> str:
    return f"CMD-{int(time.time()*1000)}"

def gen_ev_id() -> str:
    return f"EV-{int(time.time()*1000)}"

def publish_mqtt_command(node_id: str, payload: dict) -> bool:
    """
    Publish command payload to MQTT topic feederbalancer/commands/{node_id}.
    Returns True on success, False on error or if MQTT not configured.
    """
    broker = os.getenv("MQTT_BROKER")  # e.g. "localhost" or "test.mosquitto.org"
    port = int(os.getenv("MQTT_PORT", "1883"))
    if not broker or mqtt_publish is None:
        return False

    topic = f"feederbalancer/commands/{node_id}"
    try:
        mqtt_publish.single(
            topic,
            payload=json.dumps(payload),
            hostname=broker,
            port=port,
            qos=1,
        )
        return True
    except Exception as e:
        print("MQTT publish error:", e)
        return False

# ------------------------------
# Routes
# ------------------------------
@app.get("/")
def read_root():
    return {"message": "Backend is running successfully 🚀"}

# ------------------------------
# Telemetry (Pi → backend)
# ------------------------------
class TelemetryIn(BaseModel):
    nodeId: str
    vuf: float
    v_a: int
    v_b: int
    v_c: int
    neutral_current: float

@app.post("/api/pi/telemetry")
def receive_pi_telemetry(data: TelemetryIn):
    ts = datetime.now(timezone.utc).isoformat()

    telemetry_point = {
        "ts": ts,
        "vuf": data.vuf,
        "v_a": data.v_a,
        "v_b": data.v_b,
        "v_c": data.v_c,
        "neutral_current": data.neutral_current,
    }

    # update in-memory node
    if data.nodeId in NODES:
        node = NODES[data.nodeId]
        node["last_telemetry"] = telemetry_point
        node["vuf"] = data.vuf

    # save in SQLite
    push_telemetry(data.nodeId, telemetry_point)

    # push event
    ev = {
        "id": gen_ev_id(),
        "ts": ts,
        "type": "telemetry",
        "nodeId": data.nodeId,
        "severity": "info" if data.vuf < 2 else "warn" if data.vuf < 3 else "critical",
        "summary": f"Pi telemetry update for {data.nodeId}: VUF={data.vuf}",
        "details": data.dict(),
    }
    store.push_event(ev)

    return {"status": "ok", "updated_node": data.nodeId}

# ------------------------------
# Node management
# ------------------------------
@app.get("/api/nodes")
def get_nodes():
    return {"count": len(NODES), "nodes": list(NODES.values())}

@app.get("/api/nodes/{node_id}")
def get_node(node_id: str):
    node = NODES.get(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

# ------------------------------
# Telemetry retrieval
# ------------------------------
@app.get("/api/nodes/{node_id}/telemetry")
def api_node_telemetry(
    node_id: str,
    from_: Optional[str] = None,
    to: Optional[str] = None,
    step: Optional[int] = 60,
    limit: int = 500,
):
    # real node → fetch from DB
    if node_id == REAL_NODE_ID:
        db: Session = SessionLocal()
        try:
            q = db.query(Telemetry).filter(Telemetry.node_id == node_id)

            if from_:
                q = q.filter(Telemetry.ts >= datetime.fromisoformat(from_.replace("Z", "+00:00")))
            if to:
                q = q.filter(Telemetry.ts <= datetime.fromisoformat(to.replace("Z", "+00:00")))

            rows = q.order_by(Telemetry.ts.desc()).limit(limit).all()
            rows = list(reversed(rows))

            points = [
                {
                    "ts": r.ts.isoformat() + "Z",
                    "vuf": float(r.vuf),
                    "v_a": int(r.v_a),
                    "v_b": int(r.v_b),
                    "v_c": int(r.v_c),
                    "neutral_current": float(r.neutral_current),
                }
                for r in rows
            ]
            return {"count": len(points), "points": points}
        finally:
            db.close()

    # fallback: synthetic telemetry
    node = NODES.get(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    try:
        if to:
            t_to = datetime.fromisoformat(to.replace("Z", "+00:00"))
        else:
            t_to = datetime.utcnow()
        if from_:
            t_from = datetime.fromisoformat(from_.replace("Z", "+00:00"))
        else:
            t_from = t_to - timedelta(hours=1)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid from/to datetime")

    if t_from >= t_to:
        raise HTTPException(status_code=400, detail="from must be before to")

    if not step or step <= 0:
        step = 60

    last = node.get("last_telemetry") or {}
    seed_vuf = float(last.get("vuf", 1.0))
    seed_va = float(last.get("v_a", 230))
    seed_vb = float(last.get("v_b", 229))
    seed_vc = float(last.get("v_c", 231))
    seed_nc = float(last.get("neutral_current", 3.0))

    points = []
    total_seconds = int((t_to - t_from).total_seconds())
    steps = max(1, total_seconds // step)
    import math
    for i in range(steps + 1):
        ts = t_from + timedelta(seconds=i * step)
        frac = i / max(1, steps)
        jitter = (math.sin(i * 0.3) * 0.2) + random.uniform(-0.1, 0.1)
        vuf = max(0.0, round(seed_vuf * (1 - 0.2 * frac) + jitter, 2))
        v_a = int(round(seed_va + math.sin(i * 0.17) * 2 + random.uniform(-1, 1)))
        v_b = int(round(seed_vb + math.sin(i * 0.19 + 1) * 2 + random.uniform(-1, 1)))
        v_c = int(round(seed_vc + math.sin(i * 0.23 + 2) * 2 + random.uniform(-1, 1)))
        neutral_current = round(max(0.0, seed_nc + random.uniform(-1.5, 1.5) + frac * 0.3), 1)

        points.append({
            "ts": ts.isoformat() + "Z",
            "vuf": vuf,
            "v_a": v_a,
            "v_b": v_b,
            "v_c": v_c,
            "neutral_current": neutral_current
        })

    return {"count": len(points), "points": points}

# ------------------------------
# Events
# ------------------------------
@app.get("/api/events")
def api_events(limit: int = 200, node: Optional[str] = None):
    evs = list_events(limit=limit, node=node)
    return {"count": len(evs), "events": evs}

# ------------------------------
# Commands
# ------------------------------
@app.post("/api/commands")
def api_commands(payload: Dict[str, Any] = Body(...)):
    node_ids = payload.get("nodeIds")
    command = payload.get("command")
    params = payload.get("params", {})
    initiated_by = payload.get("initiatedBy", "WebUI")

    if not node_ids or not isinstance(node_ids, list) or not command:
        raise HTTPException(status_code=400, detail="nodeIds (list) and command required")

    cmd_id = gen_cmd_id()
    cmd_item = {
        "id": cmd_id,
        "ts": now_iso(),
        "nodeIds": node_ids,
        "command": command,
        "params": params,
        "initiatedBy": initiated_by,
        "status": "queued",
    }

    store_command(cmd_item)
    push_event({
        "id": gen_ev_id(),
        "ts": now_iso(),
        "type": "manual-command",
        "nodeId": node_ids[0],
        "severity": "info",
        "summary": f"Command queued: {command} -> {len(node_ids)} node(s)",
        "details": {"cmdId": cmd_id, "params": params},
    })

    # simulate effects + MQTT publish
    for nid in node_ids:
        node = NODES.get(nid)
        if node:
            cmd_norm = command.replace("_", "-").lower()
            if cmd_norm == "switch-mode":
                old = node.get("mode", "auto")
                new_mode = "manual" if old == "auto" else "auto"
                node["mode"] = new_mode
                push_event({
                    "id": gen_ev_id(),
                    "ts": now_iso(),
                    "type": "system",
                    "nodeId": nid,
                    "severity": "info",
                    "summary": f"Mode toggled to {new_mode} (simulated)",
                })
            elif cmd_norm == "quick-balance":
                delta = round(random.uniform(0.2, 1.0), 2)
                node["vuf"] = max(0.0, round(node.get("vuf", 0) - delta, 2))
                lt = node.get("last_telemetry", {})
                lt["vuf"] = node["vuf"]
                lt["ts"] = now_iso()
                node["last_telemetry"] = lt
                push_event({
                    "id": gen_ev_id(),
                    "ts": now_iso(),
                    "type": "auto-balance",
                    "nodeId": nid,
                    "severity": "info",
                    "summary": f"Quick balance applied (simulated)",
                })
            elif cmd_norm == "restart":
                prev = node.get("status")
                node["status"] = "operational"
                push_event({
                    "id": gen_ev_id(),
                    "ts": now_iso(),
                    "type": "system",
                    "nodeId": nid,
                    "severity": "info",
                    "summary": "Node restarted (simulated)",
                })

        # publish MQTT
        mqtt_payload = {
            "cmdId": cmd_id,
            "command": command,
            "params": params,
            "ts": now_iso(),
            "initiatedBy": initiated_by,
            "target": nid,
        }
        published = publish_mqtt_command(nid, mqtt_payload)
        push_event({
            "id": gen_ev_id(),
            "ts": now_iso(),
            "type": "system",
            "nodeId": nid,
            "severity": "info" if published else "warn",
            "summary": f"MQTT publish {'succeeded' if published else 'failed'} for {nid}",
        })

    return cmd_item

# ------------------------------
# Debug endpoint
# ------------------------------
@app.get("/api/db/telemetry")
def debug_all_telemetry(limit: int = 50):
    db: Session = SessionLocal()
    try:
        rows = db.query(Telemetry).order_by(Telemetry.ts.desc()).limit(limit).all()
        return [
            {
                "id": r.id,
                "node_id": r.node_id,
                "ts": r.ts.isoformat() + "Z",
                "vuf": float(r.vuf),
                "v_a": int(r.v_a),
                "v_b": int(r.v_b),
                "v_c": int(r.v_c),
                "neutral_current": float(r.neutral_current),
            }
            for r in rows
        ]
    finally:
        db.close()
