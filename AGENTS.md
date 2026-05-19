# Estándares de Código y Revisión para GGA

## 1. Arquitectura y Ecosistema

- **Frontend Moderno:** El proyecto utiliza componentes funcionales. Evitar por completo componentes de clase.
- **Next.js / React:** Si se detectan patrones de Next.js (App Router), asegurar que la directiva `"use client"` se utilice única y estrictamente cuando el componente requiera interactividad (estado, hooks de ciclo de vida o eventos de usuario). Mantener la carga en el servidor tanto como sea posible.

## 2. Tipado estricto (TypeScript)

- **Cero 'any':** Rechazar cualquier código que utilice el tipo `any`. Exigir tipado explícito o que TypeScript lo infiera de manera segura.
- **Interfaces:** Preferir el uso de `interface` sobre `type` para la definición de las props de los componentes y contratos de objetos.

## 3. Convenciones de Nomenclatura

- **Componentes de UI:** PascalCase (ej. `UserProfile.tsx`, `NavigationMenu.tsx`).
- **Hooks y Funciones:** camelCase (ej. `useAuth`, `fetchData`).
- **Constantes Globales:** UPPER_SNAKE_CASE (ej. `MAX_RETRY_COUNT`).
- **Nombres descriptivos:** Evitar variables de una sola letra (excepto en iteraciones cortas) o nombres ambiguos como `data` o `val`.

## 4. Clean Code y Rendimiento

- **Responsabilidad Única:** Mantener los componentes pequeños. Si un componente supera las 150 líneas, sugerir su división.
- **Retornos Tempranos (Early Returns):** Evitar el anidamiento profundo de bloques `if/else`. Usar cláusulas de guarda al inicio de las funciones.
- **Desestructuración:** Desestructurar las props directamente en la firma del componente.
- **Limpieza:** Rechazar Pull Requests o código que contenga `console.log`, código comentado sin justificación o imports sin utilizar.

## 5. Manejo de Errores y Estado

- Exigir bloques `try/catch` o un manejo equivalente en todas las operaciones asíncronas o llamadas a APIs externas.
- Sugerir el uso de estados de carga (`isLoading`) y manejo de estados de error visibles para la interfaz de usuario en las peticiones de red.

## 6. Integridad de Datos en la UI (Pokémon/Objetos/Movimientos/Habilidades)

- **Cero Entrada Libre (No Free-Text Fields)**: NUNCA dejes al usuario escribir texto libre para seleccionar nombres de Pokémon, objetos, movimientos o habilidades competitivas en la base de datos o en la definición de reglas.
- **Validación por Lista Controlada**: Cualquier campo de metajuego debe utilizar autocompletado en tiempo real consumiendo las Server Actions de la enciclopedia (`searchPokemonSpecies`, `searchItems`, `searchMoves`, `searchAbilities`) para evitar errores tipográficos y asegurar que sólo valores existentes y legales puedan ser seleccionados.

<!-- BEGIN:nextjs-agent-rules -->


  `
- `br`
