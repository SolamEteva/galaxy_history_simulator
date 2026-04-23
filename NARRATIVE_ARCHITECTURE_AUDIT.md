# Narrative Generation Architecture Audit

**Document Version**: 1.0  
**Date**: March 19, 2026  
**Purpose**: Assess whether narrative generation is event-driven (emergent) or narrative-driven (constrained)

---

## Executive Summary

The current narrative generation system exhibits **mixed patterns** with some event-driven elements but significant narrative-first constraints that limit emergence. The LLM integration is positioned to generate narratives that fit pre-planned event types, rather than flesh out events that have already emerged from causal interactions. This audit identifies specific architectural patterns that need restructuring to achieve true event-driven emergence.

---

## Current Architecture Analysis

### Event Generation Flow (Current)

The current system follows this sequence:

1. **Consequence Type Mapping** - Pre-defined mapping of event types to consequence types (e.g., war → migration, alliance, economic_crisis)
2. **Random Selection** - Randomly select from consequence types
3. **Event Creation** - Create event with selected type
4. **LLM Narrative Generation** - Call LLM to generate narrative fitting the pre-selected event type
5. **Storage** - Store event with narrative

**Problem**: The consequence types are pre-determined. The system decides "this war will lead to migration" before any probabilistic evaluation of civilization state, resources, or traits. The LLM then generates a narrative to fit this pre-decided consequence type.

### Narrative-First Patterns Identified

**Pattern 1: Pre-Determined Consequence Mapping**
```typescript
const consequenceTypes: Record<string, string[]> = {
  war: ["migration", "alliance", "economic_crisis"],
  discovery: ["technological_advancement", "cultural_shift"],
  extinction: ["power_vacuum", "territorial_expansion"],
  first_contact: ["alliance", "conflict", "cultural_exchange"],
};
```

This mapping is hard-coded and deterministic. It assumes all wars lead to the same consequence types regardless of civilization state, resources, or context.

**Pattern 2: Random Selection Without Context**
```typescript
const selectedType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
```

The consequence type is selected randomly from the pre-determined list, not based on civilization state, resources, or probability calculations.

**Pattern 3: Event Type Constrains Narrative**
The event type (war, migration, alliance) is determined before the LLM is called. The LLM then generates a narrative fitting this pre-selected type, rather than the type emerging from the narrative context.

**Pattern 4: Importance as Random Number**
```typescript
importance: Math.floor(Math.random() * 5) + 1,
```

Event importance is random (1-5) rather than calculated from causal significance, civilization impact, or cascade potential.

### Event-Driven Elements (Partial Implementation)

**Positive 1: Causal Relationships Tracked**
Events have `causes` and `consequences` arrays that track causal relationships. This is foundational for event-driven systems.

**Positive 2: Civilization State Considered**
The `HarmonicNetworkEngine` calculates resonance distance between civilizations, which influences event propagation probability. This is a step toward state-driven consequences.

**Positive 3: Fitness-Based Adaptation**
The `EvolutionaryAdaptationEngine` calculates fitness scores (survival, cultural, technological, expansion) that could influence decision-making.

---

## Required Restructuring

### Principle 1: Events First, Narratives Second

**Current**: Narrative type determined → Event created to fit narrative

**Required**: Event emerges from state → Narrative generated to explain event

The LLM should be called AFTER an event has been determined by probabilistic simulation, not before. The LLM's role is to flesh out the "what happened" into a compelling story, not to determine what type of event should happen.

### Principle 2: Probability-Driven Consequences

**Current**: Consequence type selected randomly from pre-determined list

**Required**: Consequence type emerges from civilization state and probability calculations

When a war occurs, the consequences should emerge from:
- Civilization resources (can they migrate? do they have allies?)
- Population pressure (do they need to migrate?)
- Technological level (can they form alliances or must they migrate?)
- Recent history (have they migrated before? are they militaristic?)
- Geographic factors (are there habitable territories to migrate to?)
- Relationship state (do they have allies to form alliances with?)

Each potential consequence should have a calculated probability based on these factors, not be randomly selected from a fixed list.

### Principle 3: LLM as Narrative Flesh, Not Event Architect

**Current**: LLM generates narrative that constrains event type

**Required**: LLM generates narrative explaining event that has already been determined

The LLM should receive:
- Event type (determined by simulation)
- Involved civilizations and their states
- Causal context (what led to this event)
- Probable consequences (what might result)

The LLM should generate:
- Rich narrative explaining why this event happened
- Character-level details (who made decisions, what motivated them)
- Emotional/cultural context (how did this feel to the civilizations involved)
- Foreshadowing of probable consequences

### Principle 4: Cascade Probability Based on State

**Current**: Propagation probability is 50% of resonance distance

**Required**: Propagation probability calculated from multiple factors

When an event occurs, the probability it cascades to another civilization should depend on:
- Distance (farther = lower probability)
- Communication/trade networks (connected = higher probability)
- Relationship state (allies = higher probability, enemies = different probability)
- Civilization readiness (do they have resources to respond?)
- Event type (wars cascade faster than discoveries)
- Historical precedent (have similar events cascaded before?)

---

## Specific Code Changes Required

### Change 1: Event Generation Without Pre-Determined Types

**Current Approach** (Problematic):
```typescript
const consequenceTypes: Record<string, string[]> = {
  war: ["migration", "alliance", "economic_crisis"],
  // ...
};
const selectedType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
```

**Required Approach**:
```typescript
// Calculate probability for each potential consequence
const consequenceProbabilities = {
  migration: calculateMigrationProbability(civilization, sourceEvent),
  alliance: calculateAllianceProbability(civilization, sourceEvent),
  economic_crisis: calculateEconomicCrisisProbability(civilization, sourceEvent),
  // ... other consequences
};

// Select consequence based on weighted probability
const selectedType = selectByWeightedProbability(consequenceProbabilities);
```

### Change 2: Probability Calculations Based on State

Each consequence probability should be calculated from civilization state:

```typescript
function calculateMigrationProbability(civ: CivilizationState, event: EventNode): number {
  let probability = 0;

  // Population pressure
  const populationPressure = civ.resources.population / civ.resources.carryingCapacity;
  probability += populationPressure * 0.3;

  // Resource scarcity
  const resourceScarcity = 1 - (civ.resources.food / civ.resources.foodNeed);
  probability += Math.max(0, resourceScarcity) * 0.2;

  // Available territory
  const availableTerritory = calculateAvailableTerritory(civ);
  probability += (availableTerritory > 0 ? 0.2 : 0);

  // Recent migration history
  const recentMigrations = countRecentMigrations(civ, 500); // last 500 years
  probability -= recentMigrations * 0.05; // Less likely if recently migrated

  // Civilization traits
  if (civ.traits?.includes("nomadic")) probability += 0.2;
  if (civ.traits?.includes("territorial")) probability -= 0.2;

  return Math.min(1, Math.max(0, probability));
}
```

### Change 3: LLM Called After Event Type Determined

**Current Approach** (Problematic):
```typescript
// Event type determined first
const selectedType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

// Then LLM generates narrative fitting type
const narrative = await generateNarrative(selectedType, civilization);
```

**Required Approach**:
```typescript
// Event type determined from probability calculations
const selectedType = selectByWeightedProbability(consequenceProbabilities);

// Create event with type
const event = createEvent(selectedType, civilization, sourceEvent);

// THEN call LLM to flesh out the narrative
const narrative = await generateNarrativeForEvent(event, {
  involvedCivilizations: [civilization],
  causalContext: sourceEvent,
  probableConsequences: calculateProbableConsequences(event),
});
```

### Change 4: Importance Calculated from Causal Significance

**Current Approach** (Problematic):
```typescript
importance: Math.floor(Math.random() * 5) + 1,
```

**Required Approach**:
```typescript
// Calculate importance from causal significance
const importance = calculateCausalSignificance(event, {
  cascadeCount: countCascades(event),
  affectedPopulation: calculateAffectedPopulation(event),
  civilizationImpact: calculateCivilizationImpact(event),
  historicalPrecedent: calculateHistoricalPrecedent(event),
});
```

---

## Comparison: Current vs. Required Architecture

| Aspect | Current | Required |
|--------|---------|----------|
| **Event Generation** | Pre-determined types → random selection | Probability-driven selection from state |
| **LLM Role** | Generate narrative that constrains event | Flesh out event that has been determined |
| **Consequence Selection** | Random from fixed list | Weighted probability from civilization state |
| **Event Importance** | Random (1-5) | Calculated from causal significance |
| **Cascade Probability** | 50% of resonance distance | Multi-factor probability calculation |
| **Civilization Influence** | Resonance distance only | Comprehensive state analysis |
| **Emergence** | Limited (event type pre-determined) | True emergence (consequences from state) |

---

## Impact on Narrative Quality

### Current System Issues

1. **Repetitive Patterns** - Wars always lead to same consequence types, making histories feel formulaic
2. **Disconnected Narratives** - LLM narratives don't reflect actual civilization state or constraints
3. **Unrealistic Consequences** - A civilization with no food and no allies might still "randomly" form an alliance
4. **Limited Emergence** - Event types are pre-determined, limiting true generativity
5. **Narrative Fitting** - LLM is forced to fit narratives to pre-selected event types rather than explaining what actually happened

### Improved System Benefits

1. **Emergent Patterns** - Consequences emerge from state, creating unique patterns for each civilization
2. **Coherent Narratives** - LLM narratives explain why consequences actually happened based on civilization state
3. **Realistic Consequences** - Consequences reflect actual civilization resources, relationships, and traits
4. **True Emergence** - Event types emerge from probability calculations, enabling genuine generativity
5. **Story-Driven Events** - Events are determined first, then LLM creates compelling stories explaining them

---

## Implementation Roadmap

### Phase 1: Audit Complete (Current)
- ✅ Identify narrative-first patterns
- ✅ Document required changes
- ✅ Create comparison matrix

### Phase 2: Probability System (Week 1)
- [ ] Create consequence probability calculators
- [ ] Implement state-based probability functions
- [ ] Add probability weighting system
- [ ] Test probability distributions

### Phase 3: Event Generation Restructure (Week 2)
- [ ] Refactor event generation to use probability system
- [ ] Remove pre-determined consequence type mapping
- [ ] Implement weighted random selection
- [ ] Update event creation logic

### Phase 4: LLM Integration Refactor (Week 2-3)
- [ ] Move LLM call to post-event-generation
- [ ] Create LLM prompt that explains events rather than constrains them
- [ ] Implement narrative generation with causal context
- [ ] Add character-level narrative details

### Phase 5: Testing & Validation (Week 3-4)
- [ ] Test event emergence patterns
- [ ] Verify narrative coherence
- [ ] Validate probability distributions
- [ ] Compare current vs. new system outputs

---

## Critical Success Metrics

**Emergence Quality**
- Event types should vary based on civilization state (not repeat same types)
- Consequences should reflect civilization resources and traits
- Narratives should explain why events happened, not just describe them

**Narrative Coherence**
- LLM narratives should reference civilization state and constraints
- Consequences should be plausible given civilization situation
- Character motivations should be grounded in civilization traits and history

**Probability Validation**
- Civilizations with high population pressure should migrate more often
- Civilizations with strong allies should form alliances more often
- Civilizations with low resources should experience crises more often

---

## Conclusion

The current narrative system has strong foundations but exhibits narrative-first patterns that limit emergence. The required restructuring moves the LLM from event architect to narrative flesh-out, enabling true event-driven emergence where consequences flow from civilization state and probability calculations rather than pre-determined mappings.

This change is fundamental to achieving the vision of a generative system where histories emerge from interconnected decisions and cascading consequences, rather than being constrained by pre-planned narrative types.

**Next Steps**: Begin Phase 2 (Probability System) implementation immediately to establish the foundation for event-driven generation.

---

**Document Status**: Ready for Implementation  
**Last Updated**: March 19, 2026  
**Critical Path**: Phases 2-4 must complete before Phase 5 testing
