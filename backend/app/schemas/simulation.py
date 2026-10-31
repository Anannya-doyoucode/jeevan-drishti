from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SimulationRunRequest(BaseModel):
    temp_shift: float = Field(default=0.0, description="Temperature anomaly in degrees C (-5 to +5)")
    rain_shift: float = Field(default=0.0, description="Precipitation shock in percent (-50% to +100%)")
    fogging_coverage: int = Field(default=0, ge=0, le=100, description="PHC Ultra-Low Volume Fogging Coverage %")
    chlorination_coverage: int = Field(default=0, ge=0, le=100, description="Water source super-chlorination %")
    district_id: Optional[str] = "pune"
    disease: Optional[str] = "Dengue"

class SimulatedPoint(BaseModel):
    day: int
    date_str: str
    baseline_cases: int
    simulated_cases: int
    averted_cases: int

class SimulationRunResponse(BaseModel):
    district_id: str
    disease: str
    temp_shift: float
    rain_shift: float
    fogging_coverage: int
    chlorination_coverage: int
    baseline_caseload_30d: int
    simulated_caseload_30d: int
    cases_averted: int
    risk_score_reduction_pct: float
    hospital_bed_days_saved: int
    estimated_cost_savings_inr: int
    intervention_summary: str
    trajectory: List[SimulatedPoint]
