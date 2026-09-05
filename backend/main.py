import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid

from backend.config import settings
from backend.database import get_db, get_db_status, reconnect_db
from backend.models import (
    TripCreateRequest, TripDocument, ExpenseLogRequest,
    ExpenseRecord, PackingItemToggleRequest, ReplanResult,
    TripHealthScore, ChangeDestinationRequest
)
from pydantic import BaseModel
from backend.services.llm_provider import get_llm_provider
from backend.services.health_engine import TripHealthScoreEngine
from backend.services.budget_engine import BudgetEngine
from backend.services.replanner import AdaptiveReplanner

class DBProxy:
    def __getattr__(self, item):
        return getattr(get_db(), item)

db = DBProxy()

logger = logging.getLogger("travel_planner.api")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Adaptive, Constraint-Aware and Explainable AI Travel Planner REST API"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MongoConnectRequest(BaseModel):
    mongodb_uri: str

@app.post("/api/settings/connect-mongodb")
def connect_mongodb_atlas(req: MongoConnectRequest):
    """Dynamically connect to MongoDB Atlas cloud."""
    result = reconnect_db(req.mongodb_uri)
    if result.get("success"):
        try:
            import os, re
            env_file = os.path.join(os.path.dirname(__file__), ".env")
            if os.path.exists(env_file):
                with open(env_file, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                updated = False
                new_lines = []
                for line in lines:
                    if line.startswith("MONGODB_URI="):
                        new_lines.append(f"MONGODB_URI={req.mongodb_uri.strip()}\n")
                        updated = True
                    else:
                        new_lines.append(line)
                if not updated:
                    new_lines.append(f"\nMONGODB_URI={req.mongodb_uri.strip()}\n")
                with open(env_file, "w", encoding="utf-8") as f:
                    f.writelines(new_lines)
                logger.info("Successfully updated MONGODB_URI in backend/.env")
        except Exception as e:
            logger.warning(f"Could not persist MONGODB_URI to .env: {e}")
    return result

@app.get("/api/status")
def get_system_status():
    """Return runtime system status (Database connection & LLM engine mode)."""
    db_status = get_db_status()
    has_gemini = bool(settings.GEMINI_API_KEY.strip())
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "database": {
            "mode": db_status["mode"],
            "connected": db_status["connected"],
            "type": "MongoDB Atlas (Cloud)" if db_status["is_cloud"] else "MongoDB Document Engine (Resilient In-Memory)"
        },
        "ai_engine": {
            "active_provider": "Google Gemini Free Tier" if has_gemini else "Deterministic Curated Intelligence (Zero-Key)",
            "has_gemini_key": has_gemini
        }
    }

@app.post("/api/trips", response_model=TripDocument)
def create_trip(req: TripCreateRequest):
    """
    Step 1 & 2 of flow:
    Creates a new trip, generates initial personalized itinerary via AI/Curated provider,
    generates customized packing checklist, and computes initial Trip Health Score.
    """
    provider = get_llm_provider()
    trip_id = f"trip_{str(uuid.uuid4())[:8]}"
    
    # 1. Generate itinerary days
    days = provider.generate_itinerary(req)
    
    # Create preliminary trip document
    trip = TripDocument(
        id=trip_id,
        title=f"{req.duration_days}-Day {req.destination} Adventure",
        destination=req.destination,
        start_date=req.start_date,
        end_date=req.end_date,
        duration_days=req.duration_days,
        travelers=req.travelers,
        total_budget=req.total_budget,
        currency=req.currency,
        interests=req.interests,
        priority_weights=req.priority_weights,
        travel_style=req.travel_style,
        travel_pace=req.travel_pace,
        special_constraints=req.special_constraints,
        days=days,
        expenses=[],
        replan_history=[]
    )
    
    # 2. Generate customized packing list
    trip.packing_checklist = provider.generate_packing_list(trip)
    
    # 3. Calculate initial Trip Health Score
    trip.health_score = TripHealthScoreEngine.calculate_health_score(trip)
    
    # 4. Save to MongoDB
    db.trips.insert_one(trip.dict())
    logger.info(f"Created trip {trip_id} for {req.destination} with budget {req.total_budget}")
    return trip

@app.get("/api/trips", response_model=List[TripDocument])
def list_trips():
    """List all trips in database."""
    trips_cursor = db.trips.find({}, {"_id": 0})
    return [TripDocument(**t) for t in trips_cursor]

@app.get("/api/trips/{trip_id}", response_model=TripDocument)
def get_trip(trip_id: str):
    """Retrieve full trip document."""
    doc = db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    return TripDocument(**doc)

@app.post("/api/trips/{trip_id}/change-destination", response_model=TripDocument)
def change_trip_destination(trip_id: str, req: ChangeDestinationRequest):
    """
    Dynamically change the destination of an active trip:
    - Regenerates places, coordinates, timings, and activities for the new destination
    - Regenerates climate-tailored packing checklist
    - Recalculates Trip Health Score
    - Updates trip title while preserving duration, travelers, and user preferences
    """
    doc = db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip = TripDocument(**doc)
    
    new_dest = req.destination.strip()
    if not new_dest:
        raise HTTPException(status_code=400, detail="Destination cannot be empty")
        
    provider = get_llm_provider()
    
    # Update destination and budget if provided
    trip.destination = new_dest
    trip.title = f"{trip.duration_days}-Day {new_dest} Adventure"
    if req.total_budget and req.total_budget > 0:
        trip.total_budget = req.total_budget
    if req.currency:
        trip.currency = req.currency

    # Synthesize new itinerary for this destination
    create_req = TripCreateRequest(
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        duration_days=trip.duration_days,
        travelers=trip.travelers,
        total_budget=trip.total_budget,
        currency=trip.currency,
        interests=trip.interests,
        priority_weights=trip.priority_weights,
        travel_style=trip.travel_style,
        travel_pace=trip.travel_pace,
        special_constraints=trip.special_constraints
    )
    
    new_days = provider.generate_itinerary(create_req)
    trip.days = new_days
    trip.expenses = []  # Reset expenses for new destination
    trip.replan_history = []
    
    # Regenerate packing list & health score
    trip.packing_checklist = provider.generate_packing_list(trip)
    trip.health_score = TripHealthScoreEngine.calculate_health_score(trip)
    trip.updated_at = datetime.utcnow().isoformat()
    
    db.trips.update_one({"id": trip.id}, {"$set": trip.dict()})
    logger.info(f"Updated destination for trip {trip_id} to '{new_dest}' with {len(new_days)} days")
    return trip

@app.post("/api/trips/{trip_id}/expenses")
def record_actual_expense(trip_id: str, expense_req: ExpenseLogRequest):
    """
    Step 4, 5 & 6 of flow:
    User records actual spending for a day (e.g., Day 1 planned 5,000 -> actual 8,000).
    The system deterministically computes:
    - Variance (+₹3,000)
    - Remaining budget
    - Flags budget pressure if remaining plan exceeds remaining budget
    - Dynamically recalculates Trip Health Score
    """
    doc = db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip = TripDocument(**doc)
    
    # Find day
    target_day = None
    for d in trip.days:
        if d.day_number == expense_req.day_number:
            target_day = d
            break
            
    if not target_day:
        raise HTTPException(status_code=400, detail=f"Day {expense_req.day_number} not found in itinerary")
        
    planned_amount = target_day.daily_planned_budget
    target_day.daily_actual_spending = expense_req.actual_amount
    target_day.is_completed = True
    
    # Mark day's activities as completed
    for act in target_day.activities:
        act.is_completed = True
        act.status = "completed"
        
    # Create expense record
    expense = ExpenseRecord(
        trip_id=trip.id,
        day_number=expense_req.day_number,
        category=expense_req.category or "Daily Total",
        description=expense_req.description or f"Day {expense_req.day_number} spending entry",
        planned_amount=planned_amount,
        actual_amount=expense_req.actual_amount
    )
    trip.expenses.append(expense)
    
    # Recalculate Trip Health Score based on new financial reality
    trip.health_score = TripHealthScoreEngine.calculate_health_score(trip)
    trip.updated_at = datetime.utcnow().isoformat()
    
    # Update MongoDB
    db.trips.update_one({"id": trip.id}, {"$set": trip.dict()})
    
    # Compute budget metrics
    analysis = BudgetEngine.compute_budget_analysis(trip)
    
    return {
        "message": f"Recorded actual expense for Day {expense_req.day_number}",
        "day_number": expense_req.day_number,
        "planned_amount": planned_amount,
        "actual_amount": expense_req.actual_amount,
        "variance": analysis["variance"],
        "remaining_budget": analysis["remaining_budget"],
        "remaining_planned": analysis["remaining_planned_spending"],
        "is_budget_pressure": analysis["is_budget_pressure"],
        "updated_health_score": trip.health_score.overall_score,
        "trip": trip
    }

@app.get("/api/trips/{trip_id}/budget")
def get_trip_budget(trip_id: str):
    """Retrieve deterministic budget analysis."""
    doc = db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip = TripDocument(**doc)
    return BudgetEngine.compute_budget_analysis(trip)

@app.get("/api/trips/{trip_id}/health", response_model=TripHealthScore)
def get_trip_health(trip_id: str):
    """Retrieve detailed Trip Health Score with dimensional breakdown and insights."""
    doc = db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip = TripDocument(**doc)
    return trip.health_score or TripHealthScoreEngine.calculate_health_score(trip)

@app.post("/api/trips/{trip_id}/replan")
def replan_trip(trip_id: str):
    """
    Step 7, 8, 9 & 10 of flow (Adaptive Replanning):
    Intelligently replans remaining days when budget pressure is detected:
    - Completed days (e.g. Day 1) are strictly frozen.
    - Preserves high-priority preferences (Culture, Beach, Food).
    - Swaps low-priority expensive items for lower-cost authentic options.
    - Generates new budget & calculates improved Health Score.
    - Explains what changed and why.
    """
    doc = db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip = TripDocument(**doc)
    
    updated_trip, replan_result = AdaptiveReplanner.execute_adaptive_replan(trip)
    updated_trip.updated_at = datetime.utcnow().isoformat()
    
    # Save back to MongoDB
    db.trips.update_one({"id": updated_trip.id}, {"$set": updated_trip.dict()})
    
    return {
        "message": "Adaptive replan completed successfully",
        "replan_result": replan_result,
        "trip": updated_trip
    }

@app.get("/api/trips/{trip_id}/packing-list")
def get_packing_list(trip_id: str):
    """Get customized packing items."""
    doc = db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    return doc.get("packing_checklist", [])

@app.patch("/api/trips/{trip_id}/packing/{item_id}")
def toggle_packing_item(trip_id: str, item_id: str, req: PackingItemToggleRequest):
    """Toggle packed state of an item."""
    doc = db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip = TripDocument(**doc)
    
    found = False
    for item in trip.packing_checklist:
        if item.id == item_id:
            item.is_packed = req.is_packed
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="Packing item not found")
        
    db.trips.update_one({"id": trip_id}, {"$set": trip.dict()})
    return {"status": "success", "item_id": item_id, "is_packed": req.is_packed}

@app.post("/api/demo/preset")
def load_hackathon_demo_trip():
    """
    Convenience endpoint for live presentation:
    Initializes the exact 4-Day Goa Demo trip with 30,000 INR budget.
    """
    demo_req = TripCreateRequest(
        destination="Goa",
        start_date="2026-10-15",
        end_date="2026-10-19",
        duration_days=4,
        travelers=2,
        total_budget=30000.0,
        currency="₹",
        interests=["Beach", "Culture", "Food", "Adventure"],
        priority_weights={
            "Beach": "HIGH",
            "Culture": "HIGH",
            "Food": "HIGH",
            "Adventure": "MEDIUM",
            "Shopping": "LOW",
            "Luxury": "LOW"
        },
        travel_style="Balanced",
        travel_pace="Moderate",
        special_constraints="Avoid overly packed days; preserve Portuguese culture and beach activities"
    )
    return create_trip(demo_req)
