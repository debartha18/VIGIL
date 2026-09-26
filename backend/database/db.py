"""
KSHITIJ / ORBITAL INTEL Database Core (SQLite + Spatial Bounding Queries)
"""
import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.config import DB_PATH


class DatabaseManager:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Scenes (STAC compliant metadata)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS scenes (
                id TEXT PRIMARY KEY,
                sensor TEXT NOT NULL,
                acquired_at TEXT NOT NULL,
                resolution_m REAL NOT NULL,
                cloud_pct REAL NOT NULL,
                min_lon REAL NOT NULL,
                min_lat REAL NOT NULL,
                max_lon REAL NOT NULL,
                max_lat REAL NOT NULL,
                crs TEXT NOT NULL,
                format TEXT NOT NULL,
                sha256 TEXT NOT NULL,
                processing_status TEXT NOT NULL,
                ingested_at TEXT NOT NULL,
                stac_item_json TEXT
            )
            """)

            # Tiles (Multi-scale overlapping chips)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS tiles (
                id TEXT PRIMARY KEY,
                scene_id TEXT NOT NULL,
                min_lon REAL NOT NULL,
                min_lat REAL NOT NULL,
                max_lon REAL NOT NULL,
                max_lat REAL NOT NULL,
                acquired_at TEXT NOT NULL,
                embedding_id INTEGER NOT NULL,
                cloud_mask REAL NOT NULL,
                shadow_mask REAL NOT NULL,
                snow_mask REAL NOT NULL,
                valid_mask REAL NOT NULL,
                FOREIGN KEY(scene_id) REFERENCES scenes(id)
            )
            """)

            # Candidates (Detected Multi-temporal Changes)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS candidates (
                id TEXT PRIMARY KEY,
                geometry_json TEXT NOT NULL,
                area_m2 REAL NOT NULL,
                change_type TEXT NOT NULL,
                classified_by TEXT NOT NULL,
                first_evidence_scene_id TEXT NOT NULL,
                first_evidence_at TEXT NOT NULL,
                confirmed_at_scene_id TEXT,
                observations_json TEXT NOT NULL,
                confidence_json TEXT NOT NULL,
                verdict TEXT NOT NULL,
                query_id TEXT,
                nearest_river_m REAL,
                processing_log_json TEXT NOT NULL
            )
            """)

            # Rejected Candidates (Suppressed False Alarms with Stored Reasons)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS rejected_candidates (
                id TEXT PRIMARY KEY,
                geometry_json TEXT NOT NULL,
                reason TEXT NOT NULL,
                evidence_json TEXT NOT NULL
            )
            """)

            # Review Decisions (Analyst Decisions with Notes)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_decisions (
                id TEXT PRIMARY KEY,
                candidate_id TEXT NOT NULL,
                analyst TEXT NOT NULL,
                verdict TEXT NOT NULL,
                comment TEXT NOT NULL,
                evidence_version TEXT NOT NULL,
                at TEXT NOT NULL,
                FOREIGN KEY(candidate_id) REFERENCES candidates(id)
            )
            """)

            # Audit Trail (Append-Only Hash-Chained Ledger)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_trail (
                seq INTEGER PRIMARY KEY AUTOINCREMENT,
                at TEXT NOT NULL,
                type TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                prev_hash TEXT NOT NULL,
                hash TEXT NOT NULL
            )
            """)

            conn.commit()


db_manager = DatabaseManager()
