Checklist antes de pushear o desplegar SafeCampus.

## Antes de `git push origin main`

- [ ] `git pull --rebase` para no pisar trabajo de Jesús/Sergio
- [ ] `npm run lint` pasa
- [ ] `npm run build` compila sin errores
- [ ] Smoke test manual: login + chat + detector + reporte funcionan
- [ ] No commiteaste `.env*`, `best.pt`, `backend/uploads/*`, `__pycache__/`
- [ ] Mensaje de commit en español con prefijo (`feat:` / `fix:` / `chore:`)
- [ ] Si tocaste `models.py`: ¿plan de migración escrito?
- [ ] Si tocaste contratos API: ambos lados (frontend + backend) actualizados
- [ ] Avisaste al otro dev por fuera de git si el cambio es invasivo

## Antes de desplegar a producción

### Frontend (Vercel)
- [ ] `OPENAI_API_KEY`, `ROBOFLOW_API_KEY`, `OPENAI_MODEL`, `ROBOFLOW_MODEL_ID` seteadas en Vercel
- [ ] `NEXT_PUBLIC_FLASK_URL` apuntando al host del Flask backend (NO a Vercel)
- [ ] `next build` local pasa

### Backend (Railway / Render / Fly — NO Vercel)
- [ ] `SECRET_KEY` rotada (32+ bytes random, no el default)
- [ ] `DATABASE_URL` apuntando a Postgres gestionado
- [ ] CORS y `cors_allowed_origins` (Socket.IO) ampliados con dominio Vercel
- [ ] `best.pt` desplegado vía storage externo o build asset (no del repo)
- [ ] HTTPS forzado, headers básicos de seguridad
- [ ] Healthcheck endpoint añadido (recomendado: `/health`)
- [ ] Política para `backend/uploads/` resuelta (S3 / volumen persistente / cifrado)

### Postgres
- [ ] Backup configurado
- [ ] `db.create_all()` corrido al menos una vez (sin Alembic)
- [ ] Usuario superadmin creado

### Verificación post-deploy
- [ ] Login con cuenta test funciona
- [ ] Chat responde (modo real, no demo)
- [ ] Detector conecta Socket.IO sin errores CORS
- [ ] Crear reporte con foto persiste correctamente
