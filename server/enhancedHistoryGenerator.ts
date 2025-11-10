/**
 * Enhanced History Generator
 * Integrates species-aware technology generation with cascade engine
 * to create deeply interconnected, realistic galaxy histories
 */

import { invokeLLM } from "./_core/llm";
import { CascadeEngine, EventNode } from "./cascadeEngine";
import {
  SpeciesAwareTechGenerator,
  SpeciesProfile,
  TechnologyEra,
  GeneratedTechnology,
} from "./speciesAwareTechGenerator";

export interface SpeciesWithTechs extends SpeciesProfile {
  technologyEras: TechnologyEra[];
}

export interface EnhancedGalaxyHistory {
  galaxyId: number;
  species: SpeciesWithTechs[];
  events: EventNode[];
  cascade: ReturnType<CascadeEngine["toJSON"]>;
  statistics: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySpecies: Record<string, number>;
    majorTurningPoints: EventNode[];
    technologicalMilestones: GeneratedTechnology[];
    causalDepth: number;
    interconnectedness: number;
  };
}

/**
 * Enhanced History Generator
 */
export class EnhancedHistoryGenerator {
  private cascade: CascadeEngine;
  private techGenerator: SpeciesAwareTechGenerator;
  private eventCounter: number = 0;

  constructor() {
    this.cascade = new CascadeEngine();
    this.techGenerator = new SpeciesAwareTechGenerator();
  }

  /**
   * Generate complete enhanced galaxy history
   */
  async generateEnhancedGalaxyHistory(
    galaxyId: number,
    speciesProfiles: SpeciesProfile[],
    simulationYears: number
  ): Promise<EnhancedGalaxyHistory> {
    console.log(
      `[Enhanced Generator] Starting enhanced galaxy history for ${speciesProfiles.length} species`
    );

    // Step 1: Generate technology trees for each species
    const speciesWithTechs: SpeciesWithTechs[] = await Promise.all(
      speciesProfiles.map(async (species) => ({
        ...species,
        technologyEras: await this.techGenerator.generateTechnologyTree(species, simulationYears),
      }))
    );

    console.log(`[Enhanced Generator] Generated technology trees for all species`);

    // Step 2: Generate origin events for each species
    speciesWithTechs.forEach((species, index) => {
      this.generateSpeciesOriginEvent(species, index + 1);
    });

    // Step 3: Generate era-based events for each species
    for (const species of speciesWithTechs) {
      await this.generateSpeciesHistory(species, simulationYears);
    }

    // Step 4: Generate inter-species events (contact, conflict, alliance)
    await this.generateInterSpeciesEvents(speciesWithTechs, simulationYears);

    // Step 5: Validate and compile history
    const validation = this.cascade.validateCausality();
    if (!validation.valid) {
      console.warn("[Enhanced Generator] Causality warnings:", validation.errors);
    }

    return this.compileEnhancedHistory(galaxyId, speciesWithTechs);
  }

  /**
   * Generate origin event for a species
   */
  private generateSpeciesOriginEvent(species: SpeciesWithTechs, speciesId: number): void {
    const event: EventNode = {
      id: ++this.eventCounter,
      year: 0,
      title: `Origin of ${species.name}`,
      description: `The ${species.name} emerge as a sentient species on their ${species.environment.temperature} ${species.homeworldType} homeworld. ${species.culturalDescription}`,
      eventType: "species-origin",
      importance: 10,
      speciesIds: [speciesId],
      speciesNames: [species.name],
      speciesColors: [this.generateColorForSpecies(species)],
    };

    this.cascade.addEvent(event);
  }

  /**
   * Generate complete history for a species
   */
  private async generateSpeciesHistory(
    species: SpeciesWithTechs,
    simulationYears: number
  ): Promise<void> {
    console.log(`[Enhanced Generator] Generating history for ${species.name}`);

    for (const era of species.technologyEras) {
      await this.generateEraEvents(species, era, simulationYears);
    }
  }

  /**
   * Generate events for a specific era of a species
   */
  private async generateEraEvents(
    species: SpeciesWithTechs,
    era: TechnologyEra,
    simulationYears: number
  ): Promise<void> {
    const prompt = this.buildEraEventPrompt(species, era);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a historian specializing in alien civilizations. 
Generate historically plausible events that show the ${species.name} developing and adopting technologies.
Events should have realistic causes and consequences.
Consider social upheaval, resistance to change, and unintended consequences.`,
          },
          { role: "user", content: prompt as string },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "era_events",
            strict: true,
            schema: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      eventType: { type: "string" },
                      importance: { type: "integer", minimum: 0, maximum: 10 },
                      yearOffset: {
                        type: "integer",
                        minimum: 0,
                        maximum: 100,
                        description: "Percentage through the era (0-100)",
                      },
                      consequences: {
                        type: "array",
                        items: { type: "string" },
                        description: "What this event enables or causes",
                      },
                      conflictOrResistance: { type: "string" },
                      culturalImpact: { type: "string" },
                    },
                    required: [
                      "title",
                      "description",
                      "eventType",
                      "importance",
                      "yearOffset",
                      "consequences",
                      "conflictOrResistance",
                      "culturalImpact",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["events"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.warn(`[Enhanced Generator] No events returned for ${species.name} ${era.name}`);
        return;
      }

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      const eventData = parsed.events || [];

      // Create events from response
      eventData.forEach((eventInfo: any, index: number) => {
        const yearInEra = era.yearRange[0] + Math.floor((era.yearRange[1] - era.yearRange[0]) * (eventInfo.yearOffset / 100));

        const event: EventNode = {
          id: ++this.eventCounter,
          year: yearInEra,
          title: eventInfo.title,
          description: `${eventInfo.description}\n\nCultural Impact: ${eventInfo.culturalImpact}\nResistance/Conflict: ${eventInfo.conflictOrResistance}`,
          eventType: eventInfo.eventType || "civilization-event",
          importance: eventInfo.importance,
          speciesIds: [species.id],
          speciesNames: [species.name],
          speciesColors: [this.generateColorForSpecies(species)],
        };

        this.cascade.addEvent(event);

        // Add causal connections to previous events based on consequences
        if (eventInfo.consequences && eventInfo.consequences.length > 0) {
          // Find related previous events and create causal links
          const relatedTechs = era.technologies.filter((tech) =>
            eventInfo.consequences.some((cons: string) =>
              cons.toLowerCase().includes(tech.name.toLowerCase())
            )
          );

          relatedTechs.forEach((tech) => {
            // Create a causal link from technology discovery to this event
            this.cascade.addConnection(event.id - 1, event.id, 0.7, `Enabled by ${tech.name}`);
          });
        }
      });

      console.log(
        `[Enhanced Generator] Generated ${eventData.length} events for ${species.name} ${era.name}`
      );
    } catch (error) {
      console.error(
        `[Enhanced Generator] Error generating events for ${species.name} ${era.name}:`,
        error
      );
    }
  }

  /**
   * Generate inter-species events (contact, conflict, trade, alliance)
   */
  private async generateInterSpeciesEvents(
    species: SpeciesWithTechs[],
    simulationYears: number
  ): Promise<void> {
    if (species.length < 2) return;

    console.log(`[Enhanced Generator] Generating inter-species events`);

    const prompt = this.buildInterSpeciesPrompt(species, simulationYears);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a historian of alien civilizations. 
Generate realistic first contact and inter-species events.
Consider technological differences, cultural compatibility, and potential conflicts.
Events should be spread throughout the simulation timeline.`,
          },
          { role: "user", content: prompt as string },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "inter_species_events",
            strict: true,
            schema: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      eventType: { type: "string" },
                      importance: { type: "integer", minimum: 0, maximum: 10 },
                      yearPercentage: {
                        type: "integer",
                        minimum: 0,
                        maximum: 100,
                      },
                      speciesInvolved: {
                        type: "array",
                        items: { type: "string" },
                      },
                      outcome: { type: "string" },
                      longTermConsequences: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: [
                      "title",
                      "description",
                      "eventType",
                      "importance",
                      "yearPercentage",
                      "speciesInvolved",
                      "outcome",
                      "longTermConsequences",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["events"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.warn(`[Enhanced Generator] No inter-species events returned`);
        return;
      }

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      const eventData = parsed.events || [];

      eventData.forEach((eventInfo: any) => {
        const year = Math.floor(simulationYears * (eventInfo.yearPercentage / 100));
        const speciesIds = eventInfo.speciesInvolved
          .map((name: string) => species.findIndex((s) => s.name === name) + 1)
          .filter((id: number) => id > 0);

        if (speciesIds.length > 0) {
          const event: EventNode = {
            id: ++this.eventCounter,
            year,
            title: eventInfo.title,
            description: `${eventInfo.description}\n\nOutcome: ${eventInfo.outcome}\n\nLong-term Consequences: ${eventInfo.longTermConsequences.join(", ")}`,
            eventType: eventInfo.eventType || "inter-species-event",
            importance: eventInfo.importance,
            speciesIds,
            speciesNames: eventInfo.speciesInvolved,
            speciesColors: eventInfo.speciesInvolved.map((name: string) => {
              const spec = species.find((s) => s.name === name);
              return spec ? this.generateColorForSpecies(spec) : "#808080";
            }),
          };

          this.cascade.addEvent(event);
        }
      });

      console.log(`[Enhanced Generator] Generated ${eventData.length} inter-species events`);
    } catch (error) {
      console.error("[Enhanced Generator] Error generating inter-species events:", error);
    }
  }

  /**
   * Build prompt for era events
   */
  private buildEraEventPrompt(species: SpeciesWithTechs, era: TechnologyEra): string {
    const techs = era.technologies.map((t) => `${t.name} (${t.category})`).join(", ");

    return `Generate 4-8 significant historical events for the ${species.name} during their ${era.name} (years ${era.yearRange[0]}-${era.yearRange[1]}).

Species: ${species.name}
Traits: ${species.traits.join(", ")}
Environment: ${species.environment.temperature} ${species.homeworldType}
Physiology: ${species.physiology.baseForm}

Technologies Developed This Era: ${techs}

Events should:
1. Show the discovery or adoption of key technologies
2. Include social resistance or cultural conflict
3. Have realistic consequences that enable future developments
4. Reflect the species' unique values and constraints
5. Show both positive and negative outcomes

Examples:
- A spiritual species might have religious conflict over accepting new technology
- An aggressive species might weaponize new discoveries
- A peaceful species might use technology to strengthen cooperation
- A hive-mind species might experience collective consciousness evolution
- An aquatic species might adapt technologies to underwater use

Return as JSON with: title, description, eventType, importance (0-10), yearOffset (0-100), consequences (array), conflictOrResistance, culturalImpact`;
  }

  /**
   * Build prompt for inter-species events
   */
  private buildInterSpeciesPrompt(species: SpeciesWithTechs[], simulationYears: number): string {
    const speciesList = species
      .map(
        (s) =>
          `${s.name} (${s.traits.join(", ")}, tech level: ${s.technologyEras.length}/6)`
      )
      .join("; ");

    return `Generate 3-6 significant inter-species events for a galaxy containing: ${speciesList}

These events should:
1. Occur when species have developed spaceflight (roughly 75%+ through simulation)
2. Show first contact scenarios
3. Include both peaceful and conflictual interactions
4. Consider technological and cultural compatibility
5. Have cascading consequences

Possible event types:
- First Contact: Initial meeting between species
- Trade Agreement: Exchange of goods and knowledge
- War/Conflict: Competition for resources or ideological conflict
- Alliance: Formal cooperation between species
- Cultural Exchange: Sharing of art, philosophy, or religion
- Technological Theft: Espionage or forced technology transfer
- Joint Exploration: Collaborative space missions
- Existential Threat: Species unite against common danger

Return as JSON with: title, description, eventType, importance (0-10), yearPercentage (0-100), speciesInvolved (array), outcome, longTermConsequences (array)`;
  }

  /**
   * Compile enhanced history
   */
  private compileEnhancedHistory(
    galaxyId: number,
    speciesWithTechs: SpeciesWithTechs[]
  ): EnhancedGalaxyHistory {
    const cascadeData = this.cascade.toJSON();

    // Calculate statistics
    const eventsByType: Record<string, number> = {};
    const eventsBySpecies: Record<string, number> = {};

    cascadeData.events.forEach((event) => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

      event.speciesNames?.forEach((name) => {
        eventsBySpecies[name] = (eventsBySpecies[name] || 0) + 1;
      });
    });

    // Find major turning points
    const majorTurningPoints = cascadeData.events
      .map((event) => ({
        event,
        impact: this.cascade.propagateConsequences(event.id).size,
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 15)
      .map((item) => item.event);

    // Collect all technological milestones
    const technologicalMilestones = speciesWithTechs
      .flatMap((s) => s.technologyEras.flatMap((era) => era.technologies))
      .sort((a, b) => a.yearDiscovered - b.yearDiscovered);

    const stats = cascadeData.statistics;

    return {
      galaxyId,
      species: speciesWithTechs,
      events: cascadeData.events,
      cascade: cascadeData,
      statistics: {
        totalEvents: cascadeData.events.length,
        eventsByType,
        eventsBySpecies,
        majorTurningPoints,
        technologicalMilestones,
        causalDepth: stats.maxCausalDepth,
        interconnectedness: Math.round((stats.totalConnections / cascadeData.events.length) * 100),
      },
    };
  }

  /**
   * Generate a color for a species
   */
  private generateColorForSpecies(species: SpeciesProfile): string {
    // Create a deterministic color based on species name
    let hash = 0;
    for (let i = 0; i < species.name.length; i++) {
      hash = species.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
}

/**
 * Helper function to generate complete enhanced galaxy history
 */
export async function generateCompleteEnhancedHistory(
  galaxyId: number,
  speciesProfiles: SpeciesProfile[],
  simulationYears: number
): Promise<EnhancedGalaxyHistory> {
  const generator = new EnhancedHistoryGenerator();
  return generator.generateEnhancedGalaxyHistory(galaxyId, speciesProfiles, simulationYears);
}
