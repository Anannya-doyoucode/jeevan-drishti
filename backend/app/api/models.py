from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ..schemas.prediction import ModelPredictionResponse, ExplainabilityResponse
from ..services.ml_engine import predict_disease_trajectory
from ..services.shap_explainer import get_shap_explainability
from ..config import DISTRICT_LOOKUP

router = APIRouter(prefix="/api/v1/models", tags=["Machine Learning Engine"])

@router.get("/predict", response_model=ModelPredictionResponse)
def get_prediction(
    district_id: Optional[str] = Query("pune", description="District identifier"),
    disease: Optional[str] = Query("Dengue", description="Disease entity"),
    horizon: Optional[int] = Query(30, ge=7, le=30, description="Forecast horizon in days (7, 14, 30)")
):
    """
    Returns 7-, 14-, and 30-day forecast trajectories with 95% uncertainty intervals.
    Returns risk scores across 3 specialist engines: Vector-Borne, Water-Borne, and Thermal Stress.
    Returns engine agreement consensus score (e.g. 78% Consensus).
    """
    if district_id not in DISTRICT_LOOKUP:
        district_id = "pune"
    prediction = predict_disease_trajectory(district_id=district_id, disease=disease, horizon=horizon)
    return ModelPredictionResponse(**prediction)

@router.get("/explainability", response_model=ExplainabilityResponse)
def get_explainability(
    district_id: Optional[str] = Query("pune", description="District identifier"),
    disease: Optional[str] = Query("Dengue", description="Disease entity")
):
    """
    Returns SHAP feature importance weights for the 'Why Flagged?' evidence drawer
    (e.g., Rainfall Lag (+42%), Humidity (+28%)).
    """
    if district_id not in DISTRICT_LOOKUP:
        district_id = "pune"
    expl = get_shap_explainability(district_id=district_id, disease=disease)
    return ExplainabilityResponse(**expl)
