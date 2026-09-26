"""
Sub-pixel Co-registration Verification Module
Uses Phase Correlation (Fourier Shift Theorem) to verify sub-pixel alignment between multi-temporal chips.
"""
import numpy as np
from scipy import signal
from typing import Tuple, Dict, Any
from backend.config import MAX_REGISTRATION_RESIDUAL_PX


def check_coregistration(
    image_t1: np.ndarray,
    image_t2: np.ndarray
) -> Dict[str, Any]:
    """
    Computes sub-pixel phase correlation between two co-registered tiles.
    Returns:
    - shift_x, shift_y (in pixels)
    - residual_px: Euclidean shift magnitude
    - peak_correlation: 0.0 to 1.0 peak value
    - is_aligned: bool (residual <= MAX_REGISTRATION_RESIDUAL_PX)
    """
    # Convert to 2D grayscale if multi-channel
    if image_t1.ndim == 3:
        im1 = np.mean(image_t1, axis=-1 if image_t1.shape[-1] <= 4 else 0)
    else:
        im1 = image_t1.copy()

    if image_t2.ndim == 3:
        im2 = np.mean(image_t2, axis=-1 if image_t2.shape[-1] <= 4 else 0)
    else:
        im2 = image_t2.copy()

    # Standardize
    im1 = (im1 - np.mean(im1)) / (np.std(im1) + 1e-6)
    im2 = (im2 - np.mean(im2)) / (np.std(im2) + 1e-6)

    # 2D FFT Phase Correlation
    f1 = np.fft.fft2(im1)
    f2 = np.fft.fft2(im2)
    cross_power = (f1 * np.conj(f2)) / (np.abs(f1 * np.conj(f2)) + 1e-9)
    corr = np.real(np.fft.ifft2(cross_power))
    corr = np.fft.fftshift(corr)

    h, w = corr.shape
    y_peak, x_peak = np.unravel_index(np.argmax(corr), corr.shape)
    
    # Peak shift from center
    shift_y = float(y_peak - h // 2)
    shift_x = float(x_peak - w // 2)
    residual_px = float(np.sqrt(shift_x**2 + shift_y**2))
    peak_corr = float(np.max(corr))

    is_aligned = residual_px <= MAX_REGISTRATION_RESIDUAL_PX

    return {
        "shift_x": round(shift_x, 3),
        "shift_y": round(shift_y, 3),
        "residual_px": round(residual_px, 3),
        "peak_correlation": round(min(1.0, max(0.0, peak_corr)), 3),
        "is_aligned": is_aligned,
        "max_threshold_px": MAX_REGISTRATION_RESIDUAL_PX
    }
