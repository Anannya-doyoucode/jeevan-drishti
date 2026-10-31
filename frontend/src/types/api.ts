export interface DistrictMetadata {
  id: string;
  name: string;
  marathi_name: string;
  division: string;
  hq: string;
  lat: number;
  lng: number;
  population: number;
  phc_count: number;
  phc_reporting_coverage_pct: number;
  current_risk_level: 'HIGH' | 'MODERATE' | 'LOW';
  dominant_hazard: 'Vector-Borne' | 'Water-Borne' | 'Thermal Stress';
  active_hotspot_ward: string;
  elevation_m: number;
}

export interface DiseaseCaseMetric {
  disease: string;
  observed_cases: number;
  endemic_baseline_5yr: number;
  threshold_alert: number;
  status: 'NORMAL' | 'WATCH' | 'ALERT' | 'OUTBREAK';
  wow_change_pct: number;
}

export interface WeeklyTrendPoint {
  week: number;
  observed: number;
  baseline: number;
  threshold: number;
}

export interface SurveillanceSummaryResponse {
  district_id: string;
  district_name: string;
  week_number: number;
  year: number;
  reporting_phcs: number;
  total_phcs: number;
  coverage_pct: number;
  alert_state: 'NEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED' | 'CLOSED';
  alert_id: string;
  dominant_disease: string;
  overall_risk_score: number;
  diseases: DiseaseCaseMetric[];
  weekly_trend: WeeklyTrendPoint[];
}

export interface ClimateLagMetric {
  date: string;
  rainfall_mm: number;
  temp_max_c: number;
  temp_min_c: number;
  humidity_pct: number;
  rainfall_lag_7d: number;
  rainfall_lag_14d: number;
  rainfall_lag_21d: number;
  humidity_lag_14d: number;
}

export interface ClimateObservationsResponse {
  district_id: string;
  district_name: string;
  lag_days: number;
  summary_rain_30d_mm: number;
  avg_temp_c: number;
  avg_humidity_pct: number;
  observations: ClimateLagMetric[];
}

export interface EngineRiskScore {
  engine_name: 'Vector-Borne Engine' | 'Water-Borne Engine' | 'Thermal Stress Engine' | string;
  risk_score: number;
  risk_category: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence_pct: number;
  key_trigger: string;
}

export interface ForecastPoint {
  day_offset: number;
  date_str: string;
  predicted_cases: number;
  lower_bound: number;
  upper_bound: number;
  historical_or_forecast: 'HISTORICAL' | 'FORECAST';
}

export interface ModelPredictionResponse {
  district_id: string;
  district_name: string;
  disease: string;
  horizon_days: number;
  current_observed: number;
  consensus_score_pct: number;
  consensus_label: string;
  dominant_engine: string;
  engine_scores: EngineRiskScore[];
  forecast_trajectory: ForecastPoint[];
  advisory_recommendation: string;
}

export interface ShapFeatureWeight {
  feature_name: string;
  display_label: string;
  shap_value: number;
  percentage_contribution: number;
  direction: 'POSITIVE' | 'NEGATIVE';
  category: 'CLIMATE_LAG' | 'DEMOGRAPHIC' | 'SEASONALITY' | 'HEALTHCARE_SYSTEM';
  context_text: string;
}

export interface ExplainabilityResponse {
  district_id: string;
  district_name: string;
  disease: string;
  base_risk_value: number;
  predicted_risk_score: number;
  why_flagged_summary: string;
  top_features: ShapFeatureWeight[];
}

export interface SimulationRunRequest {
  temp_shift: number;
  rain_shift: number;
  fogging_coverage: number;
  chlorination_coverage: number;
  district_id?: string;
  disease?: string;
}

export interface SimulatedPoint {
  day: number;
  date_str: string;
  baseline_cases: number;
  simulated_cases: number;
  averted_cases: number;
}

export interface SimulationRunResponse {
  district_id: string;
  disease: string;
  temp_shift: number;
  rain_shift: number;
  fogging_coverage: number;
  chlorination_coverage: number;
  baseline_caseload_30d: number;
  simulated_caseload_30d: number;
  cases_averted: number;
  risk_score_reduction_pct: number;
  hospital_bed_days_saved: number;
  estimated_cost_savings_inr: number;
  intervention_summary: string;
  trajectory: SimulatedPoint[];
}

export interface AuditTrailEntry {
  id: number;
  alert_id: string;
  district_id: string;
  disease: string;
  previous_state: string;
  new_state: string;
  action_by: string;
  role: string;
  notes?: string;
  timestamp: string;
}

export interface AlertLifecycleRequest {
  alert_id: string;
  district_id: string;
  disease: string;
  new_state: 'NEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED' | 'CLOSED';
  action_by: string;
  role: string;
  notes?: string;
}

export interface AlertLifecycleResponse {
  success: boolean;
  message: string;
  alert_id: string;
  current_state: string;
  audit_entry: AuditTrailEntry;
}

export interface BroadcastDispatchRequest {
  district_id: string;
  disease_hazard: string;
  alert_severity?: string;
  target_wards: string[];
  custom_instruction?: string;
  dispatched_by: string;
}

export interface BroadcastDispatchResponse {
  broadcast_id: string;
  status: string;
  timestamp: string;
  target_district: string;
  target_district_name: string;
  estimated_population: number;
  cell_towers_activated: number;
  marathi_message: string;
  english_message: string;
  cap_xml_payload: string;
  cap_json_payload: Record<string, any>;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  designation: string;
  role: 'DSO' | 'PHC_OFFICER' | 'STATE_ADMIN';
  jurisdiction: string;
  badge_label: string;
  avatar_color: string;
}
