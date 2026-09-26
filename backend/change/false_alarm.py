"""
8-Step False Alarm Rejection Pipeline
Explicitly identifies and logs suppression reasons (Cloud, Shadow, Misregistration, Phenology, etc.)
Guarantees precision-over-recall: abstains when confidence < 0.65.
"""
from typing import Dict, Any, Optional, Tuple, List
import json
from backend.config import (
    CONFIDENCE_ABSTAIN_THRESHOLD,
    MAX_REGISTRATION_RESIDUAL_PX,
    MAX_SCL_CLOUD_FRACTION,
    MAX_SCL_SHADOW_FRACTION,
    CONFIDENCE_WEIGHTS
)
from backend.database.db import db_manager


class FalseAlarmFilter:
    def __init__(self):
        self.db = db_manager

    def compute_composite_confidence(self, metrics: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
        """
        Computes weighted geometric mean confidence across 5 key dimensions:
        - semanticRelevance (0.25)
        - temporalPersistence (0.30)
        - registrationQuality (0.15)
        - observationCleanliness (0.15)
        - changeMagnitude (0.15)
        """
        weights = CONFIDENCE_WEIGHTS
        components = {
            "semanticRelevance": max(0.01, min(1.0, metrics.get("semanticRelevance", 0.70))),
            "temporalPersistence": max(0.01, min(1.0, metrics.get("temporalPersistence", 0.80))),
            "registrationQuality": max(0.01, min(1.0, metrics.get("registrationQuality", 0.90))),
            "observationCleanliness": max(0.01, min(1.0, metrics.get("observationCleanliness", 0.85))),
            "changeMagnitude": max(0.01, min(1.0, metrics.get("changeMagnitude", 0.75))),
        }

        # Weighted geometric mean: exp(sum(w_i * ln(x_i)))
        log_sum = sum(weights[k] * np_log(components[k]) for k in weights)
        composite = float(np_exp(log_sum))
        composite = round(min(0.99, max(0.0, composite)), 3)

        return composite, {k: round(v, 3) for k, v in components.items()}

    def evaluate_candidate(
        self,
        candidate_id: str,
        geometry_geojson: Dict[str, Any],
        evidence: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Runs candidate through the 8-step verification pipeline.
        Returns:
        {
          "passed": bool,
          "rejection_reason": str | None,
          "confidence_score": float,
          "breakdown": dict,
          "pipeline_steps": list of {step, passed, note}
        }
        """
        steps = []

        # Step 1: SCL Cloud Contamination
        cloud_pct = evidence.get("cloud_pct", 0.0)
        scl_cloud = evidence.get("scl_cloud_fraction", 0.0)
        step1_pass = scl_cloud <= MAX_SCL_CLOUD_FRACTION
        steps.append({
            "step": 1,
            "name": "Cloud Contamination Check",
            "passed": step1_pass,
            "value": f"{scl_cloud:.1%}",
            "threshold": f"≤ {MAX_SCL_CLOUD_FRACTION:.1%}",
            "note": "Passes cloud mask threshold" if step1_pass else "High cloud contamination"
        })
        if not step1_pass:
            return self._reject(candidate_id, geometry_geojson, "SCL_CLOUD_CONTAMINATION", steps, evidence)

        # Step 2: SCL Shadow Contamination
        scl_shadow = evidence.get("scl_shadow_fraction", 0.0)
        step2_pass = scl_shadow <= MAX_SCL_SHADOW_FRACTION
        steps.append({
            "step": 2,
            "name": "Cloud Shadow Check",
            "passed": step2_pass,
            "value": f"{scl_shadow:.1%}",
            "threshold": f"≤ {MAX_SCL_SHADOW_FRACTION:.1%}",
            "note": "Passes shadow threshold" if step2_pass else "Cloud shadow artifact"
        })
        if not step2_pass:
            return self._reject(candidate_id, geometry_geojson, "SCL_SHADOW_CONTAMINATION", steps, evidence)

        # Step 3: Sub-pixel Registration Residual
        residual_px = evidence.get("registration_residual_px", 0.20)
        step3_pass = residual_px <= MAX_REGISTRATION_RESIDUAL_PX
        steps.append({
            "step": 3,
            "name": "Co-Registration Alignment",
            "passed": step3_pass,
            "value": f"{residual_px:.2f} px",
            "threshold": f"≤ {MAX_REGISTRATION_RESIDUAL_PX:.2f} px",
            "note": "Sub-pixel aligned" if step3_pass else "Misregistration parallax artifact"
        })
        if not step3_pass:
            return self._reject(candidate_id, geometry_geojson, "MISREGISTRATION_PARALLAX", steps, evidence)

        # Step 4: Temporal Persistence
        clean_scenes = evidence.get("clean_scenes_count", 2)
        is_persistent = evidence.get("is_persistent", True)
        step4_pass = is_persistent and clean_scenes >= 2
        steps.append({
            "step": 4,
            "name": "Multi-Temporal Persistence",
            "passed": step4_pass,
            "value": f"{clean_scenes} clean scenes",
            "threshold": "≥ 2 scenes",
            "note": "Confirmed in multi-scene stack" if step4_pass else "Ephemeral single-scene anomaly"
        })
        if not step4_pass:
            return self._reject(candidate_id, geometry_geojson, "EPHEMERAL_TRANSIENT", steps, evidence)

        # Step 5: Agricultural Phenology Check
        is_phenology = evidence.get("is_seasonal_phenology", False)
        step5_pass = not is_phenology
        steps.append({
            "step": 5,
            "name": "Seasonal Phenology Check",
            "passed": step5_pass,
            "value": "Normal" if step5_pass else "Cyclical NDVI Dip",
            "threshold": "Non-seasonal",
            "note": "Structural change, not seasonal crop cycle" if step5_pass else "Agricultural crop harvesting cycle"
        })
        if not step5_pass:
            return self._reject(candidate_id, geometry_geojson, "AGRICULTURAL_PHENOLOGY", steps, evidence)

        # Step 6: Tidal Fluctuation
        is_tidal = evidence.get("is_tidal_oscillation", False)
        step6_pass = not is_tidal
        steps.append({
            "step": 6,
            "name": "Tidal Oscillation Check",
            "passed": step6_pass,
            "value": "Permanent" if step6_pass else "Tidal Inundation",
            "threshold": "Permanent landform",
            "note": "Permanent structure verified" if step6_pass else "Intertidal mudflat inundation"
        })
        if not step6_pass:
            return self._reject(candidate_id, geometry_geojson, "TIDAL_FLUCTUATION", steps, evidence)

        # Step 7: Sensor Artifact / NoData Edge
        is_sensor_striping = evidence.get("is_sensor_striping", False)
        step7_pass = not is_sensor_striping
        steps.append({
            "step": 7,
            "name": "Sensor Striping & Boundary Check",
            "passed": step7_pass,
            "value": "Valid Data" if step7_pass else "Sensor Striping",
            "threshold": "Clean swath",
            "note": "No sensor line dropouts" if step7_pass else "Sensor line dropout or edge nodata"
        })
        if not step7_pass:
            return self._reject(candidate_id, geometry_geojson, "SENSOR_STRIPING_NODATA", steps, evidence)

        # Step 8: Precision Threshold (Confidence >= 0.65)
        raw_metrics = evidence.get("confidence_metrics", {})
        composite_score, breakdown = self.compute_composite_confidence(raw_metrics)
        step8_pass = composite_score >= CONFIDENCE_ABSTAIN_THRESHOLD
        steps.append({
            "step": 8,
            "name": "Confidence Threshold Gate",
            "passed": step8_pass,
            "value": f"{composite_score:.2f}",
            "threshold": f"≥ {CONFIDENCE_ABSTAIN_THRESHOLD:.2f}",
            "note": "Exceeds precision threshold" if step8_pass else "Abstained due to low confidence"
        })
        if not step8_pass:
            return self._reject(candidate_id, geometry_geojson, "LOW_CONFIDENCE_THRESHOLD", steps, evidence, composite_score, breakdown)

        return {
            "passed": True,
            "rejection_reason": None,
            "confidence_score": composite_score,
            "confidence_breakdown": breakdown,
            "pipeline_steps": steps
        }

    def _reject(
        self,
        candidate_id: str,
        geometry_geojson: Dict[str, Any],
        reason: str,
        steps: List[Dict[str, Any]],
        evidence: Dict[str, Any],
        score: float = 0.40,
        breakdown: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        if breakdown is None:
            breakdown = {"semanticRelevance": 0.4, "temporalPersistence": 0.3, "registrationQuality": 0.5, "observationCleanliness": 0.4, "changeMagnitude": 0.4}

        # Save to rejected_candidates database table
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO rejected_candidates (id, geometry_json, reason, evidence_json)
            VALUES (?, ?, ?, ?)
            """, (
                candidate_id,
                json.dumps(geometry_geojson),
                reason,
                json.dumps({"pipeline_steps": steps, "evidence": evidence})
            ))
            conn.commit()

        return {
            "passed": False,
            "rejection_reason": reason,
            "confidence_score": score,
            "confidence_breakdown": breakdown,
            "pipeline_steps": steps
        }


import math
def np_log(x): return math.log(max(1e-6, x))
def np_exp(x): return math.exp(x)

false_alarm_filter = FalseAlarmFilter()
