# Feature Specification: KPI Metric Cards en Panel de Mantenimiento

**Feature Branch**: `003-kpi-metric-cards`  
**Created**: 2026-07-02  
**Status**: Draft  
**Input**: User description: "Agregar 4 tarjetas KPI (MTBF, MTTR, Disponibilidad, Confiabilidad) en el panel lateral del módulo de horómetros, posicionadas justo después de la línea divisora, organizadas en grilla 2x2, reactivas al activo seleccionado."

## Clarifications

### Session 2026-07-02
- Q: ¿Cuál es el orden de las tarjetas en la grilla 2x2? → A: Fila 1: MTBF (izq) y MTTR (der); Fila 2: Disponibilidad (izq) y Confiabilidad (der).
- Q: ¿Cómo se calcula la Disponibilidad? → A: 100% * (1 - [Horas en Falla en el mes] / [Horas Totales del mes]) (Downtime vs Tiempo Total).
- Q: ¿Cómo se obtienen o calculan los KPIs? → A: Mock Data Integrado (datos simulados y fijos por activo en el frontend).
- Q: ¿Cómo se comporta la visualización responsiva? → A: Colapsar a grilla de 1 columna en pantallas móviles (< sm/md) y mantener 2x2 en pantallas más grandes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualización de KPIs del Activo Seleccionado (Priority: P1)

Un técnico o supervisor abre el panel lateral al hacer clic sobre la tarjeta de un activo (equipo) en el módulo de horómetros. Inmediatamente después de la línea divisora que separa el encabezado del contenido, visualiza 4 tarjetas métricas organizadas en una grilla de 2×2, cada una mostrando el valor de KPI correspondiente a ese activo: MTBF, MTTR, Disponibilidad y Confiabilidad.

**Why this priority**: Es el núcleo de la funcionalidad. Sin estas tarjetas, la feature no existe. Proporciona visibilidad inmediata del estado operacional del equipo desde el mismo panel donde ya se consulta la información de mantenimiento.

**Independent Test**: Puede testearse de forma aislada abriendo el panel de mantenimiento de cualquier activo y verificando que las 4 tarjetas KPI aparecen en la posición correcta (antes del bloque "Próximo límite") con valores numéricos y etiquetas correctas.

**Acceptance Scenarios**:

1. **Given** el usuario está en el módulo de horómetros con al menos un activo disponible, **When** hace clic en la tarjeta de un activo, **Then** el panel lateral se abre y muestra 4 tarjetas KPI organizadas en grilla 2×2 justo después de la línea divisora del encabezado.
2. **Given** el panel lateral está abierto con las 4 tarjetas KPI visibles, **When** el usuario revisa cada tarjeta, **Then** cada tarjeta muestra su etiqueta (MTBF, MTTR, Disponibilidad, Confiabilidad), su valor numérico calculado para el activo seleccionado y su unidad de medida correspondiente.
3. **Given** el panel lateral está abierto, **When** el usuario verifica la posición de las tarjetas KPI, **Then** las tarjetas aparecen antes del bloque "Próximo límite".

---

### User Story 2 - Reactividad al Cambio de Activo Seleccionado (Priority: P2)

Cuando el usuario hace clic en una tarjeta de activo diferente en el listado principal, los valores de las 4 tarjetas KPI en el panel lateral se actualizan automáticamente para reflejar los indicadores del nuevo activo seleccionado, sin necesidad de recargar la página.

**Why this priority**: Sin esta reactividad, el panel mostraría datos desactualizados al cambiar de activo, generando confusión operacional. Es crítica para la utilidad real de la feature.

**Independent Test**: Puede testearse seleccionando el activo A (verificando sus KPIs), luego seleccionando el activo B y verificando que los 4 KPIs cambian a los valores del activo B.

**Acceptance Scenarios**:

1. **Given** el panel lateral está abierto mostrando los KPIs del activo A, **When** el usuario hace clic en la tarjeta del activo B en el listado principal, **Then** las 4 tarjetas KPI se actualizan mostrando los valores correspondientes al activo B.
2. **Given** el panel está cargando los datos del nuevo activo seleccionado, **When** los KPIs aún no están disponibles, **Then** las tarjetas muestran un estado de esqueleto (skeleton) indicando que se están cargando los datos, sin colapsar el layout.

---

### User Story 3 - Selección de Período para la Confiabilidad (Priority: P3)

La tarjeta de "Confiabilidad del activo" incluye un control (Dropdown) que permite al usuario cambiar el período de cálculo de la confiabilidad entre 3 opciones: 1 semana, 1 mes y 3 meses. Al seleccionar un período diferente, el valor de confiabilidad se recalcula y actualiza de inmediato en la misma tarjeta.

**Why this priority**: Añade valor analítico permitiendo al usuario evaluar la confiabilidad en distintos horizontes de tiempo. Es específico de una sola tarjeta, por lo que su complejidad está acotada.

**Independent Test**: Puede testearse de forma aislada abriendo cualquier panel de activo, localizando la tarjeta de Confiabilidad, cambiando el dropdown de "1 semana" a "1 mes" y verificando que el porcentaje mostrado cambia según el período seleccionado.

**Acceptance Scenarios**:

1. **Given** la tarjeta de Confiabilidad está visible en el panel, **When** el usuario abre el Dropdown de período, **Then** se muestran exactamente 3 opciones: "1 semana", "1 mes" y "3 meses".
2. **Given** el usuario selecciona "3 meses" en el Dropdown de Confiabilidad, **When** el sistema recalcula el indicador, **Then** el valor porcentual de la tarjeta se actualiza reflejando la confiabilidad en un período de 3 meses para el activo seleccionado.
3. **Given** el usuario cambia el activo seleccionado mientras el Dropdown de Confiabilidad tenía "1 mes" seleccionado, **When** el panel carga los datos del nuevo activo, **Then** el Dropdown mantiene la selección de período ("1 mes") y calcula la confiabilidad del nuevo activo en ese período.

---

### Edge Cases

- ¿Qué ocurre si el activo no tiene historial de fallas suficiente para calcular MTBF o MTTR? → Las tarjetas deben mostrar un estado "N/A" con una etiqueta informativa, sin bloquear el resto del panel.
- ¿Qué sucede si el activo tiene 0 fallas registradas? → MTBF es técnicamente infinito; el sistema debe representarlo como "N/A" o "Sin fallas registradas".
- ¿Qué pasa si el período seleccionado en el Dropdown de Confiabilidad no tiene datos suficientes? → La tarjeta muestra "N/A" para ese período y el Dropdown permanece funcional para cambiar a otro período.
- ¿Qué ocurre si la carga de KPIs tarda más de lo esperado? → El estado de skeleton persiste durante la carga; no se muestran ceros que pudieran interpretarse como datos reales.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar 4 tarjetas KPI (MTBF, MTTR, Disponibilidad, Confiabilidad) en el panel lateral de mantenimiento de horómetros, posicionadas justo después de la línea divisora del encabezado y antes del bloque "Próximo límite".
- **FR-002**: Las tarjetas KPI DEBEN estar organizadas visualmente en una grilla de 2 columnas × 2 filas (2×2), siguiendo el orden: Fila 1: MTBF (izquierda) y MTTR (derecha); Fila 2: Disponibilidad (izquierda) y Confiabilidad (derecha).
- **FR-003**: Cada tarjeta DEBE mostrar: nombre completo del indicador, acrónimo o etiqueta abreviada, el valor calculado y la unidad de medida (horas para MTBF/MTTR, porcentaje para Disponibilidad/Confiabilidad).
- **FR-004**: Los valores de las 4 tarjetas DEBEN ser reactivos al activo seleccionado: al cambiar el activo en el listado principal, los KPIs se actualizan automáticamente sin recargar la página.
- **FR-005**: La tarjeta de Confiabilidad DEBE incluir un Dropdown con exactamente 3 opciones de período de cálculo: "1 semana", "1 mes" y "3 meses".
- **FR-006**: Al cambiar la selección del Dropdown de Confiabilidad, el valor de la tarjeta DEBE recalcularse y actualizarse de forma inmediata para el activo actualmente seleccionado.
- **FR-007**: El sistema DEBE mantener la selección del período de Confiabilidad al cambiar de activo (el Dropdown no se resetea entre activos).
- **FR-008**: Cuando los datos de KPI estén siendo cargados, el sistema DEBE mostrar un estado de skeleton en cada tarjeta, sin colapsar el layout.
- **FR-009**: Cuando no existan datos suficientes para calcular un KPI, la tarjeta DEBE mostrar "N/A" o "—" con una etiqueta informativa, sin lanzar errores al usuario.
- **FR-010**: El comportamiento reactivo de las tarjetas KPI DEBE ser consistente con el comportamiento ya implementado en las secciones "Próximo límite" y "Actividades planificadas" del mismo panel.

### Key Entities *(include if feature involves data)*

- **KPI de Activo**: Conjunto de indicadores operacionales calculados para un equipo específico. Atributos clave: `assetId`, `mtbf` (horas), `mttr` (horas), `availability` (porcentaje), `reliability` (porcentaje según período).
- **Período de Confiabilidad**: Ventana de tiempo para el cálculo de confiabilidad. Valores posibles: 7 días (1 semana), 30 días (1 mes), 90 días (3 meses).
- **Evento de Falla**: Registro histórico de una falla del equipo con fecha de inicio y fin. Es la fuente primaria para el cálculo de MTBF y MTTR.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las 4 tarjetas KPI son visibles en el panel de mantenimiento en la posición correcta (antes de "Próximo límite") en el 100% de los activos que cuenten con datos históricos.
- **SC-002**: Al seleccionar un activo diferente, los valores de las 4 tarjetas se actualizan en menos de 2 segundos en condiciones normales de conectividad.
- **SC-003**: El cambio de período en el Dropdown de Confiabilidad produce una actualización del valor visible en menos de 1 segundo.
- **SC-004**: En activos sin historial de fallas, las tarjetas MTBF y MTTR muestran estado "N/A" en el 100% de los casos, sin mostrar ceros ni errores.
- **SC-005**: El layout del panel no se altera ni colapsa durante el estado de carga (skeleton) de los KPIs.
- **SC-006**: La selección de período del Dropdown de Confiabilidad se preserva correctamente al navegar entre al menos 3 activos consecutivos.

---

## Assumptions

- Se asume que los KPIs se obtienen mediante un set de Mock Data integrado en el frontend (datos fijos simulados y mapeados por `assetId`), simulando un retardo de carga para el estado skeleton.
- Se asume que la Disponibilidad se calcula con la fórmula `100% * (1 - [Horas en Falla en el mes] / [Horas Totales del mes])` donde las horas en falla provienen del registro histórico de fallas del equipo en el mes en curso.
- Se asume que el panel lateral de mantenimiento ya tiene una línea divisora implementada entre el encabezado y la sección de contenido; las tarjetas KPI se insertarán al inicio de esa sección de contenido.
- Se asume que el mecanismo reactivo al activo seleccionado (ya implementado para "Próximo límite" y "Actividades planificadas") puede extenderse para alimentar también los KPIs sin requerir una arquitectura completamente nueva.
- Se asume que el soporte para pantallas móviles seguirá una visualización responsiva colapsando a grilla de 1 columna en resoluciones móviles (`< sm/md`), y manteniendo la grilla 2x2 en pantallas más grandes.
- La fórmula de confiabilidad utilizada será la estándar: R(t) = e^(-t/MTBF), donde t es el período seleccionado en horas. Esta fórmula puede ajustarse durante la fase de planificación técnica si el dominio lo requiere.
