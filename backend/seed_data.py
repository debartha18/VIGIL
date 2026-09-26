"""
Database & Vector Index Seeder for KSHITIJ / ORBITAL INTEL
Populates SQLite with STAC scenes, tiles, hero change candidates, rejected false alarms, and audit records.
Builds and saves the FAISS index with 512-dim RemoteCLIP embeddings.
"""
import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import json
import uuid
import numpy as np
from datetime import datetime
from shapely.geometry import Polygon, mapping

from backend.config import DB_PATH, INDEX_PATH, EMBEDDING_DIM
from backend.database.db import db_manager
from backend.database.audit import audit_ledger
from backend.embeddings.clip_engine import clip_engine
from backend.index.vector_store import vector_store


def seed_database():
    print("[Seeder] Resetting database tables...")
    # Re-initialize tables
    db_manager.init_db()

    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tiles")
        cursor.execute("DELETE FROM scenes")
        cursor.execute("DELETE FROM candidates")
        cursor.execute("DELETE FROM rejected_candidates")
        cursor.execute("DELETE FROM review_decisions")
        cursor.execute("DELETE FROM audit_trail")
        conn.commit()

    print("[Seeder] Generating 24 Multi-Temporal Scenes...")
    # Scenes covering Tapi/Hazira coast (lon 72.65 to 72.90, lat 21.35 to 21.60)
    sensors = ["Sentinel-2 L2A", "Sentinel-1 SAR", "Landsat-8 OLI"]
    dates = [
        "2023-01-15", "2023-03-22", "2023-05-18", "2023-08-12", "2023-11-04",
        "2024-01-10", "2024-02-18", "2024-04-25", "2024-06-12", "2024-08-19",
        "2024-10-30", "2024-12-14", "2025-01-20", "2025-02-28", "2025-03-15",
        "2025-04-10", "2025-04-28", "2025-05-02", "2025-05-18", "2025-06-04",
        "2025-06-22", "2025-07-08", "2025-07-29", "2025-08-14"
    ]

    scenes_data = []
    for i, date_str in enumerate(dates):
        sensor = sensors[i % len(sensors)]
        scene_id = f"S2A_MSIL2A_{date_str.replace('-', '')}_{i+1:03d}"
        cloud_pct = 2.4 if "08" in date_str or "07" in date_str else 0.8
        sha256_mock = f"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85{i:02x}"
        
        scenes_data.append((
            scene_id,
            sensor,
            date_str,
            10.0 if "Sentinel" in sensor else 30.0,
            cloud_pct,
            72.6500, 21.3500, 72.9000, 21.6000,
            "EPSG:32644",
            "COG",
            sha256_mock,
            "INGESTED_INDEXED",
            f"{date_str}T06:15:00Z",
            json.dumps({"stac_version": "1.0.0", "id": scene_id, "bbox": [72.65, 21.35, 72.90, 21.60]})
        ))

    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.executemany("""
        INSERT INTO scenes (id, sensor, acquired_at, resolution_m, cloud_pct, min_lon, min_lat, max_lon, max_lat, crs, format, sha256, processing_status, ingested_at, stac_item_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, scenes_data)
        conn.commit()

    print("[Seeder] Generating Multi-Scale Overlapping Tiles & Vector Embeddings...")
    # Create grid of tiles for the scenes
    tiles_data = []
    vector_list = []
    id_list = []
    tile_counter = 0

    concept_tags = [
        "industrial wharf port construction riverside",
        "dredged water channel boundary estuary",
        "mangrove forest vegetation clearance earthworks",
        "highway bridge road expansion pier corridor",
        "container storage terminal yard builtup",
        "riprap shoreline embankment protection river",
        "agricultural fields green vegetation riverbank",
        "shallow coastal waters tidal sandbar mudflat"
    ]

    for scene in scenes_data[:8]: # Generate tile grid for key temporal scenes
        scene_id = scene[0]
        acquired_at = scene[2]
        
        # 4x4 spatial grid
        lons = np.linspace(72.68, 72.88, 5)
        lats = np.linspace(21.38, 21.58, 5)

        for gx in range(4):
            for gy in range(4):
                tile_counter += 1
                tile_id = f"TILE-{scene_id[-6:]}-{gx:02d}{gy:02d}"
                min_lon, max_lon = lons[gx], lons[gx + 1]
                min_lat, max_lat = lats[gy], lats[gy + 1]

                tag = concept_tags[(gx * 2 + gy) % len(concept_tags)]
                vec = clip_engine.encode_text(tag)
                # Add slight random perturbation for uniqueness
                vec += np.random.normal(0, 0.03, EMBEDDING_DIM).astype(np.float32)
                vec /= np.linalg.norm(vec)

                vector_list.append(vec)
                id_list.append(tile_id)

                tiles_data.append((
                    tile_id,
                    scene_id,
                    round(min_lon, 4), round(min_lat, 4), round(max_lon, 4), round(max_lat, 4),
                    acquired_at,
                    tile_counter,
                    0.02, # cloud mask
                    0.01, # shadow mask
                    0.0,  # snow mask
                    0.97  # valid mask
                ))

    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.executemany("""
        INSERT INTO tiles (id, scene_id, min_lon, min_lat, max_lon, max_lat, acquired_at, embedding_id, cloud_mask, shadow_mask, snow_mask, valid_mask)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, tiles_data)
        conn.commit()

    # Build FAISS index
    print(f"[Seeder] Adding {len(vector_list)} vectors to FAISS index...")
    vector_store.index = None
    vector_store.id_map = []
    vector_store.add(np.array(vector_list, dtype=np.float32), id_list)

    print("[Seeder] Seeding 6 Hero Change Candidates...")
    candidates = [
        {
            "id": "CAND-2026-001",
            "name": "Tapi Industrial Wharf & Jetty Extension",
            "change_type": "NEW_CONSTRUCTION",
            "classified_by": "FC-Siam-diff+SpectralRules",
            "area_m2": 42500.0,
            "min_lon": 72.7780, "min_lat": 21.4550, "max_lon": 72.7840, "max_lat": 21.4620,
            "first_evidence_scene_id": "S2A_MSIL2A_20230812_004",
            "first_evidence_at": "2023-08-12",
            "confirmed_at_scene_id": "S2A_MSIL2A_20250428_017",
            "nearest_river_m": 45.0,
            "confidence": {
                "composite_score": 0.89,
                "breakdown": {
                    "semanticRelevance": 0.94,
                    "temporalPersistence": 0.96,
                    "registrationQuality": 0.92,
                    "observationCleanliness": 0.90,
                    "changeMagnitude": 0.85
                }
            },
            "verdict": "CONFIRMED",
            "query_id": "QRY-TEXT-001",
            "observations": [
                {"date": "2023-08-12", "sensor": "Sentinel-2 L2A", "status": "Baseline - Undeveloped Estuary", "clean": True},
                {"date": "2024-02-18", "sensor": "Sentinel-2 L2A", "status": "Ground Excavation & Pile Foundation", "clean": True},
                {"date": "2024-08-19", "sensor": "Sentinel-1 SAR", "status": "High Radar Backscatter - Concrete Deck Emergence", "clean": True},
                {"date": "2025-04-28", "sensor": "Sentinel-2 L2A", "status": "Finished 380m Wharf Structure with Crane Rails", "clean": True}
            ],
            "processing_log": [
                "2025-05-01: Detected via bi-temporal differencing against 2023-08-12 baseline",
                "2025-05-01: Phase correlation check: dx=0.14px, dy=-0.08px, residual=0.16px (PASS)",
                "2025-05-01: Temporal persistence verified across 4 cloud-free acquisitions",
                "2025-05-01: Geometric mean confidence 0.89 exceeds abstain threshold 0.65 (PASS)"
            ]
        },
        {
            "id": "CAND-2026-002",
            "name": "South Estuary Dredged Channel & Embankment",
            "change_type": "WATER_BOUNDARY",
            "classified_by": "SpectralIndices-NDWI",
            "area_m2": 68200.0,
            "min_lon": 72.7620, "min_lat": 21.4300, "max_lon": 72.7680, "max_lat": 21.4350,
            "first_evidence_scene_id": "S2A_MSIL2A_20231104_005",
            "first_evidence_at": "2023-11-04",
            "confirmed_at_scene_id": "S2A_MSIL2A_20250315_015",
            "nearest_river_m": 0.0,
            "confidence": {
                "composite_score": 0.91,
                "breakdown": {
                    "semanticRelevance": 0.92,
                    "temporalPersistence": 0.98,
                    "registrationQuality": 0.95,
                    "observationCleanliness": 0.92,
                    "changeMagnitude": 0.88
                }
            },
            "verdict": "CONFIRMED",
            "query_id": "QRY-TEXT-002",
            "observations": [
                {"date": "2023-08-12", "sensor": "Sentinel-2 L2A", "status": "Intertidal Silt Bank", "clean": True},
                {"date": "2024-04-25", "sensor": "Sentinel-2 L2A", "status": "Active Dredging Plume & Channel Deepening", "clean": True},
                {"date": "2025-03-15", "sensor": "Sentinel-2 L2A", "status": "Engineered Riprap Embankment Stabilized", "clean": True}
            ],
            "processing_log": [
                "2025-04-12: Spectral NDWI delta +0.34 confirmed",
                "2025-04-12: Sub-pixel residual 0.22px (PASS)",
                "2025-04-12: Verified non-tidal structural permanent channel"
            ]
        },
        {
            "id": "CAND-2026-003",
            "name": "Coastal Mangrove Clearance & Earthworks",
            "change_type": "LAND_CLEARANCE",
            "classified_by": "SpectralIndices-NDVI",
            "area_m2": 51400.0,
            "min_lon": 72.7910, "min_lat": 21.4680, "max_lon": 72.7980, "max_lat": 21.4740,
            "first_evidence_scene_id": "S2A_MSIL2A_20240110_006",
            "first_evidence_at": "2024-01-10",
            "confirmed_at_scene_id": "S2A_MSIL2A_20250428_017",
            "nearest_river_m": 320.0,
            "confidence": {
                "composite_score": 0.84,
                "breakdown": {
                    "semanticRelevance": 0.86,
                    "temporalPersistence": 0.91,
                    "registrationQuality": 0.89,
                    "observationCleanliness": 0.88,
                    "changeMagnitude": 0.82
                }
            },
            "verdict": "CONFIRMED",
            "query_id": "QRY-TEXT-003",
            "observations": [
                {"date": "2023-08-12", "sensor": "Sentinel-2 L2A", "status": "Dense Riparian Mangrove Canopy", "clean": True},
                {"date": "2024-06-12", "sensor": "Sentinel-2 L2A", "status": "Clearance Boundary Delineation", "clean": True},
                {"date": "2025-04-28", "sensor": "Sentinel-2 L2A", "status": "Compacted Soil Fill & Levelling", "clean": True}
            ],
            "processing_log": [
                "2025-05-02: NDVI drop from +0.68 to +0.12 (delta -0.56)",
                "2025-05-02: Confirmed non-seasonal deforestation"
            ]
        },
        {
            "id": "CAND-2026-004",
            "name": "NH-48 Coastal Spur Bridge Pier Piling",
            "change_type": "ROAD_EXPANSION",
            "classified_by": "MorphologicalLinear+NDBI",
            "area_m2": 31800.0,
            "min_lon": 72.7480, "min_lat": 21.4420, "max_lon": 72.7550, "max_lat": 21.4480,
            "first_evidence_scene_id": "S2A_MSIL2A_20240218_007",
            "first_evidence_at": "2024-02-18",
            "confirmed_at_scene_id": "S2A_MSIL2A_20250428_017",
            "nearest_river_m": 80.0,
            "confidence": {
                "composite_score": 0.88,
                "breakdown": {
                    "semanticRelevance": 0.91,
                    "temporalPersistence": 0.94,
                    "registrationQuality": 0.91,
                    "observationCleanliness": 0.89,
                    "changeMagnitude": 0.84
                }
            },
            "verdict": "CONFIRMED",
            "query_id": "QRY-TEXT-004",
            "observations": [
                {"date": "2023-08-12", "sensor": "Sentinel-2 L2A", "status": "Water Surface / Inundated Channel", "clean": True},
                {"date": "2024-08-19", "sensor": "Sentinel-1 SAR", "status": "Linear High-Reflectance Piling Array", "clean": True},
                {"date": "2025-04-28", "sensor": "Sentinel-2 L2A", "status": "Bridge Superstructure Spanning River", "clean": True}
            ],
            "processing_log": [
                "2025-05-03: Linear corridor aspect ratio 4.2",
                "2025-05-03: Temporal multi-sensor correlation verified"
            ]
        },
        {
            "id": "CAND-2026-005",
            "name": "Hazira Port Container Storage Yard Alpha",
            "change_type": "NEW_CONSTRUCTION",
            "classified_by": "FC-Siam-diff+RemoteCLIP",
            "area_m2": 84000.0,
            "min_lon": 72.7700, "min_lat": 21.4790, "max_lon": 72.7780, "max_lat": 21.4850,
            "first_evidence_scene_id": "S2A_MSIL2A_20230518_003",
            "first_evidence_at": "2023-05-18",
            "confirmed_at_scene_id": "S2A_MSIL2A_20250410_016",
            "nearest_river_m": 650.0,
            "confidence": {
                "composite_score": 0.93,
                "breakdown": {
                    "semanticRelevance": 0.95,
                    "temporalPersistence": 0.99,
                    "registrationQuality": 0.96,
                    "observationCleanliness": 0.94,
                    "changeMagnitude": 0.90
                }
            },
            "verdict": "CONFIRMED",
            "query_id": "QRY-TEXT-005",
            "observations": [
                {"date": "2023-01-15", "sensor": "Sentinel-2 L2A", "status": "Open Barren Coastal Soil", "clean": True},
                {"date": "2024-01-10", "sensor": "Sentinel-2 L2A", "status": "Paving & Heavy Asphalt Laydown", "clean": True},
                {"date": "2025-04-10", "sensor": "Sentinel-2 L2A", "status": "Operational Stacked Container Matrix", "clean": True}
            ],
            "processing_log": [
                "2025-04-15: Continuous multi-scene expansion tracking",
                "2025-04-15: RemoteCLIP concept alignment: 0.95"
            ]
        },
        {
            "id": "CAND-2026-006",
            "name": "Riverbank Shoreline Protection & Gabion Riprap",
            "change_type": "WATER_BOUNDARY",
            "classified_by": "SpectralIndices-NDWI+NDBI",
            "area_m2": 22100.0,
            "min_lon": 72.7650, "min_lat": 21.4610, "max_lon": 72.7710, "max_lat": 21.4670,
            "first_evidence_scene_id": "S2A_MSIL2A_20240425_008",
            "first_evidence_at": "2024-04-25",
            "confirmed_at_scene_id": "S2A_MSIL2A_20250428_017",
            "nearest_river_m": 12.0,
            "confidence": {
                "composite_score": 0.86,
                "breakdown": {
                    "semanticRelevance": 0.88,
                    "temporalPersistence": 0.92,
                    "registrationQuality": 0.91,
                    "observationCleanliness": 0.87,
                    "changeMagnitude": 0.81
                }
            },
            "verdict": "CONFIRMED",
            "query_id": "QRY-TEXT-006",
            "observations": [
                {"date": "2023-08-12", "sensor": "Sentinel-2 L2A", "status": "Eroding Riverbank Edge", "clean": True},
                {"date": "2024-04-25", "sensor": "Sentinel-2 L2A", "status": "Embankment Reinforcement & Rock Armor", "clean": True},
                {"date": "2025-04-28", "sensor": "Sentinel-2 L2A", "status": "Stabilized Shoreline Profile", "clean": True}
            ],
            "processing_log": [
                "2025-05-01: Shoreline erosion mitigation verified"
            ]
        }
    ]

    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        for cand in candidates:
            poly = Polygon([
                (cand["min_lon"], cand["min_lat"]),
                (cand["max_lon"], cand["min_lat"]),
                (cand["max_lon"], cand["max_lat"]),
                (cand["min_lon"], cand["max_lat"]),
                (cand["min_lon"], cand["min_lat"])
            ])
            cursor.execute("""
            INSERT INTO candidates (id, geometry_json, area_m2, change_type, classified_by, first_evidence_scene_id, first_evidence_at, confirmed_at_scene_id, observations_json, confidence_json, verdict, query_id, nearest_river_m, processing_log_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cand["id"],
                json.dumps(mapping(poly)),
                cand["area_m2"],
                cand["change_type"],
                cand["classified_by"],
                cand["first_evidence_scene_id"],
                cand["first_evidence_at"],
                cand["confirmed_at_scene_id"],
                json.dumps(cand["observations"]),
                json.dumps(cand["confidence"]),
                cand["verdict"],
                cand["query_id"],
                cand["nearest_river_m"],
                json.dumps(cand["processing_log"])
            ))
        conn.commit()

    print("[Seeder] Seeding 4 Rejected False Alarms...")
    rejected = [
        {
            "id": "REJ-2026-001",
            "reason": "SCL_SHADOW_CONTAMINATION",
            "evidence": {
                "cloud_pct": 18.4,
                "scl_shadow_fraction": 0.22,
                "note": "Cumulus cloud shadow over tidal flat simulating dark water shift",
                "detected_at": "2024-07-15"
            },
            "bounds": [72.72, 21.41, 72.74, 21.43]
        },
        {
            "id": "REJ-2026-002",
            "reason": "AGRICULTURAL_PHENOLOGY",
            "evidence": {
                "seasonal_cycle": "Kharif post-harvest bare soil",
                "ndvi_t1": 0.72,
                "ndvi_t2": 0.18,
                "ndvi_t3": 0.69,
                "note": "Cyclical crop harvesting without structural permanence",
                "detected_at": "2024-11-20"
            },
            "bounds": [72.84, 21.52, 72.86, 21.54]
        },
        {
            "id": "REJ-2026-003",
            "reason": "MISREGISTRATION_PARALLAX",
            "evidence": {
                "registration_residual_px": 1.45,
                "threshold_px": 0.80,
                "note": "Sub-pixel phase correlation failed on high relief edge",
                "detected_at": "2025-02-10"
            },
            "bounds": [72.79, 21.39, 72.81, 21.41]
        },
        {
            "id": "REJ-2026-004",
            "reason": "TIDAL_FLUCTUATION",
            "evidence": {
                "spring_tide_inundation": True,
                "delta_water_m2": 34000.0,
                "note": "Intertidal mudflat spring high tide excursion, zero structural backscatter",
                "detected_at": "2025-04-18"
            },
            "bounds": [72.69, 21.44, 72.71, 21.46]
        }
    ]

    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        for rej in rejected:
            b = rej["bounds"]
            poly = Polygon([(b[0], b[1]), (b[2], b[1]), (b[2], b[3]), (b[0], b[3]), (b[0], b[1])])
            cursor.execute("""
            INSERT INTO rejected_candidates (id, geometry_json, reason, evidence_json)
            VALUES (?, ?, ?, ?)
            """, (
                rej["id"],
                json.dumps(mapping(poly)),
                rej["reason"],
                json.dumps(rej["evidence"])
            ))
        conn.commit()

    print("[Seeder] Initializing Cryptographic Audit Ledger...")
    audit_ledger.log_event("SYSTEM_BOOTSTRAP", {
        "dataset": "Tapi-Hazira Estuary AOI-1",
        "scenes_ingested": len(scenes_data),
        "tiles_indexed": len(tiles_data),
        "candidates_seeded": len(candidates),
        "false_alarms_seeded": len(rejected),
        "crs": "EPSG:32644"
    })
    audit_ledger.log_event("FAISS_INDEX_BUILT", {
        "index_type": "IndexFlatIP",
        "total_vectors": len(vector_list),
        "dim": EMBEDDING_DIM
    })

    # Verify audit integrity
    valid, _ = audit_ledger.verify_chain()
    print(f"[Seeder] Database & Index Seeding Complete! Audit Chain Valid: {valid}")


if __name__ == "__main__":
    seed_database()
