---
name: safecampus-detector-smoke
description: Smoke test del detector YOLO de SafeCampus tras cambios en backend/app.py, backend/models/best.pt, components/detector/*, o app/detector/page.tsx. Valida que el modelo carga, Socket.IO conecta, y los bounding boxes salen en el espacio de coordenadas correcto. Úsalo antes de cada commit que toque el detector.
---

# Smoke test del detector — SafeCampus

Ejecuta esta secuencia cuando el cambio toque cualquiera de:
- `backend/app.py` (carga del modelo, Socket.IO, threshold)
- `backend/models/best.pt` (modelo nuevo o re-entrenado)
- `components/detector/*` o `app/detector/page.tsx` (UI del detector)
- `app/api/detect/route.ts` (Roboflow proxy)

## Paso 1 — Backend arranca

```bash
npm run dev:flask
```

**Esperado en logs:**
- No `FileNotFoundError: best.pt`
- `Modelo YOLO cargado` (o equivalente positivo)
- `* Running on http://0.0.0.0:5000` (o el puerto configurado)
- Sin tracebacks

**Falla común:** `best.pt` no descomprimido → descomprimir `best.pt.zip` a `backend/models/best.pt`.

## Paso 2 — Frontend conecta

```bash
npm run dev
# abrir http://localhost:3000/detector
```

**En DevTools (Network → WS):**
- Conexión Socket.IO `101 Switching Protocols` exitosa
- Eventos `frame`, `detector_status` llegando

**Falla común:** error CORS → revisar `cors_allowed_origins` en `backend/app.py` incluye el origen del frontend.

## Paso 3 — Inferencia visual

Apunta la webcam a una imagen de referencia (foto de pistola/cuchillo en pantalla del móvil sirve).

**Esperado:**
- Bounding boxes pintados sobre el objeto, no desplazados
- Label correcta (`gun`, `knife`, etc., en `WEAPON_LABELS`)
- Confidence > `CONFIDENCE_THRESHOLD` (0.40 por defecto)
- Alerta `alert` emitida vía Socket.IO con `{class, confidence, x, y, width, height}`

**Regresión a vigilar (commit `284c681`):** bboxes desplazados respecto al objeto. Si pasa, revisar escalado de coordenadas frame original ↔ frame de inferencia.

## Paso 4 — Cooldown de alertas

Mantén el arma frente a la cámara.
- Primera detección → alerta inmediata
- Detecciones siguientes → silenciadas durante `ALERT_COOLDOWN` segundos (10s default)

## Paso 5 — Modo demo (sin best.pt)

Renombra temporalmente `backend/models/best.pt` y reinicia Flask.

**Esperado:** backend arranca con warning, NO crashea. Endpoint `/api/detect` (Next) sigue devolviendo `mode: "demo"`.

Restaura `best.pt`.

## Paso 6 — API route Next

```bash
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/png;base64,iVBORw0KGgo..."}'
```

**Sin `ROBOFLOW_API_KEY`:** `{"mode":"demo","modelId":"...","detections":[...]}`
**Con key:** `{"mode":"roboflow", ...}`

## Reporte

Devuelve un resumen tipo:

```
✅ Modelo carga
✅ Socket.IO conecta
✅ Bboxes alineados
⚠️ Cooldown observado: 12s (esperado 10s) — revisar
✅ Modo demo degrada sin crash
✅ /api/detect responde con shape correcto
```

Si algo falla, **no commitear** hasta resolverlo.
