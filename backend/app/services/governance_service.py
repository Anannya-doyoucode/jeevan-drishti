import uuid
import datetime
import json
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from ..models.audit import AlertAuditTrail, CellBroadcastLog
from ..config import DISTRICT_LOOKUP, TARGET_DISTRICTS, CAP_BROADCAST_CONFIG
from ..schemas.governance import (
    AlertLifecycleRequest,
    AlertLifecycleResponse,
    AuditTrailEntry,
    BroadcastDispatchRequest,
    BroadcastDispatchResponse
)

def update_alert_lifecycle(req: AlertLifecycleRequest, db: Session) -> AlertLifecycleResponse:
    # Fetch most recent state for this alert or default to NEW
    latest_entry = (
        db.query(AlertAuditTrail)
        .filter(AlertAuditTrail.alert_id == req.alert_id)
        .order_by(AlertAuditTrail.id.desc())
        .first()
    )
    prev_state = latest_entry.new_state if latest_entry else "NEW"

    # Create new audit entry
    new_audit = AlertAuditTrail(
        alert_id=req.alert_id,
        district_id=req.district_id,
        disease=req.disease,
        previous_state=prev_state,
        new_state=req.new_state,
        action_by=req.action_by,
        role=req.role,
        notes=req.notes or f"Transitioned from {prev_state} to {req.new_state}",
        timestamp=datetime.datetime.utcnow()
    )
    db.add(new_audit)
    db.commit()
    db.refresh(new_audit)

    audit_entry = AuditTrailEntry(
        id=new_audit.id,
        alert_id=new_audit.alert_id,
        district_id=new_audit.district_id,
        disease=new_audit.disease,
        previous_state=new_audit.previous_state,
        new_state=new_audit.new_state,
        action_by=new_audit.action_by,
        role=new_audit.role,
        notes=new_audit.notes,
        timestamp=new_audit.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
    )

    return AlertLifecycleResponse(
        success=True,
        message=f"Alert {req.alert_id} successfully updated to {req.new_state}",
        alert_id=req.alert_id,
        current_state=req.new_state,
        audit_entry=audit_entry
    )


def dispatch_cell_broadcast(req: BroadcastDispatchRequest, db: Session) -> BroadcastDispatchResponse:
    district = DISTRICT_LOOKUP.get(req.district_id, TARGET_DISTRICTS[0])
    b_id = f"SACHET-MAH-{req.district_id[:3].upper()}-{uuid.uuid4().hex[:6].upper()}"
    now_utc = datetime.datetime.utcnow()
    timestamp_str = now_utc.strftime("%Y-%m-%dT%H:%M:%S+05:30")

    # Estimate geo-fenced population & towers
    ward_count = len(req.target_wards) or 1
    est_pop = int((district["population"] / max(1, district["phc_count"])) * ward_count * 2.8)
    cell_towers = int(ward_count * 14 + 8)

    # Bilingual Marathi & English payload for Maharashtra State Health Department
    hazard_title = req.disease_hazard.upper()
    if "DENGUE" in hazard_title:
        marathi_msg = (
            f"⚠️ सार्वजनिक आरोग्य इशारा ({district['marathi_name']}): "
            f"आरोग्य विभागामार्फत {district['marathi_name']} जिल्ह्यातील निवडक प्रभागांमध्ये डेंग्यूच्या रुग्णसंख्येत वाढ नोंदवण्यात आली आहे. "
            f"साठवलेले पाणी त्वरित रिकामे करा, डास प्रतिबंधक उपाय करा आणि ताप आल्यास जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) मोफत रक्ततपासणी करून घ्या."
        )
        english_msg = (
            f"URGENT HEALTH ADVISORY ({district['name']}): "
            f"Surveillance detected an elevated Dengue outbreak index in targeted wards. "
            f"Eliminate artificial water containers, apply mosquito repellent, and report persistent fever to your nearest PHC immediately."
        )
    elif "CHOLERA" in hazard_title or "WATER" in hazard_title or "LEPTO" in hazard_title:
        marathi_msg = (
            f"⚠️ दूषित पाणी व कॉलरा प्रतिबंधक इशारा ({district['marathi_name']}): "
            f"पाणी उकळून व गाळून प्या. क्लोरीनच्या गोळ्यांचा वापर करा. उलट्या-जुलाब किंवा कावीळ सदृश लक्षणे आढळल्यास त्वरित ओआरएस (ORS) घ्या व आरोग्य केंद्राशी संपर्क साधा."
        )
        english_msg = (
            f"URGENT DRINKING WATER SAFETY ALERT ({district['name']}): "
            f"High bacterial contamination risk detected following floodwater runoff. "
            f"Boil drinking water for 10+ minutes. Collect free chlorine tablets from Asha workers and consume ORS for acute diarrhea."
        )
    else: # Thermal Stress / Heatstroke
        marathi_msg = (
            f"☀️ उष्णतेची लाट इशारा ({district['marathi_name']}): "
            f"दुपारी १२ ते ४ दरम्यान थेट उन्हात जाणे टाळा. मुबलक पाणी व ताक प्या. उष्माघाताची लक्षणे आढळल्यास थंड सावलीत विश्रांती घ्या व १०८ रुग्णवाहिका बोलवा."
        )
        english_msg = (
            f"SEVERE HEATWAVE ADVISORY ({district['name']}): "
            f"Ambient temperatures exceeding critical thresholds. Avoid direct sun exposure between 12 PM - 4 PM. "
            f"Stay hydrated and access free ORS corners at all municipal bus stands and PHCs."
        )

    # Construct CAP v1.2 Standard XML
    cap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>{b_id}</identifier>
  <sender>{CAP_BROADCAST_CONFIG['sender_id']}</sender>
  <sent>{timestamp_str}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Health</category>
    <event>{req.disease_hazard} Outbreak Warning</event>
    <urgency>Immediate</urgency>
    <severity>{req.alert_severity}</severity>
    <certainty>Observed</certainty>
    <headline>Govt of Maharashtra / C-DoT SACHET Public Health Broadcast</headline>
    <description>{english_msg}</description>
    <instruction>Report to designated PHC. Follow district surveillance guidelines.</instruction>
    <area>
      <areaDesc>{district['name']} - {', '.join(req.target_wards)}</areaDesc>
      <circle>{district['lat']},{district['lng']},15.0</circle>
    </area>
  </info>
  <info>
    <language>mr-IN</language>
    <category>Health</category>
    <event>{req.disease_hazard} साथरोग इशारा</event>
    <urgency>Immediate</urgency>
    <severity>{req.alert_severity}</severity>
    <headline>महाराष्ट्र शासन / सी-डॉट सचेत आरोग्य संदेश</headline>
    <description>{marathi_msg}</description>
    <area>
      <areaDesc>{district['marathi_name']}</areaDesc>
    </area>
  </info>
</alert>"""

    cap_json = {
        "identifier": b_id,
        "sender": CAP_BROADCAST_CONFIG["sender_id"],
        "sent": timestamp_str,
        "status": "Actual",
        "msgType": "Alert",
        "scope": "Public",
        "district": district["name"],
        "marathi_district": district["marathi_name"],
        "disease": req.disease_hazard,
        "severity": req.alert_severity,
        "target_wards": req.target_wards,
        "estimated_reach": est_pop,
        "cell_towers": cell_towers,
        "c_dot_channel": "CB-CH4370-EMERGENCY",
        "marathi_payload": marathi_msg,
        "english_payload": english_msg
    }

    # Save to database
    db_log = CellBroadcastLog(
        broadcast_id=b_id,
        district_id=req.district_id,
        disease_hazard=req.disease_hazard,
        alert_severity=req.alert_severity,
        marathi_message=marathi_msg,
        english_message=english_msg,
        target_wards=",".join(req.target_wards),
        estimated_population=est_pop,
        cell_towers_activated=cell_towers,
        cap_payload_json=json.dumps(cap_json),
        status="DISPATCHED",
        dispatched_by=req.dispatched_by,
        timestamp=now_utc
    )
    db.add(db_log)
    db.commit()

    return BroadcastDispatchResponse(
        broadcast_id=b_id,
        status="DISPATCHED",
        timestamp=timestamp_str,
        target_district=district["id"],
        target_district_name=district["name"],
        estimated_population=est_pop,
        cell_towers_activated=cell_towers,
        marathi_message=marathi_msg,
        english_message=english_msg,
        cap_xml_payload=cap_xml,
        cap_json_payload=cap_json
    )
