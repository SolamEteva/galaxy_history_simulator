/**
 * Probabilistic Consequence Engine
 * Generates event consequences based on civilization state and probability calculations
 * rather than pre-determined event type mappings
 *
 * CORE PRINCIPLE: Events first, narratives second.
 * This engine calculates what consequence SHOULD happen based on civilization state,
 * then the LLM is called to flesh out the narrative explaining why it happened.
 */

import type { CivilizationState, EventNode } from "../../types/narrative";

export interface ConsequenceProbabilities {
  migration: number;
  alliance: number;
  conflict: number;
  economic_crisis: number;
  technological_advancement: number;
  cultural_shift: number;
  power_vacuum: number;
  territorial_expansion: number;
  plague: number;
  discovery: number;
  [key: string]: number;
}

export interface ConsequenceContext {
  sourceEvent: EventNode;
  affectedCivilization: CivilizationState;
  sourceCivilization: CivilizationState;
  allCivilizations: Map<string, CivilizationState>;
  allEvents: EventNode[];
}

/**
 * Calculate migration probability based on civilization state
 * Factors: population pressure, resource scarcity, available territory, recent history, traits, event type
 */
export function calculateMigrationProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceEvent } = context;
  let probability = 0.1; // Base probability

  // Population pressure factor (0-0.3)
  // Higher population relative to technology level increases migration pressure
  const population = affectedCivilization.resources.population || 1000;
  const technology = affectedCivilization.resources.technology || 1;
  const carryingCapacityPerTech = 1000 * (1 + technology / 10);
  const populationPressure = Math.min(1, population / carryingCapacityPerTech);
  probability += populationPressure * 0.3;

  // Resource scarcity factor (0-0.25)
  // Low food relative to population increases migration pressure
  const food = affectedCivilization.resources.food || 100;
  const foodNeed = population / 10;
  const foodScarcity = Math.max(0, 1 - (food / foodNeed));
  probability += foodScarcity * 0.25;

  // Civilization traits factor (±0.2)
  if (affectedCivilization.traits?.includes("nomadic")) probability += 0.2;
  if (affectedCivilization.traits?.includes("territorial")) probability -= 0.2;
  if (affectedCivilization.traits?.includes("sedentary")) probability -= 0.15;

  // Event type influence factor (0-0.2)
  if (sourceEvent.eventType === "war") probability += 0.15;
  if (sourceEvent.eventType === "plague") probability += 0.2;
  if (sourceEvent.eventType === "economic_crisis") probability += 0.1;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate all consequence probabilities for a given context
 */
export function calculateAllConsequenceProbabilities(context: ConsequenceContext): ConsequenceProbabilities {
  return {
    migration: calculateMigrationProbability(context),
    alliance: 0.1,
    conflict: 0.05,
    economic_crisis: 0.05,
    technological_advancement: 0.05,
    cultural_shift: 0.1,
    power_vacuum: 0.02,
    territorial_expansion: 0.05,
    plague: 0.02,
    discovery: 0.05,
  };
}

/**
 * Select consequence type based on weighted probability distribution
 */
export function selectConsequenceByWeightedProbability(
  probabilities: ConsequenceProbabilities
): string {
  const entries = Object.entries(probabilities);
  const totalWeight = entries.reduce((sum, [, prob]) => sum + prob, 0);

  if (totalWeight === 0) {
    return entries[Math.floor(Math.random() * entries.length)][0];
  }

  let random = Math.random() * totalWeight;
  for (const [type, prob] of entries) {
    random -= prob;
    if (random <= 0) {
      return type;
    }
  }

  return entries[entries.length - 1][0];
}
