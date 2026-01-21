/**
 * Narrative System Type Definitions
 * Core types for events, civilizations, figures, and achievements
 */

/**
 * Event Node - represents a historical event
 */
export interface EventNode {
  id: string;
  galaxyId: number;
  year: number;

  // Narrative
  title: string;
  description: string;
  narrative: string;

  // Causality
  causes: string[];
  consequences: string[];
  causalStrength: number;

  // Harmonic Properties
  harmonyFrequency: number;
  phaseCoherence: number;
  resonanceVector: {
    sound: number;
    light: number;
    time: number;
  };

  // Authenticity
  unityCoefficient: number;
  constraintSatisfaction: number;
  sacredGapScore: number;

  // Context
  involvedCivilizations: number[];
  involvedSpecies: number[];
  involvedFigures: number[];
  eventType: string;
  importance: number;

  // Generation
  generatedBy: "cascade" | "opportunity" | "llm" | "user";
  confidenceScore: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Civilization State
 */
export interface CivilizationState {
  id: number;
  galaxyId: number;
  speciesId: number;

  name: string;
  foundedYear: number;
  currentYear: number;
  status: string;

  // Fitness
  survivalFitness?: number;
  culturalFitness?: number;
  technologicalFitness?: number;
  expansionFitness?: number;

  // Internal State
  unityCoefficient?: number;
  phaseCoherence?: number;
  harmonyFrequency?: number;

  // Relationships
  relationships?: Map<number, {
    alignment: number;
    harmonyDistance: number;
    causalCoupling: number;
    lastInteraction: number;
  }>;

  // Resources
  resources: {
    population: number;
    food: number;
    technology: number;
    culture: number;
    military: number;
  };

  // Strategy
  strategy: {
    expansionist: number;
    peaceful: number;
    innovative: number;
    cultural: number;
  };

  // Attributes
  technologyLevel: number;
  militaryStrength: number;
  culturalInfluence: number;
  traits?: string[];

  // Figures
  currentLeader?: number;
  notableFigures?: number[];
}

/**
 * Notable Figure
 */
export interface NotableFigure {
  id: number;
  galaxyId: number;
  civilizationId: number;
  speciesId: number;

  // Demographics
  name: string;
  nameOrigin?: string;
  birthYear: number;
  deathYear?: number;

  // Archetype & Role
  archetype: "monarch" | "general" | "prophet" | "philosopher" | "scientist" | "artist" | "merchant" | "diplomat" | "rebel" | "sage" | "explorer" | "architect";
  primaryRole?: string;
  secondaryRoles?: string[];

  // Attributes
  attributes: {
    charisma: number;
    intellect: number;
    courage: number;
    wisdom: number;
    creativity: number;
    ambition: number;
    compassion: number;
    ruthlessness: number;
  };

  // Legacy
  achievements?: Achievement[];
  influence?: number;
  legacyScore?: number;

  // Relationships
  mentors?: number[];
  students?: number[];
  allies?: number[];
  rivals?: number[];
  family?: {
    parents?: number[];
    children?: number[];
    spouse?: number;
    siblings?: number[];
  };

  // Genealogy
  generation?: number;
  lineageId?: string;

  // Events
  birthEventId?: number;
  deathEventId?: number;
  majorEvents?: number[];

  // Generation
  generatedBy?: "event" | "genealogy" | "opportunity" | "user";
  confidenceScore?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Achievement
 */
export interface Achievement {
  id: number;
  figureId: number;
  year: number;

  title: string;
  description: string;
  achievementType: string;

  civilizationImpact?: number;
  historicalSignificance?: number;

  triggeredEvents?: number[];
  enabledTechnologies?: number[];
  influencedBeliefs?: number[];

  collaborators?: number[];
  opposition?: number[];

  createdAt?: Date;
}

/**
 * Genealogy
 */
export interface Genealogy {
  id: number;
  galaxyId: number;
  civilizationId: number;

  lineageName: string;
  founderFigureId: number;

  generations: Array<{
    generation: number;
    members: number[];
  }>;

  dominantTraits?: string[];
  culturalInfluence?: number;
  powerDuration?: number;

  majorAchievements?: Achievement[];
  conflicts?: string[];
  alliances?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Historical Memory
 */
export interface HistoricalMemory {
  id: number;
  figureId: number;
  civilizationId: number;

  memoryStrength: number;
  publicPerception?: string;
  mythologization: number;

  lastMentionedYear?: number;
  mentionCount: number;

  currentInfluence?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Harmonic Network
 */
export interface HarmonicNetwork {
  galaxyId: number;
  baseFrequency: number;
  solfeggio: number[];

  nodes: Map<number, CivilizationState>;
  edges: Map<string, {
    source: number;
    target: number;
    strength: number;
    harmonyDistance: number;
    lastInteractionYear: number;
    eventTypes: string[];
  }>;

  totalHarmony: number;
  dissonanceLevel: number;
  evolutionPhase: number;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Event Opportunity
 */
export interface EventOpportunity {
  year: number;
  civilization: CivilizationState;
  type: string;
  reason: string;
  priority: number;
}

/**
 * Figure Opportunity
 */
export interface FigureOpportunity {
  year: number;
  civilization: CivilizationState;
  requiredArchetype: string;
  reason: string;
  priority: number;
}

/**
 * Generation Context
 */
export interface GenerationContext {
  civilization: CivilizationState;
  recentEvents: EventNode[];
  historicalContext: string;
  harmonyNetwork: HarmonicNetwork;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  resourcesOK: boolean;
  capabilitiesOK: boolean;
  relationshipsOK: boolean;
  temporalOK: boolean;
  violations: string[];
}

/**
 * Fitness Scores
 */
export interface FitnessScores {
  survival: number;
  cultural: number;
  technological: number;
  expansion: number;
}
