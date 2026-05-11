# SafeCampus AI

Sistema de deteccion de armas en tiempo real para seguridad universitaria, desarrollado como proyecto final del curso de Inteligencia Artificial 2026-1S en la Universidad Jorge Tadeo Lozano.

## Resumen

SafeCampus AI es una plataforma de seguridad universitaria que detecta armas en tiempo real mediante vision por computador. El sistema aborda la necesidad de respuesta temprana ante amenazas en campus, donde los protocolos actuales dependen exclusivamente de reporte humano. Se utiliza el modelo preentrenado Threat-Detection-YOLOv8n (HuggingFace) con cuatro clases (armas de fuego, cuchillos, explosiones y granadas), alcanzando un mAP@50 de 81.3%, precision de 84.3% y recall de 76.3% con un threshold de 0.50. La arquitectura integra un backend Flask con Socket.IO para streaming en vivo, un frontend Next.js con dashboard institucional, mapa interactivo del campus con 23 zonas, sistema de reportes con geolocalizacion y un chatbot de bienestar estudiantil. Como trabajo futuro se prioriza una segunda pasada de verificacion por zoom (doble inferencia sobre la region detectada) y el re-entrenamiento del modelo con un dataset ampliado para mejorar el recall en escenas con oclusiones parciales.

## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind CSS |
| Backend | Python 3.13 + Flask + Flask-SocketIO + SQLAlchemy |
| Modelo | YOLOv8n (Ultralytics) — [Threat-Detection-YOLOv8n](https://huggingface.co/Subh775/Threat-Detection-YOLOv8n) |
| Base de datos | PostgreSQL 16 (Docker) |
| Realtime | Socket.IO (streaming de video + alertas) |
| APIs externas | OpenAI (chatbot, opcional), Roboflow (deteccion cloud, opcional) |

## Metricas del modelo

| Metrica | Valor |
|---------|-------|
| mAP@50 | 81.3% |
| Precision | 84.3% |
| Recall | 76.3% |
| Clases | Gun, Knife, Explosion, Grenade |
| Threshold | 0.50 |

## Funcionalidades

- **Detector en vivo** — streaming de camara con deteccion YOLO en tiempo real y alertas sonoras
- **Dashboard** — bento grid responsivo con metricas en vivo, salud del sistema y accesos rapidos
- **Mapa del campus** — 23 zonas interactivas con conteo de reportes por zona via Socket.IO
- **Reportes** — formulario con geolocalizacion, foto, enriquecimiento post-envio y niveles de riesgo
- **Chat de bienestar** — chatbot orientado a salud mental y convivencia (OpenAI o modo demo)
- **Panel admin** — gestion de usuarios, reportes y roles (user/admin/superadmin)
- **Ajustes** — dark mode, tamano de fuente, preferencias de usuario
- **Modo demo** — funciona sin API keys externas con respuestas simuladas

## Requisitos previos

- Node.js 18+
- Python 3.11+
- Docker (para PostgreSQL)
- Camara web (para deteccion en vivo)

## Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/Fircrey/SafeCampus.git
cd SafeCampus

# 2. Instalar dependencias del frontend
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Instalar dependencias del backend
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\pip install -r requirements.txt
# Linux/Mac:
# .venv/bin/pip install -r requirements.txt

# 5. Descargar el modelo YOLO
python -c "from huggingface_hub import hf_hub_download; import shutil; shutil.copy2(hf_hub_download('Subh775/Threat-Detection-YOLOv8n','weights/best.pt'), 'models/best.pt')"
```

## Ejecucion

```bash
# Terminal 1: Base de datos
npm run dev:db

# Terminal 2: Todo junto (Next.js + Flask)
npm run dev:all
```

O por separado:

```bash
npm run dev          # Next.js en http://localhost:3000
npm run dev:flask    # Flask en http://localhost:5000
```

## Variables de entorno

Crear `.env.local` en la raiz (frontend) y `backend/.env` (backend):

```bash
# Frontend (.env.local) — ambas opcionales, habilitan modo demo si faltan
OPENAI_API_KEY=sk-...
ROBOFLOW_API_KEY=...
NEXT_PUBLIC_FLASK_URL=http://localhost:5000

# Backend (backend/.env)
SECRET_KEY=tu-clave-secreta
DATABASE_URL=postgresql://safecampus:safecampus123@localhost:5433/safecampus
CONFIDENCE_THRESHOLD=0.50
```

## Estructura del proyecto

```
safecampus-ai/
├── backend/                 # Flask + YOLO + Socket.IO
│   ├── app.py               # Servidor principal
│   ├── auth.py              # JWT + bcrypt
│   ├── models.py            # SQLAlchemy (User, Report)
│   ├── reports.py           # CRUD de reportes
│   ├── admin.py             # Panel admin
│   ├── requirements.txt     # Dependencias Python
│   └── models/best.pt       # Modelo YOLO (no incluido, ver instalacion)
├── app/                     # Next.js App Router (paginas)
├── components/              # Componentes React por feature
│   ├── dashboard/           # Bento grid dashboard
│   ├── detector/            # Detector YOLO en vivo
│   ├── mapa/                # Mapa interactivo SVG
│   ├── reportar/            # Formulario de reportes
│   ├── chat/                # Chat de bienestar
│   └── auth/                # Login / registro
├── lib/                     # Constantes, tipos, cliente Flask
├── hooks/                   # Custom hooks
├── public/                  # Assets estaticos + mascota Cabito
├── docker-compose.yml       # PostgreSQL 16
└── package.json             # Scripts npm
```

## Arquitectura

```
[Browser]
  ├─ Next.js pages ──> Next.js API routes ──> OpenAI / Roboflow (opcional)
  └─ Socket.IO client ──> Flask + YOLOv8 ──> PostgreSQL :5433
```

## Nota de alcance

Esta aplicacion es un MVP academico demostrativo. No reemplaza atencion psicologica, seguridad institucional ni servicios de emergencia. La deteccion por vision por computador requiere validacion humana en todo momento.

## Licencia

Proyecto academico — Universidad Jorge Tadeo Lozano, 2026.
