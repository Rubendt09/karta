# Descripción Detallada de UI - Sistema de Gestión Documental (SGD)

Este documento describe en detalle la interfaz de usuario del Sistema de Gestión Documental, diseñada para ser utilizada como referencia para generar mockups mediante IA.

---

## 1. Estilo Visual General

### Paleta de Colores
- **Primario:** Azul corporativo (#2563EB) - Para botones principales, enlaces activos
- **Secundario:** Gris claro (#F3F4F6) - Para fondos de secciones
- **Acento:** Verde (#10B981) - Para estados de éxito, acciones positivas
- **Advertencia:** Amarillo (#F59E0B) - Para alertas, estados pendientes
- **Error:** Rojo (#EF4444) - Para errores, acciones destructivas
- **Texto principal:** Gris oscuro (#1F2937)
- **Texto secundario:** Gris medio (#6B7280)
- **Fondo principal:** Blanco (#FFFFFF)

### Tipografía
- **Fuente principal:** Inter o Roboto (sans-serif)
- **Títulos:** 24px-32px, peso 600-700
- **Subtítulos:** 18px-20px, peso 500-600
- **Cuerpo de texto:** 14px-16px, peso 400
- **Texto pequeño:** 12px, peso 400-500

### Componentes UI Reutilizables
- **Botones:** Bordes redondeados (8px), padding 12px 24px, sombra suave
- **Cards:** Bordes redondeados (12px), sombra suave, padding 20px
- **Inputs:** Bordes redondeados (6px), padding 10px 14px, borde gris claro
- **Tablas:** Filas con hover, headers con fondo gris claro, bordes sutiles
- **Modales:** Overlay oscuro semitransparente, card centrada con animación fade-in
- **Toasts:** Notificaciones flotantes en esquina superior derecha

---

## 2. Estructura de Navegación

### Layout Principal
- **Header fijo:** Logo, navegación principal, perfil de usuario, botón logout
- **Sidebar izquierdo (opcional):** Navegación secundaria por módulos
- **Área de contenido principal:** Contenido dinámico según la sección
- **Footer:** Copyright, versión, enlaces de ayuda

### Rutas de Navegación
- `/login` - Pantalla de login
- `/register` - Pantalla de registro (solo accesible por invitación)
- `/projects` - Lista de proyectos (Mis Proyectos)
- `/projects/new` - Crear nuevo proyecto
- `/projects/:id` - Detalle de proyecto
- `/projects/:id/documents` - Documentos del proyecto
- `/projects/:id/access` - Gestión de accesos del proyecto
- `/projects/:id/invitations` - Invitaciones del proyecto
- `/invitations` - Mis invitaciones (para aceptar/rechazar)
- `/admin/dashboard` - Dashboard administrativo (solo ADMIN)
- `/admin/users` - Gestión de usuarios (solo ADMIN)
- `/admin/activity` - Auditoría de actividad (solo ADMIN)

---

## 3. Pantalla de Login

### Endpoint: POST /api/v1/auth/login

### Descripción Visual
**Layout:** Centrado verticalmente y horizontalmente en pantalla completa

**Componentes:**
1. **Card de login:**
   - Ancho: 400px
   - Fondo: Blanco con sombra suave
   - Bordes redondeados: 16px
   - Padding: 40px

2. **Header del card:**
   - Logo del sistema (centrado)
   - Título: "Iniciar Sesión"
   - Subtítulo: "Sistema de Gestión Documental"

3. **Formulario:**
   - Campo "Email": Input tipo email, placeholder "ejemplo@correo.com"
   - Campo "Contraseña": Input tipo password con botón mostrar/ocultar
   - Botón "Iniciar Sesión": Botón primario, ancho completo
   - Link "¿Olvidaste tu contraseña?": Texto pequeño, centrado

4. **Footer del card:**
   - Texto: "¿No tienes cuenta?"
   - Link: "Solicitar acceso" (si es invitado con invitación pendiente)

### Estados
- **Inicial:** Campos vacíos, botón deshabilitado
- **Validando:** Spinner en botón, campos deshabilitados
- **Error:** Mensaje de error en rojo sobre el formulario
- **Éxito:** Redirección a /projects

### Validaciones
- Email: Formato válido
- Contraseña: Mínimo 8 caracteres
- Mostrar errores en tiempo real bajo cada campo

---

## 4. Pantalla de Registro de Invitado

### Endpoint: POST /api/v1/auth/register-invited

### Descripción Visual
**Layout:** Similar a login, centrado en pantalla

**Componentes:**
1. **Card de registro:**
   - Ancho: 450px
   - Fondo: Blanco con sombra suave
   - Bordes redondeados: 16px
   - Padding: 40px

2. **Header del card:**
   - Logo del sistema
   - Título: "Completar Registro"
   - Subtítulo: "Estás aceptando una invitación al proyecto [Nombre del Proyecto]"

3. **Información de la invitación (read-only):**
   - Email pre-llenado (deshabilitado)
   - Nombre del proyecto (badge con color de acento)
   - Permisos otorgados (lista con checkmarks)

4. **Formulario:**
   - Campo "Nombre completo": Input tipo text
   - Campo "Contraseña temporal": Input tipo password (pre-llenada, oculta)
   - Campo "Nueva contraseña": Input tipo password con validador de fortaleza
   - Campo "Confirmar contraseña": Input tipo password
   - Botón "Aceptar Invitación": Botón primario, ancho completo
   - Botón "Rechazar": Botón secundario (borde), ancho completo

5. **Indicador de fortaleza de contraseña:**
   - Barra de progreso con colores (rojo → amarillo → verde)
   - Texto descriptivo: "Débil", "Media", "Fuerte"

### Estados
- **Inicial:** Campos vacíos excepto email
- **Validando:** Spinner en botón
- **Error:** Mensaje de error específico
- **Éxito:** Mensaje de éxito, redirección a /projects

### Validaciones
- Nombre: Mínimo 3 caracteres
- Nueva contraseña: Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial
- Confirmar contraseña: Debe coincidir con nueva contraseña

---

## 5. Pantalla "Mis Proyectos"

### Endpoint: GET /api/v1/projects

### Descripción Visual
**Layout:** Header + Sidebar + Área de contenido

**Header:**
- Logo del sistema
- Título: "Mis Proyectos"
- Usuario actual con dropdown (perfil, logout)

**Sidebar (izquierda):**
- Item activo: "Mis Proyectos" (icono de carpeta)
- Item: "Mis Invitaciones" (icono de sobre) - si hay invitaciones pendientes
- Item: "Dashboard" (icono de gráficos) - solo si rol es ADMIN
- Item inferior: "Cerrar Sesión" (icono de logout)

**Área de contenido principal:**
1. **Barra de herramientas superior:**
   - Campo de búsqueda: "Buscar proyectos..." (input con icono de lupa)
   - Filtros: Dropdown de estado (Todos, Activos, Despriorizados, Archivados)
   - Botón "Crear Proyecto": Botón primario (icono de +)
   - Vista: Toggle entre Grid y Lista

2. **Contenido de proyectos (Vista Grid):**
   - Grid de cards de proyectos (3 columnas responsive)
   - Cada card contiene:
     - Icono de carpeta (color según estado)
     - Nombre del proyecto (título, truncado si es largo)
     - Descripción (texto secundario, 2 líneas máximo)
     - Badge de estado (ACTIVO: verde, DESPRIORIZADO: amarillo, ARCHIVADO: gris)
     - Metadata: "Creado el [fecha]" + "Documentos: [count]"
     - Badge de rol: "Propietario" o "Invitado"
     - Botón "Ver Detalle": Botón secundario pequeño
     - Menú de acciones (3 puntos): Editar, Cambiar Estado, Eliminar (si tiene permisos)

3. **Contenido de proyectos (Vista Lista):**
   - Tabla con columnas:
     - Nombre (con icono de carpeta)
     - Descripción
     - Estado (badge)
     - Documentos (count)
     - Rol (badge)
     - Creado por
     - Fecha de creación
     - Acciones (botones: Ver, Editar, Eliminar)

4. **Paginación:**
   - Inferior: "Mostrando 1-10 de 25 proyectos"
   - Botones: Anterior, Siguiente, números de página

5. **Estado vacío:**
   - Icono de carpeta vacía (gris grande)
   - Título: "No tienes proyectos"
   - Subtítulo: "Crea tu primer proyecto para empezar"
   - Botón: "Crear Proyecto"

### Estados
- **Cargando:** Skeleton de cards o tabla
- **Con datos:** Grid o lista de proyectos
- **Vacío:** Estado vacío con CTA
- **Error:** Mensaje de error con botón "Reintentar"

### Acciones por Rol
- **ADMIN:** Ver todos los proyectos del sistema
- **ASESOR:** Ver proyectos creados + proyectos donde tiene acceso
- **INVITADO:** Solo ver proyectos donde tiene acceso

---

## 6. Pantalla "Crear Proyecto"

### Endpoint: POST /api/v1/projects

### Descripción Visual
**Layout:** Modal o página dedicada

**Modal (recomendado):**
- Overlay oscuro semitransparente
- Card centrada (600px ancho)
- Header: "Crear Nuevo Proyecto" + botón X (cerrar)

**Formulario:**
1. **Campo "Nombre del Proyecto":**
   - Input tipo text
   - Placeholder: "Ej: Proyecto Fiscal 2024"
   - Caracteres restantes: "0/100"
   - Validación: Requerido, máximo 100 caracteres

2. **Campo "Descripción":**
   - Textarea
   - Placeholder: "Describe el propósito y alcance del proyecto..."
   - Filas: 4
   - Caracteres restantes: "0/500"
   - Validación: Requerido, máximo 500 caracteres

3. **Campo "Estado Inicial":**
   - Radio buttons o dropdown
   - Opciones: "Activo" (seleccionado por defecto), "Despriorizado", "Archivado"
   - Iconos de color para cada estado

4. **Preview de la card:**
   - Miniatura de cómo se verá la card del proyecto
   - Actualización en tiempo real mientras se escribe

5. **Botones de acción:**
   - Botón "Cancelar": Botón secundario
   - Botón "Crear Proyecto": Botón primario (deshabilitado hasta validación)

### Estados
- **Inicial:** Campos vacíos
- **Escribiendo:** Preview actualizado, validación en tiempo real
- **Enviando:** Spinner en botón, campos deshabilitados
- **Error:** Mensaje de error específico
- **Éxito:** Modal cierra, toast de éxito, redirección a /projects

### Validaciones
- Nombre: Requerido, 3-100 caracteres
- Descripción: Requerido, 10-500 caracteres
- Estado: Requerido

---

## 7. Pantalla "Detalle de Proyecto"

### Endpoint: GET /api/v1/projects/{id}

### Descripción Visual
**Layout:** Header + Breadcrumbs + Contenido

**Header:**
- Breadcrumbs: "Mis Proyectos > [Nombre del Proyecto]"
- Título: Nombre del proyecto (grande)
- Badges: Estado + Rol (Propietario/Invitado)

**Barra de herramientas:**
- Botón "Editar": Icono de lápiz (si tiene permiso EDITAR)
- Botón "Cambiar Estado": Dropdown (si tiene permiso DESPRIORIZAR)
- Botón "Gestionar Accesos": Icono de usuarios (si tiene permiso INVITAR)
- Botón "Eliminar": Icono de basura, color rojo (si tiene permiso ELIMINAR)

**Secciones del contenido:**

1. **Sección "Información General":**
   - Card con layout de 2 columnas
   - Columna izquierda:
     - Label: "Descripción"
     - Texto: Descripción completa del proyecto
   - Columna derecha:
     - Label: "Creado por"
     - Valor: Nombre del creador
     - Label: "Fecha de creación"
     - Valor: Fecha formateada
     - Label: "Estado"
     - Valor: Badge con estado
     - Label: "Documentos"
     - Valor: Count de documentos

2. **Sección "Documentos" (Tabs):**
   - Tabs: "Documentos" (activo), "Accesos", "Invitaciones"
   - Barra de herramientas de documentos:
     - Campo de búsqueda
     - Filtro de prioridad (Todos, Alta, Media, Baja)
     - Botón "Subir Documento": Botón primario (si tiene permiso EDITAR)
   - Grid de documentos (similar a proyectos):
     - Cada card de documento:
       - Icono según tipo (PDF, DOCX, XLSX, Imagen)
       - Nombre del archivo
       - Badge de prioridad (ALTA: rojo, MEDIA: amarillo, BAJA: verde)
       - Metadata: Tamaño, fecha de subida, subido por
       - Botón "Descargar": Icono de descarga
       - Menú de acciones: Ver, Editar metadatos, Eliminar (según permisos)

3. **Sección "Accesos" (Tab):**
   - Lista de usuarios con acceso al proyecto
   - Tabla con columnas:
     - Usuario (avatar + nombre + email)
     - Rol en el proyecto
     - Permisos (checkmarks: Ver, Editar, Eliminar, Despriorizar, Invitar)
     - Otorgado por
     - Fecha de otorgamiento
     - Acciones (Editar permisos, Revocar acceso)
   - Botón "Otorgar Acceso": Botón primario (si tiene permiso INVITAR)

4. **Sección "Invitaciones" (Tab):**
   - Lista de invitaciones pendientes
   - Tabla con columnas:
     - Email del invitado
     - Estado (PENDIENTE, ACEPTADA, RECHAZADA)
     - Permisos asignados
     - Enviada por
     - Fecha de envío
     - Expira en
     - Acciones (Reenviar, Cancelar)
   - Botón "Invitar Usuario": Botón primario (si tiene permiso INVITAR)

### Estados
- **Cargando:** Skeleton de contenido
- **Con datos:** Todas las secciones visibles
- **Sin permisos:** Mensaje "No tienes permiso para ver este proyecto"
- **Error:** Mensaje de error con botón "Volver"

### Acciones por Permiso
- **VER:** Ver toda la información
- **EDITAR:** Subir documentos, editar metadatos
- **ELIMINAR:** Eliminar documentos y proyecto
- **DESPRIORIZAR:** Cambiar estado del proyecto
- **INVITAR:** Gestionar accesos y enviar invitaciones
- **DAR_QUITAR_ACCESO:** Otorgar y revocar permisos

---

## 8. Pantalla "Subir Documento"

### Endpoint: POST /api/v1/projects/{id}/documents

### Descripción Visual
**Layout:** Modal

**Modal:**
- Overlay oscuro semitransparente
- Card centrada (500px ancho)
- Header: "Subir Documento" + botón X

**Formulario:**
1. **Zona de drag & drop:**
   - Área grande con borde punteado
   - Icono de nube de subida (gris grande)
   - Texto: "Arrastra y suelta tu archivo aquí"
   - Subtexto: "o haz clic para seleccionar"
   - Texto pequeño: "Máximo 10MB. Formatos: PDF, DOCX, XLSX, JPG, PNG"
   - Cuando hay archivo seleccionado:
     - Icono del tipo de archivo
     - Nombre del archivo
     - Tamaño del archivo
     - Botón "Cambiar archivo"

2. **Campo "Nombre del Documento":**
   - Input tipo text
   - Pre-llenado con nombre del archivo (editable)
   - Placeholder: "Nombre descriptivo del documento"

3. **Campo "Prioridad":**
   - Radio buttons con colores
   - Opciones: "Alta" (rojo), "Media" (amarillo), "Baja" (verde)
   - Selección por defecto: "Media"

4. **Campo "Descripción" (opcional):**
   - Textarea
   - Placeholder: "Notas adicionales sobre el documento..."
   - Filas: 2

5. **Barra de progreso:**
   - Oculta inicialmente
   - Visible durante subida: Barra de progreso con porcentaje

6. **Botones de acción:**
   - Botón "Cancelar": Botón secundario
   - Botón "Subir": Botón primario (deshabilitado hasta seleccionar archivo)

### Estados
- **Inicial:** Zona de drag & drop vacía
- **Archivo seleccionado:** Información del archivo visible
- **Subiendo:** Barra de progreso, botones deshabilitados
- **Error:** Mensaje de error (archivo muy grande, formato no permitido)
- **Éxito:** Modal cierra, toast de éxito, documento aparece en lista

### Validaciones
- Archivo: Requerido, máximo 10MB, formatos permitidos
- Nombre: Requerido, máximo 100 caracteres
- Prioridad: Requerida

---

## 9. Pantalla "Gestionar Accesos"

### Endpoint: POST /api/v1/projects/{id}/access

### Descripción Visual
**Layout:** Modal

**Modal:**
- Overlay oscuro semitransparente
- Card centrada (600px ancho)
- Header: "Otorgar Acceso a [Nombre del Proyecto]" + botón X

**Formulario:**
1. **Campo "Buscar Usuario":**
   - Input tipo text con autocompletado
   - Placeholder: "Buscar usuario por email o nombre..."
   - Dropdown con resultados de búsqueda (debounce de 300ms)
   - Cada resultado:
     - Avatar
     - Nombre
     - Email
     - Rol actual (ADMIN, ASESOR, INVITADO)
   - Al seleccionar: Usuario se agrega a la lista

2. **Lista de usuarios seleccionados:**
   - Chips con nombre del usuario
   - Botón X para remover de la lista

3. **Sección "Permisos a Otorgar":**
   - Grid de checkboxes con descripciones
   - Cada checkbox:
     - Checkbox grande
     - Nombre del permiso (VER, EDITAR, ELIMINAR, etc.)
     - Descripción corta del permiso
     - Icono representativo
   - Permisos:
     - [x] VER - "Puede ver y descargar documentos"
     - [ ] EDITAR - "Puede subir y editar documentos"
     - [ ] ELIMINAR - "Puede eliminar documentos"
     - [ ] DESPRIORIZAR - "Puede cambiar estado de prioridad"
     - [ ] INVITAR - "Puede invitar otros usuarios"

4. **Preview de permisos:**
   - Resumen visual: "Usuario X tendrá permisos: VER, EDITAR"

5. **Botones de acción:**
   - Botón "Cancelar": Botón secundario
   - Botón "Otorgar Acceso": Botón primario

### Estados
- **Inicial:** Campo de búsqueda vacío, permisos deseleccionados
- **Usuario seleccionado:** Chip visible, permisos seleccionables
- **Buscando:** Spinner en campo de búsqueda
- **Enviando:** Spinner en botón, campos deshabilitados
- **Error:** Mensaje de error (usuario ya tiene acceso, permisos inválidos)
- **Éxito:** Modal cierra, toast de éxito, usuario aparece en lista de accesos

### Validaciones
- Usuario: Requerido, no debe tener acceso previo
- Permisos: Al menos VER debe estar seleccionado

---

## 10. Pantalla "Invitar Usuario"

### Endpoint: POST /api/v1/invitations

### Descripción Visual
**Layout:** Modal

**Modal:**
- Overlay oscuro semitransparente
- Card centrada (550px ancho)
- Header: "Invitar Usuario al Proyecto [Nombre]" + botón X

**Formulario:**
1. **Campo "Email del Invitado":**
   - Input tipo email
   - Placeholder: "ejemplo@correo.com"
   - Validación de formato en tiempo real

2. **Campo "Mensaje Personalizado" (opcional):**
   - Textarea
   - Placeholder: "Añade un mensaje personal para la invitación..."
   - Filas: 3
   - Pre-llenado con template: "Te invito a colaborar en el proyecto [Nombre]"

3. **Sección "Permisos Iniciales":**
   - Igual que pantalla de gestionar accesos
   - Checkboxes con descripciones
   - Por defecto: VER seleccionado

4. **Sección "Configuración de Expiración":**
   - Label: "La invitación expirará en:"
   - Radio buttons: "7 días" (defecto), "14 días", "30 días"
   - Fecha de expiración calculada y mostrada

5. **Preview del email:**
   - Card con preview del email que se enviará
   - Asunto: "Invitación al proyecto [Nombre]"
   - Cuerpo: Mensaje + instrucciones + enlace de aceptación

6. **Botones de acción:**
   - Botón "Cancelar": Botón secundario
   - Botón "Enviar Invitación": Botón primario

### Estados
- **Inicial:** Campos vacíos
- **Completando:** Preview actualizado en tiempo real
- **Enviando:** Spinner en botón
- **Error:** Mensaje de error (email inválido, usuario ya existe)
- **Éxito:** Modal cierra, toast de éxito, invitación aparece en lista

### Validaciones
- Email: Requerido, formato válido
- Permisos: Al menos VER seleccionado
- Expiración: Requerida

---

## 11. Pantalla "Mis Invitaciones"

### Endpoint: GET /api/v1/invitations (pendientes del usuario actual)

### Descripción Visual
**Layout:** Header + Sidebar + Contenido

**Header:**
- Logo del sistema
- Título: "Mis Invitaciones"
- Badge con count de invitaciones pendientes

**Sidebar:** Igual que "Mis Proyectos"

**Área de contenido principal:**
1. **Barra de filtros:**
   - Tabs: "Pendientes" (activo), "Aceptadas", "Rechazadas", "Todas"
   - Campo de búsqueda por email o nombre de proyecto

2. **Lista de invitaciones (Cards):**
   - Cada card:
     - Icono de sobre (color según estado)
     - Nombre del proyecto (título)
     - Email del invitador
     - Fecha de envío
     - Expira en (countdown si está pendiente)
     - Permisos otorgados (badges)
     - Botones de acción:
       - "Aceptar": Botón primario (verde)
       - "Rechazar": Botón secundario (rojo)
       - "Ver Detalles": Botón terciario

3. **Estado vacío:**
   - Icono de sobre vacío
   - Título: "No tienes invitaciones pendientes"
   - Subtítulo: "Cuando te inviten a un proyecto, aparecerá aquí"

### Estados
- **Cargando:** Skeleton de cards
- **Con datos:** Lista de invitaciones
- **Vacío:** Estado vacío
- **Expirada:** Card con estado "Expirada", sin botones de acción

### Acciones
- **Aceptar:** Abre modal de aceptación (completar registro)
- **Rechazar:** Confirma acción, actualiza estado
- **Ver Detalles:** Abre modal con detalles completos

---

## 12. Pantalla "Dashboard Administrativo"

### Endpoint: GET /api/v1/admin/dashboard

### Descripción Visual
**Layout:** Header + Sidebar + Contenido

**Header:**
- Logo del sistema
- Título: "Dashboard Administrativo"
- Badge "ADMIN" (color primario)

**Sidebar:**
- Item: "Mis Proyectos"
- Item activo: "Dashboard" (icono de gráficos)
- Item: "Gestión de Usuarios" (icono de usuarios)
- Item: "Auditoría" (icono de reloj)
- Item inferior: "Cerrar Sesión"

**Área de contenido principal:**

1. **Sección "Métricas Generales" (Cards):**
   - Grid de 4 cards (2x2):
     - Card "Total de Usuarios":
       - Número grande (ej: 156)
       - Icono de usuarios
       - Tendencia: "+12% este mes" (flecha verde)
     - Card "Total de Proyectos":
       - Número grande (ej: 43)
       - Icono de carpetas
       - Tendencia: "+5 este mes"
     - Card "Total de Documentos":
       - Número grande (ej: 1,247)
       - Icono de archivos
       - Tendencia: "+89 esta semana"
     - Card "Almacenamiento Usado":
       - Número grande (ej: 45.2 GB)
       - Barra de progreso (45% de 100GB)
       - Icono de disco

2. **Sección "Gráficos de Actividad":**
   - Gráfico de líneas: "Usuarios Activos por Día" (últimos 30 días)
   - Gráfico de barras: "Documentos Subidos por Semana"
   - Gráfico de dona: "Distribución de Roles" (ADMIN, ASESOR, INVITADO)

3. **Sección "Proyectos Más Activos" (Tabla):**
   - Tabla con columnas:
     - Nombre del proyecto
     - Documentos (count)
     - Usuarios con acceso (count)
     - Última actividad
     - Estado
   - Ordenable por cada columna
   - Link "Ver todos los proyectos"

4. **Sección "Usuarios Recientes" (Lista):**
   - Lista horizontal de avatares con nombres
   - Badge "Nuevo" para usuarios registrados en últimos 7 días
   - Link "Ver todos los usuarios"

5. **Sección "Alertas del Sistema":**
   - Lista de alertas con iconos de color:
     - Almacenamiento casi lleno (amarillo)
     - Usuarios inactivos por 30 días (azul)
     - Invitaciones expiradas (gris)
   - Cada alerta con botón "Ver detalles"

### Estados
- **Cargando:** Skeleton de métricas y gráficos
- **Con datos:** Todas las secciones visibles
- **Error:** Mensaje de error con botón "Recargar"

### Actualización
- Datos se actualizan automáticamente cada 60 segundos
- Botón "Actualizar ahora" manual

---

## 13. Pantalla "Gestión de Usuarios" (Admin)

### Endpoint: GET /api/v1/admin/users, POST, PUT, DELETE

### Descripción Visual
**Layout:** Header + Sidebar + Contenido

**Header:**
- Logo del sistema
- Título: "Gestión de Usuarios"
- Botón "Crear Usuario": Botón primario

**Sidebar:** Igual que Dashboard

**Área de contenido principal:**

1. **Barra de herramientas:**
   - Campo de búsqueda: "Buscar por nombre o email..."
   - Filtro de rol: Dropdown (Todos, ADMIN, ASESOR, INVITADO)
   - Filtro de estado: Dropdown (Todos, Activos, Inactivos)
   - Vista: Toggle entre Grid y Lista

2. **Tabla de usuarios (Vista Lista):**
   - Columnas:
     - Avatar (32x32px)
     - Nombre (con link a perfil)
     - Email
     - Rol (badge con color)
     - Estado (badge: Activo/Inactivo)
     - Fecha de registro
     - Último acceso
     - Acciones:
       - Botón "Editar": Icono de lápiz
       - Botón "Desactivar": Icono de pause (si está activo)
       - Botón "Activar": Icono de play (si está inactivo)
       - Botón "Eliminar": Icono de basura (rojo)

3. **Grid de usuarios (Vista Grid):**
   - Cards de usuario:
     - Avatar grande (64x64px)
     - Nombre
     - Email
     - Badge de rol
     - Badge de estado
     - Metadata: "Registrado el [fecha]"
     - Botones de acción (iconos)

4. **Paginación:**
   - Inferior: "Mostrando 1-10 de 156 usuarios"
   - Botones de navegación

### Modal "Crear Usuario":**
- Overlay oscuro
- Card centrada (500px)
- Formulario:
  - Campo "Nombre completo"
  - Campo "Email"
  - Campo "Contraseña" (con generador automático)
  - Campo "Rol": Dropdown (ADMIN, ASESOR, INVITADO)
  - Checkbox "Enviar email de bienvenida"
  - Botones: Cancelar, Crear

### Modal "Editar Usuario":**
- Similar a crear, pero campos pre-llenados
- Campo "Estado": Toggle Activo/Inactivo
- Campo "Rol": Dropdown editable
- Botones: Cancelar, Guardar

### Estados
- **Cargando:** Skeleton de tabla/grid
- **Con datos:** Lista de usuarios
- **Vacío:** Estado vacío con CTA "Crear Usuario"
- **Error:** Mensaje de error

---

## 14. Pantalla "Auditoría de Actividad" (Admin)

### Endpoint: GET /api/v1/admin/activity

### Descripción Visual
**Layout:** Header + Sidebar + Contenido

**Header:**
- Logo del sistema
- Título: "Auditoría de Actividad"

**Sidebar:** Igual que Dashboard

**Área de contenido principal:**

1. **Barra de filtros:**
   - Rango de fechas: Date picker (inicio - fin)
   - Filtro de usuario: Dropdown con búsqueda
   - Filtro de acción: Dropdown (Todas, Login, Crear Proyecto, Subir Documento, etc.)
   - Filtro de módulo: Dropdown (Auth, Projects, Documents, Permissions)
   - Botón "Exportar": Icono de descarga

2. **Timeline de actividad:**
   - Lista vertical con timeline
   - Cada item:
     - Timestamp (fecha y hora)
     - Icono según acción (color codificado)
     - Usuario (avatar + nombre)
     - Acción realizada (texto descriptivo)
     - Detalles adicionales (collapsible):
       - IP address
       - User agent
       - Parámetros de la acción
     - Badge de módulo

3. **Resumen de actividad:**
   - Cards con métricas del período seleccionado:
     - Total de acciones
     - Usuarios más activos
     - Acciones más frecuentes
     - Horas pico de actividad

4. **Paginación:**
   - "Mostrando 1-50 de 1,234 acciones"
   - "Cargar más" (infinite scroll)

### Estados
- **Cargando:** Skeleton de timeline
- **Con datos:** Timeline completo
- **Vacío:** "No hay actividad en el período seleccionado"
- **Error:** Mensaje de error

### Filtros de Iconos por Acción
- Login: Icono de entrada (verde)
- Logout: Icono de salida (gris)
- Crear: Icono de plus (azul)
- Editar: Icono de lápiz (amarillo)
- Eliminar: Icono de basura (rojo)
- Subir: Icono de nube (púrpura)
- Descargar: Icono de descarga (cyan)

---

## 15. Pantalla "Editar Documento"

### Endpoint: PUT /api/v1/documents/{id}

### Descripción Visual
**Layout:** Modal

**Modal:**
- Overlay oscuro
- Card centrada (500px)
- Header: "Editar Documento [Nombre]" + botón X

**Formulario:**
1. **Información actual (read-only):**
   - Icono del tipo de archivo
   - Nombre actual del archivo
   - Tamaño
   - Fecha de subida
   - Subido por

2. **Campo "Nuevo Nombre":**
   - Input tipo text
   - Pre-llenado con nombre actual
   - Placeholder: "Nuevo nombre del documento"

3. **Campo "Prioridad":**
   - Radio buttons con colores
   - Selección actual marcada

4. **Campo "Descripción" (si existe):**
   - Textarea
   - Pre-llenado con descripción actual
   - Editable

5. **Sección "Historial de Cambios" (collapsible):**
   - Lista de cambios previos
   - Cada item: Fecha, Usuario, Cambio realizado

6. **Botones de acción:**
   - Botón "Cancelar": Botón secundario
   - Botón "Guardar Cambios": Botón primario

### Estados
- **Inicial:** Campos pre-llenados
- **Modificando:** Campos editados
- **Guardando:** Spinner en botón
- **Error:** Mensaje de error
- **Éxito:** Modal cierra, toast de éxito, documento actualizado en lista

---

## 16. Pantalla "Cambiar Estado de Proyecto"

### Endpoint: PUT /api/v1/projects/{id}/status

### Descripción Visual
**Layout:** Modal pequeño

**Modal:**
- Overlay oscuro
- Card centrada (400px)
- Header: "Cambiar Estado del Proyecto" + botón X

**Contenido:**
1. **Estado actual:**
   - Badge con estado actual
   - Texto: "El proyecto actualmente está [ESTADO]"

2. **Nuevo estado:**
   - Radio buttons grandes con iconos:
     - ACTIVO (icono de check verde)
     - DESPRIORIZADO (icono de pausa amarilla)
     - ARCHIVADO (icono de caja gris)

3. **Descripción del estado:**
   - Texto explicativo del estado seleccionado
   - ACTIVO: "El proyecto es visible y editable para todos los usuarios con acceso"
   - DESPRIORIZADO: "El proyecto sigue accesible pero con menor prioridad en listados"
   - ARCHIVADO: "El proyecto es de solo lectura, no se pueden realizar cambios"

4. **Confirmación:**
   - Checkbox: "Entiendo que esta acción afectará a todos los usuarios con acceso"

5. **Botones de acción:**
   - Botón "Cancelar": Botón secundario
   - Botón "Cambiar Estado": Botón primario (deshabilitado hasta confirmar checkbox)

### Estados
- **Inicial:** Estado actual visible
- **Seleccionado:** Nuevo estado seleccionado, descripción actualizada
- **Confirmado:** Checkbox marcado, botón habilitado
- **Enviando:** Spinner en botón
- **Error:** Mensaje de error
- **Éxito:** Modal cierra, toast de éxito, badge de estado actualizado

---

## 17. Pantalla "Perfil de Usuario"

### Endpoint: GET /api/v1/users/{id} (información propia)

### Descripción Visual
**Layout:** Header + Contenido

**Header:**
- Logo del sistema
- Título: "Mi Perfil"

**Contenido principal:**
1. **Card de perfil:**
   - Layout de 2 columnas
   - Columna izquierda:
     - Avatar grande (128x128px)
     - Botón "Cambiar Avatar" (subir imagen)
   - Columna derecha:
     - Nombre completo (título grande)
     - Email (texto secundario)
     - Badge de rol
     - Badge de estado (Activo)
     - Fecha de registro
     - Último acceso

2. **Sección "Información Personal":**
   - Formulario editable:
     - Campo "Nombre completo"
     - Campo "Email" (read-only si no es ADMIN)
     - Campo "Teléfono" (opcional)
     - Campo "Ubicación" (opcional)
   - Botones: "Cancelar", "Guardar Cambios"

3. **Sección "Seguridad":**
   - Campo "Contraseña actual"
   - Campo "Nueva contraseña"
   - Campo "Confirmar contraseña"
   - Botón "Cambiar Contraseña"
   - Link "¿Olvidaste tu contraseña?"

4. **Sección "Sesiones Activas":**
   - Lista de dispositivos/sesiones:
     - Dispositivo (ej: "Chrome en macOS")
     - Ubicación (ej: "Lima, Perú")
     - IP address
     - Última actividad
     - Botón "Cerrar Sesión" (para cada sesión)
   - Botón "Cerrar Todas las Sesiones"

5. **Sección "Preferencias":**
   - Toggle "Notificaciones por email"
   - Toggle "Notificaciones en app"
   - Dropdown "Idioma"
   - Dropdown "Zona horaria"

### Estados
- **Cargando:** Skeleton de perfil
- **Con datos:** Información completa
- **Editando:** Campos editables habilitados
- **Guardando:** Spinner en botones
- **Error:** Mensaje de error

---

## 18. Pantalla de Error 403 (Sin Permisos)

### Descripción Visual
**Layout:** Centrado en pantalla

**Contenido:**
1. **Icono de error:**
   - Icono grande de candado (rojo)
   - Animación sutil de shake

2. **Título:**
   - "Acceso Denegado"

3. **Subtítulo:**
   - "No tienes permisos para acceder a esta página"

4. **Descripción:**
   - "Si crees que esto es un error, contacta al administrador del sistema"

5. **Botones de acción:**
   - Botón "Volver a Mis Proyectos": Botón primario
   - Botón "Cerrar Sesión": Botón secundario

### Contexto
- Se muestra cuando el backend retorna 403 Forbidden
- Mantiene el header con navegación

---

## 19. Pantalla de Error 404 (No Encontrado)

### Descripción Visual
**Layout:** Centrado en pantalla

**Contenido:**
1. **Icono de error:**
   - Icono grande de página rota (gris)

2. **Título:**
   - "Página No Encontrada"

3. **Subtítulo:**
   - "La página que buscas no existe o ha sido eliminada"

4. **Botones de acción:**
   - Botón "Volver al Inicio": Botón primario
   - Botón "Contactar Soporte": Botón secundario

---

## 20. Pantalla de Error 500 (Error del Servidor)

### Descripción Visual
**Layout:** Centrado en pantalla

**Contenido:**
1. **Icono de error:**
   - Icono grande de servidor caído (rojo)

2. **Título:**
   - "Error del Servidor"

3. **Subtítulo:**
   - "Algo salió mal en nuestros servidores"

4. **Descripción:**
   - "Estamos trabajando para solucionar el problema. Por favor, intenta nuevamente en unos minutos"

5. **Botones de acción:**
   - Botón "Reintentar": Botón primario
   - Botón "Volver al Inicio": Botón secundario

---

## 21. Componentes de Notificación (Toasts)

### Descripción Visual
**Posición:** Esquina superior derecha

**Tipos de Toasts:**
1. **Éxito:**
   - Fondo: Verde
   - Icono: Checkmark
   - Título: "Operación exitosa"
   - Mensaje: Descripción específica
   - Botón: "Deshacer" (si aplica)
   - Auto-close: 5 segundos

2. **Error:**
   - Fondo: Rojo
   - Icono: X
   - Título: "Error"
   - Mensaje: Descripción del error
   - Botón: "Ver detalles"
   - No auto-close (requiere acción)

3. **Advertencia:**
   - Fondo: Amarillo
   - Icono: Exclamación
   - Título: "Advertencia"
   - Mensaje: Descripción
   - Auto-close: 7 segundos

4. **Info:**
   - Fondo: Azul
   - Icono: Info
   - Título: "Información"
   - Mensaje: Descripción
   - Auto-close: 5 segundos

### Animaciones
- Slide-in desde derecha
- Fade-out al cerrar
- Hover pausa auto-close

---

## 22. Componentes de Loading

### Descripción Visual
**Tipos de Loading:**

1. **Spinner global:**
   - Overlay semitransparente sobre toda la pantalla
   - Spinner grande centrado
   - Texto: "Cargando..."

2. **Skeleton de cards:**
   - Card con fondo gris claro
   - Líneas grises pulsando (efecto shimmer)
   - Mantienen estructura de card real

3. **Skeleton de tabla:**
   - Filas con celdas grises pulsando
   - Header visible
   - 5-10 filas de skeleton

4. **Spinner inline:**
   - Spinner pequeño (16px)
   - Aparece junto a texto o botón
   - Usado para acciones rápidas

---

## 23. Responsive Design

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Adaptaciones por Breakpoint

**Mobile (< 640px):**
- Sidebar se convierte en menú hamburguesa
- Grid de cards: 1 columna
- Tablas: Se convierten en cards apiladas
- Modales: Ancho 90% de pantalla
- Header simplificado (solo logo + menú)
- Botones de acción: Iconos en lugar de texto

**Tablet (640px - 1024px):**
- Sidebar colapsable (iconos solo)
- Grid de cards: 2 columnas
- Tablas: Horizontal scroll
- Modales: Ancho 80% de pantalla

**Desktop (> 1024px):**
- Layout completo
- Grid de cards: 3 columnas
- Tablas completas
- Modales: Ancho fijo

---

## 24. Accesibilidad

### Características
- **Contraste:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **Focus visible:** Indicador claro de focus (borde azul)
- **Labels:** Todos los inputs tienen labels asociados
- **ARIA labels:** Iconos y botones sin texto tienen aria-label
- **Keyboard navigation:** Navegación completa con Tab
- **Screen readers:** Textos alternativos para imágenes
- **Error messages:** Asociados a inputs con aria-describedby

### Atajos de Teclado
- `Tab`: Navegar entre elementos interactivos
- `Enter/Space`: Activar botones y links
- `Esc`: Cerrar modales y dropdowns
- `Ctrl/Cmd + K`: Buscar (búsqueda global)
- `Ctrl/Cmd + N`: Crear nuevo proyecto (si tiene permiso)

---

## 25. Dark Mode (Opcional)

### Descripción Visual
**Paleta de colores dark:**
- Fondo principal: #111827
- Fondo secundario: #1F2937
- Fondo de cards: #374151
- Texto principal: #F9FAFB
- Texto secundario: #D1D5DB
- Bordes: #4B5563

**Implementación:**
- Toggle en header para cambiar modo
- Preferencia guardada en localStorage
- Transición suave entre modos (300ms)

---

## 26. Estados de la Aplicación

### Estado de Autenticación
- **No autenticado:** Solo accesible /login, /register
- **Autenticado:** Acceso a todas las rutas según rol
- **Sesión expirada:** Redirección a /login con mensaje

### Estado de Conexión
- **Online:** Funcionalidad completa
- **Offline:** Modo lectura (si aplica), toast de advertencia
- **Reconectando:** Spinner en header, retry automático

### Estado de Carga
- **Inicial:** Skeletons
- **Cargando:** Spinners
- **Éxito:** Datos visibles
- **Error:** Mensaje de error con retry

---

## 27. Guía de Prompts para Generación de Mockups

### Estructura de Prompt Sugerida

Para generar mockups efectivos con IA, usar la siguiente estructura:

```
Crea un mockup de [NOMBRE DE PANTALLA] para un Sistema de Gestión Documental.

CONTEXTO:
- [Descripción breve del propósito de la pantalla]
- Rol del usuario: [ADMIN/ASESOR/INVITADO]
- Endpoint backend: [Método HTTP + Ruta]

LAYOUT:
- [Descripción del layout general]
- [Componentes principales y su posición]

COMPONENTES:
1. [Nombre del componente]
   - [Descripción detallada]
   - [Colores, tamaños, estilos]
   - [Interacciones]

2. [Nombre del componente]
   - [Descripción detallada]
   - [Colores, tamaños, estilos]
   - [Interacciones]

ESTILO VISUAL:
- Paleta de colores: [Especificar colores principales]
- Tipografía: [Fuente, tamaños]
- Estilo: [Moderno, minimalista, corporativo]

ESTADOS:
- Estado inicial: [Descripción]
- Estado de carga: [Descripción]
- Estado con datos: [Descripción]
- Estado de error: [Descripción]
- Estado vacío: [Descripción]

ACCIONES:
- [Lista de acciones posibles y sus efectos]

NOTAS ADICIONALES:
- [Cualquier consideración especial]
```

### Ejemplo de Prompt Completo

```
Crea un mockup de la pantalla "Mis Proyectos" para un Sistema de Gestión Documental.

CONTEXTO:
- Pantalla principal donde los usuarios ven los proyectos a los que tienen acceso
- Rol del usuario: ASESOR (puede crear proyectos y ver los creados por él + invitaciones)
- Endpoint backend: GET /api/v1/projects

LAYOUT:
- Header fijo con logo, título "Mis Proyectos", perfil de usuario
- Sidebar izquierdo con navegación (Mis Proyectos activo, Mis Invitaciones, Dashboard si es ADMIN)
- Área de contenido principal con grid de cards de proyectos

COMPONENTES:
1. Barra de herramientas superior
   - Campo de búsqueda con icono de lupa
   - Filtro dropdown de estado (Todos, Activos, Despriorizados, Archivados)
   - Botón "Crear Proyecto" (primario, azul, icono de +)
   - Toggle vista Grid/Lista

2. Grid de cards de proyectos (3 columnas)
   - Cada card: icono de carpeta (color según estado), nombre del proyecto, descripción (2 líneas), badge de estado, metadata (fecha + count documentos), badge de rol, botón "Ver Detalle", menú de acciones (3 puntos)
   - Cards con sombra suave, bordes redondeados 12px, padding 20px
   - Hover: elevación sutil

3. Estado vacío
   - Icono grande de carpeta vacía (gris)
   - Título "No tienes proyectos"
   - Subtítulo "Crea tu primer proyecto para empezar"
   - Botón "Crear Proyecto"

ESTILO VISUAL:
- Paleta: Primario azul #2563EB, secundario gris #F3F4F6, acento verde #10B981
- Tipografía: Inter, títulos 24px peso 600, cuerpo 14px peso 400
- Estilo: Moderno, limpio, corporativo

ESTADOS:
- Inicial: Skeleton de cards pulsando
- Con datos: Grid de 3 columnas con cards
- Vacío: Icono + mensaje + CTA
- Error: Mensaje de error con botón "Reintentar"

ACCIONES:
- Click en card: Navega a detalle del proyecto
- Click en "Crear Proyecto": Abre modal de creación
- Click en menú de acciones: Dropdown con Editar, Cambiar Estado, Eliminar
- Filtros: Actualiza grid en tiempo real

NOTAS ADICIONALES:
- Responsive: 1 columna en mobile, 2 en tablet, 3 en desktop
- Cards deben mostrar badge de estado con color (ACTIVO verde, DESPRIORIZADO amarillo, ARCHIVADO gris)
- Badge de rol: "Propietario" (azul) o "Invitado" (gris)
```

---

## 28. Resumen de Pantallas por Endpoint

| Pantalla | Endpoint | Método | Roles |
|----------|----------|--------|-------|
| Login | /api/v1/auth/login | POST | Todos |
| Registro Invitado | /api/v1/auth/register-invited | POST | INVITADO |
| Mis Proyectos | /api/v1/projects | GET | Todos |
| Crear Proyecto | /api/v1/projects | POST | ASESOR, ADMIN |
| Detalle Proyecto | /api/v1/projects/{id} | GET | Con permiso VER |
| Editar Proyecto | /api/v1/projects/{id} | PUT | Con permiso EDITAR |
| Eliminar Proyecto | /api/v1/projects/{id} | DELETE | Con permiso ELIMINAR |
| Cambiar Estado Proyecto | /api/v1/projects/{id}/status | PUT | Con permiso DESPRIORIZAR |
| Listar Documentos | /api/v1/projects/{id}/documents | GET | Con permiso VER |
| Subir Documento | /api/v1/projects/{id}/documents | POST | Con permiso EDITAR |
| Descargar Documento | /api/v1/documents/{id} | GET | Con permiso VER |
| Editar Documento | /api/v1/documents/{id} | PUT | Con permiso EDITAR |
| Eliminar Documento | /api/v1/documents/{id} | DELETE | Con permiso ELIMINAR |
| Listar Accesos | /api/v1/projects/{id}/access | GET | Con permiso VER |
| Otorgar Acceso | /api/v1/projects/{id}/access | POST | Con permiso INVITAR |
| Actualizar Acceso | /api/v1/projects/{id}/access/{userId} | PUT | Con permiso DAR_QUITAR_ACCESO |
| Revocar Acceso | /api/v1/projects/{id}/access/{userId} | DELETE | Con permiso DAR_QUITAR_ACCESO |
| Crear Invitación | /api/v1/invitations | POST | Con permiso INVITAR |
| Aceptar Invitación | /api/v1/invitations/{id}/accept | POST | INVITADO |
| Rechazar Invitación | /api/v1/invitations/{id}/reject | POST | INVITADO |
| Mis Invitaciones | /api/v1/projects/{id}/invitations | GET | Con permiso VER |
| Dashboard Admin | /api/v1/admin/dashboard | GET | ADMIN |
| Gestión Usuarios | /api/v1/admin/users | GET, POST, PUT, DELETE | ADMIN |
| Auditoría Actividad | /api/v1/admin/activity | GET | ADMIN |

---

Este documento proporciona una base completa para generar mockups de todas las pantallas del Sistema de Gestión Documental. Cada sección incluye detalles visuales, estados, interacciones y consideraciones de diseño para facilitar la creación mediante herramientas de IA.
