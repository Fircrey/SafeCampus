<p align="center">
  <img src="public/cabito.png" alt="Cabito — Mascota SafeCampus AI" width="120" />
</p>

<h1 align="center">SafeCampus AI</h1>

<p align="center">
  Sistema de deteccion de armas en tiempo real para seguridad universitaria
  <br />
  <strong>Universidad Jorge Tadeo Lozano — Inteligencia Artificial 2026-1S</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Flask-3.x-000?logo=flask" alt="Flask" />
  <img src="https://img.shields.io/badge/YOLOv8n-Ultralytics-blue?logo=pytorch" alt="YOLO" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="Postgres" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io" alt="SocketIO" />
</p>

---

## Resumen

SafeCampus AI es una plataforma de seguridad universitaria que detecta armas en tiempo real mediante vision por computador. El sistema aborda la necesidad de respuesta temprana ante amenazas en campus, donde los protocolos actuales dependen exclusivamente de reporte humano. Se utiliza el modelo preentrenado Threat-Detection-YOLOv8n (HuggingFace) con cuatro clases (armas de fuego, cuchillos, explosiones y granadas), alcanzando un mAP@50 de 81.3%, precision de 84.3% y recall de 76.3% con un threshold de 0.50. La arquitectura integra un backend Flask con Socket.IO para streaming en vivo, un frontend Next.js con dashboard institucional, mapa interactivo del campus con 23 zonas, sistema de reportes con geolocalizacion y un chatbot de bienestar estudiantil. Como trabajo futuro se prioriza una segunda pasada de verificacion por zoom (doble inferencia sobre la region detectada) y el re-entrenamiento del modelo con un dataset ampliado para mejorar el recall en escenas con oclusiones parciales.

---

## Tabla de contenidos

- [Stack tecnologico](#stack-tecnologico)
- [Arquitectura](#arquitectura)
- [Modelo de deteccion](#modelo-de-deteccion)
- [Funcionalidades](#funcionalidades)
- [Requisitos previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Ejecucion](#ejecucion)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [API Reference](#api-reference)
- [Roles y permisos](#roles-y-permisos)
- [Nota de alcance](#nota-de-alcance)

---

## Stack tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Frontend | Next.js (App Router) + React + TypeScript | 16 / 19 |
| Estilos | Tailwind CSS + tema institucional UTADEO | 3.4 |
| Backend | Flask + Flask-SocketIO + Flask-SQLAlchemy | 3.x |
| Auth | JWT (PyJWT) + bcrypt | HS256 |
| Base de datos | PostgreSQL (Docker) | 16 |
| ML / CV | YOLOv8n (Ultralytics) + OpenCV | 8.x |
| Realtime | Socket.IO | 4.8 |
| APIs externas | OpenAI (chatbot), Roboflow (deteccion cloud) | Opcionales |
| Iconos | Lucide React | — |

---

## Arquitectura

```
                         ┌─────────────────────────────────────┐
                         │            Browser                  │
                         └──────┬──────────────┬───────────────┘
                                │              │
                    Next.js :3000          Socket.IO
                                │              │
                ┌───────────────▼──┐    ┌──────▼───────────────┐
                │  Next.js API     │    │  Flask :5000          │
                │  /api/chat       │    │  YOLOv8 + OpenCV      │
                │  /api/detect     │    │  Auth (JWT + bcrypt)   │
                │  /api/reports    │    │  Reports CRUD          │
                └────────┬────────┘    │  Admin panel           │
                         │             │  Socket.IO server      │
                  ┌──────▼──────┐      └──────────┬────────────┘
                  │  OpenAI     │                  │
                  │  Roboflow   │          ┌───────▼───────┐
                  │ (opcional)  │          │ PostgreSQL    │
                  └─────────────┘          │ :5433         │
                                           └───────────────┘
```

**Dos backends conviven:**

1. **Next.js API routes** — proxy a OpenAI (chat) y Roboflow (deteccion cloud). Compatible con Vercel.
2. **Flask backend** — auth, reportes, admin, y el **detector YOLO en vivo via Socket.IO**. Requiere host con proceso persistente (Railway, Render, Fly.io).

---

## Modelo de deteccion

| Propiedad | Valor |
|-----------|-------|
| Modelo | [Threat-Detection-YOLOv8n](https://huggingface.co/Subh775/Threat-Detection-YOLOv8n) |
| Arquitectura | YOLOv8 nano (3.2M params) |
| Clases | `Gun`, `Knife`, `Explosion`, `Grenade` |
| mAP@50 | **81.3%** |
| Precision | **84.3%** |
| Recall | **76.3%** |
| Threshold | 0.50 (configurable) |
| Inferencia | Cada 3 frames, ~30 FPS objetivo |

**Colores de bounding box:**
- Rojo — armas de fuego
- Rojo oscuro — explosivos
- Amarillo — cuchillos

---

## Funcionalidades

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| Dashboard | `/` | Bento grid responsivo con metricas en vivo, salud del sistema, actividad por zona |
| Detector | `/detector` | Streaming de camara con deteccion YOLO en tiempo real y alertas sonoras |
| Reportar | `/reportar` | Formulario con geolocalizacion, foto, enriquecimiento post-envio |
| Mapa | `/mapa` | 23 zonas interactivas del campus UTADEO con conteo de reportes |
| Chat | `/chat` | Chatbot de bienestar estudiantil (OpenAI o modo demo) |
| Ayuda | `/ayuda` | Hub de ayuda, rutas de bienestar y protocolo de reportes |
| Rutas | `/rutas` | Navegacion y rutas del campus |
| Admin | `/admin/reports` | Gestion de reportes (rol admin+) |
| Usuarios | `/admin/users` | Gestion de usuarios (rol superadmin) |
| Ajustes | `/ajustes` | Dark mode, tamano de fuente, version del sistema |
| Login | `/login` | Autenticacion |
| Registro | `/register` | Registro de usuarios |

**Caracteristicas clave:**
- **Modo demo** — funciona sin API keys externas con respuestas simuladas
- **Dark mode** — toggle global con paleta optimizada para legibilidad
- **Alertas persistentes** — la alerta permanece mientras el arma este visible en camara
- **Geolocalizacion** — deteccion automatica de zona del campus al reportar

---

## Requisitos previos

- **Node.js** 18+
- **Python** 3.11+
- **Docker** (para PostgreSQL)
- **Camara web** (para deteccion en vivo)

---

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

# 5. Descargar el modelo YOLO (~6 MB)
pip install huggingface_hub
python -c "from huggingface_hub import hf_hub_download; import shutil; shutil.copy2(hf_hub_download('Subh775/Threat-Detection-YOLOv8n','weights/best.pt'), 'models/best.pt')"
```

---

## Ejecucion

```bash
# Opcion 1: Todo junto (recomendado)
npm run dev:db       # Levantar PostgreSQL (una vez)
npm run dev:all      # Next.js + Flask en paralelo

# Opcion 2: Por separado (3 terminales)
npm run dev:db       # PostgreSQL en :5433
npm run dev:flask    # Flask en http://localhost:5000
npm run dev          # Next.js en http://localhost:3000
```

| Comando | Que hace |
|---------|----------|
| `npm run dev` | Next.js en puerto 3000 |
| `npm run dev:flask` | Flask + Socket.IO en puerto 5000 |
| `npm run dev:db` | PostgreSQL (Docker) en puerto 5433 |
| `npm run dev:all` | Next.js + Flask en paralelo (concurrently) |
| `npm run build` | Build de produccion de Next.js |
| `npm run lint` | ESLint |

---

## Variables de entorno

### Frontend (`.env.local` en la raiz)

```bash
# Ambas opcionales — sin ellas la app funciona en modo demo
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
ROBOFLOW_API_KEY=...
ROBOFLOW_MODEL_ID=weapon-detection-using-yolov8/1
NEXT_PUBLIC_FLASK_URL=http://localhost:5000
```

### Backend (`backend/.env`)

```bash
SECRET_KEY=tu-clave-secreta-segura
DATABASE_URL=postgresql://safecampus:safecampus123@localhost:5433/safecampus
CONFIDENCE_THRESHOLD=0.50
MAX_HISTORY=50
CAMERA_INDEX=0
FRAME_SKIP=3
ALERT_COOLDOWN=10
CLEAN_FRAMES_TO_CLEAR=20
```

---

## Estructura del proyecto

```
safecampus-ai/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Dashboard (/)
│   ├── layout.tsx              # Root layout + providers
│   ├── globals.css             # Tema UTADEO + dark mode
│   ├── detector/page.tsx       # Detector YOLO en vivo
│   ├── reportar/page.tsx       # Formulario de reportes
│   ├── mapa/page.tsx           # Mapa interactivo del campus
│   ├── chat/page.tsx           # Chatbot de bienestar
│   ├── ajustes/page.tsx        # Configuracion del usuario
│   ├── rutas/page.tsx          # Rutas del campus
│   ├── ayuda/                  # Paginas de ayuda
│   ├── admin/                  # Panel de administracion
│   ├── login/page.tsx          # Autenticacion
│   ├── register/page.tsx       # Registro
│   └── api/                    # API routes (chat, detect, reports)
│
├── backend/                    # Flask + YOLO + Socket.IO
│   ├── app.py                  # Servidor principal + detector YOLO
│   ├── auth.py                 # JWT + bcrypt + decoradores
│   ├── models.py               # SQLAlchemy (User, Report)
│   ├── reports.py              # CRUD de reportes + zonas
│   ├── admin.py                # Panel admin (users CRUD)
│   ├── requirements.txt        # Dependencias Python
│   ├── train_safecampus.ipynb  # Notebook de re-entrenamiento
│   └── models/best.pt          # Modelo YOLO (no incluido, ver instalacion)
│
├── components/                 # Componentes React por feature
│   ├── dashboard/              # Bento grid (9 componentes)
│   ├── detector/               # Detector en vivo + stats
│   ├── mapa/                   # Mapa SVG + zonas + reportes
│   ├── reportar/               # Form + confirmacion + enriquecimiento
│   ├── chat/                   # Chat + historial de reportes
│   ├── auth/                   # AuthContext + formularios
│   └── shared/                 # MetricCard, StatusCard, DashboardStats
│
├── lib/                        # Constantes, tipos, utilidades
│   ├── types.ts                # Tipos TypeScript compartidos
│   ├── constants.ts            # URLs y configuracion
│   ├── flask-client.ts         # Cliente HTTP para Flask
│   ├── geo-utils.ts            # Geolocalizacion + deteccion de zona
│   └── data/utadeo-zones.json  # 23 zonas del campus
│
├── hooks/                      # Custom hooks
│   ├── useAlertSound.ts        # Sonido de alerta
│   └── useZoneReports.ts       # Reportes por zona (Socket.IO)
│
├── public/                     # Assets estaticos
│   ├── cabito.png              # Mascota principal
│   ├── mascot-*.png            # 8 variantes de Cabito
│   └── alert.mp3               # Sonido de alerta
│
├── middleware.ts               # Auth gate (rutas protegidas + roles)
├── docker-compose.yml          # PostgreSQL 16
├── next.config.mjs             # Proxy /flask/* → localhost:5000
├── tailwind.config.ts          # Paleta UTADEO
└── package.json                # Scripts npm
```

---

## API Reference

### Flask Backend (`:5000`)

#### Autenticacion
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/auth/register` | Registrar usuario |
| `POST` | `/auth/login` | Iniciar sesion → JWT |
| `GET` | `/auth/me` | Obtener usuario actual |

#### Reportes
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/reports` | Crear reporte (multipart) |
| `GET` | `/reports` | Listar reportes (admin: todos, user: propios) |
| `GET` | `/reports/by-zone` | Conteo por zona |
| `PATCH` | `/reports/:id/enrich` | Enriquecer reporte (foto, prioridad) |
| `PATCH` | `/reports/:id` | Actualizar estado (admin) |

#### Detector
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/api/start` | Iniciar camara + YOLO |
| `POST` | `/api/stop` | Detener camara |
| `GET` | `/api/stats` | Estadisticas de deteccion |
| `GET` | `/api/status` | Estado del sistema |
| `GET` | `/video_feed` | Stream MJPEG con bounding boxes |

#### Socket.IO Events
| Evento | Direccion | Payload |
|--------|-----------|---------|
| `new_detection` | Server → Client | `{class, confidence, timestamp}` |
| `alert` | Server → Client | `{type, label, confidence, timestamp}` |
| `alert_clear` | Server → Client | `{}` |
| `stats_update` | Server → Client | `{total_detections, guns, knives, explosives, ...}` |
| `new_zone_report` | Server → Client | `{zone_id, zone_name, priority}` |

### Next.js API Routes (`:3000`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/api/chat` | Proxy a OpenAI (o modo demo) |
| `POST` | `/api/detect` | Proxy a Roboflow (o modo demo) |
| `POST` | `/api/reports/upload` | Proxy a Flask para subir reportes |

---

## Roles y permisos

| Rol | Acceso |
|-----|--------|
| `user` | Dashboard, reportar, mapa, chat, ayuda, ajustes |
| `admin` | Todo lo anterior + detector en vivo + gestion de reportes |
| `superadmin` | Todo lo anterior + gestion de usuarios |

---

## Paleta de colores

El diseno sigue la identidad visual de la Universidad Jorge Tadeo Lozano:

| Color | Hex | Uso |
|-------|-----|-----|
| Azul UTADEO | `#003A70` | Headers, branding principal |
| Cyan UTADEO | `#00C9DB` | Acentos, botones CTA, links en dark mode |
| Verde UTADEO | `#78BE20` | Acciones positivas, exito |
| Ink | `#1D252D` | Texto principal |
| Paper | `#F6F8FA` | Fondos claros |

---

## Nota de alcance

Esta aplicacion es un **MVP academico demostrativo**. No reemplaza atencion psicologica, seguridad institucional ni servicios de emergencia. La deteccion por vision por computador **requiere validacion humana** en todo momento.

---

## Licencia

Proyecto academico — Universidad Jorge Tadeo Lozano, 2026.
