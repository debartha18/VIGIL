"""
Sentinel-2 SCL & s2cloudless Quality Masking Engine
"""
import numpy as np
from typing import Dict, Any


class SCLQualityEngine:
    # SCL Classes:
    # 0: NO_DATA, 1: DEFECTIVE, 2: DARK_AREA, 3: SHADOW, 4: VEGETATION,
    # 5: BARE_SOIL, 6: WATER, 7: UNCLASSIFIED, 8: CLOUD_MED, 9: CLOUD_HIGH,
    # 10: CIRRUS, 11: SNOW
    CLOUD_CLASSES = [8, 9, 10]
    SHADOW_CLASS = 3
    SNOW_CLASS = 11

    @classmethod
    def compute_quality_fractions(cls, scl_array: np.ndarray) -> Dict[str, float]:
        """
        Computes accurate fractional quality metrics for a given raster array.
        """
        total = scl_array.size
        if total == 0:
            return {"cloud": 0.0, "shadow": 0.0, "snow": 0.0, "valid": 1.0}

        cloud_cnt = np.isin(scl_array, cls.CLOUD_CLASSES).sum()
        shadow_cnt = (scl_array == cls.SHADOW_CLASS).sum()
        snow_cnt = (scl_array == cls.SNOW_CLASS).sum()
        valid_cnt = (scl_array != 0).sum()

        return {
            "cloud": round(float(cloud_cnt / total), 4),
            "shadow": round(float(shadow_cnt / total), 4),
            "snow": round(float(snow_cnt / total), 4),
            "valid": round(float(valid_cnt / total), 4),
        }


def compute_scl_masks(scl_array: np.ndarray) -> Dict[str, float]:
    res = SCLQualityEngine.compute_quality_fractions(scl_array)
    return {
        "cloud_fraction": res["cloud"],
        "shadow_fraction": res["shadow"],
        "snow_fraction": res["snow"],
        "valid_fraction": res["valid"]
    }

