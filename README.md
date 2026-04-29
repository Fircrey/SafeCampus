# SafeCampus AI

Demo Next.js para Vercel de una plataforma de seguridad, convivencia y bienestar universitario con:

- Detector de armas visibles usando un modelo de Roboflow Universe compatible con YOLOv8.
- Chatbot con OpenAI orientado a salud mental, convivencia y rutas institucionales.
- Flujo discreto de reporte de situación insegura dentro del chat.
- Apariencia inspirada en la marca Utadeo: Azul Utadeo Pantone 2955 C como base, amarillo de acento y fondos limpios.

## Configuración

```bash
cp .env.example .env.local
```

Variables:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
ROBOFLOW_API_KEY=...
ROBOFLOW_MODEL_ID=weapon-detection-using-yolov8/1
```

Si no defines `OPENAI_API_KEY`, el chat responde en modo demo. Si no defines `ROBOFLOW_API_KEY`, el detector muestra resultados simulados para presentar el flujo sin exponer llaves.

## Desarrollo

```bash
npm install
npm run dev
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto desde Vercel.
3. Agrega las variables de entorno en Project Settings > Environment Variables.
4. Despliega.

## Fuentes usadas para el contenido institucional

- Paleta y marca Utadeo: https://www.utadeo.edu.co/es/marca/elementos-graficos/paleta-de-colores
- Color de marca Azul Utadeo Pantone 2955 C: https://www.utadeo.edu.co/es/marca/uso-del-logo/colores-de-la-marca
- Reglamentos oficiales: https://www.utadeo.edu.co/es/link/bienestar-universitario/72301/reglamento-estudiantil
- Reglamento de pregrado: https://www.utadeo.edu.co/es/link/descubre-la-universidad/2/reglamento-estudiantil-de-pregrado
- Protocolo de violencias por razones de género y/o acoso sexual: https://www.utadeo.edu.co/es/noticia/destacadas/bienestar-universitario/72301/protocolo-para-la-prevencion-deteccion-y-atencion-de-casos-de-violencias-por-razones-de-genero-yo-0
- Roboflow Universe, Weapon Detection using YOLOv8: https://universe.roboflow.com/weopon-detection/weapon-detection-using-yolov8

## Nota de alcance

Esta app es un MVP demostrativo. No reemplaza atención psicológica, seguridad institucional, autoridades universitarias ni servicios de emergencia. La detección de visión por computador debe operar con validación humana.
