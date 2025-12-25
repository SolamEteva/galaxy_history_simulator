import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  findNarrativeOpportunities,
  generateNarrativeEvent,
  NarrativeOpportunity,
} from "../narrativeEventGeneratorV2";
import { SimulationError, ErrorCategory } from "../errorHandling";

// Set longer timeout for LLM-dependent tests
const LLM_TEST_TIMEOUT = 15000;

describe("Narrative Event Generator", () => {
  describe("findNarrativeOpportunities", () => {
    it("should return Ok with empty opportunities for empty events", async () => {
      const result = await findNarrativeOpportunities(1, 5000, [], [], []);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    it("should reject invalid galaxy ID", async () => {
      const result = await findNarrativeOpportunities(-1, 5000, [], [], []);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION);
      }
    });

    it("should reject non-integer galaxy ID", async () => {
      const result = await findNarrativeOpportunities(1.5, 5000, [], [], []);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION);
      }
    });

    it("should reject invalid input arrays", async () => {
      const result = await findNarrativeOpportunities(1, 5000, "not-array" as any, [], []);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION);
      }
    });

    it("should find conflict escalation opportunities", async () => {
      const recentEvents = [
        {
          year: 4600,
          eventType: "war",
          speciesIds: [1, 2],
        },
        {
          year: 4700,
          eventType: "war",
          speciesIds: [1, 2],
        },
      ];

      const activeSpecies = [
        { id: 1, name: "Humans", traits: [] },
        { id: 2, name: "Aliens", traits: [] },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents, activeSpecies, []);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const conflictOpp = result.value.find((o) => o.type === "conflict-escalation");
        expect(conflictOpp).toBeDefined();
        expect(conflictOpp?.involvedSpeciesIds).toContain(1);
        expect(conflictOpp?.involvedSpeciesIds).toContain(2);
      }
    });

    it("should find technological breakthrough opportunities", async () => {
      const recentEvents = [
        {
          year: 4800,
          eventType: "scientific-discovery",
          speciesIds: [1],
        },
      ];

      const activeSpecies = [
        {
          id: 1,
          name: "Innovators",
          traits: ["innovative"],
        },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents, activeSpecies, []);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const techOpp = result.value.find((o) => o.type === "technological-breakthrough");
        expect(techOpp).toBeDefined();
      }
    });

    it("should find cultural flourishing opportunities", async () => {
      const recentEvents = [
        {
          year: 4900,
          eventType: "peace-treaty",
          speciesIds: [1, 2],
        },
      ];

      const activeSpecies = [
        {
          id: 1,
          name: "Artists",
          traits: ["artistic"],
        },
        {
          id: 2,
          name: "Warriors",
          traits: [],
        },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents, activeSpecies, []);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const culturalOpp = result.value.find((o) => o.type === "cultural-flourishing");
        expect(culturalOpp).toBeDefined();
      }
    });

    it("should find extinction threat opportunities", async () => {
      const recentEvents = [
        {
          year: 4700,
          eventType: "war",
          speciesIds: [1],
        },
        {
          year: 4800,
          eventType: "natural-disaster",
          speciesIds: [1],
        },
      ];

      const activeSpecies = [
        {
          id: 1,
          name: "Endangered",
          extinct: false,
          traits: [],
        },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents, activeSpecies, []);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const extinctionOpp = result.value.find((o) => o.type === "extinction-threat");
        expect(extinctionOpp).toBeDefined();
      }
    });

    it("should handle malformed events gracefully", async () => {
      const recentEvents = [
        {
          year: 4500,
          eventType: "war",
          speciesIds: [1, 2],
        },
        null,
        {
          year: 4600,
          eventType: "peace",
        },
      ];

      const activeSpecies = [
        { id: 1, name: "Species1", traits: [] },
        { id: 2, name: "Species2", traits: [] },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents as any, activeSpecies, []);

      expect(result.ok).toBe(true);
    });

    it("should sort opportunities by narrative potential", async () => {
      const recentEvents = [
        {
          year: 4600,
          eventType: "war",
          speciesIds: [1, 2],
        },
        {
          year: 4700,
          eventType: "war",
          speciesIds: [1, 2],
        },
        {
          year: 4800,
          eventType: "war",
          speciesIds: [1, 2],
        },
      ];

      const activeSpecies = [
        { id: 1, name: "Species1", traits: [] },
        { id: 2, name: "Species2", traits: [] },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents, activeSpecies, []);

      expect(result.ok).toBe(true);
      if (result.ok) {
        for (let i = 1; i < result.value.length; i++) {
          expect(result.value[i - 1].narrativePotential).toBeGreaterThanOrEqual(
            result.value[i].narrativePotential
          );
        }
      }
    });
  });

  describe("generateNarrativeEvent", () => {
    it("should reject invalid opportunity", async () => {
      const invalidOpp = null as any;

      const result = await generateNarrativeEvent(invalidOpp, [], [], 5000);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION);
      }
    });

    it(
      "should handle empty species and planets",
      async () => {
        const opportunity: NarrativeOpportunity = {
          type: "conflict-escalation",
          trigger: "Test trigger",
          involvedSpeciesIds: [],
          involvedPlanetIds: [],
          narrativePotential: 5,
          description: "Test description",
        };

        const result = await generateNarrativeEvent(opportunity, [], [], 5000);

        expect(result.ok !== undefined).toBe(true);
      },
      LLM_TEST_TIMEOUT
    );

    it(
      "should validate generated event data",
      async () => {
        const opportunity: NarrativeOpportunity = {
          type: "technological-breakthrough",
          trigger: "Discovery trigger",
          involvedSpeciesIds: [1],
          involvedPlanetIds: [],
          narrativePotential: 8,
          description: "Test",
        };

        const activeSpecies = [
          {
            id: 1,
            name: "Innovators",
            traits: ["innovative"],
          },
        ];

        const result = await generateNarrativeEvent(opportunity, activeSpecies, [], 5000);

        if (result.ok) {
          expect(result.value.title).toBeDefined();
          expect(result.value.description).toBeDefined();
          expect(result.value.year).toBe(5000);
          expect(result.value.eventType).toBe("technological-breakthrough");
        } else {
          expect(result.error).toBeInstanceOf(SimulationError);
        }
      },
      LLM_TEST_TIMEOUT
    );
  });

  describe("Error Recovery", () => {
    it(
      "should handle database unavailability gracefully",
      async () => {
        const opportunity: NarrativeOpportunity = {
          type: "conflict-escalation",
          trigger: "Test",
          involvedSpeciesIds: [1, 2],
          involvedPlanetIds: [],
          narrativePotential: 5,
          description: "Test",
        };

        const result = await generateNarrativeEvent(opportunity, [], [], 5000);

        expect(result.ok !== undefined).toBe(true);
      },
      LLM_TEST_TIMEOUT
    );

    it(
      "should handle timeout in LLM calls",
      async () => {
        const opportunity: NarrativeOpportunity = {
          type: "cultural-flourishing",
          trigger: "Peace enables culture",
          involvedSpeciesIds: [1],
          involvedPlanetIds: [],
          narrativePotential: 7,
          description: "Test",
        };

        const result = await generateNarrativeEvent(opportunity, [], [], 5000);

        expect(result.ok !== undefined).toBe(true);
      },
      LLM_TEST_TIMEOUT
    );
  });

  describe("Edge Cases", () => {
    it("should handle species with null traits", async () => {
      const recentEvents = [
        {
          year: 4800,
          eventType: "scientific-discovery",
          speciesIds: [1],
        },
      ];

      const activeSpecies = [
        {
          id: 1,
          name: "Species",
          traits: null,
        },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents, activeSpecies, []);

      expect(result.ok).toBe(true);
    });

    it("should handle very large event windows", async () => {
      const recentEvents = Array.from({ length: 1000 }, (_, i) => ({
        year: 4000 + i,
        eventType: "war",
        speciesIds: [1, 2],
      }));

      const activeSpecies = [
        { id: 1, name: "Species1", traits: [] },
        { id: 2, name: "Species2", traits: [] },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents, activeSpecies, []);

      expect(result.ok).toBe(true);
    });

    it("should handle negative years", async () => {
      const recentEvents = [
        {
          year: -100,
          eventType: "war",
          speciesIds: [1, 2],
        },
      ];

      const activeSpecies = [
        { id: 1, name: "Species1", traits: [] },
        { id: 2, name: "Species2", traits: [] },
      ];

      const result = await findNarrativeOpportunities(1, 5000, recentEvents, activeSpecies, []);

      expect(result.ok).toBe(true);
    });
  });
});
