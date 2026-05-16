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

Hexacore is a competitive Pokémon team-building assistant that goes far beyond any existing tool. It combines:

- **A living RAG knowledge base** seeded with structured Smogon strategies, PokeAPI lore, and real-time usage statistics.
- **Metagame Dashboard**: Live visualization of Smogon "Chaos" data, showing the most used Pokémon, moves, and abilities in the current format.
- **Showdown-Grade Damage Calculator**: A professional-grade calculator with Smogon set injection, Tera Type support, and field condition simulations.
- **Gemini 2.5 with Structured Outputs**: To guarantee legally-valid, format-compliant team suggestions.

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
│  @pkmn/dex + Smogon Sets + PokeAPI + Usage Stats (Chaos)     │
│  -> Vectorized with all-MiniLM-L6-v2 (384d) -> pgvector      │
└──────────────────────────────────────────────────────────────┘
```

### Roadmap

#### ✅ Phase 1 & 1.5 — Database Foundation & Knowledge Vault
- [x] Hybrid schema design (`Criatura`, `Objeto`, `Habilidad`, `Movimiento`)
- [x] Full seed pipeline: 1,468 Pokémon forms enriched with Showdown + Smogon + PokeAPI.
- [x] Local embedding model (all-MiniLM-L6-v2)

#### ✅ Phase 2 — Hexacore Premium & Metagame
- [x] Architecture: Native App Router i18n (`/[lang]`) and Middleware.
- [x] Aesthetics: Kinetic Typography & Brutalism design system.
- [x] **Metagame Dashboard**: Integration with Smogon Chaos data.
- [x] **Damage Calculator**: Professional engine with Smogon sets & Tera support.

#### 🔄 Phase 3 — User Experience & Navigation
- [ ] Refactor Navigation Topbar for better accessibility and user flow.
- [ ] Implement User Profiles and Team History.

#### ⬜ Phase 4 — The Builder (The Masterpiece)
- [ ] AI-Driven Team Builder with RAG synergy detection.
- [ ] Real-time SSE telemetry for streaming AI reasoning.
- [ ] Legality checker for VGC and Smogon formats.

---

<h2 id="español">🇪🇸 Español</h2>

### ¿Qué es Hexacore?

Hexacore es un asistente de construcción de equipos competitivos de Pokémon que combina:

- **Base de Conocimiento RAG**: Estrategias de Smogon, lore de PokeAPI y estadísticas de uso en tiempo real.
- **Dashboard de Metajuego**: Visualización en vivo de los datos "Chaos" de Smogon, mostrando lo más usado en el formato actual.
- **Calculadora de Daño Showdown-Style**: Un motor profesional con inyección de sets de Smogon, soporte para Teracristalización y condiciones de campo.
- **IA Estructurada**: Gemini 2.5 garantiza que cada sugerencia sea legal y válida para el formato elegido.

### Roadmap

#### ✅ Fase 1 y 1.5 — Cimientos y Bóveda RAG
- [x] Diseño de esquema híbrido y migración a Prisma 7.
- [x] Pipeline de sembrado: 1,468 Pokémon enriquecidos con 4 capas de datos.

#### ✅ Fase 2 — Hexacore Premium y Metajuego
- [x] Arquitectura: i18n nativo y sistema de diseño Brutalista.
- [x] **Metagame Dashboard**: Integración de datos empíricos de uso.
- [x] **Calculadora de Daño**: Motor pro con soporte para Tera y sets automáticos.

#### 🔄 Fase 3 — Experiencia de Usuario y Navegación
- [ ] Refactorización del Topbar de navegación.
- [ ] Perfiles de usuario y guardado de equipos.

#### ⬜ Fase 4 — El Constructor (La Obra Maestra)
- [ ] Team Builder impulsado por IA con detección de sinergias RAG.
- [ ] Telemetría SSE para el razonamiento de la IA en tiempo real.
- [ ] Verificador de legalidad para VGC y formatos Smogon.

---

<p align="center">Built with lightning by the Hexacore team</p>
