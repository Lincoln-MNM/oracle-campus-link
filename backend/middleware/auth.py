"""
JWT + bcrypt Authentication Middleware
Requires: pip install flask pyjwt bcrypt

Usage:
  from middleware.auth import token_required, role_required, hash_password, verify_password
"""

import jwt
import bcrypt
import os
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
TOKEN_EXPIRY_HOURS = 24


def hash_password(plain_password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def generate_token(user_id: str, role: str, name: str) -> str:
    """Generate a JWT token."""
    payload = {
        "user_id": user_id,
        "role": role,
        "name": name,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])


def token_required(f):
    """Decorator: require valid JWT in Authorization header."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

        if not token:
            return jsonify({"status": "error", "message": "Token is missing"}), 401

        try:
            data = decode_token(token)
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"status": "error", "message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": "error", "message": "Invalid token"}), 401

        return f(*args, **kwargs)
    return wrapper


def role_required(*allowed_roles):
    """Decorator: require user to have one of the allowed roles."""
    def decorator(f):
        @wraps(f)
        @token_required
        def wrapper(*args, **kwargs):
            user_role = getattr(request, "user", {}).get("role", "")
            if user_role not in allowed_roles:
                return jsonify({"status": "error", "message": "Insufficient permissions"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
