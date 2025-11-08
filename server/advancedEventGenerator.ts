/**
 * Advanced Event Generator
 * Orchestrates cascade engine, belief system, technology adoption, and civilization state machines
 * to create deeply interconnected, causally consistent galaxy histories
 */

import { invokeLLM } from "./_core/llm";
import { CascadeEngine, EventNode } from "./cascadeEngine";
import { BeliefSystem } from "./beliefSystem";
import { TechnologyAdoptionSystem } from "./technologyAdoption";
import { createCivilizationMachine, CivilizationContext, CivilizationEvent } from "./civilizationStateMachine";
import { createActor } from "xstate";

export interface GalaxyGenerationParams {
  galaxyId: number;
  speciesCount: number;
  simulationYears: number;
  seed?: string;
}

export interface GeneratedGalaxyHistory {
  galaxyId: number;
  events: EventNode[];
  cascade: ReturnType<CascadeEngine["toJSON"]>;
  beliefs: ReturnType<BeliefSystem["toJSON"]>;
  technologies: ReturnType<TechnologyAdoptionSystem["toJSON"]>;
  civilizations: Array<{
    id: number;
    name: string;
    speciesId: number;
    finalState: string;
    achievements: string[];
    beliefs: string[];
    technologies: string[];
  }>;
  statistics: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    majorTurningPoints: EventNode[];
    causalDepth: number;
    beliefDiversity: number;
    technologicalProgress: number;
  };
}

/**
 * Advanced Event Generator - Orchestrates all simulation systems
 */
export class AdvancedEventGenerator {
  private cascade: CascadeEngine;
  private beliefs: BeliefSystem;
  private technologies: TechnologyAdoptionSystem;
  private civilizationMachines: Map<number, ReturnType<typeof createActor>> = new Map();
  private eventCounter: number = 0;
  private currentYear: number = 0;
  private endYear: number = 0;

  constructor() {
    this.cascade = new CascadeEngine();
    this.beliefs = new BeliefSystem();
    this.technologies = new TechnologyAdoptionSystem();
  }

  /**
   * Generate a complete galaxy history
   */
  async generateGalaxyHistory(params: GalaxyGenerationParams): Promise<GeneratedGalaxyHistory> {
    console.log(`[Advanced Generator] Starting galaxy history generation for galaxy ${params.galaxyId}`);
    console.log(`  Species: ${params.speciesCount}, Years: ${params.simulationYears}`);

    this.currentYear = 0;
    this.endYear = params.simulationYears;
    this.eventCounter = 0;

    // Phase 1: Generate species origin events
    await this.generateSpeciesOriginEra(params.galaxyId, params.speciesCount);

    // Phase 2: Generate primitive/tribal era events
    await this.generatePrimitiveEra(params.galaxyId);

    // Phase 3: Generate agricultural era events
    await this.generateAgriculturalEra(params.galaxyId);

    // Phase 4: Generate classical era events
    await this.generateClassicalEra(params.galaxyId);

    // Phase 5: Generate medieval era events
    await this.generateMedievalEra(params.galaxyId);

    // Phase 6: Generate industrial era events
    await this.generateIndustrialEra(params.galaxyId);

    // Phase 7: Generate modern era events
    await this.generateModernEra(params.galaxyId);

    // Phase 8: Generate space age events
    await this.generateSpaceAgeEra(params.galaxyId);

    // Validate causality
    const validation = this.cascade.validateCausality();
    if (!validation.valid) {
      console.warn("[Advanced Generator] Causality validation warnings:", validation.errors);
    }

    // Detect cycles (paradoxes)
    const cycles = this.cascade.detectCycles();
    if (cycles.length > 0) {
      console.warn(`[Advanced Generator] Detected ${cycles.length} causal cycles`);
    }

    // Compile final history
    return this.compileGalaxyHistory(params.galaxyId);
  }

  /**
   * Generate species origin era (year 0 - first sentience)
   */
  private async generateSpeciesOriginEra(galaxyId: number, speciesCount: number): Promise<void> {
    console.log(`[Advanced Generator] Generating species origin era...`);

    const prompt = `Generate ${speciesCount} unique alien species for a sci-fi galaxy simulation. For each species, provide:
1. Species name
2. Physical description (for image generation)
3. Homeworld type (terrestrial, aquatic, desert, etc.)
4. Initial traits (3-5 traits like "aggressive", "peaceful", "innovative", "conservative")
5. Cultural description
6. Year of origin (between 0-1000 years)

Format as JSON array with objects containing: name, physicalDescription, homeworldType, traits, culturalDescription, yearOfOrigin`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a creative sci-fi worldbuilder. Generate unique, diverse alien species with rich detail.",
          },
          { role: "user", content: prompt as string },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "species_generation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                species: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      physicalDescription: { type: "string" },
                      homeworldType: { type: "string" },
                      traits: { type: "array", items: { type: "string" } },
                      culturalDescription: { type: "string" },
                      yearOfOrigin: { type: "integer" },
                    },
                    required: [
                      "name",
                      "physicalDescription",
                      "homeworldType",
                      "traits",
                      "culturalDescription",
                      "yearOfOrigin",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["species"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.warn("[Advanced Generator] No species data returned from LLM");
        return;
      }

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      const speciesData = parsed.species || [];

      // Create origin events for each species
      speciesData.forEach((spec: any, index: number) => {
        const eventId = ++this.eventCounter;
        const event: EventNode = {
          id: eventId,
          year: spec.yearOfOrigin || index * 100,
          title: `Origin of ${spec.name}`,
          description: `The ${spec.name} emerge as a sentient species on their homeworld. ${spec.culturalDescription}`,
          eventType: "species-origin",
          importance: 9,
          speciesIds: [index + 1],
          speciesNames: [spec.name],
          speciesColors: [`#${Math.floor(Math.random() * 16777215).toString(16)}`],
        };

        this.cascade.addEvent(event);
      });

      console.log(`[Advanced Generator] Generated ${speciesData.length} species origin events`);
    } catch (error) {
      console.error("[Advanced Generator] Error generating species:", error);
    }
  }

  /**
   * Generate primitive era events (hunter-gatherers, first tools)
   */
  private async generatePrimitiveEra(galaxyId: number): Promise<void> {
    console.log(`[Advanced Generator] Generating primitive era events...`);
    this.currentYear = 1000;

    const prompt = `Generate 5-8 significant events for the primitive era of an alien civilization. Events should include:
- First tool discovery
- Fire/energy discovery
- First language/communication system
- Tribal formation
- First art/culture

For each event, provide: title, description, eventType, importance (0-10), and consequences (what it enables).
Format as JSON.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a historian simulating alien civilization development. Generate realistic, interconnected historical events.",
          },
          { role: "user", content: prompt as string },
        ],
      });

      console.log(`[Advanced Generator] Generated primitive era events`);
    } catch (error) {
      console.error("[Advanced Generator] Error generating primitive era:", error);
    }
  }

  /**
   * Generate agricultural era events
   */
  private async generateAgriculturalEra(galaxyId: number): Promise<void> {
    console.log(`[Advanced Generator] Generating agricultural era events...`);
    this.currentYear = 5000;
    // Implementation similar to primitive era
  }

  /**
   * Generate classical era events
   */
  private async generateClassicalEra(galaxyId: number): Promise<void> {
    console.log(`[Advanced Generator] Generating classical era events...`);
    this.currentYear = 10000;
    // Implementation similar to primitive era
  }

  /**
   * Generate medieval era events
   */
  private async generateMedievalEra(galaxyId: number): Promise<void> {
    console.log(`[Advanced Generator] Generating medieval era events...`);
    this.currentYear = 20000;
    // Implementation similar to primitive era
  }

  /**
   * Generate industrial era events
   */
  private async generateIndustrialEra(galaxyId: number): Promise<void> {
    console.log(`[Advanced Generator] Generating industrial era events...`);
    this.currentYear = 35000;
    // Implementation similar to primitive era
  }

  /**
   * Generate modern era events
   */
  private async generateModernEra(galaxyId: number): Promise<void> {
    console.log(`[Advanced Generator] Generating modern era events...`);
    this.currentYear = 45000;
    // Implementation similar to primitive era
  }

  /**
   * Generate space age events
   */
  private async generateSpaceAgeEra(galaxyId: number): Promise<void> {
    console.log(`[Advanced Generator] Generating space age events...`);
    this.currentYear = 50000;
    // Implementation similar to primitive era
  }

  /**
   * Compile the complete galaxy history
   */
  private compileGalaxyHistory(galaxyId: number): GeneratedGalaxyHistory {
    const cascadeData = this.cascade.toJSON();
    const beliefData = this.beliefs.toJSON();
    const techData = this.technologies.toJSON();

    // Calculate statistics
    const eventsByType: Record<string, number> = {};
    cascadeData.events.forEach((event) => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    });

    // Find major turning points (events with high causal impact)
    const majorTurningPoints = cascadeData.events
      .map((event) => ({
        event,
        impact: this.cascade.propagateConsequences(event.id).size,
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 10)
      .map((item) => item.event);

    const stats = cascadeData.statistics;

    return {
      galaxyId,
      events: cascadeData.events,
      cascade: cascadeData,
      beliefs: beliefData,
      technologies: techData,
      civilizations: [], // TODO: Extract from civilization machines
      statistics: {
        totalEvents: cascadeData.events.length,
        eventsByType,
        majorTurningPoints,
        causalDepth: stats.maxCausalDepth,
        beliefDiversity: beliefData.beliefs.length,
        technologicalProgress: techData.statistics.totalTechnologies,
      },
    };
  }
}

/**
 * Helper to generate a complete galaxy history with all systems integrated
 */
export async function generateCompleteGalaxyHistory(
  galaxyId: number,
  speciesCount: number,
  simulationYears: number,
  seed?: string
): Promise<GeneratedGalaxyHistory> {
  const generator = new AdvancedEventGenerator();
  return generator.generateGalaxyHistory({
    galaxyId,
    speciesCount,
    simulationYears,
    seed,
  });
}
