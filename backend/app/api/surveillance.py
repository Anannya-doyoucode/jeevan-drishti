from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ..config import TARGET_DISTRICTS, DISTRICT_LOOKUP
from ..schemas.surveillance import (
    DistrictListResponse,
    DistrictMetadata,
    SurveillanceSummaryResponse,
    ClimateObservationsResponse
)
from ..services.data_generator import get_climate_series, get_surveillance_summary

router = APIRouter(prefix="/api/v1", tags=["Surveillance & Climate"])

@router.get("/districts", response_model=DistrictListResponse)
def list_districts():
    """Returns list of 7 target districts with metadata, current risk levels, and PHC reporting coverage."""
    districts = [DistrictMetadata(**d) for d in TARGET_DISTRICTS]
    return DistrictListResponse(total=len(districts), districts=districts)

@router.get("/surveillance/summary", response_model=SurveillanceSummaryResponse)
def get_summary(
    district_id: Optional[str] = Query("pune", description="Target district identifier"),
    week: Optional[int] = Query(44, ge=1, le=52, description="Epidemiological week (1-52)")
):
    """Returns latest observed disease cases, 5-year endemic baseline, and active alert state."""
    if district_id not in DISTRICT_LOOKUP:
        district_id = "pune"
    data = get_surveillance_summary(district_id=district_id, week=week)
    return SurveillanceSummaryResponse(**data)

@router.get("/climate/observations", response_model=ClimateObservationsResponse)
def get_climate_obs(
    district_id: Optional[str] = Query("pune", description="Target district identifier"),
    lags: Optional[int] = Query(21, description="Lag window in days")
):
    """Returns historical rainfall, temperature, and relative humidity aligned with disease lag windows."""
    if district_id not in DISTRICT_LOOKUP:
        district_id = "pune"
    data = get_climate_series(district_id=district_id, lags=lags)
    return ClimateObservationsResponse(**data)
