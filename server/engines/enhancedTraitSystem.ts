/**
 * Enhanced Trait System: Positive and Negative Traits with Equal Mathematical Weight
 * 
 * This system implements the design philosophy that cooperation, empathy, and abundance
 * have the same mathematical rigor as conflict, fear, and scarcity.
 */

export type TraitCategory = 'conflict' | 'cooperation' | 'innovation' | 'cultural' | 'diplomatic' | 'survival';

export interface Trait {
  id: string;
  name: string;
  category: TraitCategory;
  value: number; // 0.0 to 1.0
  description: string;
  opposingTrait?: string; // Trait that opposes this one
  affectsVariables: string[]; // Which emotional/state variables this trait influences
  multipliers: Record<string, number>; // How this trait modifies specific behaviors
}

export interface TraitProfile {
  civilizationId: string;
  traits: Map<string, Trait>;
  traitHistory: Array<{
    year: number;
    traitId: string;
    oldValue: number;
    newValue: number;
    reason: string;
  }>;
}

/**
 * Negative Traits: Conflict and Scarcity Drivers
 */
export const NEGATIVE_TRAITS = {
  AGGRESSION: {
    id: 'aggression',
    name: 'Aggression',
    category: 'conflict' as TraitCategory,
    description: 'Tendency toward territorial expansion and dominance-seeking behavior',
    affectsVariables: ['warDeclarationProbability', 'raidProbability', 'treatyViolationTolerance'],
    multipliers: {
      warDeclarationProbability: 2.0, // Doubles war probability
      raidProbability: 2.5,
      militaryExpansion: 1.8,
      diplomaticSuccess: 0.4, // Reduces diplomatic success
      allianceFormation: 0.3,
    },
  },
  XENOPHOBIA: {
    id: 'xenophobia',
    name: 'Xenophobia',
    category: 'conflict' as TraitCategory,
    description: 'Fear and distrust of foreign species and cultures',
    affectsVariables: ['firstContactHostility', 'tradeAcceptance', 'isolationBias'],
    multipliers: {
      firstContactHostility: 2.2,
      tradeAcceptance: 0.2,
      allianceFormation: 0.1,
      culturalExchange: 0.3,
      militaryDefenseSpending: 1.5,
    },
  },
  GREED: {
    id: 'greed',
    name: 'Greed',
    category: 'survival' as TraitCategory,
    description: 'Obsessive resource accumulation and exploitation',
    affectsVariables: ['resourceHoarding', 'tradeExploitation', 'treatyViolationLikelihood'],
    multipliers: {
      resourceHoarding: 2.0,
      tradeExploitation: 2.3,
      treatyViolationLikelihood: 1.8,
      shortTermGain: 1.5,
      longTermRelationships: 0.2,
    },
  },
  PARANOIA: {
    id: 'paranoia',
    name: 'Paranoia',
    category: 'conflict' as TraitCategory,
    description: 'Excessive suspicion and preemptive defensive behavior',
    affectsVariables: ['preemptiveStrikeProbability', 'defensiveSpending', 'trustInAllies'],
    multipliers: {
      preemptiveStrikeProbability: 2.5,
      defensiveSpending: 2.0,
      trustInAllies: 0.3,
      peacefulNegotiation: 0.2,
      allianceStability: 0.4,
    },
  },
  RIGIDITY: {
    id: 'rigidity',
    name: 'Rigidity',
    category: 'cultural' as TraitCategory,
    description: 'Resistance to change and innovation',
    affectsVariables: ['adaptationSpeed', 'innovationRate', 'culturalEvolution'],
    multipliers: {
      adaptationSpeed: 0.3,
      innovationRate: 0.2,
      culturalEvolution: 0.3,
      technologyAdoption: 0.4,
      flexibleDiplomacy: 0.5,
    },
  },
};

/**
 * Positive Traits: Cooperation and Abundance Drivers
 */
export const POSITIVE_TRAITS = {
  EMPATHY: {
    id: 'empathy',
    name: 'Empathy',
    category: 'cooperation' as TraitCategory,
    description: 'Ability to understand and share the feelings of others',
    affectsVariables: ['resourceSharingProbability', 'refugeeIntegration', 'peacefulConflictResolution'],
    multipliers: {
      resourceSharingProbability: 2.0,
      refugeeIntegration: 2.2,
      peacefulConflictResolution: 1.8,
      allianceFormation: 1.6,
      culturalExchange: 1.7,
      warDeclarationProbability: 0.3,
    },
  },
  ALTRUISM: {
    id: 'altruism',
    name: 'Altruism',
    category: 'cooperation' as TraitCategory,
    description: 'Willingness to sacrifice short-term advantage for long-term relationship building',
    affectsVariables: ['mutualAidProtocols', 'treatyHonoring', 'federationFormation'],
    multipliers: {
      mutualAidProtocols: 2.3,
      treatyHonoring: 2.0,
      federationFormation: 1.9,
      longTermRelationships: 2.2,
      shortTermGain: 0.3,
      greedyBehavior: 0.1,
    },
  },
  CURIOSITY: {
    id: 'curiosity',
    name: 'Curiosity',
    category: 'innovation' as TraitCategory,
    description: 'Drive to explore, learn, and understand the unknown',
    affectsVariables: ['explorationRate', 'knowledgeAcquisition', 'scientificAdvancement'],
    multipliers: {
      explorationRate: 2.2,
      knowledgeAcquisition: 2.0,
      scientificAdvancement: 1.9,
      firstContactDiplomacy: 1.8,
      defensivePosturing: 0.2,
      isolationBias: 0.1,
    },
  },
  COOPERATION: {
    id: 'cooperation',
    name: 'Cooperation',
    category: 'cooperation' as TraitCategory,
    description: 'Inclination toward joint ventures and collective problem-solving',
    affectsVariables: ['jointVentures', 'conflictEscalation', 'allianceStability'],
    multipliers: {
      jointVentures: 2.3,
      conflictEscalation: 0.3,
      allianceStability: 1.9,
      knowledgeSharing: 2.0,
      federationFormation: 1.8,
      territorialExpansion: 0.4,
    },
  },
  INNOVATION: {
    id: 'innovation',
    name: 'Innovation',
    category: 'innovation' as TraitCategory,
    description: 'Tendency to create new solutions and challenge existing paradigms',
    affectsVariables: ['technologyAdoption', 'culturalEvolution', 'adaptationSpeed'],
    multipliers: {
      technologyAdoption: 2.2,
      culturalEvolution: 1.9,
      adaptationSpeed: 1.8,
      knowledgeCreation: 2.0,
      rigidityResistance: 1.5,
      traditionalApproaches: 0.3,
    },
  },
  WISDOM: {
    id: 'wisdom',
    name: 'Wisdom',
    category: 'diplomatic' as TraitCategory,
    description: 'Ability to make sound judgments and learn from history',
    affectsVariables: ['conflictAvoidance', 'treatySuccess', 'longTermPlanning'],
    multipliers: {
      conflictAvoidance: 1.8,
      treatySuccess: 2.0,
      longTermPlanning: 2.1,
      peacefulNegotiation: 1.9,
      preemptiveStrikeProbability: 0.2,
      impulsiveDecisions: 0.1,
    },
  },
  GENEROSITY: {
    id: 'generosity',
    name: 'Generosity',
    category: 'cooperation' as TraitCategory,
    description: 'Willingness to give freely and share abundance',
    affectsVariables: ['resourceSharing', 'tradeTerms', 'reciprocityTrust'],
    multipliers: {
      resourceSharing: 2.2,
      tradeTerms: 1.8, // Better trade terms for others
      reciprocityTrust: 2.0,
      allianceFormation: 1.7,
      resourceHoarding: 0.1,
      exploitativeTrade: 0.2,
    },
  },
  RESILIENCE: {
    id: 'resilience',
    name: 'Resilience',
    category: 'survival' as TraitCategory,
    description: 'Ability to recover from hardship and adapt to adversity',
    affectsVariables: ['recoverySpeed', 'crisisAdaptation', 'populationRecovery'],
    multipliers: {
      recoverySpeed: 2.0,
      crisisAdaptation: 1.9,
      populationRecovery: 1.8,
      despairResistance: 1.7,
      collapseRisk: 0.3,
    },
  },
};

/**
 * Calculate trait influence on a specific behavior
 */
export function calculateTraitInfluence(
  traits: Map<string, Trait>,
  behaviorName: string,
  baseValue: number
): number {
    let influence = baseValue;
  const behaviorAliases: Record<string, string[]> = {
    warProbability: ["warProbability", "warDeclarationProbability", "conflictEscalation", "preemptiveStrikeProbability"],
  };
  const behaviorKeys = behaviorAliases[behaviorName] ?? [behaviorName];
  for (const [, trait] of traits) {
    const matchingMultiplier = behaviorKeys
      .map(key => trait.multipliers[key])
      .find(multiplier => multiplier !== undefined);
    if (matchingMultiplier !== undefined) {
      influence *= 1 + (matchingMultiplier - 1) * trait.value;
    }
  }
  return influence;
}

/**
 * Detect trait conflicts (opposing traits in same civilization)
 */
export function detectTraitConflicts(traits: Map<string, Trait>): Array<{
  trait1: string;
  trait2: string;
  conflictSeverity: number; // 0-1
}> {
  const conflicts: Array<{
    trait1: string;
    trait2: string;
    conflictSeverity: number;
  }> = [];

  // Define opposing trait pairs
  const opposites = [
    ['aggression', 'empathy'],
    ['xenophobia', 'curiosity'],
    ['greed', 'altruism'],
    ['paranoia', 'cooperation'],
    ['rigidity', 'innovation'],
  ];

  for (const [trait1Id, trait1] of traits) {
    for (const [trait2Id, trait2] of traits) {
      if (trait1Id < trait2Id) {
        // Check if these are opposing traits
        for (const [opposite1, opposite2] of opposites) {
          if (
            (trait1.id === opposite1 && trait2.id === opposite2) ||
            (trait1.id === opposite2 && trait2.id === opposite1)
          ) {
            // Conflict severity is the product of both trait values
            const severity = trait1.value * trait2.value;
            if (severity > 0.2) {
              // Only report significant conflicts
              conflicts.push({
                trait1: trait1.name,
                trait2: trait2.name,
                conflictSeverity: severity,
              });
            }
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Calculate trait synergies (complementary traits)
 */
export function calculateTraitSynergies(traits: Map<string, Trait>): Array<{
  trait1: string;
  trait2: string;
  synergyBonus: number; // 0-1
}> {
  const synergies: Array<{
    trait1: string;
    trait2: string;
    synergyBonus: number;
  }> = [];

  // Define synergistic trait pairs
  const synergistic = [
    ['empathy', 'altruism', 0.3],
    ['curiosity', 'innovation', 0.35],
    ['cooperation', 'wisdom', 0.3],
    ['generosity', 'altruism', 0.25],
    ['resilience', 'wisdom', 0.2],
    ['cooperation', 'empathy', 0.25],
  ];

  for (const [trait1Id, trait1] of traits) {
    for (const [trait2Id, trait2] of traits) {
      if (trait1Id < trait2Id) {
        for (const [syn1, syn2, bonus] of synergistic as [string, string, number][]) {
          if (
            (trait1.id === syn1 && trait2.id === syn2) ||
            (trait1.id === syn2 && trait2.id === syn1)
          ) {
            const synergyValue = trait1.value * trait2.value * (bonus as number);
            if (synergyValue > 0.05) {
              synergies.push({
                trait1: trait1.name,
                trait2: trait2.name,
                synergyBonus: synergyValue,
              });
            }
          }
        }
      }
    }
  }

  return synergies;
}

/**
 * Apply trait evolution based on civilization experiences
 */
export function evolveTraits(
  traits: Map<string, Trait>,
  experiences: Array<{
    type: 'success' | 'failure';
    category: TraitCategory;
    magnitude: number; // 0-1
  }>
): Map<string, Trait> {
  const evolved = new Map(
    Array.from(traits.entries(), ([id, trait]) => [
      id,
      {
        ...trait,
        affectsVariables: [...trait.affectsVariables],
        multipliers: { ...trait.multipliers },
      },
    ])
  );

  for (const experience of experiences) {
    for (const [traitId, trait] of evolved) {
      if (trait.category === experience.category) {
        // Successful experiences reinforce traits
        if (experience.type === 'success') {
          trait.value = Math.min(1.0, trait.value + experience.magnitude * 0.1);
        }
        // Failed experiences weaken traits
        else {
          trait.value = Math.max(0.0, trait.value - experience.magnitude * 0.1);
        }
      }
    }
  }

  return evolved;
}

/**
 * Generate trait profile for a new civilization
 */
export function generateTraitProfile(
  civilizationId: string,
  environmentalFactors?: {
    resourceAbundance: number; // 0-1
    threatLevel: number; // 0-1
    isolationFactor: number; // 0-1
  }
): TraitProfile {
  const traits = new Map<string, Trait>();

  // Environmental factors influence initial trait distribution
  const abundance = environmentalFactors?.resourceAbundance ?? 0.5;
  const threat = environmentalFactors?.threatLevel ?? 0.5;
  const isolation = environmentalFactors?.isolationFactor ?? 0.5;

  // Abundant environments favor cooperation traits
  if (abundance > 0.6) {
    traits.set('empathy', { ...POSITIVE_TRAITS.EMPATHY, value: 0.6 + Math.random() * 0.3 });
    traits.set('generosity', { ...POSITIVE_TRAITS.GENEROSITY, value: 0.5 + Math.random() * 0.3 });
  }

  // Threatening environments favor defensive traits
  if (threat > 0.6) {
    traits.set('aggression', { ...NEGATIVE_TRAITS.AGGRESSION, value: 0.5 + Math.random() * 0.3 });
    traits.set('paranoia', { ...NEGATIVE_TRAITS.PARANOIA, value: 0.4 + Math.random() * 0.3 });
  }

  // Isolated environments favor xenophobia
  if (isolation > 0.6) {
    traits.set('xenophobia', { ...NEGATIVE_TRAITS.XENOPHOBIA, value: 0.5 + Math.random() * 0.3 });
  }

  // All civilizations get a mix of traits. Positive traits are always present;
  // environmental abundance changes their starting strength rather than removing them.
  traits.set('empathy', { ...POSITIVE_TRAITS.EMPATHY, value: abundance > 0.6 ? 0.6 + Math.random() * 0.3 : 0.4 + Math.random() * 0.2 });
  traits.set('generosity', { ...POSITIVE_TRAITS.GENEROSITY, value: abundance > 0.6 ? 0.5 + Math.random() * 0.3 : 0.3 + Math.random() * 0.2 });
  // Add curiosity (universal drive to explore)
  traits.set('curiosity', { ...POSITIVE_TRAITS.CURIOSITY, value: 0.4 + Math.random() * 0.3 });

  // Add resilience (universal survival trait)
  traits.set('resilience', { ...POSITIVE_TRAITS.RESILIENCE, value: 0.5 + Math.random() * 0.3 });

  // Add cooperation (universal social trait)
  traits.set('cooperation', { ...POSITIVE_TRAITS.COOPERATION, value: 0.4 + Math.random() * 0.3 });

  return {
    civilizationId,
    traits,
    traitHistory: [],
  };
}
