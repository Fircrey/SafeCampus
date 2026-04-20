# Sistema de Deteccion de Armas en Tiempo Real

**Proyecto Final - Inteligencia Artificial**
Universidad Jorge Tadeo Lozano (UTADEO)

---

## Descripcion

Sistema de vigilancia inteligente que detecta armas (pistolas y cuchillos) en tiempo real utilizando vision artificial. Combina un modelo de deep learning **YOLOv8** entrenado con un dataset personalizado y una interfaz web estilo **CCTV** que muestra el video en vivo con alertas instantaneas.

### Caracteristicas principales

- **Deteccion en tiempo real** de pistolas y cuchillos via camara web
- **Dashboard CCTV** con tema oscuro profesional
- **Alertas instantaneas** visuales y sonoras al detectar un arma
- **Estadisticas en vivo**: total de detecciones, conteo por tipo, confianza promedio
- **Registro de detecciones** con timestamps
- **Comunicacion en tiempo real** via WebSockets (SocketIO)
- **Reconexion automatica** de camara ante desconexiones

---

## Tecnologias Utilizadas

| Componente | Tecnologia |
|---|---|
| Modelo de IA | YOLOv8 (Ultralytics) - entrenamiento custom |
| Backend | Python 3.13 + Flask + Flask-SocketIO |
| Vision Artificial | OpenCV |
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Comunicacion | Socket.IO (WebSockets) |
| Configuracion | python-dotenv (.env) |

---

## Arquitectura del Sistema

```
+-------------------+       +-----------------+       +------------------+
|   Camara Web      | ----> |  Backend Flask  | ----> |  Dashboard Web   |
| (OpenCV capture)  |       |  + YOLOv8       |       |  (CCTV UI)       |
+-------------------+       |  + SocketIO     |       +------------------+
                            +-----------------+
                                    |
                            Eventos en tiempo real:
                            - new_detection
                            - alert / alert_clear
                            - stats_update
                            - status_change
```

**Flujo de funcionamiento:**

1. La camara web captura frames en tiempo real via OpenCV
2. Cada N frames (configurable) se pasa por el modelo YOLOv8 para deteccion
3. Si se detecta un arma con confianza superior al umbral, se emite una alerta via SocketIO
4. El dashboard muestra el video con bounding boxes, alertas sonoras y registro de eventos

---

## Estructura del Proyecto

```
proyecto-detector-armas/
├── backend/
│   ├── app.py                  # Servidor Flask + logica de deteccion
│   ├── requirements.txt        # Dependencias Python
│   ├── .env                    # Variables de entorno (configuracion)
│   ├── models/
│   │   └── best.pt             # Modelo YOLOv8 entrenado (no incluido en repo)
│   ├── static/
│   │   ├── css/style.css       # Estilos del dashboard (tema oscuro CCTV)
│   │   └── js/app.js           # Logica del cliente (SocketIO + UI)
│   └── templates/
│       └── index.html          # Pagina principal del dashboard
└── README.md
```

---

## Requisitos Previos

- **Python 3.10+** instalado
- **Camara web** conectada al equipo
- **Modelo entrenado** (`best.pt`) ubicado en `backend/models/`

---

## Instalacion y Ejecucion

### 1. Clonar el repositorio

```bash
git clone https://github.com/Fircrey/protectoFinal_InteligenciaArtificial.git
cd protectoFinal_InteligenciaArtificial
```

### 2. Instalar dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

El archivo `backend/.env` contiene la configuracion. Valores por defecto:

| Variable | Descripcion | Default |
|---|---|---|
| `CONFIDENCE_THRESHOLD` | Umbral minimo de confianza para detecciones | `0.65` |
| `CAMERA_INDEX` | Indice de la camara (0 = default) | `0` |
| `FRAME_SKIP` | Ejecutar YOLO cada N frames (rendimiento) | `3` |
| `MAX_HISTORY` | Maximo de detecciones en el historial | `50` |

### 4. Ejecutar el sistema

```bash
python app.py
```

### 5. Abrir el dashboard

Navegar a **http://localhost:5000** en el navegador y presionar **INICIAR** para activar la camara.

---

## Uso del Dashboard

1. **INICIAR**: Activa la camara y comienza el monitoreo con IA
2. **DETENER**: Desactiva la camara y detiene la deteccion
3. **SONIDO**: Activa/desactiva las alertas sonoras
4. **LIMPIAR**: Borra el historial de detecciones

Cuando se detecta un arma:
- Aparece un **bounding box** rojo (pistola) o naranja (cuchillo) sobre el video
- Se muestra un **banner de alerta** en la parte superior
- Suena una **alerta sonora** (si el sonido esta activado)
- Se registra la deteccion en el **log lateral** con timestamp y confianza

---

## Sobre el Modelo YOLOv8

El modelo fue entrenado con un dataset personalizado que incluye imagenes de:
- Pistolas / armas de fuego
- Cuchillos

El archivo `best.pt` contiene los pesos del modelo entrenado. Este archivo no se incluye en el repositorio por su tamano; debe colocarse manualmente en `backend/models/`.

---

## Autor

Proyecto desarrollado como trabajo final de la materia de **Inteligencia Artificial** en la **Universidad Jorge Tadeo Lozano (UTADEO)**.
