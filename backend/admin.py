from flask import Blueprint, jsonify, request

from auth import superadmin_required
from models import db, User

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/users", methods=["GET"])
@superadmin_required
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict() for u in users]})


@admin_bp.route("/users/<int:user_id>", methods=["PATCH"])
@superadmin_required
def update_user(user_id):
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if user.id == request.current_user.id:
        return jsonify({"error": "No puedes modificar tu propio usuario"}), 400

    data = request.get_json()
    if not data:
        return jsonify({"error": "Body requerido"}), 400

    if "role" in data:
        valid_roles = ("user", "admin", "superadmin")
        if data["role"] not in valid_roles:
            return jsonify({"error": f"Rol debe ser uno de: {valid_roles}"}), 400
        user.role = data["role"]

    if "is_active" in data:
        user.is_active = bool(data["is_active"])

    db.session.commit()
    return jsonify({"user": user.to_dict()})


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@superadmin_required
def deactivate_user(user_id):
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if user.id == request.current_user.id:
        return jsonify({"error": "No puedes desactivar tu propio usuario"}), 400

    user.is_active = False
    db.session.commit()
    return jsonify({"user": user.to_dict()})
