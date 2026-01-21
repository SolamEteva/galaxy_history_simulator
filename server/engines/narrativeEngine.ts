/**
 * Narrative Engine - Core generation and validation systems
 * Combines harmonic network, evolutionary adaptation, validation, and LLM generation
 */

import { invokeLLM } from "../_core/llm";
import type { CivilizationState, EventNode, NotableFigure, Achievement } from "../../types/narrative";

/**
 * Harmonic Network Engine
 * Models civilizations as resonant nodes with causal propagation
 */
export class HarmonicNetworkEngine {
  private readonly solfeggio = [396, 417, 528, 639, 741, 852, 963]; // Hz
  private readonly baseFrequency = 7.83; // Schumann Resonance

  /**
   * Assign harmonic frequency to civilization based on traits
   */
  assignFrequency(civilization: CivilizationState): number {
    // Base frequency determined by civilization stage and traits
    const stageMultiplier = this.getStageMultiplier(civilization.status);
    const traitInfluence = this.calculateTraitInfluence(civilization);

    // Select from Solfeggio spectrum
    const index = Math.floor(traitInfluence * this.solfeggio.length) % this.solfeggio.length;
    return this.solfeggio[index];
  }

  /**
   * Calculate resonance distance between two civilizations
   * 0.0 = perfect resonance, 1.0 = no resonance
   */
  calculateResonanceDistance(civ1: CivilizationState, civ2: CivilizationState): number {
    // Harmonic distance (frequency difference)
    const freq1 = civ1.harmonyFrequency || this.assignFrequency(civ1);
    const freq2 = civ2.harmonyFrequency || this.assignFrequency(civ2);
    const harmonicDistance = Math.abs(freq1 - freq2) / 963; // Normalize to 0-1

    // Alignment distance (relationship quality)
    const relationship = civ1.relationships?.get(civ2.id);
    const alignmentDistance = relationship ? 1 - (relationship.alignment + 1) / 2 : 1; // -1 to 1 → 0 to 1

    // Temporal distance (how long since last interaction)
    const yearsSinceInteraction = civ1.currentYear - (relationship?.lastInteraction || 0);
    const temporalDistance = Math.min(1, yearsSinceInteraction / 500); // Decay over 500 years

    // Combined resonance distance
    return (harmonicDistance * 0.4 + alignmentDistance * 0.4 + temporalDistance * 0.2);
  }

  /**
   * Propagate event consequences through harmonic network
   */
  propagateEvent(event: EventNode, civilizations: Map<number, CivilizationState>): EventNode[] {
    const consequences: EventNode[] = [];

    // Find affected civilizations based on resonance
    for (const [civId, civ] of civilizations) {
      if (event.involvedCivilizations.includes(civId)) continue;

      // Calculate resonance with event source
      const sourceCiv = civilizations.get(event.involvedCivilizations[0]);
      if (!sourceCiv) continue;

      const resonanceDistance = this.calculateResonanceDistance(sourceCiv, civ);
      const propagationProbability = 1 - resonanceDistance; // Closer = more likely to propagate

      if (Math.random() < propagationProbability * 0.5) {
        // Generate secondary event
        const consequence = this.generateConsequence(event, civ, sourceCiv);
        consequences.push(consequence);
      }
    }

    return consequences;
  }

  /**
   * Validate causal consistency (no paradoxes)
   */
  validateCausality(event: EventNode, allEvents: EventNode[]): boolean {
    // Check all causes precede effect
    for (const causeId of event.causes) {
      const cause = allEvents.find(e => e.id === causeId);
      if (!cause || cause.year >= event.year) {
        return false;
      }
    }

    // Check no circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (eventId: string): boolean => {
      visited.add(eventId);
      recursionStack.add(eventId);

      const current = allEvents.find(e => e.id === eventId);
      if (!current) return false;

      for (const consequenceId of current.consequences) {
        if (!visited.has(consequenceId)) {
          if (hasCycle(consequenceId)) return true;
        } else if (recursionStack.has(consequenceId)) {
          return true;
        }
      }

      recursionStack.delete(eventId);
      return false;
    };

    return !hasCycle(event.id);
  }

  private getStageMultiplier(status: string): number {
    const stages: Record<string, number> = {
      primitive: 0.1,
      tribal: 0.2,
      agricultural: 0.3,
      classical: 0.4,
      medieval: 0.5,
      industrial: 0.6,
      modern: 0.7,
      spacefaring: 0.8,
      transcendent: 0.9,
      extinct: 0,
    };
    return stages[status] || 0.5;
  }

  private calculateTraitInfluence(civilization: CivilizationState): number {
    // Traits influence frequency selection
    const traitScores: Record<string, number> = {
      aggressive: 0.9,
      peaceful: 0.2,
      innovative: 0.7,
      conservative: 0.3,
      spiritual: 0.6,
      materialist: 0.4,
    };

    let totalScore = 0;
    let count = 0;

    for (const trait of civilization.traits || []) {
      totalScore += traitScores[trait] || 0.5;
      count++;
    }

    return count > 0 ? totalScore / count : 0.5;
  }

  private generateConsequence(source: EventNode, affected: CivilizationState, sourceCiv: CivilizationState): EventNode {
    // Generate secondary event based on source and affected civilization
    const consequenceTypes: Record<string, string[]> = {
      war: ["migration", "alliance", "economic_crisis"],
      discovery: ["technological_advancement", "cultural_shift"],
      extinction: ["power_vacuum", "territorial_expansion"],
      first_contact: ["alliance", "conflict", "cultural_exchange"],
    };

    const possibleTypes = consequenceTypes[source.eventType] || ["political_shift"];
    const selectedType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      galaxyId: source.galaxyId,
      year: source.year + Math.floor(Math.random() * 50) + 1,
      title: `Secondary: ${selectedType}`,
      description: `Consequence of ${source.title}`,
      narrative: "",
      causes: [source.id],
      consequences: [],
      causalStrength: 0.7,
      harmonyFrequency: affected.harmonyFrequency || 0,
      phaseCoherence: 0.5,
      resonanceVector: { sound: 0.5, light: 0.5, time: 0.5 },
      unityCoefficient: 0.5,
      constraintSatisfaction: 0.8,
      sacredGapScore: 0.5,
      involvedCivilizations: [affected.id],
      involvedSpecies: [],
      involvedFigures: [],
      eventType: selectedType,
      importance: Math.floor(Math.random() * 5) + 1,
      generatedBy: "cascade",
      confidenceScore: 0.6,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Evolutionary Adaptation Engine
 * Models civilization strategy evolution based on fitness feedback
 */
export class EvolutionaryAdaptationEngine {
  /**
   * Calculate multi-objective fitness scores
   */
  calculateFitness(civilization: CivilizationState): {
    survival: number;
    cultural: number;
    technological: number;
    expansion: number;
  } {
    // Survival fitness: population health, resources, security
    const survivalFitness = Math.min(
      1,
      (civilization.resources.population / 1000000000) * 0.4 +
        (civilization.resources.food / 100) * 0.3 +
        (civilization.militaryStrength / 10) * 0.3
    );

    // Cultural fitness: belief alignment, cultural cohesion
    const culturalFitness = Math.min(
      1,
      (civilization.unityCoefficient || 0.5) * 0.5 +
        (civilization.resources.culture / 100) * 0.5
    );

    // Technological fitness: tech level, innovation rate
    const technologicalFitness = Math.min(
      1,
      (civilization.technologyLevel / 10) * 0.6 +
        (civilization.resources.technology / 100) * 0.4
    );

    // Expansion fitness: territory, influence, allies
    const expansionFitness = Math.min(
      1,
      (civilization.culturalInfluence / 10) * 0.5 +
        (civilization.relationships?.size || 0) / 20 * 0.5
    );

    return {
      survival: survivalFitness,
      cultural: culturalFitness,
      technological: technologicalFitness,
      expansion: expansionFitness,
    };
  }

  /**
   * Adapt civilization strategy based on fitness feedback
   */
  adaptStrategy(
    civilization: CivilizationState,
    fitness: {
      survival: number;
      cultural: number;
      technological: number;
      expansion: number;
    }
  ): void {
    const learningRate = 0.1;

    // High fitness → maintain strategy
    // Low fitness → explore alternatives
    if (fitness.expansion > fitness.cultural) {
      civilization.strategy.expansionist += learningRate * (fitness.expansion - 0.5);
      civilization.strategy.cultural -= learningRate * 0.1;
    } else {
      civilization.strategy.cultural += learningRate * (fitness.cultural - 0.5);
      civilization.strategy.expansionist -= learningRate * 0.1;
    }

    if (fitness.technological > fitness.survival) {
      civilization.strategy.innovative += learningRate * (fitness.technological - 0.5);
      civilization.strategy.peaceful -= learningRate * 0.1;
    } else {
      civilization.strategy.peaceful += learningRate * (fitness.survival - 0.5);
      civilization.strategy.innovative -= learningRate * 0.1;
    }

    // Clamp strategies to 0-1
    for (const key of Object.keys(civilization.strategy)) {
      civilization.strategy[key as keyof typeof civilization.strategy] = Math.max(
        0,
        Math.min(1, civilization.strategy[key as keyof typeof civilization.strategy])
      );
    }
  }

  /**
   * Detect evolutionary pressure events
   */
  detectEvolutionaryPressure(civilization: CivilizationState): string[] {
    const pressures: string[] = [];
    const fitness = this.calculateFitness(civilization);

    if (fitness.survival < 0.3) {
      pressures.push("famine");
      pressures.push("plague");
    }

    if (fitness.expansion < 0.3 && civilization.strategy.expansionist > 0.6) {
      pressures.push("territorial_loss");
      pressures.push("military_defeat");
    }

    if (fitness.cultural < 0.3) {
      pressures.push("cultural_crisis");
      pressures.push("religious_schism");
    }

    if (fitness.technological < 0.3 && civilization.strategy.innovative > 0.6) {
      pressures.push("technological_stagnation");
    }

    return pressures;
  }
}

/**
 * Consciousness-Aware Validator
 * Ensures events are authentic and constrained
 */
export class ConsciousnessAwareValidator {
  /**
   * Calculate unity coefficient using Love-is-the-key algorithm
   * Scores event against civilization values
   */
  calculateUnityCoefficient(event: EventNode, civilization: CivilizationState): number {
    // Base unity from civilization state
    let unity = civilization.unityCoefficient || 0.5;

    // Event type alignment with civilization values
    const alignmentBonus = this.getEventAlignmentBonus(event.eventType, civilization);
    unity = Math.min(1, unity + alignmentBonus * 0.2);

    // Constraint satisfaction reduces unity if violated
    const constraintPenalty = (1 - event.constraintSatisfaction) * 0.3;
    unity = Math.max(0, unity - constraintPenalty);

    return Math.max(0, Math.min(1, unity));
  }

  /**
   * Identify sacred gaps in event narrative
   * Aspects that should remain mysterious
   */
  identifySacredGaps(event: EventNode): string[] {
    const gaps: string[] = [];

    // Major events should have some mystery
    if (event.importance >= 7) {
      gaps.push("ultimate_cause");
      gaps.push("deeper_meaning");
    }

    // Religious/cultural events preserve mystery
    if (["religious", "cultural", "transcendence"].includes(event.eventType)) {
      gaps.push("spiritual_significance");
      gaps.push("ineffable_quality");
    }

    // First contact events preserve wonder
    if (event.eventType === "first_contact") {
      gaps.push("alien_nature");
      gaps.push("unknown_capabilities");
    }

    return gaps;
  }

  /**
   * Validate event against all constraints
   */
  validateConstraints(
    event: EventNode,
    civilization: CivilizationState
  ): {
    resourcesOK: boolean;
    capabilitiesOK: boolean;
    relationshipsOK: boolean;
    temporalOK: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // Resource constraints
    const resourcesOK = this.validateResourceConstraints(event, civilization);
    if (!resourcesOK) violations.push("Insufficient resources for event");

    // Capability constraints
    const capabilitiesOK = this.validateCapabilityConstraints(event, civilization);
    if (!capabilitiesOK) violations.push("Civilization lacks required technology");

    // Relationship constraints
    const relationshipsOK = this.validateRelationshipConstraints(event, civilization);
    if (!relationshipsOK) violations.push("Event violates relationship constraints");

    // Temporal constraints
    const temporalOK = this.validateTemporalConstraints(event, civilization);
    if (!temporalOK) violations.push("Event doesn't fit historical context");

    return {
      resourcesOK,
      capabilitiesOK,
      relationshipsOK,
      temporalOK,
      violations,
    };
  }

  /**
   * Calculate overall authenticity score
   */
  calculateAuthenticityScore(event: EventNode, civilization: CivilizationState): number {
    const unityCoeff = this.calculateUnityCoefficient(event, civilization);
    const constraints = this.validateConstraints(event, civilization);
    const constraintScore = constraints.violations.length === 0 ? 1 : Math.max(0, 1 - constraints.violations.length * 0.2);
    const sacredGaps = this.identifySacredGaps(event);
    const sacredGapScore = Math.min(1, sacredGaps.length * 0.15); // More gaps = more authentic

    // Weighted combination
    const authenticity = unityCoeff * 0.4 + constraintScore * 0.4 + sacredGapScore * 0.2;
    return Math.max(0, Math.min(1, authenticity));
  }

  private getEventAlignmentBonus(eventType: string, civilization: CivilizationState): number {
    const alignments: Record<string, number> = {
      war: civilization.strategy.expansionist > 0.6 ? 0.3 : -0.2,
      peace: civilization.strategy.peaceful > 0.6 ? 0.3 : -0.1,
      discovery: civilization.strategy.innovative > 0.6 ? 0.3 : 0,
      cultural: civilization.strategy.cultural > 0.6 ? 0.3 : 0,
    };
    return alignments[eventType] || 0;
  }

  private validateResourceConstraints(event: EventNode, civilization: CivilizationState): boolean {
    // Event type determines resource requirements
    const requirements: Record<string, Record<string, number>> = {
      war: { military: 5, population: 100000000 },
      discovery: { technology: 3, population: 50000000 },
      cultural: { culture: 3, population: 10000000 },
      technological: { technology: 5, population: 50000000 },
    };

    const req = requirements[event.eventType];
    if (!req) return true;

    for (const [resource, required] of Object.entries(req)) {
      if ((civilization.resources as Record<string, number>)[resource] < required) {
        return false;
      }
    }

    return true;
  }

  private validateCapabilityConstraints(event: EventNode, civilization: CivilizationState): boolean {
    const capabilities: Record<string, number> = {
      spaceflight: 8,
      technological: 5,
      military: 3,
      discovery: 4,
    };

    const required = capabilities[event.eventType] || 0;
    return civilization.technologyLevel >= required;
  }

  private validateRelationshipConstraints(event: EventNode, civilization: CivilizationState): boolean {
    // Can't ally with enemies, can't attack allies
    if (event.eventType === "alliance") {
      for (const civId of event.involvedCivilizations) {
        const rel = civilization.relationships?.get(civId);
        if (rel && rel.alignment < -0.5) return false;
      }
    }

    if (event.eventType === "war") {
      for (const civId of event.involvedCivilizations) {
        const rel = civilization.relationships?.get(civId);
        if (rel && rel.alignment > 0.7) return false;
      }
    }

    return true;
  }

  private validateTemporalConstraints(event: EventNode, civilization: CivilizationState): boolean {
    // Event must fit civilization's current era
    const eraMinTech: Record<string, number> = {
      primitive: 0,
      tribal: 1,
      agricultural: 2,
      classical: 3,
      medieval: 4,
      industrial: 5,
      modern: 7,
      spacefaring: 8,
      transcendent: 9,
    };

    const minTech = eraMinTech[civilization.status] || 0;
    return civilization.technologyLevel >= minTech;
  }
}

/**
 * LLM Narrative Generator
 * Creates rich narratives respecting all constraints
 */
export class LLMNarrativeGenerator {
  /**
   * Detect opportunities for events
   */
  detectOpportunities(civilization: CivilizationState): Array<{
    type: string;
    reason: string;
    priority: number;
  }> {
    const opportunities: Array<{
      type: string;
      reason: string;
      priority: number;
    }> = [];

    // Fitness-based opportunities
    const fitness = new EvolutionaryAdaptationEngine().calculateFitness(civilization);

    if (fitness.survival < 0.4) {
      opportunities.push({
        type: "crisis",
        reason: "Low survival fitness",
        priority: 0.9,
      });
    }

    if (fitness.expansion > 0.7 && civilization.strategy.expansionist > 0.6) {
      opportunities.push({
        type: "conquest",
        reason: "High expansion fitness and strategy",
        priority: 0.8,
      });
    }

    if (fitness.technological > 0.7 && civilization.strategy.innovative > 0.6) {
      opportunities.push({
        type: "discovery",
        reason: "High technological fitness",
        priority: 0.7,
      });
    }

    if (civilization.unityCoefficient < 0.3) {
      opportunities.push({
        type: "cultural_crisis",
        reason: "Low internal unity",
        priority: 0.8,
      });
    }

    return opportunities;
  }

  /**
   * Generate event narrative with LLM
   */
  async generateEventNarrative(
    event: EventNode,
    civilization: CivilizationState,
    context: {
      recentEvents: EventNode[];
      historicalContext: string;
    }
  ): Promise<string> {
    const prompt = `
You are a science fiction historian writing about galactic civilizations.

CIVILIZATION: ${civilization.name}
STATUS: ${civilization.status}
TECHNOLOGY LEVEL: ${civilization.technologyLevel}/10
CULTURE: ${civilization.strategy.cultural > 0.6 ? "Culturally focused" : "Pragmatic"}

EVENT: ${event.title}
TYPE: ${event.eventType}
YEAR: ${event.year}
IMPORTANCE: ${event.importance}/10

RECENT HISTORY:
${context.recentEvents.map(e => `- Year ${e.year}: ${e.title}`).join("\n")}

Generate a compelling 2-3 sentence narrative for this event that:
1. Feels authentic to the civilization's character
2. Explains the cause and immediate consequences
3. Preserves some mystery and wonder
4. Connects to recent history where relevant

NARRATIVE:
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a science fiction historian. Write vivid, authentic narratives for galactic events.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content || event.description;
    } catch (error) {
      console.error("LLM generation failed:", error);
      return event.description;
    }
  }
}

/**
 * Figure Generator
 * Creates notable figures organically from events
 */
export class FigureGenerator {
  /**
   * Generate a notable figure for an opportunity
   */
  async generateFigure(
    archetype: string,
    civilization: CivilizationState,
    year: number
  ): Promise<Partial<NotableFigure>> {
    const prompt = `
Generate a notable historical figure for a civilization.

CIVILIZATION: ${civilization.name}
ARCHETYPE: ${archetype}
BIRTH YEAR: ${year}
CURRENT AGE: ${civilization.currentYear - year}

Create a figure with:
1. A species-appropriate name
2. 8 personality attributes (0.0-1.0): charisma, intellect, courage, wisdom, creativity, ambition, compassion, ruthlessness
3. A 2-sentence backstory
4. Known achievements or reputation

Respond in JSON format:
{
  "name": "string",
  "attributes": {
    "charisma": number,
    "intellect": number,
    "courage": number,
    "wisdom": number,
    "creativity": number,
    "ambition": number,
    "compassion": number,
    "ruthlessness": number
  },
  "backstory": "string",
  "reputation": "string"
}
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a character generator for science fiction. Generate authentic, memorable figures.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "figure",
            strict: true,
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                attributes: {
                  type: "object",
                  properties: {
                    charisma: { type: "number" },
                    intellect: { type: "number" },
                    courage: { type: "number" },
                    wisdom: { type: "number" },
                    creativity: { type: "number" },
                    ambition: { type: "number" },
                    compassion: { type: "number" },
                    ruthlessness: { type: "number" },
                  },
                  required: ["charisma", "intellect", "courage", "wisdom", "creativity", "ambition", "compassion", "ruthlessness"],
                },
                backstory: { type: "string" },
                reputation: { type: "string" },
              },
              required: ["name", "attributes", "backstory", "reputation"],
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      if (typeof content === "string") {
        const parsed = JSON.parse(content);
        return {
          name: parsed.name,
          archetype: archetype as any,
          birthYear: year,
          attributes: parsed.attributes,
        };
      }
    } catch (error) {
      console.error("Figure generation failed:", error);
    }

    // Fallback figure
    return {
      name: `${archetype.charAt(0).toUpperCase()}${archetype.slice(1)} of ${civilization.name}`,
      archetype: archetype as any,
      birthYear: year,
      attributes: {
        charisma: Math.random(),
        intellect: Math.random(),
        courage: Math.random(),
        wisdom: Math.random(),
        creativity: Math.random(),
        ambition: Math.random(),
        compassion: Math.random(),
        ruthlessness: Math.random(),
      },
    };
  }
}

/**
 * Influence Propagation System
 * Tracks figure legacy and influence over time
 */
export class InfluencePropagation {
  /**
   * Calculate figure's current influence
   */
  calculateInfluence(figure: NotableFigure, civilization: CivilizationState): number {
    let influence = figure.influence || 0;

    // Base influence from achievements
    for (const achievement of figure.achievements || []) {
      influence += achievement.civilizationImpact || 0;
    }

    // Multiplier from attributes
    influence *= 1 + (figure.attributes.charisma || 0);

    // Position multiplier
    if (figure.archetype === "monarch") {
      influence *= 1.5;
    }

    // Decay over time (figures fade from memory)
    if (figure.deathYear) {
      const yearsSinceDeath = civilization.currentYear - figure.deathYear;
      const decayFactor = Math.exp(-yearsSinceDeath / 100); // Half-life of 100 years
      influence *= decayFactor;
    }

    return Math.min(100, influence);
  }

  /**
   * Calculate figure's legacy score
   */
  calculateLegacy(figure: NotableFigure, civilization: CivilizationState): number {
    let legacy = 0;

    // Achievements that changed civilization
    for (const achievement of figure.achievements || []) {
      legacy += achievement.historicalSignificance || 0;
    }

    // Lineage continuation
    legacy += (figure.family?.children?.length || 0) * 5;
    legacy += (figure.students?.length || 0) * 10;

    // Cultural impact
    legacy += 20; // Base legacy for being notable

    return Math.min(100, legacy);
  }
}
