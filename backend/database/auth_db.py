"""
VIGIL Public Authentication & User Database Management
Implements public registration, secure salted PBKDF2-HMAC-SHA256 password hashing,
and profile management for all users (public, researchers, administrators).
"""
import os
import hashlib
import secrets
import uuid
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
    """Initializes the users table and seeds initial accounts."""
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            organization TEXT DEFAULT '',
            country TEXT DEFAULT '',
            profile_image TEXT DEFAULT '',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_login TEXT
        )
        """)

        # Migration helper: ensure all required columns exist if upgrading from older schema
        cursor.execute("PRAGMA table_info(users)")
        existing_cols = [r["name"] for r in cursor.fetchall()]

        if "full_name" not in existing_cols and "name" in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT NOT NULL DEFAULT ''")
            cursor.execute("UPDATE users SET full_name = name WHERE full_name = ''")
        if "username" not in existing_cols and "oit_user_id" in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT ''")
            cursor.execute("UPDATE users SET username = oit_user_id WHERE username = ''")
        if "country" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN country TEXT DEFAULT ''")
        if "profile_image" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_image TEXT DEFAULT ''")
        if "updated_at" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT ''")
            cursor.execute("UPDATE users SET updated_at = created_at WHERE updated_at = ''")

        # Check if users already seeded
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] == 0:
            now = datetime.utcnow().isoformat() + "Z"

            seed_users = [
                {
                    "id": "usr-admin-001",
                    "full_name": "Commander R. Sharma",
                    "username": "admin_sharma",
                    "email": "admin@vigil.org",
                    "password": "Vigil@Admin2026!",
                    "role": "admin",
                    "organization": "Earth Observation Directorate // Space Systems",
                    "country": "India"
                },
                {
                    "id": "usr-user-002",
                    "full_name": "Debarghya",
                    "username": "debarghya",
                    "email": "debarghya@gmail.com",
                    "password": "Vigil@User2026!",
                    "role": "user",
                    "organization": "Geospatial Intelligence Research",
                    "country": "India"
                },
                {
                    "id": "usr-user-003",
                    "full_name": "Dr. Sarah Chen",
                    "username": "sarah_chen",
                    "email": "sarah.chen@planetary-science.org",
                    "password": "Vigil@Science2026!",
                    "role": "user",
                    "organization": "International Remote Sensing Institute",
                    "country": "United States"
                }
            ]

            for u in seed_users:
                salt = secrets.token_hex(16)
                p_hash = hash_password(u["password"], salt)
                cursor.execute("""
                INSERT INTO users (id, full_name, username, email, password_hash, salt, role, organization, country, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                """, (
                    u["id"],
                    u["full_name"],
                    u["username"],
                    u["email"],
                    p_hash,
                    salt,
                    u["role"],
                    u["organization"],
                    u["country"],
                    now,
                    now
                ))

        conn.commit()


def create_user(
    full_name: str,
    username: str,
    email: str,
    password: str,
    organization: str = "",
    country: str = ""
) -> Dict[str, Any]:
    """
    Registers a new public user with salted PBKDF2 hash.
    Role is always 'user' by default.
    Raises ValueError on duplicates or invalid inputs.
    """
    clean_username = username.strip().lower()
    clean_email = email.strip().lower()
    clean_name = full_name.strip()

    with db_manager.get_connection() as conn:
        cursor = conn.cursor()

        # Check existing email
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1", (clean_email,))
        if cursor.fetchone():
            raise ValueError("An account with this email address already exists.")

        # Check existing username
        cursor.execute("SELECT id FROM users WHERE LOWER(username) = ? LIMIT 1", (clean_username,))
        if cursor.fetchone():
            raise ValueError("This username is already taken. Please choose another username.")

        user_id = f"usr-{uuid.uuid4().hex[:12]}"
        salt = secrets.token_hex(16)
        password_hash = hash_password(password, salt)
        now = datetime.utcnow().isoformat() + "Z"

        cursor.execute("""
        INSERT INTO users (id, full_name, username, email, password_hash, salt, role, organization, country, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, 1, ?, ?)
        """, (
            user_id,
            clean_name,
            clean_username,
            clean_email,
            password_hash,
            salt,
            organization.strip(),
            country.strip(),
            now,
            now
        ))
        conn.commit()

        return {
            "id": user_id,
            "full_name": clean_name,
            "username": clean_username,
            "email": clean_email,
            "role": "user",
            "organization": organization.strip(),
            "country": country.strip(),
            "profile_image": "",
            "is_active": True,
            "created_at": now,
            "updated_at": now,
            "last_login": None
        }


def get_user_by_login_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    """Retrieves user by Email or Username (case-insensitive)."""
    clean = identifier.strip().lower()
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM users
        WHERE LOWER(email) = ? OR LOWER(username) = ?
        LIMIT 1
        """, (clean, clean))
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
    """Updates last_login timestamp."""
    now = datetime.utcnow().isoformat() + "Z"
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_id))
        conn.commit()


def update_user_password(user_id: str, new_password: str) -> bool:
    """Updates user password with fresh cryptographic salt."""
    salt = secrets.token_hex(16)
    p_hash = hash_password(new_password, salt)
    now = datetime.utcnow().isoformat() + "Z"
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE users
        SET password_hash = ?, salt = ?, updated_at = ?
        WHERE id = ?
        """, (p_hash, salt, now, user_id))
        conn.commit()
        return True


def update_user_profile(
    user_id: str,
    full_name: Optional[str] = None,
    organization: Optional[str] = None,
    country: Optional[str] = None,
    profile_image: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Updates profile attributes for an existing user."""
    user = get_user_by_id(user_id)
    if not user:
        return None

    now = datetime.utcnow().isoformat() + "Z"
    new_name = full_name.strip() if full_name is not None else user["full_name"]
    new_org = organization.strip() if organization is not None else user.get("organization", "")
    new_country = country.strip() if country is not None else user.get("country", "")
    new_image = profile_image if profile_image is not None else user.get("profile_image", "")

    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE users
        SET full_name = ?, organization = ?, country = ?, profile_image = ?, updated_at = ?
        WHERE id = ?
        """, (new_name, new_org, new_country, new_image, now, user_id))
        conn.commit()

    return get_safe_user_dict(get_user_by_id(user_id))


def get_safe_user_dict(raw_user: Dict[str, Any]) -> Dict[str, Any]:
    """Strips secret hash fields from user dict before sending to client."""
    return {
        "id": raw_user["id"],
        "full_name": raw_user.get("full_name") or raw_user.get("name", ""),
        "username": raw_user.get("username") or raw_user.get("oit_user_id", ""),
        "email": raw_user["email"],
        "role": raw_user.get("role", "user"),
        "organization": raw_user.get("organization", ""),
        "country": raw_user.get("country", ""),
        "profile_image": raw_user.get("profile_image", ""),
        "is_active": bool(raw_user.get("is_active", 1)),
        "created_at": raw_user.get("created_at", ""),
        "updated_at": raw_user.get("updated_at", ""),
        "last_login": raw_user.get("last_login")
    }


def list_users() -> List[Dict[str, Any]]:
    """Lists safe user records for administrators."""
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY created_at ASC")
        return [get_safe_user_dict(dict(r)) for r in cursor.fetchall()]


def set_user_active_state(user_id: str, is_active: bool) -> bool:
    """Toggles account active state."""
    with db_manager.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (1 if is_active else 0, user_id))
        conn.commit()
        return True


# Run initialization on import
try:
    init_auth_tables()
except Exception as e:
    print(f"[AuthDB] Table init: {e}")
