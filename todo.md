# Galaxy History Simulator - TODO

## Core Simulation Engine (Dwarf Fortress Style Pre-Computation)
- [x] Design and implement core simulation data models (Galaxy, Species, Planet, Event, Civilization)
- [x] Implement species generation system (up to 8 species with unique traits, homeworlds)
- [x] Implement planet/star system generation with habitability and resources
- [x] Create timeline and year-based event tracking system (thousands of years)
- [x] Implement cause-effect relationship tracking for events (multi-generational consequences)
- [x] Design species lifecycle tracking (origin → sentience → civilization → spaceflight → extinction/transcendence)
- [x] Implement civilization rise and fall mechanics with interconnected causes

## LLM-Based History Pre-Computation
- [x] Integrate open-source LLM for batch history generation
- [x] Create era-based event generation (stone age, bronze age, industrial, space age, etc.)
- [x] Implement structured event response parsing (JSON schema with cause-effect)
- [x] Create deep interconnection logic (wars cause migrations, migrations enable new civilizations, etc.)
- [x] Implement species-specific event generation based on traits, development, and history
- [x] Create "legend seed" generation (major turning points that cascade through history)
- [x] Implement multi-species interaction events (first contact, trade, war, alliance)

## Batch History Generation
- [x] Implement full galaxy history pre-computation in single pass
- [x] Create event generation pipeline (era by era, tracking all consequences)
- [x] Implement event interconnection validation (ensure cause precedes effect)
- [x] Create species evolution tracking (from origin to extinction/transcendence)
- [x] Build civilization lifecycle management
- [x] Implement technological progression tracking

## Frontend UI (Legends Viewer)
- [x] Design and build landing page with galaxy generation controls
- [x] Create galaxy generation form (species count, simulation length, seed)
- [ ] Build generation progress indicator (showing pre-computation status)
- [x] Create legends chronicle viewer (chronological history display)
- [x] Build interactive timeline visualization (all events, filterable by species/type)
- [x] Implement species encyclopedia/database viewer (evolution, achievements, extinctions)
- [ ] Create civilization tracker (rise, peak, fall of each civilization)
- [ ] Build event interconnection visualizer (cause-effect chains)
- [ ] Implement search and filter across entire history
- [x] Create detailed event viewer with context and consequences

## Image Generation
- [x] Integrate image generation for key historical events
- [x] Create prompts for hand-drawn aesthetic images (species-specific art styles)
- [x] Implement image caching and storage
- [x] Create event-to-image mapping system
- [ ] Build image gallery for major events

## History Document Generation
- [x] Create formatted document generator (Markdown/HTML/PDF)
- [x] Implement chronological history compilation
- [x] Build species encyclopedia section
- [x] Create event interconnection visualization in document
- [x] Implement document export functionality (HTML export)
- [x] Create tRPC export router with progress tracking endpoints
- [x] Integrate LegendsExportButton into GalaxyDetail page
- [x] Create GenerationProgress UI component

## Database Schema
- [x] Design and implement Galaxy table
- [x] Design and implement Species table
- [x] Design and implement Planet table
- [x] Design and implement Event table
- [x] Design and implement Civilization table
- [x] Design and implement EventConnection table (for cause-effect relationships)
- [x] Design and implement HistoryDocument table

## Unit Testing (Current Priority)
- [x] Write tests for error handling framework (validation, retry, timeout)
- [x] Write tests for narrative event generator error scenarios
- [x] Write tests for legends export functionality
- [x] Write tests for progress tracking system
- [x] Run all tests and ensure they pass (33/33 error handling tests passed)
- [ ] Add integration tests for end-to-end galaxy generation

## Testing & Refinement
- [ ] Test simulation engine with sample parameters
- [ ] Test LLM integration and event generation quality
- [ ] Test image generation for various event types
- [ ] Test document generation and formatting
- [ ] Refine event generation prompts based on output quality
- [ ] Performance optimization for large simulations

## UI Components for Genealogy, Search & Timeline (NEW)
- [x] Build GenealogyTreeVisualizer component with interactive family lineages
- [x] Implement trait inheritance visualization in genealogy tree
- [x] Add succession chain display showing leadership transitions
- [x] Create FigureSearchPanel component with multi-filter support
- [x] Implement archetype filtering for figure search
- [x] Add civilization and time period filters to search
- [x] Build achievement type filtering
- [x] Create EventTimelineWithFigures component
- [x] Add figure attribution to event display
- [x] Show influence metrics on timeline
- [x] Display achievement compound effects over time
- [x] Create figure-event relationship visualization
- [x] Add interactive tooltips showing figure details on hover
- [ ] Implement figure profile modal from timeline clicks
- [ ] Add genealogy tree modal from timeline figure references

## AI Agent System - Cosmic Forge (RENAMING COMPLETE)
- [x] Rename Mossbot to Cosmic Forge in agent system files
- [x] Update database schema and table names
- [x] Update UI components and pages
- [x] Update documentation and comments
- [x] Verify all changes compile without errors
- [x] Test all Cosmic Forge functionality

## Advanced Cosmic Forge Features (RENAMING COMPLETE)
- [x] Rename GitHub Actions integration module references
- [x] Update webhook handlers for Cosmic Forge
- [x] Update task creation from GitHub issues/PRs
- [x] Rename WebSocket server references
- [x] Update AgentDashboard WebSocket client references
- [x] Update real-time task status streaming
- [x] Rename TaskQueueManager component references
- [x] Update task reordering persistence
- [x] Verify estimated completion time calculations
- [x] Verify task priority visualization
- [x] Test all Cosmic Forge features
- [x] Test end-to-end Cosmic Forge workflows

## Deployment & Documentation
- [ ] Create user guide for simulation parameters
- [ ] Document API endpoints and data structures
- [ ] Create sample galaxy history output
- [ ] Deploy to production


## Error Handling & Usability Enhancements (COMPLETE)
- [x] Audit codebase for error handling gaps
- [x] Implement comprehensive error handling layer (errorHandler.ts)
- [x] Add input validation and constraint checking (validator.ts)
- [x] Enhance logging and observability (logger.ts)
- [x] Improve user feedback and error messages (AppError with user messages)
- [x] Add recovery mechanisms and graceful degradation (retry, timeout, safe execution)
- [x] Test all error scenarios and edge cases (errorHandling.test.ts)
- [x] Create error handling middleware (errorMiddleware.ts)


## Critic Feedback Implementation (PRIORITY)

### Phase 1: Causal Backbone Foundation
- [ ] Implement event graph database (replace simple logging with graph structure)
- [ ] Add event significance scoring system
- [ ] Create "Butterfly Effect" tracer for causal chain analysis
- [ ] Implement bidirectional causality tracking (caused_by, enabled_by, prevented_by)

### Phase 2: Interconnection Protocols
- [ ] Build Trade/Communication Network between civilizations
- [ ] Implement "News System" with distance-based delay and distortion
- [ ] Create Crisis Cascade scenarios (financial panic → trade collapse → famine → migration)
- [ ] Add ripple propagation (nearby civilizations affected immediately, distant ones after delay)

### Phase 3: Narrative Depth Enhancement
- [ ] Develop "Chronicler" module for biased historical narratives
- [ ] Implement perspective switching (victor, loser, neutral, archaeologist, alien observer)
- [ ] Create "Mystery Generator" (gaps in record, contradictory sources)
- [ ] Add character-level agency for historical figures

### Phase 4: Anti-Repetition Arsenal
- [ ] Implement Mutation Engine (slight variations that compound over time)
- [ ] Create Constraint Solver (force divergence when patterns too similar)
- [ ] Add Surprise Injector (random but plausible external events)

### One-Click Launcher
- [ ] Create standalone launcher application for easy simulation access
- [ ] Add preset galaxy configurations for quick start
- [ ] Implement progress tracking and save/load functionality
- [ ] Build beautiful UI for non-technical users

### GitHub Repository Updates
- [ ] Update README with critic's feedback and roadmap
- [ ] Add ARCHITECTURE_IMPROVEMENTS.md documenting causal backbone
- [ ] Create QUICK_START.md for launcher
- [ ] Add WORKFLOW.md explaining the Continuous Workshop approach
- [ ] Update contributing guidelines with new implementation phases


## Phase 2: Trade/Communication Network Implementation
- [x] Create TradeNetworkEngine for resource flow between civilizations
- [x] Implement distance-based delay calculation for trade routes
- [x] Add trade route creation and management
- [x] Create trade impact propagation system
- [ ] Add trade network visualization component
- [ ] Write tests for trade network mechanics

## Phase 3: Perspective-Switching Chronicler
- [x] Create ChroniclerModule for multi-perspective narratives
- [x] Implement perspective types (victor, loser, neutral, archaeologist, alien)
- [x] Add narrative generation for each perspective
- [x] Create contradiction detection system
- [ ] Build perspective viewer UI component
- [ ] Add perspective comparison visualization

## Phase 4: Crisis Cascade Detection and UI
- [x] Enhance CausalGraphEngine to detect cascades
- [x] Create CrisisCascadeVisualizer component
- [x] Build cascade visualization (flow diagram, timeline, impact views)
- [x] Add cascade timeline view
- [x] Create cascade impact metrics
- [x] Build cascade explorer UI
- [ ] Write cascade detection tests

## Phase 5: Integration and Testing
- [x] Create SystemIntegrationManager to connect all three systems
- [x] Implement event processing through all systems
- [ ] End-to-end testing of interconnected features
- [ ] Performance optimization
- [ ] UI polish and refinement
- [ ] Documentation updates


## Phase 6: Frontend Integration - tRPC Procedures
- [x] Create tRPC router for SystemIntegrationManager
- [x] Add procedures for querying events and cascades
- [x] Add procedures for retrieving narratives
- [x] Add procedures for network statistics
- [x] Add procedures for causal graph data
- [ ] Write tests for tRPC procedures

## Phase 7: Perspective Viewer UI Component
- [x] Create PerspectiveViewer component
- [x] Implement narrative comparison display
- [x] Add contradiction highlighting
- [x] Build perspective selector tabs
- [x] Add tone and bias indicators
- [x] Create hidden truth revelation section

## Phase 8: Trade Network Visualization
- [x] Create TradeNetworkMap component
- [x] Implement civilization nodes visualization
- [x] Add trade route rendering
- [x] Create animated good/idea flow
- [x] Add network statistics overlay
- [x] Implement interactive route details

## Phase 9: Integration into Galaxy Detail View
- [x] Add tabs for different views (Chronicle, Trade Network, Perspectives)
- [x] Integrate all three new components
- [x] Add loading states and error handling
- [x] Implement data fetching from tRPC
- [ ] Add real-time updates
- [ ] Polish UI and interactions


## Phase 10: WebSocket Real-Time Updates
- [x] Create WebSocket server infrastructure
- [x] Implement event stream broadcasting
- [x] Add cascade detection real-time notifications
- [x] Create client-side WebSocket hooks
- [x] Implement automatic reconnection logic
- [x] Add real-time UI updates for events and cascades

## Phase 11: Simulation Control Panel
- [x] Create SimulationController component
- [x] Implement pause/resume/stop controls
- [x] Add simulation speed controls
- [x] Create event injection interface
- [x] Build civilization parameter editor
- [ ] Add simulation state persistence

## Phase 12: Narrative Export System
- [x] Create NarrativeExporter utility
- [x] Implement PDF export with formatting
- [x] Add Markdown export functionality
- [x] Create contradiction analysis export
- [x] Build multi-perspective document generation
- [ ] Add export scheduling and batch operations
