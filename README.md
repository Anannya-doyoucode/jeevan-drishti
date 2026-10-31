# JEEVAN-DRISHTI (जीवन-दृष्टी)
### Multi-Hazard Climate-Health Disease Surveillance & Predictive Outbreak Decision Support Platform
**Government of Maharashtra — Public Health Department**  
Integrated Disease Surveillance Programme (IDSP) • C-DoT / SACHET Integrated

---

## 1. System Architecture Overview

JEEVAN-DRISHTI is an enterprise-grade, full-stack epidemiological intelligence platform connecting a high-throughput Python FastAPI / ML Pipeline Backend with a React (Vite) + Tailwind CSS Decision Cockpit.

```
                      ┌────────────────────────────────────────┐
                      │    JEEVAN-DRISHTI React Dashboard       │
                      │  (Vite + Tailwind CSS + Recharts)      │
                      │  Live Sync Badge • SVG Map • Scrubber  │
                      └──────────────────┬─────────────────────┘
                                         │ REST API (JSON)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │        FastAPI Application Core        │
                      │       Pydantic v2 Strict Schemas       │
                      │         CORS & Role Auth Guards        │
                      └────┬──────────────┬──────────────┬─────┘
                           │              │              │
      ┌────────────────────┴──┐    ┌──────┴─────┐  ┌─────┴──────────────────┐
      │  ML Specialist Engine │    │ What-If    │  │ Governance & C-DoT     │
      │  • Vector-Borne       │    │ Sandbox    │  │ • Alert State Machine  │
      │  • Water-Borne        │    │ Stochastic │  │ • CAP v1.2 Broadcast   │
      │  • Thermal Stress     │    │ Counter-   │  │ • Bilingual Alerts     │
      │  • SHAP XAI Explainer │    │ factuals   │  │ • SQLite / Audit Logs  │
      └───────────────────────┘    └────────────┘  └────────────────────────┘
```

---

## 2. Palette & Design System (Government Light Theme)

- **Header Deep Navy:** `#0B1220` (Official state header background)
- **Primary Accent Teal:** `#2DD4BF` (State health intelligence highlights)
- **High Risk Coral:** `#E76F51` (Active outbreak epicenters & alert states)
- **Moderate Risk Yellow:** `#E9B949` (Surveillance watch categories)
- **Low Risk Green:** `#34A853` (Baseline endemic monitoring)
- **Missing Data Slate:** `#94A3B8` (Data gaps & contextual state polygons)
- **Background Slate:** `#F8FAFC` & `#F1F5F9` (Clinical high-readability base)

---

## 3. Implemented REST API Endpoints

### A. Surveillance & Data Ingestion
- `GET /api/v1/districts`  
  Returns 7 target Maharashtra districts (`pune`, `mumbai_suburban`, `nagpur`, `nashik`, `kolhapur`, `chhatrapati_sambhajinagar`, `thane`) with population, coordinates, elevation, risk levels, and PHC coverage.
- `GET /api/v1/surveillance/summary?district_id={id}&week={wk}`  
  Returns observed cases for 5 diseases (Dengue, Malaria, Cholera, Thermal Stress, Leptospirosis), 5-year endemic baseline, threshold alert, week-over-week trends, and incident state.
- `GET /api/v1/climate/observations?district_id={id}&lags=21`  
  Returns historical precipitation, temperature max/min, relative humidity, and aligned 7d, 14d, 21d lag windows.

### B. Machine Learning Engine Predictions & Consensus
- `GET /api/v1/models/predict?district_id={id}&disease={type}&horizon={days}`  
  Returns 7-, 14-, and 30-day forecast trajectories with 95% uncertainty intervals (`lower_bound`, `upper_bound`), risk scores across 3 specialist engines (Vector-Borne, Water-Borne, Thermal Stress), and engine consensus score (e.g. 84% Consensus).
- `GET /api/v1/models/explainability?district_id={id}&disease={type}`  
  Returns SHAP feature importance weights for the "Why Flagged?" evidence drawer (Rainfall Lag +42%, Relative Humidity +28%, Vector Thermal Window +14%, etc.).

### C. Simulation & What-If Engine
- `POST /api/v1/simulation/run`  
  Accepts `{ temp_shift: float, rain_shift: float, fogging_coverage: int, chlorination_coverage: int, district_id: str, disease: str }` and computes counterfactual caseload trajectories, cases averted, hospital bed-days saved, and estimated INR savings.

### D. Governance & C-DoT / SACHET Cell Broadcast
- `POST /api/v1/alerts/lifecycle`  
  Transitions alert state (`NEW` -> `UNDER_REVIEW` -> `CONFIRMED` / `DISMISSED` -> `CLOSED`), records officer email, role, triage notes, and commits to the database audit trail.
- `GET /api/v1/alerts/audit-trail?district_id={id}`  
  Fetches persistent audit history.
- `POST /api/v1/broadcast/dispatch`  
  Generates Common Alerting Protocol (CAP v1.2) XML and JSON payloads, estimates affected population & energized cellular towers, generates bilingual Marathi (`मराठी`) and English alerts, and logs dispatch history.
- `GET /api/v1/broadcast/history`  
  Retrieves past cellular emergency dispatches.

---

## 4. Frontend Features & Components

1. **Executive Navigation Header (`Header.tsx`):**  
   Government emblems, real-time Live Sync badge tracking REST API ping latency in milliseconds, persona indicator, and quick launch triggers.
2. **Interactive 52-Week Scrubber (`ScrubberBar.tsx`):**  
   Continuous slider across epidemiological weeks 1–52 with auto-play playback, milestone markers (pre-monsoon thermal, monsoon flood, post-monsoon dengue surge).
3. **Dynamic Maharashtra Vector Map (`MapView.tsx`):**  
   Choropleth vector SVG map of Maharashtra with animated radar ping rings (`animate-pulse-radar`) and blinking beacon markers over high-risk clusters.
4. **Target Districts Command Cards (`DistrictCard.tsx`):**  
   Filtering by risk level, PHC coverage gauges, dominant hazard indicators, and quick-inspection select.
5. **Multi-Engine Consensus Card (`MultiEngineConsensus.tsx`):**  
   Displays ensemble consensus agreement score alongside Vector, Water, and Thermal stress engine gauges.
6. **Probabilistic Forecast Drawer (`ForecastDrawer.tsx`):**  
   Recharts composed area/line visualization with 7-, 14-, 30-day horizons, 95% uncertainty interval bands, and statutory health advisories.
7. **"Why Flagged?" SHAP Evidence Drawer (`ShapDrawer.tsx`):**  
   XAI attribution waterfall bars explaining climate lag drivers and clinical response guidance.
8. **What-If Policy Sandbox Modal (`WhatIfSandbox.tsx`):**  
   Interactive sliders for temperature anomalies, rain shocks, fogging coverage, and water chlorination with live-computed economic impact.
9. **C-DoT / SACHET Broadcast Dispatcher (`BroadcastModal.tsx`):**  
   Ward selection, citizen reach estimation, cell tower count, bilingual Marathi & English live preview, and CAP v1.2 XML/JSON inspector.
10. **Governance Lifecycle Modal (`AlertAuditModal.tsx`):**  
    Incident status transition form and immutable audit log viewer.
11. **Role-Based Auth Switcher (`AuthModal.tsx`):**  
    One-click switching between:
    - **Dr. Rajesh G. Deshmukh** (District Surveillance Officer, Pune) — `dso.pune@maharashtra.gov.in`
    - **Dr. Snehal Patil** (Medical Officer, Haveli PHC) — `phc.haveli@maharashtra.gov.in`
    - **Dr. Pradeep Vyas** (State Director, IDSP Maharashtra) — `admin.idsp@maharashtra.gov.in`

---

## 5. Running the Application

### Method 1: One-Click Startup Script (Windows)
Double-click:
```cmd
start.bat
```

### Method 2: Manual Terminal Commands

**Backend Server:**
```bash
cd backend
..\venv\Scripts\python.exe run.py
```
*API will run on: http://127.0.0.1:8000 (Interactive OpenAPI Swagger docs at `/docs`)*

**Frontend Dashboard:**
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend UI will run on: http://127.0.0.1:5173*
