import math
import datetime
from typing import Dict, List, Any
from ..schemas.simulation import SimulationRunRequest, SimulationRunResponse, SimulatedPoint
from .data_generator import get_surveillance_summary

def run_counterfactual_simulation(req: SimulationRunRequest) -> Dict[str, Any]:
    district_id = req.district_id or "pune"
    disease = req.disease or "Dengue"
    temp_shift = req.temp_shift
    rain_shift = req.rain_shift
    fogging = req.fogging_coverage
    chlorination = req.chlorination_coverage

    summary = get_surveillance_summary(district_id, week=44)
    base_cases = 120
    for d in summary["diseases"]:
        if d["disease"].lower() == disease.lower():
            base_cases = d["observed_cases"]
            break

    # Calculate climate multiplier
    # Vector: higher temp (up to +2) and more rain increases transmission; cooling or extreme heat decreases
    if disease.lower() in ["dengue", "malaria"]:
        climate_factor = 1.0 + (temp_shift * 0.08) + ((rain_shift / 100.0) * 0.45)
        # Fogging intervention efficacy: up to 62% reduction at 100% coverage
        intervention_reduction = (fogging / 100.0) * 0.62
    elif disease.lower() in ["cholera", "leptospirosis"]:
        climate_factor = 1.0 + ((rain_shift / 100.0) * 0.70)
        # Chlorination intervention efficacy: up to 74% reduction at 100% coverage
        intervention_reduction = (chlorination / 100.0) * 0.74
    else: # Thermal Stress
        climate_factor = 1.0 + (temp_shift * 0.18)
        # Cooling shelters and ORS corners
        intervention_reduction = ((fogging + chlorination) / 200.0) * 0.50

    net_multiplier = max(0.20, climate_factor * (1.0 - intervention_reduction))

    trajectory: List[SimulatedPoint] = []
    base_date = datetime.date(2026, 10, 31)

    total_base_cases = 0
    total_sim_cases = 0

    for day in range(1, 31):
        cur_date = base_date + datetime.timedelta(days=day)
        
        # Unmitigated baseline curve
        base_curve = int(base_cases * (1.0 + 0.028 * day) + math.sin(day * 0.4) * 5)
        base_curve = max(5, base_curve)

        # Counterfactual simulated curve
        sim_curve = int(base_curve * net_multiplier)
        sim_curve = max(2, sim_curve)

        averted = max(0, base_curve - sim_curve)
        total_base_cases += base_curve
        total_sim_cases += sim_curve

        trajectory.append(
            SimulatedPoint(
                day=day,
                date_str=cur_date.strftime("%d %b"),
                baseline_cases=base_curve,
                simulated_cases=sim_curve,
                averted_cases=averted
            )
        )

    cases_averted = max(0, total_base_cases - total_sim_cases)
    risk_reduction_pct = round(((total_base_cases - total_sim_cases) / max(1, total_base_cases)) * 100, 1)
    
    # Public health impact metrics
    # Avg 4.5 hospital bed days per acute dengue/cholera case
    hospital_bed_days_saved = int(cases_averted * 4.5)
    # Estimated direct treatment & loss-of-labor cost: INR 18,500 per hospitalized case
    cost_savings_inr = int(cases_averted * 18500)

    summary_text = (
        f"Simulating a {temp_shift:+.1f}°C temperature shift and {rain_shift:+.1f}% rainfall shock "
        f"with {fogging}% vector fogging and {chlorination}% chlorination coverage. "
        f"Yields {cases_averted} cumulative averted cases (-{risk_reduction_pct}% caseload) "
        f"over 30 days, freeing {hospital_bed_days_saved} district hospital bed-days."
    )

    return {
        "district_id": district_id,
        "disease": disease,
        "temp_shift": temp_shift,
        "rain_shift": rain_shift,
        "fogging_coverage": fogging,
        "chlorination_coverage": chlorination,
        "baseline_caseload_30d": total_base_cases,
        "simulated_caseload_30d": total_sim_cases,
        "cases_averted": cases_averted,
        "risk_score_reduction_pct": risk_reduction_pct,
        "hospital_bed_days_saved": hospital_bed_days_saved,
        "estimated_cost_savings_inr": cost_savings_inr,
        "intervention_summary": summary_text,
        "trajectory": trajectory
    }
