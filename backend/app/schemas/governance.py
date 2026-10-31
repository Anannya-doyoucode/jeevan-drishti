from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AlertLifecycleRequest(BaseModel):
    alert_id: str
    district_id: str
    disease: str
    new_state: str  # NEW -> UNDER_REVIEW -> CONFIRMED / DISMISSED -> CLOSED
    action_by: str
    role: str
    notes: Optional[str] = "Status updated via Jeevan-Drishti Decision Cockpit."

class AuditTrailEntry(BaseModel):
    id: int
    alert_id: str
    district_id: str
    disease: str
    previous_state: str
    new_state: str
    action_by: str
    role: str
    notes: Optional[str]
    timestamp: str

class AlertLifecycleResponse(BaseModel):
    success: bool
    message: str
    alert_id: str
    current_state: str
    audit_entry: AuditTrailEntry

class BroadcastDispatchRequest(BaseModel):
    district_id: str
    disease_hazard: str
    alert_severity: str = "Severe"  # Extreme, Severe, Moderate, Minor
    target_wards: List[str]
    custom_instruction: Optional[str] = None
    dispatched_by: str = "dso.pune@maharashtra.gov.in"

class BroadcastDispatchResponse(BaseModel):
    broadcast_id: str
    status: str
    timestamp: str
    target_district: str
    target_district_name: str
    estimated_population: int
    cell_towers_activated: int
    marathi_message: str
    english_message: str
    cap_xml_payload: str
    cap_json_payload: Dict[str, Any]
