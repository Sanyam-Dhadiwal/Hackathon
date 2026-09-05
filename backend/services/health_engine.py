from typing import Dict, Any, List
from backend.models import TripDocument, TripHealthScore
from backend.services.budget_engine import BudgetEngine
from backend.services.constraint_engine import ConstraintEngine

class TripHealthScoreEngine:
    @classmethod
    def calculate_health_score(cls, trip: TripDocument) -> TripHealthScore:
        """
        Deterministic, transparent multi-dimensional Trip Health Score.
        Weights:
        - Budget Fit: 30%
        - Preference Match: 25%
        - Time Feasibility: 20%
        - Travel Pace: 15%
        - Activity Coverage: 10%
        """
        budget_analysis = BudgetEngine.compute_budget_analysis(trip)
        constraint_analysis = ConstraintEngine.validate_trip_constraints(trip)
        
        all_activities = []
        for d in trip.days:
            all_activities.extend(d.activities)
            
        total_activities = len(all_activities)
        if total_activities == 0:
            return TripHealthScore(
                overall_score=50,
                budget_fit=50,
                preference_match=50,
                time_feasibility=50,
                travel_pace=50,
                activity_coverage=50,
                insights={
                    "Budget Fit": "No activities scheduled yet.",
                    "Preference Match": "Itinerary pending generation.",
                    "Time Feasibility": "No schedule conflicts detected.",
                    "Travel Pace": "Pace evaluation pending.",
                    "Activity Coverage": "Awaiting initial activity recommendations."
                }
            )

        # 1. Budget Fit Score (0-100)
        remaining_budget = budget_analysis["remaining_budget"]
        remaining_planned = budget_analysis["remaining_planned_spending"]
        deficit = budget_analysis["deficit"]
        variance = budget_analysis["variance"]
        
        if deficit > 0:
            # Over-budget on remaining days: steep deterministic penalty
            # Deficit relative to remaining budget
            deficit_pct = (deficit / max(remaining_budget, 1.0)) * 100
            budget_fit = max(35, int(90 - (deficit_pct * 1.8)))
            budget_insight = f"Budget pressure detected: remaining plan exceeds available funds by {trip.currency}{int(deficit):,} (Day overspend: {trip.currency}{int(variance):,})."
        elif variance > 0:
            # Had past overspend but remaining plan still fits within remaining budget
            budget_fit = max(70, int(92 - (variance / 1000) * 3))
            budget_insight = f"Spending variance of +{trip.currency}{int(variance):,} recorded, but remaining days currently fit within the remaining {trip.currency}{int(remaining_budget):,} budget."
        else:
            # Under budget or on target
            savings = abs(variance) if variance < 0 else 0
            budget_fit = min(98, int(92 + (savings / 1000) * 2))
            budget_insight = f"Excellent financial alignment. Remaining planned spending of {trip.currency}{int(remaining_planned):,} is well within the {trip.currency}{int(remaining_budget):,} remaining budget."

        # 2. Preference Match Score (0-100)
        priority_weights = trip.priority_weights or {}
        high_pref_count = 0
        med_pref_count = 0
        for act in all_activities:
            pri = priority_weights.get(act.category, act.priority).upper()
            if pri == "HIGH":
                high_pref_count += 1
            elif pri == "MEDIUM":
                med_pref_count += 1
                
        pref_ratio = (high_pref_count * 1.0 + med_pref_count * 0.6) / max(total_activities, 1)
        preference_match = min(100, max(45, int(pref_ratio * 100 + 5)))
        high_prefs = [k for k, v in priority_weights.items() if v.upper() == "HIGH"]
        pref_insight = f"Strong alignment ({preference_match}%): {high_pref_count} activities directly cater to your top preferences ({', '.join(high_prefs[:3])})."

        # 3. Time Feasibility Score (0-100)
        time_violations = constraint_analysis["time_violation_count"]
        time_score = max(50, 96 - (time_violations * 20))
        if time_violations == 0:
            time_insight = "All scheduled activities fit comfortably within daily active hours with healthy transit margins."
        else:
            time_insight = f"{time_violations} day(s) exceed recommended daily hours and may feel rushed."

        # 4. Travel Pace Score (0-100)
        load_violations = constraint_analysis["load_violation_count"]
        pace_score = max(55, 95 - (load_violations * 18))
        if load_violations == 0:
            pace_insight = f"Itinerary perfectly respects your '{trip.travel_pace}' pace (averaging {round(total_activities / len(trip.days), 1)} activities/day)."
        else:
            pace_insight = f"Daily activity density exceeds the preferred '{trip.travel_pace}' limit on {load_violations} day(s)."

        # 5. Activity Coverage Score (0-100)
        unique_categories = set(act.category for act in all_activities)
        cat_count = len(unique_categories)
        if cat_count >= 4:
            coverage_score = 94
            coverage_insight = f"Diverse coverage across {cat_count} distinct categories: {', '.join(list(unique_categories)[:4])}."
        elif cat_count == 3:
            coverage_score = 85
            coverage_insight = f"Balanced mix covering {cat_count} categories: {', '.join(unique_categories)}."
        else:
            coverage_score = 72
            coverage_insight = f"Focused itinerary centered around {cat_count} main categories."

        # Overall deterministic weighted score
        overall = round(
            (0.30 * budget_fit) +
            (0.25 * preference_match) +
            (0.20 * time_score) +
            (0.15 * pace_score) +
            (0.10 * coverage_score)
        )
        overall = min(99, max(30, overall))

        return TripHealthScore(
            overall_score=overall,
            budget_fit=budget_fit,
            preference_match=preference_match,
            time_feasibility=time_score,
            travel_pace=pace_score,
            activity_coverage=coverage_score,
            insights={
                "Budget Fit": budget_insight,
                "Preference Match": pref_insight,
                "Time Feasibility": time_insight,
                "Travel Pace": pace_insight,
                "Activity Coverage": coverage_insight
            }
        )
