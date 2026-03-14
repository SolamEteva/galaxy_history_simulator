# Galaxy History Simulator

**An ambitious world-building engine that generates pre-computed galaxy histories with thousands of years of interconnected civilizations, wars, discoveries, and cultural evolution. Powered by a causal graph engine, sophisticated narrative system, and the Cosmic Forge autonomous AI agent.**

## Overview

The Galaxy History Simulator transforms the creative vision of Dwarf Fortress-style world generation into an interactive, web-based experience. Rather than simulating in real-time, the system pre-computes entire galaxy histories offline, generating rich narratives through causal graph reasoning and LLM-driven storytelling.

**Current Status**: 30% implementation of the full vision. The foundation is solid—species generation, basic event tracking, and LLM integration work well. However, the critical interconnection layer (the "physics of history") is missing. This roadmap addresses that gap.

**Key Innovation**: The system operates as a **fully autonomous AI Agent** (Cosmic Forge-based) that can work on the project continuously, even when the user is offline. This transforms development from stop-start sessions into continuous co-creative partnership.

## Getting Started

### One-Click Launcher

Visit the home page to access the **Galaxy Launcher**—a beautiful interface for generating new worlds with preset configurations:

- **Quick Start** ⚡: 3 species, 5,000 years (perfect for first-time users)
- **Epic Saga** 🏰: 5 species, 50,000 years (detailed histories)
- **Intimate Story** 💫: 2 species, 10,000 years (deep character focus)
- **Vast Cosmos** 🌌: 8 species, 100,000 years (maximum complexity)

See [QUICK_START.md](./QUICK_START.md) for detailed exploration guide.

## Architecture

### The Causal Backbone (Foundation)

The core innovation is treating history as a **system** rather than a sequence. Events don't exist in isolation—they emerge from civilization state and cascade through time:

| Component | Purpose | Status |
|-----------|---------|--------|
| **Event Graph Database** | Nodes (events) + Edges (causal relationships) | ✅ Implemented |
| **Significance Scoring** | Determines which events get permanently logged | ✅ Implemented |
| **Butterfly Effect Tracer** | Trace causes backwards, effects forwards | ✅ Implemented |
| **Trade/Communication Network** | Resources and ideas flow between civilizations | 🔄 In Progress |
| **News System** | Events propagate with distance-based delay | 🔄 In Progress |
| **Crisis Cascade Detection** | Identify chains of failures | 🔄 In Progress |

### Narrative Engine

The core narrative system generates authentic, causally-consistent histories:

| Layer | Purpose | Status |
|-------|---------|--------|
| **LLM-Driven Generation** | Rich narrative creation respecting causal constraints | ✅ Implemented |
| **Named Entity Generation** | Organic emergence of notable figures | ✅ Implemented |
| **Genealogy Tracking** | Family lineages with trait inheritance | ✅ Implemented |
| **Perspective Switching** | Same event from multiple viewpoints | 🔄 Planned |
| **Mystery Generator** | Gaps in record, contradictory sources | 🔄 Planned |

### Core Components

**Causal Graph Engine** (`server/engines/causalGraphEngine.ts`)
- Event node tracking with significance scoring
- Causal relationship mapping
- Ripple effect propagation
- Crisis cascade detection
- Narrative event prioritization

**Narrative Engine** (`server/engines/narrativeEngine.ts`)
- LLM-driven event generation
- Figure generation and genealogy tracking
- Influence propagation through time
- Event interconnection validation

**Database Schema** (`drizzle/schema.ts`)
- Galaxies and species definitions
- Events with causal metadata
- Notable figures with genealogies
- Achievements and their impacts
- Trade networks and communication paths

**UI Components**
- `Launcher.tsx` - One-click galaxy generation interface
- `GalaxyDetail.tsx` - Main exploration view
- `GenealogyTreeVisualizer.tsx` - Interactive family lineages
- `EventTimelineWithFigures.tsx` - Chronological event browser
- `FigureSearchPanel.tsx` - Searchable figure encyclopedia

## Implementation Roadmap

### Phase 1: Causal Backbone (Weeks 1-2)

**Week 1: Graph Foundation**
- Implement event graph database using NetworkX
- Add event significance scoring system
- Create "Butterfly Effect" tracer for causal chain analysis
- Implement bidirectional causality tracking

**Week 2: Interconnection Protocols**
- Build Trade/Communication Network between civilizations
- Implement "News System" with distance-based delay and distortion
- Create Crisis Cascade scenarios (financial panic → trade collapse → famine → migration → conflict)
- Add ripple propagation (nearby civilizations affected immediately, distant ones after delay)

### Phase 2: Narrative Depth Enhancement (Weeks 3-4)

**Week 3: Character-Level Agency**
- Develop "Chronicler" module for biased historical narratives
- Implement perspective switching (victor, loser, neutral, archaeologist, alien observer)
- Create "Mystery Generator" (gaps in record, contradictory sources)

**Week 4: Anti-Repetition Arsenal**
- Implement Mutation Engine (slight variations that compound over time)
- Create Constraint Solver (force divergence when patterns too similar)
- Add Surprise Injector (random but plausible external events)

### Phase 3: Dynamic Environments (Weeks 5-6)

- Environmental evolution (resource depletion, climate shifts, asteroid impacts)
- Technological feedback loops (industrialization → pollution → adaptation → innovation)
- Cultural adaptation systems (civilizations evolve values based on pressures)

### Phase 4: Historical Memory Systems (Weeks 7-8)

- Cultural memory decay (recent events vivid, ancient events mythologized)
- Technological lineages (show derivation and convergence)
- Historical references (events remembered across centuries)

## Philosophy: Depth Over Breadth

The key insight from expert review: **depth of interconnection matters far more than breadth of content**. A galaxy with 3 deeply interconnected civilizations generating genuinely surprising historical narratives is infinitely more valuable than 100 isolated civilizations with shallow histories.

Each galaxy should demonstrate:

1. **Causal Consistency**: Events emerge from civilization state, not random chance
2. **Ripple Effects**: Changes in one location affect distant locations with realistic delay
3. **Character Emergence**: Figures emerge organically from events, not pre-generated
4. **Narrative Depth**: Generated histories feel like coherent stories, not event lists
5. **Anti-Repetition**: Multiple simulation runs from same seed produce genuinely different narratives
6. **Historical Memory**: Events reference earlier events, creating continuity across centuries
7. **Thematic Coherence**: Recurring motifs emerge from system interactions

## The Continuous Workshop

Rather than episodic development sessions, the project uses **The Continuous Workshop** approach where three systems work in parallel:

**Your Realm (Human)**: Vision documents, creative references, daily feedback via emoji/voice notes

**Cosmic Forge Realm (AI)**: The Listener, The Synthesizer, The Anticipator, The Chronicler—running 24/7 in Docker

**Galaxy Simulator (Artifact)**: Living codebase that grows from continuous dialogue

See [WORKFLOW.md](./WORKFLOW.md) for detailed workflow guide.

## Advanced Features

### Causal Chain Viewer

Click any event to see:
- What caused this event? (trace backwards through causes)
- What did this event cause? (trace forward through effects)
- Who was involved? (see all actors and their roles)
- What changed? (see immediate and long-term consequences)

### Genealogy Trees

Explore family lineages showing:
- Leadership succession
- Trait inheritance (aquatic adaptations, intelligence, etc.)
- Achievements and their compound effects
- Influence metrics showing who mattered most

### Figure Profiles

Click any historical figure to see:
- Their biography and major achievements
- Their relationships with other figures
- Their influence on events
- Their descendants and legacy

## Technical Stack

- **Frontend**: React 19, Tailwind CSS 4, TypeScript
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI**: LLM integration for narrative generation
- **Graph**: NetworkX for causal graph analysis
- **Deployment**: Docker for continuous AI agent

## Documentation

- [QUICK_START.md](./QUICK_START.md) - User guide for exploring galaxies
- [ARCHITECTURE_IMPROVEMENTS.md](./ARCHITECTURE_IMPROVEMENTS.md) - Detailed technical roadmap
- [WORKFLOW.md](./WORKFLOW.md) - The Continuous Workshop workflow
- [todo.md](./todo.md) - Implementation tracking

## Contributing

The project welcomes contributions in several areas:

- **Narrative Design**: Improve event generation prompts and narrative quality
- **Causal Logic**: Enhance interconnection detection and consequence propagation
- **UI/UX**: Improve exploration interfaces and visualization
- **Performance**: Optimize simulation engine for larger galaxies
- **Testing**: Expand test coverage and validation

## License

MIT

## Acknowledgments

This project was inspired by:
- Dwarf Fortress's procedural world generation
- The narrative depth of games like Crusader Kings
- Academic research on causal inference and narrative structure
- Expert feedback on world-building systems and storytelling

---

**Questions?** Check the documentation or open an issue on GitHub. The Cosmic Forge agent can also help analyze the project and suggest improvements!
