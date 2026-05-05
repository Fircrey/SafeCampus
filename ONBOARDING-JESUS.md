# Onboarding Jesús — SafeCampus AI

> Guía de incorporación personalizada para Jesús. Sergio ya hizo el reconocimiento del proyecto y dejó toda la configuración compartida en el repo. Tú llegas con el camino allanado.

## En 30 minutos

### 1. Clonar y actualizar
```bash
git clone <url-del-repo> SafeCampus
cd SafeCampus
git pull origin main
```

Con esto ya tienes:
- `CLAUDE.md` — doc principal del proyecto
- `.claude/agents/` — 6 agentes especializados (ver lista abajo)
- `.claude/rules/` — convenciones, contratos API, seguridad
- `.claude/commands/` — `/dev`, `/lint`, `/deploy-checklist`
- `.claude/skills/safecampus-detector-smoke/` — validación del detector
- `workflow-claude-code-proyecto-existente.md` — el workflow que seguimos
- `ONBOARDING-JESUS.md` — este archivo

### 2. Setup local
```bash
# Frontend
npm install

# Backend
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
cd ..

# Modelo YOLO
# Descomprimir best.pt.zip en la raíz → backend/models/best.pt
```

### 3. Variables de entorno

Crea `.env.local` en la raíz (puede quedar vacío para modo demo):
```bash
# Opcional — si no las pones, la app cae a modo demo
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
ROBOFLOW_API_KEY=
ROBOFLOW_MODEL_ID=weapon-detection-using-yolov8/1
```

Crea `backend/.env`:
```bash
SECRET_KEY=cambiar-esta-clave-local
DATABASE_URL=postgresql://safecampus:safecampus123@localhost:5433/safecampus
CONFIDENCE_THRESHOLD=0.40
LOG_LEVEL=INFO
```

### 4. Levantar todo (3 terminales)
```bash
npm run dev:db        # T1 — Postgres :5433
npm run dev:flask     # T2 — Flask + YOLO + Socket.IO
npm run dev           # T3 — Next.js :3000
```

Verifica:
- `http://localhost:3000` carga
- `/login` funciona
- `/detector` conecta vía Socket.IO
- `/chat` responde (en modo demo si no pusiste OPENAI_API_KEY)

### 5. Setup de Claude Code personal

Tu `.claude/settings.local.json` es **personal y NO se commitea** (ya está en `.gitignore`). Cópialo del de Sergio si te lo pasa, o créalo vacío:

```json
{
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

Claude Code te irá pidiendo permisos a medida que use herramientas.

### 6. Tu memoria local (privada)

Crea en `~/.claude/projects/<safecampus-project-id>/memory/`:

**`MEMORY.md`** (índice):
```markdown
- [Mi rol](user_role.md) — qué hago en SafeCampus
- [Onboarding](user_onboarding.md) — fecha de incorporación, deadlines
```

**`user_role.md`**:
```markdown
---
name: Mi rol en SafeCampus
description: Qué hago en este proyecto y con qué tecnologías estoy más cómodo
type: user
---

Soy Jesús, dev en SafeCampus AI junto con Sergio.
- Áreas en las que trabajo: <frontend / backend / detector / panel admin>
- Stack en el que me siento más fuerte: <...>
- Stack que estoy aprendiendo: <...>
```

(Edítalo con la verdad — esto solo lo ve tu instancia de Claude Code.)

## Los 6 agentes disponibles

Cuando trabajes con Claude Code en este repo, puedes invocar cualquiera de estos:

| Agente | Usalo cuando trabajes en... |
|---|---|
| **`Frontend SafeCampus (Next.js)`** | Páginas en `app/`, componentes, formularios, Socket.IO client, paleta Utadeo |
| **`Backend SafeCampus (Flask)`** | Endpoints en `backend/`, JWT, SQLAlchemy, panel admin |
| **`Detector YOLOv8 SafeCampus`** | Modelo `best.pt`, OpenCV, threshold, bounding boxes, eventos `frame`/`alert` |
| **`Code Reviewer SafeCampus`** | ANTES de cada commit/push — audita el diff contra reglas del proyecto |
| **`Testing Bootstrap SafeCampus`** | Para añadir Vitest / pytest e ir cubriendo coverage (hoy 0 tests) |
| **`Deploy & DevOps SafeCampus`** | Dockerfile, Railway/Render, CI/CD, hardening pre-prod |

Claude Code los detecta automáticamente desde `.claude/agents/`. Puedes pedirle: *"usa el agente de detector para revisar este cambio"*.

## Las 3 reglas que vas a leer todo el tiempo

- **`.claude/rules/api-contracts.md`** — todos los endpoints Flask + API routes Next + eventos Socket.IO
- **`.claude/rules/conventions.md`** — naming, commits, idioma, estructura
- **`.claude/rules/security.md`** — secrets, fallback demo, checklist pre-deploy

## Convenciones del dúo (importantes)

1. **Compartimos `main`.** No hay `Dev-Jesus` / `Dev-Sergio` por ahora. Antes de pushear:
   - `git pull --rebase origin main`
   - Avisar al otro si el cambio es invasivo (toca `models.py`, `middleware.ts`, `app.py`, contratos API)
2. **Commits en español** con prefijo: `feat:`, `fix:`, `chore:`, `docs:` (con scope opcional, ej: `fix(detector): ...`).
3. **Modo demo es feature, no bug.** Si rompes el fallback (sin keys → respuestas simuladas), es bloqueante.
4. **No commitear:** `.env*`, `best.pt`, `backend/uploads/*`, `node_modules/`, `.venv/`.
5. **Antes de cada push:** correr `npm run lint` + `npm run build` + smoke test manual.

## Antes de tocar código

Si el cambio toca alguna de estas zonas, leer el agente correspondiente PRIMERO:

| Cambio | Agente a invocar |
|---|---|
| `app/`, `components/`, estilos | `Frontend SafeCampus` |
| `backend/auth.py`, `backend/admin.py`, `backend/reports.py` | `Backend SafeCampus` |
| `backend/app.py` (modelo, Socket.IO, threshold) | `Detector YOLOv8` |
| `backend/models.py` (schema) | `Backend SafeCampus` + confirmar con Sergio (sin Alembic) |
| `middleware.ts` | `Frontend SafeCampus` (afecta auth global) |
| Añadir tests | `Testing Bootstrap` |
| Dockerfile, deploy, CI | `Deploy & DevOps` |

## Tu primera contribución segura (sugerida)

Recomendado para arrancar:
- Añadir un test del fallback demo en `app/api/chat/route.ts` (con `Testing Bootstrap`)
- O un endpoint `/health` en Flask (con `Backend SafeCampus`)
- O documentar un gotcha que descubras en `CLAUDE.md`

Evita en tu primer PR:
- Reorganizar carpetas
- Cambiar dependencias mayores
- Tocar `middleware.ts` o `models.py`

## Si algo no queda claro

1. Revisa `CLAUDE.md` (visión general)
2. Revisa el agente del área que tocas
3. Revisa `workflow-claude-code-proyecto-existente.md` (workflow del dúo)
4. Pregúntale a Sergio por los acuerdos no escritos

¡Bienvenido al dúo! 🤝
