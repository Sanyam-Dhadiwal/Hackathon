import sys
from pathlib import Path
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.models import TripCreateRequest, ExpenseLogRequest
from backend.main import create_trip, record_actual_expense, replan_trip, get_system_status

def test_full_hackathon_flow():
    print("--- 1. Testing System Status ---")
    status = get_system_status()
    print("Status:", status)
    assert status["status"] == "online"
    assert status["database"]["connected"] is True

    print("\n--- 2. Step 1: Create 4-Day Goa Trip (Budget: ₹30,000) ---")
    req = TripCreateRequest(
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
        }
    )
    trip = create_trip(req)
    print(f"Created trip ID: {trip.id}")
    print(f"Total budget: {trip.currency}{trip.total_budget}")
    print(f"Initial Health Score: {trip.health_score.overall_score}/100")
    print(f"Health Dimensions: Budget={trip.health_score.budget_fit}, Pref={trip.health_score.preference_match}, Time={trip.health_score.time_feasibility}, Pace={trip.health_score.travel_pace}, Coverage={trip.health_score.activity_coverage}")
    
    assert trip.total_budget == 30000.0
    assert len(trip.days) == 4
    assert trip.health_score.overall_score >= 80

    day1_planned = trip.days[0].daily_planned_budget
    print(f"\nDay 1 Planned Budget: ₹{day1_planned}")

    print("\n--- 3. Step 4: Record Day 1 Actual Spending = ₹8,000 (Planned was ₹5,000) ---")
    expense_res = record_actual_expense(trip.id, ExpenseLogRequest(
        day_number=1,
        actual_amount=8000.0,
        description="Day 1 actual expenses (beach sports & dinner)"
    ))
    
    print(f"Actual Spent on Day 1: ₹{expense_res['actual_amount']}")
    print(f"Variance: +₹{expense_res['variance']}")
    print(f"Remaining Budget: ₹{expense_res['remaining_budget']}")
    print(f"Remaining Planned: ₹{expense_res['remaining_planned']}")
    print(f"Budget Pressure Detected: {expense_res['is_budget_pressure']}")
    print(f"Health Score After Overspending: {expense_res['updated_health_score']}/100")

    assert expense_res['variance'] > 0
    assert expense_res['is_budget_pressure'] is True
    assert expense_res['updated_health_score'] < trip.health_score.overall_score

    print("\n--- 4. Step 7: Trigger Adaptive Replanning ---")
    replan_res = replan_trip(trip.id)
    diff = replan_res["replan_result"]
    
    print(f"Adaptive Replan Summary: {diff.summary_explanation}")
    print(f"Health Score Before: {diff.health_score_before} -> After: {diff.health_score_after}")
    print(f"New Remaining Planned: ₹{diff.new_remaining_planned} (Saved: ₹{diff.total_savings})")
    print(f"Modifications Made ({len(diff.modifications)} items):")
    for mod in diff.modifications:
        print(f" - Day {mod.day_number}: {mod.action.upper()} '{mod.activity_name}' -> Saved ₹{mod.savings} | Reason: {mod.reason}")

    assert diff.health_score_after > diff.health_score_before
    assert diff.new_remaining_planned <= diff.remaining_budget or diff.total_savings > 0
    
    # Verify completed Day 1 was frozen
    re는다_trip = replan_res["trip"]
    assert re는다_trip.days[0].daily_actual_spending == 8000.0
    assert re는다_trip.days[0].is_completed is True
    
    print("\n ALL AUTOMATED BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_hackathon_flow()
