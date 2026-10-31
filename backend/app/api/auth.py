from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/v1/auth", tags=["Role-Based Authentication"])

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    designation: str
    role: str  # DSO, PHC_OFFICER, STATE_ADMIN
    jurisdiction: str
    badge_label: str
    avatar_color: str

AVAILABLE_USERS: List[UserProfile] = [
    UserProfile(
        id="usr-dso-pune",
        email="dso.pune@maharashtra.gov.in",
        full_name="Dr. Rajesh G. Deshmukh",
        designation="District Surveillance Officer (DSO)",
        role="DSO",
        jurisdiction="Pune District (98 PHCs)",
        badge_label="District Surveillance Officer",
        avatar_color="#2DD4BF"
    ),
    UserProfile(
        id="usr-phc-haveli",
        email="phc.haveli@maharashtra.gov.in",
        full_name="Dr. Snehal Patil",
        designation="Medical Officer - Haveli PHC",
        role="PHC_OFFICER",
        jurisdiction="Haveli & Wagholi Sub-Centers",
        badge_label="PHC Field Officer",
        avatar_color="#E9B949"
    ),
    UserProfile(
        id="usr-state-admin",
        email="admin.idsp@maharashtra.gov.in",
        full_name="Dr. Pradeep Vyas (IAS / Epidemiologist)",
        designation="State Director - Integrated Disease Surveillance",
        role="STATE_ADMIN",
        jurisdiction="State of Maharashtra (36 Districts)",
        badge_label="State Health Command",
        avatar_color="#E76F51"
    )
]

@router.get("/users", response_model=List[UserProfile])
def get_personas():
    """Returns available role-based auth profiles."""
    return AVAILABLE_USERS
