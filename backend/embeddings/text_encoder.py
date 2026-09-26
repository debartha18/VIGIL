"""
Natural Language Query Parser & Spatial Predicate Resolver for KSHITIJ / ORBITAL INTEL
Decomposes user queries into semantic keywords, temporal filters, and spatial constraints.
"""
import re
from typing import Dict, Any, List, Optional, Tuple
from shapely.geometry import Point, Polygon
import numpy as np


SPATIAL_KEYWORDS = {
    "near river": ("near_water", 500.0),
    "near water": ("near_water", 500.0),
    "along river": ("near_water", 300.0),
    "by the coast": ("near_water", 1000.0),
    "coastal": ("near_water", 1500.0),
    "riverside": ("near_water", 400.0),
    "near road": ("near_road", 300.0),
    "along highway": ("near_road", 500.0),
    "inland": ("inland", 2000.0),
    "port area": ("near_port", 1000.0),
}


class TextQueryParser:
    def __init__(self):
        self.spatial_keywords = SPATIAL_KEYWORDS

    def parse(self, query: str) -> Dict[str, Any]:
        """
        Parses text query into components:
        - semantic_text: cleaned string for vector embedding
        - spatial_predicates: list of (type, distance_m)
        - date_range: optional (start_date, end_date)
        - sensor_hint: optional sensor string
        """
        cleaned = query.strip()
        lower_q = cleaned.lower()
        spatial_predicates: List[Dict[str, Any]] = []
        
        # Check explicit distance patterns first: "within 500m of river", "within 300m of road"
        within_match = re.search(r"within\s+(\d+)\s*m(?:eters?)?\s+(?:of|from)\s+(?:the\s+|a\s+)?([a-z]+)", lower_q)

        if within_match:
            dist = float(within_match.group(1))
            feature = within_match.group(2)
            pred_type = "near_water" if feature in ["river", "water", "coast", "shore", "sea"] else ("near_road" if feature in ["road", "highway"] else "near_water")
            spatial_predicates.append({
                "predicate": pred_type,
                "max_distance_m": dist,
                "matched_phrase": within_match.group(0)
            })
            cleaned = re.sub(re.escape(within_match.group(0)), "", cleaned, flags=re.IGNORECASE).strip()

        # Check standard spatial keywords if not already matched
        if not spatial_predicates:
            for phrase, (pred_type, max_dist) in self.spatial_keywords.items():
                if phrase in lower_q:
                    spatial_predicates.append({
                        "predicate": pred_type,
                        "max_distance_m": max_dist,
                        "matched_phrase": phrase
                    })
                    cleaned = re.sub(re.escape(phrase), "", cleaned, flags=re.IGNORECASE).strip()


        # Check for year/date patterns
        start_date = None
        end_date = None
        
        # "since 2023", "after 2023", "from 2023"
        since_match = re.search(r"(?:since|after|from)\s+(20\d\d)", lower_q)
        if since_match:
            start_date = f"{since_match.group(1)}-01-01"
            cleaned = re.sub(since_match.group(0), "", cleaned, flags=re.IGNORECASE).strip()

        # "between 2023 and 2025"
        between_match = re.search(r"between\s+(20\d\d)\s+and\s+(20\d\d)", lower_q)
        if between_match:
            start_date = f"{between_match.group(1)}-01-01"
            end_date = f"{between_match.group(2)}-12-31"
            cleaned = re.sub(between_match.group(0), "", cleaned, flags=re.IGNORECASE).strip()

        # Sensor hints
        sensor_hint = None
        if "sar" in lower_q or "sentinel-1" in lower_q or "radar" in lower_q:
            sensor_hint = "Sentinel-1"
        elif "landsat" in lower_q:
            sensor_hint = "Landsat-8"
        elif "optical" in lower_q or "sentinel-2" in lower_q or "multispectral" in lower_q:
            sensor_hint = "Sentinel-2"

        return {
            "original_query": query,
            "semantic_text": cleaned if cleaned else query,
            "spatial_predicates": spatial_predicates,
            "start_date": start_date,
            "end_date": end_date,
            "sensor_hint": sensor_hint
        }


text_parser = TextQueryParser()
