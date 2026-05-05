Levanta el entorno completo de SafeCampus. Necesitas **3 procesos** en terminales separadas (no hay un único `docker compose up`).

## Prerequisitos (una vez)
- Docker Desktop corriendo (para Postgres)
- Python 3.10+ con `.venv` creado en `backend/.venv`
- `backend/models/best.pt` descomprimido desde `best.pt.zip`
- `.env.local` en raíz (OpenAI/Roboflow opcionales) y `backend/.env` (SECRET_KEY, DATABASE_URL)
- `npm install` ejecutado

## Arranque

**Terminal 1 — Postgres**
```bash
npm run dev:db
# Postgres :5433  user=safecampus  pass=safecampus123  db=safecampus
```

**Terminal 2 — Flask + Socket.IO + YOLO**
```bash
npm run dev:flask
# = cd backend && .venv\Scripts\python.exe app.py
```
Verifica en consola: `[INFO] Modelo YOLO cargado` o equivalente.

**Terminal 3 — Next.js**
```bash
npm run dev
# http://localhost:3000
```

## Atajo (sin Postgres)
```bash
npm run dev:all
# concurrently next + flask, NO levanta db
```

## Validación rápida
- `http://localhost:3000` → landing carga
- `/login` → autentica contra Flask
- `/detector` → conecta Socket.IO y muestra frames
- `/chat` → responde (modo demo si no hay OPENAI_API_KEY)
