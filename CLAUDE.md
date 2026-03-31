# Proyecto: Detector de Armas con IA - UTADEO

## Descripcion General
Sistema de deteccion de armas en tiempo real usando vision artificial (YOLOv8) con interfaz web.
Aplicacion monolitica Flask que sirve un dashboard CCTV con deteccion en tiempo real via SocketIO.
Proyecto universitario para la Universidad Jorge Tadeo Lozano (UTADEO).

## Stack Tecnologico
- **Backend**: Python 3.13 + Flask + Flask-SocketIO + OpenCV + YOLOv8 (puerto 5000)
- **Frontend**: HTML/CSS/JS servido por Flask (tema oscuro CCTV)
- **Real-time**: SocketIO push (new_detection, alert, status_change, stats_update)
- **Modelo IA**: YOLOv8 custom entrenado (`backend/models/best.pt`)
- **Config**: Variables de entorno via `.env` + python-dotenv

## Estructura de Archivos

```
proyecto-detector-armas/
├── .gitignore
├── CLAUDE.md
├── backend/
│   ├── .env                    # Variables de entorno (SECRET_KEY, CONFIDENCE_THRESHOLD, etc.)
│   ├── app.py                  # Backend Flask + SocketIO + deteccion YOLO
│   ├── requirements.txt        # Dependencias Python
│   ├── models/
│   │   └── best.pt             # Modelo YOLOv8 entrenado
│   ├── static/
│   │   ├── css/style.css       # Tema oscuro estilo CCTV/seguridad
│   │   └── js/app.js           # Cliente SocketIO + UI logic (IIFE)
│   └── templates/
│       └── index.html          # Dashboard de seguridad
```

## Como Ejecutar

```bash
cd backend
pip install -r requirements.txt
python app.py
# Abre http://localhost:5000
```

## Arquitectura del Backend (app.py)
- Config desde `.env` (SECRET_KEY, CONFIDENCE_THRESHOLD, MAX_HISTORY, CAMERA_INDEX, FRAME_SKIP)
- `DetectionTracker` thread-safe con lock
- Frame throttling: YOLO cada N frames (FRAME_SKIP) para reducir carga
- SocketIO eventos: `new_detection`, `alert`, `status_change`, `stats_update`
- Helpers: `_process_detections()`, `_draw_detections()`
- CORS restringido (same-origin), debug=False

## Frontend (servido por Flask)
- Dashboard estilo centro de monitoreo CCTV
- Tema oscuro (#0a0e17 fondo, paleta verde/rojo/naranja/azul)
- SocketIO para real-time (sin polling)
- Web Audio API para alertas sonoras (oscillator 880Hz)
- Auto-dismiss de alertas a 5 segundos
- Max 50 items en DOM del log
- Responsive a 900px y 480px

## Convenciones
- Idioma del codigo: ingles (variables/funciones), espanol (UI, comentarios)
- Plataforma: Windows (usa cv2.CAP_DSHOW)
- Sin emojis en logs (formato [INFO]/[ERROR])
