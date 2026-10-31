import datetime
import math
from typing import Dict, List, Any
from ..config import TARGET_DISTRICTS, DISTRICT_LOOKUP

DISEASE_TYPES = [
    "Dengue",
    "Malaria",
    "Cholera",
    "Thermal Stress",
    "Leptospirosis"
]

def get_climate_series(district_id: str, lags: int = 21) -> Dict[str, Any]:
    district = DISTRICT_LOOKUP.get(district_id, TARGET_DISTRICTS[0])
    base_lat = district["lat"]
    base_elev = district.get("elevation_m", 200)

    # Base temperatures and rainfall characteristics
    is_vidarbha = district_id == "nagpur"
    is_coastal = district_id in ["mumbai_suburban", "thane"]
    is_highland = district_id in ["pune", "nashik", "kolhapur"]

    now = datetime.date(2026, 10, 31)
    observations: List[Dict[str, Any]] = []

    cumulative_rain_30d = 0.0
    temp_sum = 0.0
    hum_sum = 0.0

    # Build 45 days of daily observations so lag windows up to 21d are fully populated
    for day_back in range(45, -1, -1):
        obs_date = now - datetime.timedelta(days=day_back)
        day_of_year = obs_date.timetuple().tm_yday
        
        # Monsoon pulse wave
        rain_wave = math.sin((day_of_year - 170) * (2 * math.pi / 180)) if 150 <= day_of_year <= 305 else -0.8
        rain_factor = max(0.0, rain_wave)

        if is_coastal:
            daily_rain = round(rain_factor * 38.0 + (day_back % 7 == 0) * 18.0, 1)
            t_max = round(32.5 + math.sin(day_back * 0.4) * 1.5, 1)
            t_min = round(24.0 + math.cos(day_back * 0.3) * 1.0, 1)
            humidity = round(78.0 + (daily_rain > 5) * 12.0 + math.sin(day_back * 0.2) * 5.0, 1)
        elif is_vidarbha:
            daily_rain = round(rain_factor * 22.0 + (day_back % 5 == 0) * 8.0, 1)
            t_max = round(36.8 + math.sin(day_back * 0.3) * 2.5, 1)
            t_min = round(22.5 + math.cos(day_back * 0.2) * 1.8, 1)
            humidity = round(55.0 + (daily_rain > 5) * 18.0 + math.sin(day_back * 0.3) * 8.0, 1)
        else: # Pune, Nashik, Kolhapur
            daily_rain = round(rain_factor * 28.0 + (day_back % 6 == 0) * 12.0, 1)
            t_max = round(31.2 + math.sin(day_back * 0.3) * 2.0, 1)
            t_min = round(19.8 + math.cos(day_back * 0.2) * 1.5, 1)
            humidity = round(72.0 + (daily_rain > 5) * 15.0 + math.sin(day_back * 0.3) * 6.0, 1)

        humidity = min(98.0, max(30.0, humidity))

        observations.append({
            "date": obs_date.isoformat(),
            "rainfall_mm": daily_rain,
            "temp_max_c": t_max,
            "temp_min_c": t_min,
            "humidity_pct": humidity,
            "rainfall_lag_7d": 0.0,
            "rainfall_lag_14d": 0.0,
            "rainfall_lag_21d": 0.0,
            "humidity_lag_14d": 0.0,
        })

    # Compute actual lag alignments
    for i in range(len(observations)):
        observations[i]["rainfall_lag_7d"] = observations[i - 7]["rainfall_mm"] if i >= 7 else observations[0]["rainfall_mm"]
        observations[i]["rainfall_lag_14d"] = observations[i - 14]["rainfall_mm"] if i >= 14 else observations[0]["rainfall_mm"]
        observations[i]["rainfall_lag_21d"] = observations[i - 21]["rainfall_mm"] if i >= 21 else observations[0]["rainfall_mm"]
        observations[i]["humidity_lag_14d"] = observations[i - 14]["humidity_pct"] if i >= 14 else observations[0]["humidity_pct"]

    # Filter down to requested slice (last 30 days)
    recent_slice = observations[-30:]
    for obs in recent_slice:
        cumulative_rain_30d += obs["rainfall_mm"]
        temp_sum += obs["temp_max_c"]
        hum_sum += obs["humidity_pct"]

    n = len(recent_slice) or 1
    return {
        "district_id": district_id,
        "district_name": district["name"],
        "lag_days": lags,
        "summary_rain_30d_mm": round(cumulative_rain_30d, 1),
        "avg_temp_c": round(temp_sum / n, 1),
        "avg_humidity_pct": round(hum_sum / n, 1),
        "observations": recent_slice
    }


def get_surveillance_summary(district_id: str, week: int = 44) -> Dict[str, Any]:
    district = DISTRICT_LOOKUP.get(district_id, TARGET_DISTRICTS[0])
    
    # Calculate seasonal multiplier based on week (1 to 52)
    # Week 44 = late October (post-monsoon dengue peak in urban areas)
    week_clamped = max(1, min(52, week))
    
    # Base district risk factors
    district_risk_weights = {
        "pune": {"Dengue": 2.4, "Malaria": 1.3, "Cholera": 0.9, "Thermal Stress": 0.6, "Leptospirosis": 1.1},
        "mumbai_suburban": {"Dengue": 2.2, "Malaria": 1.7, "Cholera": 2.5, "Thermal Stress": 0.7, "Leptospirosis": 2.8},
        "nagpur": {"Dengue": 1.2, "Malaria": 1.1, "Cholera": 0.8, "Thermal Stress": 3.1, "Leptospirosis": 0.5},
        "nashik": {"Dengue": 1.6, "Malaria": 1.2, "Cholera": 1.0, "Thermal Stress": 1.1, "Leptospirosis": 0.7},
        "kolhapur": {"Dengue": 1.8, "Malaria": 1.1, "Cholera": 2.4, "Thermal Stress": 0.5, "Leptospirosis": 2.2},
        "chhatrapati_sambhajinagar": {"Dengue": 1.1, "Malaria": 0.9, "Cholera": 0.7, "Thermal Stress": 1.4, "Leptospirosis": 0.4},
        "thane": {"Dengue": 1.9, "Malaria": 1.5, "Cholera": 1.8, "Thermal Stress": 0.8, "Leptospirosis": 1.9},
    }

    weights = district_risk_weights.get(district_id, district_risk_weights["pune"])
    
    # Base seasonal curves
    # Vector-borne peaks weeks 30-46
    vector_curve = math.exp(-((week_clamped - 38) ** 2) / 60.0)
    # Water-borne peaks weeks 26-36 (heavy monsoon flooding)
    water_curve = math.exp(-((week_clamped - 30) ** 2) / 45.0)
    # Thermal peaks weeks 14-23 (April-May)
    thermal_curve = math.exp(-((week_clamped - 18) ** 2) / 30.0)

    diseases_data = []
    max_risk_score = 0
    dominant_disease = "Dengue"

    for disease in DISEASE_TYPES:
        if disease in ["Dengue", "Malaria"]:
            curve = vector_curve
            base_norm = 140 if disease == "Dengue" else 65
        elif disease in ["Cholera", "Leptospirosis"]:
            curve = water_curve
            base_norm = 45 if disease == "Cholera" else 28
        else: # Thermal Stress
            curve = thermal_curve
            base_norm = 55

        weight = weights.get(disease, 1.0)
        baseline = int(base_norm * (0.6 + 0.5 * math.sin(week_clamped * 0.12)))
        observed = int(baseline * (0.8 + 1.6 * curve * weight) + (math.sin(week_clamped * 1.5 + hash(disease) % 5) * 12))
        observed = max(2, observed)
        threshold = int(baseline * 1.35)

        wow_pct = round(((observed - baseline) / max(1, baseline)) * 100, 1)

        if observed > threshold * 1.25:
            status = "OUTBREAK"
            score = 90
        elif observed > threshold:
            status = "ALERT"
            score = 75
        elif observed > baseline * 1.1:
            status = "WATCH"
            score = 50
        else:
            status = "NORMAL"
            score = 25

        if score > max_risk_score:
            max_risk_score = score
            dominant_disease = disease

        diseases_data.append({
            "disease": disease,
            "observed_cases": observed,
            "endemic_baseline_5yr": baseline,
            "threshold_alert": threshold,
            "status": status,
            "wow_change_pct": wow_pct,
        })

    # Build weekly trend across 12 recent epidemiological weeks
    weekly_trend = []
    start_wk = max(1, week_clamped - 11)
    for wk in range(start_wk, week_clamped + 1):
        w_curve = math.exp(-((wk - 38) ** 2) / 60.0)
        base = int(140 * (0.6 + 0.5 * math.sin(wk * 0.12)))
        obs = int(base * (0.8 + 1.6 * w_curve * weights.get("Dengue", 1.0)))
        weekly_trend.append({
            "week": wk,
            "observed": max(15, obs),
            "baseline": base,
            "threshold": int(base * 1.35),
        })

    # Alert state mapping
    if max_risk_score >= 80:
        alert_state = "CONFIRMED"
    elif max_risk_score >= 60:
        alert_state = "UNDER_REVIEW"
    elif max_risk_score >= 40:
        alert_state = "NEW"
    else:
        alert_state = "CLOSED"

    total_phcs = district.get("phc_count", 75)
    cov_pct = district.get("phc_reporting_coverage_pct", 92.0)
    reporting_phcs = int(total_phcs * (cov_pct / 100.0))

    return {
        "district_id": district_id,
        "district_name": district["name"],
        "week_number": week_clamped,
        "year": 2026,
        "reporting_phcs": reporting_phcs,
        "total_phcs": total_phcs,
        "coverage_pct": cov_pct,
        "alert_state": alert_state,
        "alert_id": f"ALT-{district_id[:3].upper()}-2026-W{week_clamped}",
        "dominant_disease": dominant_disease,
        "overall_risk_score": max_risk_score,
        "diseases": diseases_data,
        "weekly_trend": weekly_trend,
    }
