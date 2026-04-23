# Galaxy History Simulator

**An ambitious world-building engine that generates pre-computed galaxy histories with thousands of years of interconnected civilizations, wars, discoveries, and cultural evolution. Powered by a causal graph engine, sophisticated narrative system, and the Cosmic Forge autonomous AI agent.**

## Overview

The Galaxy History Simulator transforms the creative vision of Dwarf Fortress-style world generation into an interactive, web-based experience. Rather than simulating in real-time, the system pre-computes entire galaxy histories offline, generating rich narratives through causal graph reasoning and LLM-driven storytelling.

**Current Status**: 30-40% implementation of the full vision. The foundation is solid with functional simulation engines, LLM integration, responsive frontend, and 39+ tRPC procedures. The critical event-driven architecture is now being restructured to ensure histories emerge from interconnected consequences rather than pre-determined narratives.

**Key Innovation**: The system operates as a **fully autonomous AI Agent** (Cosmic Forge-based) that can work on the project continuously, even when the user is offline. This transforms development from stop-start sessions into continuous co-creative partnership.

## Getting Started

### One-Click Launcher

Visit the home page to access the **Galaxy Launcher**—a beautiful interface for generating new worlds with preset configurations:

- **Quick Start** ⚡: 3 species, 5,000 years (perfect for first-time users)
- **Epic Saga** 🏰: 5 species, 50,000 years (detailed histories)
- **Intimate Story** 💫: 2 species, 10,000 years (deep character focus)
- **Vast Cosmos** 🌌: 8 species, 100,000 years (maximum complexity)

See [QUICK_START.md](./QUICK_START.md) for detailed exploration guide.

## Current Implementation Status

### Completed Systems

| System | Component | Status |
|--------|-----------|--------|
| **Simulation Engine** | Causal Graph Engine | ✅ Implemented |
| | Trade/Communication Network | ✅ Implemented |
| | Perspective-Switching Chronicler | ✅ Implemented |
| | Crisis Cascade Detection | ✅ Implemented |
| **Backend Infrastructure** | 39+ tRPC Procedures | ✅ Implemented |
| | Real-time WebSocket Updates | ✅ Implemented |
| | Simulation Control Panel | ✅ Implemented |
| | Event Persistence & Snapshots | ✅ Implemented |
| | Collaborative Sharing System | ✅ Implemented |
| **Frontend Components** | 15+ Major UI Components | ✅ Implemented |
| | Mobile-Optimized Responsive Design | ✅ Implemented (15+ configurations tested) |
| | Narrative Export System | ✅ Implemented (PDF, Markdown, JSON) |
| | Trade Network Visualization | ✅ Implemented |
| | Perspective Viewer | ✅ Implemented |
| | Crisis Cascade Visualizer | ✅ Implemented |
| **Architecture** | Probabilistic Consequence Engine | 🔄 In Progress |
| | Event-Driven Generation System | 🔄 In Progress |
| | LLM Post-Generation Narrative | 🔄 Planned |

### Architecture

#### The Causal Backbone (Foundation)

The core innovation is treating history as a **system** rather than a sequence. Events don't exist in isolation—they emerge from civilization state and cascade through time:

**Event Generation Philosophy**: Events are generated first based on civilization state probabilities, then the LLM is called to flesh out narratives explaining why those events occurred. This ensures stories emerge from consequences, not pre-determined narrative constraints.

| Component | Purpose | Status |
|-----------|---------|--------|
| **Causal Graph Engine** | Event nodes + causal relationships with significance scoring | ✅ Implemented |
| **Probabilistic Consequence Engine** | Calculates event consequences from civilization state | 🔄 In Progress |
| **Trade/Communication Network** | Resources and ideas flow between civilizations with distance-based delay | ✅ Implemented |
| **Crisis Cascade Detection** | Identifies chains of failures and ripple effects | ✅ Implemented |
| **Perspective-Switching Chronicler** | Generates multi-perspective narratives with contradiction detection | ✅ Implemented |

#### Narrative Engine

The narrative system generates authentic, causally-consistent histories:

| Layer | Purpose | Status |
|-------|---------|--------|
| **Event-Driven Generation** | Events determined by probability, not pre-planned narratives | 🔄 In Progress |
| **LLM Narrative Fleshing** | Rich narrative creation explaining why events occurred | ✅ Implemented |
| **Multi-Perspective Narratives** | Same event from victor, loser, neutral, archaeologist, alien viewpoints | ✅ Implemented |
| **Contradiction Detection** | Identifies hidden truths through narrative conflicts | ✅ Implemented |
| **Named Entity Generation** | Organic emergence of notable figures | ✅ Implemented |
| **Genealogy Tracking** | Family lineages with trait inheritance | ✅ Implemented |

### Core Components

**Causal Graph Engine** (`server/engines/causalGraphEngine.ts`)
- Event node tracking with significance scoring
- Causal relationship mapping with bidirectional tracking
- Ripple effect propagation across civilizations
- Crisis cascade detection and analysis
- Narrative event prioritization

**Probabilistic Consequence Engine** (`server/engines/probabilisticConsequenceEngine.ts`)
- State-based probability calculation for 10 consequence types
- Weighted random selection for emergent event generation
- Civilization traits and resource factors in probability calculation
- Foundation for true event-driven history generation

**Trade Network Engine** (`server/engines/tradeNetworkEngine.ts`)
- Trade route creation and management between civilizations
- Distance-based delay calculation for trade propagation
- Trade impact propagation through connected networks
- Resource and idea flow simulation

**Chronicler Module** (`server/engines/chroniclerModule.ts`)
- Multi-perspective narrative generation (5 viewpoints)
- Contradiction detection between narratives
- Bias and tone calculation for each perspective
- Hidden truth revelation system

**Database Schema** (`drizzle/schema.ts`)
- Galaxies and species definitions
- Events with causal metadata
- Notable figures with genealogies
- Achievements and their impacts
- Trade networks and communication paths
- Simulation snapshots and archives
- Shared simulations and narratives

**UI Components**
- `Launcher.tsx` - One-click galaxy generation interface
- `GalaxyExplorer.tsx` - Integrated view with Chronicle, Trade, Perspectives, Cascades tabs
- `GalaxyExplorerMobile.tsx` - Mobile-optimized explorer
- `PerspectiveViewer.tsx` - Multi-perspective narrative comparison
- `TradeNetworkMap.tsx` - Animated trade network visualization
- `CrisisCascadeVisualizer.tsx` - Cascade flow and impact visualization
- `SimulationControlPanel.tsx` - Playback and parameter controls
- `NarrativeExporter.tsx` - Export to PDF, Markdown, JSON
- `GenealogyTreeVisualizer.tsx` - Interactive family lineages
- `EventTimelineWithFigures.tsx` - Chronological event browser
- `FigureSearchPanel.tsx` - Searchable figure encyclopedia

## Development Roadmap

### Phase 1: Data Persistence & Reliability (Weeks 1-3)

**Objectives**: Ensure all generated data persists correctly and systems are reliable at scale.

- Database optimization and query performance tuning
- Event storage validation and integrity checks
- Snapshot management and recovery systems
- Data backup and disaster recovery procedures
- Load testing and performance profiling

**Success Criteria**: All events persist correctly, database queries complete in <100ms, system handles 10,000+ events without degradation.

### Phase 2: Frontend Integration (Weeks 4-6)

**Objectives**: Complete frontend features for accessing all backend systems.

- Save/load simulation UI
- Simulation dashboard with progress indicators
- Error handling and user feedback
- Export enhancement and batch operations
- Performance optimization for large datasets

**Success Criteria**: Users can save/load simulations, export narratives, and control simulations through UI with <2s response times.

### Phase 3: Collaborative Features (Weeks 7-9)

**Objectives**: Enable community interaction and discovery.

- Public simulation discovery interface
- Sharing and access control system
- Community interaction (likes, comments, ratings)
- User profiles and contribution tracking
- Moderation tools and content policies

**Success Criteria**: 50+ public simulations shared, community engagement metrics established, moderation tools effective.

### Phase 4: Performance Optimization (Weeks 10-11)

**Objectives**: Optimize for scale and responsiveness.

- Simulation engine profiling and optimization
- Database query optimization
- Frontend rendering optimization
- API response time reduction
- Memory usage optimization

**Success Criteria**: Simulations with 100+ civilizations complete in <5 minutes, UI renders in <16ms, API responses <100ms.

### Phase 5: Polish & Launch (Weeks 12-16)

**Objectives**: Prepare for public Alpha release.

- UI/UX refinement and polish
- Comprehensive documentation
- User onboarding flow
- QA testing and bug fixes
- CI/CD deployment setup
- Launch preparation and marketing

**Success Criteria**: Zero critical bugs, comprehensive documentation, smooth onboarding, successful public launch.

## Philosophy: Depth Over Breadth

The key insight from expert review: **depth of interconnection matters far more than breadth of content**. A galaxy with 3 deeply interconnected civilizations generating genuinely surprising historical narratives is infinitely more valuable than 100 isolated civilizations with shallow histories.

Each galaxy should demonstrate:

1. **Causal Consistency**: Events emerge from civilization state and probability, not random chance
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

### Multi-Perspective Narratives

Explore the same event from five different viewpoints:
- **Victor's Tale**: How the winner tells the story
- **Loser's Lament**: How the defeated remember it
- **Neutral Chronicle**: Objective historical record
- **Archaeologist's Analysis**: Academic interpretation
- **Alien Observer**: Completely external perspective

Contradictions between narratives reveal hidden truths and alternative interpretations.

### Trade Network Visualization

Watch resources and ideas flow between civilizations:
- Animated goods flowing along trade routes
- Network statistics and bottleneck analysis
- Trade impact on civilization development
- Distance-based communication delays

### Crisis Cascade Detection

Understand how one failure triggers chains of consequences:
- Financial panic → trade collapse → famine → migration → conflict
- Visualize cascade flows and impact metrics
- Identify critical failure points
- Explore alternate outcomes

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

- **Frontend**: React 19, Tailwind CSS 4, TypeScript, Wouter routing
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI**: LLM integration for narrative generation and voice transcription
- **Real-Time**: WebSocket infrastructure for live updates
- **Visualization**: SVG-based graphs, animated flows, interactive maps
- **Storage**: S3 for file storage and exports
- **Deployment**: Docker for continuous AI agent, Manus platform for hosting

## Documentation

- [QUICK_START.md](./QUICK_START.md) - User guide for exploring galaxies
- [ARCHITECTURE_IMPROVEMENTS.md](./ARCHITECTURE_IMPROVEMENTS.md) - Detailed technical roadmap
- [WORKFLOW.md](./WORKFLOW.md) - The Continuous Workshop workflow
- [ALPHA_STAGE_ROADMAP.md](./ALPHA_STAGE_ROADMAP.md) - 16-week roadmap to Alpha (70% feature completeness)
- [ALPHA_PROGRESSION_CRITERIA.md](./ALPHA_PROGRESSION_CRITERIA.md) - Detailed progression criteria and success metrics
- [NARRATIVE_ARCHITECTURE_AUDIT.md](./NARRATIVE_ARCHITECTURE_AUDIT.md) - Analysis of event-driven vs narrative-driven architecture
- [SYSTEM_HEALTH_CHECK.md](./SYSTEM_HEALTH_CHECK.md) - Comprehensive system integration verification
- [RESPONSIVE_TESTING_REPORT.md](./RESPONSIVE_TESTING_REPORT.md) - Mobile/tablet/desktop testing results
- [CRITIC_REVIEW_SUMMARY.md](./CRITIC_REVIEW_SUMMARY.md) - Summary of expert critic feedback and responses
- [todo.md](./todo.md) - Implementation tracking

## Contributing

The project welcomes contributions in several areas:

- **Event Generation**: Improve probability calculations and consequence logic
- **Narrative Design**: Enhance narrative generation prompts and multi-perspective quality
- **Causal Logic**: Improve interconnection detection and consequence propagation
- **UI/UX**: Enhance exploration interfaces and visualizations
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

**Repository**: https://github.com/SolamEteva/galaxy_history_simulator

**Last Updated**: April 24, 2026 | **Development Stage**: 30-40% Complete | **Target**: Alpha (70% Complete) in 16 weeks
