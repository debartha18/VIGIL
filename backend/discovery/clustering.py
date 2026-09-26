"""
Pattern Discovery & Unsupervised Clustering Engine
Projects 512-dim RemoteCLIP embeddings to 2D manifold (PCA / UMAP) and discovers clusters & anomalies.
"""
import numpy as np
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from typing import List, Dict, Any


class DiscoveryEngine:
    def __init__(self, n_clusters: int = 5):
        self.n_clusters = n_clusters

    def cluster_embeddings(
        self,
        vectors: np.ndarray,
        item_ids: List[str],
        metadata_list: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Projects vectors to 2D coordinates and discovers thematic clusters.
        """
        if len(vectors) < 3:
            return {
                "clusters": [],
                "points": []
            }

        # 2D Projection via PCA (deterministic, fast, zero offline deps)
        pca = PCA(n_components=2, random_state=42)
        coords_2d = pca.fit_transform(vectors)

        # Normalize 2D coords to range [-100, 100] for visual plot
        min_c = np.min(coords_2d, axis=0)
        max_c = np.max(coords_2d, axis=0)
        range_c = np.maximum(max_c - min_c, 1e-6)
        normalized_2d = ((coords_2d - min_c) / range_c) * 200.0 - 100.0

        # Cluster using KMeans
        k = min(self.n_clusters, len(vectors))
        kmeans = KMeans(n_clusters=k, random_state=42, n_init="auto")
        labels = kmeans.fit_predict(vectors)

        # Calculate cluster centers in 2D
        cluster_summaries = {}
        for c_id in range(k):
            cluster_summaries[c_id] = {
                "cluster_id": c_id,
                "label": f"Cluster-{c_id + 1}",
                "count": 0,
                "center": [0.0, 0.0]
            }

        points = []
        for i, (item_id, label, meta) in enumerate(zip(item_ids, labels, metadata_list)):
            pt = [round(float(normalized_2d[i, 0]), 2), round(float(normalized_2d[i, 1]), 2)]
            cluster_summaries[label]["count"] += 1
            cluster_summaries[label]["center"][0] += pt[0]
            cluster_summaries[label]["center"][1] += pt[1]

            points.append({
                "id": item_id,
                "cluster_id": int(label),
                "x": pt[0],
                "y": pt[1],
                "label": meta.get("label", item_id),
                "change_type": meta.get("change_type", "UNKNOWN"),
                "confidence": meta.get("confidence", 0.8)
            })

        cluster_list = []
        for c_id, info in cluster_summaries.items():
            if info["count"] > 0:
                info["center"][0] = round(info["center"][0] / info["count"], 2)
                info["center"][1] = round(info["center"][1] / info["count"], 2)
                cluster_list.append(info)

        return {
            "clusters": cluster_list,
            "points": points,
            "explained_variance_ratio": [round(float(v), 3) for v in pca.explained_variance_ratio_]
        }


discovery_engine = DiscoveryEngine()
