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
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/PostgreSQL-pgvector-316192?logo=postgresql" />
  <img src="https://img.shields.io/badge/AI-Gemini_2.5-4285F4?logo=google" />
  <img src="https://img.shields.io/badge/ORM-Prisma_7-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Status-In_Development-orange" />
</p>

---

<p align="center">
  <a href="#english"><img src="https://img.shields.io/badge/Language-English-blue?style=for-the-badge" alt="English" /></a>
  <a href="#español"><img src="https://img.shields.io/badge/Idioma-Espa%C3%B1ol-green?style=for-the-badge" alt="Español" /></a>
</p>

---

<h2 id="english">🇬🇧 English</h2>

### What is Hexacore?

Hexacore is a competitive Pokémon team-building assistant that goes far beyond any existing tool. Instead of relying on static databases or unchecked AI hallucinations, it combines:

- **A living RAG knowledge base** seeded with structured Smogon strategies, PokeAPI lore, mathematical mechanics (priority, status conditions), and usage statistics for 1,400+ Pokémon forms, Items, and Abilities.
- **Gemini 2.5 with Structured Outputs** (Zod schemas) to guarantee legally-valid, format-compliant team suggestions with no hallucinated moves.
- **A hybrid relational/document model** (PostgreSQL + JSONB + pgvector) that handles official Pokémon, regional forms, Mega Evolutions, Gigantamax forms and future Fakemons.
- **Real-time SSE telemetry** for streaming AI reasoning to the frontend as it thinks.

### Architecture & RAG Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                        Hexacore Stack                        │
├───────────────────┬──────────────────────┬───────────────────┤
│    Next.js 16     │   Supabase Postgres  │   Google Gemini   │
│  (App Router +    │   JSONB + pgvector   │      2.5 Pro      │
│   Server Actions) │   Prisma 7 ORM       │  Structured JSON  │
├───────────────────┴──────────────────────┴───────────────────┤
│                     Knowledge Layer (RAG)                    │
│  @pkmn/dex + Smogon Sets + PokeAPI + Math/Synergy Mechanics  │
│  -> Vectorized with all-MiniLM-L6-v2 (384d) -> pgvector      │
└──────────────────────────────────────────────────────────────┘
```

The seed pipeline (`prisma/seed.ts`) performs a **Multi-layer enrichment** for every Pokémon, Item, Ability, and Move, combined with static dictionaries containing game mechanics (Priority Brackets, Weather, Terastallization) and high-level synergies (e.g. Costar + Commander).

### Hexacore Premium (v2.0 Update)
We have completely overhauled Hexacore to its Premium version, focusing on three core pillars:
1. **Kinetic Typography & Brutalism:** A highly aggressive, high-contrast visual identity. Zero border-radius, harsh binary animations (hard-blinks), solid colors, and an SVG `feTurbulence` noise texture overlay. Atomic primitives like `<KineticInput>` and `<KineticMarquee>` drive the UI.
2. **Native i18n & SEO:** Migrated from a client-side `LangProvider` to a Next.js App Router directory-based `/[lang]/` architecture with static dictionaries. This guarantees zero hydration flashes and perfect localized SEO indexing.
3. **Bulletproof Security:** Eradicated SQL injection vulnerabilities in `pgvector` raw queries by implementing strict Zod schema allowlisting for database filters.

### Roadmap

#### ✅ Phase 1 & 1.5 — Database Foundation & Knowledge Vault
- [x] Hybrid schema design (`Criatura`, `Objeto`, `Habilidad`, `Movimiento`, `Formato`)
- [x] Prisma 7 migration with Supabase pgvector
- [x] Full seed pipeline: 1,468 Pokémon × 4 data layers (Showdown + Smogon + PokeAPI + Math/Gimmicks)
- [x] Local embedding model (all-MiniLM-L6-v2, 384d)

#### ✅ Phase 2 — Hexacore Premium Refactor
- [x] Security: Zod Allowlisting for pgvector raw queries.
- [x] Architecture: Native App Router i18n (`/[lang]`) and Middleware.
- [x] Aesthetics: Kinetic Typography & Brutalism design system (`globals.css`, `tailwind v4`).
- [x] Primitives: Kinetic Components & Reveal Cards.

#### 🔄 Phase 3 — Controlled Generation (Structured Outputs)
- [ ] Zod schemas for competitive builds (moves, EVs, item, ability, nature)
- [ ] Gemini 2.5 client with `response_schema` enforcement
- [ ] RAG retrieval function (cosine similarity via pgvector)

#### ⬜ Phase 4 — Telemetry & RLHF Feedback
- [ ] Server-Sent Events endpoint for streaming AI reasoning
- [ ] User correction traces (`TrazaCorreccion`) & fine-tuning loop.

### Getting Started
```bash
git clone https://github.com/DavidSiSx/hexacore.git
cd hexacore
npm install
cp .env.example .env # Set DATABASE_URL and DIRECT_URL
npx prisma db push
npx tsx prisma/seed.ts # Seeds the RAG database & native tags
npm run dev
```

---

<h2 id="español">🇪🇸 Español</h2>

### ¿Qué es Hexacore?

Hexacore es un asistente de construcción de equipos competitivos de Pokémon que va mucho más allá de cualquier herramienta existente. En lugar de depender de bases de datos estáticas o alucinaciones de la IA, combina:

- **Una base de conocimiento RAG viva** poblada con estrategias estructuradas de Smogon, historia de PokeAPI, mecánicas matemáticas (prioridad, estados) y estadísticas para más de 1,400 formas de Pokémon, Objetos y Habilidades.
- **Gemini 2.5 con Structured Outputs** (esquemas Zod) para garantizar sugerencias de equipos legales y válidas sin movimientos inventados.
- **Un modelo híbrido relacional/documental** (PostgreSQL + JSONB + pgvector) que maneja Pokémon oficiales, formas regionales, Megaevoluciones, Gigamax y futuros Fakemons.
- **Telemetría en tiempo real (SSE)** para transmitir el razonamiento de la IA al frontend mientras "piensa".

### Hexacore Premium (Actualización v2.0)
Hemos renovado completamente Hexacore a su versión Premium, centrándonos en tres pilares:
1. **Kinetic Typography y Brutalismo:** Una identidad visual agresiva y de alto contraste. Cero bordes redondeados, animaciones binarias severas, colores sólidos y una textura de ruido SVG `feTurbulence`.
2. **i18n Nativo y SEO:** Migración de un `LangProvider` del cliente a una arquitectura nativa de Next.js `/[lang]/` con diccionarios estáticos. Esto garantiza cero destellos de hidratación y un SEO localizado perfecto.
3. **Seguridad Blindada:** Erradicación de vulnerabilidades de inyección SQL en consultas crudas de `pgvector` implementando una estricta validación Zod (Allowlisting).

### Arquitectura y Pipeline RAG

```
┌──────────────────────────────────────────────────────────────┐
│                        Stack Hexacore                        │
├───────────────────┬──────────────────────┬───────────────────┤
│    Next.js 16     │   Supabase Postgres  │   Google Gemini   │
│  (App Router +    │   JSONB + pgvector   │      2.5 Pro      │
│   Server Actions) │   Prisma 7 ORM       │  Structured JSON  │
├───────────────────┴──────────────────────┴───────────────────┤
│                  Capa de Conocimiento (RAG)                  │
│  @pkmn/dex + Smogon Sets + PokeAPI + Mecánicas/Sinergias     │
│  -> Vectorizado con all-MiniLM-L6-v2 (384d) -> pgvector      │
└──────────────────────────────────────────────────────────────┘
```

El script de inicialización (`prisma/seed.ts`) realiza un **enriquecimiento multicapa** para cada Pokémon, Objeto, Habilidad y Movimiento, combinado con diccionarios estáticos que contienen las matemáticas del juego y sinergias.

### Roadmap

#### ✅ Fase 1 y 1.5 — Fundación de Base de Datos y Bóveda RAG
- [x] Diseño de esquema híbrido (`Criatura`, `Objeto`, `Habilidad`, `Movimiento`, `Formato`)
- [x] Migración de Prisma 7 con Supabase pgvector
- [x] Pipeline de sembrado: 1,468 Pokémon × 4 capas de datos

#### ✅ Fase 2 — Refactor Hexacore Premium
- [x] Seguridad: Allowlisting con Zod para consultas crudas.
- [x] Arquitectura: i18n nativo (`/[lang]`) y Middleware.
- [x] Estética: Sistema Kinetic Typography y Brutalismo.
- [x] Primitivas: Componentes Kinetic y Tarjetas Reveal.

#### 🔄 Fase 3 — Generación Controlada (Structured Outputs)
- [ ] Esquemas Zod para builds competitivas
- [ ] Cliente Gemini 2.5 con validación `response_schema`
- [ ] Función de recuperación RAG vía pgvector

#### ⬜ Fase 4 — Telemetría y Feedback RLHF
- [ ] Endpoint de Server-Sent Events
- [ ] Trazas de corrección del usuario (`TrazaCorreccion`)

### Cómo Empezar
```bash
git clone https://github.com/DavidSiSx/hexacore.git
cd hexacore
npm install
cp .env.example .env # Configura DATABASE_URL y DIRECT_URL
npx prisma db push
npx tsx prisma/seed.ts # Llena la base de datos RAG
npm run dev
```

---

<p align="center">Built with lightning by the Hexacore team</p>
