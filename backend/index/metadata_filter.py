"""
Metadata & Spatial Filter Engine for Search Retrieval
Combines vector distance with database metadata constraints.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np
from backend.database.db import db_manager



class MetadataFilterEngine:
    def __init__(self):
        self.db = db_manager

    def filter_and_hydrate(
        self,
        scored_tile_ids: List[tuple], # (tile_id, vector_score)
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        sensor: Optional[str] = None,
        max_cloud_fraction: float = 0.30,
        bbox: Optional[List[float]] = None, # [min_lon, min_lat, max_lon, max_lat]
        spatial_predicates: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Hydrates tile candidates with scene metadata and applies filters.
        """
        if not scored_tile_ids:
            return []

        id_score_map = {t_id: score for t_id, score in scored_tile_ids}
        placeholders = ",".join(["?"] * len(scored_tile_ids))

        query = f"""
        SELECT 
            t.id as tile_id,
            t.scene_id,
            t.min_lon,
            t.min_lat,
            t.max_lon,
            t.max_lat,
            t.acquired_at,
            t.cloud_mask,
            t.shadow_mask,
            t.valid_mask,
            s.sensor,
            s.cloud_pct,
            s.resolution_m,
            s.format
        FROM tiles t
        JOIN scenes s ON t.scene_id = s.id
        WHERE t.id IN ({placeholders})
        """

        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, list(id_score_map.keys()))
            rows = cursor.fetchall()

        results: List[Dict[str, Any]] = []

        for row in rows:
            t_id = row["tile_id"]
            acquired_at = row["acquired_at"]
            row_sensor = row["sensor"]
            cloud_mask = row["cloud_mask"]
            min_lon = row["min_lon"]
            min_lat = row["min_lat"]
            max_lon = row["max_lon"]
            max_lat = row["max_lat"]

            # Filter by date range
            if start_date and acquired_at < start_date:
                continue
            if end_date and acquired_at > end_date:
                continue

            # Filter by sensor
            if sensor and sensor.lower() != "all" and sensor.lower() not in row_sensor.lower():
                continue

            # Filter by cloud fraction
            if cloud_mask > max_cloud_fraction:
                continue

            # Filter by spatial bounding box
            if bbox:
                b_min_lon, b_min_lat, b_max_lon, b_max_lat = bbox
                # Check intersection
                if (max_lon < b_min_lon or min_lon > b_max_lon or
                    max_lat < b_min_lat or min_lat > b_max_lat):
                    continue

            # Spatial Predicate logic (e.g. proximity to water)
            # Reference river corridor line across Tapi estuary: from (72.68, 21.40) to (72.82, 21.52)
            center_lon = (min_lon + max_lon) / 2.0
            center_lat = (min_lat + max_lat) / 2.0
            
            # Distance from point to line segment
            p0 = np.array([72.68, 21.40])
            p1 = np.array([72.82, 21.52])
            pt = np.array([center_lon, center_lat])
            l2 = np.sum((p1 - p0)**2)
            t = np.clip(np.dot(pt - p0, p1 - p0) / l2, 0.0, 1.0)
            proj = p0 + t * (p1 - p0)
            # Degree difference to meters (~105,000m/deg longitude, ~111,000m/deg latitude)
            deg_diff = np.abs(pt - proj)
            dist_to_river_m = float(np.sqrt((deg_diff[0] * 105000.0)**2 + (deg_diff[1] * 111000.0)**2))
            
            # If tile bounds overlap the river axis, tile-to-river distance is within 0-250m
            if min_lon <= 72.82 and max_lon >= 72.68 and min_lat <= 21.52 and max_lat >= 21.40:
                dist_to_river_m = min(dist_to_river_m, 250.0)

            if spatial_predicates:
                skip = False
                for pred in spatial_predicates:
                    p_type = pred.get("predicate")
                    max_d = pred.get("max_distance_m", 1000.0)
                    if p_type == "near_water" and dist_to_river_m > max_d:
                        skip = True
                        break
                    elif p_type == "inland" and dist_to_river_m < max_d:
                        skip = True
                        break
                if skip:
                    continue


            relevance = id_score_map[t_id]
            cleanliness = max(0.0, 1.0 - (cloud_mask + row["shadow_mask"]))

            results.append({
                "tile_id": t_id,
                "scene_id": row["scene_id"],
                "sensor": row_sensor,
                "acquired_at": acquired_at,
                "bounds": [min_lon, min_lat, max_lon, max_lat],
                "center": [center_lat, center_lon],
                "cloud_pct": row["cloud_pct"],
                "cleanliness_score": round(cleanliness, 3),
                "relevance_score": round(relevance, 3),
                "distance_to_river_m": round(dist_to_river_m, 1),
            })

        # Sort by relevance descending
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results


metadata_filter = MetadataFilterEngine()
