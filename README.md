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
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" />
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
│    Next.js 15     │   Supabase Postgres  │   Google Gemini   │
│  (App Router +    │   JSONB + pgvector   │      2.5 Pro      │
│   Server Actions) │   Prisma 7 ORM       │  Structured JSON  │
├───────────────────┴──────────────────────┴───────────────────┤
│                     Knowledge Layer (RAG)                    │
│  @pkmn/dex + Smogon Sets + PokeAPI + Math/Synergy Mechanics  │
│  -> Vectorized with all-MiniLM-L6-v2 (384d) -> pgvector      │
└──────────────────────────────────────────────────────────────┘
```

The seed pipeline (`prisma/seed.ts`) performs a **Multi-layer enrichment** for every Pokémon, Item, Ability, and Move, combined with static dictionaries containing game mechanics (Priority Brackets, Weather, Terastallization) and high-level synergies (e.g. Costar + Commander).

### Roadmap

#### ✅ Phase 1 & 1.5 — Database Foundation & Knowledge Vault
- [x] Hybrid schema design (`Criatura`, `Objeto`, `Habilidad`, `Movimiento`, `Formato`)
- [x] Prisma 7 migration with Supabase pgvector
- [x] Full seed pipeline: 1,468 Pokémon × 4 data layers (Showdown + Smogon + PokeAPI + Math/Gimmicks)
- [x] Local embedding model (all-MiniLM-L6-v2, 384d)

#### 🔄 Phase 2 — Controlled Generation (Structured Outputs)
- [ ] Zod schemas for competitive builds (moves, EVs, item, ability, nature)
- [ ] Gemini 2.5 client with `response_schema` enforcement
- [ ] RAG retrieval function (cosine similarity via pgvector)

#### ⬜ Phase 3 & 4 — Telemetry & RLHF Feedback
- [ ] Server-Sent Events endpoint for streaming AI reasoning
- [ ] User correction traces (`TrazaCorreccion`) & fine-tuning loop.

### Getting Started
```bash
git clone https://github.com/YOUR_USERNAME/hexacore.git
cd hexacore
npm install
cp .env.example .env # Set DATABASE_URL and DIRECT_URL
npx prisma db push
npx tsx prisma/seed.ts # Seeds the RAG database (Takes ~30 min)
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

### Arquitectura y Pipeline RAG

```
┌──────────────────────────────────────────────────────────────┐
│                        Stack Hexacore                        │
├───────────────────┬──────────────────────┬───────────────────┤
│    Next.js 15     │   Supabase Postgres  │   Google Gemini   │
│  (App Router +    │   JSONB + pgvector   │      2.5 Pro      │
│   Server Actions) │   Prisma 7 ORM       │  Structured JSON  │
├───────────────────┴──────────────────────┴───────────────────┤
│                  Capa de Conocimiento (RAG)                  │
│  @pkmn/dex + Smogon Sets + PokeAPI + Mecánicas/Sinergias     │
│  -> Vectorizado con all-MiniLM-L6-v2 (384d) -> pgvector      │
└──────────────────────────────────────────────────────────────┘
```

El script de inicialización (`prisma/seed.ts`) realiza un **enriquecimiento multicapa** para cada Pokémon, Objeto, Habilidad y Movimiento, combinado con diccionarios estáticos que contienen las matemáticas del juego (Brackets de Prioridad, Climas, Teracristalización) y sinergias de alto nivel (ej. Costar + Commander).

### Roadmap

#### ✅ Fase 1 y 1.5 — Fundación de Base de Datos y Bóveda RAG
- [x] Diseño de esquema híbrido (`Criatura`, `Objeto`, `Habilidad`, `Movimiento`, `Formato`)
- [x] Migración de Prisma 7 con Supabase pgvector
- [x] Pipeline de sembrado: 1,468 Pokémon × 4 capas de datos (Showdown + Smogon + PokeAPI + Math/Gimmicks)
- [x] Modelo local de incrustación (all-MiniLM-L6-v2, 384d)

#### 🔄 Fase 2 — Generación Controlada (Structured Outputs)
- [ ] Esquemas Zod para builds competitivas (movimientos, EVs, objeto, habilidad, naturaleza)
- [ ] Cliente Gemini 2.5 con validación `response_schema`
- [ ] Función de recuperación RAG (similitud del coseno vía pgvector)

#### ⬜ Fase 3 y 4 — Telemetría y Feedback RLHF
- [ ] Endpoint de Server-Sent Events para streaming del razonamiento IA
- [ ] Trazas de corrección del usuario (`TrazaCorreccion`) y ciclo de fine-tuning.

### Cómo Empezar
```bash
git clone https://github.com/YOUR_USERNAME/hexacore.git
cd hexacore
npm install
cp .env.example .env # Configura DATABASE_URL y DIRECT_URL
npx prisma db push
npx tsx prisma/seed.ts # Llena la base de datos RAG (Toma ~30 min)
npm run dev
```

---

<p align="center">Built with lightning by the Hexacore team</p>
