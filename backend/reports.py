from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from auth import token_required, admin_required
from models import db, Report

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.route("", methods=["POST"])
@token_required
def create_report():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Body requerido"}), 400

    type_desc = (data.get("type_description") or "").strip()
    location = (data.get("location") or "").strip()
    immediate_risk = (data.get("immediate_risk") or "").strip()
    contact_pref = (data.get("contact_preference") or "").strip()
    is_anonymous = bool(data.get("is_anonymous", False))

    if not type_desc or not location or not immediate_risk or not contact_pref:
        return jsonify({"error": "Todos los campos son requeridos"}), 400

    report = Report(
        user_id=None if is_anonymous else request.current_user.id,
        is_anonymous=is_anonymous,
        type_description=type_desc,
        location=location,
        immediate_risk=immediate_risk,
        contact_preference=contact_pref,
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({"report": report.to_dict()}), 201


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
