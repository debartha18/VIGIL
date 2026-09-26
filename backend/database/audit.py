"""
KSHITIJ / ORBITAL INTEL Tamper-Evident Append-Only Hash-Chained Audit Ledger
"""
import hashlib
import json
from datetime import datetime
from typing import Dict, Any, List
from backend.database.db import db_manager


def record_audit_event(event_type: str, payload: Any, user: str = "Analyst // DGIS") -> Dict[str, Any]:
    """
    Appends an immutable event to the hash-chained audit ledger.
    hash = sha256(f"{seq}:{at}:{type}:{payload_json}:{prev_hash}")
    """
    enriched_payload = {
        "user": user,
        "data": payload
    }
    payload_json = json.dumps(enriched_payload, sort_keys=True)
    now = datetime.utcnow().isoformat() + "Z"

    with db_manager.get_connection() as conn:
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
            "payload": enriched_payload,
            "prevHash": prev_hash,
            "hash": event_hash
        }


def get_all_audit_events() -> List[Dict[str, Any]]:
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT seq, at, type, payload_json, prev_hash, hash FROM audit_trail ORDER BY seq DESC")
        rows = cursor.fetchall()
        return [
            {
                "seq": r["seq"],
                "at": r["at"],
                "type": r["type"],
                "payload": json.loads(r["payload_json"]),
                "prevHash": r["prev_hash"],
                "hash": r["hash"]
            }
            for r in rows
        ]


def verify_chain() -> Dict[str, Any]:
    """
    Cryptographically verifies the SHA-256 chain from genesis block to current head.
    Detects any altered row, missing sequence, or broken hash link.
    """
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT seq, at, type, payload_json, prev_hash, hash FROM audit_trail ORDER BY seq ASC")
        rows = cursor.fetchall()

        if not rows:
            return {"valid": True, "count": 0, "message": "Audit chain empty, initialized."}

        expected_prev = "0" * 64
        for r in rows:
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


class AuditLedger:
    def log_event(self, event_type: str, payload: Any, user: str = "Analyst // DGIS") -> Dict[str, Any]:
        return record_audit_event(event_type, payload, user)

    def get_recent_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        events = get_all_audit_events()
        return events[:limit]

    def verify_chain(self):
        res = verify_chain()
        return res["valid"], res.get("errorIndex", None)


audit_ledger = AuditLedger()

