# Galaxy History Simulator - System Health Check

## Project Architecture Overview

### Frontend Stack
- **Framework**: React 19 + Tailwind CSS 4
- **State Management**: tRPC + React Query
- **Real-Time**: WebSocket with automatic reconnection
- **Components**: 15+ integrated UI components

### Backend Stack
- **Server**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **Real-Time**: WebSocket server with event broadcasting

### Simulation Engines
- **CausalGraphEngine**: Event causality and significance tracking
- **TradeNetworkEngine**: Resource and idea propagation
- **ChroniclerModule**: Multi-perspective narrative generation
- **SystemIntegrationManager**: Unified event processing
- **NarrativeExporter**: Multi-format export (Markdown, PDF, JSON)

---

## Communication Flow Analysis

### 1. Frontend → Backend (tRPC Procedures)

#### Simulation Data Access
- ✅ `trpc.simulation.getEvents` - Fetch event timeline
- ✅ `trpc.simulation.getCascades` - Fetch crisis cascades
- ✅ `trpc.simulation.getCausalGraph` - Fetch causal relationships
- ✅ `trpc.simulation.getTradeNetwork` - Fetch trade routes and flows
- ✅ `trpc.simulation.getSummaryStats` - Fetch aggregated statistics
- ✅ `trpc.simulation.getEventDetail` - Fetch single event with narratives
- ✅ `trpc.simulation.searchEvents` - Search events by type/actor/time
- ✅ `trpc.simulation.getCausalChain` - Traverse causal ancestors/descendants
- ✅ `trpc.simulation.getNarratives` - Fetch multi-perspective narratives
- ✅ `trpc.simulation.getContradictions` - Fetch narrative contradictions

**Status**: All procedures defined and exported in `server/routers/simulation.ts`

#### Authentication
- ✅ `trpc.auth.me` - Get current user
- ✅ `trpc.auth.logout` - Logout user

**Status**: Built-in, working

### 2. Backend → Frontend (WebSocket Real-Time)

#### Event Streaming
- ✅ `SimulationEventBus.emitEvent()` - Broadcast new events
- ✅ `WebSocketServerManager.broadcastEvent()` - Send to all clients
- ✅ `useSimulationWebSocket` hook receives and processes events

**Status**: Infrastructure complete, needs simulation engine integration

#### Cascade Detection
- ✅ `SimulationEventBus.emitCascade()` - Broadcast cascades
- ✅ `WebSocketServerManager.broadcastCascade()` - Send to all clients
- ✅ `useSimulationWebSocket` hook receives cascades

**Status**: Infrastructure complete, needs cascade detection integration

#### Trade Network Updates
- ✅ `SimulationEventBus.emitTradeNetworkUpdate()` - Broadcast trade changes
- ✅ `WebSocketServerManager.broadcastTradeNetworkUpdate()` - Send to clients
- ✅ `useSimulationWebSocket` hook receives updates

**Status**: Infrastructure complete, needs trade engine integration

#### Simulation State Changes
- ✅ `SimulationEventBus.emitSimulationStateChange()` - Broadcast state
- ✅ `WebSocketServerManager.broadcastSimulationStateChange()` - Send to clients
- ✅ `useSimulationWebSocket` hook receives state updates

**Status**: Infrastructure complete, needs simulation control integration

### 3. Simulation Engines → Event Bus

#### CausalGraphEngine
- ✅ Engine created with significance scoring
- ⚠️ **Not yet integrated** with event emission
- **Action needed**: Wire engine to emit events through SimulationEventBus

#### TradeNetworkEngine
- ✅ Engine created with route management
- ⚠️ **Not yet integrated** with event emission
- **Action needed**: Wire engine to emit trade network updates

#### ChroniclerModule
- ✅ Module created with narrative generation
- ⚠️ **Not yet integrated** with event processing
- **Action needed**: Hook module into event processing pipeline

#### SystemIntegrationManager
- ✅ Integration layer created
- ⚠️ **Not yet integrated** with actual simulation
- **Action needed**: Connect to simulation lifecycle

### 4. Database ↔ Backend

#### Schema
- ✅ Drizzle schema defined in `drizzle/schema.ts`
- ✅ Tables: galaxies, civilizations, events, cascades, tradeRoutes, narratives
- **Status**: Ready for data persistence

#### Query Helpers
- ✅ `server/db.ts` contains helper functions
- ⚠️ **Helpers not yet called** from tRPC procedures
- **Action needed**: Wire database queries into tRPC procedures

### 5. UI Component Communication

#### GalaxyExplorer
- ✅ Imports all sub-components
- ✅ Manages WebSocket connection
- ✅ Fetches data via tRPC
- ✅ Displays real-time connection status
- **Status**: Ready for data flow

#### SimulationControlPanel
- ✅ Component created with full UI
- ⚠️ **Callbacks not wired** to backend
- **Action needed**: Connect play/pause/stop to tRPC procedures

#### NarrativeExporter
- ✅ Component created with export UI
- ⚠️ **Export not wired** to backend
- **Action needed**: Connect export to NarrativeExporter utility

#### PerspectiveViewer
- ✅ Component created
- ⚠️ **Not receiving data** from procedures
- **Action needed**: Fetch narrative data from tRPC

#### TradeNetworkMap
- ✅ Component created
- ⚠️ **Not receiving data** from procedures
- **Action needed**: Fetch trade network from tRPC

#### CrisisCascadeVisualizer
- ✅ Component created
- ⚠️ **Not receiving data** from procedures
- **Action needed**: Fetch cascade data from tRPC

---

## Critical Integration Points

### Missing Connections (High Priority)

1. **Simulation Control → Backend**
   - Play/Pause/Stop buttons need tRPC procedures
   - Speed adjustment needs backend handling
   - Event injection needs simulation engine integration

2. **Simulation Engines → Event Bus**
   - CausalGraphEngine needs to emit events
   - TradeNetworkEngine needs to emit updates
   - ChroniclerModule needs to process events
   - SystemIntegrationManager needs to orchestrate

3. **Database → tRPC Procedures**
   - Query helpers need to be called
   - Results need to be returned to frontend
   - Real-time updates need to be persisted

4. **Export → Backend**
   - Export UI needs to call NarrativeExporter
   - Generated documents need to be served
   - Files need to be stored/downloaded

### Data Flow Verification

```
Frontend (React)
    ↓
tRPC Client
    ↓
tRPC Router (server/routers/simulation.ts)
    ↓
Database Queries (server/db.ts)
    ↓
Database (MySQL/TiDB)
    ↓
[Back up the chain with data]

WebSocket Connection (Real-Time)
    ↓
Simulation Engines
    ↓
SimulationEventBus
    ↓
WebSocketServerManager
    ↓
Connected Clients
    ↓
useSimulationWebSocket Hook
    ↓
Component State Updates
```

---

## Component Status Summary

| Component | Status | Integration | Notes |
|-----------|--------|-------------|-------|
| CausalGraphEngine | ✅ Complete | ⚠️ Pending | Needs event emission |
| TradeNetworkEngine | ✅ Complete | ⚠️ Pending | Needs event emission |
| ChroniclerModule | ✅ Complete | ⚠️ Pending | Needs event processing |
| SystemIntegrationManager | ✅ Complete | ⚠️ Pending | Needs lifecycle hooks |
| WebSocket Infrastructure | ✅ Complete | ✅ Ready | Fully functional |
| tRPC Procedures | ✅ Complete | ⚠️ Pending | Need database wiring |
| GalaxyExplorer | ✅ Complete | ✅ Ready | Can display data |
| SimulationControlPanel | ✅ Complete | ⚠️ Pending | Needs backend wiring |
| NarrativeExporter | ✅ Complete | ⚠️ Pending | Needs export wiring |
| PerspectiveViewer | ✅ Complete | ⚠️ Pending | Needs data source |
| TradeNetworkMap | ✅ Complete | ⚠️ Pending | Needs data source |
| CrisisCascadeVisualizer | ✅ Complete | ⚠️ Pending | Needs data source |

---

## Recommended Integration Order

1. **Phase 1: Wire tRPC to Database** (Highest Priority)
   - Connect database queries to tRPC procedures
   - Test data retrieval through API

2. **Phase 2: Simulation Control Backend** (High Priority)
   - Create simulation lifecycle management
   - Wire control panel to backend procedures
   - Implement play/pause/stop/speed

3. **Phase 3: Event Persistence** (High Priority)
   - Store events in database
   - Implement simulation snapshots
   - Add state recovery

4. **Phase 4: Collaborative Sharing** (Medium Priority)
   - Create sharing system
   - Implement access controls
   - Build sharing UI

---

## Next Actions

1. ✅ Verify all TypeScript compilation (0 errors)
2. ✅ Verify WebSocket infrastructure
3. ⏳ Wire simulation engines to event bus
4. ⏳ Connect tRPC procedures to database
5. ⏳ Implement simulation control backend
6. ⏳ Add event persistence
7. ⏳ Build collaborative sharing

---

**Generated**: 2026-03-19
**Status**: Ready for integration phase
