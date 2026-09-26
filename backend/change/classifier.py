"""
Change Candidate Classification Module
Assigns canonical change types (NEW_CONSTRUCTION, LAND_CLEARANCE, WATER_BOUNDARY, ROAD_EXPANSION)
based on spectral index shifts and morphological properties.
"""
from typing import Dict, Any


def classify_change(candidate_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classifies candidate based on spectral signature deltas:
    d_ndbi (built-up index delta)
    d_ndvi (vegetation index delta)
    d_ndwi (water index delta)
    and morphology (aspect ratio, area).
    """
    d_ndbi = candidate_dict.get("d_ndbi", 0.0)
    d_ndvi = candidate_dict.get("d_ndvi", 0.0)
    d_ndwi = candidate_dict.get("d_ndwi", 0.0)
    pixel_bbox = candidate_dict.get("pixel_bbox", [0, 0, 10, 10])
    
    width_px = max(1, pixel_bbox[2] - pixel_bbox[0])
    height_px = max(1, pixel_bbox[3] - pixel_bbox[1])
    aspect_ratio = max(width_px / height_px, height_px / width_px)

    change_type = "UNKNOWN"
    reasoning = []

    # Rule 1: High positive NDBI + Drop in NDVI -> New Construction
    if d_ndbi > 0.15 and d_ndvi < -0.10:
        if aspect_ratio > 3.0:
            change_type = "ROAD_EXPANSION"
            reasoning.append(f"Linear high built-up index (+{d_ndbi}) with aspect ratio {aspect_ratio:.1f}")
        else:
            change_type = "NEW_CONSTRUCTION"
            reasoning.append(f"Built-up index increase (+{d_ndbi}) with vegetation loss ({d_ndvi})")

    # Rule 2: Significant water shift -> Water Boundary / Dredging / Shoreline
    elif abs(d_ndwi) > 0.20:
        change_type = "WATER_BOUNDARY"
        reasoning.append(f"Water index delta shift ({d_ndwi:+.2f}) along riparian corridor")

    # Rule 3: Heavy NDVI drop without high built-up -> Land Clearance
    elif d_ndvi < -0.22:
        change_type = "LAND_CLEARANCE"
        reasoning.append(f"Pronounced canopy loss ({d_ndvi:.2f}) without immediate built-up signature")

    # Rule 4: Moderate NDBI increase
    elif d_ndbi > 0.12:
        change_type = "NEW_CONSTRUCTION"
        reasoning.append(f"Emergence of high-albedo artificial surfaces (+{d_ndbi:.2f})")

    else:
        change_type = "LAND_CLEARANCE"
        reasoning.append("Surface disturbance and soil exposure detected")

    return {
        "change_type": change_type,
        "classified_by": "SpectralRules+Morphology-v1.0",
        "aspect_ratio": round(aspect_ratio, 2),
        "classification_notes": "; ".join(reasoning)
    }
