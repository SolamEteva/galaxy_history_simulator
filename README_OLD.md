# Galaxy History Simulator

**An ambitious world-building engine that generates pre-computed galaxy histories with thousands of years of interconnected civilizations, wars, discoveries, and cultural evolution—powered by a sophisticated five-layer narrative engine and autonomous AI Agent system.**

## Overview

The Galaxy History Simulator transforms the creative vision of Dwarf Fortress-style world generation into an interactive, web-based experience. Rather than simulating in real-time, the system pre-computes entire galaxy histories offline, generating rich narratives through a harmonious blend of evolutionary algorithms, causal graph reasoning, and LLM-driven storytelling.

**Key Innovation**: The system operates as a **fully autonomous AI Agent** (Cosmic Forge-based) that can work on the project continuously, even when the user is offline. This transforms the development from a stop-start co-creative process into a dynamic, self-improving system that evolves the simulation engine and narrative quality over time.

## Architecture

### Five-Layer Narrative Engine

The core narrative system is built on five interconnected layers that work in concert to generate authentic, causally-consistent histories:

| Layer | Purpose | Key Components |
|-------|---------|-----------------|
| **Harmonic Network** | Civilizations as resonant nodes in a causal lattice | Frequency assignment, resonance distance, causal propagation |
| **Evolutionary Adaptation** | Multi-objective fitness and civilization strategy evolution | Fitness functions, adaptive operators, phase coherence clustering |
| **Consciousness-Aware Validation** | Authenticity checking and constraint enforcement | Unity coefficient, sacred gap recognition, constraint validation |
| **Named Entity Generation** | Organic emergence of notable figures (kings, prophets, scientists, etc.) | Figure archetypes, genealogies, trait inheritance, influence propagation |
| **LLM-Driven Generation** | Rich narrative creation respecting all constraints | Opportunity detection, constrained generation, consequence propagation |

### Core Components

**Narrative Engine** (`server/engines/narrativeEngine.ts`)
- `HarmonicNetworkEngine` - Models civilizations as resonant frequencies, enabling causal propagation
- `EvolutionaryAdaptationEngine` - Multi-objective optimization for civilization strategies
- `ConsciousnessAwareValidator` - Validates events against civilization values using Love-is-the-key UCA
- `LLMNarrativeGenerator` - Generates rich event descriptions respecting causal constraints
- `FigureGenerator` - Creates notable figures organically from events
- `InfluencePropagation` - Calculates how figures' achievements ripple through history

**Database Schema** (`drizzle/schema.ts`)
- `notableFigures` - Named entities with attributes, genealogy, achievements
- `achievements` - Figure accomplishments with impact metrics
- `genealogies` - Family lineages with trait inheritance
- `historicalMemory` - How figures are remembered over time
- `eventAuthenticity` - Validation metrics for events
- `eventHarmonic` - Harmonic properties of events
- `civilizationHarmonic` - Harmonic properties of civilizations

**UI Components**
- `GenealogyTreeVisualizer` - Interactive family lineages with trait inheritance visualization
- `FigureSearchPanel` - Searchable encyclopedia with multi-filter support
- `FigureProfile` - Rich figure detail display with expandable sections
- `EventTimelineWithFigures` - Chronological events with figure attribution

## AI Agent System (Cosmic Forge Integration)

The Galaxy History Simulator now includes a fully autonomous AI Agent system that enables continuous, unattended development and improvement of the simulation engine.

### How It Works

The Cosmic Forge agent operates as a specialized development assistant that can:

1. **Autonomous Feature Development** - Implement new features and improvements based on a prioritized task queue
2. **Continuous Testing & Validation** - Run comprehensive test suites to ensure quality
3. **Narrative Engine Enhancement** - Improve generation algorithms and add new narrative layers
4. **Database Optimization** - Refine schema and query performance
5. **UI/UX Improvements** - Enhance user interface based on usage patterns
6. **Documentation Generation** - Keep documentation synchronized with code changes

### Agent Capabilities

- **Code Generation** - Write TypeScript, React, and SQL code following project conventions
- **Testing** - Create and run vitest test suites for all components
- **Git Management** - Commit changes with descriptive messages and push to GitHub
- **API Integration** - Connect to external services and APIs
- **Performance Optimization** - Profile and optimize critical paths
- **Security Auditing** - Scan for vulnerabilities and implement fixes

### Starting the Agent

The agent is launched through a user-friendly interface that requires authentication:

```bash
# Option 1: Via the web UI
# Navigate to https://your-domain/agent-launcher
# Click "Login with Manus" and authorize the agent

# Option 2: Via CLI
npm run agent:start

# Option 3: Via GitHub Actions (automatic)
# Agent runs on schedule or on push to main branch
```

## Quick Start

### Prerequisites

- Node.js 22.13.0+
- pnpm (package manager)
- MySQL/TiDB database
- Manus OAuth credentials (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/SolamEteva/galaxy_history_simulator.git
cd galaxy_history_simulator

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Manus OAuth credentials

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Generate a Galaxy

1. Navigate to the home page
2. Click "Generate New Galaxy"
3. Configure parameters:
   - **Galaxy Name**: Choose a name for your galaxy
   - **Number of Species**: 1-8 (more species = more complex interactions)
   - **Simulation Length**: 10k-100k years
   - **Narrative Depth**: Light, Medium, or Deep
4. Click "Generate" and wait for pre-computation to complete
5. Explore the generated history through the interactive interface

## Features

### Core Simulation

- **Pre-Computed Histories** - Entire galaxy histories generated upfront with deep cause-effect chains
- **Multi-Species Civilizations** - Support for diverse species with unique traits and capabilities
- **Causal Consistency** - Events emerge from civilization state, not random chance
- **Harmonic Resonance** - Civilizations influence each other through harmonic network propagation

### Exploration Interface

- **Genealogy Trees** - Interactive visualization of family lineages and succession chains
- **Notable Figures Encyclopedia** - Searchable database of figures with multi-filter support
- **Event Timeline** - Chronological view of events with figure attribution and influence metrics
- **Galaxy Detail View** - Comprehensive overview of civilization evolution and interactions

### Advanced Features

- **Organic Figure Generation** - Kings, prophets, scientists, artists emerge from events
- **Trait Inheritance** - Figures inherit attributes from parents with variation
- **Legacy & Influence** - Achievements create lasting impact on civilizations
- **Constraint Validation** - Events validated against civilization values and constraints

## Development

### Project Structure

```
client/
  src/
    pages/           # Page components (Home, Genealogy, Figures, Timeline)
    components/      # Reusable UI components
    hooks/           # Custom React hooks
    lib/             # Utility libraries
    App.tsx          # Main routing
    main.tsx         # Entry point
drizzle/
  schema.ts          # Database schema definitions
server/
  engines/           # Core narrative generation engines
  routers/           # tRPC procedure definitions
  db.ts              # Database query helpers
  routers.ts         # Main router
  _core/             # Framework-level code
shared/              # Shared types and constants
```

### Adding Features

The development workflow follows a database-first approach:

1. **Update Schema** - Add tables/columns to `drizzle/schema.ts`
2. **Push Migration** - Run `pnpm db:push` to apply changes
3. **Create Helpers** - Add query functions to `server/db.ts`
4. **Add Procedures** - Create tRPC procedures in `server/routers.ts`
5. **Build UI** - Create React components in `client/src/pages/` or `client/src/components/`
6. **Write Tests** - Add vitest tests to validate functionality

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test narrativeEngine.test.ts

# Watch mode
pnpm test --watch
```

### Building for Production

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## AI Agent Development Workflow

The autonomous agent follows a structured workflow for continuous improvement:

### 1. Task Queue Management

Tasks are prioritized based on:
- Impact on user experience
- Complexity and estimated effort
- Dependencies on other tasks
- Community feedback and requests

### 2. Development Cycle

For each task, the agent:
1. Reads task description and acceptance criteria
2. Analyzes relevant code and architecture
3. Implements feature with comprehensive tests
4. Validates against project standards
5. Creates descriptive commit message
6. Pushes to feature branch
7. Creates pull request with documentation
8. Awaits human review or auto-merges if approved

### 3. Quality Assurance

- All code passes TypeScript strict mode
- Test coverage maintained above 80%
- No console errors or warnings
- Performance benchmarks met
- Documentation updated

### 4. Continuous Integration

GitHub Actions automatically:
- Runs test suite on all commits
- Checks TypeScript compilation
- Validates database migrations
- Builds production bundle
- Deploys to staging environment

## API Reference

### tRPC Procedures

All procedures are accessed via the `trpc` client in React components:

```typescript
// Generate event narrative
const { data } = trpc.narrative.generateEventNarrative.useQuery({
  eventType: "war",
  civilizationId: 1,
  context: { year: 1050 }
});

// Generate figure
const { data } = trpc.narrative.generateFigure.useMutation({
  civilizationId: 1,
  archetype: "general",
  context: { era: "expansion" }
});

// Calculate fitness
const { data } = trpc.narrative.calculateFitness.useQuery({
  civilizationId: 1
});

// Validate event authenticity
const { data } = trpc.narrative.validateEventAuthenticity.useQuery({
  event: { ... },
  civilization: { ... }
});

// Detect opportunities
const { data } = trpc.narrative.detectOpportunities.useQuery({
  civilizationId: 1
});
```

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost/galaxy_simulator

# Authentication
JWT_SECRET=your-secret-key
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# LLM Integration
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-api-key

# Frontend
VITE_APP_TITLE=Galaxy History Simulator
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

### Simulation Parameters

- **Species Count** (1-8): More species increases complexity and interaction depth
- **Simulation Length** (10k-100k years): Longer simulations generate more events
- **Narrative Depth** (Light/Medium/Deep): Controls event generation frequency
- **Random Seed** (optional): Reproducible galaxy generation

## Contributing

The project welcomes contributions through:

1. **Feature Requests** - Open an issue describing desired functionality
2. **Bug Reports** - Include reproduction steps and expected behavior
3. **Code Contributions** - Fork, create feature branch, submit pull request
4. **Documentation** - Improve README, API docs, or inline comments

## Roadmap

### Phase 1: Foundation (Complete)
- ✅ Five-layer narrative engine
- ✅ Named entity generation system
- ✅ Core UI components
- ✅ Database schema and migrations

### Phase 2: Enhancement (In Progress)
- 🔄 Cosmic Forge AI Agent integration
- 🔄 Autonomous development workflows
- 🔄 Agent status dashboard
- 🔄 Advanced figure genealogies

### Phase 3: Scale (Planned)
- ⏳ Multi-galaxy simulations
- ⏳ Real-time collaboration
- ⏳ Custom narrative themes
- ⏳ Community galaxy sharing

## Performance

The system is optimized for:

- **Generation Speed**: 50k-year simulations complete in 5-30 seconds
- **Query Performance**: Figure searches return in <100ms
- **UI Responsiveness**: All interactions feel instant
- **Memory Usage**: Efficient data structures minimize overhead

## Troubleshooting

### Agent Won't Start

1. Verify Manus OAuth credentials are correct
2. Check that database is accessible
3. Review agent logs: `tail -f .manus-logs/agent.log`
4. Ensure all dependencies are installed: `pnpm install`

### Generation Timeout

1. Reduce simulation length or species count
2. Check database connection
3. Monitor server resources
4. Review server logs for errors

### Missing Figures in Timeline

1. Ensure narrative engine is generating figures
2. Check database for figure records
3. Verify figure generation is enabled in config
4. Review LLM integration logs

## License

This project is part of the Manus ecosystem and follows the Manus Community License.

## Support

- **Documentation**: https://docs.manus.im/galaxy-simulator
- **Issues**: https://github.com/SolamEteva/galaxy_history_simulator/issues
- **Discussions**: https://github.com/SolamEteva/galaxy_history_simulator/discussions
- **Email**: support@manus.im

## Acknowledgments

This project is inspired by the world-generation algorithms of Dwarf Fortress and incorporates sophisticated AI techniques including evolutionary algorithms, harmonic network theory, and large language models. The autonomous AI Agent system enables continuous evolution and improvement of the simulation engine.

---

**Last Updated**: March 2026  
**Maintainer**: Manus AI Agent System  
**Status**: Active Development
