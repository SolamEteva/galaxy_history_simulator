/**
 * Unit Tests for Narrative Engine
 * Tests all core generation engines and validation systems
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  HarmonicNetworkEngine,
  EvolutionaryAdaptationEngine,
  ConsciousnessAwareValidator,
  LLMNarrativeGenerator,
  FigureGenerator,
  InfluencePropagation,
} from "./narrativeEngine";
import type { CivilizationState, EventNode } from "../../types/narrative";

describe("HarmonicNetworkEngine", () => {
  let engine: HarmonicNetworkEngine;

  beforeEach(() => {
    engine = new HarmonicNetworkEngine();
  });

  it("should assign frequency to civilization", () => {
    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
    };

    const frequency = engine.assignFrequency(civilization);
    expect(frequency).toBeGreaterThan(0);
    expect([396, 417, 528, 639, 741, 852, 963]).toContain(frequency);
  });

  it("should calculate resonance distance between civilizations", () => {
    const civ1: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Civ1",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      harmonyFrequency: 528,
    };

    const civ2: CivilizationState = {
      id: 2,
      galaxyId: 1,
      speciesId: 2,
      name: "Civ2",
      foundedYear: 1200,
      currentYear: 2000,
      status: "medieval",
      resources: { population: 500000000, food: 80, technology: 80, culture: 80, military: 80 },
      strategy: { expansionist: 0.6, peaceful: 0.4, innovative: 0.4, cultural: 0.5 },
      technologyLevel: 4,
      militaryStrength: 4,
      culturalInfluence: 4,
      harmonyFrequency: 639,
    };

    const distance = engine.calculateResonanceDistance(civ1, civ2);
    expect(distance).toBeGreaterThanOrEqual(0);
    expect(distance).toBeLessThanOrEqual(1);
  });

  it("should validate causality without paradoxes", () => {
    const event1: EventNode = {
      id: "event1",
      galaxyId: 1,
      year: 1000,
      title: "Event 1",
      description: "First event",
      narrative: "",
      causes: [],
      consequences: ["event2"],
      causalStrength: 0.8,
      harmonyFrequency: 528,
      phaseCoherence: 0.8,
      resonanceVector: { sound: 0.5, light: 0.5, time: 0.5 },
      unityCoefficient: 0.7,
      constraintSatisfaction: 0.9,
      sacredGapScore: 0.5,
      involvedCivilizations: [1],
      involvedSpecies: [],
      involvedFigures: [],
      eventType: "discovery",
      importance: 5,
      generatedBy: "llm",
      confidenceScore: 0.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const event2: EventNode = {
      ...event1,
      id: "event2",
      year: 2000,
      title: "Event 2",
      causes: ["event1"],
      consequences: [],
    };

    const isValid = engine.validateCausality(event2, [event1, event2]);
    expect(isValid).toBe(true);
  });
});

describe("EvolutionaryAdaptationEngine", () => {
  let engine: EvolutionaryAdaptationEngine;

  beforeEach(() => {
    engine = new EvolutionaryAdaptationEngine();
  });

  it("should calculate multi-objective fitness scores", () => {
    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      unityCoefficient: 0.7,
    };

    const fitness = engine.calculateFitness(civilization);
    expect(fitness.survival).toBeGreaterThanOrEqual(0);
    expect(fitness.survival).toBeLessThanOrEqual(1);
    expect(fitness.cultural).toBeGreaterThanOrEqual(0);
    expect(fitness.cultural).toBeLessThanOrEqual(1);
    expect(fitness.technological).toBeGreaterThanOrEqual(0);
    expect(fitness.technological).toBeLessThanOrEqual(1);
    expect(fitness.expansion).toBeGreaterThanOrEqual(0);
    expect(fitness.expansion).toBeLessThanOrEqual(1);
  });

  it("should adapt strategy based on fitness feedback", () => {
    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      unityCoefficient: 0.7,
    };

    const originalStrategy = { ...civilization.strategy };
    const fitness = { survival: 0.8, cultural: 0.2, technological: 0.9, expansion: 0.3 };

    engine.adaptStrategy(civilization, fitness);

    // Strategy should have adapted
    expect(civilization.strategy.innovative).toBeGreaterThan(originalStrategy.innovative);
    expect(civilization.strategy.peaceful).toBeGreaterThan(originalStrategy.peaceful);
  });

  it("should detect evolutionary pressure events", () => {
    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 100000, food: 10, technology: 10, culture: 10, military: 10 },
      strategy: { expansionist: 0.9, peaceful: 0.1, innovative: 0.9, cultural: 0.1 },
      technologyLevel: 1,
      militaryStrength: 1,
      culturalInfluence: 1,
      unityCoefficient: 0.2,
    };

    const pressures = engine.detectEvolutionaryPressure(civilization);
    expect(pressures.length).toBeGreaterThan(0);
    expect(pressures).toContain("famine");
  });
});

describe("ConsciousnessAwareValidator", () => {
  let validator: ConsciousnessAwareValidator;

  beforeEach(() => {
    validator = new ConsciousnessAwareValidator();
  });

  it("should calculate unity coefficient", () => {
    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      unityCoefficient: 0.7,
    };

    const event: EventNode = {
      id: "test",
      galaxyId: 1,
      year: 2000,
      title: "Test",
      description: "Test",
      narrative: "",
      causes: [],
      consequences: [],
      causalStrength: 0.7,
      harmonyFrequency: 528,
      phaseCoherence: 0.8,
      resonanceVector: { sound: 0.5, light: 0.5, time: 0.5 },
      unityCoefficient: 0.7,
      constraintSatisfaction: 0.9,
      sacredGapScore: 0.5,
      involvedCivilizations: [1],
      involvedSpecies: [],
      involvedFigures: [],
      eventType: "discovery",
      importance: 5,
      generatedBy: "llm",
      confidenceScore: 0.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const unity = validator.calculateUnityCoefficient(event, civilization);
    expect(unity).toBeGreaterThanOrEqual(0);
    expect(unity).toBeLessThanOrEqual(1);
  });

  it("should identify sacred gaps in events", () => {
    const event: EventNode = {
      id: "test",
      galaxyId: 1,
      year: 2000,
      title: "Test",
      description: "Test",
      narrative: "",
      causes: [],
      consequences: [],
      causalStrength: 0.7,
      harmonyFrequency: 528,
      phaseCoherence: 0.8,
      resonanceVector: { sound: 0.5, light: 0.5, time: 0.5 },
      unityCoefficient: 0.7,
      constraintSatisfaction: 0.9,
      sacredGapScore: 0.5,
      involvedCivilizations: [1],
      involvedSpecies: [],
      involvedFigures: [],
      eventType: "religious",
      importance: 9,
      generatedBy: "llm",
      confidenceScore: 0.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const gaps = validator.identifySacredGaps(event);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps).toContain("spiritual_significance");
  });

  it("should validate event constraints", () => {
    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      unityCoefficient: 0.7,
    };

    const event: EventNode = {
      id: "test",
      galaxyId: 1,
      year: 2000,
      title: "Test",
      description: "Test",
      narrative: "",
      causes: [],
      consequences: [],
      causalStrength: 0.7,
      harmonyFrequency: 528,
      phaseCoherence: 0.8,
      resonanceVector: { sound: 0.5, light: 0.5, time: 0.5 },
      unityCoefficient: 0.7,
      constraintSatisfaction: 0.9,
      sacredGapScore: 0.5,
      involvedCivilizations: [1],
      involvedSpecies: [],
      involvedFigures: [],
      eventType: "discovery",
      importance: 5,
      generatedBy: "llm",
      confidenceScore: 0.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = validator.validateConstraints(event, civilization);
    expect(result.violations).toBeDefined();
    expect(Array.isArray(result.violations)).toBe(true);
  });

  it("should calculate authenticity score", () => {
    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      unityCoefficient: 0.7,
    };

    const event: EventNode = {
      id: "test",
      galaxyId: 1,
      year: 2000,
      title: "Test",
      description: "Test",
      narrative: "",
      causes: [],
      consequences: [],
      causalStrength: 0.7,
      harmonyFrequency: 528,
      phaseCoherence: 0.8,
      resonanceVector: { sound: 0.5, light: 0.5, time: 0.5 },
      unityCoefficient: 0.7,
      constraintSatisfaction: 0.9,
      sacredGapScore: 0.5,
      involvedCivilizations: [1],
      involvedSpecies: [],
      involvedFigures: [],
      eventType: "discovery",
      importance: 5,
      generatedBy: "llm",
      confidenceScore: 0.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const authenticity = validator.calculateAuthenticityScore(event, civilization);
    expect(authenticity).toBeGreaterThanOrEqual(0);
    expect(authenticity).toBeLessThanOrEqual(1);
  });
});

describe("InfluencePropagation", () => {
  let propagation: InfluencePropagation;

  beforeEach(() => {
    propagation = new InfluencePropagation();
  });

  it("should calculate figure influence", () => {
    const figure = {
      id: 1,
      galaxyId: 1,
      civilizationId: 1,
      speciesId: 1,
      name: "Test Figure",
      birthYear: 1900,
      deathYear: 1980,
      archetype: "monarch" as const,
      attributes: {
        charisma: 0.9,
        intellect: 0.7,
        courage: 0.8,
        wisdom: 0.6,
        creativity: 0.5,
        ambition: 0.9,
        compassion: 0.4,
        ruthlessness: 0.8,
      },
      achievements: [
        {
          id: 1,
          figureId: 1,
          year: 1950,
          title: "Great Achievement",
          description: "Changed the world",
          achievementType: "discovery",
          civilizationImpact: 20,
          historicalSignificance: 30,
        },
      ],
      influence: 50,
    };

    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      unityCoefficient: 0.7,
    };

    const influence = propagation.calculateInfluence(figure, civilization);
    expect(influence).toBeGreaterThanOrEqual(0);
    expect(influence).toBeLessThanOrEqual(100);
  });

  it("should calculate figure legacy", () => {
    const figure = {
      id: 1,
      galaxyId: 1,
      civilizationId: 1,
      speciesId: 1,
      name: "Test Figure",
      birthYear: 1900,
      deathYear: 1980,
      archetype: "monarch" as const,
      attributes: {
        charisma: 0.9,
        intellect: 0.7,
        courage: 0.8,
        wisdom: 0.6,
        creativity: 0.5,
        ambition: 0.9,
        compassion: 0.4,
        ruthlessness: 0.8,
      },
      achievements: [
        {
          id: 1,
          figureId: 1,
          year: 1950,
          title: "Great Achievement",
          description: "Changed the world",
          achievementType: "discovery",
          civilizationImpact: 20,
          historicalSignificance: 30,
        },
      ],
      influence: 50,
      family: { children: [1, 2, 3] },
      students: [1, 2],
    };

    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      unityCoefficient: 0.7,
    };

    const legacy = propagation.calculateLegacy(figure, civilization);
    expect(legacy).toBeGreaterThanOrEqual(0);
    expect(legacy).toBeLessThanOrEqual(100);
  });
});

describe("LLMNarrativeGenerator", () => {
  let generator: LLMNarrativeGenerator;

  beforeEach(() => {
    generator = new LLMNarrativeGenerator();
  });

  it("should detect event opportunities", () => {
    const civilization: CivilizationState = {
      id: 1,
      galaxyId: 1,
      speciesId: 1,
      name: "Test",
      foundedYear: 1000,
      currentYear: 2000,
      status: "classical",
      resources: { population: 1000000000, food: 100, technology: 100, culture: 100, military: 100 },
      strategy: { expansionist: 0.5, peaceful: 0.5, innovative: 0.5, cultural: 0.5 },
      technologyLevel: 5,
      militaryStrength: 5,
      culturalInfluence: 5,
      unityCoefficient: 0.7,
    };

    const opportunities = generator.detectOpportunities(civilization);
    expect(Array.isArray(opportunities)).toBe(true);
    expect(opportunities.length).toBeGreaterThanOrEqual(0);

    opportunities.forEach(opp => {
      expect(opp).toHaveProperty("type");
      expect(opp).toHaveProperty("reason");
      expect(opp).toHaveProperty("priority");
      expect(opp.priority).toBeGreaterThanOrEqual(0);
      expect(opp.priority).toBeLessThanOrEqual(1);
    });
  });
});
