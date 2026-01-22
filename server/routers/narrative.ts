/**
 * tRPC Router for Narrative Engine
 * Exposes generation engines and validation systems
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  HarmonicNetworkEngine,
  EvolutionaryAdaptationEngine,
  ConsciousnessAwareValidator,
  LLMNarrativeGenerator,
  FigureGenerator,
  InfluencePropagation,
} from "../engines/narrativeEngine";
import type { CivilizationState, EventNode, NotableFigure } from "../../types/narrative";

/**
 * Narrative Engine Router
 */
export const narrativeRouter = router({
  /**
   * Generate event narrative with LLM
   */
  generateEventNarrative: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        eventTitle: z.string(),
        eventType: z.string(),
        eventYear: z.number(),
        eventImportance: z.number(),
        civilizationId: z.number(),
        civilizationName: z.string(),
        civilizationStatus: z.string(),
        technologyLevel: z.number(),
        recentEventTitles: z.array(z.string()),
        historicalContext: z.string(),
      })
    )
    .query(async ({ input }) => {
      const generator = new LLMNarrativeGenerator();
      const civilization: Partial<CivilizationState> = {
        id: input.civilizationId,
        name: input.civilizationName,
        status: input.civilizationStatus,
        technologyLevel: input.technologyLevel,
        strategy: {
          expansionist: 0.5,
          peaceful: 0.5,
          innovative: 0.5,
          cultural: 0.5,
        },
        resources: {
          population: 1000000000,
          food: 100,
          technology: 100,
          culture: 100,
          military: 100,
        },
        militaryStrength: 5,
        culturalInfluence: 5,
        currentYear: 2000,
        foundedYear: 1000,
        unityCoefficient: 0.7,
      };

      const event: Partial<EventNode> = {
        id: input.eventId,
        title: input.eventTitle,
        eventType: input.eventType,
        year: input.eventYear,
        importance: input.eventImportance,
        description: `${input.eventTitle} occurred in year ${input.eventYear}`,
        narrative: "",
        involvedCivilizations: [input.civilizationId],
        involvedSpecies: [],
        involvedFigures: [],
        causes: [],
        consequences: [],
        causalStrength: 0.7,
        harmonyFrequency: 528,
        phaseCoherence: 0.8,
        resonanceVector: { sound: 0.5, light: 0.5, time: 0.5 },
        unityCoefficient: 0.7,
        constraintSatisfaction: 0.9,
        sacredGapScore: 0.5,
        generatedBy: "llm",
        confidenceScore: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const narrative = await generator.generateEventNarrative(
        event as EventNode,
        civilization as CivilizationState,
        {
          recentEvents: input.recentEventTitles.map((title, idx) => ({
            id: `event_${idx}`,
            title,
            year: input.eventYear - (idx + 1) * 10,
            description: title,
            narrative: "",
            causes: [],
            consequences: [],
            causalStrength: 0.5,
            harmonyFrequency: 528,
            phaseCoherence: 0.5,
            resonanceVector: { sound: 0.5, light: 0.5, time: 0.5 },
            unityCoefficient: 0.5,
            constraintSatisfaction: 0.8,
            sacredGapScore: 0.3,
            involvedCivilizations: [],
            involvedSpecies: [],
            involvedFigures: [],
            eventType: "historical",
            importance: 5,
            generatedBy: "cascade",
            confidenceScore: 0.7,
            galaxyId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          historicalContext: input.historicalContext,
        }
      );

      return { narrative };
    }),

  /**
   * Generate a notable figure
   */
  generateFigure: publicProcedure
    .input(
      z.object({
        archetype: z.string(),
        civilizationName: z.string(),
        birthYear: z.number(),
        currentYear: z.number(),
      })
    )
    .query(async ({ input }) => {
      const generator = new FigureGenerator();
      const civilization: Partial<CivilizationState> = {
        name: input.civilizationName,
        currentYear: input.currentYear,
        status: "classical",
        technologyLevel: 5,
        strategy: {
          expansionist: 0.5,
          peaceful: 0.5,
          innovative: 0.5,
          cultural: 0.5,
        },
        resources: {
          population: 1000000000,
          food: 100,
          technology: 100,
          culture: 100,
          military: 100,
        },
        militaryStrength: 5,
        culturalInfluence: 5,
        foundedYear: 1000,
        unityCoefficient: 0.7,
      };

      const figure = await generator.generateFigure(
        input.archetype,
        civilization as CivilizationState,
        input.birthYear
      );

      return {
        name: figure.name,
        archetype: figure.archetype,
        birthYear: figure.birthYear,
        attributes: figure.attributes,
      };
    }),

  /**
   * Calculate civilization fitness
   */
  calculateFitness: publicProcedure
    .input(
      z.object({
        population: z.number(),
        food: z.number(),
        technology: z.number(),
        culture: z.number(),
        military: z.number(),
        militaryStrength: z.number(),
        culturalInfluence: z.number(),
        technologyLevel: z.number(),
        unityCoefficient: z.number(),
      })
    )
    .query(({ input }) => {
      const engine = new EvolutionaryAdaptationEngine();
      const civilization: CivilizationState = {
        id: 1,
        galaxyId: 1,
        speciesId: 1,
        name: "Test",
        foundedYear: 1000,
        currentYear: 2000,
        status: "classical",
        resources: {
          population: input.population,
          food: input.food,
          technology: input.technology,
          culture: input.culture,
          military: input.military,
        },
        strategy: {
          expansionist: 0.5,
          peaceful: 0.5,
          innovative: 0.5,
          cultural: 0.5,
        },
        technologyLevel: input.technologyLevel,
        militaryStrength: input.militaryStrength,
        culturalInfluence: input.culturalInfluence,
        unityCoefficient: input.unityCoefficient,
      };

      const fitness = engine.calculateFitness(civilization);
      return {
        survival: Math.round(fitness.survival * 100),
        cultural: Math.round(fitness.cultural * 100),
        technological: Math.round(fitness.technological * 100),
        expansion: Math.round(fitness.expansion * 100),
      };
    }),

  /**
   * Validate event authenticity
   */
  validateEventAuthenticity: publicProcedure
    .input(
      z.object({
        eventType: z.string(),
        eventImportance: z.number(),
        technologyLevel: z.number(),
        militaryStrength: z.number(),
        population: z.number(),
        unityCoefficient: z.number(),
      })
    )
    .query(({ input }) => {
      const validator = new ConsciousnessAwareValidator();
      const civilization: CivilizationState = {
        id: 1,
        galaxyId: 1,
        speciesId: 1,
        name: "Test",
        foundedYear: 1000,
        currentYear: 2000,
        status: "classical",
        resources: {
          population: input.population,
          food: 100,
          technology: 100,
          culture: 100,
          military: 100,
        },
        strategy: {
          expansionist: 0.5,
          peaceful: 0.5,
          innovative: 0.5,
          cultural: 0.5,
        },
        technologyLevel: input.technologyLevel,
        militaryStrength: input.militaryStrength,
        culturalInfluence: 5,
        unityCoefficient: input.unityCoefficient,
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
        eventType: input.eventType,
        importance: input.eventImportance,
        generatedBy: "llm",
        confidenceScore: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const unityCoeff = validator.calculateUnityCoefficient(event, civilization);
      const constraints = validator.validateConstraints(event, civilization);
      const sacredGaps = validator.identifySacredGaps(event);
      const authenticity = validator.calculateAuthenticityScore(event, civilization);

      return {
        unityCoefficient: Math.round(unityCoeff * 100),
        constraintSatisfaction: constraints.violations.length === 0 ? 100 : Math.max(0, 100 - constraints.violations.length * 20),
        sacredGapScore: Math.round(Math.min(1, sacredGaps.length * 0.15) * 100),
        authenticityScore: Math.round(authenticity * 100),
        violations: constraints.violations,
      };
    }),

  /**
   * Detect event opportunities
   */
  detectOpportunities: publicProcedure
    .input(
      z.object({
        civilizationName: z.string(),
        status: z.string(),
        technologyLevel: z.number(),
        population: z.number(),
        militaryStrength: z.number(),
        culturalInfluence: z.number(),
        unityCoefficient: z.number(),
        expansionistStrategy: z.number(),
        peacefulStrategy: z.number(),
        innovativeStrategy: z.number(),
        culturalStrategy: z.number(),
      })
    )
    .query(({ input }) => {
      const generator = new LLMNarrativeGenerator();
      const civilization: CivilizationState = {
        id: 1,
        galaxyId: 1,
        speciesId: 1,
        name: input.civilizationName,
        foundedYear: 1000,
        currentYear: 2000,
        status: input.status,
        resources: {
          population: input.population,
          food: 100,
          technology: 100,
          culture: 100,
          military: 100,
        },
        strategy: {
          expansionist: input.expansionistStrategy,
          peaceful: input.peacefulStrategy,
          innovative: input.innovativeStrategy,
          cultural: input.culturalStrategy,
        },
        technologyLevel: input.technologyLevel,
        militaryStrength: input.militaryStrength,
        culturalInfluence: input.culturalInfluence,
        unityCoefficient: input.unityCoefficient,
      };

      const opportunities = generator.detectOpportunities(civilization);
      return {
        opportunities: opportunities.map(opp => ({
          type: opp.type,
          reason: opp.reason,
          priority: Math.round(opp.priority * 100),
        })),
      };
    }),
});
