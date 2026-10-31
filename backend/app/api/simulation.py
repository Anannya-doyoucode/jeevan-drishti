from fastapi import APIRouter
from ..schemas.simulation import SimulationRunRequest, SimulationRunResponse
from ..services.simulation import run_counterfactual_simulation

router = APIRouter(prefix="/api/v1/simulation", tags=["Simulation & What-If Engine"])

@router.post("/run", response_model=SimulationRunResponse)
def run_simulation(payload: SimulationRunRequest):
    """
    Accepts body { temp_shift: float, rain_shift: float, fogging_coverage: int, chlorination_coverage: int }
    and returns simulated risk trajectory with public health impact.
    """
    result = run_counterfactual_simulation(payload)
    return SimulationRunResponse(**result)
