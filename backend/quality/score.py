"""
Tile Quality & Observation Cleanliness Scoring
"""
from typing import Dict, Any


def compute_tile_cleanliness_score(quality_mask: Dict[str, float]) -> float:
    """
    Computes a normalized cleanliness score (0.0 - 1.0) where 1.0 is perfectly clear data.
    Penalizes cloud, shadow, and missing pixels.
    """
    cloud = quality_mask.get("cloud", 0.0)
    shadow = quality_mask.get("shadow", 0.0)
    valid = quality_mask.get("valid", 1.0)

    cleanliness = valid * (1.0 - (cloud * 1.0 + shadow * 0.8))
    return max(0.0, min(1.0, round(cleanliness, 4)))


score_observation_cleanliness = compute_tile_cleanliness_score

