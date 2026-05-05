# Workflow — Incorporarse a un Proyecto Existente con Claude Code

> Plantilla para cuando te unes a un proyecto ya iniciado donde el contexto, estructura y convenciones ya están establecidos.
> Complemento de: `workflow-claude-code-nuevo-proyecto.md`
> Autor: Sergio Aza | Última actualización: 2026-05-05

---

## Aplicación a SafeCampus AI (este repo)

> Anotaciones marcadas como **Aplicado a SafeCampus** indican cómo cada paso aterriza en este proyecto concreto. La plantilla genérica sigue siendo válida para otros repos.

**Stack real de SafeCampus:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 3 / Flask + Flask-SQLAlchemy + Flask-SocketIO + JWT (PyJWT) + bcrypt / PostgreSQL 16 (Docker, puerto 5433) / YOLOv8 vía `ultralytics` + OpenCV + `best.pt` local / OpenAI (`gpt-4o-mini`) y Roboflow Universe (ambos opcionales — caen a modo demo).

**Equipo:** dúo — **Sergio (sergioaza)** y **Jesús**. Solo rama `main`, 12 commits, sin code review formal ni CI/CD. Convención de commits: español, prefijos `feat:` / `fix:` / `chore:`, agrupación por sprint (`fix: corregir 34 bugs`).

---

## Índice

1. [Diferencias clave vs. proyecto nuevo](#diferencias-clave-vs-proyecto-nuevo)
2. [Fase 0 — Reconocimiento](#fase-0--reconocimiento)
3. [Fase 1 — Mapeo del Proyecto](#fase-1--mapeo-del-proyecto)
4. [Fase 2 — Configuración de Claude Code](#fase-2--configuración-de-claude-code)
5. [Fase 3 — Integración al Flujo de Trabajo](#fase-3--integración-al-flujo-de-trabajo)
6. [Fase 4 — Contribución Productiva](#fase-4--contribución-productiva)
7. [Checklist de Onboarding Completo](#checklist-de-onboarding-completo)
8. [Antipatrones al Unirte a un Proyecto](#antipatrones-al-unirte-a-un-proyecto)

---

## Diferencias Clave vs. Proyecto Nuevo

| Aspecto | Proyecto nuevo | Proyecto existente |
|---------|---------------|-------------------|
| CLAUDE.md | Lo creas tú desde cero | Ya puede existir — adaptar, no reescribir |
| Convenciones | Las defines tú | Las descubres y adoptas |
| Agentes | Los diseñas para tu stack | Los adaptas a patrones ya establecidos |
| Specs | Las escribes desde requerimientos | Las escribes respetando backlog existente |
| Decisiones firmes | Las tomas tú | Las entiendes y respetas (o negocias) |
| Memoria local | Parte vacía | Se construye desde la exploración inicial |
| Git | Rama main, historial limpio | Múltiples ramas, historial rico en contexto |
| Tests | Los creas desde cero | Ya existen — entender antes de agregar |
| Deploy | Lo configuras tú | Ya está configurado — entender el pipeline |

**Principio fundamental:** En un proyecto existente, tu primera tarea NO es producir código. Es **comprender** el sistema lo suficiente para no romper lo que ya funciona.

---

## Fase 0 — Reconocimiento

**Objetivo:** Entender el panorama general ANTES de tocar código.

**Duración estimada:** 1-2 horas para proyectos medianos, medio día para proyectos grandes.

### Paso 0.1 — Exploración inicial con Claude Code

Abre Claude Code en el directorio del proyecto y ejecuta esta secuencia:

```
Prompt 1: "Explora este proyecto completo. Lee CLAUDE.md si existe, README,
package.json / pyproject.toml / Cargo.toml, estructura de carpetas, y dame
un resumen de: qué hace, qué stack usa, cómo se levanta, y cuál es el estado actual."
```

**Lo que buscas:**
- ¿Qué tipo de proyecto es? (web app, API, mobile, librería)
- ¿Qué stack usa? (frameworks, lenguajes, BD, deploy)
- ¿Tiene CLAUDE.md o documentación equivalente?
- ¿Cómo se levanta el entorno de desarrollo?
- ¿Hay tests? ¿Cuántos? ¿Pasan?

### Paso 0.2 — Leer el historial de Git

```
Prompt 2: "Lee los últimos 30 commits con git log --oneline.
Identifica: quiénes contribuyen, qué convención de commits usan,
qué áreas del código cambian más, y cuál fue el último cambio significativo."
```

**Lo que buscas:**
- Convención de commits (prefijos, idioma, nivel de detalle)
- Frecuencia de commits (diarios, semanales, en ráfagas)
- Áreas más activas del código
- Si hay ramas por desarrollador (Dev-Nombre) o por feature (feature/xxx)
- Quién es el maintainer principal

> **Lección de AlertaInf:** Las ramas `Dev-Sergio`, `Dev-Jesus`, `Dev-Jhon` revelan un flujo branch-per-developer. Los commits como `feat: S4 COMPLETADA: WhatsApp + FCM + UI Contactos/Perfil + auditoría seguridad` revelan que se agrupan cambios de un sprint completo en commits descriptivos con contexto de fase.

> **Aplicado a SafeCampus:** Solo existe `main` (Sergio + Jesús comparten rama). Historial corto (12 commits) en español, prefijos `feat/fix/chore`. Los commits agrupan cambios grandes por iteración (`fix: corregir 34 bugs + mejoras de calidad y UX`, `fix(detector): corregir bounding boxes desplazados y threshold de confianza`). No hay tags ni releases. Antes de pushear, coordinar con el otro dev por fuera del git para evitar pisarse.

### Paso 0.3 — Identificar la configuración de Claude Code existente

```
Prompt 3: "¿Existe configuración de Claude Code en este proyecto?
Busca: .claude/, CLAUDE.md, .cursorrules, .windsurfrules, o cualquier
archivo de configuración de asistentes de IA. Muéstrame qué hay."
```

**Escenarios posibles:**

| Escenario | Acción |
|-----------|--------|
| CLAUDE.md completo + .claude/ configurado | Leer todo, adaptar tu memoria local |
| CLAUDE.md básico, sin .claude/ | Complementar con agentes y rules propios |
| Solo README, sin config de IA | Crear CLAUDE.md y .claude/ desde la exploración |
| .cursorrules pero no CLAUDE.md | Usar como base para crear CLAUDE.md |
| Nada | Crearlo todo desde cero (ver Fase 2) |

### Paso 0.4 — Levantar el entorno de desarrollo

No avances sin poder correr el proyecto localmente:

1. Instalar dependencias
2. Configurar variables de entorno (copiar `.env.example` → `.env`)
3. Levantar servicios (Docker, BD, etc.)
4. Verificar que el proyecto compila/sirve sin errores
5. Correr tests existentes — **todos deben pasar antes de que toques código**

> **Lección de FinZen:** El `docker-compose.yml` con healthcheck en la BD y hot-reload en frontend/backend permite levantar todo con un comando (`docker compose up --build`). Si el proyecto no tiene esto, documentarlo como deuda técnica.

> **Aplicado a SafeCampus:** No hay un único `docker compose up` que levante todo — Postgres está dockerizado, Flask y Next no. Flujo real:
>
> ```bash
> # 1. Frontend
> npm install
>
> # 2. Backend (entorno Python)
> cd backend
> python -m venv .venv
> .venv\Scripts\pip install -r requirements.txt
> # Descomprimir best.pt.zip → backend/models/best.pt (necesario para YOLO)
>
> # 3. Variables de entorno (.env.local en raíz)
> # OPENAI_API_KEY (opcional → modo demo si falta)
> # ROBOFLOW_API_KEY (opcional → modo demo si falta)
> # backend/.env: SECRET_KEY, DATABASE_URL, CONFIDENCE_THRESHOLD
>
> # 4. Levantar (3 procesos)
> npm run dev:db        # Postgres en :5433
> npm run dev:flask     # Flask + Socket.IO en :5000 (presumido)
> npm run dev           # Next en :3000
> # alternativa: npm run dev:all  (concurrently next+flask, NO levanta db)
> ```
>
> **Deuda técnica documentada:** Flask sin Dockerfile, `dev:all` no incluye Postgres, no hay healthcheck, no hay hot-reload coordinado. Punto a abordar en una iteración futura.

> **Sobre tests (paso 5):** **No aplica a SafeCampus.** No hay suite de tests (ni jest/vitest/pytest en deps). Sustituir por validación manual: `npm run lint` + smoke test (login, detector con webcam, chat con/sin OPENAI_KEY, crear reporte con foto). Crear tests es un objetivo de proyecto, no un prerequisito de onboarding.

### Paso 0.5 — Identificar el estado del proyecto

```
Prompt 4: "Basándote en lo que has leído, dime:
1. ¿Qué funcionalidades están implementadas?
2. ¿Qué está en progreso o pendiente?
3. ¿Hay deuda técnica documentada?
4. ¿Hay issues/bugs conocidos?
5. ¿Cuál es el flujo de deploy?"
```

---

## Fase 1 — Mapeo del Proyecto

**Objetivo:** Construir un modelo mental completo del proyecto antes de contribuir.

### Paso 1.1 — Mapear la arquitectura

```
Prompt 5: "Analiza la arquitectura de este proyecto:
- Cómo fluye una request desde el frontend hasta la BD y de vuelta
- Cómo funciona la autenticación (si existe)
- Cómo se manejan los errores
- Cómo se estructuran los tests
- Cuáles son los entry points principales"
```

Guardar el resultado como memoria local:

```markdown
# project_architecture.md
---
name: Arquitectura del proyecto
description: Flujo de requests, auth, errores, tests, entry points
type: project
---

[Resultado del análisis]
```

### Paso 1.2 — Mapear convenciones de código

```
Prompt 6: "Analiza los patrones de código del proyecto. Lee 3-4 archivos
representativos de cada capa (routers/controllers, services, models,
componentes frontend) e identifica:
- Naming conventions (camelCase, snake_case, etc.)
- Patrones de importación
- Manejo de errores
- Patrones de validación
- Estructura de archivos por módulo
- Patrones de testing"
```

**Lo que buscas vs. lo que asumes:**

| Aspecto | NO asumir | SÍ descubrir |
|---------|-----------|-------------|
| Formateo | Que usan Prettier/Black | Leer `.prettierrc`, `ruff.toml`, `eslint.config` |
| Estructura | Que siguen MVC | Leer cómo organizan realmente las carpetas |
| Tipos | Que usan TypeScript strict | Leer `tsconfig.json` → `strict: true/false` |
| Tests | Que usan Jest | Leer `package.json` scripts, buscar vitest/jest/pytest |
| Imports | Que usan alias `@/` | Leer tsconfig paths o webpack alias |

### Paso 1.3 — Mapear el modelo de datos

```
Prompt 7: "Lee todos los modelos/schemas de la base de datos.
Documenta: entidades, relaciones, constraints, indexes, y
campos calculados vs almacenados."
```

> **Lección de FinZen:** Los campos calculados no almacenados (`current_amount`, `remaining_amount` en metas) son una fuente frecuente de bugs si no se documentan. El `account_id` en pagos de deuda es "transitorio" — llega del router, se usa para actualizar saldo, y se descarta.

> **Aplicado a SafeCampus:** Solo dos tablas (`users`, `reports` en `backend/models.py`). No hay migraciones (Flask-SQLAlchemy crea tablas con `db.create_all()`). Roles enum-string en columna libre: `user | admin | superadmin`. Estados de reporte: `open | reviewing | resolved | false_positive`. **Gotcha:** sin Alembic, cualquier cambio de schema requiere drop manual o migración escrita a mano.

### Paso 1.4 — Mapear contratos API

```
Prompt 8: "Lista todos los endpoints/routes del proyecto con:
método, ruta, parámetros, respuesta esperada, auth requerido."
```

Guardar como rule si no existe: `.claude/rules/api-contracts.md`

### Paso 1.5 — Identificar gotchas y deuda técnica

```
Prompt 9: "Busca en el código: TODO, FIXME, HACK, WORKAROUND,
y cualquier comentario que indique deuda técnica o decisiones temporales.
También busca dependencias con versiones bloqueadas y por qué."
```

Guardar como memoria local:

```markdown
# project_gotchas.md
---
name: Gotchas y deuda técnica
description: Bugs conocidos, workarounds, dependencias bloqueadas, TODOs
type: project
---

[Lista de hallazgos]
```

> **Lección de AlertaInf:** `bcrypt>=4.0.0,<4.1.0` bloqueado por incompatibilidad con passlib. Si no documentas ESTO, alguien va a actualizar bcrypt y romper auth.

> **Lección de Magnor:** 24 gotchas técnicos documentados (Supabase GRANTs, Tiptap SSR, Excalidraw dynamic imports). Cada uno evita horas de debugging para el siguiente desarrollador.

> **Aplicado a SafeCampus — gotchas detectados hoy:**
> 1. **`best.pt` versionado como `.zip` en root** — descomprimir manualmente a `backend/models/best.pt` antes de levantar Flask, o YOLO crashea al cargar.
> 2. **Socket.IO incompatible con serverless** — Flask-SocketIO con `async_mode="threading"` no puede ir a Vercel ni a funciones serverless. El backend necesita un host con proceso persistente (Railway / Render / Fly).
> 3. **OPENAI_API_KEY y ROBOFLOW_API_KEY son opcionales** — la app cae a modo demo (`demoDetections()` en `app/api/detect/route.ts`, eco simulado en chat). **No romper este fallback** — es lo que permite demos sin keys.
> 4. **Postgres en puerto `5433`**, no 5432, por colisión local. Hardcodeado en `docker-compose.yml` y en el `DATABASE_URL` por defecto de `backend/app.py`.
> 5. **CORS hardcodeado a `localhost:3000` y `:3001`** en `backend/app.py` — al desplegar hay que ampliar la lista.
> 6. **`SECRET_KEY` por defecto = `"cambiar-esta-clave"`** — JWT firma con eso si no se setea env. Crítico antes de cualquier deploy.
> 7. **React 19 con `@types/react ^18`** — drift de tipos posible; no asumir compatibilidad estricta de tipos sin probar.
> 8. **`middleware.ts` en root** — Next gate de auth; leer antes de tocar rutas o se rompe la protección.
> 9. **`backend/uploads/`** — fotos de reportes guardadas en filesystem local. No persiste en serverless ni en contenedores efímeros.
> 10. **Sin Alembic ni migraciones** — schema vive solo en `models.py`; cambios destructivos requieren drop manual.
> 11. **`MAX_CONTENT_LENGTH = 16 MB`** en Flask — fotos grandes de reportes serán rechazadas.
> 12. **Roboflow vs YOLO local conviven** — `app/api/detect/route.ts` usa Roboflow Cloud; `backend/app.py` usa `best.pt` con ultralytics. Dos pipelines de detección que pueden divergir.

---

## Fase 2 — Configuración de Claude Code

**Objetivo:** Configurar Claude Code para este proyecto, respetando lo existente.

### Escenario A: El proyecto ya tiene CLAUDE.md y .claude/

**Acción:** No reescribir. Complementar con tu perspectiva.

1. **Leer todo** — CLAUDE.md, agents, rules, commands, specs
2. **Crear memoria local** con tus observaciones (ver Paso 1.1-1.5)
3. **Proponer mejoras** al equipo si detectas gaps (no modificar unilateralmente)
4. **Configurar permisos locales** en `.claude/settings.local.json` (este archivo NO se commitea si ya está en .gitignore)

> **Regla de oro:** La configuración compartida (CLAUDE.md, agents, rules) se modifica por consenso. La memoria local y settings locales son tuyas.

### Escenario B: El proyecto tiene CLAUDE.md básico, sin .claude/

**Acción:** Crear `.claude/` con agentes y rules basados en tu exploración.

1. **Crear agentes** específicos al stack del proyecto (no genéricos)
2. **Crear rules** basadas en los patrones que descubriste en Paso 1.2
3. **Proponer al equipo** incluir `.claude/` en git

> **Aplicado a SafeCampus → Escenario C activo.** Solo existe `.claude/settings.local.json` (permisos personales). No hay `CLAUDE.md`, ni `.claude/agents/`, ni `.claude/rules/`, ni `.claude/commands/`. La acción es crear todo desde cero usando lo descubierto en Fase 0–1. Ver sección final **"Configuración generada para SafeCampus"** para los archivos creados.

### Escenario C: El proyecto no tiene configuración de IA

**Acción:** Crear todo desde cero, pero basándote en evidencia del proyecto.

1. **Crear CLAUDE.md** — usando la información recopilada en Fase 0 y 1
2. **Crear `.claude/`** — estructura completa (agents, rules, commands)
3. **Crear `.claudeignore`**
4. **Proponer al equipo** adoptar la configuración

Template de CLAUDE.md para proyecto existente (diferente al de proyecto nuevo):

```markdown
# [Nombre del Proyecto]

> CLAUDE.md generado a partir del análisis del proyecto existente.
> Fecha de creación: [fecha]
> Basado en: [X commits, Y archivos, Z tests existentes]

## Stack
[Tabla extraída de package.json/pyproject.toml/etc.]

## Arquitectura
[Resultado de tu análisis de Paso 1.1]

## Estado Actual
[Lo que descubriste en Paso 0.5]

## Convenciones de Código
[Patrones reales del proyecto, no ideales — lo que IS, no lo que SHOULD BE]

## Gotchas Conocidos
[De Paso 1.5]

## Comandos
[Cómo se levanta, cómo se testea, cómo se despliega]

## Reglas de Seguridad para Claude
### PROHIBIDO
### REQUIERE CONFIRMACIÓN
### LIBRE
```

**Diferencia crítica:** En un proyecto nuevo, el CLAUDE.md define lo que QUEREMOS. En un proyecto existente, documenta lo que ES. Las convenciones se extraen del código real, no se inventan.

### Configuración de memoria local para onboarding

Crear estos archivos de memoria al incorporarte:

```
~/.claude/projects/[proyecto]/memory/
├── MEMORY.md                          # Índice
├── project_architecture.md            # Paso 1.1
├── project_gotchas.md                 # Paso 1.5
├── project_conventions_discovered.md  # Paso 1.2
├── project_data_model.md              # Paso 1.3
├── user_onboarding_context.md         # Tu rol, qué te asignaron, deadlines
└── feedback_team_patterns.md          # Patrones del equipo que aprendes
```

---

## Fase 3 — Integración al Flujo de Trabajo

**Objetivo:** Adoptar el flujo del equipo, no imponer el tuyo.

### Paso 3.1 — Entender el flujo de branches

Preguntar o descubrir:

| Pregunta | Dónde buscar |
|----------|-------------|
| ¿Branch por developer o por feature? | `git branch -a`, convención de nombres |
| ¿Quién hace merge a main? | Git log de merges |
| ¿Hay code review? | PRs en GitHub, o proceso informal |
| ¿CI/CD automático? | `.github/workflows/`, `vercel.json`, `render.yaml` |
| ¿Se hace squash merge? | Git log (commits de merge vs lineales) |

> **Lección de AlertaInf:** Ramas `Dev-Sergio`, `Dev-Jesus`, `Dev-Jhon` = branch por developer. Cada uno trabaja en su rama y hace merge a main.

> **Aplicado a SafeCampus:** No hay branch-per-dev — Sergio y Jesús comparten `main`. **Esto es deuda de proceso**, no diseño. Sugerencia para el dúo: adoptar `Dev-Sergio` / `Dev-Jesus` como en AlertaInf, o usar `feature/<nombre>` por tarea. Mientras tanto: pull antes de cada sesión, push frecuente, coordinar fuera de git para evitar conflictos. No hay code review formal ni `.github/workflows/`.

### Paso 3.2 — Adoptar la convención de commits del proyecto

**NO imponer tu estilo. Adoptar el existente.**

```
Prompt: "Analiza los últimos 20 commits del proyecto e identifica:
- ¿Usan prefijos? ¿Cuáles?
- ¿En qué idioma son los mensajes?
- ¿Qué nivel de detalle tienen?
- ¿Incluyen referencias a issues/tickets?"
```

Si no hay convención clara, proponer una al equipo (no imponerla silenciosamente).

### Paso 3.3 — Entender el flujo de deploy

```
Prompt: "¿Cómo se despliega este proyecto? Busca:
- Scripts de deploy (Makefile, scripts/)
- Configuración CI/CD (.github/workflows/, vercel.json, Dockerfile)
- Variables de entorno de producción (.env.example vs .env.production)
- ¿El deploy es automático con push o manual?"
```

> **Lección de FinZen:** Push a `origin main` → deploy automático a Vercel (frontend) y Render (backend). Saber esto ANTES de hacer push evita deploys accidentales.

> **Aplicado a SafeCampus:** Frontend → Vercel (manual según README, no automático verificado). Backend Flask → **sin pipeline** todavía. Decisión pendiente: dado que Socket.IO necesita proceso persistente, las opciones son Railway / Render / Fly.io / un VPS. **Vercel NO sirve para el backend.** Variables de prod a setear: `OPENAI_API_KEY`, `ROBOFLOW_API_KEY`, `SECRET_KEY` fuerte, `DATABASE_URL` apuntando a Postgres gestionado, `CONFIDENCE_THRESHOLD`, ampliar `cors_allowed_origins` al dominio Vercel.

### Paso 3.4 — Primera contribución segura

Tu primera contribución debe ser **pequeña, segura, y visible:**

**Buenos primeros cambios:**
- Fix de un bug documentado
- Agregar tests a código sin cobertura
- Mejorar documentación (README, CLAUDE.md)
- Fix de un warning del linter
- Completar un TODO simple

**Malos primeros cambios:**
- Refactorizar la arquitectura
- Cambiar dependencias o versiones
- Modificar el flujo de auth
- Reestructurar carpetas
- "Mejorar" código que funciona sin entender por qué se escribió así

> **Principio:** Ganarte la confianza del equipo con un cambio pequeño y correcto antes de proponer cambios grandes.

---

## Fase 4 — Contribución Productiva

**Objetivo:** Contribuir features completas siguiendo el flujo del proyecto.

### Paso 4.1 — Antes de cada feature

```
1. Verificar backlog — ¿hay specs, issues, o un roadmap que seguir?
2. Leer código relacionado — entender lo que ya existe antes de agregar
3. Verificar tests — ¿qué coverage tiene el área que voy a modificar?
4. Crear spec si no existe — siguiendo el formato del proyecto (no el tuyo)
```

### Paso 4.2 — Durante la implementación

```
1. Seguir patrones existentes — copiar estructura de un módulo similar
2. No "mejorar" código que no estás tocando — scope discipline
3. Correr tests frecuentemente — no acumular deuda
4. Pedir code review al agente antes de commit
```

### Paso 4.3 — Después de cada batch de trabajo

```
1. Tests pasan al 100%
2. Linter limpio
3. Commit con convención del proyecto
4. Actualizar CLAUDE.md si el estado cambió
5. Actualizar memoria local con nuevos aprendizajes
```

### Paso 4.4 — Actualización continua de memoria

A medida que trabajas, tu memoria local crece con:

| Tipo | Ejemplo real | Cuándo guardar |
|------|-------------|----------------|
| Feedback | "En este proyecto, los modals siempre usan Dialog de shadcn, no un componente custom" | Cuando descubres un patrón no documentado |
| Project | "La migración 005 agregó locale/currency, por eso el onboarding pide país" | Cuando entiendes el POR QUÉ de algo |
| Reference | "Los bugs se trackean en GitHub Issues con label 'bug'" | Cuando localizas dónde vive la info |
| Feedback | "El equipo prefiere un PR grande con todo vs. muchos PRs pequeños" | Cuando recibes feedback del equipo |

---

## Checklist de Onboarding Completo

### Día 1 — Reconocimiento (Fase 0)

```markdown
- [ ] Cloné el repo y leí README/CLAUDE.md
- [ ] Identifiqué el stack tecnológico completo
- [ ] Levanté el entorno de desarrollo local
- [ ] Todos los tests existentes pasan
- [ ] Leí los últimos 30 commits para entender actividad reciente
- [ ] Identifiqué quiénes contribuyen y cómo
- [ ] Identifiqué la convención de branches
- [ ] Identifiqué si hay configuración de Claude Code existente
```

**Aplicado a SafeCampus — checklist Día 1 ajustado:**

```markdown
- [x] README leído (no había CLAUDE.md, se crea ahora)
- [x] Stack identificado: Next 16 + React 19 / Flask + SQLAlchemy + Socket.IO + JWT / Postgres 16 / YOLOv8 (ultralytics) + Roboflow / OpenAI
- [ ] best.pt.zip descomprimido en backend/models/best.pt
- [ ] .env.local creado (o asumir modo demo sin keys)
- [ ] Postgres levantado en :5433 (`npm run dev:db`)
- [ ] Flask arranca y carga el modelo YOLO sin errores
- [ ] Next sirve en :3000, login funciona, chat responde, detector pinta bounding boxes
- [~] No hay tests → reemplazado por smoke test manual
- [x] 12 commits leídos: Sergio + Jesús, español, prefijos feat/fix/chore
- [x] Solo rama main → no hay convención de branches todavía
- [x] No había config de IA → Escenario C aplicado
```

### Día 2 — Mapeo (Fase 1)

```markdown
- [ ] Mapeé la arquitectura (flujo de requests, auth, errores)
- [ ] Mapeé las convenciones de código (naming, patterns, imports)
- [ ] Mapeé el modelo de datos (entidades, relaciones, campos calculados)
- [ ] Mapeé los contratos API (endpoints, params, responses)
- [ ] Identifiqué gotchas, TODOs, y deuda técnica
- [ ] Guardé todo en memoria local
```

### Día 3 — Configuración e Integración (Fases 2-3)

```markdown
- [ ] Configuré Claude Code (CLAUDE.md, agents, rules, permisos)
- [ ] Entendí el flujo de branches y deploy
- [ ] Adopté la convención de commits del proyecto
- [ ] Hice mi primera contribución pequeña y segura
- [ ] Tests siguen pasando después de mi cambio
```

### Día 4+ — Contribución Productiva (Fase 4)

```markdown
- [ ] Contribuyo features siguiendo patrones existentes
- [ ] Corro tests antes de cada commit
- [ ] Actualizo CLAUDE.md cuando el estado cambia
- [ ] Mi memoria local crece con cada sesión
- [ ] El equipo no tiene que repetirme convenciones
```

---

## Antipatrones al Unirte a un Proyecto

### 1. "El Refactorizador Prematuro"
**Síntoma:** Llegar y querer reestructurar carpetas, renombrar variables, "limpiar" código.
**Problema:** No entiendes POR QUÉ el código está así. Puede haber razones técnicas, históricas, o de negocio.
**Solución:** Primero entender, luego proponer (no imponer), y solo si el equipo lo aprueba.

### 2. "El Que Trae Sus Convenciones"
**Síntoma:** Usar tu estilo de commits, tu estructura de carpetas, tus patrones preferidos.
**Problema:** Inconsistencia en el codebase. El equipo tiene que leer código en dos estilos.
**Solución:** Adoptar las convenciones del proyecto. Proponer cambios solo si hay consenso.

### 3. "El Que No Lee Tests"
**Síntoma:** Agregar features sin leer los tests existentes.
**Problema:** Duplicas tests, rompes fixtures, no sigues el patrón de testing del proyecto.
**Solución:** Leer `conftest.py` / `setup.ts` / `factories/` ANTES de escribir tests nuevos.

> **Lección de AlertaInf:** El `conftest.py` tiene fixtures para async DB, client HTTP, y tokens por rol. Si no lo lees, vas a crear fixtures duplicadas o incompatibles.

### 4. "El Que Ignora la Memoria Compartida"
**Síntoma:** No leer CLAUDE.md, no actualizar estado, no seguir el protocolo post-pull.
**Problema:** Tu instancia de Claude Code trabaja con contexto desactualizado. Generas código que contradice decisiones ya tomadas.
**Solución:** Leer CLAUDE.md al inicio de cada sesión. Actualizar memoria tras cada pull.

### 5. "El Que Commitea Sin Tests"
**Síntoma:** Pushear código sin correr la suite de tests.
**Problema:** Rompes el build para todo el equipo. En proyectos con deploy automático, rompes producción.
**Solución:** `make test` / `npm test` ANTES de cada commit. No hay excepción.

---

## Comparación: Workflow Nuevo vs. Existente

```
PROYECTO NUEVO                          PROYECTO EXISTENTE
══════════════                          ══════════════════

Fase 0: DISEÑAR                         Fase 0: RECONOCER
  Requerimientos desde cero               Leer lo que ya existe
  Tú defines el stack                     Descubrir el stack
  Tú escribes decisiones firmes           Entender decisiones ya tomadas

Fase 1: CREAR estructura                 Fase 1: MAPEAR estructura
  Carpetas desde cero                     Entender la organización existente
  .gitignore nuevo                        Verificar qué ya está ignorado
  Primer commit                           Leer historial de commits

Fase 2: DEFINIR Claude Code              Fase 2: ADAPTAR Claude Code
  CLAUDE.md desde cero                    Complementar CLAUDE.md existente
  Agentes diseñados para tu stack         Agentes adaptados a patrones reales
  Rules ideales                           Rules basadas en código actual

Fase 3: IMPLEMENTAR                      Fase 3: INTEGRARTE al flujo
  Tu flujo de desarrollo                  Adoptar el flujo del equipo
  Tus convenciones                        Convenciones del proyecto
  Tu estilo de commits                    Estilo de commits existente

Fase 4: AUDITAR                          Fase 4: CONTRIBUIR
  Desde tus estándares                    Siguiendo patrones existentes
                                          Primera contribución pequeña
                                          Escalar gradualmente

MEMORIA LOCAL                            MEMORIA LOCAL
  Empieza vacía                           Empieza con exploración
  Crece con tus decisiones                Crece con descubrimientos
  Refleja tu diseño                       Refleja tu entendimiento
```

### La memoria local como puente

En un proyecto nuevo, la memoria local de Claude Code registra **tus decisiones de diseño**.
En un proyecto existente, registra **tu comprensión del sistema**.

En ambos casos, la memoria local es **individual y complementaria** a la memoria compartida (CLAUDE.md + git). Es lo que hace que cada instancia de Claude Code entienda no solo el proyecto, sino el contexto específico del desarrollador que está trabajando.

```
┌─────────────────────────────────────────────────┐
│              MEMORIA COMPARTIDA                  │
│         (CLAUDE.md, .claude/, git)                │
│                                                   │
│   • Stack, arquitectura, decisiones firmes        │
│   • Agentes, rules, commands, specs               │
│   • Estado actual del proyecto                    │
│   • Convenciones de código                        │
│   • Hallazgos de seguridad                        │
│                                                   │
│   Vive en: repositorio Git                        │
│   Quién la mantiene: todo el equipo               │
│   Cuándo se actualiza: con cada cambio relevante  │
└─────────────────────┬───────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  MEMORIA    │ │  MEMORIA    │ │  MEMORIA    │
│  LOCAL      │ │  LOCAL      │ │  LOCAL      │
│  Dev-Sergio │ │  Dev-Jesus  │ │  Dev-Jhon   │
│             │ │             │ │             │
│ • Patrones  │ │ • Su rol    │ │ • Su rol    │
│   aprendidos│ │ • Sus fixes │ │ • Sus fixes │
│ • Gotchas   │ │ • Su        │ │ • Su        │
│   personales│ │   feedback  │ │   feedback  │
│ • Feedback  │ │ • Sus refs  │ │ • Sus refs  │
│   del equipo│ │             │ │             │
│             │ │             │ │             │
│ Vive en:    │ │ Vive en:    │ │ Vive en:    │
│ ~/.claude/  │ │ ~/.claude/  │ │ ~/.claude/  │
│ projects/   │ │ projects/   │ │ projects/   │
└─────────────┘ └─────────────┘ └─────────────┘
```

Esta separación es la tesis central: la efectividad de Claude Code en equipo no depende solo de la documentación compartida, sino de la **memoria individual acumulada** por cada desarrollador — sus aprendizajes, errores corregidos, y patrones descubiertos que informan cómo su instancia de Claude Code trabaja con el proyecto.

> **Aplicado a SafeCampus:** El diagrama de tres devs es de AlertaInf. Aquí son **dos nodos**: `Dev-Sergio` y `Dev-Jesus`, ambos sobre la misma rama `main`. La memoria compartida vive en `CLAUDE.md` + `.claude/` (commiteados); la memoria local de cada uno en `~/.claude/projects/...`.

---

## Configuración generada para SafeCampus (Escenario C)

Archivos creados en este onboarding (ver el árbol del repo):

```
SafeCampus/
├── CLAUDE.md                                # Doc principal para Claude Code
├── .claudeignore                            # Excluye .venv, uploads, best.pt*, etc.
└── .claude/
    ├── agents/
    │   ├── nextjs-frontend.md               # Páginas, componentes, App Router
    │   ├── flask-backend.md                 # Endpoints Flask, JWT, SQLAlchemy
    │   ├── yolo-detector.md                 # Modelo YOLOv8 + OpenCV + Socket.IO
    │   ├── code-reviewer.md                 # Revisión antes de commit/push
    │   ├── testing-bootstrap.md             # Vitest + pytest desde cero
    │   └── deploy-devops.md                 # Dockerfile, Railway/Render, CI
    ├── rules/
    │   ├── api-contracts.md                 # Endpoints Flask + Next API routes
    │   ├── conventions.md                   # Naming, imports, errores, idioma
    │   └── security.md                      # JWT, CORS, secrets, fallback demo
    ├── commands/
    │   ├── dev.md                           # Cómo levantar los 3 procesos
    │   ├── lint.md                          # next lint + ruff opcional
    │   └── deploy-checklist.md              # Pre-push checklist
    └── skills/
        └── safecampus-detector-smoke/       # Skill para validar detector tras cambios
```

Estos artefactos son **memoria compartida** — se commitean para que tanto Sergio como Jesús arranquen con el mismo contexto.

### Onboarding del dúo

- `ONBOARDING-JESUS.md` (raíz) — guía paso a paso para que Jesús levante el proyecto y use los mismos agentes/reglas. También sirve como plantilla si entra alguien más al equipo.
- `.claude/settings.local.json` está en `.gitignore` (es config personal). Cada dev tiene la suya.
- Memoria local de cada dev vive en `~/.claude/projects/<safecampus>/memory/` (privada, no commiteable).

### ¿Por qué estos 6 agentes y no más?

- **Frontend / Backend / Detector** son las 3 áreas técnicas con código diferenciado en el repo.
- **Code Reviewer** sustituye el PR review (no hay CI ni revisión formal entre Sergio y Jesús).
- **Testing Bootstrap** ataca deuda real (0 tests hoy).
- **Deploy & DevOps** ataca otra deuda real (backend sin pipeline).

Descartados a propósito: `db-schema` (solo 2 tablas, redundante con `flask-backend`), `ux-utadeo` (paleta ya está en código + reglas), `chat-openai` (endpoint trivial de 30 líneas), `security-audit` (cubierto por `code-reviewer` + `rules/security.md`).
