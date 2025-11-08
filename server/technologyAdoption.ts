/**
 * Technology Adoption System
 * Models the adoption and diffusion of technologies using the Bass Model
 * and agent-based decision-making
 */

export interface Technology {
  id: string;
  name: string;
  description: string;
  category: "tool" | "agriculture" | "military" | "energy" | "computing" | "space";
  yearDiscovered: number;
  discovererSpeciesId: number;
  complexity: number; // 0-100, how complex to understand
  prerequisites: string[]; // Technology IDs that must be discovered first
  adoptionRate: number; // 0-1, how quickly it spreads
  adoptionThreshold: number; // 0-1, what % of population needs to adopt before it's mainstream
}

export interface TechnologyAdoptionState {
  technologyId: string;
  civilizationId: number;
  adoptionPercentage: number; // 0-1
  yearAdopted: number;
  yearFullyAdopted?: number;
  adoptionPhase: "innovators" | "early_adopters" | "early_majority" | "late_majority" | "laggards" | "mainstream";
}

/**
 * Bass Model for technology adoption
 * Classic S-curve model: p(t) = (p + q) * (1 - e^(-(p+q)*t)) / (1 + (q/p) * e^(-(p+q)*t))
 * p = coefficient of innovation (external influence)
 * q = coefficient of imitation (internal influence)
 */
export class BassModel {
  private p: number; // Coefficient of innovation (0.001-0.05)
  private q: number; // Coefficient of imitation (0.1-0.5)
  private adoptionPercentage: number = 0;
  private time: number = 0;

  constructor(adoptionRate: number = 0.8) {
    // Higher adoption rate = steeper curve
    this.p = 0.02 * adoptionRate; // Innovation coefficient
    this.q = 0.4 * adoptionRate; // Imitation coefficient
  }

  /**
   * Get adoption percentage at time t
   */
  getAdoptionAtTime(t: number): number {
    const numerator = 1 - Math.exp(-1 * (this.p + this.q) * t);
    const denominator = 1 + (this.q / this.p) * Math.exp(-1 * (this.p + this.q) * t);
    return numerator / denominator;
  }

  /**
   * Advance time by one step and get new adoption percentage
   */
  step(): number {
    this.time++;
    this.adoptionPercentage = this.getAdoptionAtTime(this.time);
    return this.adoptionPercentage;
  }

  /**
   * Get current adoption percentage
   */
  getCurrentAdoption(): number {
    return this.adoptionPercentage;
  }

  /**
   * Get current adoption phase
   */
  getAdoptionPhase(): TechnologyAdoptionState["adoptionPhase"] {
    const adoption = this.adoptionPercentage;

    if (adoption < 0.025) return "innovators"; // First 2.5%
    if (adoption < 0.16) return "early_adopters"; // Next 13.5%
    if (adoption < 0.5) return "early_majority"; // Next 34%
    if (adoption < 0.84) return "late_majority"; // Next 34%
    if (adoption < 0.975) return "laggards"; // Next 16%
    return "mainstream"; // Last 2.5%
  }

  /**
   * Get years until mainstream adoption
   */
  getYearsToMainstream(): number {
    // Find when adoption reaches 84% (mainstream threshold)
    let t = this.time;
    while (this.getAdoptionAtTime(t) < 0.84) {
      t++;
      if (t > 1000) break; // Prevent infinite loop
    }
    return t - this.time;
  }
}

/**
 * Technology Adoption System manages technology discovery and spread
 */
export class TechnologyAdoptionSystem {
  private technologies: Map<string, Technology> = new Map();
  private adoptionStates: Map<string, TechnologyAdoptionState[]> = new Map(); // tech -> adoptions
  private civilizationTechs: Map<number, Set<string>> = new Map(); // civ -> techs
  private bassModels: Map<string, Map<number, BassModel>> = new Map(); // tech -> civ -> model

  /**
   * Register a new technology
   */
  discoverTechnology(
    id: string,
    name: string,
    description: string,
    category: Technology["category"],
    year: number,
    discovererSpeciesId: number,
    complexity: number = 50,
    adoptionRate: number = 0.8,
    prerequisites: string[] = []
  ): Technology {
    if (this.technologies.has(id)) {
      throw new Error(`Technology ${id} already exists`);
    }

    const tech: Technology = {
      id,
      name,
      description,
      category,
      yearDiscovered: year,
      discovererSpeciesId,
      complexity,
      adoptionRate,
      adoptionThreshold: 0.5,
      prerequisites,
    };

    this.technologies.set(id, tech);
    this.adoptionStates.set(id, []);
    this.bassModels.set(id, new Map());

    return tech;
  }

  /**
   * A civilization discovers or adopts a technology
   */
  adoptTechnology(
    civilizationId: number,
    technologyId: string,
    year: number
  ): TechnologyAdoptionState | null {
    const tech = this.technologies.get(technologyId);
    if (!tech) {
      throw new Error(`Technology ${technologyId} not found`);
    }

    // Check prerequisites
    const civTechs = this.civilizationTechs.get(civilizationId) || new Set();
    const hasPrerequisites = tech.prerequisites.every((prereq) => civTechs.has(prereq));

    if (!hasPrerequisites) {
      return null; // Can't adopt without prerequisites
    }

    // Check if already adopted
    if (civTechs.has(technologyId)) {
      return null; // Already adopted
    }

    // Initialize Bass model for this civilization
    if (!this.bassModels.get(technologyId)!.has(civilizationId)) {
      this.bassModels.get(technologyId)!.set(civilizationId, new BassModel(tech.adoptionRate));
    }

    // Create adoption state
    const adoptionState: TechnologyAdoptionState = {
      technologyId,
      civilizationId,
      adoptionPercentage: 0.01, // Start with 1% adoption
      yearAdopted: year,
      adoptionPhase: "innovators",
    };

    this.adoptionStates.get(technologyId)!.push(adoptionState);

    if (!this.civilizationTechs.has(civilizationId)) {
      this.civilizationTechs.set(civilizationId, new Set());
    }
    this.civilizationTechs.get(civilizationId)!.add(technologyId);

    return adoptionState;
  }

  /**
   * Advance technology adoption by one time step
   */
  advanceAdoption(technologyId: string): void {
    const tech = this.technologies.get(technologyId);
    if (!tech) return;

    const adoptions = this.adoptionStates.get(technologyId) || [];
    const models = this.bassModels.get(technologyId) || new Map();

    adoptions.forEach((adoption) => {
      const model = models.get(adoption.civilizationId);
      if (model) {
        adoption.adoptionPercentage = model.step();
        adoption.adoptionPhase = model.getAdoptionPhase();

        // Mark as fully adopted when reaching mainstream
        if (adoption.adoptionPercentage >= tech.adoptionThreshold && !adoption.yearFullyAdopted) {
          adoption.yearFullyAdopted = adoption.yearAdopted + model.getYearsToMainstream();
        }
      }
    });
  }

  /**
   * Spread technology to neighboring/allied civilizations
   */
  spreadTechnology(
    fromCivilizationId: number,
    toCivilizationId: number,
    technologyId: string,
    year: number,
    spreadChance: number = 0.6
  ): boolean {
    const tech = this.technologies.get(technologyId);
    if (!tech) return false;

    // Check if source has the technology
    const sourceHasTech = this.civilizationTechs.get(fromCivilizationId)?.has(technologyId);
    if (!sourceHasTech) return false;

    // Check if target already has it
    const targetHasTech = this.civilizationTechs.get(toCivilizationId)?.has(technologyId);
    if (targetHasTech) return false;

    // Spread based on chance (modified by complexity)
    const actualChance = spreadChance * (1 - tech.complexity / 100);
    if (Math.random() < actualChance) {
      this.adoptTechnology(toCivilizationId, technologyId, year);
      return true;
    }

    return false;
  }

  /**
   * Get all technologies a civilization has
   */
  getCivilizationTechnologies(civilizationId: number): Technology[] {
    const techIds = this.civilizationTechs.get(civilizationId) || new Set();
    return Array.from(techIds)
      .map((id) => this.technologies.get(id)!)
      .sort((a, b) => a.yearDiscovered - b.yearDiscovered);
  }

  /**
   * Get adoption status of a technology in a civilization
   */
  getAdoptionStatus(
    civilizationId: number,
    technologyId: string
  ): TechnologyAdoptionState | null {
    const adoptions = this.adoptionStates.get(technologyId) || [];
    return adoptions.find((a) => a.civilizationId === civilizationId) || null;
  }

  /**
   * Get technology adoption curve (for visualization)
   */
  getAdoptionCurve(technologyId: string, civilizationId: number, years: number = 100): Array<{
    year: number;
    adoption: number;
    phase: TechnologyAdoptionState["adoptionPhase"];
  }> {
    const tech = this.technologies.get(technologyId);
    if (!tech) return [];

    const model = new BassModel(tech.adoptionRate);
    const curve: Array<{
      year: number;
      adoption: number;
      phase: TechnologyAdoptionState["adoptionPhase"];
    }> = [];

    for (let year = 0; year < years; year++) {
      curve.push({
        year,
        adoption: model.getAdoptionAtTime(year),
        phase: model.getAdoptionPhase(),
      });
      model.step();
    }

    return curve;
  }

  /**
   * Get technology dependency graph
   */
  getTechnologyDependencies(technologyId: string): {
    prerequisites: Technology[];
    dependents: Technology[];
  } {
    const tech = this.technologies.get(technologyId);
    if (!tech) return { prerequisites: [], dependents: [] };

    const prerequisites = tech.prerequisites
      .map((id) => this.technologies.get(id)!)
      .filter((t) => t);

    const dependents = Array.from(this.technologies.values()).filter((t) =>
      t.prerequisites.includes(technologyId)
    );

    return { prerequisites, dependents };
  }

  /**
   * Get technology statistics
   */
  getStatistics(): {
    totalTechnologies: number;
    technologiesByCategory: Record<string, number>;
    averageAdoptionTime: number;
    mostAdoptedTechnologies: Array<{ name: string; adoptions: number }>;
  } {
    const technologiesByCategory: Record<string, number> = {
      tool: 0,
      agriculture: 0,
      military: 0,
      energy: 0,
      computing: 0,
      space: 0,
    };

    let totalAdoptionTime = 0;
    let adoptionCount = 0;
    const mostAdopted: Array<{ name: string; adoptions: number }> = [];
    const self = this;

    self.technologies.forEach((tech) => {
      technologiesByCategory[tech.category]++;

      const adoptions = self.adoptionStates.get(tech.id) || [];
      adoptions.forEach((adoption) => {
        if (adoption.yearFullyAdopted) {
          totalAdoptionTime += adoption.yearFullyAdopted - adoption.yearAdopted;
          adoptionCount++;
        }
      });

      mostAdopted.push({ name: tech.name, adoptions: adoptions.length });
    });

    const sortedAdopted = mostAdopted.sort((a: { name: string; adoptions: number }, b: { name: string; adoptions: number }) => b.adoptions - a.adoptions);

    return {
      totalTechnologies: this.technologies.size,
      technologiesByCategory,
      averageAdoptionTime: adoptionCount > 0 ? totalAdoptionTime / adoptionCount : 0,
      mostAdoptedTechnologies: sortedAdopted.slice(0, 10),
    };
  }

  /**
   * Export technology system as JSON
   */
  toJSON() {
    const adoptionStates: TechnologyAdoptionState[] = [];
    this.adoptionStates.forEach((states) => {
      adoptionStates.push(...states);
    });

    return {
      technologies: Array.from(this.technologies.values()),
      adoptionStates,
      statistics: this.getStatistics(),
    };
  }
}
