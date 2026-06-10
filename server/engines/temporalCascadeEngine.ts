/**
 * Temporal Cascade Engine
 * Models time delays, feedback loops, and civilization state updates from event consequences
 * 
 * PRINCIPLE: Events don't happen instantly; cascades unfold over time
 * - Consequences manifest at calculated delays
 * - Civilization state updates based on event outcomes
 * - Feedback loops create secondary effects
 * - Long-term trends emerge from accumulated events
 */

import type { CivilizationState, EventNode } from "../../types/narrative";

export interface TemporalEvent {
  event: EventNode;
  manifestationYear: number;
  status: "pending" | "manifested" | "resolved";
  resolutionYear?: number;
  cascadeImpact?: CivilizationStateUpdate;
}

export interface CivilizationStateUpdate {
  populationChange: number; // Absolute change
  foodChange: number;
  technologyChange: number;
  cultureChange: number;
  militaryChange: number;
  tradeChange: number;
  unityChange: number; // -1 to 1
  traitChanges: Array<{ trait: string; added: boolean }>;
  relationshipChanges: Array<{
    civilizationId: string;
    alignmentChange: number; // -1 to 1
  }>;
}

export interface FeedbackLoop {
  sourceEventId: string;
  triggeredEventId: string;
  loopType: "positive" | "negative" | "oscillating";
  strength: number; // 0-1
  triggerThreshold: number; // What condition triggers the loop
  currentStrength: number; // Current amplification factor
}

/**
 * Calculate civilization state changes from an event
 */
export function calculateStateUpdate(
  event: EventNode,
  affectedCivilization: CivilizationState
): CivilizationStateUpdate {
  const update: CivilizationStateUpdate = {
    populationChange: 0,
    foodChange: 0,
    technologyChange: 0,
    cultureChange: 0,
    militaryChange: 0,
    tradeChange: 0,
    unityChange: 0,
    traitChanges: [],
    relationshipChanges: [],
  };

  // Event type determines state changes
  switch (event.eventType) {
    case "war":
    case "conflict":
      // War reduces population, military, food, unity
      update.populationChange = -Math.floor(affectedCivilization.resources.population * 0.05);
      update.militaryChange = -Math.floor(affectedCivilization.militaryStrength * 0.1);
      update.foodChange = -Math.floor(affectedCivilization.resources.food * 0.15);
      update.unityChange = -0.2;
      if (event.importance >= 7) {
        update.traitChanges.push({ trait: "militaristic", added: true });
      }
      break;

    case "migration":
      // Migration reduces population locally, increases elsewhere
      update.populationChange = -Math.floor(affectedCivilization.resources.population * 0.1);
      update.unityChange = -0.15;
      break;

    case "alliance":
      // Alliance improves trade, culture, unity
      update.tradeChange = Math.floor(((affectedCivilization.resources?.trade as number) ?? 0) * 0.2);
      update.cultureChange = Math.floor(affectedCivilization.resources.culture * 0.1);
      update.unityChange = 0.1;
      break;

    case "economic_crisis":
      // Economic crisis reduces food, trade, population
      update.foodChange = -Math.floor(affectedCivilization.resources.food * 0.3);
      update.tradeChange = -Math.floor(((affectedCivilization.resources?.trade as number) ?? 0) * 0.4);
      update.populationChange = -Math.floor(affectedCivilization.resources.population * 0.03);
      update.unityChange = -0.25;
      break;

    case "technological_advancement":
      // Tech advancement increases technology, culture, trade potential
      update.technologyChange = Math.floor(affectedCivilization.resources.technology * 0.2);
      update.cultureChange = Math.floor(affectedCivilization.resources.culture * 0.1);
      update.tradeChange = Math.floor(((affectedCivilization.resources?.trade as number) ?? 0) * 0.15);
      update.traitChanges.push({ trait: "innovative", added: true });
      break;

    case "cultural_shift":
      // Cultural shift changes traits, unity, culture
      update.cultureChange = Math.floor(affectedCivilization.resources.culture * 0.25);
      update.unityChange = -0.1; // Short-term disruption
      update.traitChanges.push({ trait: "adaptive", added: true });
      break;

    case "power_vacuum":
      // Power vacuum reduces military, unity, culture
      update.militaryChange = -Math.floor(affectedCivilization.militaryStrength * 0.2);
      update.unityChange = -0.3;
      update.cultureChange = -Math.floor(affectedCivilization.resources.culture * 0.15);
      break;

    case "territorial_expansion":
      // Expansion increases military, population, trade
      update.militaryChange = Math.floor(affectedCivilization.militaryStrength * 0.15);
      update.populationChange = Math.floor(affectedCivilization.resources.population * 0.05);
      update.tradeChange = Math.floor(((affectedCivilization.resources?.trade as number) ?? 0) * 0.2);
      update.unityChange = 0.1;
      break;

    case "plague":
      // Plague severely reduces population, food, trade
      update.populationChange = -Math.floor(affectedCivilization.resources.population * 0.15);
      update.foodChange = -Math.floor(affectedCivilization.resources.food * 0.2);
      update.tradeChange = -Math.floor(((affectedCivilization.resources?.trade as number) ?? 0) * 0.3);
      update.unityChange = -0.2;
      break;

    case "discovery":
      // Discovery increases technology, culture, trade
      update.technologyChange = Math.floor(affectedCivilization.resources.technology * 0.15);
      update.cultureChange = Math.floor(affectedCivilization.resources.culture * 0.2);
      update.tradeChange = Math.floor(((((affectedCivilization.resources?.trade as number) ?? 0) as number) ?? 0) * 0.1);
      update.unityChange = 0.1;
      break;

    case "first_contact":
      // First contact increases culture, trade, but may reduce unity
      update.cultureChange = Math.floor(affectedCivilization.resources.culture * 0.3);
      // Trade changes handled by trade network engine
      update.unityChange = -0.05; // Slight disruption from unknown contact
      break;
  }

  // Event importance amplifies changes
  const importanceMultiplier = 0.5 + (event.importance / 10) * 0.5; // 0.5-1.0
  update.populationChange = Math.floor(update.populationChange * importanceMultiplier);
  update.foodChange = Math.floor(update.foodChange * importanceMultiplier);
  update.technologyChange = Math.floor(update.technologyChange * importanceMultiplier);
  update.cultureChange = Math.floor(update.cultureChange * importanceMultiplier);
  update.militaryChange = Math.floor(update.militaryChange * importanceMultiplier);
  // Trade changes handled by trade network engine
  update.unityChange = update.unityChange * importanceMultiplier;

  return update;
}

/**
 * Apply state update to civilization
 */
export function applyStateUpdate(
  civilization: CivilizationState,
  update: CivilizationStateUpdate
): CivilizationState {
  const updated = { ...civilization };

  // Apply resource changes
  updated.resources = { ...civilization.resources };
  updated.resources.population = Math.max(0, (updated.resources.population || 0) + update.populationChange);
  updated.resources.food = Math.max(0, (updated.resources.food || 0) + update.foodChange);
  updated.resources.technology = Math.max(0, (updated.resources.technology || 0) + update.technologyChange);
  updated.resources.culture = Math.max(0, (updated.resources.culture || 0) + update.cultureChange);
  // Trade updates handled by trade network engine

  // Apply military change
  updated.militaryStrength = Math.max(0, (updated.militaryStrength || 0) + update.militaryChange);

  // Apply unity change
  updated.unityCoefficient = Math.max(0, Math.min(1, (updated.unityCoefficient ?? 0.5) + update.unityChange));

  // Apply trait changes
  if (update.traitChanges.length > 0) {
    updated.traits = [...(civilization.traits || [])];
    for (const change of update.traitChanges) {
      if (change.added) {
        if (!updated.traits.includes(change.trait)) {
          updated.traits.push(change.trait);
        }
      } else {
        updated.traits = updated.traits.filter(t => t !== change.trait);
      }
    }
  }

  // Apply relationship changes
  if (update.relationshipChanges.length > 0) {
    updated.relationships = new Map(civilization.relationships || []);
    for (const change of update.relationshipChanges) {
      const existing = updated.relationships.get(change.civilizationId);
      if (existing) {
        existing.alignment = Math.max(-1, Math.min(1, existing.alignment + change.alignmentChange));
      }
    }
  }

  return updated;
}

/**
 * Detect feedback loops that might trigger secondary events
 */
export function detectFeedbackLoops(
  event: EventNode,
  affectedCivilization: CivilizationState,
  allCivilizations: Map<string, CivilizationState>
): FeedbackLoop[] {
  const loops: FeedbackLoop[] = [];

  // Economic crisis → Migration feedback loop
  if (event.eventType === "economic_crisis") {
    const foodScarcity = (affectedCivilization.resources.food || 100) / (affectedCivilization.resources.population || 1000);
    if (foodScarcity < 0.1) {
      loops.push({
        sourceEventId: event.id,
        triggeredEventId: "", // Will be generated
        loopType: "positive",
        strength: 0.7,
        triggerThreshold: 0.1,
        currentStrength: 0.7,
      });
    }
  }

  // War → Conflict escalation feedback loop
  if (event.eventType === "war" || event.eventType === "conflict") {
    loops.push({
      sourceEventId: event.id,
      triggeredEventId: "",
      loopType: "positive",
      strength: 0.5,
      triggerThreshold: 0.5,
      currentStrength: 0.5,
    });
  }

  // Plague → Economic crisis feedback loop
  if (event.eventType === "plague") {
    loops.push({
      sourceEventId: event.id,
      triggeredEventId: "",
      loopType: "positive",
      strength: 0.6,
      triggerThreshold: 0.15,
      currentStrength: 0.6,
    });
  }

  // Alliance → Trade growth feedback loop
  if (event.eventType === "alliance") {
    loops.push({
      sourceEventId: event.id,
      triggeredEventId: "",
      loopType: "positive",
      strength: 0.4,
      triggerThreshold: 0.2,
      currentStrength: 0.4,
    });
  }

  // Technological advancement → Discovery feedback loop
  if (event.eventType === "technological_advancement") {
    loops.push({
      sourceEventId: event.id,
      triggeredEventId: "",
      loopType: "positive",
      strength: 0.5,
      triggerThreshold: 0.15,
      currentStrength: 0.5,
    });
  }

  // Population growth → Resource pressure feedback loop (oscillating)
  if (affectedCivilization.resources.population > 1000000) {
    loops.push({
      sourceEventId: event.id,
      triggeredEventId: "",
      loopType: "oscillating",
      strength: 0.3,
      triggerThreshold: 0.5,
      currentStrength: 0.3,
    });
  }

  return loops;
}

/**
 * Calculate long-term trend based on accumulated events
 */
export function calculateLongTermTrend(
  civilization: CivilizationState,
  recentEvents: EventNode[],
  timeWindow: number // Years to consider
): {
  populationTrend: "growing" | "stable" | "declining";
  technologyTrend: "advancing" | "stable" | "regressing";
  culturalTrend: "flourishing" | "stable" | "declining";
  militaryTrend: "strengthening" | "stable" | "weakening";
  unityTrend: "improving" | "stable" | "deteriorating";
} {
  // Filter events within time window
  const currentYear = civilization.currentYear || 0;
  const relevantEvents = recentEvents.filter(e => e.year > currentYear - timeWindow);

  // Count event types
  const eventCounts: Record<string, number> = {};
  for (const event of relevantEvents) {
    eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
  }

  // Analyze trends
  const populationEvents = (eventCounts.migration || 0) + (eventCounts.plague || 0);
  const growthEvents = (eventCounts.discovery || 0) + (eventCounts.technological_advancement || 0);
  const declineEvents = (eventCounts.war || 0) + (eventCounts.economic_crisis || 0);

  const populationTrend =
    populationEvents > growthEvents ? "declining" :
    growthEvents > populationEvents ? "growing" :
    "stable";

  const technologyTrend =
    eventCounts.technological_advancement > 2 ? "advancing" :
    eventCounts.technological_advancement > 0 ? "stable" :
    "regressing";

  const culturalTrend =
    eventCounts.cultural_shift > 2 ? "flourishing" :
    eventCounts.cultural_shift > 0 ? "stable" :
    "declining";

  const militaryTrend =
    eventCounts.war > 3 ? "strengthening" :
    eventCounts.war > 0 ? "stable" :
    "weakening";

  const unityTrend =
    declineEvents > growthEvents ? "deteriorating" :
    growthEvents > declineEvents ? "improving" :
    "stable";

  return {
    populationTrend,
    technologyTrend,
    culturalTrend,
    militaryTrend,
    unityTrend,
  };
}

/**
 * Calculate civilization lifecycle phase based on state and trends
 */
export function calculateCivilizationPhase(
  civilization: CivilizationState,
  trends: ReturnType<typeof calculateLongTermTrend>
): "emergence" | "growth" | "peak" | "decline" | "extinction" {
  const technology = civilization.resources.technology || 1;
  const population = civilization.resources.population || 1000;
  const unity = civilization.unityCoefficient ?? 0.5;

  // Extinction
  if (population < 1000 || unity < 0.1) {
    return "extinction";
  }

  // Decline
  if (trends.populationTrend === "declining" || trends.unityTrend === "deteriorating") {
    if (technology > 5 && population > 100000) {
      return "decline";
    }
  }

  // Peak
  if (technology > 7 && population > 1000000 && unity > 0.7) {
    return "peak";
  }

  // Growth
  if (trends.populationTrend === "growing" && trends.technologyTrend === "advancing") {
    return "growth";
  }

  // Emergence
  return "emergence";
}

/**
 * Estimate when a civilization will reach next phase
 */
export function estimatePhaseTransition(
  civilization: CivilizationState,
  currentPhase: string,
  trends: ReturnType<typeof calculateLongTermTrend>
): number {
  // Years until next phase transition
  const baseYears = 50;

  switch (currentPhase) {
    case "emergence":
      return trends.technologyTrend === "advancing" ? baseYears * 0.5 : baseYears;
    case "growth":
      return trends.populationTrend === "growing" ? baseYears * 0.7 : baseYears * 1.5;
    case "peak":
      return trends.unityTrend === "stable" ? baseYears * 2 : baseYears * 0.8;
    case "decline":
      return trends.populationTrend === "declining" ? baseYears * 0.5 : baseYears * 2;
    case "extinction":
      return 0; // Already extinct
    default:
      return baseYears;
  }
}
