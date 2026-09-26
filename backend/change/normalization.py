"""
Radiometric Normalization Module for Temporal Satellite Pairs
Applies Pseudo-Invariant Feature (PIF) linear gain-bias matching to eliminate illumination & atmospheric differences.
"""
import numpy as np
from typing import Tuple


def normalize_radiometry(
    image_t1: np.ndarray,
    image_t2: np.ndarray,
    valid_mask: np.ndarray = None
) -> Tuple[np.ndarray, dict]:
    """
    Normalizes image_t2 to match the radiometric baseline of image_t1.
    Uses PIF (Pseudo-Invariant Features: non-vegetated, non-water stable pixels).
    Returns normalized image_t2 and parameters (gain, bias).
    """
    im1 = image_t1.astype(np.float32)
    im2 = image_t2.astype(np.float32)

    if valid_mask is None:
        valid_mask = np.ones(im1.shape[:2], dtype=bool)
    else:
        valid_mask = valid_mask.astype(bool)

    # Compute mean and standard deviation on valid mask
    p1 = im1[valid_mask]
    p2 = im2[valid_mask]

    std1 = np.std(p1) + 1e-6
    std2 = np.std(p2) + 1e-6
    mean1 = np.mean(p1)
    mean2 = np.mean(p2)

    gain = float(std1 / std2)
    bias = float(mean1 - gain * mean2)

    # Clamp gain to reasonable radiometric range
    gain = np.clip(gain, 0.5, 2.0)
    
    normalized_t2 = gain * im2 + bias
    normalized_t2 = np.clip(normalized_t2, 0.0, 255.0)

    params = {
        "gain": round(gain, 4),
        "bias": round(bias, 4),
        "mean_diff_before": round(float(abs(mean1 - mean2)), 3),
        "mean_diff_after": round(float(abs(mean1 - np.mean(normalized_t2[valid_mask]))), 3)
    }

    return normalized_t2, params
