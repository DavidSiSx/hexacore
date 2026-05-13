<p align="center">
  <img src="https://play.pokemonshowdown.com/sprites/gen5/charizard.png" width="80" />
  <img src="https://play.pokemonshowdown.com/sprites/gen5/corviknightgmax.png" width="80" />
  <img src="https://play.pokemonshowdown.com/sprites/gen5/ogerponhearthflame.png" width="80" />
</p>

<h1 align="center">⬡ Hexacore</h1>
<p align="center">
  <strong>AI-Powered Competitive Pokémon Team Builder</strong><br/>
  A next-generation VGC/Smogon team builder powered by RAG, pgvector and Gemini structured outputs.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/PostgreSQL-pgvector-316192?logo=postgresql" />
  <img src="https://img.shields.io/badge/AI-Gemini_2.5-4285F4?logo=google" />
  <img src="https://img.shields.io/badge/ORM-Prisma_7-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/Status-In_Development-orange" />
</p>

---

## What is Hexacore?

Hexacore is a competitive Pokémon team-building assistant that goes far beyond any existing tool. Instead of relying on static databases or unchecked AI hallucinations, it combines:

- **A living RAG knowledge base** seeded with structured Smogon strategies, real set data, and Showdown usage statistics for 1,400+ Pokémon forms.
- **Gemini 2.5 with Structured Outputs** (Zod schemas) to guarantee legally-valid, format-compliant team suggestions with no hallucinated moves or illegal items.
- **A hybrid relational/document model** (PostgreSQL + JSONB + pgvector) that handles official Pokémon, regional forms, Mega Evolutions, Gigantamax forms and future Fakemons in a single unified model.
- **Real-time SSE telemetry** for streaming AI reasoning to the frontend as it thinks.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Hexacore Stack                        │
├───────────────────┬──────────────────────┬───────────────────┤
│    Next.js 15     │   Supabase Postgres  │   Google Gemini   │
│  (App Router +    │   JSONB + pgvector   │      2.5 Pro      │
│   Server Actions) │   Prisma 7 ORM       │  Structured JSON  │
├───────────────────┴──────────────────────┴───────────────────┤
│                     Knowledge Layer (RAG)                    │
│  @pkmn/dex learnsets + Smogon Sets JSON + Smogon Analyses   │
│  -> Vectorized with all-MiniLM-L6-v2 (384d) -> pgvector     │
└──────────────────────────────────────────────────────────────┘
```

### Database Schema

| Table | Purpose |
|---|---|
| `Criatura` | All Pokémon species + forms. Stats, abilities, tier and battle attributes stored as JSONB. Fakemon-ready. |
| `DocumentoConocimiento` | RAG encyclopedia. 1 document per Pokémon containing full Smogon strategies, movesets, EVs, counters and learnsets, vectorized at 384 dimensions. |
| `Build` | Saved competitive builds linked to a Criatura. |
| `Equipo` | 6-slot team compositions. |
| `TrazaCorreccion` | RLHF correction traces — user feedback that improves AI quality over time. |

---

## RAG Knowledge Pipeline

The seed pipeline (`prisma/seed.ts`) performs a **3-layer enrichment** for every Pokémon:

1. **Structural Layer** — `@pkmn/dex`: Types, base stats, abilities, weight, tier, sprite, required items (for Mega/forme triggers), Gigantamax move, and full learnset.
2. **Strategy Layer** — `pkmn.github.io/smogon/data/sets/gen9.json`: Every competitive set for every format (VGC, Ubers, OU, Monotype, ZU...) with exact EVs, IVs, Natures, items, moves, and Tera Types.
3. **Expert Layer** — `pkmn.github.io/smogon/data/analyses/gen9.json`: Human-written strategy overviews, teambuilding advice, checks & counters authored by the Smogon community.

The combined document is vectorized using `Xenova/all-MiniLM-L6-v2` (runs locally, no API cost) and stored in PostgreSQL via `pgvector`.

---

## Data Coverage

- **1,468 mechanically distinct species** (base + regional forms + Megas + Gigantamax + formes that change stats/ability/type)
- Cosmetic-only forms **excluded** (Furfrou trims, Minior colors, Alcremie decorations, Pikachu caps)
- Alternate formes that require special conditions **included**: Mega Evolutions, Primal Reversions, Zacian-Crowned, Ogerpon-Hearthflame, G-Max forms, etc.
- Each Pokémon carries a `requiredItem` flag so the AI knows what item is mandatory to trigger the forme.

---

## Roadmap

### ✅ Phase 1 — Database Foundation
- [x] Hybrid schema design (JSONB + pgvector)
- [x] Prisma 7 migration with Supabase
- [x] Full seed pipeline: 1,468 Pokémon × 3 data layers
- [x] Local embedding model (all-MiniLM-L6-v2, 384d)

### 🔄 Phase 2 — Controlled Generation (Structured Outputs)
- [ ] Zod schemas for competitive builds (moves, EVs, item, ability, nature)
- [ ] Gemini 2.5 client with `response_schema` enforcement
- [ ] RAG retrieval function (cosine similarity via pgvector)

### ⬜ Phase 3 — Real-time Telemetry (SSE)
- [ ] Server-Sent Events endpoint for streaming AI reasoning
- [ ] Frontend build progress visualization

### ⬜ Phase 4 — RLHF Feedback Loop
- [ ] User correction traces (`TrazaCorreccion`)
- [ ] Fine-tuning pipeline from community feedback
- [ ] Fakemon support UI

---

## Tech Stack

| Technology | Role |
|---|---|
| **Next.js 15** | Full-stack framework (App Router) |
| **TypeScript** | Strict typing throughout |
| **Prisma 7** | ORM with driver adapter for pgvector |
| **PostgreSQL + pgvector** | Hybrid relational/vector database |
| **Supabase** | Managed Postgres host |
| **Google Gemini 2.5** | AI engine (structured outputs) |
| **Zod** | Schema validation & AI output enforcement |
| **@pkmn/dex** | Pokémon Showdown data engine |
| **Xenova Transformers** | Local embedding model (all-MiniLM-L6-v2) |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/hexacore.git
cd hexacore

# Install dependencies
npm install

# Set up your environment variables
cp .env.example .env
# Fill in DATABASE_URL and DIRECT_URL from your Supabase project

# Push schema to database
npx prisma db push

# Seed the full knowledge base (takes ~30 min for all 1,468 Pokemon)
npx tsx prisma/seed.ts

# Start the dev server
npm run dev
```


---

## Data Sources

- **[Pokemon Showdown](https://github.com/smogon/pokemon-showdown)** — Base Dex via `@pkmn/dex`
- **[Smogon University](https://www.smogon.com)** — Competitive sets and strategy analyses
- **[pkmn.github.io/smogon](https://pkmn.github.io/smogon)** — Structured JSON exports of Smogon data

Hexacore is a fan-made, educational tool. Pokémon and all related names are trademarks of Nintendo / Game Freak. Smogon strategy content is copyright of Smogon University and its contributors.

---

<p align="center">Built with lightning by the Hexacore team</p>
