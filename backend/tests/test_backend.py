"""
Unit & Integration Test Suite for KSHITIJ / ORBITAL INTEL
Tests all core modules: embeddings, search, change detection, 8-step pipeline, audit ledger, and API routes.
"""
import unittest
import numpy as np
from fastapi.testclient import TestClient

from backend.config import CONFIDENCE_ABSTAIN_THRESHOLD
from backend.embeddings.clip_engine import clip_engine
from backend.embeddings.text_encoder import text_parser
from backend.index.vector_store import vector_store
from backend.quality.scl_mask import compute_scl_masks
from backend.quality.score import score_observation_cleanliness
from backend.change.coregistration import check_coregistration
from backend.change.normalization import normalize_radiometry
from backend.change.detector import compute_spectral_indices, change_detector
from backend.change.classifier import classify_change
from backend.change.persistence import persistence_engine
from backend.change.false_alarm import false_alarm_filter
from backend.database.audit import audit_ledger
from backend.api.server import app


class TestOrbitalIntelBackend(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_text_parser(self):
        query = "new construction within 500m of river since 2023"
        parsed = text_parser.parse(query)
        self.assertIn("construction", parsed["semantic_text"].lower())
        self.assertTrue(len(parsed["spatial_predicates"]) > 0)
        self.assertEqual(parsed["spatial_predicates"][0]["predicate"], "near_water")
        self.assertEqual(parsed["spatial_predicates"][0]["max_distance_m"], 500.0)
        self.assertEqual(parsed["start_date"], "2023-01-01")

    def test_clip_embeddings_and_search(self):
        vec = clip_engine.encode_text("industrial wharf and jetty")
        self.assertEqual(vec.shape, (512,))
        norm = np.linalg.norm(vec)
        self.assertAlmostEqual(norm, 1.0, places=4)

        results = vector_store.search(vec, top_k=5)
        self.assertTrue(len(results) > 0)
        self.assertIsInstance(results[0][0], str)
        self.assertIsInstance(results[0][1], float)

    def test_scl_quality_masks(self):
        # 10x10 dummy SCL layer (classes: 3=shadow, 4=veg, 8=cloud)
        scl = np.full((10, 10), 4, dtype=np.uint8)
        scl[0:2, 0:2] = 8  # 4 pixels cloud
        scl[0:2, 2:4] = 3  # 4 pixels shadow

        masks = compute_scl_masks(scl)
        self.assertAlmostEqual(masks["cloud_fraction"], 0.04, places=2)
        self.assertAlmostEqual(masks["shadow_fraction"], 0.04, places=2)
        self.assertAlmostEqual(masks["valid_fraction"], 1.0, places=2)


        score = score_observation_cleanliness(masks)
        self.assertTrue(0.0 <= score <= 1.0)

    def test_coregistration_check(self):
        # Create 32x32 synthetic patch
        rng = np.random.RandomState(42)
        base = rng.rand(32, 32)
        # Shifted by 0px
        reg = check_coregistration(base, base)
        self.assertTrue(reg["is_aligned"])
        self.assertLessEqual(reg["residual_px"], 0.1)

    def test_radiometric_normalization(self):
        im1 = np.ones((16, 16), dtype=np.float32) * 100.0
        im2 = np.ones((16, 16), dtype=np.float32) * 120.0
        norm_im2, params = normalize_radiometry(im1, im2)
        self.assertEqual(norm_im2.shape, (16, 16))

    def test_spectral_indices_and_classification(self):
        # 4-channel RGBNIR patch with built-up signature
        chip = np.zeros((16, 16, 4), dtype=np.float32)
        chip[:, :, 0] = 150  # R
        chip[:, :, 1] = 160  # G
        chip[:, :, 2] = 140  # B
        chip[:, :, 3] = 120  # NIR
        indices = compute_spectral_indices(chip)
        self.assertIn("ndvi", indices)
        self.assertIn("ndwi", indices)
        self.assertIn("ndbi", indices)

        # Classification rule check
        candidate = {
            "d_ndbi": 0.25,
            "d_ndvi": -0.20,
            "pixel_bbox": [0, 0, 20, 20]
        }
        res = classify_change(candidate)
        self.assertEqual(res["change_type"], "NEW_CONSTRUCTION")

    def test_persistence_engine(self):
        obs = [
            {"scene_id": "S1", "acquired_at": "2023-01-01", "is_clean": True, "change_present": False},
            {"scene_id": "S2", "acquired_at": "2024-01-01", "is_clean": True, "change_present": True},
            {"scene_id": "S3", "acquired_at": "2025-01-01", "is_clean": True, "change_present": True},
        ]
        res = persistence_engine.verify_persistence([72.7, 21.4, 72.8, 21.5], obs)
        self.assertTrue(res["is_persistent"])
        self.assertEqual(res["first_evidence_at"], "2024-01-01")
        self.assertEqual(res["confirmed_at"], "2025-01-01")
        self.assertEqual(res["verdict"], "CONFIRMED")

    def test_false_alarm_rejection(self):
        # Candidate with cloud shadow should be rejected at step 2
        cand_id = "TEST-REJ-001"
        geo = {"type": "Polygon", "coordinates": [[[72.7, 21.4], [72.8, 21.4], [72.8, 21.5], [72.7, 21.5], [72.7, 21.4]]]}
        evidence = {
            "cloud_pct": 2.0,
            "scl_cloud_fraction": 0.02,
            "scl_shadow_fraction": 0.25,  # Exceeds 0.12 threshold
            "registration_residual_px": 0.20
        }
        res = false_alarm_filter.evaluate_candidate(cand_id, geo, evidence)
        self.assertFalse(res["passed"])
        self.assertEqual(res["rejection_reason"], "SCL_SHADOW_CONTAMINATION")

    def test_audit_ledger_integrity(self):
        audit_ledger.log_event("TEST_UNIT_ACTION", {"status": "ok"})
        valid, error_seq = audit_ledger.verify_chain()
        self.assertTrue(valid)
        self.assertIsNone(error_seq)

    def test_api_endpoints(self):
        # Health
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertTrue(data["audit_chain_valid"])

        # Candidates
        res = self.client.get("/api/candidates")
        self.assertEqual(res.status_code, 200)
        cands = res.json()
        self.assertGreaterEqual(len(cands), 6)

        # Single Candidate
        res = self.client.get("/api/candidates/CAND-2026-001")
        self.assertEqual(res.status_code, 200)
        c = res.json()
        self.assertEqual(c["id"], "CAND-2026-001")
        self.assertIn("confidence", c)

        # Search Text
        res = self.client.post("/api/search/text", json={"query": "industrial wharf near river", "top_k": 5})
        self.assertEqual(res.status_code, 200)
        s_data = res.json()
        self.assertIn("results", s_data)
        self.assertGreater(len(s_data["results"]), 0)

        # Review submission
        res = self.client.post("/api/review", json={
            "candidate_id": "CAND-2026-001",
            "analyst": "Officer-7",
            "verdict": "CONFIRMED",
            "comment": "Air-gap verification confirmed via Sentinel-1 SAR backscatter."
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["verdict"], "CONFIRMED")

        # Audit verify
        res = self.client.post("/api/audit/verify")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["chain_intact"])


if __name__ == "__main__":
    unittest.main()
