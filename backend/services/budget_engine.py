from typing import Dict, Any, List
from backend.models import TripDocument

class BudgetEngine:
    @staticmethod
    def compute_budget_analysis(trip: TripDocument) -> Dict[str, Any]:
        """
        Deterministic financial computation.
        Separates completed days (where actual spending has occurred)
        from remaining future days.
        """
        total_budget = float(trip.total_budget)
        
        completed_days = [d for d in trip.days if d.is_completed or d.daily_actual_spending > 0]
        remaining_days = [d for d in trip.days if not d.is_completed and d.daily_actual_spending == 0]
        
        completed_actual_spending = sum(float(d.daily_actual_spending) for d in completed_days)
        completed_planned_spending = sum(float(d.daily_planned_budget) for d in completed_days)
        
        # Remaining planned spending across future days
        remaining_planned_spending = sum(float(d.daily_planned_budget) for d in remaining_days)
        
        # Exact remaining money available
        remaining_budget = total_budget - completed_actual_spending
        
        # Variance on completed days (positive = overspent, negative = saved)
        variance = completed_actual_spending - completed_planned_spending
        
        # Total planned trip cost across all days
        total_planned_spending = completed_planned_spending + remaining_planned_spending
        
        # Budget risk/pressure flag
        # Pressure occurs if remaining planned activities exceed what's left in the budget,
        # or if remaining budget is less than zero.
        deficit = max(0.0, remaining_planned_spending - remaining_budget)
        is_budget_pressure = deficit > 0.0 or remaining_budget < (0.15 * remaining_planned_spending)
        
        # Budget burn rate / ratio
        burn_ratio = (completed_actual_spending / total_budget) if total_budget > 0 else 1.0
        
        return {
            "total_budget": round(total_budget, 2),
            "completed_actual_spending": round(completed_actual_spending, 2),
            "completed_planned_spending": round(completed_planned_spending, 2),
            "remaining_budget": round(remaining_budget, 2),
            "remaining_planned_spending": round(remaining_planned_spending, 2),
            "total_planned_spending": round(total_planned_spending, 2),
            "variance": round(variance, 2),
            "deficit": round(deficit, 2),
            "savings_needed": round(deficit, 2),
            "is_budget_pressure": is_budget_pressure,
            "burn_ratio": round(burn_ratio, 3),
            "completed_days_count": len(completed_days),
            "remaining_days_count": len(remaining_days)
        }
