# Petro Flow - Instrucciones para Agentes de IA

Este documento contiene la información, contexto y reglas críticas para cualquier asistente de código o agente de IA que trabaje en el repositorio del proyecto "Petro Flow".

## 🏗️ Arquitectura: Clean Architecture (OBLIGATORIO)

El proyecto utiliza estrictamente los principios de **Clean Architecture**, combinados con una organización orientada a características (Feature-Sliced Design). Se establece como el **proceder estándar y obligatorio para todas las funcionalidades** que se creen o modifiquen en el sistema.

Toda nueva funcionalidad o módulo DEBE estructurarse en las siguientes capas, respetando estrictamente la regla de dependencia (las dependencias siempre apuntan hacia adentro: Presentación e Infraestructura dependen de Aplicación, y Aplicación depende de Dominio).

### Estructura de Capas por Funcionalidad (`src/features/`)

1. **Capa de Dominio (`domain/`)**:
   - Contiene la lógica central y las reglas de negocio independientes del framework.
   - **Entidades / Tipos:** Definición de las estructuras de datos principales.
   - **Interfaces de Repositorios:** Contratos que la capa de infraestructura está obligada a implementar.
   - *Regla crítica:* Cero dependencias externas (prohibido importar React, Supabase, Next.js, etc.).

2. **Capa de Aplicación (`application/`)**:
   - Contiene los casos de uso (Use Cases) del sistema.
   - **Casos de Uso:** Funciones o clases que orquestan el flujo de datos ejecutando las reglas de negocio y comunicándose mediante las interfaces abstractas de los repositorios.
   - *Regla crítica:* Solo depende de la capa de Dominio. NO debe conocer detalles de la UI ni de cómo se persisten los datos.

3. **Capa de Infraestructura (`infrastructure/`)**:
   - Contiene las implementaciones tecnológicas concretas.
   - **Repositorios (`repository.ts`, `supabase-repository.ts`):** Implementaciones reales de las interfaces definidas en el dominio.
   - **Servicios Externos:** Adaptadores para APIs, bases de datos, etc.
   - *Regla crítica:* Conecta con el mundo exterior. Aquí es donde se concentran librerías concretas como `@supabase/supabase-js`.

4. **Capa de Presentación (`presentation/`)**:
   - Contiene la interfaz de usuario.
   - **Componentes React / Next.js:** Vistas y elementos interactivos (`components/`).
   - **Hooks (`hooks/`):** Lógica de vista y manejo de estado, encargados de conectar la UI con los Casos de Uso.
   - *Regla crítica:* Esta capa debe delegar toda la lógica a los Casos de Uso. Queda **prohibido** instanciar clientes de base de datos o hacer consultas directas a Supabase desde los componentes.

### Ejemplo de Árbol de Directorios de una Funcionalidad (`[nombre-feature]`)
```text
src/features/[nombre-feature]/
├── domain/
│   ├── entidades.ts
│   └── interfaces.ts
├── application/
│   └── use-cases.ts
├── infrastructure/
│   └── supabase-repository.ts
└── presentation/
    ├── components/
    └── hooks/
        └── use-[nombre-feature].ts
```

## 🛠️ Stack Tecnológico

- **Framework:** Next.js (App Router preferiblemente)
- **Lenguaje:** TypeScript (Strict mode)
- **Estilos:** Tailwind CSS
- **Backend / Base de Datos / Auth:** Supabase

## 📖 Buenas Prácticas y Convenciones

1. **Tipado Estricto:** Usar TypeScript para todo. Evitar el uso de `any`. Todas las entidades que provengan o vayan hacia la DB deben estar claramente tipadas en la capa de Dominio.
2. **Nomenclatura (`kebab-case` para archivos):** Nombrar los archivos en minúsculas y separados por guiones (ej. `use-cases.ts`, `supabase-repository.ts`). Componentes de React en `PascalCase.tsx`.
3. **Inyección de Dependencias e Instanciación:** Patrones como instanciar los repositorios una única vez (Patrón Singleton) y pasarlos a los hooks/casos de uso es la práctica recomendada para no saturar memoria.

## 🤖 Directivas de Comportamiento para la IA

1. **Analiza el código existente:** Al comenzar una nueva tarea, inspecciona en `src/features/` cómo están modeladas las otras funcionalidades para mantener la coherencia.
2. **Respeto Absoluto a la Arquitectura:** NUNCA crees consultas directas a la base de datos (ej. `supabase.from(...)`) dentro de un componente UI. Sigue siempre la ruta: *Presentación -> Application (Use Case) -> Infrastructure (Repository)*.
3. **Modificaciones Incrementales:** Trabaja capa por capa (normalmente estructurando primero el Dominio, luego la Infraestructura, Casos de Uso y terminando en la Presentación).
