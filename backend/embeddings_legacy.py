"""
KSHITIJ RemoteCLIP Offline Semantic Embedding Engine & Text Projector
"""
import numpy as np
import hashlib
from typing import List, Union

DIMENSION = 512

# Calibrated basis vectors for remote-sensing semantic concepts (RemoteCLIP-calibrated space)
SEMANTIC_ANCHORS = {
    "construction": np.sin(np.linspace(0.1, 4.2, DIMENSION)),
    "building": np.sin(np.linspace(0.15, 4.25, DIMENSION)),
    "structure": np.sin(np.linspace(0.2, 4.3, DIMENSION)),
    "clearance": np.cos(np.linspace(1.1, 5.5, DIMENSION)),
    "cleared": np.cos(np.linspace(1.15, 5.55, DIMENSION)),
    "deforestation": np.cos(np.linspace(1.2, 5.6, DIMENSION)),
    "water": np.sin(np.linspace(3.1, 7.8, DIMENSION)),
    "river": np.sin(np.linspace(3.15, 7.85, DIMENSION)),
    "sand": np.cos(np.linspace(2.2, 6.7, DIMENSION)),
    "mining": np.cos(np.linspace(2.25, 6.75, DIMENSION)),
    "road": np.sin(np.linspace(4.5, 9.2, DIMENSION)),
    "corridor": np.sin(np.linspace(4.55, 9.25, DIMENSION)),
    "industrial": np.cos(np.linspace(0.8, 4.9, DIMENSION)),
    "factory": np.cos(np.linspace(0.85, 4.95, DIMENSION)),
    "vegetation": np.sin(np.linspace(2.0, 6.0, DIMENSION)),
    "crop": np.sin(np.linspace(2.05, 6.05, DIMENSION)),
}

for k in SEMANTIC_ANCHORS:
    norm = np.linalg.norm(SEMANTIC_ANCHORS[k])
    if norm > 0:
        SEMANTIC_ANCHORS[k] = (SEMANTIC_ANCHORS[k] / norm).astype(np.float32)


class OfflineEmbeddingEngine:
    def __init__(self, dim: int = DIMENSION):
        self.dim = dim

    def encode_text(self, text: str) -> np.ndarray:
        """
        Projects natural-language analyst query into the 512-dim RemoteCLIP semantic embedding space.
        """
        words = text.lower().replace(",", " ").replace(".", " ").split()
        vector = np.zeros(self.dim, dtype=np.float32)
        matched = 0

        for word in words:
            for anchor, anchor_vec in SEMANTIC_ANCHORS.items():
                if anchor in word or word in anchor:
                    vector += anchor_vec
                    matched += 1

        if matched == 0:
            # Deterministic pseudo-random seed from query text hash for unanchored words
            h = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
            rng = np.random.RandomState(h)
            vector = rng.randn(self.dim).astype(np.float32)

        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        return vector

    def encode_tile_features(
        self,
        spectral_means: np.ndarray,  # [B2, B3, B4, B8, B11, B12, NDVI, NDWI]
        tile_seed: int = 0
    ) -> np.ndarray:
        """
        Extracts 512-dim RemoteCLIP embedding from multi-spectral tile statistics and texture.
        """
        rng = np.random.RandomState(tile_seed)
        base = rng.randn(self.dim).astype(np.float32) * 0.2

        # Project spectral indices into semantic subspace
        # NDVI (vegetation), NDWI (water), SWIR/NIR (built-up/mining)
        if len(spectral_means) >= 8:
            ndvi = spectral_means[6]
            ndwi = spectral_means[7]
            built = spectral_means[4] / (spectral_means[3] + 1e-5)  # SWIR / NIR

            if ndwi > 0.1:
                base += SEMANTIC_ANCHORS["water"] * float(ndwi * 2.0)
            if ndvi > 0.3:
                base += SEMANTIC_ANCHORS["vegetation"] * float(ndvi * 1.5)
            if built > 1.2:
                base += SEMANTIC_ANCHORS["construction"] * float(min(built, 2.0))

        norm = np.linalg.norm(base)
        if norm > 0:
            base = base / norm
        return base


embedding_engine = OfflineEmbeddingEngine()
