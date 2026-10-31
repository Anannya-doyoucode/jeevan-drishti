from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EngineRiskScore(BaseModel):
    engine_name: str  # Vector-Borne, Water-Borne, Thermal Stress
    risk_score: int   # 0 to 100
    risk_category: str  # LOW, MODERATE, HIGH, CRITICAL
    confidence_pct: int
    key_trigger: str

class ForecastPoint(BaseModel):
    day_offset: int
    date_str: str
    predicted_cases: int
    lower_bound: int
    upper_bound: int
    historical_or_forecast: str  # HISTORICAL, FORECAST

class ModelPredictionResponse(BaseModel):
    district_id: str
    district_name: str
    disease: str
    horizon_days: int
    current_observed: int
    consensus_score_pct: int
    consensus_label: str
    dominant_engine: str
    engine_scores: List[EngineRiskScore]
    forecast_trajectory: List[ForecastPoint]
    advisory_recommendation: str

class ShapFeatureWeight(BaseModel):
    feature_name: str
    display_label: str
    shap_value: float
    percentage_contribution: float
    direction: str  # POSITIVE (+Risk) or NEGATIVE (-Risk)
    category: str   # CLIMATE_LAG, DEMOGRAPHIC, EPIDEMIOLOGICAL, HEALTHCARE_SYSTEM
    context_text: str

class ExplainabilityResponse(BaseModel):
    district_id: str
    district_name: str
    disease: str
    base_risk_value: float
    predicted_risk_score: int
    why_flagged_summary: str
    top_features: List[ShapFeatureWeight]
