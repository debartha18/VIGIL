"""
Change Detection Core Engine
Combines Multi-Temporal Siamese Differencing and Spectral Index Differencing (NDWI, NDVI, NDBI).
"""
import numpy as np
from scipy import ndimage
from typing import Dict, Any, List, Tuple
from shapely.geometry import Polygon, mapping


def compute_spectral_indices(chip_rgbnir: np.ndarray) -> Dict[str, np.ndarray]:
    """
    Computes NDWI, NDVI, NDBI from multi-band imagery.
    If only 3-channel RGB provided, uses approximations (Green - Red for water proxy).
    """
    if chip_rgbnir.ndim == 3 and chip_rgbnir.shape[-1] >= 4:
        r = chip_rgbnir[:, :, 0].astype(np.float32)
        g = chip_rgbnir[:, :, 1].astype(np.float32)
        b = chip_rgbnir[:, :, 2].astype(np.float32)
        nir = chip_rgbnir[:, :, 3].astype(np.float32)
        swir = chip_rgbnir[:, :, 4].astype(np.float32) if chip_rgbnir.shape[-1] >= 5 else (nir * 0.8)
    else:
        # Fallback for RGB chips
        r = chip_rgbnir[:, :, 0].astype(np.float32) if chip_rgbnir.ndim == 3 else chip_rgbnir.astype(np.float32)
        g = chip_rgbnir[:, :, 1].astype(np.float32) if chip_rgbnir.ndim == 3 else chip_rgbnir.astype(np.float32)
        b = chip_rgbnir[:, :, 2].astype(np.float32) if chip_rgbnir.ndim == 3 else chip_rgbnir.astype(np.float32)
        nir = (r * 0.4 + g * 0.6) * 1.2
        swir = (r * 0.7 + g * 0.3)

    ndvi = (nir - r) / (nir + r + 1e-6)
    ndwi = (g - nir) / (g + nir + 1e-6)
    ndbi = (swir - nir) / (swir + nir + 1e-6)

    return {
        "ndvi": np.clip(ndvi, -1.0, 1.0),
        "ndwi": np.clip(ndwi, -1.0, 1.0),
        "ndbi": np.clip(ndbi, -1.0, 1.0),
    }


class ChangeDetector:
    def __init__(self, min_blob_pixels: int = 25, change_threshold: float = 0.25):
        self.min_blob_pixels = min_blob_pixels
        self.change_threshold = change_threshold

    def detect_changes(
        self,
        t1_chip: np.ndarray,
        t2_chip: np.ndarray,
        tile_bounds: List[float], # [min_lon, min_lat, max_lon, max_lat]
        t1_indices: Optional[Dict[str, np.ndarray]] = None,
        t2_indices: Optional[Dict[str, np.ndarray]] = None
    ) -> List[Dict[str, Any]]:
        """
        Runs bi-temporal differencing, extracts candidate change blobs with geo-coordinates.
        """
        if t1_indices is None:
            t1_indices = compute_spectral_indices(t1_chip)
        if t2_indices is None:
            t2_indices = compute_spectral_indices(t2_chip)

        # Compute index differences
        d_ndvi = t2_indices["ndvi"] - t1_indices["ndvi"]
        d_ndwi = t2_indices["ndwi"] - t1_indices["ndwi"]
        d_ndbi = t2_indices["ndbi"] - t1_indices["ndbi"]

        # Radiance/Luminance difference proxy (simulating FC-Siam-diff feature distance)
        im1_gray = np.mean(t1_chip, axis=-1 if t1_chip.ndim == 3 else 0).astype(np.float32)
        im2_gray = np.mean(t2_chip, axis=-1 if t2_chip.ndim == 3 else 0).astype(np.float32)
        diff_mag = np.abs(im2_gray - im1_gray) / 255.0

        # Multi-modal change metric
        change_surface = 0.4 * diff_mag + 0.3 * np.abs(d_ndbi) + 0.3 * np.abs(d_ndwi)

        # Thresholding
        binary_mask = change_surface > self.change_threshold
        # Morphological opening and closing to remove speckle noise
        binary_mask = ndimage.binary_opening(binary_mask, structure=np.ones((3, 3)))
        binary_mask = ndimage.binary_closing(binary_mask, structure=np.ones((3, 3)))

        # Connected component labeling
        labeled, num_features = ndimage.label(binary_mask)

        candidates = []
        min_lon, min_lat, max_lon, max_lat = tile_bounds
        h, w = binary_mask.shape

        for feat_idx in range(1, num_features + 1):
            feat_mask = (labeled == feat_idx)
            area_px = int(np.sum(feat_mask))
            if area_px < self.min_blob_pixels:
                continue

            # Approximate area in square meters (assuming 10m Sentinel-2 pixels)
            area_m2 = area_px * 100.0

            # Find bounding box in pixel coordinates
            ys, xs = np.where(feat_mask)
            y_min, y_max = int(np.min(ys)), int(np.max(ys))
            x_min, x_max = int(np.min(xs)), int(np.max(xs))

            # Transform to geographic coordinates
            geo_min_lon = min_lon + (x_min / w) * (max_lon - min_lon)
            geo_max_lon = min_lon + (x_max / w) * (max_lon - min_lon)
            geo_max_lat = max_lat - (y_min / h) * (max_lat - min_lat)
            geo_min_lat = max_lat - (y_max / h) * (max_lat - min_lat)

            # Mean deltas within the blob
            blob_d_ndvi = float(np.mean(d_ndvi[feat_mask]))
            blob_d_ndwi = float(np.mean(d_ndwi[feat_mask]))
            blob_d_ndbi = float(np.mean(d_ndbi[feat_mask]))
            blob_mag = float(np.mean(change_surface[feat_mask]))

            # Create Shapely Polygon
            poly = Polygon([
                (geo_min_lon, geo_min_lat),
                (geo_max_lon, geo_min_lat),
                (geo_max_lon, geo_max_lat),
                (geo_min_lon, geo_max_lat),
                (geo_min_lon, geo_min_lat)
            ])

            candidates.append({
                "pixel_bbox": [x_min, y_min, x_max, y_max],
                "geo_bbox": [geo_min_lon, geo_min_lat, geo_max_lon, geo_max_lat],
                "geometry": mapping(poly),
                "area_m2": round(area_m2, 1),
                "area_px": area_px,
                "change_magnitude": round(blob_mag, 3),
                "d_ndvi": round(blob_d_ndvi, 3),
                "d_ndwi": round(blob_d_ndwi, 3),
                "d_ndbi": round(blob_d_ndbi, 3),
            })

        return candidates


change_detector = ChangeDetector()
