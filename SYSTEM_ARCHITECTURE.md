# Galaxy History Simulator - System Architecture

## Overview

The Galaxy History Simulator is a sophisticated pre-computation world generator inspired by Dwarf Fortress' world generation system. It creates thousands of years of interconnected alien history across multiple species, with realistic technological progression based on species physiology, environment, and culture.

## Core Systems

### 1. Cascade Engine (`cascadeEngine.ts`)

**Purpose**: Manages event consequences and ensures causal consistency throughout history.

**Key Features**:
- **Temporal Ordering**: Ensures causes always precede effects (no paradoxes)
- **Consequence Propagation**: Traces how events ripple through history with decay
- **Cycle Detection**: Identifies paradoxes and causal loops
- **Causal Validation**: Verifies the entire history maintains logical consistency
- **Impact Analysis**: Calculates how many downstream events are affected by each event

**How It Works**:
1. Events are added to a directed acyclic graph (DAG)
2. Connections between events represent causal relationships
3. When validating, the engine ensures no event's cause occurs after its effect
4. Consequence propagation spreads effects through the graph with diminishing strength

**Example**:
```
Event A (Year 1000): Discovery of Fire
  └─> Event B (Year 1500): Development of Metallurgy
      └─> Event C (Year 2000): Creation of Steel Tools
          └─> Event D (Year 2500): Industrial Revolution
```

---

### 2. Civilization State Machine (`civilizationStateMachine.ts`)

**Purpose**: Tracks the lifecycle of civilizations using XState state machines.

**States**:
- **Primitive**: Hunter-gatherer, no organized society
- **Tribal**: Small organized groups with shared culture
- **Agricultural**: Settlement-based, farming societies
- **Classical**: Organized states, philosophy, early science
- **Medieval**: Feudal structures, religious dominance
- **Industrial**: Mechanization, mass production
- **Modern**: Information age, advanced technology
- **Spacefaring**: Multi-planetary civilization
- **Transcendent**: Post-biological or godlike existence

**Transitions** are triggered by:
- Technological breakthroughs
- Cultural/philosophical shifts
- Population changes
- Resource availability
- Inter-species contact

**Context Tracking**:
- Population estimates
- Technology level (0-10)
- Military strength (0-10)
- Cultural influence (0-10)
- Dominant beliefs and philosophies

---

### 3. Belief System (`beliefSystem.ts`)

**Purpose**: Models ideological, religious, and philosophical spread through civilizations.

**Belief Categories**:
- **Religious**: Spiritual and divine beliefs
- **Philosophical**: Ethical and metaphysical frameworks
- **Political**: Governance and social organization
- **Scientific**: Understanding of natural world

**Key Features**:
- **Belief Synthesis**: New beliefs emerge from combinations of existing ones
- **Propagation**: Beliefs spread through populations with adoption curves
- **Conflict Detection**: Identifies incompatible belief systems
- **Decay**: Beliefs fade over time if not reinforced
- **Cultural Significance**: Tracks how central beliefs are to civilizations

**How It Works**:
1. Beliefs are nodes in a directed graph
2. Influence edges show how beliefs affect each other
3. Adoption spreads beliefs through populations using S-curves
4. Conflicts arise when incompatible beliefs meet
5. New beliefs emerge from synthesis of existing ones

---

### 4. Technology Adoption System (`technologyAdoption.ts`)

**Purpose**: Models realistic technology diffusion using the Bass Model.

**Technology Lifecycle**:
1. **Innovators** (2.5%): First to adopt, take risks
2. **Early Adopters** (13.5%): Influential, respected
3. **Early Majority** (34%): Deliberate, follow opinion leaders
4. **Late Majority** (34%): Skeptical, follow peers
5. **Laggards** (16%): Resistant, traditional

**Key Features**:
- **S-Curve Adoption**: Realistic diffusion patterns
- **Prerequisites**: Technologies that must exist before others
- **Dependencies**: Technologies that enable future innovations
- **Civilization Networks**: Technology spreads through trade and contact
- **Adoption Phases**: Tracks which populations have adopted which technologies

**Bass Model Parameters**:
- **p** (innovation coefficient): How quickly innovators adopt
- **q** (imitation coefficient): How quickly others follow
- **m** (market potential): Maximum adoption percentage

---

### 5. Species-Aware Technology Generator (`speciesAwareTechGenerator.ts`)

**Purpose**: Generates realistic, contextual technologies based on species characteristics.

**Technology Generation Driven By**:

#### Species Physiology
- **Base Form**: humanoid, insectoid, aquatic, crystalline, gaseous, silicon-based, hive
- **Primary Sense**: vision, echolocation, electromagnetic, chemical, thermal, psionic
- **Lifespan**: Affects long-term planning and technology adoption
- **Reproduction Rate**: Influences population dynamics and resource needs
- **Group Size**: Solitary vs. hive-mind affects technology focus

#### Environment
- **Gravity**: Low gravity enables different architecture and transportation
- **Temperature**: Extreme conditions require specialized materials and energy
- **Atmosphere**: Composition affects breathing, combustion, chemistry
- **Water**: Aquatic species develop hydrodynamic technologies
- **Radiation**: High radiation enables energy harvesting or requires shielding
- **Resources**: Available materials shape technology paths

#### Cultural Traits
- **Spiritual**: Develops divine-resonance technology, consciousness-expansion tools
- **Aggressive**: Focuses on weapons, resource extraction, territorial expansion
- **Peaceful**: Develops cooperation technology, sustainable systems
- **Innovative**: Experimental technologies, high-risk development
- **Conservative**: Proven technologies, incremental improvement
- **Hive-Mind**: Collective consciousness networks, synchronized systems

### Technology Eras

Each species develops through 6 eras:

1. **Primitive Era** (0-10%): Basic tools, survival
2. **Early Development** (10-25%): Settlement, resource management
3. **Specialization** (25-50%): Species-specific advantages
4. **Refinement** (50-75%): Integration into systems
5. **Advanced** (75-90%): Spaceflight, advanced energy
6. **Transcendence** (90-100%): Post-biological, reality manipulation

### Species-Specific Examples

**Aquatic Species**:
- Skip wheels, develop hydrodynamic propulsion
- Pressure-based energy systems
- Bioluminescent communication and technology
- Water-current navigation
- Pressure-resistant architecture

**Desert Species**:
- Water conservation and recycling technology
- Heat-resistant materials
- Sand-based construction and computation
- Thermal energy harvesting
- Dust storm prediction and navigation

**Spiritual Species**:
- Divine-resonance communication
- Consciousness-expansion tools
- Spiritual computing (prayer-based processing)
- Sacred site construction technology
- Transcendence-enabling devices

**Hive-Mind Species**:
- Collective consciousness networks
- Synchronized work systems
- Unified decision-making technology
- Individual-collective bridges
- Swarm robotics and coordination

**Crystalline Species**:
- Resonance-based computation
- Light-based communication
- Geometric architecture
- Harmonic energy systems
- Information encoding in crystal lattices

**Psionic Species**:
- Mind-interface technology
- Thought-based computing
- Consciousness networks
- Telepathic communication
- Reality manipulation through will

---

### 6. Enhanced History Generator (`enhancedHistoryGenerator.ts`)

**Purpose**: Orchestrates all systems to create deeply interconnected galaxy histories.

**Generation Process**:

1. **Species Profiling**: Create detailed species profiles with physiology and environment
2. **Technology Tree Generation**: Generate species-specific technology eras
3. **Origin Events**: Create species origin events in cascade
4. **Era-Based Events**: Generate events for each technology era
   - Technology discoveries
   - Social upheaval and resistance
   - Cultural shifts
   - Unintended consequences
5. **Inter-Species Events**: Generate contact, conflict, trade, alliance events
6. **Causal Linking**: Connect events through cascade engine
7. **Validation**: Ensure causal consistency and detect paradoxes
8. **Compilation**: Produce final history with statistics

**Event Generation Features**:
- Events reflect species traits and values
- Social resistance to technological change
- Realistic adoption curves
- Cascading consequences
- Cultural impacts
- Conflict and resolution

---

## Data Models

### SpeciesProfile
```typescript
{
  id: number;
  name: string;
  physicalDescription: string;
  homeworldType: "terrestrial" | "aquatic" | "desert" | ...;
  traits: string[];
  culturalDescription: string;
  physiology: {
    baseForm: "humanoid" | "insectoid" | ...;
    primarySense: "vision" | "echolocation" | ...;
    lifespan: number;
    reproductionRate: "slow" | "moderate" | "fast";
    groupSize: "solitary" | "small-family" | "tribe" | "hive" | "collective";
  };
  environment: {
    gravity: "low" | "normal" | "high";
    temperature: "extreme-cold" | ... | "extreme-hot";
    atmosphere: "thin" | "normal" | "dense" | "toxic" | "exotic";
    water: "none" | "scarce" | "abundant" | "dominant";
    radiation: "low" | "moderate" | "high";
    resources: string[];
  };
}
```

### GeneratedTechnology
```typescript
{
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: number; // 0-100
  prerequisites: string[];
  yearDiscovered: number;
  applicationsAndConsequences: string[];
  speciesAdaptations: string[];
  culturalSignificance: string;
  environmentalDependency: string;
  realismScore: number; // 0-10
}
```

### EventNode
```typescript
{
  id: number;
  year: number;
  title: string;
  description: string;
  eventType: string;
  importance: number; // 0-10
  imagePrompt?: string | null;
  speciesIds: number[];
  speciesNames?: string[];
  speciesColors?: string[];
}
```

---

## Integration Points

### With Image Generation
- High-importance events (importance >= 6) trigger image generation
- Species-specific aesthetic guidance based on physiology
- Hand-drawn, sketch-like aesthetic
- Event context and species colors inform prompts

### With Database
- Galaxy and species profiles stored in MySQL
- Events persisted with causal relationships
- Technology trees cached for performance
- History documents generated on-demand

### With Frontend
- tRPC procedures expose generation and retrieval
- Real-time progress updates during generation
- Interactive timeline visualization
- Cause-effect relationship explorer
- Species encyclopedia viewer

---

## Realistic Features

### Technology Progression
- Prerequisites create realistic dependency chains
- Complexity increases gradually
- Environmental constraints limit options
- Species traits shape technology focus
- Unintended consequences create branching paths

### Cultural Evolution
- Beliefs spread and conflict
- Philosophical schools emerge
- Religious movements reshape society
- Scientific revolutions challenge orthodoxy
- Cultural identity crystallizes

### Societal Dynamics
- Resistance to technological change
- Social upheaval during transitions
- Population pressure drives innovation
- Resource scarcity creates conflict
- Cooperation enables advancement

### Inter-Species Interaction
- First contact scenarios
- Trade and knowledge exchange
- Ideological conflict
- Military conflict
- Mutual transcendence

---

## Performance Considerations

- **Lazy Evaluation**: Technologies generated on-demand
- **Caching**: Technology trees cached after generation
- **Batch Processing**: Images generated in batches
- **Streaming**: LLM responses streamed where possible
- **Pagination**: Large histories paginated in UI

---

## Future Enhancements

1. **Genetic Algorithm**: Optimize species traits for environmental fit
2. **Economic Systems**: Model trade, currency, wealth distribution
3. **Military Simulation**: Detailed warfare and conquest mechanics
4. **Climate Change**: Environmental shifts that force adaptation
5. **Extinction Events**: Catastrophic events that reshape history
6. **Multiverse Branching**: Alternative history paths
7. **Consciousness Studies**: Track evolution of consciousness and philosophy
8. **Art & Culture**: Generate artistic movements and cultural artifacts
9. **Language Evolution**: Track linguistic development
10. **Archaeology**: Generate "artifacts" that future species discover

---

## References

- **Dwarf Fortress World Generation**: Inspiration for pre-computed history
- **Bass Model**: Technology adoption curves (Bass, 1969)
- **XState**: State machine implementation
- **Cascade Algorithms**: Causal consistency and topological ordering
- **Belief Propagation**: Graph-based information spread
- **Agent-Based Modeling**: Emergent behavior from simple rules
