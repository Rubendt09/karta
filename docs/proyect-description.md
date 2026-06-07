# Especificación Técnica de MVP: Sistema de Gestión Documental (SGD)

Este documento sirve como guía técnica y de arquitectura para el desarrollo del Producto Mínimo Viable (MVP) de la plataforma de Gestión Documental. Está optimizado para ser procesado por herramientas de asistencia de desarrollo basadas en Inteligencia Artificial (como Windsurf, Cursor, etc.).

## 1. Resumen del Sistema

El sistema es una aplicación web de gestión documental que permite a los usuarios organizar archivos dentro de contenedores llamados **Proyectos**. La visibilidad y gestión de estos proyectos y sus documentos están estrictamente limitadas por un modelo de control de accesos basado en roles (RBAC) y asignaciones específicas de permisos por proyecto (ACL).

## 2. Arquitectura de Software

El sistema adopta una arquitectura desacoplada para garantizar escalabilidad, seguridad e independencia en el despliegue.

```
┌─────────────────────────┐          ┌─────────────────────────┐
│     Frontend (SPA)      │  HTTPS   │    Backend (API Rest)   │
│   Next.js / React / Vue │ ────────>│   Java + Spring Boot    │
│  Desplegado en Vercel   │  (JWT)   │ Desplegado en Azure App │
└─────────────────────────┘          └─────────────────────────┘

```

### Frontend

-   **Tecnología recomendada:** React (Next.js o Vite).
    
-   **Alojamiento:** Vercel.
    
-   **Consumo:** Cliente REST (Axios/Fetch) que consume de forma asíncrona la API del backend mediante HTTPS.
    
-   **Manejo de Estado:** Almacenamiento local seguro del Token JWT para autenticar cada petición.
    

### Backend

-   **Tecnología:** Java con Spring Boot (Maven/Gradle).
    
-   **Arquitectura Interna:** Backend Modular (Separación clara por dominios/módulos: Auth, Users, Projects, Documents, Permissions).
    
-   **Alojamiento:** Azure App Service.
    
-   **Base de Datos:** Relacional (PostgreSQL o MySQL recomendado para el manejo de relaciones jerárquicas y permisos).
    

## 3. Autenticación y Seguridad

La seguridad está gestionada en el backend mediante **Spring Security** utilizando autenticación basada en tokens sin estado (**JWT - JSON Web Tokens**).

### Flujo de Autenticación

1.  El frontend envía credenciales (`username`/`email` y `password`) al endpoint `/api/v1/auth/login`.
    
2.  El backend valida las credenciales y devuelve un token JWT firmado que expira en un tiempo predeterminado.
    
3.  El frontend almacena el JWT y lo adjunta en la cabecera `Authorization: Bearer <token>` en cada petición subsecuente.
    
4.  Spring Security intercepta cada petición, valida el token, extrae los claims (usuario, rol principal) y establece el contexto de seguridad.
    

## 4. Modelo de Roles y Permisos

El sistema implementa un modelo híbrido: **RBAC (Control de Acceso Basado en Roles)** para funciones globales del sistema, y **ACL (Lista de Control de Acceso)** para la gestión y visibilidad interna de los proyectos.

### Roles Globales (RBAC)

-   **ADMIN (Administrador):**
    
    -   Acceso total al sistema.
        
    -   Visualización del Dashboard administrativo.
        
    -   Creación y gestión de todos los usuarios y proyectos de la plataforma.
        
-   **ASESOR:**
    
    -   Usuario operativo estándar.
        
    -   Puede crear sus propios proyectos.
        
    -   Puede subir, categorizar y gestionar documentos.
        
    -   Puede invitar y asignar accesos a otros usuarios (Asesores o Invitados) a los proyectos que ha creado.
        
-   **INVITADO:**
    
    -   Rol de consumo pasivo.
        
    -   Solo puede visualizar los proyectos y documentos a los que se le ha otorgado acceso explícito.
        
    -   No puede crear proyectos de forma autónoma.
        

### Matriz de Permisos Específicos

Los permisos se aplican de manera granular para determinar qué acciones puede realizar un usuario sobre un proyecto o documento:

| Permiso | Descripción | ADMIN | ASESOR (Creador) | ASESOR (Invitado) | INVITADO |
|---------|-------------|-------|------------------|-------------------|----------|
| `VER` | Leer metadatos y descargar documentos de un proyecto | Sí | Sí | Con acceso | Con acceso |
| `EDITAR` | Modificar nombres, metadatos o subir nuevos documentos | Sí | Sí | Con acceso | No |
| `ELIMINAR` | Borrar documentos o el proyecto completo | Sí | Sí | No | No |
| `DESPRIORIZAR` | Cambiar el estado de prioridad de un documento/proyecto | Sí | Sí | Con acceso | No |
| `INVITAR` | Invitar nuevos usuarios externos al proyecto | Sí | Sí | Con acceso (opcional) | No |
| `DAR_QUITAR_ACCESO` | Modificar los permisos de otros usuarios dentro del proyecto | Sí | Sí | No | No |


## 5. Estructura de Proyectos y Documentos

La funcionalidad principal radica en la propiedad de los proyectos (carpetas virtuales) y el aislamiento de su contenido.

```
[Proyecto: Nombre_Proyecto] (Creado por: Asesor A)
   ├── Permisos / Accesos otorgados por Asesor A:
   │     ├── Asesor B -> Permiso: VER, EDITAR
   │     └── Invitado C -> Permiso: VER
   │
   └── Documentos cargados:
         ├── Documento1.pdf (Solo visible para Asesor A, Asesor B, Invitado C)
         └── Documento2.xlsx (Solo visible para Asesor A, Asesor B, Invitado C)

```

### Reglas de Negocio Clave

1.  **Aislamiento Estricto:** Un usuario de rol `ASESOR` o `INVITADO` **no puede** ver ni listar ningún proyecto para el cual no sea el creador o no posea un registro explícito de acceso autorizado.
    
2.  **Propiedad:** El creador del proyecto tiene por defecto todos los permisos de administración sobre ese recurso (editar, eliminar, despriorizar, invitar, dar y quitar accesos).
    
3.  **Heredabilidad:** Cualquier documento subido dentro del Proyecto `[Nombre_Proyecto]` hereda automáticamente las restricciones de acceso definidas para dicho proyecto.
    

## 6. Arquitectura del Modelo de Datos (Esquema Conceptual)

### Entidades Principales

1.  **User (Usuario):**
    
    -   `id` (UUID)
        
    -   `email` (String, Unique)
        
    -   `password_hash` (String)
        
    -   `name` (String)
        
    -   `role` (Enum: ADMIN, ASESOR, INVITADO)
        
    -   `active` (Boolean)
        
2.  **Project (Proyecto):**
    
    -   `id` (UUID)
        
    -   `name` (String) - Correspondiente a `[Nombre_Proyecto]`
        
    -   `description` (Text)
        
    -   `owner_id` (UUID, Foreign Key -> User)
        
    -   `created_at` (Timestamp)
        
    -   `status` (Enum: ACTIVO, DESPRIORIZADO, ARCHIVADO)
        
3.  **ProjectAccess (Control de Accesos a Proyectos):**
    
    -   `id` (UUID)
        
    -   `project_id` (UUID, Foreign Key -> Project)
        
    -   `user_id` (UUID, Foreign Key -> User)
        
    -   `can_view` (Boolean)
        
    -   `can_edit` (Boolean)
        
    -   `can_delete` (Boolean)
        
    -   `can_deprioritize` (Boolean)
        
    -   `can_invite` (Boolean)
        
    -   `granted_by` (UUID, Foreign Key -> User)
        
4.  **Document (Documento):**
    
    -   `id` (UUID)
        
    -   `project_id` (UUID, Foreign Key -> Project)
        
    -   `name` (String)
        
    -   `file_path_storage` (String) - Ruta en el almacenamiento seguro (ej. Azure Blob Storage)
        
    -   `mime_type` (String)
        
    -   `uploaded_by` (UUID, Foreign Key -> User)
        
    -   `created_at` (Timestamp)
        
    -   `priority` (Integer / Enum: ALTA, MEDIA, BAJA)
        

## 7. Secciones del Frontend (MVP)

La SPA en Vercel estará estructurada en tres secciones principales accesibles según el rol del usuario autenticado:

### A. Sección "Mis Proyectos" (Asesores, Invitados, Admins)

-   **Para Asesores:** Muestra la lista de proyectos creados por ellos mismos y proyectos de otros asesores donde han sido invitados. Incluye botón para "Crear Proyecto" y acciones para gestionar documentos.
    
-   **Para Invitados:** Muestra únicamente la lista de proyectos donde han recibido acceso, permitiéndoles solo previsualizar o descargar los documentos adjuntos de acuerdo a su permiso de lectura.
    
-   **Para Admins:** Vista global de proyectos en el sistema.
    

### B. Sección "Dashboard" (Solo rol ADMIN)

-   **Acceso:** Protegido mediante router guards en frontend y validación de roles en Spring Security en backend.
    
-   **Funciones:**
    
    -   Métricas generales (Total de usuarios, almacenamiento consumido, proyectos activos).
        
    -   Panel de gestión de usuarios (Crear asesores/invitados, editar roles, desactivar cuentas).
        
    -   Auditoría de actividad del sistema.
        

### C. Sección "Mis Invitados" (Admins, Asesores)

-   **Para Asesores:** Permite visualizar los usuarios que ha invitado a sus respectivos proyectos. Permite enviar invitaciones a nuevos usuarios para registrarse en la plataforma y asociarlos de manera directa al acceso de un proyecto específico.
    
-   **Para Admins:** Vista y control de todas las invitaciones pendientes y activas del sistema.
    
