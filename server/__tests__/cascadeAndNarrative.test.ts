/**
 * Comprehensive Test Suite for Cascade and Narrative Systems
 * Tests both subsystems independently before integration
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateMigrationProbability,
  calculateAllianceProbability,
  calculateConflictProbability,
  calculateAllConsequenceProbabilities,
  selectConsequenceByWeightedProbability,
} from "../engines/completeConsequenceProbabilities";
import {
  propagateCascade,
  calculateNetworkDistance,
  calculatePropagationProbability,
  calculatePropagationDelay,
} from "../engines/cascadePropagationEngine";
import {
  calculateStateUpdate,
  applyStateUpdate,
  detectFeedbackLoops,
  calculateLongTermTrend,
  calculateCivilizationPhase,
} from "../engines/temporalCascadeEngine";
import {
  validateCausality,
  validateConstraints,
  detectContradictionBetween,
  validateMultiPerspectiveEvent,
} from "../engines/narrativeValidation";
import {
  NarrativeCache,
  NarrativeBatchProcessor,
  NarrativeOptimizer,
} from "../engines/narrativeCache";
import type { CivilizationState, EventNode } from "../../types/narrative";

// Mock data
const mockCivilization: CivilizationState = {
  id: "civ1",
  name: "Human Alliance",
  status: "thriving",
  currentYear: 2500,
  technologyLevel: 5,
  militaryStrength: 100,
  culturalInfluence: 80,
  unityCoefficient: 0.7,
  harmonyFrequency: 440,
  resources: {
    population: 5000000,
    food: 500,
    technology: 5,
    culture: 75,
    military: 100,
    trade: 200,
  },
  traits: ["diplomatic", "innovative"],
  strategy: {
    expansionist: 0.4,
    peaceful: 0.6,
    innovative: 0.7,
    cultural: 0.5,
  },
  relationships: new Map(),
};

const mockEvent: EventNode = {
  id: "event1",
  galaxyId: "galaxy1",
  year: 2500,
  title: "First Contact with Alien Species",
  description: "A peaceful first contact scenario",
  narrative: "",
  causes: [],
  consequences: [],
  causalStrength: 0.8,
  harmonyFrequency: 440,
  phaseCoherence: 0.7,
  resonanceVector: { sound: 0.6, light: 0.6, time: 0.6 },
  unityCoefficient: 0.6,
  constraintSatisfaction: 0.85,
  sacredGapScore: 0.4,
  involvedCivilizations: ["civ1"],
  involvedSpecies: [],
  involvedFigures: [],
  eventType: "first_contact",
  importance: 8,
  generatedBy: "test",
  confidenceScore: 0.9,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Cascade Algorithm - Probability Calculators", () => {
  it("should calculate migration probability based on population pressure", () => {
    const context = {
      sourceEvent: mockEvent,
      affectedCivilization: mockCivilization,
      sourceCivilization: mockCivilization,
      allCivilizations: new Map(),
      allEvents: [],
    };

    const probability = calculateMigrationProbability(context);
    expect(probability).toBeGreaterThanOrEqual(0);
    expect(probability).toBeLessThanOrEqual(1);
  });

  it("should calculate alliance probability based on relationships", () => {
    const context = {
      sourceEvent: mockEvent,
      affectedCivilization: mockCivilization,
      sourceCivilization: mockCivilization,
      allCivilizations: new Map(),
      allEvents: [],
    };

    const probability = calculateAllianceProbability(context);
    expect(probability).toBeGreaterThanOrEqual(0);
    expect(probability).toBeLessThanOrEqual(1);
  });

  it("should calculate conflict probability based on military strength", () => {
    const context = {
      sourceEvent: mockEvent,
      affectedCivilization: mockCivilization,
      sourceCivilization: mockCivilization,
      allCivilizations: new Map(),
      allEvents: [],
    };

    const probability = calculateConflictProbability(context);
    expect(probability).toBeGreaterThanOrEqual(0);
    expect(probability).toBeLessThanOrEqual(1);
  });

  it("should calculate all consequence probabilities", () => {
    const context = {
      sourceEvent: mockEvent,
      affectedCivilization: mockCivilization,
      sourceCivilization: mockCivilization,
      allCivilizations: new Map(),
      allEvents: [],
    };

    const probabilities = calculateAllConsequenceProbabilities(context);
    expect(Object.keys(probabilities).length).toBeGreaterThan(0);

    // All probabilities should be between 0 and 1
    for (const [, prob] of Object.entries(probabilities)) {
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    }
  });

  it("should select consequence by weighted probability", () => {
    const probabilities = {
      migration: 0.3,
      alliance: 0.2,
      conflict: 0.1,
      economic_crisis: 0.15,
      technological_advancement: 0.05,
      cultural_shift: 0.1,
      power_vacuum: 0.05,
      territorial_expansion: 0.02,
      plague: 0.01,
      discovery: 0.02,
    };

    const selected = selectConsequenceByWeightedProbability(probabilities);
    expect(Object.keys(probabilities)).toContain(selected);
  });
});

describe("Cascade Algorithm - Propagation", () => {
  it("should calculate network distance between civilizations", () => {
    const civ2 = { ...mockCivilization, id: "civ2", name: "Other Civilization" };
    const allCivs = new Map([
      ["civ1", mockCivilization],
      ["civ2", civ2],
    ]);

    const distance = calculateNetworkDistance(mockCivilization, civ2, allCivs);
    expect(distance).toBeGreaterThanOrEqual(0);
    expect(distance).toBeLessThanOrEqual(1);
  });

  it("should calculate propagation probability based on distance", () => {
    const probability = calculatePropagationProbability(
      mockEvent,
      mockCivilization,
      mockCivilization,
      0.5
    );

    expect(probability).toBeGreaterThanOrEqual(0);
    expect(probability).toBeLessThanOrEqual(1);
  });

  it("should calculate propagation delay based on distance and consequence type", () => {
    const delay = calculatePropagationDelay(0.5, "alliance", mockCivilization);
    expect(delay).toBeGreaterThanOrEqual(0);
    expect(typeof delay).toBe("number");
  });
});

describe("Temporal Cascade Engine", () => {
  it("should calculate state update from event", () => {
    const update = calculateStateUpdate(mockEvent, mockCivilization);

    expect(update).toHaveProperty("populationChange");
    expect(update).toHaveProperty("foodChange");
    expect(update).toHaveProperty("technologyChange");
    expect(update).toHaveProperty("cultureChange");
    expect(update).toHaveProperty("militaryChange");
    expect(update).toHaveProperty("unityChange");
  });

  it("should apply state update to civilization", () => {
    const update = calculateStateUpdate(mockEvent, mockCivilization);
    const updated = applyStateUpdate(mockCivilization, update);

    expect(updated.resources.population).toBeGreaterThanOrEqual(0);
    expect(updated.resources.food).toBeGreaterThanOrEqual(0);
    expect(updated.unityCoefficient).toBeGreaterThanOrEqual(0);
    expect(updated.unityCoefficient).toBeLessThanOrEqual(1);
  });

  it("should detect feedback loops", () => {
    const loops = detectFeedbackLoops(mockEvent, mockCivilization, new Map());
    expect(Array.isArray(loops)).toBe(true);
  });

  it("should calculate long-term trends", () => {
    const trends = calculateLongTermTrend(mockCivilization, [mockEvent], 100);

    expect(["growing", "stable", "declining"]).toContain(trends.populationTrend);
    expect(["advancing", "stable", "regressing"]).toContain(trends.technologyTrend);
    expect(["flourishing", "stable", "declining"]).toContain(trends.culturalTrend);
  });

  it("should calculate civilization phase", () => {
    const trends = calculateLongTermTrend(mockCivilization, [mockEvent], 100);
    const phase = calculateCivilizationPhase(mockCivilization, trends);

    expect(["emergence", "growth", "peak", "decline", "extinction"]).toContain(phase);
  });
});

describe("Narrative Validation Engine", () => {
  it("should validate causality of narrative", () => {
    const narrative = "A peaceful first contact was established with an alien species.";
    const result = validateCausality(narrative, mockEvent, mockCivilization);

    expect(result).toHaveProperty("violations");
    expect(result).toHaveProperty("isValid");
    expect(Array.isArray(result.violations)).toBe(true);
  });

  it("should validate constraints of narrative", () => {
    const narrative = "The civilization expanded its territory through conquest.";
    const result = validateConstraints(narrative, mockCivilization, mockEvent);

    expect(result).toHaveProperty("violations");
    expect(result).toHaveProperty("isValid");
    expect(Array.isArray(result.violations)).toBe(true);
  });

  it("should detect contradictions between narratives", () => {
    const narrative1 = "We achieved a glorious victory.";
    const narrative2 = "We suffered a devastating defeat.";

    const contradiction = detectContradictionBetween(
      narrative1,
      narrative2,
      "victor",
      "loser"
    );

    expect(contradiction).not.toBeNull();
    if (contradiction) {
      expect(contradiction.contradictedClaims.length).toBeGreaterThan(0);
      expect(["factual", "interpretation", "emphasis"]).toContain(contradiction.contradictionType);
    }
  });
});

describe("Narrative Cache", () => {
  let cache: NarrativeCache;

  beforeEach(() => {
    cache = new NarrativeCache();
  });

  it("should cache and retrieve narratives", () => {
    const narrative = "Test narrative content";
    cache.set("event1", "civ1", "victor", narrative, 100);

    const retrieved = cache.get("event1", "civ1", "victor");
    expect(retrieved).toBe(narrative);
  });

  it("should return null for cache misses", () => {
    const retrieved = cache.get("nonexistent", "civ1", "victor");
    expect(retrieved).toBeNull();
  });

  it("should track cache statistics", () => {
    cache.set("event1", "civ1", "victor", "narrative1", 100);
    cache.set("event2", "civ2", "loser", "narrative2", 150);

    cache.get("event1", "civ1", "victor"); // Hit
    cache.get("event3", "civ3", "neutral"); // Miss

    const stats = cache.getStats();
    expect(stats.totalEntries).toBe(2);
    expect(stats.hitCount).toBe(1);
    expect(stats.missCount).toBe(1);
    expect(stats.hitRate).toBeCloseTo(0.5, 1);
  });

  it("should invalidate event cache entries", () => {
    cache.set("event1", "civ1", "victor", "narrative1", 100);
    cache.set("event1", "civ2", "loser", "narrative2", 100);
    cache.set("event2", "civ1", "neutral", "narrative3", 100);

    const invalidated = cache.invalidateEvent("event1");
    expect(invalidated).toBe(2);

    const stats = cache.getStats();
    expect(stats.totalEntries).toBe(1);
  });
});

describe("Narrative Batch Processor", () => {
  it("should queue narrative generation requests", async () => {
    const processor = new NarrativeBatchProcessor();
    
    // Queue multiple requests
    const promise1 = processor.queue("event1", "civ1", "victor");
    const promise2 = processor.queue("event2", "civ2", "loser");

    expect(processor.getQueueSize()).toBeGreaterThan(0);

    // Wait for processing
    await Promise.all([promise1, promise2]);
    
    expect(processor.getQueueSize()).toBe(0);
  });
});

describe("Narrative Optimizer", () => {
  it("should calculate narrative similarity", () => {
    const narrative1 = "The civilization achieved victory through military strength.";
    const narrative2 = "The civilization achieved victory through military power.";

    const similarity = NarrativeOptimizer.calculateSimilarity(narrative1, narrative2);
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it("should compress narrative", () => {
    const narrative = "It is said that  the civilization   achieved victory.";
    const compressed = NarrativeOptimizer.compressNarrative(narrative);

    expect(compressed.length).toBeLessThanOrEqual(narrative.length);
    expect(compressed).not.toContain("  ");
  });

  it("should estimate generation cost", () => {
    const cost = NarrativeOptimizer.estimateGenerationCost(
      mockEvent,
      mockCivilization,
      "victor"
    );

    expect(cost).toBeGreaterThan(0);
  });
});

describe("System Integration Tests", () => {
  it("should handle complete cascade from event to state update", () => {
    const context = {
      sourceEvent: mockEvent,
      affectedCivilization: mockCivilization,
      sourceCivilization: mockCivilization,
      allCivilizations: new Map([["civ1", mockCivilization]]),
      allEvents: [mockEvent],
    };

    // Calculate consequence
    const probabilities = calculateAllConsequenceProbabilities(context);
    const consequenceType = selectConsequenceByWeightedProbability(probabilities);

    // Create consequence event
    const consequenceEvent: EventNode = {
      ...mockEvent,
      id: "consequence1",
      eventType: consequenceType,
      title: `Consequence: ${consequenceType}`,
    };

    // Calculate state update
    const update = calculateStateUpdate(consequenceEvent, mockCivilization);
    const updated = applyStateUpdate(mockCivilization, update);

    // Verify state was updated
    expect(updated).toBeDefined();
    expect(updated.id).toBe(mockCivilization.id);
  });

  it("should validate narrative for consequence event", () => {
    const narrative = "The civilization experienced economic difficulties following the first contact.";
    
    const causalityResult = validateCausality(narrative, mockEvent, mockCivilization);
    const constraintResult = validateConstraints(narrative, mockCivilization, mockEvent);

    expect(causalityResult).toHaveProperty("isValid");
    expect(constraintResult).toHaveProperty("isValid");
  });
});
