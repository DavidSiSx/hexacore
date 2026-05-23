<p align="center">
  <img src="https://play.pokemonshowdown.com/sprites/gen5/charizard.png" width="80" />
  <img src="https://play.pokemonshowdown.com/sprites/gen5/gengar.png" width="80" />
  <img src="https://play.pokemonshowdown.com/sprites/gen5/dragapult.png" width="80" />
</p>

<h1 align="center">⬡ Hexacore</h1>
<p align="center">
  <strong>AI-Powered Competitive Pokémon Team Builder | Constructor Competitivo Impulsado por IA</strong><br/>
  A next-generation VGC/Smogon team builder powered by RAG, pgvector and Gemini structured outputs.<br/>
  <em>Un constructor de equipos de nueva generación impulsado por RAG, pgvector y Gemini.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/PostgreSQL-pgvector-316192?logo=postgresql" />
  <img src="https://img.shields.io/badge/AI-Gemini_2.5-4285F4?logo=google" />
  <img src="https://img.shields.io/badge/ORM-Prisma_7.8-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Styling-Tailwind_v4-06B6D4?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-emerald" />
</p>

---

<p align="center">
  <a href="#english"><img src="https://img.shields.io/badge/Language-English-blue?style=for-the-badge" alt="English" /></a>
  <a href="#español"><img src="https://img.shields.io/badge/Idioma-Espa%C3%B1ol-green?style=for-the-badge" alt="Español" /></a>
</p>

---

<h2 id="english">🇬🇧 English</h2>

### What is Hexacore?

Hexacore is an advanced competitive Pokémon team-building application designed for high-level players. It leverages state-of-the-art AI reasoning and local vector databases to help users generate, refine, and validate teams according to VGC and Smogon regulations.

---

### Architecture & Technical Design

Hexacore is designed following a **Screaming / Clean Architecture** pattern, enforcing a strict separation of concerns, clean routing boundaries, and maximum component reusability:

1. **Modular Components Structure**:
   * All team-builder logic is organized within [src/app/components/TeamBuilder/](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/).
   * **Presentational vs. Container Pattern**: UI parts like the [FilterPanel.tsx](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/components/FilterPanel.tsx), [TelemetryTerminal.tsx](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/components/TelemetryTerminal.tsx), and [ValidationDashboard.tsx](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/components/ValidationDashboard.tsx) focus entirely on layout, receiving unified actions and states.
   * **Custom hooks for logic isolation**:
     * [useTeamBuilder.ts](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/hooks/useTeamBuilder.ts): Orchestrates generator streams, locks slots, handles Showdown parser logic, and triggers native toast notifications.
     * [useCustomFormats.ts](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/hooks/useCustomFormats.ts): Manages client-side state for the custom rules database engine.
   * **Native i18n Dictionary**: Localization dictionary [locales.ts](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/locales.ts) is fully typed using advanced recursive utility mapping (`StringifyLeaf`) to optimize bundles and prevent runtime language mismatches.

2. **Database Integrity & Controlled Autocompletes**:
   * **Zero Free-Text Fields Policy**: To avoid typos and database index failures when banning Pokémon, items, moves, or abilities, the application uses search components powered by Server Actions ([pokedex.ts](file:///c:/Repositorios/hexacore/src/app/actions/pokedex.ts) and [encyclopedia.ts](file:///c:/Repositorios/hexacore/src/app/actions/encyclopedia.ts)). Only legal, existing entries in the database can be selected.
   * **Reactive Render-Time Validation**: Legal validation reports (Errors, Warnings, Suggestions) are calculated on-the-fly directly during React render rather than inside heavy `useEffect` hooks, preventing cascading render loops.

---

### AI & RAG Integration

1. **Local Embeddings & RAG**:
   * Uses `@xenova/transformers` locally with the `all-MiniLM-L6-v2` model to vectorize Smogon strategies, PokeAPI metadata, and Smogon statistics.
   * Queries stored vector items using `pgvector` on Supabase PostgreSQL databases to feed Gemini 2.5/3.5 with relevant, context-aware competitive summaries.

2. **Strategic AI Coach (Beta)**:
   * Features an interactive competitive coaching sidebar drawer. It classifies user queries (threat counters, speed tiers, synergy, EV spreads) using semantic intent classification, retrieves context-relevant RAG guides from the database, and responds using Google Gemini.
   * Includes a persistent rate-limiting Beta Mode (capped at 5 questions per user session stored in `localStorage`) with a responsive Neo-Brutalist telemetry warning layout.

3. **Structured AI Telemetry & Stream Processing**:
   * Generates teams using Google Gemini, returning structured formats.
   * Leverages SSE (Server-Sent Events) to decode stream buffers on the fly using `TextDecoder`, showing the live reasoning steps of the agent directly in the neo-brutalist Telemetry Terminal.

4. **Incremental Refinement**:
   * Allows users to lock specific Pokémon slots and submit feedback to the AI. The generator honors locked slots while adjusting only unlocked positions to build synergies.

---

### Vibe Coding & Agentic Assistance (Antigravity)

* **Vibe Coding Flow**: Several modules, including database audits, testing suites, and manual construction states, were developed using a dynamic "vibe coding" philosophy, letting the architecture shape itself iteratively based on real-time feedback loop.
* **Powered by Antigravity**: The final QA rework, packages uncoupling, Vitest setup, GitHub Actions CI integration, and Phase 4 interactive manual team builder implementation were successfully driven, coded, and verified by **Antigravity** (Google DeepMind's agentic AI coding assistant).

---

### Technology Stack

* **Core**: Next.js 16.2 (App Router + Server Actions), React 19.2, TypeScript 5.
* **Databases**: Supabase PostgreSQL with `pgvector` extension for production, SQLite (via `better-sqlite3`) for local custom format persistence.
* **ORM**: Prisma 7.8 with dual PostgreSQL/SQLite adapter clients.
* **AI Engine**: Gemini 2.5 (`@google/generative-ai`) combined with local embeddings.
* **Styling**: Tailwind CSS v4, custom theme variables, and Framer Motion for micro-animations.

---

### 🚀 Getting Started

To run Hexacore locally, follow these steps:

#### Prerequisites
- **Node.js** (v18.x or higher)
- **pnpm** (v9.x or higher)
- **PostgreSQL** (with `pgvector` extension enabled, e.g., Supabase)

#### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DavidSiSx/hexacore.git
   cd hexacore
   ```

2. **Install dependencies**:
   Make sure you use `pnpm` as the dependency manager:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and fill in your values (Supabase credentials and Gemini API Key):
   ```bash
   cp .env.example .env
   ```
   *Note: In production, managing Gemini API usage limits will be key to prevent rate-limiting under heavy usage.*

4. **Initialize the Database**:
   Run Prisma migrations and seed the database with Pokémon metadata and strategy vectors:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run the Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Run Tests**:
   ```bash
   pnpm test
   ```

---

### Roadmap

#### ✅ Phase 1 — Database Foundation & Knowledge Vault
- [x] Hybrid database schema design.
- [x] Full seed pipeline: 1,468 Pokémon forms enriched with Showdown + Smogon + PokeAPI data.
- [x] Local embedding generator with `Transformers.js`.

#### ✅ Phase 2 — Hexacore Premium & Metagame
- [x] Native App Router i18n translation middleware.
- [x] Neo-brutalist styling system with Kinetic typography.
- [x] **Metagame Dashboard**: Live visualization of Smogon Chaos usage.
- [x] **Damage Calculator**: Smogon sets injection, field modifiers, and Teracristalization support.

#### ✅ Phase 3 — User Experience & Navigation
- [x] Refactored Topbar navigation layout.
- [x] Custom React confirm overlay dialogs in replacement of browser-blocking `confirm()`.

#### ✅ Phase 4 — The Builder & Legality Engine (Completed)
- [x] Team Builder powered by Gemini + RAG context injection.
- [x] SSE Telemetry Terminal for live AI log streams.
- [x] Reactive VGC / Smogon legality checker.
- [x] Custom Format manager allowing clause building and controlled autocomplete bans.

---

<h2 id="español">🇪🇸 Español</h2>

### ¿Qué es Hexacore?

Hexacore es una aplicación avanzada de construcción de equipos competitivos de Pokémon diseñada para jugadores de alto nivel. Combina razonamiento de inteligencia artificial de última generación y bases de datos vectoriales locales para generar, refinar y validar equipos según las normativas oficiales de VGC y Smogon.

---

### Arquitectura y Diseño Técnico

Hexacore sigue un patrón de **Arquitectura Limpia / Screaming Architecture**, garantizando separación estricta de responsabilidades, límites de rutas limpios y máxima reusabilidad:

1. **Estructura Modular de Componentes**:
   * Toda la lógica del constructor se encuentra en la ruta [src/app/components/TeamBuilder/](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/).
   * **Patrón Contenedor y Presentacional**: Componentes visuales como [FilterPanel.tsx](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/components/FilterPanel.tsx), [TelemetryTerminal.tsx](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/components/TelemetryTerminal.tsx) y [ValidationDashboard.tsx](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/components/ValidationDashboard.tsx) se encargan únicamente de estructurar el diseño, recibiendo estados y acciones unificadas.
   * **Custom Hooks para aislar lógica de negocio**:
     * [useTeamBuilder.ts](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/hooks/useTeamBuilder.ts): Orquesta la generación en streaming, bloquea ranuras del equipo, gestiona el formato Showdown y activa las alertas (toasts) neo-brutalistas.
     * [useCustomFormats.ts](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/hooks/useCustomFormats.ts): Controla el CRUD local de las reglas de formatos personalizados.
   * **Internacionalización Nativa**: El diccionario [locales.ts](file:///c:/Repositorios/hexacore/src/app/components/TeamBuilder/locales.ts) está fuertemente tipado mediante utilidades avanzadas de TypeScript (`StringifyLeaf`) para optimizar el bundle final y evitar discrepancias de idiomas.

2. **Integridad de Datos y Autocompletado Controlado**:
   * **Cero Campos de Texto Libre**: Para evitar errores tipográficos que rompan las búsquedas de legalidad, las listas de baneos de Pokémon, objetos, movimientos o habilidades usan autocompletados restrictivos conectados a Server Actions ([pokedex.ts](file:///c:/Repositorios/hexacore/src/app/actions/pokedex.ts) y [encyclopedia.ts](file:///c:/Repositorios/hexacore/src/app/actions/encyclopedia.ts)).
   * **Validación Reactiva en Renderizado**: El reporte de legalidad se calcula dinámicamente en el render, eliminando bucles y retardos causados por el uso innecesario de `useEffect`.

---

### Integración de IA y RAG

1. **Embeddings Locales y RAG**:
   * Emplea `@xenova/transformers` con el modelo `all-MiniLM-L6-v2` para vectorizar localmente guías estratégicas y estadísticas de Smogon.
   * Realiza búsquedas vectoriales usando `pgvector` en Supabase PostgreSQL para proveer resúmenes competitivos relevantes a Gemini 2.5/3.5.

2. **Coach Estratégico de IA (Beta)**:
   * Incorpora un panel lateral interactivo para asesoría competitiva en tiempo real. Realiza clasificación semántica de intención sobre las dudas del usuario (counters, velocidad, sinergias, repartos de EVs), recupera guías contextuales mediante RAG y genera respuestas tácticas con Gemini.
   * Implementa una restricción persistente en modo Beta limitada a 5 preguntas gratuitas por sesión (almacenadas de forma segura en `localStorage`), acompañado de advertencias y estados visuales neo-brutalistas.

3. **Telemetría y Procesamiento en Streaming**:
   * Genera respuestas estructuradas desde Gemini.
   * Utiliza SSE (Server-Sent Events) decodificando buffers con `TextDecoder` para proyectar el flujo de razonamiento interno de la IA en tiempo real en la terminal neo-brutalista.

4. **Refinamiento Incremental**:
   * Permite fijar Pokémon específicos mediante candados (locks). El motor de IA respeta los candados y actualiza solo las ranuras desbloqueadas garantizando sinergias ideales.

---

### Vibe Coding y Asistencia Agéntica (Antigravity)

* **Flujo de Vibe Coding**: Diversos componentes y módulos (como scripts de auditoría, suites de pruebas y control manual de estados) fueron desarrollados de manera ágil bajo la filosofía de "vibe coding", permitiendo que el diseño técnico evolucione a través de iteraciones rápidas.
* **Desarrollado con Antigravity**: El saneamiento final de calidad, desacoplamiento de dependencias fantasma, configuración de Vitest, la tubería de CI con GitHub Actions y la implementación interactiva de la Fase 4 para construir equipos desde cero fueron conducidos, programados y validados íntegramente por **Antigravity** (el asistente de programación agéntico con IA de Google DeepMind).

---

### Stack Tecnológico

* **Núcleo**: Next.js 16.2 (App Router + Server Actions), React 19.2, TypeScript 5.
* **Bases de Datos**: Supabase PostgreSQL con extensión `pgvector` en producción, SQLite (a través de `better-sqlite3`) para reglas de formatos locales.
* **ORM**: Prisma 7.8 con soporte dual PostgreSQL/SQLite.
* **Motor de IA**: Gemini 2.5 (`@google/generative-ai`) integrado con embeddings de texto locales.
* **Estilos**: Tailwind CSS v4, variables de tema dinámicas y Framer Motion para micro-animaciones.

---

### 🚀 Guía de Inicio

Para ejecutar Hexacore localmente, sigue estos pasos:

#### Requisitos Previos
- **Node.js** (v18.x o superior)
- **pnpm** (v9.x o superior)
- **PostgreSQL** (con la extensión `pgvector` habilitada, ej. Supabase)

#### Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/DavidSiSx/hexacore.git
   cd hexacore
   ```

2. **Instalar dependencias**:
   Asegúrate de usar `pnpm` como gestor de paquetes del proyecto:
   ```bash
   pnpm install
   ```

3. **Configurar Variables de Entorno**:
   Copia el archivo de ejemplo y completa tus credenciales de Supabase y tu API Key de Gemini:
   ```bash
   cp .env.example .env
   ```
   *Nota: En producción, gestionar adecuadamente los límites de uso de la API de Gemini es fundamental para evitar bloqueos por cuotas.*

4. **Inicializar la Base de Datos**:
   Ejecuta las migraciones de Prisma y el sembrado de datos (metadatos de Pokémon y vectores de estrategia):
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Iniciar el Servidor de Desarrollo**:
   ```bash
   pnpm dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

6. **Ejecutar Pruebas**:
   ```bash
   pnpm test
   ```

---

### Roadmap

#### ✅ Fase 1 — Cimientos y Bóveda RAG
- [x] Diseño de base de datos híbrida (Prisma).
- [x] Pipeline de sembrado de datos enriquecidos de 1,468 Pokémon.
- [x] Generación de embeddings locales.

#### ✅ Fase 2 — Hexacore Premium y Metajuego
- [x] Middleware y enrutamiento i18n nativo.
- [x] Sistema de diseño brutalista con tipografías responsivas.
- [x] **Dashboard de Metajuego**: Integración de datos Chaos de Smogon.
- [x] **Calculadora de Daño**: Soporte avanzado para Tera, condiciones de campo e inyección de sets.

#### ✅ Fase 3 — Experiencia de Usuario y Navegación
- [x] Refactorización del Topbar de navegación.
- [x] Diálogos y modales con overlays reactivos en React (reemplazo de `confirm()`).

#### ✅ Fase 4 — El Constructor y Motor de Reglas (Completado)
- [x] Team Builder impulsado por IA con soporte RAG contextual.
- [x] Terminal SSE de telemetría para razonamiento en streaming.
- [x] Validador de legalidad reactivo en renderizado.
- [x] Gestor CRUD de formatos personalizados con listas restrictivas de autocompletado.

---

<p align="center">Hecho por David Alejandro Sierra Sosa</p>
