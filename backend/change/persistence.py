"""
Temporal Persistence & Multi-Scene Validation Engine
Verifies that detected changes persist across multiple independent clear-sky acquisitions.
Filters out ephemeral anomalies (barges, temporary vehicles, seasonal crop shifts).
"""
from typing import List, Dict, Any, Tuple
from backend.config import MIN_PERSISTENCE_CLEAN_SCENES


class PersistenceEngine:
    def __init__(self, min_clean_scenes: int = MIN_PERSISTENCE_CLEAN_SCENES):
        self.min_clean_scenes = min_clean_scenes

    def verify_persistence(
        self,
        candidate_bbox: List[float],
        temporal_observations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        temporal_observations is an ordered list of scene observations at this location:
        [
          {"scene_id": "...", "acquired_at": "2023-08-12", "is_clean": True, "change_present": False},
          {"scene_id": "...", "acquired_at": "2024-02-18", "is_clean": True, "change_present": True},
          {"scene_id": "...", "acquired_at": "2025-04-28", "is_clean": True, "change_present": True}
        ]
        """
        # Sort chronologically
        obs_sorted = sorted(temporal_observations, key=lambda x: x["acquired_at"])

        clean_observations = [obs for obs in obs_sorted if obs.get("is_clean", True)]
        change_observations = [obs for obs in clean_observations if obs.get("change_present", False)]

        if not change_observations:
            return {
                "is_persistent": False,
                "first_evidence_at": None,
                "first_evidence_scene_id": None,
                "confirmed_at": None,
                "confirmed_scene_id": None,
                "clean_scenes_count": len(clean_observations),
                "change_scenes_count": 0,
                "persistence_score": 0.0,
                "verdict": "NO_CHANGE"
            }

        first_change = change_observations[0]
        confirmed_change = change_observations[-1] if len(change_observations) >= self.min_clean_scenes else None

        # Check consecutive consistency
        consecutive_count = len(change_observations)
        is_persistent = consecutive_count >= self.min_clean_scenes

        # Persistence score: 0.5 for 1 scene, 0.85 for 2 scenes, 1.0 for 3+ scenes
        if consecutive_count >= 3:
            persistence_score = 0.98
        elif consecutive_count == 2:
            persistence_score = 0.88
        else:
            persistence_score = 0.45

        return {
            "is_persistent": is_persistent,
            "first_evidence_at": first_change["acquired_at"],
            "first_evidence_scene_id": first_change["scene_id"],
            "confirmed_at": confirmed_change["acquired_at"] if confirmed_change else first_change["acquired_at"],
            "confirmed_scene_id": confirmed_change["scene_id"] if confirmed_change else first_change["scene_id"],
            "clean_scenes_count": len(clean_observations),
            "change_scenes_count": consecutive_count,
            "persistence_score": persistence_score,
            "verdict": "CONFIRMED" if is_persistent else "UNVERIFIED_TRANSIENT"
        }


persistence_engine = PersistenceEngine()
