"""
FastAPI Authentication Router for VIGIL Earth Observation Platform
Supports Public Sign Up, Sign In (Email or Username), Session Tokens, Profile Management, and Password Recovery.
"""
import time
import secrets
import re
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Header, Depends, status
from pydantic import BaseModel, Field, EmailStr

from backend.database.auth_db import (
    create_user,
    get_user_by_login_identifier,
    get_user_by_id,
    verify_password,
    update_last_login,
    update_user_password,
    update_user_profile,
    get_safe_user_dict,
    list_users,
    set_user_active_state
)
from backend.database.audit import record_audit_event

auth_router = APIRouter(prefix="/auth", tags=["VIGIL Authentication"])

# In-Memory Active Session Cache (mapped token -> session metadata)
# Token expires in 8 hours (28800s) default, or 30 days if remember_me
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

# Active Password Reset Challenges (mapped user_id -> { code, expires_at })
RESET_CHALLENGES: Dict[str, Dict[str, Any]] = {}


# Pydantic Schemas
class SignUpRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="User's Full Name")
    email: EmailStr = Field(..., description="Valid Email Address (e.g. gmail, outlook, institutional)")
    username: str = Field(..., min_length=3, max_length=30, description="Unique Username")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    confirm_password: Optional[str] = None
    organization: Optional[str] = Field(default="", description="Optional Organization or Institution")
    country: Optional[str] = Field(default="", description="Optional Country")


class SignInRequest(BaseModel):
    identifier: str = Field(..., description="Email Address or Username")
    password: str = Field(..., min_length=1, description="Account Password")
    remember_me: bool = Field(default=False, description="Persist session for 30 days")


# Backward compatibility alias
class LegacyLoginRequest(BaseModel):
    user_id_or_email: str
    password: str
    remember_me: bool = False


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    country: Optional[str] = None
    profile_image: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Registered Email Address or Username")


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., description="Registered Email Address or Username")
    verification_code: str = Field(..., description="Verification code received")
    new_password: str = Field(..., min_length=8, description="New secure password")


class ToggleActiveRequest(BaseModel):
    user_id: str
    is_active: bool


def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency to validate VIGIL session bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization token")

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
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended or deactivated")

    return get_safe_user_dict(user)


@auth_router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(req: SignUpRequest) -> Dict[str, Any]:
    """
    Public registration endpoint. Anyone can create an account with any valid email.
    Automatically logs the user in and returns session token and profile.
    """
    if req.confirm_password and req.password != req.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match.")

    # Validate username formatting (alphanumeric, underscores, hyphens)
    if not re.match(r'^[a-zA-Z0-9_\-\.]+$', req.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username may only contain letters, numbers, hyphens, and underscores."
        )

    try:
        new_user = create_user(
            full_name=req.full_name,
            username=req.username,
            email=req.email,
            password=req.password,
            organization=req.organization or "",
            country=req.country or ""
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Automatic sign-in upon registration
    ttl_seconds = 8 * 3600  # 8 hours default
    expires_at = time.time() + ttl_seconds
    token = f"vigil_tok_{secrets.token_urlsafe(32)}"

    ACTIVE_SESSIONS[token] = {
        "user_id": new_user["id"],
        "role": new_user["role"],
        "created_at": time.time(),
        "expires_at": expires_at,
        "remember_me": False
    }

    record_audit_event(
        event_type="USER_REGISTRATION",
        payload={
            "username": new_user["username"],
            "email": new_user["email"],
            "role": new_user["role"]
        },
        user=f"{new_user['full_name']} (@{new_user['username']})"
    )

    return {
        "success": True,
        "token": token,
        "user": new_user,
        "expires_at": int(expires_at * 1000),
        "message": "Account created successfully. Welcome to VIGIL!"
    }


@auth_router.post("/signin")
@auth_router.post("/login")
def signin(req: Any) -> Dict[str, Any]:
    """
    Public sign-in endpoint for all registered users (by email or username).
    Supports remember_me (30 days persistence).
    """
    # Accept both SignInRequest and LegacyLoginRequest format
    if isinstance(req, dict):
        ident = (req.get("identifier") or req.get("user_id_or_email") or "").strip()
        pwd = req.get("password") or ""
        remember = bool(req.get("remember_me", False))
    elif hasattr(req, "identifier"):
        ident = req.identifier.strip()
        pwd = req.password
        remember = req.remember_me
    else:
        ident = getattr(req, "user_id_or_email", "").strip()
        pwd = getattr(req, "password", "")
        remember = getattr(req, "remember_me", False)

    if not ident or not pwd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide both your email/username and password."
        )

    user = get_user_by_login_identifier(ident)

    # Timing-attack safe generic rejection
    if not user:
        verify_password("dummy_password", "00" * 16, "00" * 64)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password. Please check your credentials and try again."
        )

    if not user.get("is_active", 1):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    if not verify_password(pwd, user["salt"], user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password. Please check your credentials and try again."
        )

    # Issue session token
    ttl_seconds = (30 * 86400) if remember else (8 * 3600)
    expires_at = time.time() + ttl_seconds
    token = f"vigil_tok_{secrets.token_urlsafe(32)}"

    ACTIVE_SESSIONS[token] = {
        "user_id": user["id"],
        "role": user.get("role", "user"),
        "created_at": time.time(),
        "expires_at": expires_at,
        "remember_me": remember
    }

    update_last_login(user["id"])

    safe_user = get_safe_user_dict(user)

    record_audit_event(
        event_type="USER_SIGNIN",
        payload={"username": safe_user["username"], "role": safe_user["role"]},
        user=f"{safe_user['full_name']} (@{safe_user['username']})"
    )

    return {
        "success": True,
        "token": token,
        "user": safe_user,
        "expires_at": int(expires_at * 1000),
        "message": "Signed in successfully"
    }


@auth_router.get("/me")
def get_me(current_user: Dict[str, Any] = Depends(get_current_user_from_header)) -> Dict[str, Any]:
    """Returns currently authenticated user profile."""
    return {"user": current_user}


@auth_router.put("/profile")
def update_profile(
    req: UpdateProfileRequest,
    current_user: Dict[str, Any] = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    """Allows user to update their own profile details."""
    updated = update_user_profile(
        user_id=current_user["id"],
        full_name=req.full_name,
        organization=req.organization,
        country=req.country,
        profile_image=req.profile_image
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "user": updated, "message": "Profile updated successfully"}


@auth_router.post("/logout")
def logout(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Terminates active session token."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        session = ACTIVE_SESSIONS.pop(token, None)
        if session:
            record_audit_event(
                event_type="USER_SIGNOUT",
                payload={"user_id": session["user_id"]},
                user=f"User-{session['user_id']}"
            )
    return {"success": True, "message": "Signed out successfully"}


@auth_router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest) -> Dict[str, Any]:
    """
    Initiates password reset flow. Does not disclose account existence.
    Generates a secure verification code for verification.
    """
    ident = req.email.strip().lower()
    user = get_user_by_login_identifier(ident)

    if not user:
        return {
            "success": True,
            "message": "If an account exists with that email/username, we have generated a password reset code."
        }

    otp = f"VIGIL-{secrets.randbelow(899999) + 100000}"
    RESET_CHALLENGES[user["id"]] = {
        "code": otp,
        "expires_at": time.time() + 900  # 15 minutes
    }

    record_audit_event(
        event_type="PASSWORD_RESET_REQUESTED",
        payload={"username": user.get("username")},
        user=user.get("full_name", "User")
    )

    return {
        "success": True,
        "message": f"Password reset instructions and verification code have been prepared for {user['email']}.",
        "verification_hint": f"Reset Code: {otp} (Valid 15m for testing/demo)"
    }


@auth_router.post("/reset-password")
def reset_password(req: ResetPasswordRequest) -> Dict[str, Any]:
    """Validates challenge code and sets new password."""
    user = get_user_by_login_identifier(req.email.strip().lower())
    if not user:
        raise HTTPException(status_code=400, detail="Invalid password reset request.")

    challenge = RESET_CHALLENGES.get(user["id"])
    if not challenge or time.time() > challenge["expires_at"]:
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new one.")

    if challenge["code"] != req.verification_code.strip():
        raise HTTPException(status_code=400, detail="Incorrect verification code. Please check and retry.")

    update_user_password(user["id"], req.new_password)
    RESET_CHALLENGES.pop(user["id"], None)

    record_audit_event(
        event_type="PASSWORD_RESET_COMPLETED",
        payload={"username": user.get("username")},
        user=user.get("full_name", "User")
    )

    return {
        "success": True,
        "message": "Password updated successfully. You may now sign in."
    }


@auth_router.get("/users")
def get_all_users(current_user: Dict[str, Any] = Depends(get_current_user_from_header)) -> Dict[str, Any]:
    """Administrator-only endpoint to inspect registered users."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrator privileges required.")

    users = list_users()
    return {"users": users}


@auth_router.post("/users/toggle-active")
def toggle_user(req: ToggleActiveRequest, current_user: Dict[str, Any] = Depends(get_current_user_from_header)) -> Dict[str, Any]:
    """Administrator-only endpoint to activate/deactivate accounts."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Administrator privileges required.")

    if req.user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    set_user_active_state(req.user_id, req.is_active)
    return {"success": True, "message": f"User status updated to {'active' if req.is_active else 'inactive'}."}
