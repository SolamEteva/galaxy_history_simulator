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

## AI Agent System (NEW - COMPLETE)
- [x] Design Mossbot integration architecture
- [x] Implement agent system core (MossbotAgentSystem class)
- [x] Create agent tRPC router with 10 procedures
- [x] Build AgentLauncher component with login and controls
- [x] Implement feature development workflow
- [x] Implement bug fix workflow
- [x] Implement documentation workflow
- [x] Create AgentDashboard with real-time monitoring
- [x] Add task metrics visualization
- [x] Add system performance monitoring
- [x] Add task history display
- [x] Integrate agent router into main tRPC router

## Deployment & Documentation
- [ ] Create user guide for simulation parameters
- [ ] Document API endpoints and data structures
- [ ] Create sample galaxy history output
- [ ] Deploy to production
