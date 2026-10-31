from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DistrictMetadata(BaseModel):
    id: str
    name: str
    marathi_name: str
    division: str
    hq: str
    lat: float
    lng: float
    population: int
    phc_count: int
    phc_reporting_coverage_pct: float
    current_risk_level: str
    dominant_hazard: str
    active_hotspot_ward: str
    elevation_m: int

class DistrictListResponse(BaseModel):
    total: int
    districts: List[DistrictMetadata]

class DiseaseCaseMetric(BaseModel):
    disease: str
    observed_cases: int
    endemic_baseline_5yr: int
    threshold_alert: int
    status: str  # NORMAL, WATCH, ALERT, OUTBREAK
    wow_change_pct: float

class WeeklyTrendPoint(BaseModel):
    week: int
    observed: int
    baseline: int
    threshold: int

class SurveillanceSummaryResponse(BaseModel):
    district_id: str
    district_name: str
    week_number: int
    year: int
    reporting_phcs: int
    total_phcs: int
    coverage_pct: float
    alert_state: str  # NEW, UNDER_REVIEW, CONFIRMED, DISMISSED, CLOSED
    alert_id: str
    dominant_disease: str
    overall_risk_score: int
    diseases: List[DiseaseCaseMetric]
    weekly_trend: List[WeeklyTrendPoint]

class ClimateLagMetric(BaseModel):
    date: str
    rainfall_mm: float
    temp_max_c: float
    temp_min_c: float
    humidity_pct: float
    rainfall_lag_7d: float
    rainfall_lag_14d: float
    rainfall_lag_21d: float
    humidity_lag_14d: float

class ClimateObservationsResponse(BaseModel):
    district_id: str
    district_name: str
    lag_days: int
    summary_rain_30d_mm: float
    avg_temp_c: float
    avg_humidity_pct: float
    observations: List[ClimateLagMetric]
