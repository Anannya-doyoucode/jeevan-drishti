from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.audit import AlertAuditTrail, CellBroadcastLog
from ..schemas.governance import (
    AlertLifecycleRequest,
    AlertLifecycleResponse,
    AuditTrailEntry,
    BroadcastDispatchRequest,
    BroadcastDispatchResponse
)
from ..services.governance_service import update_alert_lifecycle, dispatch_cell_broadcast

router = APIRouter(prefix="/api/v1", tags=["Governance & Cell Broadcast"])

@router.post("/alerts/lifecycle", response_model=AlertLifecycleResponse)
def modify_alert_state(
    payload: AlertLifecycleRequest,
    db: Session = Depends(get_db)
):
    """
    Updates alert state (NEW -> UNDER_REVIEW -> CONFIRMED / DISMISSED -> CLOSED)
    and appends to SQLite/PostgreSQL audit trail.
    """
    return update_alert_lifecycle(payload, db)

@router.get("/alerts/audit-trail", response_model=List[AuditTrailEntry])
def get_audit_trail(
    district_id: Optional[str] = Query(None, description="Optional district filter"),
    db: Session = Depends(get_db)
):
    """Returns the persistent governance audit trail of alert modifications."""
    query = db.query(AlertAuditTrail).order_by(AlertAuditTrail.id.desc())
    if district_id:
        query = query.filter(AlertAuditTrail.district_id == district_id)
    records = query.limit(50).all()
    
    return [
        AuditTrailEntry(
            id=r.id,
            alert_id=r.alert_id,
            district_id=r.district_id,
            disease=r.disease,
            previous_state=r.previous_state,
            new_state=r.new_state,
            action_by=r.action_by,
            role=r.role,
            notes=r.notes,
            timestamp=r.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        )
        for r in records
    ]

@router.post("/broadcast/dispatch", response_model=BroadcastDispatchResponse)
def trigger_broadcast(
    payload: BroadcastDispatchRequest,
    db: Session = Depends(get_db)
):
    """
    Triggers C-DoT / SACHET Cell Broadcast simulation payload with
    CAP v1.2 standard XML/JSON and Marathi/English alerts.
    """
    return dispatch_cell_broadcast(payload, db)

@router.get("/broadcast/history")
def get_broadcast_history(db: Session = Depends(get_db)):
    """Returns the list of dispatched emergency cell broadcasts."""
    records = db.query(CellBroadcastLog).order_by(CellBroadcastLog.id.desc()).limit(20).all()
    return [
        {
            "id": r.id,
            "broadcast_id": r.broadcast_id,
            "district_id": r.district_id,
            "disease_hazard": r.disease_hazard,
            "alert_severity": r.alert_severity,
            "estimated_population": r.estimated_population,
            "cell_towers_activated": r.cell_towers_activated,
            "status": r.status,
            "dispatched_by": r.dispatched_by,
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "marathi_message": r.marathi_message,
            "english_message": r.english_message
        }
        for r in records
    ]
