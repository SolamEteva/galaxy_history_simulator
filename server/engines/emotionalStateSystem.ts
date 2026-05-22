/**
 * Emotional State System: Dynamic Gauges and Feedback Loops
 * 
 * Emotions function as internal gauges that fill or drain based on external events.
 * This system implements both destructive (conflict-driven) and constructive (cooperation-driven) feedback loops.
 */

export type EmotionalVariable =
  | 'collective_grief'
  | 'public_outrage'
  | 'desperation'
  | 'collective_security'
  | 'trust'
  | 'reciprocity'
  | 'cultural_coherence'
  | 'existential_dread'
  | 'hope'
  | 'unity';

export interface EmotionalState {
  civilizationId: string;
  variables: Map<string, number>; // 0-100 scale
  history: Array<{
    year: number;
    variable: EmotionalVariable;
    value: number;
    trigger: string;
  }>;
}

/**
 * Emotional Variables with Base Values and Thresholds
 */
export const EMOTIONAL_VARIABLES: Record<
  EmotionalVariable,
  {
    baseValue: number;
    minValue: number;
    maxValue: number;
    decayRate: number; // Per year without triggers
    thresholds: Record<string, number>;
    description: string;
  }
> = {
  collective_grief: {
    baseValue: 10,
    minValue: 0,
    maxValue: 100,
    decayRate: 2, // Grief fades slowly
    thresholds: {
      mourning_protocols: 30,
      isolation_tendency: 50,
      internal_conflict: 70,
      civilization_decline: 85,
    },
    description: 'Population loss, resource depletion, cultural destruction',
  },
  public_outrage: {
    baseValue: 15,
    minValue: 0,
    maxValue: 100,
    decayRate: 3, // Outrage fades faster than grief
    thresholds: {
      diplomatic_penalties: 40,
      military_mobilization: 60,
      war_declaration_possible: 80,
      internal_uprising: 90,
    },
    description: 'Trade route blockade, treaty violation, cultural insult',
  },
  desperation: {
    baseValue: 20,
    minValue: 0,
    maxValue: 100,
    decayRate: 4, // Desperation fades quickly once resources stabilize
    thresholds: {
      risky_raids_possible: 50,
      treaty_violation_likely: 75,
      internal_conflict_probability: 80,
      civilization_collapse_risk: 95,
    },
    description: 'Resource scarcity, population starvation, existential threat',
  },
  collective_security: {
    baseValue: 50,
    minValue: 0,
    maxValue: 100,
    decayRate: 1, // Security is stable once achieved
    thresholds: {
      border_opening: 60,
      knowledge_sharing: 70,
      alliance_formation: 80,
      federation_formation: 90,
    },
    description: 'Resource abundance, technological advancement, military superiority',
  },
  trust: {
    baseValue: 30,
    minValue: 0,
    maxValue: 100,
    decayRate: 5, // Trust is fragile and decays quickly
    thresholds: {
      trade_acceptance: 40,
      diplomatic_success: 60,
      alliance_formation: 75,
      open_borders: 85,
    },
    description: 'Successful cooperation, fulfilled treaties, mutual aid',
  },
  reciprocity: {
    baseValue: 25,
    minValue: 0,
    maxValue: 100,
    decayRate: 3,
    thresholds: {
      cooperative_response: 50,
      alliance_consideration: 70,
      federation_interest: 85,
    },
    description: 'Observation of cooperative acts from neighbors',
  },
  cultural_coherence: {
    baseValue: 60,
    minValue: 0,
    maxValue: 100,
    decayRate: 2,
    thresholds: {
      internal_friction_low: 70,
      innovation_boost: 75,
      unified_action: 80,
      cultural_golden_age: 90,
    },
    description: 'Internal alignment, shared goals, unified culture',
  },
  existential_dread: {
    baseValue: 15,
    minValue: 0,
    maxValue: 100,
    decayRate: 3,
    thresholds: {
      risk_aversion: 40,
      isolation_preference: 60,
      internal_conflict: 75,
      collapse_acceleration: 90,
    },
    description: 'Threats to civilization existence, environmental catastrophe',
  },
  hope: {
    baseValue: 40,
    minValue: 0,
    maxValue: 100,
    decayRate: 2,
    thresholds: {
      exploration_drive: 50,
      innovation_investment: 65,
      long_term_planning: 75,
      transcendence_pursuit: 90,
    },
    description: 'Positive future outlook, successful ventures, cultural flourishing',
  },
  unity: {
    baseValue: 50,
    minValue: 0,
    maxValue: 100,
    decayRate: 2,
    thresholds: {
      coordinated_action: 60,
      collective_sacrifice: 75,
      federation_readiness: 85,
    },
    description: 'Shared purpose, collective identity, unified civilization',
  },
};

/**
 * Destructive Feedback Loop: Conflict Cascade
 * 
 * Low Resources → Desperation ↑ → Raids ↑ → Fear & Anger ↑ → War ↑ → Losses ↑ → Desperation ↑
 */
export function destructiveFeedbackLoop(
  emotionalState: EmotionalState,
  trigger: {
    type: 'resource_scarcity' | 'military_loss' | 'treaty_violation' | 'cultural_insult';
    magnitude: number; // 0-1
  }
): EmotionalState {
  const updated = { ...emotionalState };
  updated.variables = new Map(emotionalState.variables);

  switch (trigger.type) {
    case 'resource_scarcity':
      // Scarcity increases desperation
      const desperation = (updated.variables.get('desperation') || 20) + trigger.magnitude * 40;
      updated.variables.set('desperation', Math.min(100, desperation));

      // Desperation reduces hope and unity
      const hope = (updated.variables.get('hope') || 40) - trigger.magnitude * 30;
      updated.variables.set('hope', Math.max(0, hope));

      const unity = (updated.variables.get('unity') || 50) - trigger.magnitude * 20;
      updated.variables.set('unity', Math.max(0, unity));

      // Desperation increases existential dread
      const dread = (updated.variables.get('existential_dread') || 15) + trigger.magnitude * 35;
      updated.variables.set('existential_dread', Math.min(100, dread));
      break;

    case 'military_loss':
      // Military loss increases grief and outrage
      const grief = (updated.variables.get('collective_grief') || 10) + trigger.magnitude * 50;
      updated.variables.set('collective_grief', Math.min(100, grief));

      const outrage = (updated.variables.get('public_outrage') || 15) + trigger.magnitude * 45;
      updated.variables.set('public_outrage', Math.min(100, outrage));

      // Loss reduces trust and security
      const trust = (updated.variables.get('trust') || 30) - trigger.magnitude * 40;
      updated.variables.set('trust', Math.max(0, trust));

      const security = (updated.variables.get('collective_security') || 50) - trigger.magnitude * 35;
      updated.variables.set('collective_security', Math.max(0, security));
      break;

    case 'treaty_violation':
      // Violation increases outrage and reduces trust
      const outrage2 = (updated.variables.get('public_outrage') || 15) + trigger.magnitude * 50;
      updated.variables.set('public_outrage', Math.min(100, outrage2));

      const trust2 = (updated.variables.get('trust') || 30) - trigger.magnitude * 50;
      updated.variables.set('trust', Math.max(0, trust2));

      // Violation increases existential dread
      const dread2 = (updated.variables.get('existential_dread') || 15) + trigger.magnitude * 30;
      updated.variables.set('existential_dread', Math.min(100, dread2));
      break;

    case 'cultural_insult':
      // Insult increases outrage and reduces cultural coherence
      const outrage3 = (updated.variables.get('public_outrage') || 15) + trigger.magnitude * 35;
      updated.variables.set('public_outrage', Math.min(100, outrage3));

      const coherence = (updated.variables.get('cultural_coherence') || 60) - trigger.magnitude * 40;
      updated.variables.set('cultural_coherence', Math.max(0, coherence));

      // Insult reduces unity
      const unity2 = (updated.variables.get('unity') || 50) - trigger.magnitude * 25;
      updated.variables.set('unity', Math.max(0, unity2));
      break;
  }

  return updated;
}

/**
 * Constructive Feedback Loop: Cooperation Cascade
 * 
 * Resource Abundance → Security ↑ → Desperation ↓ → Cooperation ↑ → Trust ↑ → Alliance ↑ → Shared Knowledge ↑ → Innovation ↑
 */
export function constructiveFeedbackLoop(
  emotionalState: EmotionalState,
  trigger: {
    type: 'resource_abundance' | 'successful_cooperation' | 'technological_breakthrough' | 'cultural_flourishing';
    magnitude: number; // 0-1
  }
): EmotionalState {
  const updated = { ...emotionalState };
  updated.variables = new Map(emotionalState.variables);

  switch (trigger.type) {
    case 'resource_abundance':
      // Abundance increases security
      const security = (updated.variables.get('collective_security') || 50) + trigger.magnitude * 40;
      updated.variables.set('collective_security', Math.min(100, security));

      // Abundance reduces desperation
      const desperation = (updated.variables.get('desperation') || 20) - trigger.magnitude * 35;
      updated.variables.set('desperation', Math.max(0, desperation));

      // Abundance increases hope
      const hope = (updated.variables.get('hope') || 40) + trigger.magnitude * 30;
      updated.variables.set('hope', Math.min(100, hope));

      // Abundance reduces existential dread
      const dread = (updated.variables.get('existential_dread') || 15) - trigger.magnitude * 30;
      updated.variables.set('existential_dread', Math.max(0, dread));
      break;

    case 'successful_cooperation':
      // Cooperation increases trust
      const trust = (updated.variables.get('trust') || 30) + trigger.magnitude * 45;
      updated.variables.set('trust', Math.min(100, trust));

      // Cooperation increases reciprocity
      const reciprocity = (updated.variables.get('reciprocity') || 25) + trigger.magnitude * 40;
      updated.variables.set('reciprocity', Math.min(100, reciprocity));

      // Cooperation increases unity
      const unity = (updated.variables.get('unity') || 50) + trigger.magnitude * 35;
      updated.variables.set('unity', Math.min(100, unity));

      // Cooperation reduces outrage
      const outrage = (updated.variables.get('public_outrage') || 15) - trigger.magnitude * 25;
      updated.variables.set('public_outrage', Math.max(0, outrage));
      break;

    case 'technological_breakthrough':
      // Breakthrough increases hope
      const hope2 = (updated.variables.get('hope') || 40) + trigger.magnitude * 35;
      updated.variables.set('hope', Math.min(100, hope2));

      // Breakthrough increases security
      const security2 = (updated.variables.get('collective_security') || 50) + trigger.magnitude * 30;
      updated.variables.set('collective_security', Math.min(100, security2));

      // Breakthrough increases cultural coherence
      const coherence = (updated.variables.get('cultural_coherence') || 60) + trigger.magnitude * 25;
      updated.variables.set('cultural_coherence', Math.min(100, coherence));

      // Breakthrough reduces desperation
      const desperation2 = (updated.variables.get('desperation') || 20) - trigger.magnitude * 20;
      updated.variables.set('desperation', Math.max(0, desperation2));
      break;

    case 'cultural_flourishing':
      // Flourishing increases cultural coherence
      const coherence2 = (updated.variables.get('cultural_coherence') || 60) + trigger.magnitude * 40;
      updated.variables.set('cultural_coherence', Math.min(100, coherence2));

      // Flourishing increases unity
      const unity2 = (updated.variables.get('unity') || 50) + trigger.magnitude * 35;
      updated.variables.set('unity', Math.min(100, unity2));

      // Flourishing increases hope
      const hope3 = (updated.variables.get('hope') || 40) + trigger.magnitude * 30;
      updated.variables.set('hope', Math.min(100, hope3));

      // Flourishing reduces grief
      const grief = (updated.variables.get('collective_grief') || 10) - trigger.magnitude * 20;
      updated.variables.set('collective_grief', Math.max(0, grief));
      break;
  }

  return updated;
}

/**
 * Apply natural decay to emotional variables over time
 */
export function applyEmotionalDecay(
  emotionalState: EmotionalState,
  yearsElapsed: number
): EmotionalState {
  const updated = { ...emotionalState };
  updated.variables = new Map(emotionalState.variables);

  for (const [variable, config] of Object.entries(EMOTIONAL_VARIABLES)) {
    const current = updated.variables.get(variable) || config.baseValue;
    const decayed = Math.max(config.minValue, current - config.decayRate * yearsElapsed);
    updated.variables.set(variable, decayed);
  }

  return updated;
}

/**
 * Detect behavioral triggers based on emotional thresholds
 */
export function detectBehaviorTriggers(
  emotionalState: EmotionalState
): Array<{
  behavior: string;
  probability: number; // 0-1
  emotionalDriver: EmotionalVariable;
}> {
  const triggers: Array<{
    behavior: string;
    probability: number;
    emotionalDriver: EmotionalVariable;
  }> = [];

  for (const [variable, value] of emotionalState.variables) {
    const config = EMOTIONAL_VARIABLES[variable as EmotionalVariable];
    if (!config) continue;

    // Check all thresholds for this variable
    for (const [behavior, threshold] of Object.entries(config.thresholds)) {
      if (value >= threshold) {
        // Probability increases as value exceeds threshold
        const probability = Math.min(1.0, (value - threshold) / (100 - threshold));
        triggers.push({
          behavior,
          probability,
          emotionalDriver: variable as EmotionalVariable,
        });
      }
    }
  }

  return triggers;
}

/**
 * Create a new emotional state for a civilization
 */
export function createEmotionalState(civilizationId: string): EmotionalState {
  const variables = new Map<string, number>();

  // Initialize all variables to their base values
  for (const [variable, config] of Object.entries(EMOTIONAL_VARIABLES)) {
    variables.set(variable, config.baseValue);
  }

  return {
    civilizationId,
    variables,
    history: [],
  };
}

/**
 * Calculate emotional stability (how volatile the civilization is)
 */
export function calculateEmotionalStability(emotionalState: EmotionalState): number {
  const values = Array.from(emotionalState.variables.values());
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Stability is inverse of standard deviation (lower variance = more stable)
  return Math.max(0, 1 - stdDev / 100);
}

/**
 * Simulate a year of emotional evolution
 */
export function simulateEmotionalYear(
  emotionalState: EmotionalState,
  events: Array<{
    type: 'destructive' | 'constructive';
    trigger: any;
  }>
): EmotionalState {
  let updated = emotionalState;

  // Apply events
  for (const event of events) {
    if (event.type === 'destructive') {
      updated = destructiveFeedbackLoop(updated, event.trigger);
    } else {
      updated = constructiveFeedbackLoop(updated, event.trigger);
    }
  }

  // Apply natural decay
  updated = applyEmotionalDecay(updated, 1);

  return updated;
}
