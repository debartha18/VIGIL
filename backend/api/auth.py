"""
FastAPI Authentication Router for OIT Users & Administrators
Provides token-based sessions, PBKDF2 credential verification, audit trail integration, and password recovery.
"""
import time
import secrets
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Header, Depends, status
from pydantic import BaseModel, Field

from backend.database.auth_db import (
    get_user_by_identifier,
    get_user_by_id,
    verify_password,
    update_last_login,
    update_user_password,
    list_users,
    set_user_active_state
)
from backend.database.audit import record_audit_event

auth_router = APIRouter(prefix="/auth", tags=["OIT Authentication"])

# In-Memory Active Session Cache (mapped token -> session metadata)
# Token expires in 8 hours (28800s) default, or 30 days if remember_me
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

# Active Password Reset Challenges (mapped challenge_id -> { user_id, code, expires_at })
RESET_CHALLENGES: Dict[str, Dict[str, Any]] = {}


# Request & Response Pydantic Models
class LoginRequest(BaseModel):
    user_id_or_email: str = Field(..., description="OIT User ID (e.g. OIT-IMINT-804) or Official Email")
    password: str = Field(..., min_length=6, description="OIT Password")
    remember_me: bool = Field(default=False, description="Persist session for 30 days")


class ForgotPasswordRequest(BaseModel):
    user_id_or_email: str = Field(..., description="OIT User ID or registered email")


class ResetPasswordRequest(BaseModel):
    user_id_or_email: str = Field(..., description="OIT User ID or registered email")
    verification_code: str = Field(..., description="Verification clearance OTP code")
    new_password: str = Field(..., min_length=8, description="New secure password")


class ToggleActiveRequest(BaseModel):
    user_id: str
    is_active: bool


def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency to validate OIT session bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")

    token = authorization.split(" ")[1]
    session = ACTIVE_SESSIONS.get(token)

    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

    if time.time() > session["expires_at"]:
        ACTIVE_SESSIONS.pop(token, None)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session has expired. Please sign in again.")

    user = get_user_by_id(session["user_id"])
    if not user or not user["is_active"]:
        ACTIVE_SESSIONS.pop(token, None)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended or inactive")

    # Safe user dictionary (strip hashes)
    return {
        "id": user["id"],
        "oit_user_id": user["oit_user_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "organization": user["organization"],
        "call_sign": user.get("call_sign", "IMINT-01"),
        "clearance": user.get("clearance", "SECRET // NOFORN"),
        "is_active": bool(user["is_active"]),
        "created_at": user["created_at"],
        "last_login": user.get("last_login")
    }


@auth_router.post("/login")
def login(req: LoginRequest) -> Dict[str, Any]:
    """
    Authenticates OIT User against hashed salted credentials.
    Returns secure session token and safe user profile.
    """
    ident = req.user_id_or_email.strip()
    if not ident or not req.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OIT User ID / Email and password are required."
        )

    user = get_user_by_identifier(ident)

    # Timing-safe failure (prevent account existence enumeration)
    if not user:
        # Dummy verification to equalize timing
        verify_password("dummy_password", "00" * 16, "00" * 64)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OIT User ID or password. Please check your credentials and try again."
        )

    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your OIT account is deactivated. Contact your OIT Administrator."
        )

    if not verify_password(req.password, user["salt"], user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OIT User ID or password. Please check your credentials and try again."
        )

    # Successful login: Generate session token
    ttl_seconds = (30 * 86400) if req.remember_me else 28800  # 30 days vs 8 hours
    expires_at = time.time() + ttl_seconds
    token = f"oit_sec_{secrets.token_urlsafe(32)}"

    ACTIVE_SESSIONS[token] = {
        "user_id": user["id"],
        "role": user["role"],
        "created_at": time.time(),
        "expires_at": expires_at,
        "remember_me": req.remember_me
    }

    update_last_login(user["id"])

    # Record tamper-evident audit event
    record_audit_event(
        event_type="OIT_USER_LOGIN",
        payload={
            "oit_user_id": user["oit_user_id"],
            "role": user["role"],
            "session_ttl_hours": ttl_seconds / 3600
        },
        user=f"{user['name']} ({user['oit_user_id']})"
    )

    safe_user = {
        "id": user["id"],
        "oit_user_id": user["oit_user_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "organization": user["organization"],
        "call_sign": user.get("call_sign", "IMINT-01"),
        "clearance": user.get("clearance", "SECRET // NOFORN"),
        "is_active": bool(user["is_active"]),
        "created_at": user["created_at"],
        "last_login": user.get("last_login")
    }

    return {
        "success": True,
        "token": token,
        "user": safe_user,
        "expires_at": int(expires_at * 1000),  # millisecond timestamp for JS
        "message": "Authenticated successfully"
    }


@auth_router.get("/me")
def get_me(user: Dict[str, Any] = Depends(get_current_user_from_header)) -> Dict[str, Any]:
    """Returns currently authenticated user profile."""
    return {"user": user}


@auth_router.post("/logout")
def logout(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Terminates active OIT session."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        session = ACTIVE_SESSIONS.pop(token, None)
        if session:
            record_audit_event(
                event_type="OIT_USER_LOGOUT",
                payload={"token_prefix": token[:12]},
                user=f"User-{session['user_id']}"
            )
    return {"success": True, "message": "Session terminated successfully"}


@auth_router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest) -> Dict[str, Any]:
    """
    Initiates OIT password recovery verification.
    Generates operational verification clearance code.
    """
    ident = req.user_id_or_email.strip()
    user = get_user_by_identifier(ident)

    if not user:
        # Generic response to prevent user discovery
        return {
            "success": True,
            "message": "If an active account matches the details, a security verification code has been dispatched."
        }

    # Generate military clearance verification OTP (simulated operational key)
    # Format: OIT-SEC-######
    otp = f"OIT-SEC-{secrets.randbelow(899999) + 100000}"
    RESET_CHALLENGES[user["id"]] = {
        "code": otp,
        "expires_at": time.time() + 900  # 15 mins
    }

    record_audit_event(
        event_type="OIT_PASSWORD_RESET_REQUESTED",
        payload={"oit_user_id": user["oit_user_id"]},
        user=f"{user['name']} ({user['oit_user_id']})"
    )

    return {
        "success": True,
        "message": f"Verification challenge dispatched for {user['oit_user_id']}.",
        "verification_hint": f"Verification Code: {otp} (Valid 15m for demo/testing)"
    }


@auth_router.post("/reset-password")
def reset_password(req: ResetPasswordRequest) -> Dict[str, Any]:
    """Validates challenge code and resets password."""
    ident = req.user_id_or_email.strip()
    user = get_user_by_identifier(ident)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid password reset request.")

    challenge = RESET_CHALLENGES.get(user["id"])
    if not challenge or time.time() > challenge["expires_at"]:
        raise HTTPException(status_code=400, detail="Verification code has expired. Request a new one.")

    if challenge["code"] != req.verification_code.strip():
        raise HTTPException(status_code=400, detail="Incorrect verification code. Please check and retry.")

    # Apply new password
    update_user_password(user["id"], req.new_password)
    RESET_CHALLENGES.pop(user["id"], None)

    record_audit_event(
        event_type="OIT_PASSWORD_RESET_COMPLETED",
        payload={"oit_user_id": user["oit_user_id"]},
        user=f"{user['name']} ({user['oit_user_id']})"
    )

    return {
        "success": True,
        "message": "Password updated successfully. You may now sign in."
    }


@auth_router.get("/users")
def get_all_users(current_user: Dict[str, Any] = Depends(get_current_user_from_header)) -> Dict[str, Any]:
    """OIT Admin endpoint to view user registry."""
    if current_user.get("role") != "oit_admin":
        raise HTTPException(status_code=403, detail="OIT Administrator privilege required.")

    users = list_users()
    return {"users": users}


@auth_router.post("/users/toggle-active")
def toggle_user(req: ToggleActiveRequest, current_user: Dict[str, Any] = Depends(get_current_user_from_header)) -> Dict[str, Any]:
    """OIT Admin endpoint to activate/deactivate accounts."""
    if current_user.get("role") != "oit_admin":
        raise HTTPException(status_code=403, detail="OIT Administrator privilege required.")

    if req.user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    set_user_active_state(req.user_id, req.is_active)
    return {"success": True, "message": f"User account state updated to {'active' if req.is_active else 'inactive'}."}
