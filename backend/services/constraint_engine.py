from typing import Dict, Any, List, Tuple
from datetime import datetime
from backend.models import TripDocument, Activity, ItineraryDay

class ConstraintEngine:
    PACE_MAX_ACTIVITIES = {
        "Relaxed": 3,
        "Moderate": 4,
        "Fast-paced": 5
    }
    
    PACE_MAX_HOURS = {
        "Relaxed": 7.0,
        "Moderate": 9.5,
        "Fast-paced": 12.0
    }

    @classmethod
    def validate_trip_constraints(cls, trip: TripDocument) -> Dict[str, Any]:
        """
        Validates the trip itinerary against operational and preference constraints.
        Returns detailed compliance metrics and any violation warnings.
        """
        pace = trip.travel_pace or "Moderate"
        max_activities = cls.PACE_MAX_ACTIVITIES.get(pace, 4)
        max_hours = cls.PACE_MAX_HOURS.get(pace, 9.5)
        
        violations: List[str] = []
        day_metrics: List[Dict[str, Any]] = []
        
        total_time_violations = 0
        total_load_violations = 0
        
        for day in trip.days:
            act_count = len(day.activities)
            total_duration = sum(act.duration_hours for act in day.activities)
            
            # Check pace count
            if act_count > max_activities:
                violations.append(f"Day {day.day_number} exceeds {pace} pace limit ({act_count} activities vs max {max_activities})")
                total_load_violations += 1
                
            # Check pace hours
            if total_duration > max_hours:
                violations.append(f"Day {day.day_number} schedule duration ({total_duration:.1f} hrs) exceeds {pace} limit ({max_hours} hrs)")
                total_time_violations += 1
                
            day_metrics.append({
                "day_number": day.day_number,
                "activity_count": act_count,
                "total_duration_hours": round(total_duration, 1),
                "is_feasible": act_count <= max_activities and total_duration <= max_hours
            })
            
        return {
            "is_valid": len(violations) == 0,
            "violations": violations,
            "time_violation_count": total_time_violations,
            "load_violation_count": total_load_violations,
            "day_metrics": day_metrics
        }

    @classmethod
    def get_priority_weight(cls, category: str, priority_weights: Dict[str, str]) -> int:
        """
        Map priority level to integer score:
        HIGH = 3, MEDIUM = 2, LOW = 1
        """
        level = priority_weights.get(category, "MEDIUM").upper()
        if level == "HIGH":
            return 3
        elif level == "MEDIUM":
            return 2
        return 1
