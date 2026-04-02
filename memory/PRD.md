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
1. **CrisisCascadeEngine** - The "Physics of Consequence" in action
   - `CrisisDetector` - Recognizes trigger conditions
   - `CascadePropagator` - Generates downstream events with delays
   - `CausalLinker` - Populates `causalParents` arrays with real edges
   - `DistanceDecay` - Delays effects based on trade route distance

---

## What's Been Implemented

### Session: 2026-04-02

#### 1. Deep Audit of Existing Codebase
- Cloned and analyzed the TypeScript/React codebase
- Identified gap: Beautiful architecture but systems not communicating
- Created `/app/galaxy_simulator/AUDIT_REPORT.md`

#### 2. Crisis Cascade Engine (Core Implementation)
**Files Created:**
- `/app/galaxy_simulator/server/engines/crisisCascadeEngine.ts` (984 lines)
- `/app/galaxy_simulator/server/routers/crisisCascade.ts` (tRPC router)
- `/app/galaxy_simulator/client/src/components/IronBankruptcyDemo.tsx` (UI)
- `/app/galaxy_simulator/client/src/pages/CrisisDemo.tsx` (Page route)

**The "Iron Bankruptcy" Cascade Chain:**
```
RESOURCE DEPLETION → ECONOMIC SHOCK → FOOD SHORTAGE → FAMINE → 
MIGRATION → REFUGEE CRISIS → XENOPHOBIA → BORDER TENSION → 
DIPLOMATIC INCIDENT → WAR DECLARATION → TRADE DISRUPTION → 
TECHNOLOGICAL REGRESSION
```

**Success Metrics Achieved:**
- ✅ 12-event causal chain depth
- ✅ 15/15 child events have populated `causalParents`
- ✅ 3 civilizations affected by ripple effects
- ✅ 12 unique event types generated
- ✅ Butterfly Effect Tracer can explain any event back to root cause

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
1. [ ] Wire Play/Pause UI buttons to actual simulation loop
2. [ ] Persist cascade events to database
3. [ ] Connect CrisisCascadeEngine to existing UI timeline view

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
