# ⚡ Kerala Load Balancer

A **Smart Load Balancer & Monitoring Dashboard** for power distribution systems in Kerala.  
Built with **React (Vite + TypeScript)**, **Material UI**, and **Recharts**.

---

## 📊 Features

- **Real-time Insights & Analytics**
  - KPI cards (Average VUF, Critical Nodes, Avg Neutral Current, Nodes in view)
  - Interactive Line Charts, Bar Charts, and Pie Charts
  - Distribution and Alerts visualized with `Recharts`

- **Node Management**
  - View all nodes with details like ID, district, feeder, mode, VUF, neutral current
  - Drill down into individual node details

- **Operations**
  - Manage operational modes (auto/manual)
  - Refresh and export node data

- **Exports**
  - Export filtered node data to **CSV**
  - Export top critical nodes to **JSON**

- **Responsive Dashboard**
  - Optimized for desktop and mobile
  - Built using Material-UI Grid & Paper components

---

## 🚀 Tech Stack

- **Frontend:** React, TypeScript, Vite  
- **UI Components:** Material UI (MUI v5)  
- **Charts:** Recharts  
- **Icons:** Material Icons  
- **State Management:** React Hooks (`useState`, `useMemo`)  
- **Routing:** React Router v6  

---

## 📂 Project Structure



src/
├── components/ # Layout, shared UI components
├── pages/
│ ├── Home/ # Landing page
│ ├── Nodes/ # Node listing
│ ├── NodeDetail/ # Node detail view
│ ├── Operations/ # Operations console
│ ├── Insights/ # Insights & Analytics dashboard
│ └── ControlConsole/ # Control console
├── utils/
│ └── mockNodes.ts # Mock data for nodes & telemetry
└── App.tsx # App routes



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




