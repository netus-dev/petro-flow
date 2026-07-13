# Feature Specification: Navegación Modular y Seguridad Centralizada

**Feature Branch**: `004-split-dashboard-module`  
**Created**: 2026-07-12  
**Status**: Draft  
**Input**: User description: "Reorganizar la estructura de navegación y la seguridad de PetroFlow para que el Dashboard sea un módulo analítico independiente, cada módulo operativo tenga su propia URL de primer nivel, compartan la misma interfaz de navegación lateral y barra superior, y cualquier acceso no autorizado sea bloqueado y redirigido automáticamente al inicio de sesión."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acceso Directo a un Módulo Operativo (Priority: P1)

Como operador de campo, quiero poder acceder directamente al módulo de Requisiciones o de Timesheet desde un enlace o marcador sin tener que pasar primero por el Dashboard Principal, de modo que llego de inmediato a la herramienta que necesito usar.

**Why this priority**: Es el cambio de mayor impacto para el usuario diario. Elimina la percepción de que los módulos son sub-secciones del Dashboard y los posiciona como herramientas operativas de primer nivel dentro del sistema.

**Independent Test**: Se puede probar de forma aislada accediendo directamente a la URL `/requisitions` en el navegador, verificando que la pantalla carga correctamente con la barra lateral y la barra superior visibles, sin redirigir a `/dashboard/requisitions`.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado en el sistema, **When** navega directamente a la dirección del módulo de Requisiciones (e.g., `/requisitions`), **Then** el sistema muestra la pantalla de Requisiciones con la barra lateral de navegación y la barra superior activas y sin errores.
2. **Given** un usuario autenticado en el sistema, **When** navega directamente a la dirección del módulo de Timesheet (e.g., `/timesheet`), **Then** el sistema muestra la pantalla de Timesheet con la barra lateral y la barra superior activas.
3. **Given** un usuario autenticado en el sistema, **When** accede a una dirección antigua del estilo `/dashboard/requisitions`, **Then** el sistema muestra la pantalla correcta del módulo (con redirección o por compatibilidad) sin generar un error 404.

---

### User Story 2 - Dashboard como Vista Analítica Exclusiva (Priority: P2)

Como supervisor de operaciones, quiero que la dirección `/dashboard` sea exclusivamente la vista consolidada de métricas y KPIs operativos, para tener un punto de referencia claro que me dé el panorama general del sistema.

**Why this priority**: Establece la identidad correcta del Dashboard como módulo analítico y no como contenedor, mejorando la claridad conceptual del sistema para los administradores y supervisores.

**Independent Test**: Se puede probar accediendo a `/dashboard` y verificando que la pantalla muestra únicamente la vista de métricas y KPIs, sin sub-rutas que expongan módulos operativos bajo ese prefijo.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** accede a `/dashboard`, **Then** el sistema muestra la pantalla de métricas y KPIs operativos (la vista actual del Dashboard Principal).
2. **Given** un usuario autenticado, **When** accede a `/dashboard`, **Then** la barra lateral de navegación muestra el Dashboard como un elemento del menú activo, al mismo nivel que Requisiciones, Timesheet y otros módulos.

---

### User Story 3 - Experiencia de Navegación Consistente (Priority: P2)

Como cualquier usuario del sistema, quiero que la barra lateral de navegación y la barra superior estén siempre presentes sin importar a qué módulo acceda, para que la transición entre herramientas sea fluida y no pierda el contexto de dónde estoy dentro del sistema.

**Why this priority**: Garantiza la coherencia visual y funcional de la aplicación. Una experiencia fragmentada generaría confusión y desconfianza en la plataforma.

**Independent Test**: Se puede probar navegando entre al menos tres módulos distintos (e.g., Dashboard → Requisiciones → Timesheet) y verificando que la barra lateral y la barra superior permanecen visibles y funcionales en cada pantalla sin recargas completas de la interfaz.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado navegando en cualquier módulo, **When** hace clic en un ítem del menú lateral para ir a otro módulo, **Then** la nueva pantalla carga manteniendo la barra lateral y la barra superior intactas, sin parpadeos ni recargas completas de la interfaz.
2. **Given** un usuario autenticado en cualquier módulo, **When** observa la barra lateral, **Then** el ítem del módulo actual aparece resaltado/activo, indicando la ubicación actual dentro del sistema.

---

### User Story 4 - Protección Automática de Acceso (Priority: P1)

Como administrador del sistema, quiero que cualquier intento de acceder a cualquier sección protegida sin haber iniciado sesión sea bloqueado automáticamente antes de que la pantalla cargue, para garantizar que la información del sistema no quede expuesta a usuarios no autorizados.

**Why this priority**: Es un requisito de seguridad crítico. Sin esta protección, un usuario podría acceder a datos operativos sensibles (requisiciones, horómetros, trazabilidad) simplemente navegando a la URL directamente.

**Independent Test**: Se puede probar cerrando sesión completamente y luego intentando acceder directamente a la URL de un módulo protegido (e.g., `/requisitions`) desde el navegador, verificando que el sistema redirige inmediatamente a la pantalla de inicio de sesión.

**Acceptance Scenarios**:

1. **Given** un usuario que no ha iniciado sesión, **When** intenta acceder directamente a cualquier módulo del sistema (e.g., `/dashboard`, `/requisitions`, `/timesheet`, `/settings`), **Then** el sistema lo redirige automáticamente a la pantalla de inicio de sesión (`/auth/login`) antes de mostrar cualquier contenido protegido.
2. **Given** un usuario que ya inició sesión correctamente, **When** intenta acceder a la pantalla de inicio de sesión (`/auth/login`), **Then** el sistema lo redirige automáticamente a su espacio de trabajo principal (`/dashboard`), evitando que vea la pantalla de acceso innecesariamente.
3. **Given** un usuario no autenticado que es redirigido a `/auth/login`, **When** inicia sesión exitosamente, **Then** el sistema lo lleva a la pantalla de inicio de su espacio de trabajo.

---

### Edge Cases

- ¿Qué ocurre si un usuario con sesión activa pero expirada intenta navegar entre módulos? El sistema debe detectarlo y redirigirlo al inicio de sesión sin mostrar contenido protegido.
- ¿Qué sucede si el usuario intenta acceder a una URL de módulo que no existe? El sistema debe mostrar una pantalla de error estándar (no encontrado) sin exponer rutas del sistema.
- ¿Qué ocurre con las URLs antiguas del estilo `/dashboard/requisitions` que puedan estar guardadas en marcadores de los usuarios? El sistema no debe mostrar un error 404 abrupto; debe redirigir o resolver correctamente.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE exponer cada módulo operativo (Requisiciones, Trazabilidad, Timesheet, E-Learning, Horómetros, Look-a-head, Notificaciones, Configuración, Soporte, Administración) bajo su propia dirección de primer nivel, sin el prefijo `/dashboard/`.
- **FR-002**: El sistema DEBE mantener la dirección `/dashboard` exclusivamente para la vista consolidada de métricas operativas (el Dashboard Principal actual).
- **FR-003**: Todos los módulos operativos y el Dashboard Principal DEBEN compartir el mismo componente de barra lateral de navegación y barra superior, sin duplicación de código de interfaz.
- **FR-004**: El sistema DEBE verificar el estado de autenticación del usuario de forma automática en cada solicitud de acceso a cualquier módulo protegido, antes de renderizar cualquier contenido.
- **FR-005**: El sistema DEBE redirigir a la pantalla de inicio de sesión (`/auth/login`) a cualquier usuario no autenticado que intente acceder a una ruta protegida.
- **FR-006**: El sistema DEBE redirigir al espacio de trabajo principal (`/dashboard`) a cualquier usuario autenticado que intente acceder a la pantalla de inicio de sesión.
- **FR-007**: El sistema DEBE actualizar todos los enlaces de navegación interna (barra lateral, tarjetas de módulo, botones de acción) para reflejar las nuevas URLs de primer nivel.
- **FR-008**: El sistema DEBE manejar adecuadamente las sesiones de usuario expiradas, forzando la re-autenticación sin exponer datos protegidos.

### Key Entities

- **Módulo Operativo**: Cualquier sección funcional del sistema (Requisiciones, Timesheet, etc.) que requiere autenticación y comparte la misma interfaz de navegación lateral. Se identifica por su URL de primer nivel.
- **Sesión de Usuario**: Registro activo del estado de autenticación de un usuario. Tiene un período de validez y puede expirar.
- **Ruta Protegida**: Cualquier dirección del sistema que requiere que el usuario haya iniciado sesión para acceder a su contenido.
- **Ruta Pública**: Cualquier dirección del sistema accesible sin autenticación (e.g., `/auth/login`, página de inicio).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los módulos operativos son accesibles desde URLs de primer nivel (e.g., `/requisitions`, `/timesheet`) sin que el prefijo `/dashboard/` esté presente en las direcciones de sub-módulos.
- **SC-002**: Un usuario no autenticado que accede a cualquier ruta protegida es redirigido a la pantalla de inicio de sesión en menos de 1 segundo, sin que se muestre ningún fragmento de contenido protegido durante la transición.
- **SC-003**: La barra lateral de navegación y la barra superior están presentes y funcionales en el 100% de los módulos del sistema sin excepción.
- **SC-004**: Un usuario autenticado que navega entre cualquier combinación de módulos no experimenta recargas completas de la interfaz de navegación (barra lateral/barra superior).
- **SC-005**: El 100% de los enlaces de navegación interna del sistema (menú lateral, tarjetas de módulo, breadcrumbs, botones de retorno) apuntan a las nuevas URLs actualizadas sin generar errores 404.

---

## Assumptions

- El sistema de autenticación actual (gestión de sesiones mediante Supabase) se mantiene sin cambios en su lógica de negocio; solo se reorganiza dónde y cuándo se verifica el estado de sesión.
- Los módulos actuales que se encuentran bajo `app/dashboard/` en la estructura del proyecto son: `admin`, `e-learning`, `hour-meters`, `look-a-head`, `notificaciones`, `requisitions`, `settings`, `soporte`, `timesheet` y `trazabilidad`.
- La pantalla del Dashboard Principal (`app/dashboard/page.tsx`) conserva su URL `/dashboard` y su contenido actual; no se migra ni renombra.
- Las URLs antiguas del estilo `/dashboard/[módulo]` no requieren redirecciones permanentes de tipo 301 en esta iteración, pero no deben generar errores 404 críticos. Se asume que los usuarios adoptarán las nuevas URLs a través del menú de navegación actualizado.
- Todos los usuarios del sistema (operadores, supervisores, administradores) requieren autenticación para acceder a cualquier módulo; no existe contenido parcialmente público dentro de los módulos operativos.
- El alcance de esta especificación es la restructuración de navegación y la capa de seguridad de acceso. Los cambios en el contenido, datos o lógica de negocio de cada módulo quedan fuera del alcance de esta feature.
