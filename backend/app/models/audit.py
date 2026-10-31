import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from ..database import Base

class AlertAuditTrail(Base):
    __tablename__ = "alert_audit_trails"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_id = Column(String(64), index=True, nullable=False)
    district_id = Column(String(64), index=True, nullable=False)
    disease = Column(String(64), nullable=False)
    previous_state = Column(String(32), nullable=False)
    new_state = Column(String(32), nullable=False)
    action_by = Column(String(128), nullable=False)
    role = Column(String(64), nullable=False)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class CellBroadcastLog(Base):
    __tablename__ = "cell_broadcast_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    broadcast_id = Column(String(64), unique=True, index=True, nullable=False)
    district_id = Column(String(64), index=True, nullable=False)
    disease_hazard = Column(String(64), nullable=False)
    alert_severity = Column(String(32), default="Severe")
    marathi_message = Column(Text, nullable=False)
    english_message = Column(Text, nullable=False)
    target_wards = Column(Text, nullable=False)
    estimated_population = Column(Integer, default=0)
    cell_towers_activated = Column(Integer, default=0)
    cap_payload_json = Column(Text, nullable=False)
    status = Column(String(32), default="DISPATCHED")
    dispatched_by = Column(String(128), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
