"""
KSHITIJ FAISS Vector Index (Offline, Incremental Add Without Rebuild)
"""
import numpy as np
from pathlib import Path
from typing import Tuple, List, Optional
import os

try:
    import faiss
    HAS_FAISS = True
except ImportError:
    HAS_FAISS = False

INDEX_PATH = Path(__file__).parent / "kshitij_faiss.index"
DIMENSION = 512


class VectorIndex:
    def __init__(self, dim: int = DIMENSION, index_path: Path = INDEX_PATH):
        self.dim = dim
        self.index_path = index_path
        self.embeddings_list: List[np.ndarray] = []
        self.index = None

        if HAS_FAISS:
            if self.index_path.exists():
                try:
                    self.index = faiss.read_index(str(self.index_path))
                except Exception:
                    self.index = faiss.IndexFlatIP(self.dim)
            else:
                self.index = faiss.IndexFlatIP(self.dim)
        else:
            self.index = None

    def add(self, vectors: np.ndarray) -> List[int]:
        """
        Adds vectors to the FAISS index incrementally without rebuilding.
        Returns list of newly assigned embedding IDs.
        """
        if len(vectors.shape) == 1:
            vectors = vectors.reshape(1, -1)

        # L2 normalize for cosine similarity via Inner Product
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        normalized = (vectors / norms).astype(np.float32)

        start_id = self.ntotal()

        if HAS_FAISS and self.index is not None:
            self.index.add(normalized)
            try:
                faiss.write_index(self.index, str(self.index_path))
            except Exception:
                pass
        else:
            self.embeddings_list.append(normalized)

        end_id = self.ntotal()
        return list(range(start_id, end_id))

    def search(self, query_vector: np.ndarray, k: int = 10) -> Tuple[np.ndarray, np.ndarray]:
        """
        Searches the index for the top-k nearest neighbors by cosine similarity.
        """
        if len(query_vector.shape) == 1:
            query_vector = query_vector.reshape(1, -1)

        norm = np.linalg.norm(query_vector)
        if norm > 0:
            query_vector = (query_vector / norm).astype(np.float32)

        total = self.ntotal()
        if total == 0:
            return np.array([[]]), np.array([[]])

        k = min(k, total)

        if HAS_FAISS and self.index is not None:
            scores, indices = self.index.search(query_vector, k)
            return scores, indices
        else:
            all_vecs = np.vstack(self.embeddings_list)
            scores = np.dot(all_vecs, query_vector.T).flatten()
            top_indices = np.argsort(-scores)[:k]
            top_scores = scores[top_indices]
            return top_scores.reshape(1, -1), top_indices.reshape(1, -1)

    def ntotal(self) -> int:
        if HAS_FAISS and self.index is not None:
            return self.index.ntotal
        elif self.embeddings_list:
            return sum(len(arr) for arr in self.embeddings_list)
        return 0


vector_store = VectorIndex()
