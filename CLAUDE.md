# SafeCampus AI

> CLAUDE.md generado a partir del análisis del proyecto existente.
> Fecha: 2026-05-05
> Basado en: 12 commits, ~50 archivos relevantes, 0 tests existentes
> Equipo: Sergio (sergioaza) + Jesús — ambos sobre rama `main`
> Onboarding nuevo dev: ver `ONBOARDING-JESUS.md`
> Workflow del dúo: ver `workflow-claude-code-proyecto-existente.md`

## Agentes disponibles (`.claude/agents/`)

- **`Frontend SafeCampus (Next.js)`** — pages, componentes, Tailwind/Utadeo, Socket.IO client
- **`Backend SafeCampus (Flask)`** — endpoints, JWT, SQLAlchemy, panel admin
- **`Detector YOLOv8 SafeCampus`** — `best.pt`, OpenCV, threshold, Socket.IO server
- **`Code Reviewer SafeCampus`** — auditoría pre-commit/push (sustituye PR review)
- **`Testing Bootstrap SafeCampus`** — montar Vitest + pytest, ir cubriendo coverage
- **`Deploy & DevOps SafeCampus`** — Dockerfile Flask, Railway/Render, CI, hardening

MVP demostrativo de plataforma de seguridad universitaria (Universidad Jorge Tadeo Lozano). Combina detección de armas en vivo (YOLOv8), chatbot de salud mental y convivencia (OpenAI), reportes discretos con foto, y panel admin con roles. **No reemplaza atención psicológica ni servicios de emergencia.** La detección por CV requiere validación humana siempre.

## Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript | `tsconfig.json` strict |
| Estilos | Tailwind CSS 3.4 + `globals.css` | Tema Utadeo: azul #003A70, cyan #00C9DB, verde #78BE20, ink #1D252D, paper #F6F8FA |
| Iconos | `lucide-react` | Único set permitido |
| Realtime FE | `socket.io-client` 4.8 | Para detector en vivo |
| Backend | Flask + Flask-SQLAlchemy + Flask-SocketIO + Flask-CORS | `async_mode="threading"` |
| Auth | JWT (PyJWT) + bcrypt | Roles: `user / admin / superadmin` |
| BD | PostgreSQL 16 (Docker) en puerto **5433** | Schema en `backend/models.py`, sin Alembic |
| ML | `ultralytics` (YOLOv8n) + OpenCV + `best.pt` (HuggingFace `Subh775/Threat-Detection-YOLOv8n`, 4 clases) | También Roboflow Cloud desde Next API |
| Externos | OpenAI (`gpt-4o-mini` por defecto), Roboflow Universe | Ambos opcionales — modo demo si faltan |

## Arquitectura

Dos backends conviven:

1. **Next.js API routes** (`app/api/*`) — proxy ligero a OpenAI (`/api/chat`) y Roboflow (`/api/detect`). Pueden vivir en Vercel.
2. **Flask backend** (`backend/app.py`) — auth, persistencia, reportes, panel admin, **stream YOLO en vivo vía Socket.IO**. **No serverless** — necesita host con proceso persistente.

```
[Browser]
   ├─ Next pages (app/) ─▶ Next API routes (Vercel) ─▶ OpenAI / Roboflow
   └─ Socket.IO client  ─▶ Flask + YOLOv8 local (best.pt) ─▶ Postgres :5433
```

## Estado actual (2026-05-11)

- Auth con JWT y roles implementado (`backend/auth.py`)
- Detector de armas funcional con bounding boxes corregidos (commit `284c681`)
- **Detector estilo unificado** — tema oscuro CCTV reemplazado por tema claro institucional UTADEO (`97bb3ed`)
- Reportes con foto persistidos en `backend/uploads/`
- Mascota Cabito y páginas de ayuda integradas
- 34 bugs corregidos en una pasada (commit `1aa4bd4`)
- **Mapa interactivo** `/mapa` con 23 zonas SVG del campus (OpenStreetMap), reportes por zona, SocketIO en tiempo real
- **Dashboard Bento Grid** `/` rediseñado (commit `f9559e6`): bento responsivo con datos reales, cards condicionales por rol
- **Reportar** `/reportar` con GPS, confirmación post-envío y enriquecimiento (`92494e7`)
- **Documentación completa** — informe técnico LaTeX/PDF/DOCX + 15 diagramas UML/arquitectura renderizados en PNG/SVG (`d9a4e14`)
- **UI rediseñada** — tema cyan, animaciones stagger/page-transition, login/register glassmorphism, skeleton loading (`f7e44a3`)
- **Ajustes** `/ajustes` con dark mode (toggle), tamaño de fuente (3 niveles), versión, firma MagnorTech (`b533cf1`)
- **Limpieza de código** — eliminados: constante muerta `FLASK_API_REPORTS_DIRECT`, 4 console.error de debug, `serverExternalPackages: []`, paleta CCTV completa de Tailwind
- **Modelo YOLO activo** — `Threat-Detection-YOLOv8n` (HuggingFace `Subh775/Threat-Detection-YOLOv8n`). Clases: Gun, knife, explosion, grenade. mAP@50=81.3%. Threshold 0.50. Frontend con categoría "Explosivos" en stats/dashboard/detector.
- **Re-entrenamiento fallido y revertido (2026-05-11)** — YOLOv8s entrenado en Colab se interrumpió (epoch:-1, best_fitness:None). Modelo resultante peor que el original. Se revirtió a HuggingFace. Notebook reescrito con mejores hiperparámetros (`gun_knife_v3`): epochs=150, batch=-1 (AutoBatch), patience=50, cos_lr=True, close_mosaic=15, augmentaciones ajustadas para CCTV. Celda de emergencia para resume. Listo para segundo intento.
- **FIX: Cámara no reiniciaba sin recargar página** — `backend/app.py` `start_camera()`: si `camera.isOpened()` pero `_stop_event.is_set()`, libera cámara residual en vez de retornar 409. También resetea `_diagnostic_done` en start y stop para que el diagnóstico one-shot corra de nuevo.
- **FIX: Alerta desaparecía muy rápido** — `components/detector/useDetectorSocket.ts`: timeout de alerta subido a 8s como fallback. Cada `new_detection` renueva el timer — la alerta persiste mientras el arma siga en cámara. `alert_clear` del backend la limpia de inmediato.
- **FIX: Dark mode — texto azul ilegible** — `app/globals.css`: `text-tadeo-blue` y `text-[#003A70]` se reemplazan por cyan UTADEO (`#00C9DB`) en dark mode. Cubre 22 archivos sin tocar ninguno.
- **Deploy a Vercel (2026-05-11)** — frontend desplegado en `https://safecampus-ai.vercel.app`. Modo demo sin auth: cuando `NEXT_PUBLIC_FLASK_URL` no esta configurada, middleware deja pasar sin JWT y AuthContext simula usuario demo (admin). Backend Flask no desplegado (requiere host con proceso persistente para Socket.IO + camara).
- **README.md profesional (2026-05-11)** — reescrito con header+badges, resumen 150 palabras, arquitectura ASCII, metricas del modelo, API reference completa, roles, paleta UTADEO.
- **.gitignore ampliado** — `*.pt`, `runs/`, `.vercel` excluidos del repo.
- **No hay tests automatizados** — validación manual
- **No hay CI/CD** — `.github/workflows/` no existe

## Revisión Legal (2026-05-09)

Contratos con TAINF S.A.S. revisados (Contrato App Móvil + Contrato Panel + NDA Jesús).
**SafeCampus AI NO viola ninguna cláusula.** La no competencia protege un modelo específico (botón de pánico + B2B ISPs + comunidades por proveedor) que no tiene relación con SafeCampus.
Los contratos excluyen explícitamente: sistemas institucionales, proyectos de seguridad/monitoreo distintos a botón de pánico, y presentaciones en ferias.
**Precaución en la feria**: no mencionar TAINF, AlerTainf, ni mostrar código/datos de ese proyecto.

## Entrega Final — Estado actual

Formulario de entrega universitaria (UTADEO). Estado de cada campo:

| Campo | Estado | Detalle |
|-------|--------|---------|
| Titulo | Listo | SafeCampus AI - Sistema de Deteccion de Armas con IA |
| Resumen | Listo | Parrafo de 150 palabras en README.md |
| Direccion/URL despliegue | Listo | `https://safecampus-ai.vercel.app` (modo demo sin auth) |
| Integrantes (hasta 6) | Por llenar | Sergio + Jesus |
| YouTube | **Pendiente** | Video subido, falta pegar link |
| GitHub | Listo | `https://github.com/Fircrey/SafeCampus.git` |
| Afiche/Poster | **Pendiente** | Disenar poster A1 (PDF/PPT/PPTX, max 5MB) |
| Documento | Listo | PDF del informe (usuario sube manualmente) |

### Tareas pendientes:
1. Pegar link de YouTube en formulario
2. Diseñar y exportar afiche/poster academico A1
3. Llenar formulario de entrega

## Documentación (`docs/`)

- `docs/proyecto/informe_tecnico_safecampus.tex` — Informe técnico completo en LaTeX
- `docs/proyecto/informe_tecnico_safecampus.pdf` — PDF compilado
- `docs/proyecto/informe_tecnico_safecampus.docx` — Versión Word
- `docs/diagramas-arquitectura.md` — Guía con 15 diagramas Mermaid
- `docs/rendered/` — 15 diagramas renderizados (`.mmd`, `.png`, `.svg`):
  - 01: Contexto, 02: Casos de uso, 03: Componentes, 04: Clases UML, 05: ER
  - 06: Navegación, 07-11: Secuencias (login, reportes, detector, chat, admin)
  - 12-13: Estados (reporte, detector), 14: Despliegue, 15: Arquitectura LLM

## Mascota Cabito

Cabito es un **perro cachorro** (NO cabra). Características visuales:
- Pelaje dorado/tan con orejas caídas marrones
- Ojos grandes redondos oscuros, nariz negra, lengua rosa
- Camiseta azul navy con texto "UTADEO"
- Collar rojo con colgante amarillo (gota)
- Estilo: cartoon chibi flat con bordes gruesos (outline)
- Variantes existentes en `public/`: cabito.png, mascot-chat.png (headset), mascot-detector.png (casco+chaleco), mascot-dashboard.png (brazos cruzados), mascot-admin.png, mascot-alertas.png, mascot-rutas.png, mascot-ayuda.png

## .gitignore (actualizado 2026-05-09)

Se excluyen del repo (pero siguen en disco local):
- `docs/` — informe PDF/DOCX/TEX + 15 diagramas renderizados
- `.claude/rules/` — contratos de API, convenciones, reglas de seguridad

## Pendientes / Bugs conocidos

- **BUG: PATCH /reports/<id>/enrich retorna 404** — El endpoint existe en código (`backend/reports.py`) pero Flask corre con `debug=False` y NO auto-recarga. Hipótesis: el usuario no reinició Flask después del deploy del código. Verificar: 1) Reiniciar Flask, 2) Si persiste, revisar que Next.js rewrite `/flask/:path*` pase correctamente PATCH a rutas con sub-paths como `/api/reports/42/enrich`.
- ~~**BUG: POST /api/start retorna 409 "Cámara ya en uso"**~~ — **RESUELTO (2026-05-11)**. `start_camera()` ahora libera cámara residual si `_stop_event.is_set()`.
- **Re-entrenamiento YOLO pendiente** — Notebook reescrito (`backend/train_safecampus.ipynb`, run: `gun_knife_v3`). Antes de ejecutar: borrar `SafeCampus-Training/gun_knife_v2/` de Google Drive. Si el nuevo modelo supera al de HuggingFace (mAP@50 > 0.813), copiar `best.pt` a `backend/models/` y verificar clases vs `GUN_LABELS`/`KNIFE_LABELS`/`EXPLOSIVE_LABELS` en `backend/app.py`.
- **Póster académico** — en progreso para feria universitaria (A1 vertical, prompts de Cabito generados)

## Dashboard (`/`)

- Bento grid responsivo: 1 col (mobile), 2 cols (tablet), 4 cols (desktop)
- Componentes en `components/dashboard/` (9 archivos)
- **Vista admin**: HeroCard con métricas, SystemHealthCard, ReportSummaryCard, ZoneActivityCard, LiveDetectionsCard, QuickLinksGrid
- **Vista usuario**: HeroCard (sin métricas), ZoneActivityCard, QuickLinksGrid
- Hook `useSystemHealth` pollea `/flask/health` cada 30s
- Degradación graceful: si Flask offline, todas las cards muestran fallback sin crashear
- Reutiliza hooks existentes: `useZoneReports`, `useDetectorSocket`, `useAuth`, `hasMinRole`

## Reportar (`/reportar`)

- Flujo: Form (4 campos esenciales) → POST → Pantalla confirmación → Enriquecimiento opcional (PATCH)
- Componentes en `components/reportar/` (ReportForm, ReportConfirmation, ReportarPage, ZoneSelector)
- Geolocalización automática con fallback a selector manual de zonas
- Acepta `?zone=<id>` desde `/mapa` para preseleccionar zona
- Form esencial: descripción, ubicación (zona), tipo, riesgo inmediato
- Post-envío: resumen, banner emergencia (si riesgo=sí), sección expandible "Complementar reporte"
- Enriquecimiento: foto, prioridad, anonimato, contacto → `PATCH /reports/<id>/enrich`
- `/ayuda` apunta directo a `/reportar`; `/ayuda/reportar` redirige a `/reportar`
- Hook `useGeolocation` + `detectZone()` + `isNearCampus()` en `lib/geo-utils.ts`

## Mapa del Campus (`/mapa`)

- SVG puro (sin Leaflet/Mapbox) con 23 zonas del campus UTADEO vía OpenStreetMap
- Datos en `lib/data/utadeo-zones.json`, tipos en `lib/zone-types.ts`
- Componentes en `components/mapa/` (CampusMap, MapSVG, ZoneList, ZoneReportForm, ZoneReportHistory)
- Hook `hooks/useZoneReports.ts` con SocketIO para conteos en tiempo real
- Backend: `GET /api/reports/by-zone` + campos `zone_id`, `zone_name`, `priority` en modelo Report
- **Pendiente**: faltan módulos 7, 7A, 12, 15, 18-23, 26, 30 (no están en OpenStreetMap)

## Variable env clave para conectar FE↔BE

`NEXT_PUBLIC_FLASK_URL=http://localhost:5000` — el frontend la usa para llamar al backend Flask y conectar Socket.IO. **Si no esta seteada** (como en Vercel), el middleware desactiva auth y AuthContext simula un usuario demo con rol admin. En deploy con Flask, apuntar al host real (no Vercel).

## Comandos

```bash
# Setup inicial (una vez)
npm install
cd backend && python -m venv .venv && .venv\Scripts\pip install -r requirements.txt
# Descomprimir best.pt.zip → backend/models/best.pt

# Día a día (3 terminales)
npm run dev:db        # Postgres :5433
npm run dev:flask     # Flask + Socket.IO
npm run dev           # Next :3000
# o:  npm run dev:all  (next + flask, sin db)

# Verificación
npm run lint
npm run build         # asegurar que Next compila
```

## Convenciones

- **Idioma:** español en commits, comentarios, copy de UI. Inglés en código y nombres técnicos.
- **Commits:** `feat:` / `fix:` / `chore:` / `docs:` con scope opcional (`fix(detector): ...`). Agrupar por tarea, no por archivo.
- **Naming:** `camelCase` en TS, `snake_case` en Python. Componentes React en `PascalCase`.
- **Imports:** absolutos desde `@/` para frontend (verificar en `tsconfig.json` paths).
- **Errores:** Flask devuelve `{"error": "...", "detail": "..."}` con status apropiado; Next API routes devuelven `NextResponse.json(...)` con status.
- **Fallback demo:** si falta `OPENAI_API_KEY` o `ROBOFLOW_API_KEY`, la app responde en modo simulado. **No romper este fallback** — habilita demos sin secrets.

## Gotchas Conocidos

1. `best.pt` viene de HuggingFace (`Subh775/Threat-Detection-YOLOv8n`, 6 MB, 4 clases). Descarga: `python -c "from huggingface_hub import hf_hub_download; import shutil; shutil.copy2(hf_hub_download('Subh775/Threat-Detection-YOLOv8n','weights/best.pt'), 'backend/models/best.pt')"`. Requiere `pip install huggingface_hub`. Si se re-entrena con exito en Colab, reemplazar por el nuevo `best.pt` (run `gun_knife_v3`).
2. Socket.IO con threading **no funciona en serverless** — backend necesita Railway/Render/Fly.
3. Postgres en puerto **5433** (no 5432) — colisión local.
4. CORS hardcoded a `localhost:3000/3001` en `backend/app.py` — actualizar al desplegar.
5. `SECRET_KEY` por defecto = `"cambiar-esta-clave"` — **rotar antes de cualquier deploy**.
6. React 19 + `@types/react ^18` → posible drift de tipos.
7. `middleware.ts` en root es el gate de auth de Next — si `NEXT_PUBLIC_FLASK_URL` no esta seteada, deja pasar todo (modo demo). Leerlo antes de tocar rutas.
8. Sin Alembic — cambios de schema se aplican con `db.create_all()`. Schema destructivo requiere drop manual.
9. `MAX_CONTENT_LENGTH = 16 MB` en Flask → fotos grandes rechazadas.
10. `backend/uploads/` no persiste en filesystem efímero (contenedores, serverless).
11. Dos pipelines de detección: Roboflow Cloud (Next) vs YOLO local (Flask). Pueden divergir en clases/labels.
12. Roles enum-string libre en `users.role` — sin constraint a nivel BD.
13. Mapa del campus tiene 23 de ~30+ módulos reales. Faltan M7, M7A, M12, M15, M18-M23, M26, M30 (no mapeados en OSM).
14. Columnas `zone_id`, `zone_name`, `priority` en tabla `reports` requieren ALTER TABLE manual (sin Alembic).

## Reglas de Seguridad para Claude

### PROHIBIDO
- Eliminar el fallback demo (sin keys → respuestas simuladas).
- Commitear `.env.local`, `.env`, `best.pt`, `backend/uploads/*`.
- Hardcodear API keys o `SECRET_KEY`.
- Cambiar el puerto Postgres `5433` sin actualizar `docker-compose.yml` + `DATABASE_URL` por defecto + cualquier doc.
- Romper compatibilidad del frontend con el backend Flask sin coordinar.
- Hacer `git push --force` a `main`.

### REQUIERE CONFIRMACIÓN
- Cambios de schema en `backend/models.py` (no hay migraciones).
- Tocar `middleware.ts` (afecta auth global).
- Cambiar `CONFIDENCE_THRESHOLD` o lógica de detección.
- Reescribir `backend/app.py` (carga del modelo YOLO, Socket.IO).
- Añadir dependencias pesadas (impacto en imagen / tiempo de build).
- Cualquier `git push` (Sergio y Jesús comparten `main` — coordinar primero).

### LIBRE
- Editar componentes en `components/`, páginas en `app/`.
- Añadir tipos TypeScript.
- Mejorar copy en español respetando tono institucional.
- Añadir tests (no rompe nada porque no hay suite todavía).
- Modificar estilos Tailwind respetando paleta Utadeo.

## Memoria local recomendada

Cada dev mantiene en `~/.claude/projects/<safecampus>/memory/`:
- `user_role.md` — Sergio (full-stack) o Jesús (rol específico)
- `project_architecture.md` — copia de la sección Arquitectura + lo aprendido
- `project_gotchas.md` — los 12 gotchas + nuevos descubrimientos
- `feedback_team_patterns.md` — acuerdos del dúo (cómo coordinan, qué prefiere cada uno)
