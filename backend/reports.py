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
            try:
                decoded = base64.b64decode(photo_b64)
            except Exception:
                return jsonify({"error": "Foto base64 invalida"}), 400
            # Validate magic bytes (JPEG, PNG, WebP)
            if not (decoded[:2] == b'\xff\xd8'
                    or decoded[:8] == b'\x89PNG\r\n\x1a\n'
                    or (decoded[:4] == b'RIFF' and len(decoded) > 12 and decoded[8:12] == b'WEBP')):
                return jsonify({"error": "Archivo no es una imagen valida"}), 400
            if len(decoded) > 10 * 1024 * 1024:
                return jsonify({"error": "Foto excede el tamano maximo (10 MB)"}), 400
            safe_name = f"{uuid.uuid4().hex}_{secure_filename(photo_name)}"
            os.makedirs(UPLOADS_DIR, exist_ok=True)
            with open(os.path.join(UPLOADS_DIR, safe_name), "wb") as f:
                f.write(decoded)
            photo_filename = safe_name

    zone_id = (data.get("zone_id") or "").strip() or None
    zone_name = (data.get("zone_name") or "").strip() or None
    priority = (data.get("priority") or "").strip() or None

    # Parse optional geolocation
    latitude = None
    longitude = None
    raw_lat = data.get("latitude")
    raw_lon = data.get("longitude")
    if raw_lat is not None and raw_lon is not None:
        try:
            latitude = float(raw_lat)
            longitude = float(raw_lon)
            if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
                return jsonify({"error": "Coordenadas fuera de rango"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Coordenadas invalidas"}), 400

    report = Report(
        user_id=None if is_anonymous else request.current_user.id,
        is_anonymous=is_anonymous,
        type_description=type_desc,
        location=location,
        immediate_risk=immediate_risk,
        contact_preference=contact_pref,
        photo_filename=photo_filename,
        zone_id=zone_id,
        zone_name=zone_name,
        priority=priority,
        latitude=latitude,
        longitude=longitude,
    )
    db.session.add(report)
    db.session.commit()

    if zone_id:
        try:
            from flask import current_app
            sio = current_app.extensions.get("socketio")
            if sio:
                sio.emit("new_zone_report", {
                    "zone_id": report.zone_id,
                    "zone_name": report.zone_name,
                    "priority": report.priority,
                    "status": report.status,
                    "latitude": report.latitude,
                    "longitude": report.longitude,
                })
        except Exception:
            pass  # Non-critical: don't fail the request if emit fails

    return jsonify({"report": report.to_dict()}), 201


@reports_bp.route("/by-zone", methods=["GET"])
@token_required
def reports_by_zone():
    counts = db.session.query(
        Report.zone_id,
        Report.zone_name,
        db.func.count(Report.id)
    ).filter(
        Report.zone_id.isnot(None),
        Report.status.in_(["open", "reviewing"])
    ).group_by(Report.zone_id, Report.zone_name).all()

    return jsonify({
        "zones": [
            {"zone_id": z[0], "zone_name": z[1], "count": z[2]}
            for z in counts
        ]
    })


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

    response = send_from_directory(UPLOADS_DIR, report.photo_filename)
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


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
        elif data["status"] in ("open", "reviewing"):
            report.resolved_at = None
            report.resolved_by = None

    if "notes" in data:
        report.notes = data["notes"]

    db.session.commit()
    return jsonify({"report": report.to_dict()})
