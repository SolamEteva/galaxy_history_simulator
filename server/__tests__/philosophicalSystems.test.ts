/**
 * Test Suite: Philosophical Systems Integration
 * 
 * Tests for trait system, emotional state, civilization evolution, and Chronicler narrative
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateTraitProfile, calculateTraitInfluence, detectTraitConflicts, calculateTraitSynergies, evolveTraits } from '../engines/enhancedTraitSystem';
import { createEmotionalState, destructiveFeedbackLoop, constructiveFeedbackLoop, detectBehaviorTriggers, calculateEmotionalStability } from '../engines/emotionalStateSystem';
import { createEvolutionState, determineCivilizationPhase, checkPostScarcityAchievement, updateEvolutionState, getPhaseModifiers } from '../engines/civilizationEvolution';
import { buildCausalPackage, validateNarrativeAgainstCausal } from '../engines/chroniclerNarrative';

describe('Enhanced Trait System', () => {
  it('should generate balanced trait profiles with positive and negative traits', () => {
    const profile = generateTraitProfile('civ1', {
      resourceAbundance: 0.8,
      threatLevel: 0.3,
      isolationFactor: 0.2,
    });

    expect(profile.civilizationId).toBe('civ1');
    expect(profile.traits.size).toBeGreaterThan(0);

    // Abundant environment should favor cooperation traits
    const empathy = profile.traits.get('empathy');
    const generosity = profile.traits.get('generosity');
    expect(empathy?.value).toBeGreaterThan(0.5);
    expect(generosity?.value).toBeGreaterThan(0.4);
  });

  it('should calculate trait influence on behaviors', () => {
    const profile = generateTraitProfile('civ1');
    const influence = calculateTraitInfluence(profile.traits, 'warProbability', 0.5);

    // With empathy and cooperation traits, war probability should be reduced
    expect(influence).toBeLessThan(0.5);
  });

  it('should detect trait conflicts', () => {
    const profile = generateTraitProfile('civ1');
    profile.traits.set('aggression', {
      id: 'aggression',
      name: 'Aggression',
      category: 'conflict',
      value: 0.8,
      description: 'High aggression',
      multipliers: {},
      affectsVariables: [],
    });
    profile.traits.set('empathy', {
      id: 'empathy',
      name: 'Empathy',
      category: 'cooperation',
      value: 0.8,
      description: 'High empathy',
      multipliers: {},
      affectsVariables: [],
    });

    const conflicts = detectTraitConflicts(profile.traits);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].conflictSeverity).toBeGreaterThan(0.5);
  });

  it('should calculate trait synergies', () => {
    const profile = generateTraitProfile('civ1');
    profile.traits.set('empathy', {
      id: 'empathy',
      name: 'Empathy',
      category: 'cooperation',
      value: 0.9,
      description: 'High empathy',
      multipliers: {},
      affectsVariables: [],
    });
    profile.traits.set('altruism', {
      id: 'altruism',
      name: 'Altruism',
      category: 'cooperation',
      value: 0.9,
      description: 'High altruism',
      multipliers: {},
      affectsVariables: [],
    });

    const synergies = calculateTraitSynergies(profile.traits);
    const empathyAltruismSynergy = synergies.find(
      (s) =>
        (s.trait1 === 'Empathy' && s.trait2 === 'Altruism') ||
        (s.trait1 === 'Altruism' && s.trait2 === 'Empathy')
    );

    expect(empathyAltruismSynergy).toBeDefined();
    expect(empathyAltruismSynergy?.synergyBonus).toBeGreaterThan(0.2);
  });

  it('should evolve traits based on experiences', () => {
    const profile = generateTraitProfile('civ1');
    const initialEmpathy = profile.traits.get('empathy')?.value || 0;

    const evolved = evolveTraits(profile.traits, [
      {
        type: 'success',
        category: 'cooperation',
        magnitude: 0.8,
      },
    ]);

    const newEmpathy = evolved.get('empathy')?.value || 0;
    expect(newEmpathy).toBeGreaterThan(initialEmpathy);
  });
});

describe('Emotional State System', () => {
  it('should create initial emotional state with base values', () => {
    const state = createEmotionalState('civ1');

    expect(state.civilizationId).toBe('civ1');
    expect(state.variables.size).toBe(10);
    expect(state.variables.get('collective_security')).toBe(50);
    expect(state.variables.get('hope')).toBe(40);
  });

  it('should apply destructive feedback loop for resource scarcity', () => {
    const state = createEmotionalState('civ1');
    const updated = destructiveFeedbackLoop(state, {
      type: 'resource_scarcity',
      magnitude: 0.8,
    });

    const desperation = updated.variables.get('desperation') || 0;
    const hope = updated.variables.get('hope') || 0;

    expect(desperation).toBeGreaterThan(state.variables.get('desperation') || 0);
    expect(hope).toBeLessThan(state.variables.get('hope') || 0);
  });

  it('should apply constructive feedback loop for resource abundance', () => {
    const state = createEmotionalState('civ1');
    const updated = constructiveFeedbackLoop(state, {
      type: 'resource_abundance',
      magnitude: 0.8,
    });

    const security = updated.variables.get('collective_security') || 0;
    const desperation = updated.variables.get('desperation') || 0;

    expect(security).toBeGreaterThan(state.variables.get('collective_security') || 0);
    expect(desperation).toBeLessThan(state.variables.get('desperation') || 0);
  });

  it('should detect behavior triggers from emotional thresholds', () => {
    const state = createEmotionalState('civ1');
    state.variables.set('desperation', 80);
    state.variables.set('public_outrage', 85);

    const triggers = detectBehaviorTriggers(state);

    expect(triggers.length).toBeGreaterThan(0);
    const riskRaidsTrigger = triggers.find((t) => t.behavior === 'risky_raids_possible');
    expect(riskRaidsTrigger).toBeDefined();
    expect(riskRaidsTrigger?.probability).toBeGreaterThan(0.5);
  });

  it('should calculate emotional stability', () => {
    const state = createEmotionalState('civ1');
    const stability = calculateEmotionalStability(state);

    expect(stability).toBeGreaterThanOrEqual(0);
    expect(stability).toBeLessThanOrEqual(1);
  });
});

describe('Civilization Evolution System', () => {
  it('should create initial evolution state in emergence phase', () => {
    const state = createEvolutionState('civ1');

    expect(state.civilizationId).toBe('civ1');
    expect(state.currentPhase).toBe('emergence');
    expect(state.postScarcityAchieved).toBe(false);
  });

  it('should transition from emergence to growth', () => {
    const state = createEvolutionState('civ1');
    const newPhase = determineCivilizationPhase('emergence', {
      technologyEfficiency: 0.3,
      resourceAbundance: 0.4,
      populationStability: 0.4,
      culturalCoherence: 0.5,
      cooperationLevel: 0.3,
      desperation: 0.2,
      existentialDread: 0.1,
      collectiveGrief: 0.1,
      trust: 0.3,
    });

    expect(newPhase).toBe('growth');
  });

  it('should transition to cooperation phase when post-scarcity conditions met', () => {
    const newPhase = determineCivilizationPhase('peak', {
      technologyEfficiency: 0.9,
      resourceAbundance: 0.9,
      populationStability: 0.8,
      culturalCoherence: 0.8,
      cooperationLevel: 0.7,
      desperation: 0.1,
      existentialDread: 0.1,
      collectiveGrief: 0.1,
      trust: 0.8,
    });

    expect(newPhase).toBe('cooperation');
  });

  it('should recognize post-scarcity achievement', () => {
    const achieved = checkPostScarcityAchievement(
      {
        technologyEfficiency: 0.85,
        resourceAbundance: 0.85,
        populationStability: 0.75,
      },
      50
    );

    expect(achieved).toBe(true);
  });

  it('should not achieve post-scarcity without sufficient years at threshold', () => {
    const achieved = checkPostScarcityAchievement(
      {
        technologyEfficiency: 0.85,
        resourceAbundance: 0.85,
        populationStability: 0.75,
      },
      10
    );

    expect(achieved).toBe(false);
  });

  it('should apply phase-specific behavior modifiers', () => {
    const cooperationModifiers = getPhaseModifiers('cooperation');
    const emergenceModifiers = getPhaseModifiers('emergence');

    expect(cooperationModifiers.warProbability).toBeLessThan(emergenceModifiers.warProbability);
    expect(cooperationModifiers.cooperationProbability).toBeGreaterThan(emergenceModifiers.cooperationProbability);
  });

  it('should transition to decline when desperation is high', () => {
    const newPhase = determineCivilizationPhase('growth', {
      technologyEfficiency: 0.5,
      resourceAbundance: 0.3,
      populationStability: 0.2,
      culturalCoherence: 0.3,
      cooperationLevel: 0.2,
      desperation: 0.8,
      existentialDread: 0.7,
      collectiveGrief: 0.8,
      trust: 0.2,
    });

    expect(newPhase).toBe('decline');
  });
});

describe('Chronicler Narrative System', () => {
  it('should validate narrative against causal package', () => {
    const mockEvent = {
      id: 'evt1',
      title: 'Trade Dispute',
      eventType: 'trade_conflict',
      year: 100,
      importance: 7,
      causalStrength: 0.8,
      constraintSatisfaction: 0.85,
      unityCoefficient: 0.7,
      involvedCivilizations: ['civ1', 'civ2'],
      description: 'A trade route was disrupted',
    };

    const causalPackage = buildCausalPackage(mockEvent, {});

    const narrative = `The trade dispute arose from fundamental economic pressures. 
    Civilization 1 faced resource constraints that made the trade route essential, 
    while Civilization 2 saw an opportunity to assert dominance. The conflict was inevitable.`;

    const validation = validateNarrativeAgainstCausal(narrative, causalPackage);

    expect(validation.isValid).toBe(true);
    expect(validation.violations.length).toBeLessThan(3);
  });

  it('should flag narratives that are too brief', () => {
    const mockEvent = {
      id: 'evt1',
      title: 'Trade Dispute',
      eventType: 'trade_conflict',
      year: 100,
      importance: 7,
      causalStrength: 0.8,
      constraintSatisfaction: 0.85,
      unityCoefficient: 0.7,
      involvedCivilizations: ['civ1', 'civ2'],
      description: 'A trade route was disrupted',
    };

    const causalPackage = buildCausalPackage(mockEvent, {});
    const briefNarrative = 'War happened.';

    const validation = validateNarrativeAgainstCausal(briefNarrative, causalPackage);

    expect(validation.violations.some((v) => v.type === 'Insufficient Detail')).toBe(true);
  });
});

describe('System Integration', () => {
  it('should track civilization through multiple phases with trait and emotional evolution', () => {
    const traitProfile = generateTraitProfile('civ1', {
      resourceAbundance: 0.5,
      threatLevel: 0.5,
      isolationFactor: 0.5,
    });

    const emotionalState = createEmotionalState('civ1');
    const evolutionState = createEvolutionState('civ1');

    // Simulate successful cooperation
    const updatedEmotional = constructiveFeedbackLoop(emotionalState, {
      type: 'successful_cooperation',
      magnitude: 0.7,
    });

    const updatedTraits = evolveTraits(traitProfile.traits, [
      {
        type: 'success',
        category: 'cooperation',
        magnitude: 0.8,
      },
    ]);

    // Verify systems are coordinated
    expect(updatedEmotional.variables.get('trust')).toBeGreaterThan(emotionalState.variables.get('trust') || 0);
    expect(updatedTraits.get('empathy')?.value).toBeGreaterThan(traitProfile.traits.get('empathy')?.value || 0);
  });
});
