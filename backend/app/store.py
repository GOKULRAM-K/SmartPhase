# backend/app/store.py
from collections import deque
from typing import Dict, Any, List, Optional
# backend/app/mqtt_helper.py
import os, json
import paho.mqtt.publish as mqtt_publish


# In-memory event log (newest first)
EVENTS: deque = deque(maxlen=5000)

# In-memory commands store
COMMANDS: Dict[str, Dict[str, Any]] = {}

def push_event(ev: Dict[str, Any]) -> None:
    EVENTS.appendleft(ev)

def list_events(limit: int = 200, node: Optional[str] = None) -> List[Dict[str, Any]]:
    items = list(EVENTS)
    if node:
        items = [e for e in items if e.get("nodeId") == node]
    return items[:limit]

def store_command(cmd: Dict[str, Any]) -> None:
    COMMANDS[cmd["id"]] = cmd

def get_command(cmd_id: str) -> Optional[Dict[str, Any]]:
    return COMMANDS.get(cmd_id)

# backend/app/store.py

# --- Telemetry store (real for ND-001) ---
TELEMETRY: Dict[str, List[Dict[str, Any]]] = {}

def push_telemetry(node_id: str, point: Dict[str, Any]) -> None:
    """Append telemetry point for a node (real data)."""
    if node_id not in TELEMETRY:
        TELEMETRY[node_id] = []
    TELEMETRY[node_id].append(point)
    # keep log bounded (last 5000 points)
    TELEMETRY[node_id] = TELEMETRY[node_id][-5000:]

def list_telemetry(node_id: str, limit: int = 500) -> List[Dict[str, Any]]:
    """Return last N telemetry points for a node."""
    return TELEMETRY.get(node_id, [])[-limit:]


def publish_mqtt_command(node_id: str, payload: dict) -> bool:
    """
    Publish command payload to MQTT topic feederbalancer/commands/{node_id}.
    Returns True on success, False on error or if MQTT not configured.
    """
    broker = os.getenv("MQTT_BROKER", "localhost")  # e.g. test.mosquitto.org
    port = int(os.getenv("MQTT_PORT", "1883"))
    if not broker:
        return False

    topic = f"feederbalancer/commands/{node_id}"
    try:
        mqtt_publish.single(
            topic,
            payload=json.dumps(payload),
            hostname=broker,
            port=port,
            qos=1
        )
        print(f"✅ Published to MQTT topic {topic}")
        return True
    except Exception as e:
        print("❌ MQTT publish error:", e)
        return False