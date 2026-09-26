"""
FAISS Vector Index Store (Offline 512-dim Cosine Similarity Search)
"""
import faiss
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional
from backend.config import INDEX_PATH, EMBEDDING_DIM


class VectorStore:
    def __init__(self, index_path: Path = INDEX_PATH, dim: int = EMBEDDING_DIM):
        self.index_path = index_path
        self.dim = dim
        self.index: Optional[faiss.IndexFlatIP] = None
        self.id_map: List[str] = []  # Map internal faiss sequential index -> tile_id
        self.load_or_create()

    def load_or_create(self):
        map_path = self.index_path.with_suffix(".ids.npy")
        if self.index_path.exists() and map_path.exists():
            try:
                self.index = faiss.read_index(str(self.index_path))
                self.id_map = list(np.load(str(map_path), allow_pickle=True))
                return
            except Exception as e:
                print(f"[VectorStore] Warning loading index: {e}, recreating...")

        # Initialize new IndexFlatIP for cosine similarity (normalized vectors)
        self.index = faiss.IndexFlatIP(self.dim)
        self.id_map = []

    def save(self):
        if self.index is not None:
            self.index_path.parent.mkdir(parents=True, exist_ok=True)
            faiss.write_index(self.index, str(self.index_path))
            map_path = self.index_path.with_suffix(".ids.npy")
            np.save(str(map_path), np.array(self.id_map, dtype=object))

    def add(self, vectors: np.ndarray, ids: List[str]):
        """
        Add batch of vectors (shape: [N, 512]) with associated string IDs.
        """
        if len(vectors) == 0:
            return

        # Ensure float32 and unit normalized
        vecs = vectors.astype(np.float32)
        norms = np.linalg.norm(vecs, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        vecs = vecs / norms

        if self.index is None:
            self.index = faiss.IndexFlatIP(self.dim)

        self.index.add(vecs)
        self.id_map.extend(ids)
        self.save()

    def search(self, query_vec: np.ndarray, top_k: int = 50) -> List[Tuple[str, float]]:
        """
        Search top_k nearest neighbors by cosine similarity.
        Returns list of (tile_id, similarity_score).
        """
        if self.index is None or self.index.ntotal == 0:
            return []

        q = query_vec.reshape(1, -1).astype(np.float32)
        norm = np.linalg.norm(q)
        if norm > 0:
            q = q / norm

        k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(q, k)

        results: List[Tuple[str, float]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0 and idx < len(self.id_map):
                results.append((self.id_map[idx], float(score)))

        return results

    @property
    def total_vectors(self) -> int:
        return self.index.ntotal if self.index else 0


vector_store = VectorStore()
