/**
 * Belief System: Models the propagation and evolution of beliefs, ideologies, and religions
 * Uses graph-based belief propagation and influence networks
 */

export interface Belief {
  id: string;
  name: string;
  description: string;
  category: "religious" | "philosophical" | "political" | "scientific";
  strength: number; // 0-1, how deeply held
  yearOrigin: number;
  originSpeciesId: number;
  followers: Set<number>; // Civilization IDs that follow this belief
}

export interface BeliefInfluence {
  fromBeliefId: string;
  toBeliefId: string;
  influenceType: "reinforces" | "contradicts" | "evolves_into" | "synthesizes_with";
  strength: number; // 0-1, how much influence
}

/**
 * Belief System manages the propagation and evolution of beliefs across civilizations
 */
export class BeliefSystem {
  private beliefs: Map<string, Belief> = new Map();
  private influences: Map<string, BeliefInfluence[]> = new Map(); // from -> influences
  private beliefNetwork: Map<number, Set<string>> = new Map(); // civilization -> beliefs
  private decayRate = 0.95; // How much belief strength persists per generation

  /**
   * Create a new belief
   */
  createBelief(
    id: string,
    name: string,
    description: string,
    category: Belief["category"],
    yearOrigin: number,
    originSpeciesId: number
  ): Belief {
    if (this.beliefs.has(id)) {
      throw new Error(`Belief ${id} already exists`);
    }

    const belief: Belief = {
      id,
      name,
      description,
      category,
      strength: 1.0,
      yearOrigin,
      originSpeciesId,
      followers: new Set(),
    };

    this.beliefs.set(id, belief);
    this.influences.set(id, []);

    return belief;
  }

  /**
   * Add an influence relationship between beliefs
   */
  addInfluence(
    fromBeliefId: string,
    toBeliefId: string,
    influenceType: BeliefInfluence["influenceType"],
    strength: number = 0.8
  ): void {
    if (!this.beliefs.has(fromBeliefId) || !this.beliefs.has(toBeliefId)) {
      throw new Error("One or both beliefs not found");
    }

    const influence: BeliefInfluence = {
      fromBeliefId,
      toBeliefId,
      influenceType,
      strength: Math.min(1.0, Math.max(0, strength)),
    };

    this.influences.get(fromBeliefId)!.push(influence);
  }

  /**
   * A civilization adopts a belief
   */
  adoptBelief(civilizationId: number, beliefId: string, strength: number = 1.0): void {
    const belief = this.beliefs.get(beliefId);
    if (!belief) {
      throw new Error(`Belief ${beliefId} not found`);
    }

    if (!this.beliefNetwork.has(civilizationId)) {
      this.beliefNetwork.set(civilizationId, new Set());
    }

    this.beliefNetwork.get(civilizationId)!.add(beliefId);
    belief.followers.add(civilizationId);
    belief.strength = Math.min(1.0, belief.strength + strength * 0.1);
  }

  /**
   * A civilization abandons a belief
   */
  abandonBelief(civilizationId: number, beliefId: string): void {
    const beliefs = this.beliefNetwork.get(civilizationId);
    if (beliefs) {
      beliefs.delete(beliefId);
    }

    const belief = this.beliefs.get(beliefId);
    if (belief) {
      belief.followers.delete(civilizationId);
    }
  }

  /**
   * Propagate beliefs from one civilization to neighboring/allied civilizations
   */
  propagateBeliefs(
    fromCivilizationId: number,
    toCivilizationId: number,
    propagationStrength: number = 0.7
  ): void {
    const fromBeliefs = this.beliefNetwork.get(fromCivilizationId);
    if (!fromBeliefs) return;

    fromBeliefs.forEach((beliefId) => {
      const belief = this.beliefs.get(beliefId)!;
      const toBeliefs = this.beliefNetwork.get(toCivilizationId);

      // Only propagate if target doesn't already have this belief
      if (!toBeliefs || !toBeliefs.has(beliefId)) {
        // Propagation chance decreases with distance and time
        const propagationChance = propagationStrength * belief.strength;
        if (Math.random() < propagationChance) {
          this.adoptBelief(toCivilizationId, beliefId, propagationStrength);
        }
      }
    });
  }

  /**
   * Beliefs influence each other - create synthesis or evolution
   */
  synthesizeBeliefs(
    beliefId1: string,
    beliefId2: string,
    newBeliefId: string,
    newBeliefName: string,
    newBeliefDescription: string,
    year: number,
    originSpeciesId: number
  ): Belief {
    const belief1 = this.beliefs.get(beliefId1);
    const belief2 = this.beliefs.get(beliefId2);

    if (!belief1 || !belief2) {
      throw new Error("One or both source beliefs not found");
    }

    // Create new synthesized belief
    const newBelief = this.createBelief(
      newBeliefId,
      newBeliefName,
      newBeliefDescription,
      "philosophical",
      year,
      originSpeciesId
    );

    // New belief inherits followers from both parent beliefs
    const allFollowers = new Set([...belief1.followers, ...belief2.followers]);
    allFollowers.forEach((civId) => {
      this.adoptBelief(civId, newBeliefId, 0.8);
    });

    // Add influence relationships
    this.addInfluence(beliefId1, newBeliefId, "synthesizes_with", 0.8);
    this.addInfluence(beliefId2, newBeliefId, "synthesizes_with", 0.8);

    return newBelief;
  }

  /**
   * Beliefs evolve into new forms (e.g., reformation, enlightenment)
   */
  evolveBelief(
    parentBeliefId: string,
    newBeliefId: string,
    newBeliefName: string,
    newBeliefDescription: string,
    year: number,
    originSpeciesId: number,
    adoptionRate: number = 0.6
  ): Belief {
    const parentBelief = this.beliefs.get(parentBeliefId);
    if (!parentBelief) {
      throw new Error(`Parent belief ${parentBeliefId} not found`);
    }

    // Create evolved belief
    const newBelief = this.createBelief(
      newBeliefId,
      newBeliefName,
      newBeliefDescription,
      parentBelief.category,
      year,
      originSpeciesId
    );

    // Some followers adopt the evolved belief
    parentBelief.followers.forEach((civId) => {
      if (Math.random() < adoptionRate) {
        this.adoptBelief(civId, newBeliefId, 0.9);
        // They may keep the old belief too (syncretism)
      }
    });

    // Add evolution relationship
    this.addInfluence(parentBeliefId, newBeliefId, "evolves_into", 0.9);

    return newBelief;
  }

  /**
   * Get all beliefs held by a civilization
   */
  getCivilizationBeliefs(civilizationId: number): Belief[] {
    const beliefIds = this.beliefNetwork.get(civilizationId) || new Set();
    return Array.from(beliefIds)
      .map((id) => this.beliefs.get(id)!)
      .sort((a, b) => b.strength - a.strength);
  }

  /**
   * Get all civilizations that follow a belief
   */
  getBeliefFollowers(beliefId: string): number[] {
    const belief = this.beliefs.get(beliefId);
    return belief ? Array.from(belief.followers) : [];
  }

  /**
   * Calculate belief compatibility between two civilizations
   * Returns 0-1, where 1 is perfect alignment
   */
  calculateBeliefCompatibility(civ1Id: number, civ2Id: number): number {
    const beliefs1 = this.beliefNetwork.get(civ1Id) || new Set();
    const beliefs2 = this.beliefNetwork.get(civ2Id) || new Set();

    if (beliefs1.size === 0 || beliefs2.size === 0) return 0.5;

    const intersection = new Set([...beliefs1].filter((x) => beliefs2.has(x)));
    const union = new Set([...beliefs1, ...beliefs2]);

    return intersection.size / union.size;
  }

  /**
   * Detect belief conflicts between civilizations
   */
  detectBeliefConflicts(civ1Id: number, civ2Id: number): string[] {
    const beliefs1 = this.getCivilizationBeliefs(civ1Id);
    const beliefs2 = this.getCivilizationBeliefs(civ2Id);

    const conflicts: string[] = [];

    beliefs1.forEach((belief1) => {
      beliefs2.forEach((belief2) => {
        // Check if beliefs contradict each other
        const influences1 = this.influences.get(belief1.id) || [];
        const contradicts = influences1.some(
          (inf) => inf.toBeliefId === belief2.id && inf.influenceType === "contradicts"
        );

        if (contradicts) {
          conflicts.push(`${belief1.name} contradicts ${belief2.name}`);
        }
      });
    });

    return conflicts;
  }

  /**
   * Apply belief decay (beliefs fade over time if not reinforced)
   */
  applyBeliefDecay(): void {
    this.beliefs.forEach((belief) => {
      belief.strength *= this.decayRate;

      // If belief becomes too weak, some civilizations may abandon it
      if (belief.strength < 0.2) {
        const followersToRemove: number[] = [];
        belief.followers.forEach((civId) => {
          if (Math.random() > belief.strength * 2) {
            followersToRemove.push(civId);
          }
        });

        followersToRemove.forEach((civId) => {
          this.abandonBelief(civId, belief.id);
        });
      }
    });
  }

  /**
   * Get belief statistics
   */
  getStatistics(): {
    totalBeliefs: number;
    beliefsByCategory: Record<string, number>;
    averageFollowersPerBelief: number;
    mostPopularBeliefs: Array<{ name: string; followers: number }>;
  } {
    const beliefsByCategory: Record<string, number> = {
      religious: 0,
      philosophical: 0,
      political: 0,
      scientific: 0,
    };

    let totalFollowers = 0;
    const mostPopular: Array<{ name: string; followers: number }> = [];

    this.beliefs.forEach((belief) => {
      beliefsByCategory[belief.category]++;
      totalFollowers += belief.followers.size;
      mostPopular.push({ name: belief.name, followers: belief.followers.size });
    });

    mostPopular.sort((a, b) => b.followers - a.followers);

    return {
      totalBeliefs: this.beliefs.size,
      beliefsByCategory,
      averageFollowersPerBelief: this.beliefs.size > 0 ? totalFollowers / this.beliefs.size : 0,
      mostPopularBeliefs: mostPopular.slice(0, 10),
    };
  }

  /**
   * Export belief system as JSON
   */
  toJSON(): {
    beliefs: Array<Omit<Belief, "followers"> & { followers: number[] }>;
    influences: BeliefInfluence[];
    beliefNetwork: Record<number, string[]>;
  } {
    const beliefs = Array.from(this.beliefs.values()).map((belief) => ({
      ...belief,
      followers: Array.from(belief.followers),
    }));

    const influences: BeliefInfluence[] = [];
    this.influences.forEach((influenceList) => {
      influences.push(...influenceList);
    });

    const beliefNetwork: Record<number, string[]> = {};
    this.beliefNetwork.forEach((beliefs, civId) => {
      beliefNetwork[civId] = Array.from(beliefs);
    });

    return {
      beliefs,
      influences,
      beliefNetwork,
    };
  }
}
