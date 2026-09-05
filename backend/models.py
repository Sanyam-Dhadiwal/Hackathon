from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

def generate_id() -> str:
    return str(uuid.uuid4())[:8]

# User Input Schemas
class TripCreateRequest(BaseModel):
    destination: str = Field(..., example="Goa")
    start_date: str = Field(..., example="2026-10-10")
    end_date: str = Field(..., example="2026-10-14")
    duration_days: int = Field(default=4, ge=1, le=14)
    travelers: int = Field(default=2, ge=1)
    total_budget: float = Field(..., gt=0, example=30000.0)
    currency: str = Field(default="₹")
    interests: List[str] = Field(default=["Beach", "Culture", "Food", "Adventure"])
    priority_weights: Dict[str, str] = Field(default={
        "Beach": "HIGH",
        "Culture": "HIGH",
        "Food": "HIGH",
        "Adventure": "MEDIUM",
        "Shopping": "LOW",
        "Luxury": "LOW"
    })
    travel_style: str = Field(default="Balanced") # Balanced, Budget, Luxury, Adventure
    travel_pace: str = Field(default="Moderate") # Relaxed, Moderate, Fast-paced
    special_constraints: Optional[str] = Field(default="Avoid overly packed days; preserve cultural visits")

class ChangeDestinationRequest(BaseModel):
    destination: str = Field(..., example="Paris")
    total_budget: Optional[float] = None
    currency: Optional[str] = None

# Activity Schema
class Activity(BaseModel):
    id: str = Field(default_factory=generate_id)
    name: str
    start_time: str
    end_time: str
    duration_hours: float
    estimated_cost: float
    actual_cost: Optional[float] = None
    category: str
    priority: str = "MEDIUM" # HIGH, MEDIUM, LOW
    preference_match: str = "General"
    explanation: str
    location_name: str
    latitude: float
    longitude: float
    status: str = "planned" # planned, completed, replaced, adjusted, removed
    is_completed: bool = False

# Day Itinerary Schema
class ItineraryDay(BaseModel):
    day_number: int
    date: str
    title: str
    daily_planned_budget: float
    daily_actual_spending: float = 0.0
    is_completed: bool = False
    activities: List[Activity] = []

# Expense Schema
class ExpenseRecord(BaseModel):
    id: str = Field(default_factory=generate_id)
    trip_id: str
    day_number: int
    category: str
    description: str
    planned_amount: float
    actual_amount: float
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ExpenseLogRequest(BaseModel):
    day_number: int
    actual_amount: float
    category: Optional[str] = "All-Day Total"
    description: Optional[str] = "Actual spending entry"

# Health Score Schema
class TripHealthScore(BaseModel):
    overall_score: int
    budget_fit: int
    preference_match: int
    time_feasibility: int
    travel_pace: int
    activity_coverage: int
    insights: Dict[str, str]
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# Packing Item Schema
class PackingItem(BaseModel):
    id: str = Field(default_factory=generate_id)
    category: str
    item_name: str
    is_packed: bool = False
    is_essential: bool = True

class PackingItemToggleRequest(BaseModel):
    is_packed: bool

# Replanning Result Schemas
class ActivityModification(BaseModel):
    day_number: int
    action: str # "replaced", "downgraded_cost", "removed", "preserved"
    activity_name: str
    original_cost: float
    new_cost: float
    savings: float
    reason: str

class ReplanResult(BaseModel):
    trip_id: str
    is_budget_pressure: bool
    budget_variance: float
    remaining_budget: float
    previous_remaining_planned: float
    new_remaining_planned: float
    total_savings: float
    health_score_before: int
    health_score_after: int
    summary_explanation: str
    modifications: List[ActivityModification]

# Full Trip Document
class TripDocument(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    destination: str
    start_date: str
    end_date: str
    duration_days: int
    travelers: int
    total_budget: float
    currency: str = "₹"
    interests: List[str]
    priority_weights: Dict[str, str]
    travel_style: str
    travel_pace: str
    special_constraints: Optional[str]
    days: List[ItineraryDay]
    expenses: List[ExpenseRecord] = []
    health_score: Optional[TripHealthScore] = None
    packing_checklist: List[PackingItem] = []
    replan_history: List[ReplanResult] = []
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==============================================================================
# Authentication Schemas
# ==============================================================================
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)

class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    email_verified: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserResponse

class RegisterResponse(BaseModel):
    message: str
    email_verified: bool = False
    user: UserResponse

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)

