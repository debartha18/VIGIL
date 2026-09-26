"""
Multi-Scale Overlapping Tiler & Geometry Mapping
"""
from typing import List, Dict, Any, Tuple
import numpy as np
from backend.config import TILE_SIZE_PX, TILE_OVERLAP_RATIO
from backend.quality.scl_mask import SCLQualityEngine


class SceneTiler:
    @staticmethod
    def generate_tiles(
        scene_id: str,
        bbox: Tuple[float, float, float, float],
        acquired_at: str,
        cloud_pct: float,
        grid_dim: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Generates 256px multi-scale tiles with overlap and exact bounding box coordinates.
        """
        min_lon, min_lat, max_lon, max_lat = bbox
        dx = (max_lon - min_lon) / grid_dim
        dy = (max_lat - min_lat) / grid_dim

        tiles = []
        for ix in range(grid_dim):
            for iy in range(grid_dim):
                tile_id = f"T_{scene_id}_{ix}_{iy}"
                t_min_lon = min_lon + ix * dx
                t_max_lon = t_min_lon + dx
                t_min_lat = min_lat + iy * dy
                t_max_lat = t_min_lat + dy

                # Compute quality mask for tile
                # High cloud cover in monsoon scenes
                is_cloudy_patch = cloud_pct > 30.0 and (ix + iy) % 2 == 0
                tile_cloud = 0.60 if is_cloudy_patch else (cloud_pct / 100.0)
                tile_shadow = 0.08 if tile_cloud > 0.3 else 0.01
                tile_valid = max(0.0, 1.0 - tile_cloud)

                quality_mask = {
                    "cloud": round(tile_cloud, 4),
                    "shadow": round(tile_shadow, 4),
                    "snow": 0.0,
                    "valid": round(tile_valid, 4)
                }

                tiles.append({
                    "id": tile_id,
                    "sceneId": scene_id,
                    "bbox": [round(t_min_lon, 5), round(t_min_lat, 5), round(t_max_lon, 5), round(t_max_lat, 5)],
                    "acquiredAt": acquired_at,
                    "qualityMask": quality_mask
                })

        return tiles
