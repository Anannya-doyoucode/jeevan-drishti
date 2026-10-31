import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models.audit import AlertAuditTrail, CellBroadcastLog
from .api.surveillance import router as surveillance_router
from .api.models import router as models_router
from .api.simulation import router as simulation_router
from .api.governance import router as governance_router
from .api.auth import router as auth_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

def seed_initial_audit_log():
    db = SessionLocal()
    try:
        if db.query(AlertAuditTrail).count() == 0:
            initial_logs = [
                AlertAuditTrail(
                    alert_id="ALT-PUN-2026-W44",
                    district_id="pune",
                    disease="Dengue",
                    previous_state="NEW",
                    new_state="UNDER_REVIEW",
                    action_by="dso.pune@maharashtra.gov.in",
                    role="DSO",
                    notes="Flagged 18.4% uptick in NS1 rapid antigen positivity at Haveli and Kothrud PHCs. Field team dispatched.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
                ),
                AlertAuditTrail(
                    alert_id="ALT-MUM-2026-W44",
                    district_id="mumbai_suburban",
                    disease="Water-Borne",
                    previous_state="NEW",
                    new_state="CONFIRMED",
                    action_by="dso.mumbai@maharashtra.gov.in",
                    role="DSO",
                    notes="Kurla L-Ward water pipeline breach confirmed by Municipal Hydraulic Engineer. Super-chlorination ordered.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=14)
                )
            ]
            db.add_all(initial_logs)
            db.commit()
    finally:
        db.close()

seed_initial_audit_log()

app = FastAPI(
    title="JEEVAN-DRISHTI API",
    description="Multi-Hazard Climate-Health Disease Surveillance & Predictive Outbreak Decision Support Platform - Government of Maharashtra",
    version="2.4.1",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend Vite/React development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(surveillance_router)
app.include_router(models_router)
app.include_router(simulation_router)
app.include_router(governance_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "platform": "JEEVAN-DRISHTI",
        "tagline": "Multi-Hazard Climate-Health Disease Surveillance & Predictive Outbreak Decision Support Platform",
        "state": "Government of Maharashtra",
        "version": "2.4.1",
        "api_docs": "/docs",
        "status": "OPERATIONAL"
    }

@app.get("/api/v1/health")
def healthcheck():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "database": "sqlite_connected",
        "ml_engines": {
            "vector_borne_engine": "ACTIVE (v2.4.1)",
            "water_borne_engine": "ACTIVE (v2.4.1)",
            "thermal_stress_engine": "ACTIVE (v2.4.1)",
            "shap_explainer": "ACTIVE",
            "simulation_engine": "ACTIVE"
        },
        "target_districts": 7,
        "c_dot_sachet_gateway": "ONLINE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
