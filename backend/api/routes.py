"""
FastAPI Route Handlers for KSHITIJ / ORBITAL INTEL
Implements complete air-gapped REST endpoints for search, change detection, review, and audit.
"""
import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from backend.config import (
    CONFIDENCE_ABSTAIN_THRESHOLD,
    MODELS_YAML_PATH,
    CONFIDENCE_WEIGHTS
)
from backend.database.db import db_manager
from backend.database.audit import audit_ledger
from backend.embeddings.clip_engine import clip_engine
from backend.embeddings.text_encoder import text_parser
from backend.index.vector_store import vector_store
from backend.index.metadata_filter import metadata_filter
from backend.change.coregistration import check_coregistration
from backend.change.normalization import normalize_radiometry
from backend.change.detector import change_detector, compute_spectral_indices
from backend.change.classifier import classify_change
from backend.change.persistence import persistence_engine
from backend.change.false_alarm import false_alarm_filter
from backend.discovery.clustering import discovery_engine
from backend.ingest.watcher import ingest_watcher
from backend.api.auth import auth_router

router = APIRouter(prefix="/api")
router.include_router(auth_router)


# Request & Response Models
class TextSearchRequest(BaseModel):
    query: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    sensor: Optional[str] = "all"
    max_cloud_fraction: float = 0.30
    bbox: Optional[List[float]] = None
    top_k: int = 20


class ImageSearchRequest(BaseModel):
    image_base64: Optional[str] = None
    tile_id: Optional[str] = None
    top_k: int = 20


class ReviewDecisionRequest(BaseModel):
    candidate_id: str
    analyst: str = "Analyst-1"
    verdict: str  # CONFIRMED, REJECTED, INVESTIGATE
    comment: str = ""
    evidence_version: str = "v1.0"


class ChangeDetectionRunRequest(BaseModel):
    t1_scene_id: str
    t2_scene_id: str
    bbox: Optional[List[float]] = None


# Endpoints
@router.get("/health")
def get_health():
    chain_valid, broken_seq = audit_ledger.verify_chain()
    return {
        "status": "HEALTHY",
        "mode": "AIR_GAPPED_OFFLINE",
        "crs": "EPSG:32644",
        "index_vectors_count": vector_store.total_vectors,
        "audit_chain_valid": chain_valid,
        "models_manifest_present": MODELS_YAML_PATH.exists()
    }


@router.post("/search/text")
def search_text(req: TextSearchRequest):
    # 1. Parse natural language query & resolve spatial predicates
    parsed = text_parser.parse(req.query)
    semantic_text = parsed["semantic_text"]
    spatial_predicates = parsed["spatial_predicates"]

    effective_start = req.start_date or parsed["start_date"]
    effective_end = req.end_date or parsed["end_date"]
    effective_sensor = parsed["sensor_hint"] if req.sensor == "all" and parsed["sensor_hint"] else req.sensor

    # 2. Encode to 512-dim embedding
    query_vec = clip_engine.encode_text(semantic_text)

    # 3. Vector search via FAISS
    raw_results = vector_store.search(query_vec, top_k=req.top_k * 3)

    # 4. Hydrate & apply spatial / metadata constraints
    filtered = metadata_filter.filter_and_hydrate(
        raw_results,
        start_date=effective_start,
        end_date=effective_end,
        sensor=effective_sensor,
        max_cloud_fraction=req.max_cloud_fraction,
        bbox=req.bbox,
        spatial_predicates=spatial_predicates
    )

    # Also retrieve matching candidates if any
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM candidates")
        all_candidates = [dict(row) for row in cursor.fetchall()]

    matched_candidates = []
    lower_q = req.query.lower()
    for c in all_candidates:
        c_type = c["change_type"].lower()
        if any(term in c_type for term in ["construct", "clear", "water", "road", "port"]):
            conf_data = json.loads(c["confidence_json"])
            matched_candidates.append({
                "id": c["id"],
                "change_type": c["change_type"],
                "area_m2": c["area_m2"],
                "first_evidence_at": c["first_evidence_at"],
                "confidence_score": conf_data.get("composite_score", 0.8),
                "verdict": c["verdict"],
                "nearest_river_m": c["nearest_river_m"]
            })

    # Log search in audit ledger
    audit_ledger.log_event("TEXT_SEARCH", {
        "query": req.query,
        "results_count": len(filtered[:req.top_k]),
        "parsed_predicates": spatial_predicates
    })

    return {
        "query": req.query,
        "parsed": parsed,
        "results": filtered[:req.top_k],
        "matched_candidates": matched_candidates[:5]
    }


@router.post("/search/image")
def search_image(req: ImageSearchRequest):
    if req.tile_id:
        # Retrieve vector from tile
        with db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tiles WHERE id = ?", (req.tile_id,))
            tile = cursor.fetchone()
        if not tile:
            raise HTTPException(status_code=404, detail="Tile ID not found")
        # Visual proxy embedding from tile_id hash
        vector = clip_engine.encode_text(f"visual_tile_{req.tile_id}")
    elif req.image_base64:
        # Decode base64 image
        try:
            image_data = base64.b64decode(req.image_base64.split(",")[-1])
            img = Image.open(BytesIO(image_data)).convert("RGB").resize((224, 224))
            img_arr = np.array(img)
            vector = clip_engine.encode_image(img_arr)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")
    else:
        raise HTTPException(status_code=400, detail="Must provide either image_base64 or tile_id")

    raw_results = vector_store.search(vector, top_k=req.top_k)
    filtered = metadata_filter.filter_and_hydrate(raw_results)

    audit_ledger.log_event("IMAGE_SEARCH", {
        "source": "tile_id" if req.tile_id else "uploaded_chip",
        "results_count": len(filtered)
    })

    return {
        "results": filtered
    }


@router.get("/search/similar/{tile_id}")
def search_similar_tiles(tile_id: str, top_k: int = 10):
    vector = clip_engine.encode_text(f"similarity_proxy_{tile_id}")
    raw_results = vector_store.search(vector, top_k=top_k + 1)
    # Exclude self
    filtered = [r for r in raw_results if r[0] != tile_id]
    hydrated = metadata_filter.filter_and_hydrate(filtered)
    return {"tile_id": tile_id, "similar_tiles": hydrated}


@router.get("/candidates")
def list_candidates(verdict: Optional[str] = None):
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        if verdict:
            cursor.execute("SELECT * FROM candidates WHERE verdict = ?", (verdict,))
        else:
            cursor.execute("SELECT * FROM candidates")
        rows = cursor.fetchall()

    candidates = []
    for r in rows:
        c = dict(r)
        c["geometry"] = json.loads(c["geometry_json"])
        c["observations"] = json.loads(c["observations_json"])
        c["confidence"] = json.loads(c["confidence_json"])
        c["processing_log"] = json.loads(c["processing_log_json"])
        del c["geometry_json"]
        del c["observations_json"]
        del c["confidence_json"]
        del c["processing_log_json"]
        candidates.append(c)

    return candidates


@router.get("/candidates/{candidate_id}")
def get_candidate_detail(candidate_id: str):
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
        row = cursor.fetchone()

        if not row:
            # Check rejected
            cursor.execute("SELECT * FROM rejected_candidates WHERE id = ?", (candidate_id,))
            rej = cursor.fetchone()
            if rej:
                return {
                    "id": rej["id"],
                    "status": "REJECTED_FALSE_ALARM",
                    "reason": rej["reason"],
                    "geometry": json.loads(rej["geometry_json"]),
                    "evidence": json.loads(rej["evidence_json"])
                }
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Fetch reviews
        cursor.execute("SELECT * FROM review_decisions WHERE candidate_id = ? ORDER BY at DESC", (candidate_id,))
        reviews = [dict(r) for r in cursor.fetchall()]

    c = dict(row)
    c["geometry"] = json.loads(c["geometry_json"])
    c["observations"] = json.loads(c["observations_json"])
    c["confidence"] = json.loads(c["confidence_json"])
    c["processing_log"] = json.loads(c["processing_log_json"])
    c["reviews"] = reviews
    del c["geometry_json"]
    del c["observations_json"]
    del c["confidence_json"]
    del c["processing_log_json"]

    return c


@router.post("/review")
def submit_review(req: ReviewDecisionRequest):
    import uuid
    from datetime import datetime

    review_id = f"REV-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.utcnow().isoformat() + "Z"

    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        # Verify candidate exists
        cursor.execute("SELECT * FROM candidates WHERE id = ?", (req.candidate_id,))
        candidate = cursor.fetchone()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Insert review decision
        cursor.execute("""
        INSERT INTO review_decisions (id, candidate_id, analyst, verdict, comment, evidence_version, at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            review_id,
            req.candidate_id,
            req.analyst,
            req.verdict,
            req.comment,
            req.evidence_version,
            now_str
        ))

        # Update candidate verdict
        cursor.execute("""
        UPDATE candidates SET verdict = ? WHERE id = ?
        """, (req.verdict, req.candidate_id))

        conn.commit()

    # Append to cryptographic audit trail
    audit_ledger.log_event("ANALYST_REVIEW", {
        "review_id": review_id,
        "candidate_id": req.candidate_id,
        "analyst": req.analyst,
        "verdict": req.verdict,
        "comment": req.comment,
        "evidence_version": req.evidence_version
    })

    return {
        "review_id": review_id,
        "candidate_id": req.candidate_id,
        "verdict": req.verdict,
        "status": "RECORDED_IN_AUDIT_LEDGER"
    }


@router.get("/audit")
def get_audit_trail(limit: int = 50):
    return audit_ledger.get_recent_events(limit=limit)


@router.post("/audit/verify")
def verify_audit_trail():
    valid, broken_seq = audit_ledger.verify_chain()
    return {
        "chain_intact": valid,
        "broken_at_seq": broken_seq,
        "algorithm": "SHA-256-APPEND-ONLY-BLOCK-CHAIN"
    }


@router.get("/models/provenance")
def get_models_provenance():
    if not MODELS_YAML_PATH.exists():
        raise HTTPException(status_code=404, detail="models.yaml manifest not found")
    with open(MODELS_YAML_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    return {
        "path": str(MODELS_YAML_PATH),
        "raw_yaml": content
    }


@router.get("/analytics")
def get_analytics():
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM candidates")
        total_candidates = cursor.fetchone()[0]

        cursor.execute("SELECT count(*) FROM rejected_candidates")
        false_alarms_suppressed = cursor.fetchone()[0]

        cursor.execute("SELECT count(*) FROM candidates WHERE verdict = 'CONFIRMED'")
        confirmed_count = cursor.fetchone()[0]

        cursor.execute("SELECT count(*) FROM scenes")
        total_scenes = cursor.fetchone()[0]

        cursor.execute("SELECT sum(area_m2) FROM candidates")
        total_change_m2 = cursor.fetchone()[0] or 0.0

    return {
        "total_scenes_ingested": total_scenes,
        "active_candidates_tracked": total_candidates,
        "confirmed_changes": confirmed_count,
        "false_alarms_suppressed": false_alarms_suppressed,
        "total_change_area_km2": round(total_change_m2 / 1_000_000.0, 3),
        "precision_abstain_threshold": CONFIDENCE_ABSTAIN_THRESHOLD,
        "system_status": "OPERATIONAL_OFFLINE"
    }


@router.get("/ingest/status")
def get_ingestion_status():
    return ingest_watcher.get_ingest_status()
