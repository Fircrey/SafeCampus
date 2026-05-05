# Security — SafeCampus

> Reglas mínimas para no romper auth, exponer secrets ni perder el modo demo.

## Secrets

| Variable | Dónde | Notas |
|---|---|---|
| `OPENAI_API_KEY` | `.env.local` (raíz) | Opcional → modo demo si falta |
| `ROBOFLOW_API_KEY` | `.env.local` (raíz) | Opcional → modo demo si falta |
| `OPENAI_MODEL` | `.env.local` | Default `gpt-4o-mini` |
| `ROBOFLOW_MODEL_ID` | `.env.local` | Default `weapon-detection-using-yolov8/1` |
| `SECRET_KEY` | `backend/.env` | **Rotar antes de prod** — default = `"cambiar-esta-clave"` |
| `DATABASE_URL` | `backend/.env` | Default Postgres local :5433 |
| `CONFIDENCE_THRESHOLD` | `backend/.env` | YOLO, default 0.40 |

**Ninguno** de estos archivos se commitea. `.gitignore` y `.claudeignore` los excluyen.

## Autenticación

- JWT firmado con HS256 + `SECRET_KEY` (PyJWT)
- Passwords con bcrypt (cost factor por defecto)
- Decoradores: `@token_required`, `@admin_required` en `backend/auth.py`
- Token vive en `localStorage` (frontend) — vulnerable a XSS, mitigar evitando inyección de HTML no sanitizado

## CORS

Configurado en `backend/app.py`:
```python
CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"])
socketio = SocketIO(app, cors_allowed_origins=[...])  # lista SEPARADA
```

Al desplegar, **ampliar AMBAS listas** con el dominio de producción. **Nunca usar `*`** porque hay `supports_credentials=True`.

## Validación

- Todo input de usuario: validar tipo, longitud, formato (email regex, role ∈ `{user, admin, superadmin}`)
- Uploads: respetar `MAX_CONTENT_LENGTH = 16 MB` y validar mimetype
- No confiar en `is_anonymous` del cliente para decidir si guardar `user_id` — derivarlo del token

## Modo demo (regla cultural)

Si falta una API key externa, la app **debe** seguir funcionando con respuestas simuladas:
- `app/api/chat/route.ts` → eco simulado
- `app/api/detect/route.ts` → `demoDetections()`
- `backend/app.py` → si `best.pt` no carga, log warning + modo simulado (no crash)

**Romper este fallback es un bug bloqueante.**

## Riesgos abiertos (deuda)

1. Sin rate limiting en `/auth/login` — vulnerable a brute force
2. Sin audit log de acciones admin
3. `SECRET_KEY` por defecto es público (está en este código)
4. Token JWT sin expiración configurable visible (verificar `auth.py`)
5. Sin CSP headers
6. Sin política de retención para `backend/uploads/`
7. Fotos de reportes son sensibles — sin cifrado en reposo

## Checklist pre-deploy

- [ ] `SECRET_KEY` rotada y fuerte (32+ bytes random)
- [ ] `OPENAI_API_KEY` y `ROBOFLOW_API_KEY` seteadas en el host
- [ ] CORS ampliado al dominio Vercel
- [ ] `DATABASE_URL` apunta a Postgres gestionado (no localhost)
- [ ] `best.pt` desplegado vía storage externo (no del repo)
- [ ] Backend en host con proceso persistente (Railway/Render/Fly), no Vercel
- [ ] HTTPS forzado, headers de seguridad básicos
- [ ] `WHATSAPP_MOCK_MODE` o equivalentes apagados (si aplica)
