"""
KSHITIJ Geospatial & Raster Quality Masking Engine (SCL-Based)
"""
import numpy as np
from typing import Dict, Any, Tuple, List
from shapely.geometry import Point, LineString, Polygon
from shapely.ops import nearest_points


class GeospatialEngine:
    def __init__(self):
        # 50x50 km AOI Centered in a realistic river basin with industry and settlements
        # Coordinates: Lat 18.45 to 18.90, Lon 83.80 to 84.30 (approx 50x50 km)
        self.aoi_bbox = (83.80, 18.45, 84.30, 18.90)  # minLon, minLat, maxLon, maxLat

        # Primary river vector polyline
        self.river_line = LineString([
            (83.85, 18.50),
            (83.95, 18.62),
            (84.05, 18.68),
            (84.18, 18.78),
            (84.28, 18.88)
        ])

        # Primary road corridor vector polyline
        self.road_line = LineString([
            (83.82, 18.85),
            (83.95, 18.80),
            (84.10, 18.72),
            (84.22, 18.55)
        ])

    def compute_scl_quality_mask(self, scl_array: np.ndarray) -> Dict[str, float]:
        """
        Computes exact quality mask fractions from Sentinel-2 SCL (Scene Classification Layer).
        SCL classes:
          3: Cloud shadow
          8: Cloud medium probability
          9: Cloud high probability
          10: Thin cirrus
          11: Snow/Ice
        """
        total_pixels = scl_array.size
        if total_pixels == 0:
            return {"cloud": 0.0, "shadow": 0.0, "snow": 0.0, "valid": 1.0}

        cloud_count = np.isin(scl_array, [8, 9, 10]).sum()
        shadow_count = (scl_array == 3).sum()
        snow_count = (scl_array == 11).sum()
        valid_count = (scl_array != 0).sum()

        return {
            "cloud": float(cloud_count / total_pixels),
            "shadow": float(shadow_count / total_pixels),
            "snow": float(snow_count / total_pixels),
            "valid": float(valid_count / total_pixels),
        }

    def distance_to_river_m(self, lon: float, lat: float) -> float:
        """
        Calculates distance in meters from a given (lon, lat) point to the nearest river polyline.
        Uses 111,320m per degree approx.
        """
        pt = Point(lon, lat)
        dist_deg = pt.distance(self.river_line)
        # Convert approx degrees to meters at latitude 18.6
        meters_per_deg = 111320.0 * np.cos(np.radians(lat))
        return float(dist_deg * meters_per_deg)

    def distance_to_road_m(self, lon: float, lat: float) -> float:
        """
        Calculates distance in meters to the nearest primary road corridor.
        """
        pt = Point(lon, lat)
        dist_deg = pt.distance(self.road_line)
        meters_per_deg = 111320.0 * np.cos(np.radians(lat))
        return float(dist_deg * meters_per_deg)

    def get_river_geojson(self) -> Dict[str, Any]:
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": list(self.river_line.coords)
                    },
                    "properties": {
                        "name": "Nagavali River System",
                        "type": "Perennial River",
                        "widthM": 120
                    }
                }
            ]
        }

    def get_road_geojson(self) -> Dict[str, Any]:
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": list(self.road_line.coords)
                    },
                    "properties": {
                        "name": "State Highway SH-48 Corridor",
                        "lanes": 4,
                        "type": "Primary Highway"
                    }
                }
            ]
        }


geo_engine = GeospatialEngine()
