/**
 * Complete Consequence Probability Calculators
 * Calculates probability of each consequence type based on civilization state, resources, relationships, and recent history
 * 
 * PRINCIPLE: Each consequence type has its own probability based on:
 * - Civilization state (resources, technology, culture, military)
 * - Civilization traits and strategy
 * - Recent events and historical patterns
 * - Relationships with other civilizations
 * - Environmental and temporal factors
 */

import type { CivilizationState, EventNode } from "../../types/narrative";

export interface ConsequenceContext {
  sourceEvent: EventNode;
  affectedCivilization: CivilizationState;
  sourceCivilization: CivilizationState;
  allCivilizations: Map<string, CivilizationState>;
  allEvents: EventNode[];
}

/**
 * Calculate migration probability
 * Factors: population pressure, resource scarcity, available territory, traits, event type
 */
export function calculateMigrationProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceEvent } = context;
  let probability = 0.1;

  // Population pressure (0-0.3)
  const population = affectedCivilization.resources.population || 1000;
  const technology = affectedCivilization.resources.technology || 1;
  const carryingCapacity = 1000 * (1 + technology / 10);
  const populationPressure = Math.min(1, population / carryingCapacity);
  probability += populationPressure * 0.3;

  // Resource scarcity (0-0.25)
  const food = affectedCivilization.resources.food || 100;
  const foodNeed = population / 10;
  const foodScarcity = Math.max(0, 1 - (food / foodNeed));
  probability += foodScarcity * 0.25;

  // Traits (±0.2)
  if (affectedCivilization.traits?.includes("nomadic")) probability += 0.2;
  if (affectedCivilization.traits?.includes("territorial")) probability -= 0.2;
  if (affectedCivilization.traits?.includes("sedentary")) probability -= 0.15;

  // Event type (0-0.2)
  if (sourceEvent.eventType === "war") probability += 0.15;
  if (sourceEvent.eventType === "plague") probability += 0.2;
  if (sourceEvent.eventType === "economic_crisis") probability += 0.1;
  if (sourceEvent.eventType === "environmental_disaster") probability += 0.15;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate alliance probability
 * Factors: shared enemies, trade benefits, cultural alignment, past cooperation
 */
export function calculateAllianceProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceCivilization, allCivilizations } = context;
  let probability = 0.1;

  // Existing relationship (0-0.3)
  const relationship = affectedCivilization.relationships?.get(sourceCivilization.id);
  if (relationship) {
    const alignment = (relationship.alignment + 1) / 2; // -1 to 1 → 0 to 1
    probability += alignment * 0.3;
  }

  // Shared enemies (0-0.25)
  let sharedEnemies = 0;
  if (affectedCivilization.relationships && sourceCivilization.relationships) {
    for (const [civId, rel1] of affectedCivilization.relationships) {
      const rel2 = sourceCivilization.relationships.get(civId);
      if (rel1.alignment < -0.5 && rel2 && rel2.alignment < -0.5) {
        sharedEnemies++;
      }
    }
  }
  probability += Math.min(0.25, sharedEnemies * 0.1);

  // Trade benefits (0-0.2)
  const sourceTrade = sourceCivilization.resources.trade || 0;
  const affectedTrade = affectedCivilization.resources.trade || 0;
  if (sourceTrade > 50 && affectedTrade > 50) {
    probability += 0.2;
  }

  // Cultural alignment (0-0.15)
  const cultureDiff = Math.abs((sourceCivilization.resources.culture || 0) - (affectedCivilization.resources.culture || 0));
  const cultureAlignment = Math.max(0, 1 - cultureDiff / 100);
  probability += cultureAlignment * 0.15;

  // Traits (±0.1)
  if (affectedCivilization.traits?.includes("diplomatic")) probability += 0.1;
  if (affectedCivilization.traits?.includes("isolationist")) probability -= 0.1;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate conflict probability
 * Factors: military strength, territorial proximity, resource competition, past conflicts, aggressive traits
 */
export function calculateConflictProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceCivilization, sourceEvent } = context;
  let probability = 0.05;

  // Military capability (0-0.25)
  const sourceStrength = sourceCivilization.militaryStrength || 0;
  const affectedStrength = affectedCivilization.militaryStrength || 0;
  const militaryAdvantage = sourceStrength / (sourceStrength + affectedStrength + 1);
  probability += militaryAdvantage * 0.25;

  // Existing hostility (0-0.2)
  const relationship = affectedCivilization.relationships?.get(sourceCivilization.id);
  if (relationship && relationship.alignment < -0.5) {
    probability += 0.2;
  }

  // Resource competition (0-0.2)
  const sourceResources = (sourceCivilization.resources.food || 0) + (sourceCivilization.resources.trade || 0);
  const affectedResources = (affectedCivilization.resources.food || 0) + (affectedCivilization.resources.trade || 0);
  if (sourceResources < 100 && affectedResources > 100) {
    probability += 0.2;
  }

  // Traits (±0.15)
  if (sourceCivilization.traits?.includes("aggressive")) probability += 0.15;
  if (sourceCivilization.traits?.includes("peaceful")) probability -= 0.15;
  if (affectedCivilization.traits?.includes("defensive")) probability += 0.1;

  // Event type (0-0.15)
  if (sourceEvent.eventType === "territorial_expansion") probability += 0.15;
  if (sourceEvent.eventType === "resource_discovery") probability += 0.1;
  if (sourceEvent.eventType === "cultural_shift") probability -= 0.05;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate economic crisis probability
 * Factors: trade disruption, resource depletion, debt, market collapse
 */
export function calculateEconomicCrisisProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceEvent, allCivilizations } = context;
  let probability = 0.05;

  // Trade dependency (0-0.25)
  const trade = affectedCivilization.resources.trade || 0;
  const totalResources = (affectedCivilization.resources.food || 0) + (affectedCivilization.resources.technology || 0) + trade;
  const tradeDependency = trade / (totalResources + 1);
  probability += tradeDependency * 0.25;

  // Resource depletion (0-0.2)
  const food = affectedCivilization.resources.food || 100;
  const population = affectedCivilization.resources.population || 1000;
  const foodPerCapita = food / (population / 1000000);
  if (foodPerCapita < 10) {
    probability += 0.2;
  }

  // Trade route disruption (0-0.2)
  if (sourceEvent.eventType === "war" || sourceEvent.eventType === "territorial_expansion") {
    probability += 0.15;
  }

  // Technology level (0-0.15)
  const technology = affectedCivilization.resources.technology || 1;
  const economicResilience = Math.min(1, technology / 10);
  probability -= economicResilience * 0.15;

  // Traits (±0.1)
  if (affectedCivilization.traits?.includes("mercantile")) probability += 0.1;
  if (affectedCivilization.traits?.includes("self-sufficient")) probability -= 0.1;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate technological advancement probability
 * Factors: existing tech level, innovation traits, resource investment, cultural focus
 */
export function calculateTechnologicalAdvancementProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceEvent } = context;
  let probability = 0.05;

  // Technology level (0-0.2)
  const technology = affectedCivilization.resources.technology || 1;
  const techGrowthPotential = Math.max(0, 1 - technology / 10);
  probability += techGrowthPotential * 0.2;

  // Innovation traits (0-0.25)
  if (affectedCivilization.traits?.includes("innovative")) probability += 0.25;
  if (affectedCivilization.traits?.includes("conservative")) probability -= 0.15;

  // Resource investment (0-0.2)
  const resources = affectedCivilization.resources.technology || 0;
  if (resources > 50) probability += 0.2;

  // Cultural focus (0-0.15)
  if (affectedCivilization.strategy?.innovative > 0.6) {
    probability += 0.15;
  }

  // Event type (0-0.1)
  if (sourceEvent.eventType === "discovery" || sourceEvent.eventType === "first_contact") {
    probability += 0.1;
  }

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate cultural shift probability
 * Factors: cultural influence, population diversity, external contact, internal cohesion
 */
export function calculateCulturalShiftProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceCivilization, sourceEvent } = context;
  let probability = 0.1;

  // Cultural influence from source (0-0.25)
  const sourceCulture = sourceCivilization.resources.culture || 0;
  const affectedCulture = affectedCivilization.resources.culture || 0;
  const cultureInfluence = sourceCulture / (sourceCulture + affectedCulture + 1);
  probability += cultureInfluence * 0.25;

  // Internal cohesion (0-0.2)
  const unity = affectedCivilization.unityCoefficient ?? 0.5;
  if (unity < 0.5) {
    probability += 0.2;
  }

  // External contact (0-0.15)
  if (sourceEvent.eventType === "first_contact" || sourceEvent.eventType === "cultural_exchange") {
    probability += 0.15;
  }

  // Traits (±0.15)
  if (affectedCivilization.traits?.includes("adaptive")) probability += 0.15;
  if (affectedCivilization.traits?.includes("traditional")) probability -= 0.15;

  // Diversity (0-0.1)
  const relationships = affectedCivilization.relationships?.size || 0;
  if (relationships > 5) probability += 0.1;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate power vacuum probability
 * Factors: civilization collapse, leadership loss, power structure instability
 */
export function calculatePowerVacuumProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceEvent } = context;
  let probability = 0.02;

  // Civilization health (0-0.4)
  const survival = affectedCivilization.resources.population || 1000;
  const militaryStrength = affectedCivilization.militaryStrength || 0;
  const culturalInfluence = affectedCivilization.culturalInfluence || 0;
  const totalPower = survival + militaryStrength + culturalInfluence;
  
  if (totalPower < 100) {
    probability += 0.4;
  } else if (totalPower < 500) {
    probability += 0.2;
  }

  // Internal stability (0-0.2)
  const unity = affectedCivilization.unityCoefficient ?? 0.5;
  if (unity < 0.3) {
    probability += 0.2;
  }

  // Event type (0-0.3)
  if (sourceEvent.eventType === "extinction" || sourceEvent.eventType === "collapse") {
    probability += 0.3;
  }
  if (sourceEvent.eventType === "war" && sourceEvent.importance >= 8) {
    probability += 0.2;
  }

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate territorial expansion probability
 * Factors: military strength, available territory, expansionist traits, recent victories
 */
export function calculateTerritorialExpansionProbability(context: ConsequenceContext): number {
  const { affectedCivilization, sourceCivilization, allCivilizations } = context;
  let probability = 0.05;

  // Military capability (0-0.25)
  const military = sourceCivilization.militaryStrength || 0;
  probability += Math.min(0.25, military / 100);

  // Expansionist traits (0-0.2)
  if (sourceCivilization.traits?.includes("expansionist")) probability += 0.2;
  if (sourceCivilization.traits?.includes("isolationist")) probability -= 0.15;

  // Strategy (0-0.2)
  if (sourceCivilization.strategy?.expansionist > 0.6) {
    probability += 0.2;
  }

  // Available territory (0-0.15)
  let neighborCount = 0;
  if (sourceCivilization.relationships) {
    neighborCount = sourceCivilization.relationships.size;
  }
  const territoryAvailable = Math.max(0, 1 - neighborCount / 10);
  probability += territoryAvailable * 0.15;

  // Recent victories (0-0.1)
  // Count recent war victories in events
  probability += 0.05; // Placeholder for victory tracking

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate plague probability
 * Factors: population density, sanitation/technology, trade routes, environmental conditions
 */
export function calculatePlagueProbability(context: ConsequenceContext): number {
  const { affectedCivilization } = context;
  let probability = 0.02;

  // Population density (0-0.3)
  const population = affectedCivilization.resources.population || 1000;
  const populationDensity = Math.min(1, population / 100000000);
  probability += populationDensity * 0.3;

  // Sanitation/technology (0-0.2)
  const technology = affectedCivilization.resources.technology || 1;
  const sanitationLevel = Math.min(1, technology / 10);
  probability -= sanitationLevel * 0.2;

  // Trade connectivity (0-0.15)
  const trade = affectedCivilization.resources.trade || 0;
  if (trade > 50) probability += 0.15;

  // Traits (±0.1)
  if (affectedCivilization.traits?.includes("isolated")) probability -= 0.1;
  if (affectedCivilization.traits?.includes("urban")) probability += 0.1;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate discovery probability
 * Factors: exploration traits, technology level, available resources, scientific focus
 */
export function calculateDiscoveryProbability(context: ConsequenceContext): number {
  const { affectedCivilization } = context;
  let probability = 0.05;

  // Technology level (0-0.2)
  const technology = affectedCivilization.resources.technology || 1;
  probability += Math.min(0.2, technology / 50);

  // Innovation traits (0-0.25)
  if (affectedCivilization.traits?.includes("exploratory")) probability += 0.25;
  if (affectedCivilization.traits?.includes("conservative")) probability -= 0.1;

  // Scientific focus (0-0.2)
  if (affectedCivilization.strategy?.innovative > 0.7) {
    probability += 0.2;
  }

  // Available resources (0-0.15)
  const resources = affectedCivilization.resources.technology || 0;
  if (resources > 50) probability += 0.15;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate all consequence probabilities
 */
export function calculateAllConsequenceProbabilities(context: ConsequenceContext): Record<string, number> {
  return {
    migration: calculateMigrationProbability(context),
    alliance: calculateAllianceProbability(context),
    conflict: calculateConflictProbability(context),
    economic_crisis: calculateEconomicCrisisProbability(context),
    technological_advancement: calculateTechnologicalAdvancementProbability(context),
    cultural_shift: calculateCulturalShiftProbability(context),
    power_vacuum: calculatePowerVacuumProbability(context),
    territorial_expansion: calculateTerritorialExpansionProbability(context),
    plague: calculatePlagueProbability(context),
    discovery: calculateDiscoveryProbability(context),
  };
}

/**
 * Select consequence type based on weighted probability distribution
 */
export function selectConsequenceByWeightedProbability(
  probabilities: Record<string, number>
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
