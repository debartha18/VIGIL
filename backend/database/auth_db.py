"""
KSHITIJ / VIGIL OIT Authentication & User Database Management
Implements secure salted PBKDF2-HMAC-SHA256 password hashing and role-based models.
"""
import os
import hashlib
import secrets
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.database.db import db_manager


def hash_password(password: str, salt: str) -> str:
    """Computes 100,000-iteration PBKDF2-HMAC-SHA256 hash."""
    return hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    """Timing-attack-safe password comparison."""
    computed_hash = hash_password(password, salt)
    return secrets.compare_digest(computed_hash, expected_hash)


def init_auth_tables():
    """Initializes the users table and seeds initial OIT credentials."""
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            oit_user_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'oit_user',
            organization TEXT NOT NULL DEFAULT 'Directorate General of Information Systems (DGIS)',
            call_sign TEXT DEFAULT 'IMINT-01',
            clearance TEXT DEFAULT 'SECRET // NOFORN',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            last_login TEXT
        )
        """)

        # Check if users already seeded
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] == 0:
            now = datetime.utcnow().isoformat() + "Z"

            seed_users = [
                {
                    "id": "usr-admin-001",
                    "oit_user_id": "OIT-ADMIN-001",
                    "name": "Commander R. Sharma",
                    "email": "admin.oit@dgis.mod.gov.in",
                    "password": "Vigil@Admin2026!",
                    "role": "oit_admin",
                    "organization": "DGIS Headquarters // Space & Cyber Directorate",
                    "call_sign": "DGIS-COMMAND-01",
                    "clearance": "TOP SECRET // DEFENCE ONLY",
                },
                {
                    "id": "usr-analyst-804",
                    "oit_user_id": "OIT-IMINT-804",
                    "name": "Debarghya",
                    "email": "debarghya.imint@dgis.mod.gov.in",
                    "password": "Vigil@Oit2026!",
                    "role": "oit_user",
                    "organization": "Directorate General of Information Systems (DGIS)",
                    "call_sign": "DGIS-IMINT-01",
                    "clearance": "SECRET // NOFORN",
                },
                {
                    "id": "usr-analyst-2026",
                    "oit_user_id": "OIT-USER-2026",
                    "name": "Analyst A. Verma",
                    "email": "analyst.verma@dgis.mod.gov.in",
                    "password": "Vigil@2026!",
                    "role": "oit_user",
                    "organization": "DGIS Satellite Data Processing Division",
                    "call_sign": "IMINT-ANALYST-02",
                    "clearance": "SECRET // RESTRICTED",
                }
            ]

            for u in seed_users:
                salt = secrets.token_hex(16)
                p_hash = hash_password(u["password"], salt)
                cursor.execute("""
                INSERT INTO users (id, oit_user_id, name, email, password_hash, salt, role, organization, call_sign, clearance, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                """, (
                    u["id"],
                    u["oit_user_id"],
                    u["name"],
                    u["email"],
                    p_hash,
                    salt,
                    u["role"],
                    u["organization"],
                    u["call_sign"],
                    u["clearance"],
                    now
                ))

        conn.commit()


def get_user_by_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    """Retrieves user by OIT User ID or Email."""
    identifier_clean = identifier.strip().lower()
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM users
        WHERE LOWER(oit_user_id) = ? OR LOWER(email) = ?
        LIMIT 1
        """, (identifier_clean, identifier_clean))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves user by internal ID."""
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ? LIMIT 1", (user_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def update_last_login(user_id: str):
    """Updates last_login timestamp for the user."""
    now = datetime.utcnow().isoformat() + "Z"
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_id))
        conn.commit()


def update_user_password(user_id: str, new_password: str) -> bool:
    """Updates password with a freshly generated cryptographic salt."""
    salt = secrets.token_hex(16)
    p_hash = hash_password(new_password, salt)
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?", (p_hash, salt, user_id))
        conn.commit()
        return True


def list_users() -> List[Dict[str, Any]]:
    """Returns safe user records (excluding password_hash and salt)."""
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT id, oit_user_id, name, email, role, organization, call_sign, clearance, is_active, created_at, last_login
        FROM users
        ORDER BY created_at ASC
        """)
        return [dict(r) for r in cursor.fetchall()]


def set_user_active_state(user_id: str, is_active: bool) -> bool:
    """Activates or deactivates an OIT user account."""
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (1 if is_active else 0, user_id))
        conn.commit()
        return True


# Run initialization on import
try:
    init_auth_tables()
except Exception as e:
    print(f"[AuthDB] Table init deferred: {e}")
