# Galaxy History Simulator - PRD

## Project Overview
A computational mythology engine that generates not just worlds, but histories that matter. Based on the "Physics of Consequence" philosophy where every event is causally connected to its predecessors and descendants.

**Original Vision**: Dwarf Fortress meets Herodotus meets the Mandelbrot set—emergent complexity arising from simple rules of causality.

**GitHub Repository**: https://github.com/SolamEteva/galaxy_history_simulator

---

## Architecture

### Tech Stack
- **Backend**: TypeScript, Node.js, tRPC, Express
- **Frontend**: React, TailwindCSS, Radix UI
- **Database**: MySQL with Drizzle ORM
- **State Management**: TanStack Query

### Core Engines (Existing)
1. **CausalGraphEngine** - Semantic causal edges (CAUSED, INFLUENCED, PREVENTED)
2. **NarrativeEngine** - LLM integration with harmonic resonance
3. **ChroniclerModule** - Multi-perspective narration with bias/reliability
4. **TradeNetworkEngine** - Inter-civilization trade routes

### New System (Implemented 2026-04-02)
1. **CrisisCascadeEngine** - Original "Physics of Consequence" proof-of-concept
   - Demonstrated causal chains work (12-event depth)
   - Populated `causalParents` arrays with real edges

2. **Valence-Agnostic Galaxy Simulator** - Full emergent system
   - `emergentPropagationEngine.ts` - Cultural profiles, border dynamics, momentum
   - `galaxySimulator.ts` - Main engine with valence-neutral physics
   - **Cultural Profiles**: resilience, openness, cohesion, optimism, isolationism, innovation, tradition
   - **Border Dynamics**: permeability, political shielding, invitation factor, cultural similarity
   - **Event Momentum**: cultural resonance, distance decay, viral coefficient, transformation probability
   - **Golden Ages AND Dark Ages** emerge naturally based on cultural terrain

3. **Interstellar Propagation Mechanics** - Cross-Gulf Physics (NEW)
   - `/app/galaxy_simulator/server/engines/interstellarPropagation.ts` (600+ lines)
   - 6 propagation mechanisms: Light-Cone, Quantum Entanglement, Dimensional Bleed, Stellar Carrier, Archaeological Time-Bomb, Gravity Well Network
   - Each mechanism has different: delay, fidelity, transformation bias
   - Cosmological Stances determine interpretation (omens vs communications vs art)
4. **Interstellar Propagation Visualizer** - UI Component (NEW)
   - `/app/galaxy_simulator/client/src/components/InterstellarVisualizer.tsx` (826 lines)
   - Animated galaxy map showing civilizations across dimensions
   - Visual propagation waves: Light-cone (slow ring), Quantum (instant flash), Gravity (fast pulse), Dimensional (ghostly)
   - Click civilization to see arrived events and Chronicler perspectives
   - Active wave progress bars showing all mechanisms simultaneously
   - Route: `/interstellar`

5. **Demo Links in Launcher**
   - Added "Physics of Consequence Demos" section to Launcher page
   - Links to `/crisis-demo` (Iron Bankruptcy) and `/interstellar` (Propagation visualizer)

---

## What's Been Implemented

### Session: 2026-04-02

#### 1. Deep Audit of Existing Codebase
- Cloned and analyzed the TypeScript/React codebase
- Identified gap: Beautiful architecture but systems not communicating
- Created `/app/galaxy_simulator/AUDIT_REPORT.md`

#### 2. Valence-Agnostic Galaxy Simulator (Major Architecture)
**Files Created:**
- `/app/galaxy_simulator/server/engines/emergentPropagationEngine.ts` (600+ lines)
  - Cultural profiles with 7 traits
  - 28 event types (positive, negative, neutral, transformative)
  - Propagation rules with cultural modifiers
  - Border crossing calculations
  - Momentum mechanics
  
- `/app/galaxy_simulator/server/engines/galaxySimulator.ts` (500+ lines)
  - Main simulation engine
  - Event propagation with valence transformation
  - Cultural terrain affects outcomes
  - Causal chain tracing

**Test Results (Valence Balance):**
- Resilient culture + resource_depletion → **55 positive events, 2 negative** (crisis → opportunity)
- Progressive culture + discovery → **18 positive events, 0 negative** (golden age cascade)
- Traditional culture + cultural_contact → **3 neutral events** (filtered through values)
- Isolationist culture + migration → **2 positive, 7 neutral** (managed integration)

**Key Achievement:** Same physics, different outcomes. Direction depends on cultural terrain, not script.

---

## User Personas

### Primary User: The World Builder
- Creative writers and game designers
- Want deep, interconnected histories
- Don't want "cookie-cutter" procedural generation

### Secondary User: The Observer
- Enjoys watching simulations unfold
- Interested in emergent storytelling
- Values "inevitable yet surprising" outcomes

---

## Core Requirements (Static)

### The Three Pillars
1. **Causal Density**: Every event traces back to causes
2. **Historical Memory**: Past events influence present decisions
3. **Necessity and Surprise**: Stories feel inevitable in retrospect

### Anti-Cookie-Cutter Philosophy
- Constraint Breeding: Species traits constrain behavior
- Mutation Engine: Slight variations compound over time
- Pattern Detection: Force divergence when too similar

---

## Prioritized Backlog

### P0 - Critical (Next Session)
1. [x] ~~Wire UI to demos~~ - Created visual interstellar propagation demo
2. [ ] Start the app and verify visual animations work
3. [ ] Add local Ollama Chronicler integration
4. [ ] Persist cascade events to database

### P1 - Important
1. [ ] Implement News System with distance-based delay and distortion
2. [ ] Add LLM narrative generation for cascade events
3. [ ] Implement Perspective Switching in ChroniclerModule
4. [ ] Create Crisis Cascade visualization with flowing graph

### P2 - Nice to Have
1. [ ] Constraint Breeding system
2. [ ] Mutation Engine for divergent evolution
3. [ ] Pattern detection and forced divergence
4. [ ] Multi-scale time (geological/historical/dramatic)

### P3 - Future
1. [ ] Multiple cascade templates (plague, religious schism, tech disruption)
2. [ ] mossbot integration for overnight cascade generation
3. [ ] Save/load simulation states
4. [ ] Alternative history branching

---

## Next Tasks

1. **Wire UI to tRPC routes** - Connect IronBankruptcyDemo to backend
2. **Test full end-to-end flow** - Verify UI → tRPC → Engine → Response
3. **Persist to database** - Store cascade events in MySQL
4. **Integrate with Timeline view** - Show cascade events in existing UI

---

## Notes

- The existing codebase is ~70% complete architecturally
- Key gap identified: Systems don't communicate during simulation
- CrisisCascadeEngine proves the "Physics of Consequence" works
- Randomness means some runs cascade further than others (by design)

---

*Last Updated: 2026-04-02*
