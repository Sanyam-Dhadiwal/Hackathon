import logging
from typing import Dict, Any, Tuple
from backend.models import TripDocument, ReplanResult
from backend.services.budget_engine import BudgetEngine
from backend.services.health_engine import TripHealthScoreEngine
from backend.services.llm_provider import get_llm_provider

logger = logging.getLogger("travel_planner.replanner")

class AdaptiveReplanner:
    @classmethod
    def execute_adaptive_replan(cls, trip: TripDocument) -> Tuple[TripDocument, ReplanResult]:
        """
        Executes the adaptive replanning loop:
        1. Analyzes current budget & spending variance.
        2. Detects whether replanning is required.
        3. Protects completed days and high-priority preferences.
        4. Replaces or downscales lower-priority high-cost activities on remaining days.
        5. Recalculates new remaining planned spending.
        6. Recalculates new Trip Health Score (showing Before vs After improvement).
        7. Returns updated trip and structured ReplanResult diff.
        """
        # 1. Budget analysis
        initial_analysis = BudgetEngine.compute_budget_analysis(trip)
        health_score_before = trip.health_score.overall_score if trip.health_score else 68
        
        variance = initial_analysis["variance"]
        remaining_budget = initial_analysis["remaining_budget"]
        prev_remaining_planned = initial_analysis["remaining_planned_spending"]
        deficit = initial_analysis["deficit"]
        is_pressure = initial_analysis["is_budget_pressure"]
        
        # If no deficit, we may still optimize if there was variance, or return early
        savings_target = deficit if deficit > 0 else max(0.0, variance)
        
        # 2. Call LLM / Heuristic Planner
        provider = get_llm_provider()
        updated_days, modifications, summary_explanation = provider.replan_remaining_days(trip, savings_target)
        
        # Update trip days
        trip.days = updated_days
        
        # 3. Recalculate deterministic budget
        new_analysis = BudgetEngine.compute_budget_analysis(trip)
        new_remaining_planned = new_analysis["remaining_planned_spending"]
        total_savings = max(0.0, prev_remaining_planned - new_remaining_planned)
        
        # 4. Recalculate deterministic health score
        new_health_score = TripHealthScoreEngine.calculate_health_score(trip)
        trip.health_score = new_health_score
        
        replan_record = ReplanResult(
            trip_id=trip.id,
            is_budget_pressure=is_pressure,
            budget_variance=variance,
            remaining_budget=remaining_budget,
            previous_remaining_planned=prev_remaining_planned,
            new_remaining_planned=new_remaining_planned,
            total_savings=total_savings,
            health_score_before=health_score_before,
            health_score_after=new_health_score.overall_score,
            summary_explanation=summary_explanation,
            modifications=modifications
        )
        
        trip.replan_history.append(replan_record)
        return trip, replan_record
