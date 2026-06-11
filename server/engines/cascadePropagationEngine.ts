/**
 * Cascade Propagation Engine
 * Spreads event consequences through civilization networks via ripple effects
 * 
 * PRINCIPLE: Events ripple outward through connected civilizations
 * - Direct participants experience immediate consequences
 * - Trade partners experience delayed economic consequences
 * - Cultural neighbors experience cultural shifts
 * - Military neighbors experience security consequences
 * - Distant civilizations experience attenuated effects
 */

import type { CivilizationState, EventNode } from "../../types/narrative";
import { calculateAllConsequenceProbabilities, selectConsequenceByWeightedProbability } from "./completeConsequenceProbabilities";

export interface CascadeWave {
  waveNumber: number;
  affectedCivilizations: string[];
  consequences: EventNode[];
  propagationDelay: number; // Years until this wave manifests
}

export interface CascadeContext {
  sourceEvent: EventNode;
  sourceCivilization: CivilizationState;
  allCivilizations: Map<string, CivilizationState>;
  allEvents: EventNode[];
  maxWaves: number; // How many ripples to propagate
  maxCascadeSize: number; // Maximum total events generated
}

/**
 * Calculate distance between two civilizations in the network
 * Considers: direct relationships, trade routes, cultural connections, military alliances
 */
export function calculateNetworkDistance(
  civ1: CivilizationState,
  civ2: CivilizationState,
  allCivilizations: Map<string, CivilizationState>
): number {
  // Direct relationship
  const relationship = civ1.relationships?.get(civ2.id);
  if (relationship) {
    // Closer relationships = shorter distance
    const alignmentDistance = 1 - (relationship.alignment + 1) / 2; // -1 to 1 → 0 to 1
    return alignmentDistance * 0.5; // 0-0.5
  }

  // Indirect path through common neighbors
  let shortestPath = Infinity;
  if (civ1.relationships && civ2.relationships) {
    for (const [commonCivId] of civ1.relationships) {
      if (civ2.relationships.has(commonCivId)) {
        shortestPath = Math.min(shortestPath, 2);
      }
    }
  }

  // Trade route distance
  if (civ1.resources?.trade && civ2.resources?.trade) {
    shortestPath = Math.min(shortestPath, 1.5);
  }

  // Geographic/cultural distance (fallback)
  if (shortestPath === Infinity) {
    shortestPath = 3 + Math.random() * 2; // 3-5
  }

  return Math.min(1, shortestPath / 5); // Normalize to 0-1
}

/**
 * Calculate propagation probability based on network distance and relationship type
 */
export function calculatePropagationProbability(
  sourceEvent: EventNode,
  sourceCivilization: CivilizationState,
  affectedCivilization: CivilizationState,
  networkDistance: number
): number {
  let probability = 1 - networkDistance; // Closer = more likely

  // Event type influences propagation
  if (sourceEvent.eventType === "war" || sourceEvent.eventType === "conflict") {
    // Military events propagate to military neighbors
    probability *= 1.2;
  } else if (sourceEvent.eventType === "cultural_shift" || sourceEvent.eventType === "discovery") {
    // Cultural events propagate to cultural neighbors
    probability *= 1.1;
  } else if (sourceEvent.eventType === "economic_crisis" || sourceEvent.eventType === "trade_disruption") {
    // Economic events propagate to trade partners
    probability *= 1.3;
  } else if (sourceEvent.eventType === "plague" || sourceEvent.eventType === "environmental_disaster") {
    // Disasters propagate widely
    probability *= 1.4;
  }

  // Event importance affects propagation distance
  const importanceMultiplier = 0.5 + (sourceEvent.importance / 10) * 0.5; // 0.5-1.0
  probability *= importanceMultiplier;

  return Math.min(1, Math.max(0, probability));
}

/**
 * Calculate propagation delay (years until consequence manifests)
 * Depends on: network distance, consequence type, civilization technology
 */
export function calculatePropagationDelay(
  networkDistance: number,
  consequenceType: string,
  affectedCivilization: CivilizationState
): number {
  // Base delay increases with distance
  let delay = networkDistance * 50; // 0-50 years

  // Consequence type affects delay
  const delayMultipliers: Record<string, number> = {
    migration: 1.0,
    alliance: 0.5,
    conflict: 0.8,
    economic_crisis: 0.7,
    technological_advancement: 2.0,
    cultural_shift: 1.5,
    power_vacuum: 0.3,
    territorial_expansion: 1.2,
    plague: 0.4,
    discovery: 1.8,
  };

  delay *= delayMultipliers[consequenceType] || 1.0;

  // Technology speeds up information/consequence propagation
  const technology = affectedCivilization.resources.technology || 1;
  const speedFactor = Math.max(0.2, 1 - technology / 20); // Higher tech = faster
  delay *= speedFactor;

  return Math.ceil(delay);
}

/**
 * Generate consequence event for affected civilization
 */
export function generateConsequenceEvent(
  sourceEvent: EventNode,
  consequenceType: string,
  affectedCivilization: CivilizationState,
  propagationDelay: number
): EventNode {
  const consequenceYear = sourceEvent.year + propagationDelay;

  // Map consequence type to descriptive title
  const titles: Record<string, string> = {
    migration: `Migration wave from ${sourceEvent.title}`,
    alliance: `Alliance formed following ${sourceEvent.title}`,
    conflict: `Conflict sparked by ${sourceEvent.title}`,
    economic_crisis: `Economic crisis following ${sourceEvent.title}`,
    technological_advancement: `Technological advancement inspired by ${sourceEvent.title}`,
    cultural_shift: `Cultural shift from ${sourceEvent.title}`,
    power_vacuum: `Power vacuum created by ${sourceEvent.title}`,
    territorial_expansion: `Territorial expansion following ${sourceEvent.title}`,
    plague: `Plague outbreak following ${sourceEvent.title}`,
    discovery: `Discovery following ${sourceEvent.title}`,
  };

  return {
    id: `cascade_${sourceEvent.id}_${affectedCivilization.id}_${Date.now()}`,
    galaxyId: sourceEvent.galaxyId,
    year: consequenceYear,
    title: titles[consequenceType] || `Consequence of ${sourceEvent.title}`,
    description: `This event is a consequence of: ${sourceEvent.title}`,
    narrative: "", // Will be filled by LLM narrative generator
    causes: [sourceEvent.id],
    consequences: [],
    causalStrength: 0.8,
    harmonyFrequency: affectedCivilization.harmonyFrequency || 0,
    phaseCoherence: 0.7,
    resonanceVector: { sound: 0.6, light: 0.6, time: 0.6 },
    unityCoefficient: 0.6,
    constraintSatisfaction: 0.85,
    sacredGapScore: 0.4,
    involvedCivilizations: [affectedCivilization.id],
    involvedSpecies: [],
    involvedFigures: [],
    eventType: consequenceType,
    importance: Math.max(1, sourceEvent.importance - 1), // Consequences slightly less important
    generatedBy: "cascade",
    confidenceScore: 0.75,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Propagate event through one wave of the cascade
 * Returns all new events generated in this wave
 */
export function propagateWave(
  sourceEvent: EventNode,
  sourceCivilization: CivilizationState,
  allCivilizations: Map<string, CivilizationState>,
  allEvents: EventNode[],
  waveNumber: number,
  previousWaveAffected: Set<string>
): CascadeWave {
  const newEvents: EventNode[] = [];
  const affectedCivilizations: string[] = [];

  // Iterate through all civilizations
  for (const [civId, civ] of allCivilizations) {
    // Skip source civilization and already affected civilizations
    if (civId === String(sourceCivilization.id) || previousWaveAffected.has(civId)) {
      continue;
    }

    // Calculate network distance
    const networkDistance = calculateNetworkDistance(sourceCivilization, civ, allCivilizations);

    // Attenuation: waves get weaker with each propagation
    const waveAttenuation = Math.pow(0.7, waveNumber - 1); // Each wave is 70% as strong
    const attenuatedDistance = networkDistance / waveAttenuation;

    // Skip if too far away
    if (attenuatedDistance > 0.9) {
      continue;
    }

    // Calculate propagation probability
    const propagationProb = calculatePropagationProbability(
      sourceEvent,
      sourceCivilization,
      civ,
      attenuatedDistance
    );

    // Stochastic propagation
    if (Math.random() > propagationProb) {
      continue;
    }

    // This civilization is affected
    affectedCivilizations.push(civId);

    // Calculate consequence probabilities for this civilization
    const context = {
      sourceEvent,
      affectedCivilization: civ,
      sourceCivilization,
      allCivilizations,
      allEvents,
    };

    const probabilities = calculateAllConsequenceProbabilities(context);
    const consequenceType = selectConsequenceByWeightedProbability(probabilities);

    // Calculate propagation delay
    const delay = calculatePropagationDelay(attenuatedDistance, consequenceType, civ);

    // Generate consequence event
    const consequenceEvent = generateConsequenceEvent(sourceEvent, consequenceType, civ, delay);
    newEvents.push(consequenceEvent);
  }

  return {
    waveNumber,
    affectedCivilizations,
    consequences: newEvents,
    propagationDelay: Math.ceil(10 * waveNumber), // Waves manifest progressively
  };
}

/**
 * Propagate event cascade through all waves
 * Returns all cascade waves and generated events
 */
export function propagateCascade(context: CascadeContext): CascadeWave[] {
  const waves: CascadeWave[] = [];
  const allAffectedCivilizations = new Set<string>();
  let totalEvents = 0;

  // Initial wave includes direct participants
  allAffectedCivilizations.add(String(context.sourceCivilization.id));
  for (const civId of context.sourceEvent.involvedCivilizations) {
    allAffectedCivilizations.add(String(civId));
  }

  // Propagate through waves
  for (let waveNum = 1; waveNum <= context.maxWaves; waveNum++) {
    // Stop if we've generated too many events
    if (totalEvents >= context.maxCascadeSize) {
      break;
    }

    const wave = propagateWave(
      context.sourceEvent,
      context.sourceCivilization,
      context.allCivilizations,
      context.allEvents,
      waveNum,
      allAffectedCivilizations
    );

    // Stop if no new civilizations affected
    if (wave.affectedCivilizations.length === 0) {
      break;
    }

    // Add to affected set
    for (const civId of wave.affectedCivilizations) {
      allAffectedCivilizations.add(civId);
    }

    waves.push(wave);
    totalEvents += wave.consequences.length;
  }

  return waves;
}

/**
 * Calculate cascade statistics
 */
export function calculateCascadeStats(waves: CascadeWave[]): {
  totalWaves: number;
  totalAffectedCivilizations: number;
  totalEvents: number;
  maxPropagationDelay: number;
  averageEventImportance: number;
} {
  const affectedCivs = new Set<string>();
  let totalEvents = 0;
  let maxDelay = 0;
  let totalImportance = 0;

  for (const wave of waves) {
    for (const civId of wave.affectedCivilizations) {
      affectedCivs.add(civId);
    }
    totalEvents += wave.consequences.length;
    maxDelay = Math.max(maxDelay, wave.propagationDelay);
    for (const event of wave.consequences) {
      totalImportance += event.importance;
    }
  }

  return {
    totalWaves: waves.length,
    totalAffectedCivilizations: affectedCivs.size,
    totalEvents,
    maxPropagationDelay: maxDelay,
    averageEventImportance: totalEvents > 0 ? totalImportance / totalEvents : 0,
  };
}
