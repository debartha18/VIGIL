"""
KSHITIJ Local SQLite Database & Append-Only Hash-Chained Audit Ledger
"""
import sqlite3
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

DB_PATH = Path(__file__).parent / "kshitij.db"


class Database:
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

            # Scenes
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
                ingested_at TEXT NOT NULL
            )
            """)

            # Tiles
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

            # Candidates
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

            # Rejected Candidates
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS rejected_candidates (
                id TEXT PRIMARY KEY,
                geometry_json TEXT NOT NULL,
                reason TEXT NOT NULL,
                evidence_json TEXT NOT NULL
            )
            """)

            # Review Decisions
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

            # Audit Trail (Append-only, SHA-256 hash-chained)
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

    def record_audit_event(self, event_type: str, payload: Any) -> Dict[str, Any]:
        """
        Appends an event to the hash-chained audit ledger.
        hash = sha256(seq + at + type + payload_json + prev_hash)
        """
        payload_json = json.dumps(payload, sort_keys=True)
        now = datetime.utcnow().isoformat() + "Z"

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT seq, hash FROM audit_trail ORDER BY seq DESC LIMIT 1")
            last_row = cursor.fetchone()

            if last_row:
                seq = last_row["seq"] + 1
                prev_hash = last_row["hash"]
            else:
                seq = 1
                prev_hash = "0" * 64

            to_hash = f"{seq}:{now}:{event_type}:{payload_json}:{prev_hash}"
            event_hash = hashlib.sha256(to_hash.encode("utf-8")).hexdigest()

            cursor.execute("""
            INSERT INTO audit_trail (seq, at, type, payload_json, prev_hash, hash)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (seq, now, event_type, payload_json, prev_hash, event_hash))
            conn.commit()

            return {
                "seq": seq,
                "at": now,
                "type": event_type,
                "payload": payload,
                "prevHash": prev_hash,
                "hash": event_hash
            }

    def verify_audit_chain(self) -> Dict[str, Any]:
        """
        Cryptographically verifies the integrity of the audit chain from genesis to head.
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT seq, at, type, payload_json, prev_hash, hash FROM audit_trail ORDER BY seq ASC")
            rows = cursor.fetchall()

            if not rows:
                return {"valid": True, "count": 0, "message": "Audit chain empty, initialized."}

            expected_prev = "0" * 64
            for idx, r in enumerate(rows):
                if r["prev_hash"] != expected_prev:
                    return {
                        "valid": False,
                        "count": len(rows),
                        "errorIndex": r["seq"],
                        "message": f"Hash link broken at seq #{r['seq']}. Expected prev_hash {expected_prev}, got {r['prev_hash']}."
                    }

                to_hash = f"{r['seq']}:{r['at']}:{r['type']}:{r['payload_json']}:{r['prev_hash']}"
                computed_hash = hashlib.sha256(to_hash.encode("utf-8")).hexdigest()

                if computed_hash != r["hash"]:
                    return {
                        "valid": False,
                        "count": len(rows),
                        "errorIndex": r["seq"],
                        "message": f"Tampering detected at seq #{r['seq']}. Hash mismatch."
                    }

                expected_prev = r["hash"]

            return {
                "valid": True,
                "count": len(rows),
                "message": f"All {len(rows)} events cryptographically verified. Zero tampering detected."
            }


db = Database()
