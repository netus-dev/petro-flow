# Feature Specification: Panel de Plan de Mantenimiento en Dashboard de Horómetros

**Feature Branch**: `003-horometros-panel-mantenimiento`  
**Created**: 2026-06-23  
**Status**: Draft  
**Input**: User description: "Cuando demos click en una de las tarjetas que muestran los horómetros de los activos, se debe aperturar a la derecha del grid de tarjetas un contenedor con la información del plan de mantenimiento a realizarle al activo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver plan de mantenimiento al seleccionar un activo (Priority: P1)

Un operador o supervisor de mantenimiento está revisando el dashboard de horómetros y desea ver qué actividades de mantenimiento están programadas para un activo específico. Al hacer clic sobre la tarjeta del activo (por ejemplo, "Motor Principal MP-01"), el sistema despliega a la derecha del grid de tarjetas un panel lateral con las actividades detalladas del plan de mantenimiento correspondiente al próximo umbral de horas del activo.

**Why this priority**: Es el flujo de valor principal de la funcionalidad. Sin este comportamiento, la feature no existe.

**Independent Test**: Puede ser probado de forma aislada accediendo al Dashboard de Horómetros, haciendo clic en cualquier tarjeta de activo y verificando que el panel de mantenimiento aparece a la derecha del grid.

**Acceptance Scenarios**:

1. **Given** el usuario está en el Dashboard de Horómetros con tarjetas de activos cargadas, **When** hace clic en la tarjeta de un activo (ej. "Motor Principal MP-01"), **Then** se despliega a la derecha del grid (como hijo del mismo contenedor padre, NO dentro del grid) un panel vertical con el plan de mantenimiento del activo, cuya altura coincide con la del grid de tarjetas.
2. **Given** el panel de mantenimiento está abierto para un activo, **When** el usuario hace clic en una tarjeta diferente, **Then** el panel se actualiza mostrando el plan de mantenimiento del nuevo activo seleccionado sin cerrarse.
3. **Given** el panel de mantenimiento está abierto, **When** el usuario hace clic nuevamente en la misma tarjeta activa, **Then** el panel se cierra (toggle).
4. **Given** el usuario está viendo el panel de mantenimiento, **When** el usuario hace clic fuera del panel o en el botón de cierre, **Then** el panel se oculta y el grid de tarjetas recupera todo el espacio horizontal disponible.

---

### User Story 2 - Calcular e identificar el plan de mantenimiento más próximo por iteraciones (Priority: P2)

El sistema debe calcular automáticamente cuál es el próximo mantenimiento a mostrar basado en los intervalos (iteraciones) definidos para el activo. Los mantenimientos operan de forma cíclica (ej. "cada 500 hrs" o "cada 1,000 hrs"). Por lo tanto, un activo siempre tendrá un próximo mantenimiento programado matemáticamente. Si un activo tiene lectura de 1,200 hrs y un plan que indica iteraciones cada 500 hrs, el sistema calculará que su próximo mantenimiento tocará a las 1,500 hrs y mostrará este umbral iterativo.

**Why this priority**: Define la inteligencia de negocio de la funcionalidad. Al usar iteraciones, se asegura la mantenibilidad perpetua de los equipos, evitando que se queden "sin mantenimientos por delante".

**Independent Test**: Se puede probar verificando que para cualquier lectura actual, el sistema calcula correctamente el siguiente múltiplo correspondiente a los intervalos de mantenimiento del activo (ej. para intervalo de 500 hrs y lectura de 1,200, el próximo es 1,500).

**Acceptance Scenarios**:

1. **Given** un activo con lectura actual de 1,200 hrs y planes de mantenimiento iterativos definidos cada 500 y 1,000 hrs, **When** se abre el panel para ese activo, **Then** el panel calcula y muestra el plan correspondiente a las 1,500 hrs (siguiente iteración de 500 hrs).
2. **Given** un activo con lectura actual de 4,800 hrs y planes de mantenimiento de cada 500 y 1,000 hrs, **When** se abre el panel, **Then** el panel muestra el plan correspondiente a las 5,000 hrs, el cual puede combinar las tareas de ambas iteraciones (ya que 5,000 es múltiplo de 500 y 1,000).
3. **Given** un activo con lectura de 0 hrs, **When** se abre el panel, **Then** el sistema calcula y muestra el plan para el intervalo mínimo definido (ej. 500 hrs).

---

### User Story 3 - Visualizar el detalle de actividades del plan de mantenimiento (Priority: P2)

El panel lateral debe mostrar de manera clara y organizada las actividades que componen el plan de mantenimiento del umbral identificado. Cada actividad debe ser legible y diferenciable, indicando al menos el tipo de tarea, descripción y, si aplica, la estimación de duración o recursos necesarios.

**Why this priority**: El contenido del panel es el propósito final de la funcionalidad. Si el panel se abre pero no muestra información útil, el valor de negocio es nulo.

**Independent Test**: Puede probarse verificando que al abrir el panel de un activo, se lista al menos una actividad de mantenimiento con información comprensible para un técnico.

**Acceptance Scenarios**:

1. **Given** el panel está abierto para "Motor Principal MP-01" con plan de 5,000 hrs, **When** el usuario visualiza el panel, **Then** ve una lista de actividades de mantenimiento (ej. "Cambio de aceite", "Revisión de filtros", "Inspección de sellos") relacionadas con ese umbral.
2. **Given** el panel está mostrando un plan con múltiples actividades, **When** la lista excede la altura visible del panel, **Then** el panel permite desplazamiento vertical (scroll) interno sin afectar el layout del grid de tarjetas.
3. **Given** el panel está abierto, **When** el usuario visualiza la información del activo, **Then** el encabezado del panel muestra el nombre del activo, su lectura actual, y el umbral del plan de mantenimiento que se está visualizando.

---

### Edge Cases

- ¿Qué ocurre cuando un activo no tiene un plan de mantenimiento definido en el sistema? El panel debe mostrar un estado vacío con un mensaje explicativo.
- ¿Qué pasa si el usuario redimensiona la ventana del navegador mientras el panel está abierto? El layout debe adaptarse manteniendo la coherencia del diseño.
- ¿Cómo se comporta el grid de tarjetas cuando el panel se abre en pantallas pequeñas donde no hay espacio horizontal suficiente? En viewport reducido (móvil/tablet), el panel puede ocupar toda la pantalla como un drawer o modal en lugar de aparecer al costado.
- ¿Qué sucede si la lista de actividades de mantenimiento está vacía (plan definido pero sin tareas)? El panel debe mostrar un estado vacío diferenciado del caso de "sin plan".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir que el usuario seleccione una tarjeta de activo en el grid de horómetros mediante clic.
- **FR-002**: Al seleccionar una tarjeta de activo, el sistema DEBE desplegar un panel de detalle a la derecha del grid de tarjetas, como hermano del grid dentro del mismo contenedor padre (no dentro del grid).
- **FR-003**: El panel de detalle DEBE tener la misma altura que el grid de tarjetas, ajustándose dinámicamente si el grid cambia de altura.
- **FR-004**: El sistema DEBE calcular automáticamente el umbral del próximo mantenimiento basándose en los intervalos (iteraciones, ej. cada 500h) definidos para el activo, buscando el siguiente múltiplo superior a la lectura actual.
- **FR-005**: El panel DEBE mostrar en su encabezado: nombre del activo, lectura actual en horas, y el umbral iterativo calculado para el plan de mantenimiento.
- **FR-006**: El panel DEBE mostrar la lista de actividades de mantenimiento correspondientes al umbral calculado.
- **FR-007**: La tarjeta actualmente seleccionada DEBE tener un estilo visual diferenciador (estado "activo") que indique al usuario qué activo está siendo consultado.
- **FR-008**: Si el usuario hace clic en la misma tarjeta activa, el panel DEBE cerrarse (comportamiento toggle).
- **FR-009**: Si el usuario hace clic en una tarjeta diferente con el panel abierto, el panel DEBE actualizar su contenido sin animación de cierre/apertura, mostrando el plan del nuevo activo.
- **FR-010**: Si el activo no cuenta con configuraciones de intervalos de mantenimiento, el panel DEBE mostrar un estado vacío indicando que el activo no tiene planes configurados.
- **FR-011**: El panel DEBE permitir desplazamiento vertical interno (scroll) cuando las actividades de mantenimiento excedan la altura visible del panel.
- **FR-012**: En viewports pequeños (móvil), el panel DEBE adaptarse presentándose como overlay o drawer de pantalla completa en lugar del layout lateral.

### Key Entities *(include if feature involves data)*

- **HourMeterRecord**: Activo físico monitorizado. Posee `id`, `equipment` (nombre), `currentReading` (lectura actual en horas) y `maxThreshold` (umbral de alerta). Ya existe en el dominio.
- **MaintenancePlan**: Nuevo. Plan de mantenimiento asociado a un activo basado en intervalos (iteraciones). Atributos: `id`, `equipmentId` (referencia al activo), `intervalHours` (intervalo cíclico en horas, ej. 500, 1000), `activities` (lista de actividades).
- **MaintenanceActivity**: Nuevo. Actividad individual dentro de un plan. Atributos: `id`, `name` (nombre de la actividad), `description` (descripción detallada), `estimatedDuration` (duración estimada, opcional), `category` (categoría o tipo de tarea, ej. "lubricación", "inspección", "sustitución").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El panel de mantenimiento se despliega en menos de 300 ms tras hacer clic en una tarjeta de activo, percibido como instantáneo por el usuario.
- **SC-002**: El 100% de los activos con planes de mantenimiento definidos muestran correctamente las actividades del próximo umbral de horas al seleccionarlos.
- **SC-003**: El grid de tarjetas y el panel de mantenimiento conviven correctamente en el mismo contenedor sin desplazar ni superponer ningún elemento de la interfaz existente.
- **SC-004**: El panel muestra correctamente el plan de mantenimiento esperado para al menos los 6 activos que actualmente existen en el sistema.
- **SC-005**: En todos los casos de estado vacío (sin plan, sin actividades), el usuario recibe un mensaje comprensible en lugar de un panel vacío sin contexto.

## Assumptions

- El sistema actualmente no tiene en la capa de datos los planes de mantenimiento ni las actividades; estos datos serán modelados como nuevas entidades dentro de la arquitectura existente del módulo `hour-meters`.
- En esta primera versión (v1), los datos de los planes de mantenimiento serán estáticos/mockeados siguiendo el mismo patrón que el hook `useHourMeters`, con la posibilidad de conectarlos a una fuente de datos real en una iteración futura.
- La disposición "panel a la derecha del grid" aplica para viewports de escritorio (≥ 1024px). En viewports menores, el comportamiento puede adaptarse a overlay o drawer.
- Las tarjetas del grid conservan todas sus funcionalidades y estilos actuales; únicamente se les agrega la interacción de selección (clic) y el estado visual de "activo/seleccionado".
- Los planes de mantenimiento se estructuran principalmente por intervalos cíclicos/iteraciones (ej. cada 500h, cada 1000h), asegurando que siempre exista un próximo mantenimiento calculable de forma perpetua.
- El sistema calculará el próximo mantenimiento como el siguiente múltiplo matemático del intervalo de horas, inmediatamente superior a la lectura actual del activo.
