/**
 * Civilization Evolution System: Phases and Post-Scarcity Mechanics
 * 
 * Models how civilizations naturally progress through distinct phases from survival-driven
 * reactivity to purposeful, collaborative evolution when material conditions allow.
 */

export type CivilizationPhase =
  | 'emergence'
  | 'growth'
  | 'peak'
  | 'cooperation'
  | 'transcendence'
  | 'decline'
  | 'extinction';

export interface CivilizationEvolutionState {
  civilizationId: string;
  currentPhase: CivilizationPhase;
  phaseHistory: Array<{
    year: number;
    phase: CivilizationPhase;
    reason: string;
  }>;
  postScarcityAchieved: boolean;
  postScarcityYear?: number;
  evolutionMetrics: {
    technologyEfficiency: number; // 0-1
    resourceAbundance: number; // 0-1
    populationStability: number; // 0-1
    culturalCoherence: number; // 0-1
    cooperationLevel: number; // 0-1
  };
}

/**
 * Phase Definitions with Characteristics and Transitions
 */
export const CIVILIZATION_PHASES: Record<
  CivilizationPhase,
  {
    description: string;
    emotionalDrivers: string[];
    typicalBehaviors: string[];
    transitionConditions: {
      from: CivilizationPhase;
      to: CivilizationPhase;
      requirements: Record<string, number>;
    }[];
  }
> = {
  emergence: {
    description: 'Low population, high resource scarcity, tribal organization',
    emotionalDrivers: ['desperation', 'existential_dread', 'hope'],
    typicalBehaviors: [
      'territorial_expansion',
      'resource_competition',
      'tribal_consolidation',
      'basic_tool_development',
    ],
    transitionConditions: [
      {
        from: 'emergence',
        to: 'growth',
        requirements: {
          technologyEfficiency: 0.2,
          populationStability: 0.3,
          culturalCoherence: 0.4,
        },
      },
    ],
  },
  growth: {
    description: 'Increasing population, technological advancement, regional dominance',
    emotionalDrivers: ['ambition', 'pride', 'collective_security', 'hope'],
    typicalBehaviors: [
      'trade_network_expansion',
      'military_buildup',
      'cultural_influence',
      'technological_investment',
    ],
    transitionConditions: [
      {
        from: 'growth',
        to: 'peak',
        requirements: {
          technologyEfficiency: 0.6,
          resourceAbundance: 0.7,
          populationStability: 0.7,
          culturalCoherence: 0.7,
        },
      },
      {
        from: 'growth',
        to: 'decline',
        requirements: {
          desperation: 0.7,
          collective_grief: 0.6,
          existential_dread: 0.7,
        },
      },
    ],
  },
  peak: {
    description: 'Maximum resource efficiency, technological mastery, stable population',
    emotionalDrivers: ['confidence', 'curiosity', 'cultural_coherence', 'unity'],
    typicalBehaviors: [
      'knowledge_creation',
      'exploration',
      'artistic_flourishing',
      'scientific_advancement',
    ],
    transitionConditions: [
      {
        from: 'peak',
        to: 'cooperation',
        requirements: {
          technologyEfficiency: 0.85,
          resourceAbundance: 0.85,
          cooperationLevel: 0.6,
          trust: 0.7,
        },
      },
      {
        from: 'peak',
        to: 'decline',
        requirements: {
          desperation: 0.6,
          existential_dread: 0.65,
          collective_grief: 0.7,
        },
      },
    ],
  },
  cooperation: {
    description: 'Post-scarcity achieved, Desperation removed, Trust metrics high',
    emotionalDrivers: ['empathy', 'altruism', 'reciprocity', 'unity', 'hope'],
    typicalBehaviors: [
      'federation_formation',
      'knowledge_sharing',
      'joint_exploration',
      'mutual_aid_protocols',
    ],
    transitionConditions: [
      {
        from: 'cooperation',
        to: 'transcendence',
        requirements: {
          technologyEfficiency: 0.95,
          cooperationLevel: 0.85,
          culturalCoherence: 0.8,
          trust: 0.85,
        },
      },
      {
        from: 'cooperation',
        to: 'decline',
        requirements: {
          existential_dread: 0.7,
          desperation: 0.6,
        },
      },
    ],
  },
  transcendence: {
    description: 'Multiple species unified, shared knowledge networks, existential exploration',
    emotionalDrivers: ['wonder', 'purpose', 'collective_meaning', 'unity', 'hope'],
    typicalBehaviors: [
      'interstellar_cooperation',
      'philosophical_inquiry',
      'long_term_planning',
      'existential_exploration',
    ],
    transitionConditions: [
      {
        from: 'transcendence',
        to: 'decline',
        requirements: {
          existential_dread: 0.75,
          desperation: 0.65,
        },
      },
    ],
  },
  decline: {
    description: 'Resource depletion, technological regression, internal conflict',
    emotionalDrivers: ['desperation', 'collective_grief', 'existential_dread', 'outrage'],
    typicalBehaviors: [
      'isolation',
      'internal_warfare',
      'resource_hoarding',
      'cultural_fragmentation',
    ],
    transitionConditions: [
      {
        from: 'decline',
        to: 'extinction',
        requirements: {
          desperation: 0.9,
          existential_dread: 0.9,
          collective_grief: 0.85,
          populationStability: 0.1,
        },
      },
      {
        from: 'decline',
        to: 'growth',
        requirements: {
          resourceAbundance: 0.6,
          hope: 0.7,
          cooperation: 0.6,
        },
      },
    ],
  },
  extinction: {
    description: 'Civilization has ended',
    emotionalDrivers: [],
    typicalBehaviors: [],
    transitionConditions: [],
  },
};

/**
 * Post-Scarcity Threshold Definition
 * 
 * When a civilization reaches post-scarcity, Desperation is permanently removed from
 * decision-making logic and cooperation becomes the primary driver.
 */
export interface PostScarcityThreshold {
  technologyEfficiency: number; // Must be >= 0.8
  resourceAbundance: number; // Must be >= 0.8
  populationStability: number; // Must be >= 0.7
  yearsOfStability: number; // Must maintain conditions for 50+ years
}

export const POST_SCARCITY_REQUIREMENTS: PostScarcityThreshold = {
  technologyEfficiency: 0.8,
  resourceAbundance: 0.8,
  populationStability: 0.7,
  yearsOfStability: 50,
};

/**
 * Determine current civilization phase based on metrics
 */
export function determineCivilizationPhase(
  currentPhase: CivilizationPhase,
  metrics: {
    technologyEfficiency: number;
    resourceAbundance: number;
    populationStability: number;
    culturalCoherence: number;
    cooperationLevel: number;
    desperation: number;
    existentialDread: number;
    collectiveGrief: number;
    trust: number;
  }
): CivilizationPhase {
  // Check for extinction conditions
  if (
    metrics.desperation > 0.9 &&
    metrics.existentialDread > 0.9 &&
    metrics.collectiveGrief > 0.85 &&
    metrics.populationStability < 0.1
  ) {
    return 'extinction';
  }

  // Check for transcendence conditions
  if (
    metrics.technologyEfficiency > 0.95 &&
    metrics.cooperationLevel > 0.85 &&
    metrics.culturalCoherence > 0.8 &&
    metrics.trust > 0.85
  ) {
    return 'transcendence';
  }

  // Check for cooperation conditions
  if (
    metrics.technologyEfficiency > 0.85 &&
    metrics.resourceAbundance > 0.85 &&
    metrics.cooperationLevel > 0.6 &&
    metrics.trust > 0.7
  ) {
    return 'cooperation';
  }

  // Check for peak conditions
  if (
    metrics.technologyEfficiency > 0.6 &&
    metrics.resourceAbundance > 0.7 &&
    metrics.populationStability > 0.7 &&
    metrics.culturalCoherence > 0.7 &&
    metrics.desperation < 0.3
  ) {
    return 'peak';
  }

  // Check for decline conditions
  if (
    metrics.desperation > 0.6 ||
    (metrics.existentialDread > 0.65 && metrics.collectiveGrief > 0.7)
  ) {
    return 'decline';
  }

  // Check for growth conditions
  if (
    metrics.technologyEfficiency > 0.2 &&
    metrics.populationStability > 0.3 &&
    metrics.culturalCoherence > 0.4 &&
    metrics.desperation < 0.5
  ) {
    return 'growth';
  }

  // Default to emergence
  return 'emergence';
}

/**
 * Check if civilization has achieved post-scarcity
 */
export function checkPostScarcityAchievement(
  metrics: {
    technologyEfficiency: number;
    resourceAbundance: number;
    populationStability: number;
  },
  yearsAtThreshold: number
): boolean {
  const meetsRequirements =
    metrics.technologyEfficiency >= POST_SCARCITY_REQUIREMENTS.technologyEfficiency &&
    metrics.resourceAbundance >= POST_SCARCITY_REQUIREMENTS.resourceAbundance &&
    metrics.populationStability >= POST_SCARCITY_REQUIREMENTS.populationStability;

  return meetsRequirements && yearsAtThreshold >= POST_SCARCITY_REQUIREMENTS.yearsOfStability;
}

/**
 * Update civilization evolution state
 */
export function updateEvolutionState(
  evolutionState: CivilizationEvolutionState,
  metrics: {
    technologyEfficiency: number;
    resourceAbundance: number;
    populationStability: number;
    culturalCoherence: number;
    cooperationLevel: number;
    desperation: number;
    existentialDread: number;
    collectiveGrief: number;
    trust: number;
  },
  year: number
): CivilizationEvolutionState {
  const updated = { ...evolutionState };
  updated.evolutionMetrics = {
    technologyEfficiency: metrics.technologyEfficiency,
    resourceAbundance: metrics.resourceAbundance,
    populationStability: metrics.populationStability,
    culturalCoherence: metrics.culturalCoherence,
    cooperationLevel: metrics.cooperationLevel,
  };

  // Determine new phase
  const newPhase = determineCivilizationPhase(updated.currentPhase, metrics);

  // Record phase transition
  if (newPhase !== updated.currentPhase) {
    updated.currentPhase = newPhase;
    updated.phaseHistory.push({
      year,
      phase: newPhase,
      reason: `Transitioned from ${updated.phaseHistory[updated.phaseHistory.length - 1]?.phase || 'unknown'} to ${newPhase}`,
    });
  }

  // Check for post-scarcity achievement
  if (!updated.postScarcityAchieved) {
    const yearsAtThreshold = updated.phaseHistory.filter(
      (h) => h.phase === 'cooperation' || h.phase === 'transcendence'
    ).length;

    if (
      checkPostScarcityAchievement(
        {
          technologyEfficiency: metrics.technologyEfficiency,
          resourceAbundance: metrics.resourceAbundance,
          populationStability: metrics.populationStability,
        },
        yearsAtThreshold
      )
    ) {
      updated.postScarcityAchieved = true;
      updated.postScarcityYear = year;
    }
  }

  return updated;
}

/**
 * Calculate phase-specific behavior modifiers
 */
export function getPhaseModifiers(phase: CivilizationPhase): Record<string, number> {
  const modifiers: Record<string, number> = {};

  switch (phase) {
    case 'emergence':
      modifiers.warProbability = 1.8;
      modifiers.cooperationProbability = 0.3;
      modifiers.innovationRate = 0.4;
      modifiers.militaryExpansion = 1.5;
      break;

    case 'growth':
      modifiers.warProbability = 1.2;
      modifiers.cooperationProbability = 0.6;
      modifiers.innovationRate = 0.8;
      modifiers.militaryExpansion = 1.3;
      break;

    case 'peak':
      modifiers.warProbability = 0.6;
      modifiers.cooperationProbability = 1.2;
      modifiers.innovationRate = 1.5;
      modifiers.militaryExpansion = 0.5;
      break;

    case 'cooperation':
      modifiers.warProbability = 0.2;
      modifiers.cooperationProbability = 2.0;
      modifiers.innovationRate = 1.8;
      modifiers.militaryExpansion = 0.1;
      modifiers.federationFormation = 2.0;
      modifiers.knowledgeSharing = 2.2;
      break;

    case 'transcendence':
      modifiers.warProbability = 0.05;
      modifiers.cooperationProbability = 2.5;
      modifiers.innovationRate = 2.0;
      modifiers.militaryExpansion = 0.0;
      modifiers.federationFormation = 2.5;
      modifiers.knowledgeSharing = 2.5;
      modifiers.existentialExploration = 2.0;
      break;

    case 'decline':
      modifiers.warProbability = 2.0;
      modifiers.cooperationProbability = 0.1;
      modifiers.innovationRate = 0.2;
      modifiers.militaryExpansion = 0.8;
      modifiers.resourceHoarding = 2.0;
      modifiers.isolation = 1.8;
      break;

    case 'extinction':
      modifiers.allBehaviors = 0.0;
      break;
  }

  return modifiers;
}

/**
 * Create initial evolution state for a civilization
 */
export function createEvolutionState(civilizationId: string): CivilizationEvolutionState {
  return {
    civilizationId,
    currentPhase: 'emergence',
    phaseHistory: [
      {
        year: 0,
        phase: 'emergence',
        reason: 'Initial civilization state',
      },
    ],
    postScarcityAchieved: false,
    evolutionMetrics: {
      technologyEfficiency: 0.1,
      resourceAbundance: 0.3,
      populationStability: 0.2,
      culturalCoherence: 0.4,
      cooperationLevel: 0.2,
    },
  };
}

/**
 * Generate narrative description of civilization phase
 */
export function describePhase(phase: CivilizationPhase, year: number): string {
  const descriptions: Record<CivilizationPhase, string> = {
    emergence:
      'The civilization is in its earliest stages, struggling for survival and basic organization.',
    growth:
      'The civilization is expanding, developing technology, and establishing regional dominance.',
    peak:
      'The civilization has reached its zenith of efficiency and cultural achievement. Innovation flourishes.',
    cooperation:
      'The civilization has transcended scarcity. Cooperation and knowledge-sharing define this era.',
    transcendence:
      'Multiple civilizations have unified. Existential exploration and philosophical inquiry drive progress.',
    decline:
      'The civilization faces existential challenges. Internal conflict and resource depletion accelerate.',
    extinction: 'The civilization has ended. Its legacy remains in the historical record.',
  };

  return `[Year ${year}] ${descriptions[phase]}`;
}
