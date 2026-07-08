# Planificación Scrum basada en el sistema existente (Karta)

Este documento reconstruye un plan de desarrollo en 7 Sprints (incluye un Sprint 0 de análisis previo), estrictamente alineado con las funcionalidades y la arquitectura realmente implementadas en el proyecto para los Sprints 1–6. No se han asumido características inexistentes.

Cada Sprint incluye: Objetivo, Historias de Usuario, Funcionalidades, Tareas técnicas, Entregables, Justificación del orden y el Incremento de Producto.

---

## Sprint 0 — Descubrimiento y Entendimiento del Negocio

- **Objetivo del Sprint**
  Alinear visión, alcance, objetivos y restricciones del producto; levantar requisitos funcionales y no funcionales; identificar riesgos y cumplimiento; priorizar el backlog inicial y acordar Definition of Ready/Done.

- **Historias de Usuario**
  - Como Product Owner, quiero clarificar la visión, objetivos y KPIs, para alinear expectativas y criterios de éxito.
  - Como Arquitecto, quiero identificar NFRs y restricciones (seguridad, rendimiento, privacidad, almacenamiento), para definir una arquitectura viable.
  - Como stakeholder (ADMIN, ASESOR, INVITADO), quiero que mis necesidades se documenten como historias con criterios de aceptación, para asegurar valor.
  - Como equipo, quiero acordar DoR y DoD, para asegurar calidad y previsibilidad en cada entrega.

- **Funcionalidades desarrolladas**
  - N/A. Fase de análisis; no se modifican funcionalidades del sistema.

- **Tareas técnicas**
  - Descubrimiento y levantamiento:
    - Entrevistas y workshops con stakeholders; identificación de actores y roles (ADMIN, ASESOR, INVITADO).
    - Mapa de procesos AS-IS y propuesta TO-BE; diagrama de contexto y límites del sistema.
  - Visión, alcance y priorización:
    - Documento de visión y alcance; objetivos SMART; priorización inicial (MoSCoW).
  - Requisitos:
    - Historias de usuario iniciales con criterios de aceptación (Given-When-Then).
    - Requisitos no funcionales (seguridad JWT, CORS, privacidad de datos, disponibilidad, rendimiento, tamaño máx. de archivo 10MB, retención).
  - Riesgos y cumplimiento:
    - Identificación de riesgos y mitigaciones; consideraciones de cumplimiento y políticas de datos.
  - Arquitectura y decisiones:
    - Validación de la arquitectura modular actual y de dependencias entre módulos (`auth`, `project`, `permission`, `document`, `invitation`, `admin`, `audit`).
    - ADRs iniciales y mapa de componentes.
  - Gobernanza y proceso:
    - Definición de DoR/DoD, flujo de branching y convención de commits; plantillas de issues/PR.
    - Preparación del espacio de documentación en `docs/` (plantillas de historias y ADRs).
  - Plan y métricas:
    - Backlog inicial priorizado y roadmap de 5 sprints de construcción; KPIs de producto y métricas de proceso.

- **Entregables**
  - Documento de visión y alcance.
  - Mapa de stakeholders y RACI.
  - Procesos AS-IS/TO-BE y diagrama de contexto.
  - Catálogo inicial de historias de usuario con criterios de aceptación.
  - Requisitos no funcionales (NFRs) y restricciones técnicas.
  - Registro de riesgos y plan de mitigación.
  - ADRs iniciales y arquitectura objetivo de alto nivel.
  - Backlog priorizado, DoR/DoD y acuerdo de proceso (branching y convenciones).

- **Incremento de Producto**
  - Alineación validada, backlog priorizado y criterios de calidad acordados que habilitan iniciar el desarrollo del Sprint 1 sin ambigüedades.

- **Justificación del orden**
  - El entendimiento del negocio y la priorización deben preceder a cualquier construcción para minimizar reprocesos y maximizar valor desde el primer incremento.

---

## Sprint 1 — Fundacionales, Seguridad y Autenticación (JWT)

- **Objetivo del Sprint**
  Establecer la base técnica del backend y frontend, configurar seguridad con JWT, exponer endpoints de autenticación y dejar la app preparada para extender módulos de negocio.

- **Historias de Usuario**
  - Como usuario registrado, quiero iniciar sesión con mi email y contraseña, para acceder de forma segura a la aplicación.
  - Como desarrollador, quiero una base de proyecto con configuración estándar (logs, excepciones, CORS, OpenAPI), para acelerar la implementación de módulos.

- **Funcionalidades desarrolladas**
  - Autenticación mediante JWT: emisión y validación de tokens.
  - Rutas públicas para login y registro de invitado (solo email y nombre).
  - Rutas autenticadas para obtener y actualizar el perfil, y cambiar contraseña.
  - Interceptor Axios en frontend para adjuntar token.
  - Rutas protegidas en frontend con `AuthGuard` y `RoleGuard` (infra de rutas preparada).
  - Documentación de API con OpenAPI/Swagger.

- **Tareas técnicas**
  - Backend
    - Configuración del proyecto Spring Boot 3.2.1 (Java 21) y PostgreSQL (JPA `ddl-auto=update`).
    - Módulos comunes: `common/constants/AppConstants`, `common/dto/ResponseDto`, `common/exception/GlobalExceptionHandler`.
    - Seguridad: `security/SecurityConfig`, `security/JwtService`, `security/JwtAuthenticationFilter`, `security/UserDetailsServiceImpl`.
    - Módulo `auth`:
      - Entidades: `User`, `Role`.
      - Repositorio: `UserRepository`.
      - Servicio: `AuthService` (login, perfil actual, actualización de perfil, cambio de contraseña, registro de invitado básico).
      - Controlador: `AuthController` (`POST /api/v1/auth/login`, `POST /api/v1/auth/register-invited`, `GET/PUT /api/v1/auth/me`, `PUT /api/v1/auth/change-password`).
    - Config: `config/CorsConfig`, `config/OpenApiConfig`.
    - `application.properties` (DB, JWT, multipart, CORS) y Docker (Dockerfile, docker-compose con Postgres).
  - Frontend
    - Bootstrap con Vite + React + MUI.
    - Infra de rutas: `main.tsx`, `routes/sections.tsx`.
    - Contexto de autenticación: `AuthContext`.
    - Servicios: `services/api.ts` (baseURL + interceptor), `authService.ts`.
    - Página de inicio de sesión: `pages/sign-in` (lazy) y layout de auth.

- **Entregables**
  - Login JWT funcional contra la BD PostgreSQL.
  - Endpoints de perfil y cambio de contraseña protegidos por JWT.
  - Swagger UI operativo.
  - Frontend con flujo de sign-in y protección de rutas por token.

- **Incremento de Producto**
  - Sistema autenticado, navegable y seguro, listo para recibir módulos de negocio.

- **Justificación del orden**
  - La autenticación/seguridad es prerequisito para cualquier módulo protegido (usuarios, proyectos, permisos, documentos, etc.). Establecer la base técnica evita reprocesos.

---

## Sprint 2 — Gestión de Usuarios (ADMIN) y Auditoría Base

- **Objetivo del Sprint**
  Implementar la administración de usuarios por parte de ADMIN y dejar operativa la auditoría base para registrar acciones relevantes.

- **Historias de Usuario**
  - Como administrador, quiero crear, editar, desactivar y reactivar usuarios, para gestionar el acceso al sistema.
  - Como usuario autenticado, quiero ver y actualizar mi perfil, para mantener mi información al día.
  - Como responsable de cumplimiento, quiero que las acciones críticas queden auditadas, para trazabilidad.

- **Funcionalidades desarrolladas**
  - CRUD de usuarios (solo ADMIN): listar, obtener, crear, actualizar, desactivar (soft delete) y reactivar.
  - Perfil del usuario autenticado (ya expuesto en Sprint 1) operativo.
  - Auditoría base persistiendo acciones clave (creación/actualización/desactivación de usuario, etc.).

- **Tareas técnicas**
  - Backend
    - Módulo `auth` (ADMIN):
      - Servicio: `UserService` (CRUD, reactivación, validaciones de unicidad de email, encode de contraseña).
      - Controlador: `UserController` (`/api/v1/users`, protegido por rol `ADMIN`).
      - Soporte adicional en `AdminController` para listar usuarios (`/api/v1/admin/users`).
    - Auditoría (`audit`):
      - Entidad: `ActivityLog`.
      - Repositorio: `ActivityLogRepository`.
      - Servicio: `ActivityLogService` (registro con IP y User-Agent, filtros por campos — usado ya por otros servicios).
    - Excepciones y validaciones coherentes en servicios.
  - Frontend
    - Página de Gestión de Usuarios (`pages/users`) visible para ADMIN vía `RoleGuard`.
    - Servicios: `userService` (mapa a `/users` y `/admin/users`).

- **Entregables**
  - Administración de usuarios completa para ADMIN.
  - Auditoría de acciones de usuario persistida en BD.

- **Incremento de Producto**
  - Plataforma con gestión de identidades lista para habilitar dominios de negocio.

- **Justificación del orden**
  - La gestión de usuarios y la auditoría son cross-cutting y necesarias antes de otorgar permisos por proyecto o invitar colaboradores.

---

## Sprint 3 — Proyectos (CRUD) y base de ACL (modelo/repositorio)

- **Objetivo del Sprint**
  Implementar el dominio de Proyectos (creación, consulta, actualización, eliminación y cambio de estado) y preparar la base de control de accesos (modelo y repositorio) requerida por la lógica de negocio.

- **Historias de Usuario**
  - Como asesor o administrador, quiero crear y gestionar proyectos, para organizar el trabajo documental por iniciativa.
  - Como dueño de un proyecto, quiero actualizar su información y estado, para reflejar su ciclo de vida.

- **Funcionalidades desarrolladas**
  - CRUD de proyectos y cambio de estado (`ACTIVO`, `DESPRIORIZADO`, `ARCHIVADO`).
  - Listado de proyectos según rol/propiedad (owner y, si aplica, accesos existentes).
  - Base de ACL lista: `ProjectAccess` + `ProjectAccessRepository` (sin endpoints de gestión aún).
  - Auditoría de acciones en proyectos.

- **Tareas técnicas**
  - Backend
    - Módulo `project`:
      - Entidades: `Project`, `ProjectStatus`.
      - Repositorio: `ProjectRepository`.
      - Servicio: `ProjectService` (reglas por rol y owner, uso de `ProjectAccessRepository` para accesos existentes, auditoría).
      - Controlador: `ProjectController` (`/api/v1/projects`, `PATCH /{id}/status`).
    - Preparación de ACL (base):
      - Entidad: `ProjectAccess`.
      - Repositorio: `ProjectAccessRepository`.
  - Frontend
    - Páginas: `pages/projects` (lista), `pages/project-detail` (detalle básico).
    - Servicio: `projectService`.

- **Entregables**
  - Gestión de proyectos funcional para ADMIN/ASESOR (owner mantiene control total).
  - Estructura de ACL disponible a nivel de persistencia para el siguiente sprint.

- **Incremento de Producto**
  - Dominio de Proyectos utilizable de extremo a extremo, con base para escalamiento de permisos.

- **Justificación del orden**
  - Los documentos y las invitaciones dependen lógicamente de la existencia de proyectos y de una base de ACL.

---

## Sprint 4 — Permisos (ACL) por Proyecto y Documentos

- **Objetivo del Sprint**
  Habilitar la gestión granular de accesos por proyecto (ACL) y la gestión documental (subir, listar, descargar, editar metadatos y eliminar), respetando permisos.

- **Historias de Usuario**
  - Como dueño de proyecto o administrador, quiero otorgar y revocar accesos a otros usuarios, para colaborar de forma controlada.
  - Como usuario con permiso de edición, quiero subir y actualizar documentos, para mantener el repositorio del proyecto.
  - Como usuario con permiso de visualización, quiero listar y descargar documentos, para acceder a la información.

- **Funcionalidades desarrolladas**
  - Gestión de permisos por proyecto (grant, update, revoke, consulta de mis permisos y accesos por usuario/proyecto).
  - Gestión documental con almacenamiento local (`uploads/`), prioridad (`ALTA`, `MEDIA`, `BAJA`) y metadatos.
  - Validación estricta de permisos: `canView`, `canEdit`, `canDelete`, `canDeprioritize`, `canInvite`.
  - Auditoría de todas las acciones relevantes en permisos y documentos.

- **Tareas técnicas**
  - Backend
    - Módulo `permission`:
      - Servicio: `PermissionService` (reglas de owner/ADMIN e invitado con `canInvite`).
      - Controlador: `PermissionController` (`/api/v1/projects/{projectId}/access`).
    - Módulo `document`:
      - Entidades/Repo: `Document`, `Priority`, `DocumentRepository`.
      - Servicio: `DocumentService` (subida multipart, escritura/lectura desde `file.upload-dir=uploads`, validaciones de permisos, auditoría).
      - Controlador: `DocumentController` (`/api/v1/projects/{projectId}/documents`).
      - Config de tamaño y multipart en `application.properties`.
  - Frontend
    - Gestión de permisos: `permissionService` y pantallas/acciones en detalle de proyecto.
    - Documentos: `documentService` y `sections/documents/upload-modal.tsx` (drag & drop, validaciones de tamaño/tipo, progreso visual), listado/descarga/edición/borrado desde la vista de proyecto.

- **Entregables**
  - Colaboración real por proyecto con ACL.
  - Repositorio documental por proyecto totalmente operativo con controles de acceso.

- **Incremento de Producto**
  - Colaboración segura y manejo documental de extremo a extremo en cada proyecto.

- **Justificación del orden**
  - Los documentos dependen de permisos para garantizar seguridad. Primero ACL, luego documentos sobre esa base.

---

## Sprint 5 — Invitaciones y Panel Administrativo (Métricas y Auditoría)

- **Objetivo del Sprint**
  Completar el flujo colaborativo mediante invitaciones y entregar capacidades administrativas para monitoreo y gobierno del sistema.

- **Historias de Usuario**
  - Como dueño de proyecto o usuario con permiso de invitar, quiero enviar invitaciones con permisos predefinidos, para incorporar colaboradores.
  - Como usuario invitado, quiero aceptar o rechazar invitaciones, para decidir mi participación.
  - Como administrador, quiero ver métricas y actividad del sistema, para tomar decisiones operativas.

- **Funcionalidades desarrolladas**
  - Invitaciones: crear, listar por proyecto, listar “mis invitaciones”, aceptar y rechazar.
  - Panel Admin: métricas de usuarios/proyectos/documentos/almacenamiento y resumen de proyectos.
  - Exploración de auditoría vía filtros (por fechas, módulo, acción, usuario) desde `AdminController`.

- **Tareas técnicas**
  - Backend
    - Módulo `invitation`:
      - Entidades/Repo: `Invitation`, `InvitationStatus`, `InvitationRepository`.
      - Servicio: `InvitationService` (creación con permisos iniciales, aceptación → creación de `ProjectAccess`, rechazo; auditoría).
      - Controlador: `InvitationController` (`/api/v1/invitations` y `/api/v1/projects/{projectId}/invitations`).
    - Módulo `admin`:
      - DTOs: `DashboardMetrics`, `ProjectSummary`, `UserActivity`.
      - Servicio: `AdminService` (cálculos agregados simples con repositorios).
      - Controlador: `AdminController` (`/api/v1/admin/dashboard`, `/api/v1/admin/projects/summary`, `/api/v1/admin/activity`, `/api/v1/admin/users`).
  - Frontend
    - Navegación y vistas: `pages/invitations`, `pages/dashboard` y `pages/audit` (acceso solo ADMIN donde corresponde).
    - Servicios: `invitationService`, `adminService`.

- **Entregables**
  - Flujo completo de invitaciones y gestión de accesos resultante.
  - Panel administrativo con métricas y consulta de actividad.

- **Incremento de Producto**
  - Sistema listo para operación multiusuario con gobierno y trazabilidad administrativa.

- **Justificación del orden**
  - Las invitaciones dependen de Proyectos y ACL. El panel admin tiene sentido una vez existen datos de usuarios, proyectos, documentos y logs generados por los sprints previos.

---

## Sprint 6 — Chat de Proyecto (IA con contexto de documentos vía SSE)

- **Objetivo del Sprint**
  Habilitar un asistente de IA por proyecto que responda en flujo continuo (SSE) usando como contexto los documentos seleccionados del proyecto y el historial reciente de la conversación, respetando permisos.

- **Historias de Usuario**
  - Como usuario con acceso de visualización a un proyecto, quiero hacer preguntas sobre sus documentos, para obtener respuestas rápidas y contextualizadas.
  - Como colaborador, quiero seleccionar qué documentos usar como base, para orientar la respuesta de la IA.
  - Como administrador/owner, quiero que el chat respete los permisos (canView) y no exponga información de otros proyectos, para mantener seguridad y confidencialidad.

- **Funcionalidades desarrolladas**
  - Endpoint de chat por proyecto con respuesta en streaming (SSE) y grounding en documentos seleccionados: `POST /api/v1/projects/{projectId}/chat` (`text/event-stream`).
  - Validación de acceso por proyecto: ADMIN/owner o `ProjectAccess.canView` obligatorio.
  - Construcción de contexto: prompt del sistema, historial reciente y adjuntos de documentos (cargados a Gemini y referenciados por URI).
  - Frontend: panel lateral de chat en detalle de proyecto, selección de documentos (chips), envío de mensaje y render de respuesta incremental con soporte de markdown básico (negrita/itálica).

- **Tareas técnicas**
  - Backend
    - Controlador: `ChatController` (`/api/v1/projects/{projectId}/chat`, `POST`, produce `text/event-stream`).
    - Servicio: `ChatService` (`chat`) con:
      - `validateProjectAccess` (ADMIN/owner o `ProjectAccess.canView`).
      - Construcción de input: prompt del sistema, `history` (`ChatHistoryEntry`), `documentIds` → lectura local y carga en Gemini (`GeminiClient.getOrUploadFile`).
      - Emisión de eventos SSE: `text`, `complete`, `error`.
    - Cliente IA: `GeminiClient` (subida de archivos con API Gemini y `interactions` en SSE), caché local de URIs (`CachedGeminiFile`, TTL ~48h).
    - DTOs: `ChatMessageRequest`, `ChatHistoryEntry`.
    - Configuración: `application.properties` (`gemini.api.key`, `gemini.api.base-url`, `gemini.model.default`, `file.upload-dir`).
  - Frontend
    - Servicio: `chatService.ts` (fetch al endpoint, parseo manual de SSE con `onText`/`onComplete`/`onError`).
    - UI: `ProjectChat` (panel lateral, selección de documentos, historial acotado a ~10 mensajes, markdown básico) integrado en `ProjectDetailView` con burbuja flotante.
    - Reutilización de `documentService.getDocumentsByProject` para poblar documentos seleccionables.

- **Entregables**
  - Asistente de proyecto operativo con respuestas en streaming y grounding en documentos seleccionados.
  - Validación de permisos en backend y selección explícita de documentos en frontend.
  - Configuración de Gemini documentada y parametrizada por entorno.

- **Incremento de Producto**
  - Capacidad de Q&A contextual por proyecto, acelerando la consulta y comprensión de la documentación existente.

- **Justificación del orden**
  - Depende de módulos previos: proyectos, permisos (ACL) y documentos. Se incorpora tras el gobierno básico (admin/auditoría) para aprovechar datos y garantizar seguridad.

---

## Tabla resumen

| Sprint | Objetivo | Módulos implementados | Resultado |
|---|---|---|---|
| 0 | Descubrimiento y entendimiento del negocio | N/A (análisis) | Backlog priorizado, NFRs, riesgos y acuerdos (DoR/DoD) para iniciar el desarrollo |
| 1 | Fundacionales y Autenticación (JWT) | `auth` (login, perfil, cambio contraseña), `security`, `common`, `config` | Autenticación segura, Swagger y base de frontend con guards |
| 2 | Gestión de Usuarios y Auditoría base | `auth` (User CRUD), `admin` (list users), `audit` (log base) | Administración de usuarios (ADMIN) y trazabilidad |
| 3 | Proyectos (CRUD) + base ACL | `project` y base `permission` (modelo/repo) | Gestión de proyectos lista y estructura ACL preparada |
| 4 | Permisos (ACL) y Documentos | `permission`, `document` | Colaboración controlada y repositorio documental por proyecto |
| 5 | Invitaciones y Panel Admin | `invitation`, `admin` (dashboard, activity) | Flujo de invitaciones completo y gobierno del sistema |
| 6 | Chat de Proyecto (IA + SSE) | `chat` (controller, service, client), `frontend` (ProjectChat, chatService) | Q&A contextual por proyecto con respuestas en streaming |

---

## Consistencia con Scrum y con la arquitectura real

- **Scrum**
  - Cada Sprint entrega un incremento potencialmente desplegable, tangible y verificable (JWT y login; User CRUD + auditoría; Proyectos; ACL + Documentos; Invitaciones + Panel Admin).
  - El backlog implícito se ordenó por dependencias técnicas y valor de negocio, favoreciendo la entrega temprana de capacidades transversales (seguridad y auditoría) y evolucionando hacia colaboración y gobierno.
  - Las historias de usuario guían la funcionalidad y los criterios de aceptación se reflejan en endpoints, validaciones y vistas.

- **Arquitectura real del proyecto**
  - El orden respeta dependencias del código: `document` depende de `project` y `permission`; `invitation` depende de `project`, `permission` y `auth`; `admin` aprovecha datos agregados y `audit`.
  - Las tareas técnicas referencian exactamente las clases, endpoints y configuraciones presentes (p. ej., `SecurityConfig`, `JwtAuthenticationFilter`, `PermissionController`, `DocumentService`, etc.).
  - No se incluyen capacidades inexistentes (p. ej., IA, almacenamiento en la nube, logout backend), ciñéndose al repositorio.

---

## Incrementos de Producto por Sprint

- Sprint 0: Alineación de visión y alcance, backlog priorizado, NFRs y riesgos documentados, DoR/DoD acordados.
- Sprint 1: Autenticación JWT y base de aplicación (backend y frontend) con documentación operativa.
- Sprint 2: Administración de usuarios (rol ADMIN) con auditoría de acciones clave.
- Sprint 3: Gestión de proyectos con control por rol/propiedad y base de ACL persistida.
- Sprint 4: Colaboración controlada por proyecto (ACL) y gestión documental completa.
- Sprint 5: Invitaciones para sumar colaboradores y panel administrativo con métricas y exploración de actividad.
- Sprint 6: Asistente de chat por proyecto con SSE y grounding en documentos seleccionados.
