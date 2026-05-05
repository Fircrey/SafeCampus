# API Contracts — SafeCampus

> Snapshot 2026-05-05. Mantener actualizado cuando cambien endpoints.

## Flask backend (`http://localhost:5000` por defecto)

### Health
- `GET /` → `{status, service}` — ping básico
- `GET /health` → `{status, service, checks: {database, model_loaded, detector_running}}` — 200 si DB ok, 503 si no

### Auth (`backend/auth.py`)
- `POST /auth/register` → `{email, name, password}` → `{user, token}` | 409 si email duplicado
- `POST /auth/login` → `{email, password}` → `{user, token}` | 401 inválido
- `GET  /auth/me` (Bearer) → `User`
- `POST /auth/logout` (Bearer) — opcional, JWT es stateless

### Reports (`backend/reports.py`)
- `POST /reports` (Bearer opcional) → multipart con `type_description, location, immediate_risk, contact_preference, is_anonymous, photo` → `Report`
- `GET  /reports` (Bearer admin) → `[Report]`
- `PATCH /reports/<id>` (Bearer admin) → `{status, notes}` → `Report`
- `GET  /reports/<id>/photo` (Bearer admin) → archivo binario

### Admin (`backend/admin.py`)
- `GET    /admin/users` (Bearer admin)
- `PATCH  /admin/users/<id>` (Bearer admin) → `{role?, is_active?}`
- `DELETE /admin/users/<id>` (Bearer superadmin)

### Socket.IO events (mismo host Flask)
**Cliente → servidor:**
- `start_detection` — inicia captura de cámara
- `stop_detection`

**Servidor → cliente:**
- `frame` — `{image: base64, timestamp, detections: [...]}`
- `alert` — `{class, confidence, x, y, width, height, timestamp}`
- `detector_status` — `{running, model_loaded, fps}`

## Next.js API routes (`http://localhost:3000/api/*`)

### `POST /api/chat`
- Body: `{messages: [{role, content}], context?}`
- Sin `OPENAI_API_KEY`: devuelve respuesta simulada con `mode: "demo"`
- Con key: proxy a OpenAI (`OPENAI_MODEL` o `gpt-4o-mini`)

### `POST /api/detect`
- Body: `{image: dataURL}`
- Sin `ROBOFLOW_API_KEY`: `{mode: "demo", modelId, detections: [...]}`
- Con key: `{mode: "roboflow", modelId, detections: [{class, confidence, x, y, width, height}]}`

### `POST /api/reports/upload`
- Proxy hacia Flask `/reports` con la foto

## Reglas

1. **No cambiar shapes sin actualizar ambos lados** del contrato.
2. **Status codes:** 200 OK, 201 creado, 400 validación, 401 no auth, 403 sin permiso, 404, 409 conflicto, 500.
3. **Errores siempre como `{error, detail?}`** — nunca strings sueltas ni HTML.
4. **Bearer token** en `Authorization: Bearer <jwt>`.
5. **Modo demo es feature, no degradación** — siempre devolver 200 con `mode: "demo"`.
