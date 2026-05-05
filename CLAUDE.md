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
| Estilos | Tailwind CSS 3.4 + `globals.css` | Tema Utadeo (Pantone 2955 C, amarillo) |
| Iconos | `lucide-react` | Único set permitido |
| Realtime FE | `socket.io-client` 4.8 | Para detector en vivo |
| Backend | Flask + Flask-SQLAlchemy + Flask-SocketIO + Flask-CORS | `async_mode="threading"` |
| Auth | JWT (PyJWT) + bcrypt | Roles: `user / admin / superadmin` |
| BD | PostgreSQL 16 (Docker) en puerto **5433** | Schema en `backend/models.py`, sin Alembic |
| ML | `ultralytics` (YOLOv8) + OpenCV + `best.pt` local | También Roboflow Cloud desde Next API |
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

## Estado actual (2026-05-05)

- Auth con JWT y roles implementado (`backend/auth.py`)
- Detector de armas funcional con bounding boxes corregidos (commit `284c681`)
- Reportes con foto persistidos en `backend/uploads/`
- Mascota Cabito y páginas de ayuda integradas
- 34 bugs corregidos en una pasada (commit `1aa4bd4`)
- **No hay tests automatizados** — validación manual
- **No hay CI/CD** — `.github/workflows/` no existe
- Deploy: README sugiere Vercel (frontend); backend Flask sin pipeline definido

## Variable env clave para conectar FE↔BE

`NEXT_PUBLIC_FLASK_URL=http://localhost:5000` — el frontend la usa para llamar al backend Flask y conectar Socket.IO. En deploy apuntar al host del Flask (no Vercel).

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

1. `best.pt.zip` versionado en root → descomprimir manualmente a `backend/models/best.pt`.
2. Socket.IO con threading **no funciona en serverless** — backend necesita Railway/Render/Fly.
3. Postgres en puerto **5433** (no 5432) — colisión local.
4. CORS hardcoded a `localhost:3000/3001` en `backend/app.py` — actualizar al desplegar.
5. `SECRET_KEY` por defecto = `"cambiar-esta-clave"` — **rotar antes de cualquier deploy**.
6. React 19 + `@types/react ^18` → posible drift de tipos.
7. `middleware.ts` en root es el gate de auth de Next — leerlo antes de tocar rutas.
8. Sin Alembic — cambios de schema se aplican con `db.create_all()`. Schema destructivo requiere drop manual.
9. `MAX_CONTENT_LENGTH = 16 MB` en Flask → fotos grandes rechazadas.
10. `backend/uploads/` no persiste en filesystem efímero (contenedores, serverless).
11. Dos pipelines de detección: Roboflow Cloud (Next) vs YOLO local (Flask). Pueden divergir en clases/labels.
12. Roles enum-string libre en `users.role` — sin constraint a nivel BD.

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
