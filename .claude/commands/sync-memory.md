Protocolo a correr DESPUÉS de cada `git pull` o cuando arrancas una sesión nueva. Asegura que tu instancia de Claude Code está alineada con la memoria compartida más reciente.

## Pasos

1. **Releer la memoria compartida del repo** (puede haber cambiado):
   - `CLAUDE.md` (estado, gotchas, reglas)
   - `.claude/agents/` (¿hay agentes nuevos o modificados?)
   - `.claude/rules/api-contracts.md` (¿cambiaron endpoints o eventos Socket.IO?)
   - `.claude/rules/security.md` (¿nuevos riesgos o reglas?)
   - `.claude/rules/conventions.md` (¿cambió la convención de commits/naming?)

2. **Revisar git log desde el último pull:**
   ```bash
   git log --oneline -10
   ```
   Identificar commits que afectan: schema (`models.py`), contratos API, middleware, modelo YOLO, deps.

3. **Verificar deuda técnica nueva:** buscar `TODO`, `FIXME`, `HACK` en el diff reciente.

4. **Actualizar mi memoria local** (`~/.claude/projects/<safecampus>/memory/`):
   - Si encontré un patrón nuevo no documentado → guardar como `feedback`.
   - Si entendí el POR QUÉ de un cambio del otro dev → guardar como `project`.
   - Si una memoria contradice el estado actual → actualizarla o eliminarla.

5. **Verificar entorno local:**
   - ¿Hay deps nuevas? → `npm install` y/o `pip install -r backend/requirements.txt`
   - ¿Cambió `models.py`? → puede requerir drop de tablas + `db.create_all()`
   - ¿Cambió `.env.example` o `backend/.env.example`? → actualizar mis `.env*` locales

6. **Smoke test rápido:**
   - `npm run dev:db` → Postgres responde
   - `npm run dev:flask` → backend arranca sin errores, modelo YOLO carga
   - `npm run dev` → Next compila
   - `curl http://localhost:5000/health` → responde `200 ok`

## Salida esperada

Reporte breve:
```
Sync memory — <fecha>
- Commits nuevos: N (resumen 1-2 líneas)
- Cambios relevantes: <archivos clave que mutaron>
- Memoria local actualizada: <qué guardé/eliminé>
- Entorno: <ok / requiere acción>
```

Si algo falla en el paso 6, no continuar con trabajo nuevo hasta resolverlo.
