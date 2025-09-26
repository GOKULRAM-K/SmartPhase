# backend/app/mock_nodes.py
from typing import List, Dict, Any
import random
from datetime import datetime, timedelta

CITY_CENTERS = {
    "Kannur": {"lat": 11.8745, "lon": 75.3704, "district": "Kannur"},
    "Kozhikode": {"lat": 11.2588, "lon": 75.7804, "district": "Kozhikode"},
    "Thrissur": {"lat": 10.5276, "lon": 76.2144, "district": "Thrissur"},
    "Kochi": {"lat": 9.9312, "lon": 76.2673, "district": "Ernakulam"},
    "Ernakulam": {"lat": 9.9658, "lon": 76.2413, "district": "Ernakulam"},
    "Alappuzha": {"lat": 9.4981, "lon": 76.3388, "district": "Alappuzha"},
    "Kollam": {"lat": 8.8932, "lon": 76.6141, "district": "Kollam"},
    "Thiruvananthapuram": {"lat": 8.5241, "lon": 76.9366, "district": "Thiruvananthapuram"},
    "Munnar": {"lat": 10.0889, "lon": 77.0595, "district": "Idukki"},
    "Guruvayur": {"lat": 10.594, "lon": 76.0413, "district": "Thrissur"},
}

CITY_DISTRIBUTION = [
    ("Kannur", 3),
    ("Kozhikode", 2),
    ("Thrissur", 3),
    ("Kochi", 4),
    ("Ernakulam", 5),
    ("Alappuzha", 3),
    ("Kollam", 4),
    ("Thiruvananthapuram", 5),
    ("Munnar", 2),
    ("Guruvayur", 2),
]

def gen_clustered_nodes(count: int = 25, scatter_deg: float = 0.015) -> List[Dict[str, Any]]:
    nodes: List[Dict[str, Any]] = []
    idx = 1
    for city, ccount in CITY_DISTRIBUTION:
        center = CITY_CENTERS.get(city)
        if not center:
            continue
        for i in range(ccount):
            if len(nodes) >= count:
                break
            jitter_lat = (random.random() - 0.5) * scatter_deg
            jitter_lon = (random.random() - 0.5) * (scatter_deg * 1.2)
            lat = round(center["lat"] + jitter_lat, 5)
            lon = round(center["lon"] + jitter_lon, 5)
            vuf = round(random.random() * 4, 2)
            status = "critical" if vuf >= 3 else ("degraded" if vuf >= 1.5 else "operational")
            node = {
                "id": f"ND-{str(idx).zfill(3)}",
                "name": f"{city} Node {i+1}",
                "lat": lat,
                "lon": lon,
                "status": status,
                "vuf": vuf,
                "feeder": f"Feeder-{((idx - 1) % 8) + 1}",
                "district": center["district"],
                "mode": "auto" if random.random() > 0.5 else "manual",
                "last_telemetry": {
                    "ts": (datetime.utcnow() - timedelta(seconds=random.randint(0, 3600))).isoformat() + "Z",
                    "vuf": vuf,
                    "v_a": 220 + random.randint(0, 16),
                    "v_b": 220 + random.randint(0, 16),
                    "v_c": 220 + random.randint(0, 16),
                    "neutral_current": random.randint(0, 40),
                }
            }
            nodes.append(node)
            idx += 1
        if len(nodes) >= count:
            break
    return nodes[:count]

# module-level list you can import elsewhere
MOCK_NODES = gen_clustered_nodes(25)
