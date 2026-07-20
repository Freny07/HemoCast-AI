# 🩸 HemoCast AI

> **AI-Powered Blood Forecasting to Prevent Critical Shortages.**
> Built for the **ImpactForge Hackathon** (July 2026).

HemoCast AI shifts blood banking operations from reactive tracking to proactive, predictive procurement. By forecasting regional deficits 1–7 days in advance, the system enables blood bank directors and hospitals to pre-position resources, minimize wastage of short-shelf-life products like platelets, and recruit donors with precision — eliminating alert fatigue.

---

## ✨ Core Features

1. **🔮 AI Demand Forecasting** — Interactive demand curves with a 95% confidence interval band. Granular daily (7-day), weekly (6-week), and monthly (6-month) horizons powered by a Random Forest regressor.
2. **🤖 Explainable AI (XAI)** — Transparent feature attribution panels connecting platelet demand spikes to post-monsoon dengue cycles and O+/O- surges to festival-season road traffic.
3. **🎯 Precision Donor Recruiter** — Ranks local volunteer donors by proximity, strict 90-day cooldown timelines, and predicted response likelihood to prevent over-messaging.
4. **🚑 Hospital Portal & One-Tap Emergency SOS** — Standard replenishment orders or real-time SOS broadcasts that instantly match universal O- donors and page nearby blood banks.
5. **🗺️ Interactive Coverage Map** — SVG-based district map displaying active donation camps, hospitals, and blood banks with live status overlays.
6. **💬 NLP Chatbot Assistant** — Persistent site-wide assistant that parses natural language queries and fetches stock stats, forecast details, and emergency guides directly from the database.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** — development server and build tool
- **Tailwind CSS v4** — fluid design system & glassmorphism
- **Recharts** — vector-based forecasting graphs
- **Lucide React** — icon library

### Backend
- **FastAPI** — Python REST API
- **SQLite** with **SQLAlchemy ORM**
- **Scikit-learn** & **Pandas** — regression model fitting & feature engineering

---

## 📊 Machine Learning Model

The prediction engine trains on 365 days of seeded historical data per district, using:

| Feature | Description |
|---|---|
| **Lag Features** | 7-day and 1-day demand lag for momentum detection |
| **Environmental Markers** | Monthly avg. temperature and rainfall percentages |
| **Disease Surveillance** | Mosquito larval counts and vector-borne caseloads (Dengue/Malaria) |
| **Clinical Schedules** | Aggregated upcoming major elective surgeries |
| **Festival Calendar** | Road safety flags during high-traffic holidays |

A **Random Forest Regressor** fits these inputs to predict upcoming units required per blood group and component.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **Python** v3.10+

### 1. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with 1 year of historical data and demo accounts
python seed.py

# Start the FastAPI server at http://localhost:8000
python -m uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend

npm install
npm run dev
# Runs at http://localhost:5173
```

### Demo Accounts

Use the **Quick Login** buttons on the Sign In page to instantly access any portal:

| Role | Username | Password |
|---|---|---|
| Blood Bank Staff | `bank` | `password123` |
| Hospital Staff | `hospital` | `password123` |
| Volunteer Donor | `donor` | `password123` |
| Admin | `admin` | `password123` |

---

## 🏆 Hackathon Evaluation Alignment

Visit the **Evaluation Hub** in the app sidebar to see how HemoCast AI maps to ImpactForge rubrics:

| Criterion | Weight | HemoCast Approach |
|---|---|---|
| Build Quality | 30% | Full-stack TypeScript + FastAPI, clean SQLite schema, Random Forest regression |
| Real-World Impact | 25% | Proactive stock management, platelet wastage prevention, SMS fallback |
| Creativity & Approach | 20% | Explainable AI panels replacing black-box forecasts |
| User Experience | 15% | Role-specific portals for Donors, Doctors, and Bank Staff |
| Clarity of Submission | 10% | Fully seeded sandbox for seamless judge evaluation |

---

*HemoCast AI — Securing tomorrow's blood supply, one prediction at a time.*
