# ⚡ SmartPhase: AI-Powered IoT System for Dynamic Phase Balancing in Kerala’s Solar Grid

![SmartPhase Logo](./assets/logo.png)

> 🌞 Empowering Kerala’s solar future by eliminating phase imbalance with IoT, Edge Intelligence, and Smart Control.

---

## 📌 Problem Statement

Kerala has installed more than **1500 MW of rooftop solar**, most of which are small (<5 kW) single-phase systems connected to low-voltage feeders.  
This leads to **phase imbalance** across R, Y, B lines, creating multiple challenges:

- ⚠️ Uneven voltage profiles.  
- ⚠️ Neutral current heating and transformer stress.  
- ⚠️ Reduced rooftop solar hosting capacity.  
- ⚠️ Poor power quality and consumer dissatisfaction.  

Utilities today try manual/static phase reconfiguration, but this fails under **dynamic load and solar injection variations** (morning demand, noon solar injection, evening peak).  

---

## 🚀 Our Solution: SmartPhase

We propose a **low-cost, scalable, IoT-based dynamic phase balancing system**.  
Our innovation combines **sensors, relays, edge intelligence, and a smart dashboard** to continuously monitor and re-balance feeder phases.

### ✅ Key Features
- **Dynamic auto-balancing** of single-phase solar households across 3 phases.  
- **Edge controller (Raspberry Pi)** for local decision-making (no cloud dependency).  
- **House node (ESP32)** with sensors + relay for real-time measurement & phase switching.  
- **Dashboard** for monitoring, manual override, and reporting.  
- **Auto + Manual modes** for operator flexibility.  
- **PDF report export** for analysis and decision-making.  

---

## 🏗 System Architecture

![System Architecture](./assets/architecture.png)

**Flow:**  
ESP32 (house) → MQTT → Raspberry Pi (balancing algorithm) → FastAPI + InfluxDB → React Dashboard  

- **House Node (ESP32):**  
  - Measures current/voltage via CT + voltage sensors.  
  - Executes relay switching to change phase (R → Y → B).  
  - Communicates with Pi via MQTT.  

- **Transformer Node (Raspberry Pi):**  
  - Receives data from all ESP32 nodes.  
  - Runs **balancing algorithm** to detect overload/underload.  
  - Sends switching commands to selected ESP32 nodes.  

- **Control Center (Laptop/Server):**  
  - FastAPI backend for data + API layer.  
  - InfluxDB for time-series telemetry.  
  - Grafana (debug) + React Dashboard (judges).  

---

## ⚙️ Balancing Algorithm

```text
1. Collect current load of R, Y, B phases from ESP32 sensors.
2. Calculate imbalance severity using Voltage Unbalance Factor (VUF) and neutral current.
3. Identify overloaded phase and underloaded phase.
4. Select candidate households (with solar injection) connected to overloaded phase.
5. Switch them to underloaded phase using ESP32 relay.
6. Verify switch via feedback from ESP32.
7. Ensure no new phase becomes overloaded.
8. Update dashboard with before/after data.
```

## 💻 Tech Stack

- **Hardware:** ESP32, Raspberry Pi 4, CT sensors, relays.  
- **Protocols:** MQTT, HTTP/REST.  
- **Backend:** FastAPI, Mosquitto MQTT Broker, InfluxDB.  
- **Frontend:** React + TypeScript, mqtt.js, jsPDF.  
- **Visualization:** Grafana (debug), custom React dashboard (judges).  

---

## 📊 Dashboard Highlights

- Real-time feeder monitoring (R/Y/B load).  
- Kerala map with feeder nodes.  
- Auto vs Manual toggle.  
- Manual phase switch control.  
- Before/After balancing comparison charts.  
- PDF report export.  

---

## 🎬 Demo Walkthrough

1. Morning → R phase overloaded.  
2. Pi detects imbalance from sensor data.  
3. Algorithm selects 2 solar houses from R → switches to B.  
4. ESP32 executes relay switch + sends confirmation.  
5. Dashboard updates → before/after load chart shown.  
6. Operator exports PDF report.  

---

## 🌍 Business & Social Impact

- **Utility:**  
  - Reduces transformer failures & maintenance costs.  
  - Increases solar hosting capacity without infrastructure upgrades.  

- **Consumers:**  
  - Stable voltage, better power quality, fewer outages.  

- **Kerala & Beyond:**  
  - Supports renewable adoption at scale.  
  - Aligns with **UN SDGs**:  
    - SDG 7: Affordable & Clean Energy  
    - SDG 9: Infrastructure Innovation  
    - SDG 11: Sustainable Cities  
    - SDG 13: Climate Action  

---

## 🔮 Future Scope

- Machine Learning for predictive phase balancing.  
- Integration with EV charging + battery storage.  
- Blockchain for peer-to-peer solar energy trading.  
- Scaling to 11kV feeders and other states.  

---

## 🛠 Installation & Usage

```bash
# Clone repository
git clone https://github.com/your-repo/smartphase.git
cd smartphase

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd frontend
npm install
npm start
```

## Sample MQTT Message

```bash
{
  "house_id": "H001",
  "phase": "R",
  "voltage": 229.5,
  "current": 4.2,
  "solar_injection": 2.1
}
```

## 👥 Team SmartPhase

| Name    | Role                     | GitHub/LinkedIn |
|---------|--------------------------|-----------------|
| Varun Krishnan R     | IOT and Hardware Lead      | [GitHub](#)     |
| Gokul Ram K   | Software Lead      | [GitHub](#)     |
| Manju Varshikha S | Software Developer     | [GitHub](#)     |
| Karthikeyan Arun   | IOT and Hardware Developer | [GitHub](#)     |
| LOGESWARAR G   | IOT and Hardware Developer | [GitHub](#)     |

---

## 📚 References

- Kerala State Electricity Board (KSEB) Rooftop Solar Reports.  
- IEEE papers on Phase Balancing & VUF calculation.  
- MQTT, FastAPI, and InfluxDB official docs.  

---


## SmartPhase is not just a prototype — it is a **deployable, scalable, low-cost solution** for Kerala’s distribution utilities.  
## With **36-hour hackathon readiness** and **real-world impact**, we aim to **set the benchmark** for smart energy solutions at SIH 2025.  





---

## ⚙️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/GOKULRAM-K/Kerala_Load_Balancer.git
cd Kerala_Load_Balancer
```
2. Install dependencies
```bash
npm install
# or
yarn install
```
3. Run locally
```bash
npm run dev
```
The app will be available at http://localhost:5173

📦 Build for Production
```bash
npm run build
npm run preview
```




