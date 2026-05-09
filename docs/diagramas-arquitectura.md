# SafeCampus AI - Diagramas de arquitectura y UML

Analisis realizado sobre el repositorio clonado desde `https://github.com/Fircrey/SafeCampus`, commit `92494e7` (`feat(reportar): flujo post-envio con confirmacion y enriquecimiento`).

## 1. Resumen arquitectonico

SafeCampus AI esta implementado como una aplicacion web con dos runtimes principales:

- **Frontend Next.js 16 / React 19**: rutas App Router, UI, autenticacion en cliente, middleware por rol, proxy HTTP `/flask/*`, chatbot y paneles.
- **Backend Flask + Socket.IO**: API REST, autenticacion JWT, gestion de reportes/usuarios, streaming de camara, inferencia YOLOv8 local, eventos en tiempo real.
- **Persistencia PostgreSQL**: tablas `users` y `reports`.
- **Servicios externos opcionales**: OpenAI para chat de bienestar y Roboflow para inferencia de imagen demo en `/api/detect`.
- **Hardware/archivo local**: camara OpenCV y modelo YOLO `backend/models/best.pt`.

## 2. Diagrama de contexto

```mermaid
flowchart LR
  Usuario([Usuario autenticado])
  Admin([Admin])
  Superadmin([Superadmin])
  Browser["Navegador web"]
  Next["Next.js App\nApp Router + UI + API routes"]
  Flask["Flask Backend\nREST + Socket.IO + Video stream"]
  DB[(PostgreSQL)]
  Camera["Camara local\nOpenCV"]
  Model["Modelo YOLOv8\nbackend/models/best.pt"]
  OpenAI["OpenAI API\n/api/chat"]
  Roboflow["Roboflow Detect API\n/api/detect demo"]

  Usuario --> Browser
  Admin --> Browser
  Superadmin --> Browser
  Browser --> Next
  Next -- "REST proxy /flask/*" --> Flask
  Browser -- "Socket.IO directo" --> Flask
  Browser -- "MJPEG /video_feed?token" --> Flask
  Next -- "chat completions" --> OpenAI
  Next -- "single image detection" --> Roboflow
  Flask --> DB
  Flask --> Camera
  Flask --> Model
```

## 3. Casos de uso

```mermaid
flowchart LR
  U([Usuario])
  A([Admin])
  S([Superadmin])
  O([OpenAI])
  C([Camara/YOLO])

  subgraph SafeCampus["SafeCampus AI"]
    UC1(["Registrarse"])
    UC2(["Iniciar sesion"])
    UC3(["Ver dashboard"])
    UC4(["Usar chat de bienestar"])
    UC5(["Crear reporte"])
    UC6(["Complementar reporte"])
    UC7(["Consultar mapa del campus"])
    UC8(["Consultar rutas institucionales"])
    UC9(["Monitorear detector en vivo"])
    UC10(["Iniciar/detener camara"])
    UC11(["Ver historial y estadisticas de deteccion"])
    UC12(["Gestionar reportes"])
    UC13(["Ver foto adjunta"])
    UC14(["Gestionar usuarios"])
    UC15(["Recibir alertas en tiempo real"])
  end

  U --> UC1
  U --> UC2
  U --> UC3
  U --> UC4
  U --> UC5
  U --> UC6
  U --> UC7
  U --> UC8

  A --> UC9
  A --> UC10
  A --> UC11
  A --> UC12
  A --> UC13
  A --> UC15

  S --> UC14
  S --> UC12
  S --> UC9

  UC4 --> O
  UC9 --> C
  UC15 --> C
```

## 4. Componentes principales

```mermaid
flowchart TB
  subgraph FE["Frontend Next.js"]
    Layout["LayoutShell + Sidebar/MobileHeader"]
    AuthCtx["AuthProvider / useAuth"]
    Middleware["middleware.ts\nproteccion por cookie JWT y rol"]
    Dashboard["DashboardBento\nhealth, reportes, detecciones"]
    Help["Centro de ayuda\nBienestarPage"]
    ReportUI["ReportarPage\nReportForm + Confirmation"]
    MapUI["CampusMapPage\nMapSVG + ZoneList"]
    DetectorUI["DetectorPage\nVideoFeed + Socket hook"]
    AdminUI["AdminReportsPage\nAdminUsersPage"]
    Client["lib/flask-client.ts"]
    ApiChat["app/api/chat"]
    ApiDetect["app/api/detect"]
    ApiUpload["app/api/reports/upload"]
  end

  subgraph BE["Backend Flask"]
    App["app.py\nhealth, detector, video_feed, Socket.IO"]
    AuthBP["auth.py\nregister/login/me + JWT decorators"]
    ReportsBP["reports.py\nCRUD reportes, fotos, zonas"]
    AdminBP["admin.py\nusuarios"]
    Tracker["DetectionTracker"]
    AlertState["AlertState"]
    Models["models.py\nUser, Report"]
  end

  subgraph Data["Datos y recursos"]
    PG[(PostgreSQL)]
    Uploads["backend/uploads"]
    Zones["utadeo-zones.json"]
    Yolo["YOLO best.pt"]
    Cam["Camara"]
  end

  Layout --> AuthCtx
  Middleware --> AuthCtx
  Dashboard --> Client
  ReportUI --> Client
  MapUI --> Client
  DetectorUI --> Client
  AdminUI --> Client
  Help --> ApiChat
  ApiDetect --> Roboflow["Roboflow API"]
  ApiChat --> OpenAI["OpenAI API"]
  ApiUpload --> ReportsBP
  Client -- "/flask/*" --> App
  DetectorUI -- "Socket.IO" --> App
  DetectorUI -- "MJPEG img" --> App
  MapUI --> Zones
  ReportUI --> Zones

  App --> AuthBP
  App --> ReportsBP
  App --> AdminBP
  App --> Tracker
  App --> AlertState
  App --> Models
  AuthBP --> Models
  ReportsBP --> Models
  AdminBP --> Models
  Models --> PG
  ReportsBP --> Uploads
  App --> Yolo
  App --> Cam
```

## 5. Modelo de dominio / clases

```mermaid
classDiagram
  class User {
    +int id
    +string email
    +string name
    +string password_hash
    +UserRole role
    +boolean is_active
    +datetime created_at
    +to_dict()
  }

  class Report {
    +int id
    +int user_id
    +boolean is_anonymous
    +text type_description
    +string location
    +string immediate_risk
    +string contact_preference
    +string photo_filename
    +ReportStatus status
    +text notes
    +string zone_id
    +string zone_name
    +Priority priority
    +float latitude
    +float longitude
    +datetime created_at
    +datetime resolved_at
    +int resolved_by
    +to_dict()
  }

  class DetectionTracker {
    -deque history
    -Lock lock
    +add(class_name, confidence)
    +get_history()
    +clear()
    +get_stats()
  }

  class AlertState {
    +boolean weapon_visible
    +int clean_frames
    +float last_alert_time
    +float last_log_time
  }

  class AuthProvider {
    +User user
    +string token
    +login(email, password)
    +register(email, name, password)
    +logout()
  }

  class FlaskClient {
    +loginUser()
    +registerUser()
    +fetchMe()
    +createGeoReport()
    +enrichReport()
    +fetchReports()
    +updateReport()
    +startDetection()
    +stopDetection()
    +fetchUsers()
    +updateUser()
  }

  class ZoneFeature {
    +string id
    +properties
    +geometry Polygon
  }

  class UserRole {
    <<enumeration>>
    user
    admin
    superadmin
  }

  class ReportStatus {
    <<enumeration>>
    open
    reviewing
    resolved
    false_positive
  }

  class Priority {
    <<enumeration>>
    alta
    media
    baja
  }

  User "1" --> "0..*" Report : author
  Report "0..*" --> "0..1" User : resolver
  User --> UserRole
  Report --> ReportStatus
  Report --> Priority
  AuthProvider --> User
  FlaskClient --> Report
  FlaskClient --> User
  Report --> ZoneFeature : zone_id
  DetectionTracker --> AlertState : emits stats/alerts
  note for Report "Campos opcionales: user_id, photo_filename, notes, zone_id, zone_name, priority, latitude, longitude, resolved_at, resolved_by"
  note for AuthProvider "user y token pueden ser null hasta autenticar"
```

## 6. Entidad-relacion

```mermaid
erDiagram
  USERS {
    INT id PK
    VARCHAR email UK
    VARCHAR name
    VARCHAR password_hash
    VARCHAR role
    BOOLEAN is_active
    DATETIME created_at
  }

  REPORTS {
    INT id PK
    INT user_id FK
    BOOLEAN is_anonymous
    TEXT type_description
    VARCHAR location
    VARCHAR immediate_risk
    VARCHAR contact_preference
    VARCHAR photo_filename
    VARCHAR status
    TEXT notes
    VARCHAR zone_id
    VARCHAR zone_name
    VARCHAR priority
    FLOAT latitude
    FLOAT longitude
    DATETIME created_at
    DATETIME resolved_at
    INT resolved_by FK
  }

  USERS ||--o{ REPORTS : creates
  USERS ||--o{ REPORTS : resolves
```

## 7. Navegacion y control de acceso

```mermaid
flowchart TD
  Root["/"] --> Dashboard["Dashboard"]
  Root --> Ayuda["/ayuda"]
  Ayuda --> Bienestar["/ayuda/bienestar"]
  Ayuda --> Reportar["/reportar"]
  Root --> Mapa["/mapa"]
  Mapa --> ReportarZona["/reportar?zone=:zoneId"]
  Root --> Rutas["/rutas"]
  Root --> Detector["/detector"]
  Root --> AdminReports["/admin/reports"]
  Root --> AdminUsers["/admin/users"]
  Login["/login"] --> Root
  Register["/register"] --> Root
  ChatLegacy["/chat"] --> Ayuda
  AyudaReportLegacy["/ayuda/reportar"] --> Reportar

  Middleware["middleware.ts"]
  Middleware --> Public["Publico: /login, /register"]
  Middleware --> Authenticated["Resto requiere cookie token"]
  Middleware --> AdminOnly["/detector y /admin/* requieren admin"]
  Middleware --> SuperOnly["/admin/users requiere superadmin"]
```

## 8. Secuencia: login y sesion

```mermaid
sequenceDiagram
  actor Usuario
  participant LoginPage
  participant AuthProvider
  participant FlaskClient
  participant FlaskAuth as Flask /api/auth
  participant DB as PostgreSQL
  participant Middleware

  Usuario->>LoginPage: email + password
  LoginPage->>AuthProvider: login(email, password)
  AuthProvider->>FlaskClient: loginUser()
  FlaskClient->>FlaskAuth: POST /api/auth/login
  FlaskAuth->>DB: buscar User por email
  DB-->>FlaskAuth: User
  FlaskAuth->>FlaskAuth: bcrypt.checkpw + crear JWT
  FlaskAuth-->>FlaskClient: token + user
  FlaskClient-->>AuthProvider: token + user
  AuthProvider->>AuthProvider: guardar localStorage + cookie token
  LoginPage->>Usuario: redireccion a /
  Usuario->>Middleware: navegar a ruta protegida
  Middleware->>Middleware: decodifica JWT sin verificar firma para rol
  Middleware-->>Usuario: permite o redirige
```

## 9. Secuencia: crear y complementar reporte

```mermaid
sequenceDiagram
  actor Usuario
  participant ReportarPage
  participant Geo as useGeolocation
  participant GeoUtils as geo-utils
  participant Form as ReportForm
  participant Client as flask-client
  participant Reports as Flask /api/reports
  participant DB as PostgreSQL
  participant Socket as Socket.IO
  participant Confirm as ReportConfirmation

  Usuario->>ReportarPage: abre /reportar o /reportar?zone=...
  ReportarPage->>Geo: solicita ubicacion
  Geo-->>ReportarPage: lat/lon/status
  ReportarPage->>GeoUtils: detectZone(lon, lat)
  GeoUtils-->>ReportarPage: zona exacta o cercana
  Usuario->>Form: descripcion, tipo, riesgo inmediato
  Form->>Client: createGeoReport(payload)
  Client->>Reports: POST /api/reports con JWT
  Reports->>Reports: token_required + validaciones
  Reports->>DB: insertar Report(status=open)
  Reports-->>Socket: emit new_zone_report si zone_id existe
  Reports-->>Client: report
  Client-->>Form: report
  Form-->>Confirm: mostrar confirmacion
  Usuario->>Confirm: complementar foto/prioridad/anonimato/contacto
  Confirm->>Client: enrichReport(id, payload)
  Client->>Reports: PATCH /api/reports/:id/enrich
  Reports->>DB: actualizar reporte abierto del creador
  Reports-->>Confirm: report actualizado
```

## 10. Secuencia: detector en vivo

```mermaid
sequenceDiagram
  actor Admin
  participant UI as DetectorPage
  participant Client as flask-client
  participant SocketHook as useDetectorSocket
  participant Flask as Flask app.py
  participant Cam as OpenCV Camera
  participant YOLO as YOLOv8 model
  participant Tracker as DetectionTracker

  Admin->>UI: pulsa Iniciar
  UI->>Client: startDetection()
  Client->>Flask: POST /api/start con JWT admin
  Flask->>Flask: valida admin_required y model_loaded
  Flask-->>UI: success
  UI->>Flask: img /video_feed?token=JWT
  SocketHook->>Flask: Socket.IO connect(token)
  Flask->>Cam: abrir camara
  loop frames
    Cam-->>Flask: frame
    Flask->>YOLO: inferencia cada FRAME_SKIP
    YOLO-->>Flask: boxes/clases/confianza
    Flask->>Tracker: add(best_weapon)
    Flask-->>SocketHook: new_detection, stats_update
    Flask-->>SocketHook: alert o alert_clear
    Flask-->>UI: frame MJPEG con bounding boxes
  end
  Admin->>UI: pulsa Detener
  UI->>Client: stopDetection()
  Client->>Flask: POST /api/stop
  Flask->>Cam: liberar camara
  Flask-->>SocketHook: status_change offline
```

## 11. Secuencia: chat de bienestar

```mermaid
sequenceDiagram
  actor Usuario
  participant Page as BienestarPage
  participant Api as Next /api/chat
  participant OpenAI as OpenAI API
  participant Protocols as lib/protocols.ts

  Usuario->>Page: envia mensaje
  Page->>Api: POST /api/chat {messages}
  Api->>Protocols: assistantInstructions
  alt OPENAI_API_KEY definido
    Api->>OpenAI: chat completions
    OpenAI-->>Api: respuesta
    Api-->>Page: {reply}
  else sin OPENAI_API_KEY
    Api-->>Page: respuesta demo
  end
  Page-->>Usuario: muestra orientacion
```

## 12. Secuencia: administracion de reportes y usuarios

```mermaid
sequenceDiagram
  actor Admin
  actor Superadmin
  participant AdminUI
  participant Client as flask-client
  participant Reports as /api/reports
  participant Users as /api/admin/users
  participant DB as PostgreSQL

  Admin->>AdminUI: abre /admin/reports
  AdminUI->>Client: fetchReports()
  Client->>Reports: GET /api/reports
  Reports->>DB: admin ve todos, usuario ve propios
  Reports-->>AdminUI: lista reportes
  Admin->>AdminUI: cambia status
  AdminUI->>Client: updateReport(id, status)
  Client->>Reports: PATCH /api/reports/:id
  Reports->>DB: actualiza status/resolved_by/resolved_at

  Superadmin->>AdminUI: abre /admin/users
  AdminUI->>Client: fetchUsers()
  Client->>Users: GET /api/admin/users
  Users->>DB: listar usuarios
  Superadmin->>AdminUI: cambia rol o activo
  AdminUI->>Client: updateUser(id, role/is_active)
  Client->>Users: PATCH /api/admin/users/:id
  Users->>DB: actualizar usuario
```

## 13. Estado: ciclo de vida de un reporte

```mermaid
stateDiagram-v2
  [*] --> open: POST /api/reports
  open --> open: PATCH /enrich por creador
  open --> reviewing: admin PATCH status
  reviewing --> open: admin reabre
  reviewing --> resolved: admin resuelve
  open --> resolved: admin resuelve
  open --> false_positive: admin marca falso positivo
  reviewing --> false_positive: admin marca falso positivo
  resolved --> open: admin reabre
  resolved --> reviewing: admin reevalua
  false_positive --> open: admin reabre
  false_positive --> reviewing: admin reevalua

  note right of resolved
    resolved_at y resolved_by
    se asignan al resolver
  end note
```

## 14. Estado: detector y alertas

```mermaid
stateDiagram-v2
  [*] --> Stopped
  Stopped --> Starting: POST /api/start
  Starting --> Running: video_feed abre camara
  Starting --> Stopped: camara/modelo no disponible
  Running --> WeaponHidden: frames sin arma
  Running --> WeaponVisible: YOLO detecta WEAPON_LABELS
  WeaponHidden --> WeaponVisible: primera deteccion
  WeaponVisible --> WeaponVisible: deteccion continua\nlog cada 3s
  WeaponVisible --> Cooldown: emite alert\nsi no estaba visible
  Cooldown --> WeaponVisible: arma sigue visible\nno repetir alerta
  WeaponVisible --> WeaponHidden: CLEAN_FRAMES_TO_CLEAR\nemite alert_clear
  Running --> Stopped: POST /api/stop o desconexion
  Stopped --> [*]
```

## 15. Despliegue local

```mermaid
flowchart TB
  Dev["Maquina de desarrollo"]
  Browser["Browser\nlocalhost:3000"]
  Next["Next.js dev server\nnpm run dev"]
  Flask["Flask + Socket.IO\npython backend/app.py\nlocalhost:5000"]
  Docker["Docker Compose"]
  PG["Postgres 16 Alpine\nlocalhost:5433"]
  Cam["Camara local"]
  Model["backend/models/best.pt"]
  Uploads["backend/uploads"]
  OpenAI["OpenAI API"]
  Roboflow["Roboflow API"]

  Dev --> Next
  Dev --> Flask
  Dev --> Docker
  Docker --> PG
  Browser --> Next
  Browser -- "/flask/* rewrite" --> Flask
  Browser -- "Socket.IO y video directo" --> Flask
  Flask --> PG
  Flask --> Cam
  Flask --> Model
  Flask --> Uploads
  Next --> OpenAI
  Next --> Roboflow
```

## 16. Contratos API principales

| Area | Endpoint | Metodo | Rol | Implementacion |
|---|---:|---:|---|---|
| Auth | `/api/auth/register` | POST | publico | `backend/auth.py` |
| Auth | `/api/auth/login` | POST | publico | `backend/auth.py` |
| Auth | `/api/auth/me` | GET | usuario | `backend/auth.py` |
| Reportes | `/api/reports` | POST | usuario | `backend/reports.py` |
| Reportes | `/api/reports` | GET | usuario/admin | propios o todos |
| Reportes | `/api/reports/by-zone` | GET | usuario | conteos activos por zona |
| Reportes | `/api/reports/:id` | GET | propietario/admin | detalle |
| Reportes | `/api/reports/:id/enrich` | PATCH | propietario | solo si `open` |
| Reportes | `/api/reports/:id` | PATCH | admin | estado/notas |
| Reportes | `/api/reports/:id/photo` | GET | propietario/admin | foto con token header/query |
| Admin | `/api/admin/users` | GET | superadmin | listar usuarios |
| Admin | `/api/admin/users/:id` | PATCH | superadmin | rol/activo |
| Admin | `/api/admin/users/:id` | DELETE | superadmin | desactivar |
| Detector | `/health` | GET | publico via proxy | salud DB/modelo/detector |
| Detector | `/video_feed?token=` | GET | admin | MJPEG directo |
| Detector | `/api/start` | POST | admin | activar detector |
| Detector | `/api/stop` | POST | admin | detener detector |
| Detector | `/api/history` | GET | admin | historial |
| Detector | `/api/clear-history` | POST | admin | limpiar historial |
| Detector | `/api/stats` | GET | usuario | estadisticas |
| Next API | `/api/chat` | POST | sesion web | OpenAI o demo |
| Next API | `/api/detect` | POST | no enlazado en UI actual | Roboflow o demo |
| Next API | `/api/reports/upload` | POST | sesion web | proxy JSON/base64 a Flask |

## 17. Eventos Socket.IO

| Evento | Direccion | Uso |
|---|---|---|
| `connect` | Browser -> Flask | conexion con `query.token` |
| `disconnect` | Browser -> Flask | cierre de cliente |
| `get_status` | Browser -> Flask | solicitar estado/stats |
| `status_change` | Flask -> Browser | `online` / `offline` |
| `stats_update` | Flask -> Browser | totales de deteccion |
| `new_detection` | Flask -> Browser | entrada de historial |
| `alert` | Flask -> Browser | arma detectada con confianza |
| `alert_clear` | Flask -> Browser | arma ya no visible |
| `new_zone_report` | Flask -> Browser | nuevo reporte con `zone_id` |

## 18. Notas de implementacion relevantes

- `middleware.ts` usa el JWT de cookie para decidir navegacion y rol, pero la verificacion criptografica real queda en Flask mediante decoradores `token_required`, `admin_required` y `superadmin_required`.
- Las llamadas REST del frontend usan `/flask/*`, reescrito por Next hacia `http://localhost:5000/*`.
- Socket.IO y `video_feed` van directo a `NEXT_PUBLIC_FLASK_URL` porque el stream MJPEG y WebSocket no dependen del proxy HTTP.
- El reporte nuevo nace en `open`; el usuario solo puede enriquecerlo mientras siga abierto.
- El detector en vivo depende de un modelo local `backend/models/best.pt`; si no existe, Flask no inicia el servicio de deteccion.
- `/api/detect` existe como endpoint Next.js para Roboflow/simulacion, pero no encontre consumidor actual en la UI clonado en este commit.
- `ChatPage`, `ReportPage`, `ZoneReportForm`, `ZoneReportHistory` y `ZoneDetection` existen como componentes auxiliares/legados; las rutas actuales montan principalmente `BienestarPage`, `ReportarPage` y `CampusMapPage`.

## 19. Arquitectura LLM con fine-tuning y RAG

Este diagrama plantea la evolucion del modulo de bienestar/chat para usar un LLM afinado con 500 pares pregunta-respuesta y una capa RAG para recuperar contexto institucional actualizado.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"}}}%%
flowchart LR
  User(["<span style='font-size:28px'>👤</span><br/>Usuario SafeCampus"])
  ChatUI["<span style='font-size:28px'>💬</span><br/>BienestarPage / Chat UI"]
  ApiChat["<span style='font-size:28px'>⚙️</span><br/>Next.js /api/chat<br/>Orquestador LLM"]
  Safety["<span style='font-size:28px'>🛡️</span><br/>Guardrails de seguridad<br/>crisis, emergencias, alcance"]
  Prompt["<span style='font-size:28px'>🧩</span><br/>Construccion de prompt<br/>query + contexto + instrucciones"]
  FTModel["<span style='font-size:28px'>🧠</span><br/>LLM fine-tuned<br/>SafeCampus"]
  Response["<span style='font-size:28px'>✅</span><br/>Respuesta orientada<br/>bienestar, convivencia, rutas"]

  subgraph FineTuning["Pipeline de fine-tuning"]
    QASeed["<span style='font-size:28px'>📝</span><br/>Usuario + LLM<br/>crean 500 QA"]
    QACuration["<span style='font-size:28px'>🔎</span><br/>Curacion humana<br/>limpieza, etiquetas, tono"]
    TrainSplit["<span style='font-size:28px'>✂️</span><br/>Split train/validation"]
    FineTuneJob["<span style='font-size:28px'>🏋️</span><br/>Job de fine-tuning"]
    Eval["<span style='font-size:28px'>📊</span><br/>Evaluacion<br/>calidad, seguridad, alucinacion"]
    Registry["<span style='font-size:28px'>🏷️</span><br/>Registro/versionado<br/>modelo SafeCampus"]
  end

  subgraph RAG["Pipeline RAG"]
    Docs["<span style='font-size:28px'>📚</span><br/>Documentos privados e institucionales<br/>reglamentos, protocolos, rutas"]
    Normalize["<span style='font-size:28px'>🧹</span><br/>Normalizacion<br/>metadatos, permisos, fechas"]
    Split["<span style='font-size:28px'>🧱</span><br/>Chunking<br/>fragmentos recuperables"]
    EmbedDocs["<span style='font-size:28px'>🔢</span><br/>Modelo de embeddings"]
    VectorDB[("<span style='font-size:28px'>🗄️</span><br/>Vector store<br/>con embeddings")]
    Retrieval["<span style='font-size:28px'>🔍</span><br/>Busqueda semantica<br/>top-k + filtros"]
    Context["<span style='font-size:28px'>📌</span><br/>Contexto relevante<br/>con fuente y vigencia"]
  end

  subgraph Runtime["Inferencia en produccion"]
    QueryEmbed["<span style='font-size:28px'>📐</span><br/>Embedding de la consulta"]
    Session["<span style='font-size:28px'>🔐</span><br/>Sesion autenticada<br/>rol, idioma, canal"]
  end

  QASeed --> QACuration --> TrainSplit --> FineTuneJob --> Eval --> Registry --> FTModel
  Docs --> Normalize --> Split --> EmbedDocs --> VectorDB
  User --> ChatUI --> ApiChat
  ApiChat --> Session
  ApiChat --> Safety
  ApiChat --> QueryEmbed
  QueryEmbed --> Retrieval
  VectorDB --> Retrieval
  Retrieval --> Context
  Context --> Prompt
  Session --> Prompt
  Safety --> Prompt
  Prompt --> FTModel
  FTModel --> Response
  Response --> Safety
  Safety --> ApiChat
  ApiChat --> ChatUI
  ChatUI --> User

  classDef data fill:#e8f4ff,stroke:#1d4ed8,color:#0f172a
  classDef train fill:#fef3c7,stroke:#d97706,color:#0f172a
  classDef runtime fill:#ecfdf5,stroke:#059669,color:#0f172a
  classDef model fill:#f3e8ff,stroke:#7e22ce,color:#0f172a
  class QASeed,QACuration,TrainSplit,FineTuneJob,Eval,Registry train
  class Docs,Normalize,Split,EmbedDocs,VectorDB,Retrieval,Context data
  class QueryEmbed,Session,Prompt,Safety,ApiChat,ChatUI,Response runtime
  class FTModel model
```

Flujo esperado:

- El fine-tuning enseña tono, estructura de respuesta, criterios de escalamiento y patrones frecuentes de SafeCampus a partir de los 500 QA curados.
- RAG aporta conocimiento variable o extenso: reglamentos, protocolos, contactos, rutas institucionales, documentos privados y versiones vigentes.
- El orquestador combina consulta, contexto recuperado, instrucciones institucionales y guardrails antes de invocar el modelo fine-tuned.
- La respuesta final debe indicar limites del sistema y escalar a canales humanos cuando haya peligro inmediato, autolesion, violencia actual, arma visible o amenaza creible.
