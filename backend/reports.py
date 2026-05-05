import base64
import os
import uuid
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

from auth import token_required, admin_required, _decode_token
from models import db, Report, User

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def _allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@reports_bp.route("", methods=["POST"])
@token_required
def create_report():
    # Detect content type
    if request.content_type and "multipart/form-data" in request.content_type:
        data = request.form
    else:
        data = request.get_json() or {}

    type_desc = (data.get("type_description") or "").strip()
    location = (data.get("location") or "").strip()
    immediate_risk = (data.get("immediate_risk") or "").strip()
    contact_pref = (data.get("contact_preference") or "").strip()
    is_anonymous = data.get("is_anonymous", "false")
    if isinstance(is_anonymous, str):
        is_anonymous = is_anonymous.lower() in ("true", "1", "yes")
    else:
        is_anonymous = bool(is_anonymous)

    if not type_desc or not location or not immediate_risk or not contact_pref:
        return jsonify({"error": "Todos los campos son requeridos"}), 400

    # Handle photo upload (multipart file OR base64 in JSON)
    photo_filename = None
    if "photo" in request.files:
        file = request.files["photo"]
        if file and file.filename and _allowed_file(file.filename):
            safe_name = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
            os.makedirs(UPLOADS_DIR, exist_ok=True)
            file.save(os.path.join(UPLOADS_DIR, safe_name))
            photo_filename = safe_name
    elif isinstance(data, dict) and data.get("photo_base64"):
        photo_b64 = data["photo_base64"]
        photo_name = data.get("photo_name", "photo.jpg")
        ext = photo_name.rsplit(".", 1)[-1].lower() if "." in photo_name else "jpg"
        if ext in ALLOWED_EXTENSIONS:
            safe_name = f"{uuid.uuid4().hex}_{secure_filename(photo_name)}"
            os.makedirs(UPLOADS_DIR, exist_ok=True)
            with open(os.path.join(UPLOADS_DIR, safe_name), "wb") as f:
                f.write(base64.b64decode(photo_b64))
            photo_filename = safe_name

    report = Report(
        user_id=None if is_anonymous else request.current_user.id,
        is_anonymous=is_anonymous,
        type_description=type_desc,
        location=location,
        immediate_risk=immediate_risk,
        contact_preference=contact_pref,
        photo_filename=photo_filename,
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({"report": report.to_dict()}), 201


@reports_bp.route("/<int:report_id>/photo", methods=["GET"])
def get_report_photo(report_id):
    # Auth via header or query param (img tags can't send headers)
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        token = request.args.get("token", "")

    payload = _decode_token(token)
    if not payload:
        return jsonify({"error": "Token requerido"}), 401

    user = db.session.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        return jsonify({"error": "Acceso denegado"}), 401

    report = db.session.get(Report, report_id)
    if report is None:
        return jsonify({"error": "Reporte no encontrado"}), 404

    if not report.photo_filename:
        return jsonify({"error": "Este reporte no tiene foto"}), 404

    if user.role not in ("admin", "superadmin") and report.user_id != user.id:
        return jsonify({"error": "Acceso denegado"}), 403

    return send_from_directory(UPLOADS_DIR, report.photo_filename)


@reports_bp.route("", methods=["GET"])
@token_required
def list_reports():
    user = request.current_user
    if user.role in ("admin", "superadmin"):
        reports = Report.query.order_by(Report.created_at.desc()).all()
    else:
        reports = Report.query.filter_by(user_id=user.id).order_by(Report.created_at.desc()).all()

    return jsonify({"reports": [r.to_dict() for r in reports]})


@reports_bp.route("/<int:report_id>", methods=["GET"])
@token_required
def get_report(report_id):
    report = db.session.get(Report, report_id)
    if report is None:
        return jsonify({"error": "Reporte no encontrado"}), 404

    user = request.current_user
    if user.role not in ("admin", "superadmin") and report.user_id != user.id:
        return jsonify({"error": "Acceso denegado"}), 403

    return jsonify({"report": report.to_dict()})


@reports_bp.route("/<int:report_id>", methods=["PATCH"])
@admin_required
def update_report(report_id):
    report = db.session.get(Report, report_id)
    if report is None:
        return jsonify({"error": "Reporte no encontrado"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Body requerido"}), 400

    if "status" in data:
        valid_statuses = ("open", "reviewing", "resolved", "false_positive")
        if data["status"] not in valid_statuses:
            return jsonify({"error": f"Status debe ser uno de: {valid_statuses}"}), 400
        report.status = data["status"]
        if data["status"] == "resolved":
            report.resolved_at = datetime.now(timezone.utc)
            report.resolved_by = request.current_user.id

    if "notes" in data:
        report.notes = data["notes"]

    db.session.commit()
    return jsonify({"report": report.to_dict()})
