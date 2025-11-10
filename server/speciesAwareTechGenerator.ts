/**
 * Species-Aware Technology Generator
 * Generates realistic, contextual technologies based on:
 * - Species physiology and biology
 * - Environmental constraints and resources
 * - Cultural traits and values
 * - Existing technology prerequisites
 * - Historical events and discoveries
 */

import { invokeLLM } from "./_core/llm";

export interface SpeciesProfile {
  id: number;
  name: string;
  physicalDescription: string;
  homeworldType: "terrestrial" | "aquatic" | "desert" | "ice" | "volcanic" | "gas-giant" | "moon";
  traits: string[]; // e.g., ["aggressive", "peaceful", "innovative", "spiritual", "hive-mind"]
  culturalDescription: string;
  physiology: {
    baseForm: "humanoid" | "insectoid" | "aquatic" | "crystalline" | "gaseous" | "silicon-based" | "hive";
    primarySense: "vision" | "echolocation" | "electromagnetic" | "chemical" | "thermal" | "psionic";
    lifespan: number; // in years
    reproductionRate: "slow" | "moderate" | "fast";
    groupSize: "solitary" | "small-family" | "tribe" | "hive" | "collective";
  };
  environment: {
    gravity: "low" | "normal" | "high";
    temperature: "extreme-cold" | "cold" | "temperate" | "hot" | "extreme-hot";
    atmosphere: "thin" | "normal" | "dense" | "toxic" | "exotic";
    water: "none" | "scarce" | "abundant" | "dominant";
    radiation: "low" | "moderate" | "high";
    resources: string[]; // e.g., ["metals", "crystals", "organic-compounds", "rare-elements"]
  };
}

export interface GeneratedTechnology {
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
  realismScore: number; // 0-10, how logically consistent with species
}

export interface TechnologyEra {
  name: string;
  yearRange: [number, number];
  description: string;
  technologies: GeneratedTechnology[];
  majorMilestones: string[];
  culturalShifts: string[];
}

/**
 * Species-Aware Technology Generator
 */
export class SpeciesAwareTechGenerator {
  /**
   * Generate a complete technology tree for a species
   */
  async generateTechnologyTree(
    species: SpeciesProfile,
    simulationYears: number
  ): Promise<TechnologyEra[]> {
    console.log(`[Tech Generator] Generating technology tree for ${species.name}`);

    const eras: TechnologyEra[] = [];

    // Phase 1: Primitive Era (0-10% of timeline)
    eras.push(await this.generatePrimitiveEra(species, simulationYears));

    // Phase 2: Early Development Era (10-25% of timeline)
    eras.push(await this.generateEarlyDevelopmentEra(species, simulationYears, eras[0]));

    // Phase 3: Specialization Era (25-50% of timeline)
    eras.push(await this.generateSpecializationEra(species, simulationYears, eras));

    // Phase 4: Refinement Era (50-75% of timeline)
    eras.push(await this.generateRefinementEra(species, simulationYears, eras));

    // Phase 5: Advanced Era (75-90% of timeline)
    eras.push(await this.generateAdvancedEra(species, simulationYears, eras));

    // Phase 6: Transcendence Era (90-100% of timeline)
    eras.push(await this.generateTranscendenceEra(species, simulationYears, eras));

    return eras;
  }

  /**
   * Generate Primitive Era - Basic survival and tool use
   */
  private async generatePrimitiveEra(
    species: SpeciesProfile,
    simulationYears: number
  ): Promise<TechnologyEra> {
    const eraStart = 0;
    const eraEnd = Math.floor(simulationYears * 0.1);

    const prompt = this.buildPrimitiveEraPrompt(species);

    const technologies = await this.generateTechnologiesForEra(
      species,
      prompt,
      "primitive",
      eraStart,
      eraEnd,
      []
    );

    return {
      name: "Primitive Era",
      yearRange: [eraStart, eraEnd],
      description: `The ${species.name} discover basic tools and survival techniques suited to their ${species.environment.temperature} ${species.homeworldType} environment.`,
      technologies,
      majorMilestones: [
        "First tool creation",
        "Fire/energy discovery",
        "Basic shelter construction",
        "Primitive communication systems",
      ],
      culturalShifts: [
        "Development of basic social structures",
        "Emergence of storytelling traditions",
        "First spiritual/religious concepts",
      ],
    };
  }

  /**
   * Generate Early Development Era - Agriculture, settlements, organized society
   */
  private async generateEarlyDevelopmentEra(
    species: SpeciesProfile,
    simulationYears: number,
    previousEra: TechnologyEra
  ): Promise<TechnologyEra> {
    const eraStart = Math.floor(simulationYears * 0.1);
    const eraEnd = Math.floor(simulationYears * 0.25);

    const prompt = this.buildEarlyDevelopmentPrompt(species, previousEra);

    const technologies = await this.generateTechnologiesForEra(
      species,
      prompt,
      "early-development",
      eraStart,
      eraEnd,
      previousEra.technologies.map((t) => t.id)
    );

    return {
      name: "Early Development Era",
      yearRange: [eraStart, eraEnd],
      description: `The ${species.name} develop organized settlements and resource management systems.`,
      technologies,
      majorMilestones: [
        "Settlement establishment",
        "Resource cultivation/harvesting",
        "Trade networks formation",
        "Organized governance structures",
      ],
      culturalShifts: [
        "Formalization of belief systems",
        "Development of art and music",
        "Establishment of social hierarchies",
      ],
    };
  }

  /**
   * Generate Specialization Era - Focus on species-specific advantages
   */
  private async generateSpecializationEra(
    species: SpeciesProfile,
    simulationYears: number,
    previousEras: TechnologyEra[]
  ): Promise<TechnologyEra> {
    const eraStart = Math.floor(simulationYears * 0.25);
    const eraEnd = Math.floor(simulationYears * 0.5);

    const prompt = this.buildSpecializationPrompt(species, previousEras);

    const allPreviousTechs = previousEras.flatMap((era) => era.technologies.map((t) => t.id));
    const technologies = await this.generateTechnologiesForEra(
      species,
      prompt,
      "specialization",
      eraStart,
      eraEnd,
      allPreviousTechs
    );

    return {
      name: "Specialization Era",
      yearRange: [eraStart, eraEnd],
      description: `The ${species.name} develop technologies that leverage their unique physiology and environment.`,
      technologies,
      majorMilestones: [
        "Mastery of environmental adaptation",
        "Development of species-specific tools",
        "Advanced resource processing",
        "Specialized knowledge systems",
      ],
      culturalShifts: [
        "Cultural identity crystallization",
        "Philosophical schools emerge",
        "Artistic traditions flourish",
      ],
    };
  }

  /**
   * Generate Refinement Era - Optimization and interconnection
   */
  private async generateRefinementEra(
    species: SpeciesProfile,
    simulationYears: number,
    previousEras: TechnologyEra[]
  ): Promise<TechnologyEra> {
    const eraStart = Math.floor(simulationYears * 0.5);
    const eraEnd = Math.floor(simulationYears * 0.75);

    const prompt = this.buildRefinementPrompt(species, previousEras);

    const allPreviousTechs = previousEras.flatMap((era) => era.technologies.map((t) => t.id));
    const technologies = await this.generateTechnologiesForEra(
      species,
      prompt,
      "refinement",
      eraStart,
      eraEnd,
      allPreviousTechs
    );

    return {
      name: "Refinement Era",
      yearRange: [eraStart, eraEnd],
      description: `The ${species.name} refine and interconnect their technologies into sophisticated systems.`,
      technologies,
      majorMilestones: [
        "Integration of technologies into systems",
        "Advanced energy manipulation",
        "Communication across distances",
        "Information storage and retrieval",
      ],
      culturalShifts: [
        "Scientific method development",
        "Institutional knowledge preservation",
        "Cross-cultural exchange",
      ],
    };
  }

  /**
   * Generate Advanced Era - Complex systems and space exploration
   */
  private async generateAdvancedEra(
    species: SpeciesProfile,
    simulationYears: number,
    previousEras: TechnologyEra[]
  ): Promise<TechnologyEra> {
    const eraStart = Math.floor(simulationYears * 0.75);
    const eraEnd = Math.floor(simulationYears * 0.9);

    const prompt = this.buildAdvancedPrompt(species, previousEras);

    const allPreviousTechs = previousEras.flatMap((era) => era.technologies.map((t) => t.id));
    const technologies = await this.generateTechnologiesForEra(
      species,
      prompt,
      "advanced",
      eraStart,
      eraEnd,
      allPreviousTechs
    );

    return {
      name: "Advanced Era",
      yearRange: [eraStart, eraEnd],
      description: `The ${species.name} achieve advanced technological capabilities including spaceflight.`,
      technologies,
      majorMilestones: [
        "Spaceflight achievement",
        "Planetary colonization",
        "Advanced energy sources",
        "Artificial intelligence/consciousness",
      ],
      culturalShifts: [
        "Expansion of philosophical horizons",
        "Potential contact with other species",
        "Existential questions about their place in universe",
      ],
    };
  }

  /**
   * Generate Transcendence Era - Post-biological or transcendent technologies
   */
  private async generateTranscendenceEra(
    species: SpeciesProfile,
    simulationYears: number,
    previousEras: TechnologyEra[]
  ): Promise<TechnologyEra> {
    const eraStart = Math.floor(simulationYears * 0.9);
    const eraEnd = simulationYears;

    const prompt = this.buildTranscendencePrompt(species, previousEras);

    const allPreviousTechs = previousEras.flatMap((era) => era.technologies.map((t) => t.id));
    const technologies = await this.generateTechnologiesForEra(
      species,
      prompt,
      "transcendence",
      eraStart,
      eraEnd,
      allPreviousTechs
    );

    return {
      name: "Transcendence Era",
      yearRange: [eraStart, eraEnd],
      description: `The ${species.name} approach or achieve transcendence through technology and consciousness evolution.`,
      technologies,
      majorMilestones: [
        "Consciousness uploading/transfer",
        "Post-biological existence",
        "Reality manipulation",
        "Dimensional/multiverse access",
      ],
      culturalShifts: [
        "Redefinition of identity and existence",
        "Merger with artificial intelligence",
        "Transcendence of physical limitations",
      ],
    };
  }

  /**
   * Generate technologies for a specific era
   */
  private async generateTechnologiesForEra(
    species: SpeciesProfile,
    prompt: string,
    eraType: string,
    eraStart: number,
    eraEnd: number,
    prerequisites: string[]
  ): Promise<GeneratedTechnology[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a xenotech specialist designing realistic alien technologies. 
Generate technologies that are logically consistent with the species' physiology, environment, and culture.
Consider realistic prerequisite chains and environmental constraints.
Make technologies feel alien but scientifically plausible.`,
          },
          { role: "user", content: prompt as string },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "technology_generation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                technologies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      category: { type: "string" },
                      complexity: { type: "integer", minimum: 0, maximum: 100 },
                      applicationsAndConsequences: {
                        type: "array",
                        items: { type: "string" },
                      },
                      speciesAdaptations: {
                        type: "array",
                        items: { type: "string" },
                      },
                      culturalSignificance: { type: "string" },
                      environmentalDependency: { type: "string" },
                      realismScore: { type: "integer", minimum: 0, maximum: 10 },
                    },
                    required: [
                      "name",
                      "description",
                      "category",
                      "complexity",
                      "applicationsAndConsequences",
                      "speciesAdaptations",
                      "culturalSignificance",
                      "environmentalDependency",
                      "realismScore",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["technologies"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.warn(`[Tech Generator] No technologies returned for ${eraType} era`);
        return [];
      }

      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);
      const techData = parsed.technologies || [];

      // Convert to GeneratedTechnology objects with IDs and year distribution
      const technologies: GeneratedTechnology[] = techData.map((tech: any, index: number) => ({
        id: `${species.name.toLowerCase()}-${eraType}-${index}`,
        name: tech.name,
        description: tech.description,
        category: tech.category,
        complexity: tech.complexity,
        prerequisites: prerequisites.slice(0, Math.max(1, Math.floor(tech.complexity / 30))),
        yearDiscovered: eraStart + Math.floor((eraEnd - eraStart) * (index / techData.length)),
        applicationsAndConsequences: tech.applicationsAndConsequences,
        speciesAdaptations: tech.speciesAdaptations,
        culturalSignificance: tech.culturalSignificance,
        environmentalDependency: tech.environmentalDependency,
        realismScore: tech.realismScore,
      }));

      console.log(
        `[Tech Generator] Generated ${technologies.length} technologies for ${eraType} era`
      );
      return technologies;
    } catch (error) {
      console.error(`[Tech Generator] Error generating technologies for ${eraType} era:`, error);
      return [];
    }
  }

  /**
   * Build prompt for Primitive Era
   */
  private buildPrimitiveEraPrompt(species: SpeciesProfile): string {
    return `Generate 5-8 primitive technologies for the ${species.name}, a ${species.physiology.baseForm} species living on a ${species.environment.temperature} ${species.homeworldType} world.

Species Traits: ${species.traits.join(", ")}
Primary Sense: ${species.physiology.primarySense}
Environment: ${species.environment.gravity} gravity, ${species.environment.atmosphere} atmosphere, ${species.environment.temperature} temperature
Available Resources: ${species.environment.resources.join(", ")}

Generate technologies that:
1. Are appropriate for a pre-industrial species
2. Leverage their primary sense and physiology
3. Address survival in their specific environment
4. Reflect their cultural traits (e.g., spiritual species might develop ritual tools)
5. Use only locally available resources

For example:
- An aquatic species might develop hydrodynamic tools instead of wheels
- A silicon-based species might develop crystalline computation
- A spiritual species might develop tools for divine communion
- A hive-mind species might develop collective coordination techniques

Return as JSON with: name, description, category, complexity (0-100), applicationsAndConsequences (array), speciesAdaptations (array), culturalSignificance, environmentalDependency, realismScore (0-10)`;
  }

  /**
   * Build prompt for Early Development Era
   */
  private buildEarlyDevelopmentPrompt(
    species: SpeciesProfile,
    previousEra: TechnologyEra
  ): string {
    const previousTechs = previousEra.technologies.map((t) => t.name).join(", ");

    return `Generate 6-10 technologies for the Early Development Era of the ${species.name}.

Previous Era Technologies: ${previousTechs}
Species Traits: ${species.traits.join(", ")}
Environment: ${species.environment.temperature} ${species.homeworldType}

These technologies should:
1. Build logically on previous era technologies
2. Enable settlement and organized society
3. Reflect their unique environment and physiology
4. Support their cultural values (e.g., spiritual species develop ritual infrastructure)
5. Create realistic prerequisite chains

Examples for different species:
- Aquatic species: Water current harnessing, pressure-resistant structures, bioluminescent navigation
- Desert species: Water conservation systems, heat-resistant materials, sand-based construction
- Hive-mind species: Collective communication networks, synchronized work systems
- Spiritual species: Sacred site construction, divination tools, ritual technology

Return as JSON with: name, description, category, complexity, applicationsAndConsequences, speciesAdaptations, culturalSignificance, environmentalDependency, realismScore`;
  }

  /**
   * Build prompt for Specialization Era
   */
  private buildSpecializationPrompt(
    species: SpeciesProfile,
    previousEras: TechnologyEra[]
  ): string {
    const allTechs = previousEras.flatMap((era) => era.technologies.map((t) => t.name)).join(", ");

    return `Generate 8-12 specialized technologies for the Specialization Era of the ${species.name}.

All Previous Technologies: ${allTechs}
Species Physiology: ${species.physiology.baseForm}, primary sense: ${species.physiology.primarySense}
Environment: ${species.environment.temperature} ${species.homeworldType}, gravity: ${species.environment.gravity}
Cultural Traits: ${species.traits.join(", ")}

This era focuses on technologies that:
1. Exploit the species' unique biological advantages
2. Overcome environmental limitations creatively
3. Develop specialized knowledge systems
4. Deepen cultural expression through technology
5. Create economic/social specialization

Species-Specific Examples:
- Crystalline species: Develop resonance-based computation, light-based communication, geometric architecture
- Aquatic species: Develop pressure-based energy, bioluminescent technology, water-current navigation
- Aerial species: Develop wind-riding technology, altitude-based architecture, atmospheric manipulation
- Psionic species: Develop mind-interface technology, thought-based computing, consciousness networks
- Spiritual species: Develop divine-resonance technology, consciousness-expansion tools, spiritual computing

Return as JSON with: name, description, category, complexity, applicationsAndConsequences, speciesAdaptations, culturalSignificance, environmentalDependency, realismScore`;
  }

  /**
   * Build prompt for Refinement Era
   */
  private buildRefinementPrompt(
    species: SpeciesProfile,
    previousEras: TechnologyEra[]
  ): string {
    const allTechs = previousEras.flatMap((era) => era.technologies.map((t) => t.name)).join(", ");

    return `Generate 10-15 refined technologies for the Refinement Era of the ${species.name}.

All Previous Technologies: ${allTechs}
Species: ${species.name} (${species.physiology.baseForm})

This era features:
1. Integration of previous technologies into cohesive systems
2. Advanced energy manipulation and control
3. Long-distance communication systems
4. Information storage and processing
5. Early automation and mechanical systems

Consider how their unique traits enable different approaches:
- Hive-mind species develop networked consciousness systems
- Spiritual species develop technology that bridges physical and spiritual realms
- Aggressive species develop efficient resource extraction
- Peaceful species develop sustainable systems
- Innovative species develop experimental technologies

Return as JSON with: name, description, category, complexity, applicationsAndConsequences, speciesAdaptations, culturalSignificance, environmentalDependency, realismScore`;
  }

  /**
   * Build prompt for Advanced Era
   */
  private buildAdvancedPrompt(
    species: SpeciesProfile,
    previousEras: TechnologyEra[]
  ): string {
    const allTechs = previousEras.flatMap((era) => era.technologies.map((t) => t.name)).join(", ");

    return `Generate 8-12 advanced technologies for the Advanced Era of the ${species.name}.

All Previous Technologies: ${allTechs}

This era includes:
1. Spaceflight and space travel
2. Planetary colonization technology
3. Advanced energy sources (fusion, antimatter, exotic matter)
4. Artificial intelligence or machine consciousness
5. Advanced materials and manufacturing

Species-Specific Approaches:
- Aquatic species might develop water-based spacecraft or dimensional travel
- Psionic species might develop consciousness-based propulsion
- Spiritual species might develop transcendence-enabling technology
- Hive-mind species might develop collective space exploration

Return as JSON with: name, description, category, complexity, applicationsAndConsequences, speciesAdaptations, culturalSignificance, environmentalDependency, realismScore`;
  }

  /**
   * Build prompt for Transcendence Era
   */
  private buildTranscendencePrompt(
    species: SpeciesProfile,
    previousEras: TechnologyEra[]
  ): string {
    const allTechs = previousEras.flatMap((era) => era.technologies.map((t) => t.name)).join(", ");

    return `Generate 5-8 transcendent technologies for the Transcendence Era of the ${species.name}.

All Previous Technologies: ${allTechs}

This final era explores:
1. Consciousness uploading and digital existence
2. Post-biological transformation
3. Reality manipulation or dimensional access
4. Merging with artificial intelligence
5. Achieving godlike or transcendent status

Species-Specific Transcendence:
- Spiritual species achieve union with the divine
- Psionic species merge consciousness into collective superintelligence
- Crystalline species achieve perfect information encoding
- Hive-mind species become a singular unified consciousness
- Technological species merge with their creations

Return as JSON with: name, description, category, complexity, applicationsAndConsequences, speciesAdaptations, culturalSignificance, environmentalDependency, realismScore`;
  }
}

/**
 * Helper function to generate technology tree for a species
 */
export async function generateSpeciesTechnologyTree(
  species: SpeciesProfile,
  simulationYears: number
): Promise<TechnologyEra[]> {
  const generator = new SpeciesAwareTechGenerator();
  return generator.generateTechnologyTree(species, simulationYears);
}
