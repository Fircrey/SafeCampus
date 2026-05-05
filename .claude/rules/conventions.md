# Convenciones — SafeCampus

## Idioma

- **Código:** inglés (variables, funciones, clases, archivos)
- **UI / copy:** español, tono institucional formal-cercano (estudiantes y staff Utadeo)
- **Commits:** español, prefijo convencional
- **Comentarios:** español si explican lógica de negocio; inglés si son técnicos

## Commits

Formato: `<tipo>(<scope opcional>): <descripción imperativa>`

Tipos vistos en el repo: `feat`, `fix`, `chore`, `docs`. Ejemplos reales:
- `feat: integrar iconos de Cabito en dashboard, rutas, admin, alertas y ayuda`
- `fix(detector): corregir bounding boxes desplazados y threshold de confianza`
- `fix: corregir 34 bugs + mejoras de calidad y UX`

Agrupar cambios relacionados en un solo commit. No fragmentar por archivo.

## Naming

| Contexto | Convención | Ejemplo |
|---|---|---|
| Variables/funciones TS | `camelCase` | `handleSubmit`, `userToken` |
| Componentes React | `PascalCase` | `DetectorView`, `LoginForm` |
| Archivos componentes | `kebab-case.tsx` o `PascalCase.tsx` (revisar repo) | `chat-panel.tsx` |
| Variables/funciones Python | `snake_case` | `get_current_user` |
| Clases Python | `PascalCase` | `User`, `Report` |
| Tablas Postgres | `snake_case` plural | `users`, `reports` |
| Endpoints REST | `kebab-case` y plural | `/auth/login`, `/reports` |

## Imports

- TS: imports absolutos desde `@/` cuando aplique (verificar `tsconfig.json`)
- Agrupar: stdlib → terceros → internos → estilos
- No imports relativos profundos (`../../..`) — preferir alias

## Errores

- Flask: `return jsonify({"error": "msg legible", "detail": "técnico"}), <status>`
- Next API: `NextResponse.json({error: "msg"}, {status})`
- Nunca exponer stack traces ni paths internos en producción

## Estilo

- Tailwind utility-first; no CSS modules salvo casos justificados
- Paleta: variables en `app/globals.css` y `tailwind.config.ts` (Pantone 2955 C, amarillo Utadeo)
- Iconos: SOLO `lucide-react`
- Sin emojis en código ni en commits salvo petición explícita

## Estructura de carpetas (no romper)

```
app/<feature>/page.tsx        # Pages App Router
app/api/<endpoint>/route.ts   # API routes
components/<feature>/*.tsx    # Componentes por feature
backend/<modulo>.py           # Blueprints planos (no app/api/v1/...)
```

El backend Flask es **plano** (no `app/api/v1/...` como AlertaInf). No reorganizar sin discusión.
