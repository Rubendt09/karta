# Plan de Implementación Backend - Sistema de Gestión Documental (SGD)

Este plan detalla la implementación del backend del Sistema de Gestión Documental utilizando Spring Boot 3.2.1 con arquitectura modular en 8 fases secuenciales.

## Stack Tecnológico

- **Java 21** - Lenguaje principal
- **Spring Boot 3.2.1** - Framework principal
- **Spring Data JPA** - ORM y acceso a datos
- **PostgreSQL 16** - Base de datos relacional
- **Spring Security + JWT** - Autenticación y autorización
- **Swagger/OpenAPI 2.3.0** - Documentación de API
- **Lombok** - Reducción de código boilerplate
- **Docker & Docker Compose** - Contenedorización y despliegue

## Estructura del Proyecto

```
sco/
├── src/main/java/pe/clgismondi/sgd/
│   ├── SgdApplication.java          # Punto de entrada
│   ├── common/                      # Componentes compartidos
│   ├── config/                      # Configuraciones globales
│   ├── modules/                     # Módulos de negocio
│   └── security/                    # Configuración de seguridad
├── src/main/resources/
│   ├── application.properties       # Configuración
│   └── uploads/                     # Almacenamiento local de archivos
├── pom.xml                          # Dependencias Maven
├── Dockerfile                       # Imagen Docker
└── docker-compose.yml               # Orquestación
```

---

## FASE 1: Configuración Base del Proyecto

### Objetivo
Establecer la estructura base del proyecto Spring Boot con configuraciones globales.

### Tareas

1. **Inicializar proyecto Spring Boot 3.2.1**
   - Crear estructura de paquetes: `common/`, `config/`, `security/`, `modules/`
   - Configurar `pom.xml` con dependencias: Spring Boot Starter Web, Data JPA, PostgreSQL, Security, Validation, Lombok, Swagger
   - Configurar `application.properties` con conexión a PostgreSQL

2. **Componentes comunes (`common/`)**
   - `constants/AppConstants` - Mensajes, códigos de error, valores configurables
   - `dto/ResponseDto` - Estructura estándar de respuestas API
   - `exception/GlobalExceptionHandler` - Manejo centralizado de excepciones
   - `exception/ResourceNotFoundException` - Excepción para recursos no encontrados
   - `util/DateUtil` - Funciones de manipulación de fechas

3. **Configuraciones globales (`config/`)**
   - `CorsConfig` - Configuración de CORS para frontend
   - `OpenApiConfig` - Configuración de Swagger/OpenAPI

### Entregables
- Proyecto Spring Boot funcional con estructura modular
- Configuración de PostgreSQL conectada
- Swagger UI accesible en http://localhost:8080/swagger-ui.html

---

## FASE 2: Módulo Auth - Autenticación y Usuarios

### Objetivo
Implementar sistema de autenticación JWT con gestión de usuarios y roles.

### Entidades

**User**
- `id` (UUID, PK)
- `email` (String, Unique)
- `password_hash` (String)
- `name` (String)
- `role` (Enum: ADMIN, ASESOR, INVITADO)
- `active` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Componentes

1. **Model**
   - `User` - Entidad JPA con implementación UserDetails
   - `Role` - Enum con roles: ADMIN, ASESOR, INVITADO

2. **Repository**
   - `UserRepository` - Extiende JpaRepository, métodos custom: findByEmail, existsByEmail

3. **DTOs**
   - `LoginRequest` - email, password
   - `LoginResponse` - token, user info
   - `RegisterRequest` - email, name, role (solo ADMIN puede crear usuarios)
   - `RegisterInvitedRequest` - email, name (para registro de invitados con contraseña generada)
   - `UserResponse` - id, email, name, role, active

4. **Service**
   - `AuthService` - Lógica de autenticación, generación de contraseñas aleatorias alfanuméricas para invitados
   - `UserService` - CRUD de usuarios (solo ADMIN)

5. **Controller**
   - `AuthController` - Endpoints: /login, /register (solo ADMIN), /register-invited
   - `UserController` - Endpoints: /users (listar, crear, actualizar, desactivar) - solo ADMIN

### Seguridad (`security/`)
- `SecurityConfig` - Configuración de Spring Security (rutas públicas/privadas por rol)
- `JwtService` - Generación y validación de tokens JWT
- `JwtAuthenticationFilter` - Filtro para interceptar y validar tokens
- `UserDetailsServiceImpl` - Carga de usuarios desde BD

### Entregables
- Sistema de login funcional con JWT
- Registro de usuarios por ADMIN
- Registro de invitados con contraseña aleatoria alfanumérica
- Protección de endpoints por roles

---

## FASE 3: Módulo Project - Gestión de Proyectos

### Objetivo
Implementar CRUD de proyectos con control de propiedad y estados.

### Entidades

**Project**
- `id` (UUID, PK)
- `name` (String)
- `description` (Text)
- `owner_id` (UUID, FK → User)
- `status` (Enum: ACTIVO, DESPRIORIZADO, ARCHIVADO)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Componentes

1. **Model**
   - `Project` - Entidad JPA
   - `ProjectStatus` - Enum: ACTIVO, DESPRIORIZADO, ARCHIVADO

2. **Repository**
   - `ProjectRepository` - JpaRepository, métodos custom: findByOwnerId, findByStatus

3. **DTOs**
   - `CreateProjectRequest` - name, description
   - `UpdateProjectRequest` - name, description, status
   - `ProjectResponse` - id, name, description, owner_id, status, created_at

4. **Service**
   - `ProjectService` - Lógica de negocio: crear (solo ASESOR/ADMIN), actualizar, eliminar, cambiar estado
   - Validación: solo owner o ADMIN puede modificar/eliminar

5. **Controller**
   - `ProjectController` - Endpoints: /projects (CRUD), /projects/{id}/status (cambiar estado)

### Reglas de Negocio
- ASESOR puede crear proyectos propios
- ADMIN puede crear y gestionar cualquier proyecto
- Solo owner o ADMIN puede modificar/eliminar un proyecto
- Cualquier usuario con permiso puede cambiar estado si tiene `can_deprioritize`

### Entregables
- CRUD completo de proyectos
- Control de propiedad
- Gestión de estados (ACTIVO, DESPRIORIZADO, ARCHIVADO)

---

## FASE 4: Módulo Permission - Control de Accesos (ACL)

### Objetivo
Implementar sistema granular de permisos por proyecto (ACL).

### Entidades

**ProjectAccess**
- `id` (UUID, PK)
- `project_id` (UUID, FK → Project)
- `user_id` (UUID, FK → User)
- `can_view` (Boolean)
- `can_edit` (Boolean)
- `can_delete` (Boolean)
- `can_deprioritize` (Boolean)
- `can_invite` (Boolean)
- `granted_by` (UUID, FK → User)
- `granted_at` (Timestamp)

### Componentes

1. **Model**
   - `ProjectAccess` - Entidad JPA con clave compuesta (project_id, user_id)

2. **Repository**
   - `ProjectAccessRepository` - JpaRepository, métodos custom: findByProjectId, findByUserId, findByProjectIdAndUserId

3. **DTOs**
   - `GrantAccessRequest` - user_id, permisos (can_view, can_edit, can_delete, can_deprioritize, can_invite)
   - `UpdateAccessRequest` - permisos a modificar
   - `ProjectAccessResponse` - id, project_id, user_id, permisos, granted_by, granted_at

4. **Service**
   - `PermissionService` - Lógica de negocio: otorgar acceso, actualizar permisos, revocar acceso
   - Validación: solo owner o ADMIN puede otorgar/revocar accesos
   - Validación: usuario con `can_invite` puede otorgar permisos (configurable)

5. **Controller**
   - `PermissionController` - Endpoints: /projects/{id}/access (grant, list, update, revoke)

### Reglas de Negocio
- Owner tiene todos los permisos por defecto
- Solo owner o ADMIN puede otorgar/revocar accesos
- Permisos son independientes (granularidad)
- Un usuario sin acceso no puede ver el proyecto

### Entregables
- Sistema de permisos granular por proyecto
- Otorgamiento y revocación de accesos
- Validación de permisos en cada operación

---

## FASE 5: Módulo Document - Gestión de Documentos

### Objetivo
Implementar subida, almacenamiento local y gestión de documentos con metadatos y prioridad.

### Entidades

**Document**
- `id` (UUID, PK)
- `project_id` (UUID, FK → Project)
- `name` (String)
- `file_path_storage` (String) - Ruta local en /uploads/
- `file_size` (Long) - Tamaño en bytes
- `mime_type` (String)
- `uploaded_by` (UUID, FK → User)
- `created_at` (Timestamp)
- `priority` (Enum: ALTA, MEDIA, BAJA)

### Componentes

1. **Model**
   - `Document` - Entidad JPA
   - `Priority` - Enum: ALTA, MEDIA, BAJA

2. **Repository**
   - `DocumentRepository` - JpaRepository, métodos custom: findByProjectId, findByUploadedBy

3. **DTOs**
   - `UploadDocumentRequest` - MultipartFile, name, priority
   - `DocumentResponse` - id, project_id, name, file_size, mime_type, uploaded_by, created_at, priority
   - `UpdateDocumentRequest` - name, priority

4. **Service**
   - `DocumentService` - Lógica de negocio: subir archivo, descargar, eliminar, actualizar metadatos
   - Almacenamiento local en `src/main/resources/uploads/`
   - Validación de permisos antes de cada operación
   - Validación de tamaño y tipo de archivo

5. **Controller**
   - `DocumentController` - Endpoints: /projects/{id}/documents (upload, list), /documents/{id} (download, update, delete)

### Configuración de Almacenamiento
- Directorio: `src/main/resources/uploads/`
- Límite de tamaño: configurable en application.properties (ej. 10MB)
- Tipos permitidos: PDF, DOCX, XLSX, JPG, PNG (configurable)

### Reglas de Negocio
- Solo usuarios con `can_view` pueden listar/descargar documentos
- Solo usuarios con `can_edit` pueden subir/actualizar documentos
- Solo usuarios con `can_delete` pueden eliminar documentos
- Documentos heredan permisos del proyecto padre
- Prioridad puede ser modificada por usuarios con `can_deprioritize`

### Entregables
- Subida de archivos con almacenamiento local
- Descarga de documentos
- Gestión de metadatos y prioridad
- Validación de permisos en todas las operaciones

---

## FASE 6: Módulo Invitation - Gestión de Invitados

### Objetivo
Implementar sistema de invitación de usuarios externos con registro automático y asignación de permisos.

### Entidades

**Invitation**
- `id` (UUID, PK)
- `email` (String)
- `project_id` (UUID, FK → Project)
- `invited_by` (UUID, FK → User)
- `status` (Enum: PENDIENTE, ACEPTADA, RECHAZADA)
- `temporary_password` (String) - Contraseña aleatoria alfanumérica
- `expires_at` (Timestamp)
- `created_at` (Timestamp)

### Componentes

1. **Model**
   - `Invitation` - Entidad JPA
   - `InvitationStatus` - Enum: PENDIENTE, ACEPTADA, RECHAZADA

2. **Repository**
   - `InvitationRepository` - JpaRepository, métodos custom: findByEmail, findByProjectId, findByInvitedBy

3. **DTOs**
   - `CreateInvitationRequest` - email, project_id, permisos iniciales
   - `InvitationResponse` - id, email, project_id, status, expires_at
   - `AcceptInvitationRequest` - email, temporary_password, new_password

4. **Service**
   - `InvitationService` - Lógica de negocio: crear invitación, aceptar invitación, rechazar invitación
   - Generación de contraseña aleatoria alfanumérica (12 caracteres)
   - Expiración de invitaciones (7 días por defecto)
   - Al aceptar: crea usuario con rol INVITADO, crea ProjectAccess con permisos asignados

5. **Controller**
   - `InvitationController` - Endpoints: /invitations (create), /invitations/{id}/accept, /invitations/{id}/reject, /projects/{id}/invitations (list)

### Flujo de Invitación
1. Usuario con `can_invite` crea invitación con email y permisos
2. Sistema genera contraseña aleatoria alfanumérica
3. Invitado recibe credenciales (email + contraseña temporal)
4. Invitado acepta invitación y cambia contraseña
5. Sistema crea usuario (INVITADO) y asigna ProjectAccess

### Reglas de Negocio
- Solo usuarios con `can_invite` pueden crear invitaciones
- Solo owner o ADMIN puede revocar invitaciones
- Invitaciones expiran en 7 días
- Un email puede tener múltiples invitaciones a diferentes proyectos
- Al aceptar, el usuario se crea automáticamente con rol INVITADO

### Entregables
- Sistema de invitación funcional
- Generación de contraseñas aleatorias alfanuméricas
- Registro automático de invitados
- Asignación de permisos al aceptar invitación

---

## FASE 7: Módulo Admin - Dashboard Administrativo

### Objetivo
Implementar endpoints para dashboard administrativo con métricas y gestión global.

### Componentes

1. **DTOs**
   - `DashboardMetrics` - total_users, total_projects, total_documents, storage_used
   - `UserActivity` - user_id, action_count, last_activity
   - `ProjectSummary` - project_id, name, document_count, access_count

2. **Service**
   - `AdminService` - Lógica de negocio: calcular métricas, listar actividad, resumen de proyectos
   - Consultas agregadas a la base de datos

3. **Controller**
   - `AdminController` - Endpoints: /admin/dashboard (métricas), /admin/users (gestión global), /admin/activity (auditoría)

### Endpoints

**/admin/dashboard**
- GET - Retorna métricas generales del sistema

**/admin/users**
- GET - Lista todos los usuarios del sistema
- POST - Crea nuevo usuario (cualquier rol)
- PUT/{id} - Actualiza usuario (rol, active)
- DELETE/{id} - Desactiva usuario

**/admin/activity**
- GET - Lista actividad reciente del sistema

### Reglas de Negocio
- Solo rol ADMIN puede acceder a estos endpoints
- Métricas calculadas en tiempo real
- Auditoría de actividad básica

### Entregables
- Dashboard administrativo con métricas
- Gestión global de usuarios
- Auditoría de actividad básica

---

## FASE 8: Dockerización y Despliegue

### Objetivo
Contenedorizar la aplicación y configurar despliegue con Docker Compose.

### Tareas

1. **Dockerfile**
   - Imagen base: openjdk:21-jdk-slim
   - Copiar JAR compilado
   - Exponer puerto 8080
   - Comando de ejecución

2. **docker-compose.yml**
   - Servicio `postgres`: PostgreSQL 16 con persistencia
   - Servicio `backend`: Spring Boot application
   - Volúmenes: datos de PostgreSQL, uploads de archivos
   - Redes: comunicación entre servicios
   - Variables de entorno: DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET

3. **Configuración de volúmenes**
   - `postgres_data` - Persistencia de BD
   - `uploads_data` - Persistencia de archivos subidos

4. **Scripts de construcción**
   - `build.sh` - Compilar con Maven y construir imagen Docker
   - `run.sh` - Iniciar servicios con docker-compose

### Comandos

```bash
# Construir imagen
mvn clean package
docker build -t sgd-backend:1.0 .

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Detener servicios
docker-compose down
```

### Entregables
- Dockerfile funcional
- docker-compose.yml con PostgreSQL y backend
- Persistencia de datos y archivos
- Documentación de comandos de despliegue

---

## Orden de Implementación Recomendado

1. **Fase 1** - Configuración base (fundacional)
2. **Fase 2** - Auth y Usuarios (requerido para todo)
3. **Fase 3** - Projects (depende de Auth)
4. **Fase 4** - Permissions (depende de Projects)
5. **Fase 5** - Documents (depende de Projects y Permissions)
6. **Fase 6** - Invitations (depende de Auth y Permissions)
7. **Fase 7** - Admin Dashboard (depende de todos los módulos)
8. **Fase 8** - Dockerización (puede hacerse en paralelo al final)

---

## Notas Importantes

- **Validación de permisos**: Cada endpoint debe validar permisos antes de ejecutar la operación
- **Auditoría**: Considerar agregar logs de auditoría en operaciones críticas
- **Testing**: Cada fase debe incluir tests unitarios y de integración
- **Documentación**: Mantener Swagger actualizado en cada fase
- **Seguridad**: Revisar configuración de CORS y JWT antes de producción
