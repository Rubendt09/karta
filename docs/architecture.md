# Documento de Arquitectura - Sistema Clínico Oftalmológico (SCO)

## 1. Visión General

El SCO es un **monolito modular** desarrollado con Spring Boot 3.2.1 y Java 21 para la gestión integral de una clínica oftalmológica. La arquitectura modular permite separar responsabilidades por dominios de negocio manteniendo un despliegue unificado, facilitando el mantenimiento y escalabilidad futura.

### Stack Tecnológico
- **Java 21** - Lenguaje principal
- **Spring Boot 3.2.1** - Framework principal
- **Spring Data JPA** - ORM y acceso a datos
- **PostgreSQL 16** - Base de datos relacional
- **Spring Security + JWT** - Autenticación y autorización
- **Swagger/OpenAPI 2.3.0** - Documentación de API
- **Lombok** - Reducción de código boilerplate
- **Docker & Docker Compose** - Contenedorización y despliegue

---

## 2. Estructura del Proyecto

```
sco/
├── src/main/java/pe/clgismondi/sco/
│   ├── ScoApplication.java          # Punto de entrada de la aplicación
│   ├── common/                      # Componentes compartidos entre módulos
│   ├── config/                      # Configuraciones globales
│   ├── modules/                     # Módulos de negocio (dominios)
│   └── security/                    # Configuración de seguridad
├── src/main/resources/
│   └── application.properties       # Configuración de la aplicación
├── pom.xml                          # Dependencias Maven
├── Dockerfile                       # Imagen Docker del backend
└── docker-compose.yml               # Orquestación de servicios
```

---

## 3. Arquitectura Modular

### 3.1 Patrón por Módulo

Cada módulo de negocio sigue una **arquitectura en capas estándar**:

```
modules/{modulo}/
├── controller/    # Controladores REST (API Layer)
├── dto/          # Data Transfer Objects (Request/Response)
├── model/        # Entidades JPA (Domain Layer)
├── repository/   # Repositorios Spring Data JPA (Data Access Layer)
└── service/      # Lógica de negocio (Service Layer)
```

**Flujo de datos:** Controller → Service → Repository → Database

---

## 4. Descripción de Módulos

### 4.1 Módulo `auth` - Autenticación y Usuarios
**Ubicación:** `src/main/java/pe/clgismondi/sco/modules/auth/`

**Responsabilidades:**
- Registro de usuarios
- Autenticación mediante JWT
- Gestión de tokens de acceso
- Implementación de UserDetails de Spring Security

**Componentes:**
- `AuthController` - Endpoints de login y registro
- `AuthService` - Lógica de autenticación y generación de tokens
- `User` - Entidad de usuario con implementación UserDetails
- `UserRepository` - Acceso a datos de usuarios
- DTOs: `LoginRequest`, `LoginResponse`, `RegisterRequest`

---

### 4.2 Módulo `patient` - Gestión de Pacientes
**Ubicación:** `src/main/java/pe/clgismondi/sco/modules/patient/`

**Responsabilidades:**
- CRUD de pacientes
- Gestión de información demográfica
- Validación de documentos únicos (DNI)
- Paginación de resultados

**Componentes:**
- `PatientController` - Endpoints de gestión de pacientes
- `PatientService` - Lógica de negocio de pacientes
- `Patient` - Entidad con datos demográficos y médicos básicos
- `PatientRepository` - Acceso a datos con consultas personalizadas
- DTOs: `CreatePatientRequest`, `UpdatePatientRequest`, `PatientResponse`, `PagedResponse`

---

### 4.3 Módulo `appointment` - Gestión de Citas
**Ubicación:** `src/main/java/pe/clgismondi/sco/modules/appointment/`

**Responsabilidades:**
- Programación de citas médicas
- Gestión de disponibilidad
- Relación con pacientes y doctores

**Componentes:**
- `AppointmentController` - Endpoints de citas
- `AppointmentService` - Lógica de programación
- `Appointment` - Entidad de cita
- `AppointmentRepository` - Acceso a datos
- DTOs: `CreateAppointmentRequest`, `UpdateAppointmentRequest`, `AppointmentDTO`

---

### 4.4 Módulo `medicalrecord` - Historias Médicas
**Ubicación:** `src/main/java/pe/clgismondi/sco/modules/medicalrecord/`

**Responsabilidades:**
- Gestión de historias clínicas
- Registro de diagnósticos y tratamientos
- Integración con mediciones oculares

**Componentes:**
- `MedicalRecordController` - Endpoints de historias
- `MedicalRecordService` - Lógica de historias médicas
- `MedicalRecord` - Entidad de historia clínica
- `MedicalRecordRepository` - Acceso a datos
- DTOs específicos del dominio

---

### 4.5 Módulo `ocularmeasurement` - Mediciones Oculares
**Ubicación:** `src/main/java/pe/clgismondi/sco/modules/ocularmeasurement/`

**Responsabilidades:**
- Registro de mediciones oftalmológicas
- Datos de exámenes visuales
- Integración con historias médicas

**Componentes:**
- `OcularMeasurementController` - Endpoints de mediciones
- `OcularMeasurementService` - Lógica de mediciones
- `OcularMeasurement` - Entidad de medición ocular
- `OcularMeasurementRepository` - Acceso a datos
- DTOs específicos del dominio

---

## 5. Componentes Transversales

### 5.1 `common/` - Componentes Compartidos
**Ubicación:** `src/main/java/pe/clgismondi/sco/common/`

**Subcomponentes:**

- **constants/** - Constantes globales
  - `AppConstants` - Mensajes, códigos de error, valores configurables

- **dto/** - DTOs reutilizables
  - `ResponseDto` - Estructura estándar de respuestas API

- **exception/** - Manejo de excepciones
  - `GlobalExceptionHandler` - Manejo centralizado de excepciones
  - `ResourceNotFoundException` - Excepción para recursos no encontrados

- **util/** - Utilidades
  - `DateUtil` - Funciones de manipulación de fechas

---

### 5.2 `config/` - Configuraciones Globales
**Ubicación:** `src/main/java/pe/clgismondi/sco/config/`

- **CorsConfig** - Configuración de CORS para permitir acceso desde el frontend
- **OpenApiConfig** - Configuración de Swagger/OpenAPI para documentación automática de la API

---

### 5.3 `security/` - Seguridad
**Ubicación:** `src/main/java/pe/clgismondi/sco/security/`

- **SecurityConfig** - Configuración de Spring Security (rutas públicas/privadas)
- **JwtService** - Generación y validación de tokens JWT
- **JwtAuthenticationFilter** - Filtro para interceptar y validar tokens en cada request
- **UserDetailsServiceImpl** - Carga de usuarios desde la base de datos para autenticación

---

## 6. Flujo de Autenticación

1. **Login:** Usuario envía credenciales → `AuthController.login()` → `AuthService.authenticate()` → Validación contra BD → Generación JWT → Retorno de token
2. **Request Autenticado:** Cliente envía token en header → `JwtAuthenticationFilter` valida token → `SecurityConfig` autoriza acceso → Controller procesa request

---

## 7. Base de Datos

**Motor:** PostgreSQL 16  
**Gestión:** Spring Data JPA con Hibernate  
**Estrategia:** DDL auto-update (desarrollo)  

**Tablas principales:**
- `users` - Usuarios del sistema
- `patients` - Pacientes
- `appointments` - Citas
- `medical_records` - Historias médicas
- `ocular_measurements` - Mediciones oculares

---

## 8. Despliegue

### Docker Compose
- **postgres:** Contenedor PostgreSQL 16 con persistencia de datos
- **backend:** Contenedor Spring Boot expuesto en puerto 8080

### Comandos
```bash
# Iniciar servicios
docker-compose up -d

# Construir y ejecutar localmente
mvn clean install
mvn spring-boot:run
```

---

## 9. API Documentation

**Swagger UI:** http://localhost:8080/swagger-ui.html  
**OpenAPI JSON:** http://localhost:8080/v3/api-docs  

Todos los endpoints (excepto auth) requieren token JWT en el header `Authorization: Bearer <token>`

---

## 10. Buenas Prácticas Implementadas

1. **Separación por dominios:** Cada módulo representa un bounded context de negocio
2. **DTOs:** Separación entre entidades de base de datos y objetos de transferencia
3. **Manejo centralizado de excepciones:** Consistencia en respuestas de error
4. **Paginación:** Evitar carga excesiva de datos en endpoints de listado
5. **Validación:** Uso de Bean Validation (javax.validation)
6. **Auditoría:** Campos `created_at` y `updated_at` en todas las entidades
7. **Documentación automática:** OpenAPI/Swagger para documentación viva de la API
8. **Seguridad:** JWT con Spring Security para protección de endpoints
9. **Configuración externa:** application.properties para configuración separada del código
10. **Contenedorización:** Docker para reproducibilidad del ambiente

---

## 11. Guía para Nuevos Proyectos

Este patrón de arquitectura puede replicarse siguiendo estos pasos:

1. **Crear estructura base:** `common/`, `config/`, `security/`, `modules/`
2. **Definir módulos:** Identificar bounded contexts del dominio
3. **Implementar estructura por módulo:** controller/dto/model/repository/service
4. **Configurar seguridad:** Implementar JWT + Spring Security
5. **Agregar documentación:** Configurar OpenAPI
6. **Preparar despliegue:** Dockerfile + docker-compose.yml
7. **Establecer excepciones globales:** GlobalExceptionHandler + excepciones custom
8. **Definir DTOs comunes:** ResponseDto para respuestas estándar

---

## 12. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vue)                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/JSON
                            │ JWT Token
┌───────────────────────────▼─────────────────────────────────┐
│                    API Gateway (Nginx opcional)              │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Spring Boot Application (Port 8080)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Security Layer                       │  │
│  │  JwtAuthenticationFilter → SecurityConfig             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Controller Layer                      │  │
│  │  AuthController │ PatientController │ ...             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Service Layer                        │  │
│  │  AuthService │ PatientService │ ...                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Repository Layer                       │  │
│  │  UserRepository │ PatientRepository │ ...              │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Common Components                    │  │
│  │  GlobalExceptionHandler │ ResponseDto │ Utils         │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ JDBC
┌───────────────────────────▼─────────────────────────────────┐
│              PostgreSQL Database (Port 5432)                 │
│  users │ patients │ appointments │ medical_records │ ...    │
└─────────────────────────────────────────────────────────────┘
```

---

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Autor:** Equipo de Desarrollo Clínica Gismondi