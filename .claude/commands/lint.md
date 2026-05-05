Corre los linters disponibles antes de commitear.

```bash
# Frontend (Next/ESLint)
npm run lint

# Build (catch type errors)
npm run build

# Backend Python — no hay ruff/black configurado todavía
# Si lo añades, sería:
#   cd backend && .venv\Scripts\ruff check . && .venv\Scripts\ruff format --check .
```

**Resultado esperado:** 0 errores, 0 warnings de ESLint. `next build` debe completar sin TS errors.

Si `npm run build` falla por tipos React 19 vs `@types/react ^18`, anotar el archivo y reportar — no parchar con `any` sin discutir.
