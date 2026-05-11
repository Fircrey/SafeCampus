import os
import time
import threading
import logging
from datetime import datetime
from collections import deque

import cv2
import numpy as np
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
from ultralytics import YOLO

# ------------------------------------
# CONFIGURACION
# ------------------------------------
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "cambiar-esta-clave")
try:
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.40"))
except (TypeError, ValueError):
    CONFIDENCE_THRESHOLD = 0.40
def _safe_int(env_var, default):
    try:
        return int(os.getenv(env_var, str(default)))
    except (TypeError, ValueError):
        return default

MAX_HISTORY = _safe_int("MAX_HISTORY", 50)
CAMERA_INDEX = _safe_int("CAMERA_INDEX", 0)
FRAME_SKIP = _safe_int("FRAME_SKIP", 3)
ALERT_COOLDOWN = _safe_int("ALERT_COOLDOWN", 10)
CLEAN_FRAMES_TO_CLEAR = _safe_int("CLEAN_FRAMES_TO_CLEAR", 20)
TARGET_FPS = _safe_int("TARGET_FPS", 30)
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://safecampus:safecampus123@localhost:5433/safecampus")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best.pt")

GUN_LABELS = {"gun", "arma", "pistola", "pistol", "rifle", "shot-gun", "submachine-gun"}
KNIFE_LABELS = {"knife", "cuchillo"}
EXPLOSIVE_LABELS = {"explosion", "grenade", "granada"}
WEAPON_LABELS = GUN_LABELS | KNIFE_LABELS | EXPLOSIVE_LABELS

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="[%(levelname)s] %(asctime)s - %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ------------------------------------
# APP FLASK + SOCKETIO
# ------------------------------------
app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max request
CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
     supports_credentials=True)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

socketio = SocketIO(
    app,
    cors_allowed_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    async_mode="threading",
)

# ------------------------------------
# BASE DE DATOS
# ------------------------------------
from models import db, User
from auth import auth_bp, admin_required, token_required, _decode_token
from reports import reports_bp
from admin import admin_bp

db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(admin_bp)

# Crear carpeta uploads si no existe
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Crear tablas y seed superadmin
with app.app_context():
    db.create_all()
    # Seed superadmin si no existe
    import bcrypt
    admin_email = "admin@utadeo.edu.co"
    if not User.query.filter_by(email=admin_email).first():
        admin_user = User(
            email=admin_email,
            name="Super Admin",
            password_hash=bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode(),
            role="superadmin",
        )
        db.session.add(admin_user)
        db.session.commit()
        log.info("Superadmin creado: %s (password por defecto)", admin_email)
        log.warning("SEGURIDAD: Cambia el password del superadmin en produccion")

# ------------------------------------
# ESTADO GLOBAL
# ------------------------------------
model = None
camera = None
_stop_event = threading.Event()
_stop_event.set()  # Inicialmente detenido
lock = threading.Lock()
_diagnostic_done = False


# ------------------------------------
# TRACKER DE DETECCIONES (THREAD-SAFE)
# ------------------------------------
class DetectionTracker:
    def __init__(self, maxlen=MAX_HISTORY):
        self._history = deque(maxlen=maxlen)
        self._lock = threading.Lock()

    def add(self, class_name, confidence):
        detection = {
            "class": class_name,
            "confidence": round(float(confidence), 2),
            "timestamp": datetime.now().strftime("%H:%M:%S"),
        }
        with self._lock:
            self._history.append(detection)
        return detection

    def get_history(self):
        with self._lock:
            return list(self._history)

    def clear(self):
        with self._lock:
            self._history.clear()

    def get_stats(self):
        with self._lock:
            history = list(self._history)
        guns = sum(1 for d in history if d["class"].lower() in GUN_LABELS)
        knives = sum(1 for d in history if d["class"].lower() in KNIFE_LABELS)
        explosives = sum(1 for d in history if d["class"].lower() in EXPLOSIVE_LABELS)
        avg_conf = round(np.mean([d["confidence"] for d in history]), 2) if history else 0
        return {
            "total_detections": len(history),
            "guns": guns,
            "knives": knives,
            "explosives": explosives,
            "average_confidence": avg_conf,
        }


tracker = DetectionTracker()


# ------------------------------------
# CARGA DEL MODELO
# ------------------------------------
def load_model():
    global model
    try:
        import torch
        from torch.serialization import add_safe_globals
        from ultralytics.nn.tasks import DetectionModel
        from torch.nn.modules.container import Sequential

        add_safe_globals([DetectionModel, Sequential])

        if not os.path.exists(MODEL_PATH):
            log.error("Modelo no encontrado en: %s", MODEL_PATH)
            return False

        log.info("Cargando modelo desde %s ...", MODEL_PATH)
        model = YOLO(MODEL_PATH, task="detect")
        log.info("Modelo cargado correctamente")
        log.info("Modelo clases: %s", model.names)
        log.info("Confidence threshold: %.2f", CONFIDENCE_THRESHOLD)
        log.info("Weapon labels esperados: %s", WEAPON_LABELS)
        return True

    except Exception as e:
        log.error("Error al cargar el modelo: %s", e)
        return False


# ------------------------------------
# HELPERS DE CAMARA
# ------------------------------------
def _release_camera():
    """Centraliza la liberacion de la camara. Debe llamarse dentro del lock."""
    global camera
    if camera is not None and camera.isOpened():
        camera.release()
        log.info("Camara liberada correctamente")
    camera = None


# ------------------------------------
# HELPERS DE DETECCION
# ------------------------------------
class AlertState:
    """Maquina de estados para alertas. Evita spam de detecciones repetidas."""

    def __init__(self):
        self.weapon_visible = False      # Hay un arma en cuadro ahora?
        self.clean_frames = 0            # Frames consecutivos sin arma
        self.last_alert_time = 0.0       # Timestamp del ultimo alert emitido
        self.last_log_time = 0.0         # Timestamp del ultimo log entry


def _process_detections(results, alert_state):
    """Extrae detecciones y maneja transiciones de estado. Retorna (detections, events)."""
    detections = []
    frame_has_weapon = False
    best_weapon = None

    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = result.names[cls_id]

            label_lower = label.lower()
            is_gun = label_lower in GUN_LABELS
            is_knife = label_lower in KNIFE_LABELS
            is_explosive = label_lower in EXPLOSIVE_LABELS
            is_weapon = is_gun or is_knife or is_explosive

            detection = {
                "label": label,
                "confidence": conf,
                "box": (x1, y1, x2, y2),
                "is_weapon": is_weapon,
                "is_gun": is_gun,
                "is_explosive": is_explosive,
            }
            detections.append(detection)

            if is_weapon:
                frame_has_weapon = True
                if best_weapon is None or conf > best_weapon["confidence"]:
                    best_weapon = detection

    now = time.time()
    events = []

    if frame_has_weapon:
        alert_state.clean_frames = 0

        # Log throttling: maximo 1 entrada cada 3 segundos por deteccion continua
        if now - alert_state.last_log_time >= 3.0:
            tracked = tracker.add(best_weapon["label"], best_weapon["confidence"])
            stats = tracker.get_stats()
            events.append(("new_detection", tracked))
            events.append(("stats_update", stats))
            alert_state.last_log_time = now

        # Alerta solo en transicion: no habia arma -> ahora si hay
        if not alert_state.weapon_visible:
            # Cooldown: no re-alertar si ya alerto hace poco
            if now - alert_state.last_alert_time >= ALERT_COOLDOWN:
                alert_state.last_alert_time = now
                weapon_type = "gun" if best_weapon["is_gun"] else ("explosive" if best_weapon["is_explosive"] else "knife")
                events.append(("alert", {
                    "type": weapon_type,
                    "label": best_weapon["label"],
                    "confidence": round(best_weapon["confidence"], 2),
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                }))
                log.info(
                    "Arma detectada: %s (%.0f%%)",
                    best_weapon["label"],
                    best_weapon["confidence"] * 100,
                )

        alert_state.weapon_visible = True
    else:
        # Debounce: necesita N frames limpios consecutivos para desactivar
        alert_state.clean_frames += 1
        if alert_state.clean_frames >= CLEAN_FRAMES_TO_CLEAR and alert_state.weapon_visible:
            alert_state.weapon_visible = False
            events.append(("alert_clear", {}))
            log.info("Arma ya no visible en camara")

    return detections, events


def _draw_detections(frame, detections):
    """Dibuja bounding boxes y labels sobre el frame."""
    for det in detections:
        x1, y1, x2, y2 = det["box"]
        if det["is_weapon"]:
            if det["is_gun"]:
                color = (0, 0, 255)        # rojo para armas de fuego
            elif det["is_explosive"]:
                color = (0, 0, 200)        # rojo oscuro para explosivos
            else:
                color = (0, 165, 255)      # amarillo para cuchillos
        else:
            color = (0, 255, 0)

        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        label_text = f"{det['label']} {det['confidence']:.0%}"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        thickness = 2
        (tw, th), _ = cv2.getTextSize(label_text, font, font_scale, thickness)

        cv2.rectangle(frame, (x1, y1 - th - 10), (x1 + tw + 6, y1), color, -1)
        cv2.putText(frame, label_text, (x1 + 3, y1 - 5), font, font_scale, (255, 255, 255), thickness)

    return frame


# ------------------------------------
# FLUJO DE VIDEO
# ------------------------------------
def _open_camera():
    """Abre la camara y descarta frames de warmup (necesario en Windows/DirectShow)."""
    cam = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    if not cam.isOpened():
        return None

    # Warmup: descartar primeros frames (Windows necesita esto)
    for _ in range(5):
        cam.read()
        time.sleep(0.05)

    return cam


def generate_frames():
    global camera

    cam = _open_camera()
    if cam is None:
        log.error("No se pudo acceder a la camara (index=%d)", CAMERA_INDEX)
        _stop_event.set()
        socketio.emit("status_change", {"status": "offline"})
        return

    with lock:
        camera = cam

    log.info("Camara iniciada correctamente (index=%d)", CAMERA_INDEX)
    socketio.emit("status_change", {"status": "online"})

    frame_count = 0
    last_detections = []
    retry_count = 0
    max_retries = 3
    alert_state = AlertState()
    frame_interval = 1.0 / TARGET_FPS

    try:
        while not _stop_event.is_set():
            loop_start = time.time()

            try:
                cam_ref = camera
                if cam_ref is None:
                    break
                success, frame = cam_ref.read()
            except (AttributeError, cv2.error):
                break

            if not success or frame is None:
                retry_count += 1
                if retry_count > max_retries:
                    log.warning("Camara desconectada tras %d intentos, reconectando...", max_retries)
                    socketio.emit("status_change", {"status": "offline"})
                    camera.release()
                    time.sleep(1)
                    cam = _open_camera()
                    if cam is None:
                        log.error("No se pudo reconectar la camara")
                        _stop_event.set()
                        break
                    with lock:
                        camera = cam
                    socketio.emit("status_change", {"status": "online"})
                    retry_count = 0
                continue

            retry_count = 0
            frame_count += 1

            # Solo correr YOLO cada N frames para reducir carga
            if frame_count % FRAME_SKIP == 0:
                try:
                    global _diagnostic_done
                    results = model(frame, conf=CONFIDENCE_THRESHOLD, imgsz=640, verbose=False)

                    # Diagnostico one-shot: primera inferencia con threshold minimo
                    if not _diagnostic_done:
                        _diagnostic_done = True
                        diag_results = model(frame, conf=0.10, imgsz=640, verbose=False)
                        all_boxes = sum(len(r.boxes) for r in diag_results)
                        if all_boxes > 0:
                            all_labels = [f"{r.names[int(box.cls[0])]}:{float(box.conf[0]):.2f}"
                                          for r in diag_results for box in r.boxes]
                            log.warning("DIAG primera inferencia (conf=0.10): %d detecciones: %s", all_boxes, all_labels[:10])
                        else:
                            log.warning("DIAG primera inferencia (conf=0.10): 0 detecciones en este frame")

                    # Logging periodico cada ~10 inferencias
                    if frame_count % (FRAME_SKIP * 10) == 0:
                        total_boxes = sum(len(r.boxes) for r in results)
                        if total_boxes > 0:
                            labels_found = [f"{r.names[int(box.cls[0])]}:{float(box.conf[0]):.2f}"
                                            for r in results for box in r.boxes]
                            log.debug("Frame #%d: %d detecciones [%s]", frame_count, total_boxes, ", ".join(labels_found))
                        else:
                            log.debug("Frame #%d: sin detecciones", frame_count)

                    new_detections, events = _process_detections(results, alert_state)
                    for event_name, event_data in events:
                        socketio.emit(event_name, event_data)

                    if new_detections:
                        last_detections = new_detections
                    elif alert_state.clean_frames >= CLEAN_FRAMES_TO_CLEAR:
                        last_detections = []
                except Exception as e:
                    log.error("Error en la deteccion: %s", e)

            # Siempre dibujar las ultimas detecciones conocidas
            frame = _draw_detections(frame, last_detections)

            ret, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if not ret:
                continue

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
            )

            # Regular FPS
            elapsed = time.time() - loop_start
            sleep_time = frame_interval - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)

    except GeneratorExit:
        log.info("Stream de video desconectado por el cliente")
    finally:
        with lock:
            _release_camera()
        _stop_event.set()
        socketio.emit("status_change", {"status": "offline"})


# ------------------------------------
# RUTAS FLASK
# ------------------------------------
@app.before_request
def log_request():
    log.debug(">> %s %s [from %s]", request.method, request.path, request.remote_addr)


@app.route("/")
def index():
    return jsonify({"status": "ok", "service": "SafeCampus AI - Flask Backend"})


@app.route("/health")
def health():
    db_ok = False
    try:
        db.session.execute(db.text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    return jsonify({
        "status": "ok" if db_ok else "degraded",
        "service": "safecampus-backend",
        "checks": {
            "database": db_ok,
            "model_loaded": model is not None,
            "detector_running": not _stop_event.is_set(),
        },
    }), (200 if db_ok else 503)


@app.route("/video_feed")
def video_feed():
    # Auth via query param (img tags can't send headers)
    token = request.args.get("token", "")
    payload = _decode_token(token)
    if not payload:
        return jsonify({"error": "Acceso denegado"}), 403
    user = db.session.get(User, int(payload["sub"]))
    if user is None or not user.is_active or user.role not in ("admin", "superadmin"):
        return jsonify({"error": "Acceso denegado"}), 403
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@app.route("/api/status")
@admin_required
def api_status():
    with lock:
        cam_running = camera is not None and camera.isOpened()
    return jsonify({
        "model_loaded": model is not None,
        "camera_running": cam_running,
        "camera_index": CAMERA_INDEX,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "stats": tracker.get_stats(),
    })


@app.route("/api/start", methods=["POST"])
@admin_required
def start_camera():
    global _diagnostic_done

    if model is None:
        return jsonify({"success": False, "message": "Modelo no cargado"}), 500

    with lock:
        if camera is not None and camera.isOpened():
            if _stop_event.is_set():
                # Detector detenido pero camara no se libero aun (race condition).
                # Liberar la camara vieja para permitir re-inicio.
                _release_camera()
                log.info("Camara residual liberada para permitir re-inicio")
            else:
                return jsonify({"success": False, "message": "Cámara ya en uso"}), 409

    _stop_event.clear()
    _diagnostic_done = False
    log.info("Camara iniciada por el usuario")
    return jsonify({"success": True, "message": "Camara iniciada"})


@app.route("/api/stop", methods=["POST"])
@admin_required
def stop_camera():
    global _diagnostic_done

    _stop_event.set()
    with lock:
        _release_camera()
    _diagnostic_done = False

    socketio.emit("status_change", {"status": "offline"})
    log.info("Camara detenida por el usuario")
    return jsonify({"success": True, "message": "Camara detenida"})


@app.route("/api/history")
@admin_required
def get_history():
    return jsonify(tracker.get_history())


@app.route("/api/clear-history", methods=["POST"])
@admin_required
def clear_history():
    tracker.clear()
    stats = tracker.get_stats()
    socketio.emit("stats_update", stats)
    log.info("Historial limpiado por el usuario")
    return jsonify({"success": True})


@app.route("/api/stats")
@token_required
def get_stats():
    return jsonify(tracker.get_stats())


# ------------------------------------
# SOCKETIO EVENTS
# ------------------------------------
@socketio.on("connect")
def handle_connect():
    token = request.args.get("token", "")
    payload = _decode_token(token)
    if not payload:
        log.warning("WebSocket connection rejected: no valid token")
        return False
    user = db.session.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        return False
    log.info("Cliente conectado: %s", payload.get("email", "unknown"))
    stats = tracker.get_stats()
    emit("stats_update", stats)
    with lock:
        cam_open = camera is not None and camera.isOpened()
    emit("status_change", {"status": "online" if cam_open else "offline"})


@socketio.on("disconnect")
def handle_disconnect():
    log.info("Cliente desconectado")


@socketio.on("get_status")
def handle_get_status():
    stats = tracker.get_stats()
    with lock:
        cam_open = camera is not None and camera.isOpened()
    emit("status_change", {"status": "online" if cam_open else "offline"})
    emit("stats_update", stats)


# ------------------------------------
# INICIO
# ------------------------------------
if __name__ == "__main__":
    if load_model():
        log.info("Iniciando servidor en http://localhost:5000")
        socketio.run(app, debug=False, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
    else:
        log.error("No se pudo iniciar: modelo no encontrado")
