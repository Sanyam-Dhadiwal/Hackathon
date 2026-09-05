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

    print("\n--- 5. Testing Multi-Destination Synthesis (Paris, Tokyo, Jaipur, Manali) ---")
    
    # Test Paris
    paris_req = TripCreateRequest(
        destination="Paris",
        start_date="2026-11-01",
        end_date="2026-11-05",
        duration_days=4,
        travelers=2,
        total_budget=80000.0,
        currency="€"
    )
    paris_trip = create_trip(paris_req)
    print(f"Created Paris trip: {paris_trip.title}")
    paris_act_names = [a.name for d in paris_trip.days for a in d.activities]
    print(f"Paris activities sample: {paris_act_names[:3]}")
    assert any("Eiffel" in name or "Louvre" in name or "Paris" in name for name in paris_act_names)
    assert any(48.8 <= a.latitude <= 48.9 for d in paris_trip.days for a in d.activities)
    assert any("sneakers" in item.item_name.lower() or "adapter" in item.item_name.lower() for item in paris_trip.packing_checklist)
    print(" Paris itinerary and coordinates verified successfully!")

    # Test Jaipur
    jaipur_req = TripCreateRequest(
        destination="Jaipur",
        start_date="2026-11-10",
        end_date="2026-11-14",
        duration_days=4,
        travelers=2,
        total_budget=25000.0,
        currency="₹"
    )
    jaipur_trip = create_trip(jaipur_req)
    print(f"Created Jaipur trip: {jaipur_trip.title}")
    jaipur_act_names = [a.name for d in jaipur_trip.days for a in d.activities]
    print(f"Jaipur activities sample: {jaipur_act_names[:3]}")
    assert any("Amber" in name or "Hawa Mahal" in name or "Palace" in name for name in jaipur_act_names)
    assert any(26.9 <= a.latitude <= 27.0 for d in jaipur_trip.days for a in d.activities)
    print(" Jaipur itinerary and coordinates verified successfully!")

    # Test Manali
    manali_req = TripCreateRequest(
        destination="Manali",
        start_date="2026-12-01",
        end_date="2026-12-05",
        duration_days=4,
        travelers=2,
        total_budget=22000.0,
        currency="₹"
    )
    manali_trip = create_trip(manali_req)
    print(f"Created Manali trip: {manali_trip.title}")
    manali_act_names = [a.name for d in manali_trip.days for a in d.activities]
    print(f"Manali activities sample: {manali_act_names[:3]}")
    assert any("Solang" in name or "Hadimba" in name or "Jogini" in name or "Manali" in name for name in manali_act_names)
    assert any(32.1 <= a.latitude <= 32.4 for d in manali_trip.days for a in d.activities)
    assert any("thermal" in item.item_name.lower() or "boots" in item.item_name.lower() for item in manali_trip.packing_checklist)
    print(" Manali alpine itinerary and packing verified successfully!")

    print("\n--- 6. Testing Dynamic Destination Change on Active Trip ---")
    from backend.main import change_trip_destination
    from backend.models import ChangeDestinationRequest

    # Change the original Goa trip to Tokyo
    updated_to_tokyo = change_trip_destination(trip.id, ChangeDestinationRequest(destination="Tokyo"))
    print(f"Updated Trip ID {updated_to_tokyo.id} to new destination: {updated_to_tokyo.destination}")
    tokyo_act_names = [a.name for d in updated_to_tokyo.days for a in d.activities]
    print(f"Updated Tokyo activities: {tokyo_act_names[:3]}")
    assert updated_to_tokyo.destination == "Tokyo"
    assert any("Shibuya" in name or "Senso-ji" in name or "Tsukiji" in name or "Tokyo" in name for name in tokyo_act_names)
    assert any(35.5 <= a.latitude <= 35.8 for d in updated_to_tokyo.days for a in d.activities)
    print(" Dynamic destination change and place update verified successfully!")

    print("\n ALL AUTOMATED BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_hackathon_flow()

