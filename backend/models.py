from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")  # user | admin | superadmin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    reports = db.relationship("Report", foreign_keys="Report.user_id", backref="author", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    is_anonymous = db.Column(db.Boolean, default=False)
    type_description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    immediate_risk = db.Column(db.String(255), nullable=False)
    contact_preference = db.Column(db.String(255), nullable=False)
    photo_filename = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), default="open")  # open | reviewing | resolved | false_positive
    notes = db.Column(db.Text, nullable=True)
    zone_id = db.Column(db.String(100), nullable=True)
    zone_name = db.Column(db.String(255), nullable=True)
    priority = db.Column(db.String(20), nullable=True)  # alta | media | baja
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    resolver = db.relationship("User", foreign_keys=[resolved_by])

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "is_anonymous": self.is_anonymous,
            "type_description": self.type_description,
            "location": self.location,
            "immediate_risk": self.immediate_risk,
            "contact_preference": self.contact_preference,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "photo_filename": self.photo_filename,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolved_by": self.resolved_by,
            "resolver_name": self.resolver.name if self.resolver else None,
            "zone_id": self.zone_id,
            "zone_name": self.zone_name,
            "priority": self.priority,
        }
