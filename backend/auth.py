import os
import warnings
from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import jwt
from flask import Blueprint, jsonify, request

# PyJWT warns about short HMAC keys — suppress in dev
warnings.filterwarnings("ignore", message=".*HMAC key.*", category=Warning)

from models import db, User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

JWT_SECRET = os.getenv("JWT_SECRET", "safecampus-dev-jwt-secret-key-2026")
JWT_EXPIRATION_HOURS = 24


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def _create_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def _decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


# --- Decoradores ---

def token_required(f):
    """Requiere un JWT valido en Authorization: Bearer <token>"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token requerido"}), 401
        token = auth_header.split(" ", 1)[1]
        payload = _decode_token(token)
        if payload is None:
            return jsonify({"error": "Token invalido o expirado"}), 401
        user = db.session.get(User, int(payload["sub"]))
        if user is None or not user.is_active:
            return jsonify({"error": "Usuario no encontrado o inactivo"}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Requiere rol admin o superadmin"""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.current_user.role not in ("admin", "superadmin"):
            return jsonify({"error": "Acceso denegado: se requiere rol admin"}), 403
        return f(*args, **kwargs)
    return decorated


def superadmin_required(f):
    """Requiere rol superadmin"""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.current_user.role != "superadmin":
            return jsonify({"error": "Acceso denegado: se requiere rol superadmin"}), 403
        return f(*args, **kwargs)
    return decorated


# --- Rutas ---

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Body requerido"}), 400

    email = (data.get("email") or "").strip().lower()
    name = (data.get("name") or "").strip()
    password = data.get("password") or ""

    if not email or not name or len(password) < 6:
        return jsonify({"error": "Email, nombre y password (min 6 chars) son requeridos"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email ya registrado"}), 409

    user = User(
        email=email,
        name=name,
        password_hash=_hash_password(password),
        role="user",
    )
    db.session.add(user)
    db.session.commit()

    token = _create_token(user)
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Body requerido"}), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if user is None or not _check_password(password, user.password_hash):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    if not user.is_active:
        return jsonify({"error": "Cuenta desactivada"}), 403

    token = _create_token(user)
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    return jsonify({"user": request.current_user.to_dict()})
