/**
 * Simulation Event Loop: The Unified Pipeline
 * 
 * This orchestrates the entire simulation by coordinating:
 * 1. Event generation and cascade detection
 * 2. Causal package building for narrative generation
 * 3. Multi-perspective narrative creation
 * 4. State updates across all systems
 * 5. Real-time event broadcasting
 * 
 * The loop runs at configurable speed and maintains perfect causal alignment
 * between mechanical simulation and narrative interpretation.
 */

import { EventEmitter } from 'events';
import { generateTraitProfile, calculateTraitInfluence, evolveTraits } from './enhancedTraitSystem';
import { createEmotionalState, destructiveFeedbackLoop, constructiveFeedbackLoop, detectBehaviorTriggers } from './emotionalStateSystem';
import { createEvolutionState, determineCivilizationPhase, checkPostScarcityAchievement, getPhaseModifiers } from './civilizationEvolution';
import { buildCausalPackage, generateMultiPerspectiveNarratives, validateNarrativeAgainstCausal } from './chroniclerNarrative';
import type { EventNode } from '../../types/narrative';

export interface SimulationConfig {
  galaxyId: string;
  civilizations: Array<{
    id: string;
    name: string;
    initialPopulation: number;
    initialTechnology: number;
    initialResources: number;
  }>;
  startYear: number;
  tickDuration: number; // milliseconds per simulation year
  cascadeThreshold: number; // 0-1, minimum significance for cascade detection
  narrativeEnabled: boolean;
}

export interface SimulationState {
  galaxyId: string;
  currentYear: number;
  tick: number;
  isRunning: boolean;
  speed: number; // 0.1 to 5.0
  civilizations: Map<string, CivilizationState>;
  events: EventNode[];
  cascades: CascadeInstance[];
  eventHistory: EventNode[];
}

export interface CivilizationState {
  id: string;
  name: string;
  year: number;
  population: number;
  technology: number;
  resources: number;
  culture: number;
  traitProfile: any;
  emotionalState: any;
  evolutionState: any;
  behaviors: BehaviorState[];
}

export interface BehaviorState {
  type: string;
  probability: number;
  triggered: boolean;
  consequence?: string;
}

export interface CascadeInstance {
  id: string;
  triggerId: string;
  year: number;
  events: EventNode[];
  severity: number; // 0-1
  affectedCivilizations: string[];
  status: 'active' | 'resolved' | 'ongoing';
}

export interface EventGenerationContext {
  civilization: CivilizationState;
  otherCivilizations: CivilizationState[];
  environmentalFactors: {
    resourceScarcity: number;
    threatLevel: number;
    isolationFactor: number;
  };
  historicalContext: EventNode[];
}

/**
 * The core Simulation Event Loop
 */
export class SimulationEventLoop extends EventEmitter {
  private config: SimulationConfig;
  private state: SimulationState;
  private isInitialized: boolean = false;
  private tickInterval: NodeJS.Timeout | null = null;
  private eventQueue: EventNode[] = [];

  constructor(config: SimulationConfig) {
    super();
    this.config = config;
    this.state = {
      galaxyId: config.galaxyId,
      currentYear: config.startYear,
      tick: 0,
      isRunning: false,
      speed: 1.0,
      civilizations: new Map(),
      events: [],
      cascades: [],
      eventHistory: [],
    };
  }

  /**
   * Initialize the simulation with all civilizations
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    for (const civConfig of this.config.civilizations) {
      const civState: CivilizationState = {
        id: civConfig.id,
        name: civConfig.name,
        year: this.config.startYear,
        population: civConfig.initialPopulation,
        technology: civConfig.initialTechnology,
        resources: civConfig.initialResources,
        culture: 50,
        traitProfile: generateTraitProfile(civConfig.id, {
          resourceAbundance: civConfig.initialResources / 100,
          threatLevel: 0.5,
          isolationFactor: Math.random(),
        }),
        emotionalState: createEmotionalState(civConfig.id),
        evolutionState: createEvolutionState(civConfig.id),
        behaviors: [],
      };

      this.state.civilizations.set(civConfig.id, civState);
    }

    this.isInitialized = true;
    this.emit('initialized', { galaxyId: this.config.galaxyId });
  }

  /**
   * Execute a single simulation tick
   * 
   * This is the heart of the event loop. Each tick:
   * 1. Generates potential events for each civilization
   * 2. Detects cascades from recent events
   * 3. Updates civilization states
   * 4. Generates narratives for significant events
   * 5. Broadcasts updates to listeners
   */
  async tick(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Simulation not initialized');
    }

    this.state.tick++;
    this.state.currentYear++;

    const tickEvents: EventNode[] = [];
    const tickCascades: CascadeInstance[] = [];

    // Phase 1: Generate events for each civilization
    for (const [civId, civState] of this.state.civilizations) {
      const context = this.buildEventGenerationContext(civState);
      const generatedEvents = await this.generateCivilizationEvents(civState, context);

      for (const event of generatedEvents) {
        tickEvents.push(event);
        this.state.events.push(event);
        this.state.eventHistory.push(event);

        // Emit event for real-time subscribers
        this.emit('event', {
          event,
          year: this.state.currentYear,
          tick: this.state.tick,
        });
      }
    }

    // Phase 2: Detect cascades from recent events
    for (const event of tickEvents) {
      if (event.causalStrength > this.config.cascadeThreshold) {
        const cascade = await this.detectAndPropagateCascade(event);
        if (cascade) {
          tickCascades.push(cascade);
          this.state.cascades.push(cascade);

          this.emit('cascade', {
            cascade,
            year: this.state.currentYear,
            tick: this.state.tick,
          });
        }
      }
    }

    // Phase 3: Update civilization states based on events
    for (const civState of Array.from(this.state.civilizations.values())) {
      await this.updateCivilizationState(civState, tickEvents, tickCascades);
    }

    // Phase 4: Generate narratives for significant events
    if (this.config.narrativeEnabled && tickEvents.length > 0) {
      for (const event of tickEvents) {
        if (event.importance >= 5) {
          // Only narrative for significant events
          try {
            const causalPackage = buildCausalPackage(event, {
              allCivilizations: Array.from(this.state.civilizations.values()),
              allEvents: this.state.eventHistory,
            });

            const narratives = await generateMultiPerspectiveNarratives(causalPackage);

            event.narrative = Object.values(narratives).join('\n\n');

            this.emit('narrative', {
              event,
              perspectives: narratives,
              year: this.state.currentYear,
            });
          } catch (error) {
            console.error(`Failed to generate narrative for event ${event.id}:`, error);
          }
        }
      }
    }

    // Phase 5: Emit tick summary
    this.emit('tickComplete', {
      year: this.state.currentYear,
      tick: this.state.tick,
      eventCount: tickEvents.length,
      cascadeCount: tickCascades.length,
      state: this.getStateSnapshot(),
    });
  }

  /**
   * Generate events for a specific civilization
   */
  private async generateCivilizationEvents(
    civState: CivilizationState,
    context: EventGenerationContext
  ): Promise<EventNode[]> {
    const events: EventNode[] = [];

    // Detect behavior triggers from emotional state
    const triggers = detectBehaviorTriggers(civState.emotionalState);

    for (const trigger of triggers) {
      if (Math.random() < trigger.probability) {
        const event = this.createEventFromTrigger(civState, trigger, context);
        if (event) {
          events.push(event);
        }
      }
    }

    // Generate random events based on environmental factors
    const randomEventProbability = 0.15 * (1 - civState.evolutionState.postScarcityAchieved ? 0.5 : 1);
    if (Math.random() < randomEventProbability) {
      const randomEvent = this.generateRandomEvent(civState, context);
      if (randomEvent) {
        events.push(randomEvent);
      }
    }

    return events;
  }

  /**
   * Create an event from a behavior trigger
   */
  private createEventFromTrigger(
    civState: CivilizationState,
    trigger: any,
    context: EventGenerationContext
  ): EventNode | null {
    const eventTypeMap: Record<string, string> = {
      risky_raids_possible: 'military_raid',
      internal_conflict_likely: 'civil_conflict',
      cultural_shift_imminent: 'cultural_shift',
      technological_breakthrough_possible: 'technological_advancement',
      diplomatic_opportunity: 'alliance_formed',
    };

    const eventType = eventTypeMap[trigger.behavior];
    if (!eventType) return null;

    const traitInfluence = calculateTraitInfluence(civState.traitProfile.traits, eventType, 0.5);
    const causalStrength = Math.min(1, trigger.probability * (1 + traitInfluence));

    return {
      id: `evt_${civState.id}_${Date.now()}_${Math.random()}`,
      title: `${civState.name}: ${eventType.replace(/_/g, ' ')}`,
      eventType,
      year: this.state.currentYear,
      importance: Math.round(trigger.probability * 10),
      causalStrength,
      constraintSatisfaction: 0.8,
      unityCoefficient: civState.evolutionState.postScarcityAchieved ? 0.9 : 0.6,
      involvedCivilizations: [civState.id as any],
      description: `Event triggered by ${trigger.behavior}`,
      narrative: '',
      causes: [],
      consequences: [],
      harmonyFrequency: 0.5,
      phaseCoherence: 0.7,
      resonanceVector: { sound: 0, light: 0, time: 0 },
      sacredGapScore: 0.5,
      involvedSpecies: [],
      involvedFigures: [],
      generatedBy: 'cascade',
      confidenceScore: causalStrength,
      galaxyId: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Generate a random event
   */
  private generateRandomEvent(civState: CivilizationState, context: EventGenerationContext): EventNode | null {
    const eventTypes = ['discovery', 'plague', 'famine', 'cultural_renaissance', 'technological_advancement'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const environmentalInfluence = context.environmentalFactors.resourceScarcity * 0.5;
    const traitInfluence = calculateTraitInfluence(civState.traitProfile.traits, eventType, 0.5);
    const causalStrength = Math.min(1, (0.3 + environmentalInfluence + traitInfluence) / 2);

    return {
      id: `evt_${civState.id}_${Date.now()}_${Math.random()}`,
      title: `${civState.name}: ${eventType.replace(/_/g, ' ')}`,
      eventType,
      year: this.state.currentYear,
      importance: Math.round(causalStrength * 10),
      causalStrength,
      constraintSatisfaction: 0.75,
      unityCoefficient: 0.7,
      involvedCivilizations: [civState.id as any],
      description: `Random event: ${eventType}`,
      narrative: '',
      causes: [],
      consequences: [],
      harmonyFrequency: 0.5,
      phaseCoherence: 0.7,
      resonanceVector: { sound: 0, light: 0, time: 0 },
      sacredGapScore: 0.5,
      involvedSpecies: [],
      involvedFigures: [],
      generatedBy: 'cascade',
      confidenceScore: causalStrength,
      galaxyId: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Detect and propagate cascades from an event
   */
  private async detectAndPropagateCascade(triggerEvent: EventNode): Promise<CascadeInstance | null> {
    const cascadeEvents: EventNode[] = [triggerEvent];
    const affectedCivilizations = new Set(triggerEvent.involvedCivilizations);

    // Find related events that could be part of the cascade
    for (const event of this.state.eventHistory.slice(-20)) {
      // Look at recent events
      if (
        event.id !== triggerEvent.id &&
        event.year >= triggerEvent.year - 5 &&
        event.involvedCivilizations.some((civ) => affectedCivilizations.has(civ))
      ) {
        cascadeEvents.push(event);
        event.involvedCivilizations.forEach((civ) => affectedCivilizations.add(civ));
      }
    }

    // Calculate cascade severity
    const severity = Math.min(1, cascadeEvents.reduce((sum, e) => sum + e.causalStrength, 0) / cascadeEvents.length);

    if (cascadeEvents.length > 1 && severity > 0.5) {
      return {
        id: `cascade_${Date.now()}`,
        triggerId: triggerEvent.id,
        year: this.state.currentYear,
        events: cascadeEvents,
        severity,
        affectedCivilizations: Array.from(affectedCivilizations),
        status: 'active',
      };
    }

    return null;
  }

  /**
   * Update civilization state based on events
   */
  private async updateCivilizationState(
    civState: CivilizationState,
    tickEvents: EventNode[],
    tickCascades: CascadeInstance[]
  ): Promise<void> {
    // Filter events relevant to this civilization
    const relevantEvents = tickEvents.filter((e) => e.involvedCivilizations.includes(civState.id));
    const relevantCascades = tickCascades.filter((c) => c.affectedCivilizations.includes(civState.id));

    // Update emotional state based on events
    for (const event of relevantEvents) {
      if (event.eventType.includes('conflict') || event.eventType.includes('plague')) {
        civState.emotionalState = destructiveFeedbackLoop(civState.emotionalState, {
          type: 'resource_scarcity',
          magnitude: event.causalStrength,
        });
      } else if (event.eventType.includes('discovery') || event.eventType.includes('alliance')) {
        civState.emotionalState = constructiveFeedbackLoop(civState.emotionalState, {
          type: 'resource_abundance',
          magnitude: event.causalStrength,
        });
      }
    }

    // Update traits based on experiences
    const experiences = relevantEvents.map((e) => ({
      type: e.eventType.includes('conflict') ? 'failure' as const : ('success' as const),
      category: (e.eventType.includes('conflict') ? 'conflict' : 'cooperation') as any,
      magnitude: e.causalStrength,
    }));

    if (experiences.length > 0) {
      civState.traitProfile.traits = evolveTraits(civState.traitProfile.traits, experiences);
    }

    // Update civilization metrics
    civState.population = Math.max(0, civState.population + (Math.random() - 0.5) * 10);
    civState.technology = Math.min(100, civState.technology + (Math.random() - 0.3) * 5);
    civState.resources = Math.max(0, civState.resources + (Math.random() - 0.5) * 15);
    civState.culture = Math.max(0, Math.min(100, civState.culture + (Math.random() - 0.5) * 8));

    // Ensure resources object exists
    if (!civState.resources) civState.resources = 50;

    // Determine evolution phase
    civState.evolutionState.currentPhase = determineCivilizationPhase(civState.evolutionState.currentPhase, {
      technologyEfficiency: civState.technology / 100,
      resourceAbundance: (civState.resources || 50) / 100,
      populationStability: civState.population > 0 ? 0.7 : 0,
      culturalCoherence: civState.culture / 100,
      cooperationLevel: (civState.emotionalState.variables.get('trust') || 50) / 100,
      desperation: (civState.emotionalState.variables.get('desperation') || 30) / 100,
      existentialDread: (civState.emotionalState.variables.get('existential_dread') || 20) / 100,
      collectiveGrief: (civState.emotionalState.variables.get('collective_grief') || 20) / 100,
      trust: (civState.emotionalState.variables.get('trust') || 50) / 100,
    });

    // Check for post-scarcity achievement
    civState.evolutionState.postScarcityAchieved = checkPostScarcityAchievement(
      {
        technologyEfficiency: civState.technology / 100,
        resourceAbundance: (civState.resources || 50) / 100,
        populationStability: civState.population > 0 ? 0.7 : 0,
      },
      civState.year - this.config.startYear
    );
  }

  /**
   * Build context for event generation
   */
  private buildEventGenerationContext(civState: CivilizationState): EventGenerationContext {
    const otherCivilizations = Array.from(this.state.civilizations.values()).filter((c) => c.id !== civState.id) as CivilizationState[];

    return {
      civilization: civState,
      otherCivilizations,
      environmentalFactors: {
        resourceScarcity: 1 - ((civState.resources || 50) / 100),
        threatLevel: otherCivilizations.length > 0 ? 0.5 : 0.1,
        isolationFactor: otherCivilizations.length === 0 ? 1 : 0.3,
      },
      historicalContext: this.state.eventHistory.filter((e) => e.year >= this.state.currentYear - 50),
    };
  }

  /**
   * Start the simulation
   */
  start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.emit('started', { year: this.state.currentYear });

    const tickDuration = this.config.tickDuration / this.state.speed;

    this.tickInterval = setInterval(async () => {
      try {
        await this.tick();
      } catch (error) {
        console.error('Error during simulation tick:', error);
        this.emit('error', error);
      }
    }, tickDuration);
  }

  /**
   * Pause the simulation
   */
  pause(): void {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    this.emit('paused', { year: this.state.currentYear });
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    this.pause();
    this.state.currentYear = this.config.startYear;
    this.state.tick = 0;
    this.state.events = [];
    this.state.cascades = [];

    this.emit('stopped', { year: this.state.currentYear });
  }

  /**
   * Set simulation speed
   */
  setSpeed(speed: number): void {
    this.state.speed = Math.max(0.1, Math.min(5.0, speed));

    if (this.state.isRunning) {
      this.pause();
      this.start();
    }

    this.emit('speedChanged', { speed: this.state.speed });
  }

  /**
   * Get current state snapshot
   */
  getStateSnapshot(): SimulationState {
    return {
      ...this.state,
      civilizations: new Map(this.state.civilizations),
    };
  }

  /**
   * Inject a custom event
   */
  async injectEvent(event: EventNode): Promise<void> {
    this.state.events.push(event);
    this.state.eventHistory.push(event);

    this.emit('event', {
      event,
      year: this.state.currentYear,
      tick: this.state.tick,
      injected: true,
    });

    // Check for cascades
    const cascade = await this.detectAndPropagateCascade(event);
    if (cascade) {
      this.state.cascades.push(cascade);
      this.emit('cascade', {
        cascade,
        year: this.state.currentYear,
      });
    }
  }
}


