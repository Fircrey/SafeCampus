import os
import time
import threading
import logging
from datetime import datetime
from collections import deque

import cv2
import numpy as np
from flask import Flask, render_template, Response, jsonify
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
from ultralytics import YOLO

# ------------------------------------
# CONFIGURACION
# ------------------------------------
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "cambiar-esta-clave")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.65"))
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "50"))
CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))
FRAME_SKIP = int(os.getenv("FRAME_SKIP", "3"))
ALERT_COOLDOWN = int(os.getenv("ALERT_COOLDOWN", "10"))
CLEAN_FRAMES_TO_CLEAR = int(os.getenv("CLEAN_FRAMES_TO_CLEAR", "20"))

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "best.pt")

GUN_LABELS = {"gun", "arma", "pistola", "pistol"}
KNIFE_LABELS = {"knife", "cuchillo"}
WEAPON_LABELS = GUN_LABELS | KNIFE_LABELS
OBJECT_LABELS = {"billete", "monedero", "smartphone", "tarjeta"}

logging.basicConfig(
    level=logging.INFO,
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

socketio = SocketIO(app, cors_allowed_origins=[], async_mode="threading")

# ------------------------------------
# ESTADO GLOBAL
# ------------------------------------
model = None
camera = None
is_running = False
lock = threading.Lock()


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
        avg_conf = round(np.mean([d["confidence"] for d in history]), 2) if history else 0
        return {
            "total_detections": len(history),
            "guns": guns,
            "knives": knives,
            "average_confidence": float(avg_conf),
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
        return True

    except Exception as e:
        log.error("Error al cargar el modelo: %s", e)
        return False


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

    def reset(self):
        self.weapon_visible = False
        self.clean_frames = 0
        self.last_alert_time = 0.0
        self.last_log_time = 0.0


def _process_detections(results, alert_state):
    """Extrae detecciones y maneja transiciones de estado para alertas."""
    detections = []
    frame_has_weapon = False
    best_weapon = None

    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = result.names[cls_id]

            is_weapon = label.lower() in WEAPON_LABELS
            is_gun = label.lower() in GUN_LABELS

            detection = {
                "label": label,
                "confidence": conf,
                "box": (x1, y1, x2, y2),
                "is_weapon": is_weapon,
                "is_gun": is_gun,
            }
            detections.append(detection)

            if is_weapon:
                frame_has_weapon = True
                if best_weapon is None or conf > best_weapon["confidence"]:
                    best_weapon = detection

    now = time.time()

    if frame_has_weapon:
        alert_state.clean_frames = 0

        # Log throttling: maximo 1 entrada cada 3 segundos por deteccion continua
        if now - alert_state.last_log_time >= 3.0:
            tracked = tracker.add(best_weapon["label"], best_weapon["confidence"])
            socketio.emit("new_detection", tracked)
            socketio.emit("stats_update", tracker.get_stats())
            alert_state.last_log_time = now

        # Alerta solo en transicion: no habia arma -> ahora si hay
        if not alert_state.weapon_visible:
            # Cooldown: no re-alertar si ya alerto hace poco
            if now - alert_state.last_alert_time >= ALERT_COOLDOWN:
                alert_state.last_alert_time = now
                socketio.emit("alert", {
                    "type": "gun" if best_weapon["is_gun"] else "knife",
                    "label": best_weapon["label"],
                    "confidence": round(best_weapon["confidence"], 2),
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                })
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
            socketio.emit("alert_clear", {})
            log.info("Arma ya no visible en camara")

    return detections


def _draw_detections(frame, detections):
    """Dibuja bounding boxes y labels sobre el frame."""
    for det in detections:
        x1, y1, x2, y2 = det["box"]
        if det["is_weapon"]:
            color = (0, 0, 255) if det["is_gun"] else (0, 165, 255)
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
    global camera, is_running

    cam = _open_camera()
    if cam is None:
        log.error("No se pudo acceder a la camara (index=%d)", CAMERA_INDEX)
        is_running = False
        socketio.emit("status_change", {"status": "offline"})
        return

    with lock:
        camera = cam

    log.info("Camara iniciada correctamente (index=%d)", CAMERA_INDEX)

    frame_count = 0
    last_detections = []
    empty_streak = 0
    retry_count = 0
    max_retries = 3
    alert_state = AlertState()

    try:
        while is_running:
            success, frame = camera.read()

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
                        is_running = False
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
                    results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)
                    new_detections = _process_detections(results, alert_state)
                    if new_detections:
                        last_detections = new_detections
                        empty_streak = 0
                    else:
                        empty_streak += 1
                        # Mantener bounding boxes visibles hasta N frames limpios
                        if empty_streak >= CLEAN_FRAMES_TO_CLEAR:
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
    except GeneratorExit:
        log.info("Stream de video desconectado por el cliente")
    finally:
        with lock:
            is_running = False
            if camera is not None and camera.isOpened():
                camera.release()
                log.info("Camara liberada correctamente")
            camera = None
        socketio.emit("status_change", {"status": "offline"})


# ------------------------------------
# RUTAS FLASK
# ------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@app.route("/api/start", methods=["POST"])
def start_camera():
    global is_running, camera

    if model is None:
        return jsonify({"success": False, "message": "Modelo no cargado"}), 500

    with lock:
        # Limpiar cualquier estado previo (ej: pagina recargada sin detener)
        if camera is not None and camera.isOpened():
            camera.release()
        camera = None
        is_running = True

    log.info("Camara iniciada por el usuario")
    return jsonify({"success": True, "message": "Camara iniciada"})


@app.route("/api/stop", methods=["POST"])
def stop_camera():
    global is_running, camera

    with lock:
        is_running = False
        if camera is not None and camera.isOpened():
            camera.release()
            log.info("Camara liberada correctamente")
        camera = None

    socketio.emit("status_change", {"status": "offline"})
    log.info("Camara detenida por el usuario")
    return jsonify({"success": True, "message": "Camara detenida"})


@app.route("/api/history")
def get_history():
    return jsonify(tracker.get_history())


@app.route("/api/clear-history", methods=["POST"])
def clear_history():
    tracker.clear()
    stats = tracker.get_stats()
    socketio.emit("stats_update", stats)
    log.info("Historial limpiado por el usuario")
    return jsonify({"success": True})


@app.route("/api/stats")
def get_stats():
    return jsonify(tracker.get_stats())


# ------------------------------------
# SOCKETIO EVENTS
# ------------------------------------
@socketio.on("connect")
def handle_connect():
    log.info("Cliente conectado")
    stats = tracker.get_stats()
    emit("stats_update", stats)
    emit("status_change", {"status": "online" if is_running else "offline"})


@socketio.on("disconnect")
def handle_disconnect():
    log.info("Cliente desconectado")


# ------------------------------------
# INICIO
# ------------------------------------
if __name__ == "__main__":
    if load_model():
        log.info("Iniciando servidor en http://localhost:5000")
        socketio.run(app, debug=False, host="0.0.0.0", port=5000)
    else:
        log.error("No se pudo iniciar: modelo no encontrado")
