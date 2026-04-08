# Standard Development Guide: agents.md

Este documento define las reglas de oro para la construcción de código en este proyecto. Todo agente de IA o desarrollador debe adherirse a estas normas para garantizar la escalabilidad, mantenibilidad y reusabilidad del software.

## 1. Arquitectura del Sistema (Clean Architecture)
Se implementará **Clean Architecture** para desacoplar la lógica de negocio de los detalles de implementación (UI, Frameworks, DB).

### Estructura de Carpetas Clave:
Cada módulo funcional debe contener las siguientes 4 capas:

1.  **`domain`**: Entidades del negocio, interfaces de repositorios y modelos de datos puros.
2.  **`application`**: Casos de uso (`Use Cases`). Aquí reside la orquestación de la lógica de negocio.
3.  **`infrastructure`**: Implementaciones concretas de los repositorios, llamadas a APIs (Axios/Fetch), adaptadores y mapeadores de datos.
4.  **`presentation`**: Componentes de UI, Store de Zustand y lógica de vista.

## 2. Gestión de Estado y Flujo de Datos
Para mantener un flujo de datos predecible y reactivo:

* **Zustand como Singleton:** Se utilizará Zustand para crear almacenes globales que actúen como puntos de entrada únicos para llamar a los `Use Cases`.
* **RxJS (Reactividad):** Se integrará RxJS para manejar flujos de datos complejos, eventos asíncronos o comunicación entre componentes que requieran un enfoque reactivo (Streams).
* **Exposición al Front:** El estado de Zustand expone los datos procesados por los Use Cases directamente a los componentes de la capa de presentación.

## 3. Interfaz de Usuario (UI) y UX
* **Atomic Design:** Los componentes deben organizarse en:
    * *Atoms, Molecules, Organisms, Templates y Pages*.
* **Carga Asíncrona (Skeletons):** Todo componente que dependa de un proceso `async` debe implementar un **Skeleton Screen** para mejorar el *Perceived Performance*. No se permiten spinners genéricos si el layout es predecible.

## 4. Estándares de Código y Documentación
* **JSDoc Obligatorio:** Cada bloque importante (Clases, Funciones, Interfaces) debe incluir comentarios JSDoc describiendo parámetros, retornos y una breve explicación.
* **Patrones de Diseño:** Se priorizará el uso de *Dependency Injection*, *Factory* y *Observer* según sea necesario.
* **Reusabilidad:** Antes de escribir un componente o lógica, evaluar si puede ser un Hook o un componente genérico.

---

## 5. Reglas de Negocio Complementarias (Propuestas)

### Regla Propuesta: Capa de Mapeo Obligatoria (Data Mapper)
**Descripción:** Para evitar que los cambios en el backend rompan el frontend, se establece que toda respuesta de `infrastructure` debe pasar por un **Mapper** antes de llegar al `domain`.
* **Razón:** Si la API cambia un campo llamado `user_id` a `uid`, solo cambias el Mapper, y tu lógica de negocio (Use Cases) permanece intacta.

### Regla Propuesta: Error Handling Unificado (Either Pattern)
**Descripción:** Los Use Cases no deben lanzar (`throw`) excepciones crudas. Deben devolver un objeto de tipo `Either<Failure, Success>`.
* **Razón:** Esto obliga al desarrollador a manejar el escenario de error en la UI de forma explícita, evitando bloqueos inesperados y permitiendo mostrar mensajes de error amigables al usuario.

---

## 6. Ejemplo de Implementación (Template)

```javascript
/**
 * @fileoverview Ejemplo de Use Case siguiendo las reglas de agents.md
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 */

/**
 * Caso de uso para obtener un perfil de usuario.
 * Aplica la lógica de negocio necesaria antes de entregar los datos.
 * * @param {IUserRepository} userRepository - Implementación del repositorio (DI).
 * @returns {Promise<User>}
 */
export const GetUserProfileUseCase = async (userRepository) => {
  const data = await userRepository.fetchProfile();
  // Lógica de negocio adicional aquí
  return data;
};
```

## 7. Regla de Oro: Next.js First (Hybrid Rendering Strategy)

**Descripción:** Se debe priorizar el uso de **Server Components (RSC)** por defecto para la obtención de datos y el renderizado inicial. Los **Client Components** solo se utilizarán cuando exista interactividad (hooks como `useState`, `useEffect`) o dependencias del navegador.

### Lineamientos de Implementación:
* **Data Fetching en el Servidor:** Los `Use Cases` que no dependan de una sesión de usuario activa en el cliente deben ejecutarse dentro de Server Components o `getServerSideProps` / `getStaticProps` (según la versión de Next.js que uses).
* **Composición de Componentes:** Mantener las hojas del árbol de componentes como "Client Components" y los nodos raíz/contenedores como "Server Components".
* **Optimización de Recursos:** Es obligatorio el uso de los componentes nativos de Next.js:
    * `<Image />` para optimización automática de imágenes.
    * `<Link />` para prefetching de rutas.
    * `next/font` para gestión de tipografías sin CLS (Cumulative Layout Shift).
* **SEO y Metadatos:** Cada página debe definir su objeto de `metadata` de forma estática o dinámica desde la capa de `presentation/pages`, consumiendo datos directamente de la capa de `domain`.

### Interacción con Zustand:
> [!IMPORTANT]
> Dado que Zustand vive en el cliente, los datos obtenidos en el servidor deben ser pasados al Store mediante un patrón de **Hydration**. No se debe forzar un componente a ser `use client` solo para obtener datos que Next.js puede resolver en el servidor.

---

### 8. Regla de Rendimiento:

**Regla: Estrategia de "Barrel Files" Limitada**
* **Problema:** En Next.js, el uso excesivo de archivos `index.ts` (barrels) para exportar todo un módulo puede arruinar el *Tree Shaking*, haciendo que el bundle de cliente sea mucho más pesado de lo necesario.
* **Regla:** Evitar exportaciones masivas en la capa de `presentation`. Importar directamente desde el archivo del componente para asegurar que Next.js solo envíe al navegador el código estrictamente necesario para esa ruta.

---

## 9. Pruebas Unitarias Obligatorias

**Regla:** Todo nuevo código, componente, caso de uso o función de infraestructura DEBE incluir sus respectivas pruebas unitarias (Unit Tests).
* **Razón:** Las pruebas automatizadas garantizan que la lógica de negocio funcione como se espera, previene regresiones en futuras actualizaciones y actúa como documentación viva de qué hace cada parte del sistema.
* **Lineamiento:** No se considerará terminada ninguna tarea o implementación (Definition of Done) si el código introducido o modificado no está respaldado por pruebas que cubran escenarios de éxito (happy path) e interacciones de error.

---

## 11. Reglas de Negocio en Dashboards y KPIs

**Regla: Integridad de Datos en Indicadores**
*   **Filtrado por Defecto**: Todos los contadores de KPIs en dashboards operativos deberán excluir automáticamente los activos deshabilitados (`is_active: false`), a menos que el requerimiento especifique explícitamente la inclusión de inventario histórico.
*   **Lógica de Categorización**: Para el cálculo de KPIs, se debe priorizar siempre el uso de enums o tipos definidos directamente en la base de datos (ej. `location_type`) sobre búsquedas de texto parciales en nombres (`.includes()`), para evitar discrepancias y garantizar que la suma de las partes coincida con los totales globales.

## 12. 🤖 Directivas de Comportamiento para la IA

1. **Analiza el código existente:** Al comenzar una nueva tarea, inspecciona en `src/features/` cómo están modeladas las otras funcionalidades para mantener la coherencia.
2. **Respeto Absoluto a la Arquitectura:** NUNCA crees consultas directas a la base de datos (ej. `supabase.from(...)`) dentro de un componente UI. Sigue siempre la ruta: *Presentación -> Application (Use Case) -> Infrastructure (Repository)*.
3. **Modificaciones Incrementales:** Trabaja capa por capa (normalmente estructurando primero el Dominio, luego la Infraestructura, Casos de Uso y terminando en la Presentación).
