/**
 * System Integration Layer
 * 
 * Connects the three core systems:
 * 1. CausalGraphEngine - Event causality and significance
 * 2. TradeNetworkEngine - Resource and idea propagation
 * 3. ChroniclerModule - Multi-perspective narratives
 * 
 * This layer ensures events flow through all systems consistently,
 * creating a unified simulation where history emerges from interconnected mechanics.
 */

import { CausalGraphEngine } from "./causalGraphEngine";
import { TradeNetworkEngine, Civilization } from "./tradeNetworkEngine";
import { ChroniclerModule } from "./chroniclerModule";

export interface SimulationEvent {
  id: string;
  type: string;
  timestamp: number;
  actors: string[];
  location: string;
  baseNarrative: string;
  significance: number;
  causalParents: string[];
  causalChildren: string[];
}

export interface IntegratedSimulationState {
  currentTick: number;
  events: SimulationEvent[];
  cascades: CascadeInfo[];
  networkStats: any;
  narrativeStats: any;
}

export interface CascadeInfo {
  id: string;
  name: string;
  rootCause: string;
  events: string[];
  severity: number;
  affectedEntities: Set<string>;
}

/**
 * System Integration Manager
 * Orchestrates all three systems working together
 */
export class SystemIntegrationManager {
  private causalEngine: CausalGraphEngine;
  private tradeEngine: TradeNetworkEngine;
  private chronicler: ChroniclerModule;
  private currentTick: number = 0;
  private eventLog: Map<string, SimulationEvent> = new Map();
  private cascadeLog: Map<string, CascadeInfo> = new Map();

  constructor() {
    this.causalEngine = new CausalGraphEngine();
    this.tradeEngine = new TradeNetworkEngine();
    this.chronicler = new ChroniclerModule();
  }

  /**
   * Register a civilization in all systems
   */
  registerCivilization(civ: Civilization): void {
    this.tradeEngine.registerCivilization(civ);
    // Register in causal engine by adding initial event
    this.causalEngine.addEvent({
      id: `civ-init-${civ.id}`,
      timestamp: 0,
      location: { sector: "origin", system: "origin", planet: civ.id },
      actors: [civ.id],
      type: "civilization_founded",
    });
  }

  /**
   * Process an event through all systems
   */
  async processEvent(
    eventType: string,
    actors: string[],
    location: string,
    baseNarrative: string
  ): Promise<SimulationEvent> {
    const eventId = `event-${Date.now()}-${Math.random()}`;

    // Step 1: Calculate significance in causal system
    // Simplified significance calculation
    const significance = Math.min(
      (actors.length / 10 + (baseNarrative.length / 100)) / 2,
      1.0
    );

    // Only process significant events
    if (significance < 0.3) {
      return {
        id: eventId,
        type: eventType,
        timestamp: this.currentTick,
        actors,
        location,
        baseNarrative,
        significance,
        causalParents: [],
        causalChildren: [],
      };
    }

    // Step 2: Add to causal graph
    const causalGraphNode = this.causalEngine.addEvent({
      id: eventId,
      timestamp: this.currentTick,
      location: { sector: "unknown", system: "unknown", planet: "unknown" },
      actors,
      type: eventType,
    });
    const causalParents: string[] = [];

    // Step 3: Generate multi-perspective narrative
    const narrative = await this.chronicler.generateMultiPerspectiveNarrative(
      eventId,
      eventType,
      this.currentTick,
      actors,
      location,
      baseNarrative
    );

    // Step 4: Propagate effects through trade network
    this.propagateEventEffects(eventId, eventType, actors, significance);

    // Step 5: Detect cascades
    const cascades = this.detectCascades(eventId);

    // Step 6: Create event record
    const event: SimulationEvent = {
      id: eventId,
      type: eventType,
      timestamp: this.currentTick,
      actors,
      location,
      baseNarrative,
      significance,
      causalParents,
      causalChildren: [],
    };

    this.eventLog.set(eventId, event);

    // Update parent events to reference this child
    if (Array.isArray(causalParents)) {
      causalParents.forEach((parentId: string) => {
        const parent = this.eventLog.get(parentId);
        if (parent) {
          parent.causalChildren.push(eventId);
        }
      });
    }

    return event;
  }

  /**
   * Propagate event effects through trade network
   */
  private propagateEventEffects(
    eventId: string,
    eventType: string,
    actors: string[],
    significance: number
  ): void {
    switch (eventType) {
      case "war":
        // Wars disrupt trade routes
        this.disruptTradeFromWar(actors, significance);
        break;

      case "discovery":
        // Discoveries propagate as ideas
        this.propagateDiscoveryAsIdea(actors, significance);
        break;

      case "trade_agreement":
        // Trade agreements create new routes
        this.createTradeRoutes(actors);
        break;

      case "cultural_shift":
        // Cultural shifts propagate as ideas
        this.propagateCulturalShift(actors, significance);
        break;

      case "technological_breakthrough":
        // Technologies propagate through trade
        this.propagateTechnology(actors, significance);
        break;
    }
  }

  /**
   * Disrupt trade from war
   */
  private disruptTradeFromWar(actors: string[], severity: number): void {
    // Find trade routes involving war participants
    const duration = Math.ceil(severity * 100); // Longer wars disrupt longer
    // Implementation would interact with trade engine
  }

  /**
   * Propagate discovery as idea
   */
  private propagateDiscoveryAsIdea(actors: string[], significance: number): void {
    // Discoveries spread to nearby civilizations
    // Implementation would use chronicler and trade engine
  }

  /**
   * Create trade routes
   */
  private createTradeRoutes(actors: string[]): void {
    // Create bidirectional trade routes between actors
    // Implementation would use trade engine
  }

  /**
   * Propagate cultural shift
   */
  private propagateCulturalShift(actors: string[], significance: number): void {
    // Cultural shifts spread through cultural exchange
    // Implementation would use trade engine
  }

  /**
   * Propagate technology
   */
  private propagateTechnology(actors: string[], significance: number): void {
    // Technologies spread through trade and cultural exchange
    // Implementation would use trade engine
  }

  /**
   * Detect cascades triggered by this event
   */
  private detectCascades(triggerEventId: string): CascadeInfo[] {
    const cascades: CascadeInfo[] = [];

    // Get causal children of this event (events caused by this one)
    const triggerEvent = this.eventLog.get(triggerEventId);
    const causalChildren = triggerEvent?.causalChildren || [];

    if (causalChildren.length > 2) {
      // This event triggered multiple consequences - it's a cascade
      const cascade: CascadeInfo = {
        id: `cascade-${triggerEventId}`,
        name: `Cascade from ${triggerEventId}`,
        rootCause: triggerEventId,
        events: [triggerEventId, ...causalChildren],
        severity: this.calculateCascadeSeverity(triggerEventId, causalChildren),
        affectedEntities: this.getAffectedEntities(triggerEventId, causalChildren),
      };

      this.cascadeLog.set(cascade.id, cascade);
      cascades.push(cascade);
    }

    return cascades;
  }

  /**
   * Calculate cascade severity
   */
  private calculateCascadeSeverity(
    rootEventId: string,
    childEventIds: string[]
  ): number {
    const rootEvent = this.eventLog.get(rootEventId);
    if (!rootEvent) return 0;

    let totalSeverity = rootEvent.significance;

    childEventIds.forEach((childId) => {
      const child = this.eventLog.get(childId);
      if (child) {
        totalSeverity += child.significance * 0.5; // Children count less
      }
    });

    return Math.min(totalSeverity / (childEventIds.length + 1), 1.0);
  }

  /**
   * Get all entities affected by cascade
   */
  private getAffectedEntities(
    rootEventId: string,
    childEventIds: string[]
  ): Set<string> {
    const affected = new Set<string>();

    const rootEvent = this.eventLog.get(rootEventId);
    if (rootEvent) {
      rootEvent.actors.forEach((actor) => affected.add(actor));
    }

    childEventIds.forEach((childId) => {
      const child = this.eventLog.get(childId);
      if (child) {
        child.actors.forEach((actor) => affected.add(actor));
      }
    });

    return affected;
  }

  /**
   * Update simulation state (called each tick)
   */
  update(tick: number): IntegratedSimulationState {
    this.currentTick = tick;

    // Update trade network
    const tradeUpdate = this.tradeEngine.update(tick);

    // Detect any new cascades from trade disruptions
    tradeUpdate.disruptions.forEach((disruption) => {
      // Create cascade from trade disruption
    });

    return {
      currentTick: tick,
      events: Array.from(this.eventLog.values()),
      cascades: Array.from(this.cascadeLog.values()),
      networkStats: this.tradeEngine.getNetworkStats(),
      narrativeStats: this.chronicler.getNarrativeStats(),
    };
  }

  /**
   * Get complete event history with all interconnections
   */
  getEventHistory() {
    return {
      events: Array.from(this.eventLog.values()),
      cascades: Array.from(this.cascadeLog.values()),
      causalGraph: this.getCausalGraphVisualization(),
      tradeNetwork: this.tradeEngine.getNetworkVisualization(),
      narratives: this.getAllNarratives(),
    };
  }

  /**
   * Get all narratives
   */
  private getAllNarratives() {
    const narratives: Record<string, any> = {};

    this.eventLog.forEach((event) => {
      // Get narrative for this event
      // Implementation would retrieve from chronicler
    });

    return narratives;
  }

  /**
   * Get causal graph visualization
   */
  private getCausalGraphVisualization() {
    // Build visualization data from event log
    const nodes = Array.from(this.eventLog.values()).map((event) => ({
      id: event.id,
      type: event.type,
      significance: event.significance,
      timestamp: event.timestamp,
    }));

    const edges = Array.from(this.eventLog.values()).flatMap((event) =>
      event.causalChildren.map((childId) => ({
        source: event.id,
        target: childId,
        type: "CAUSED",
      }))
    );

    return { nodes, edges };
  }

  /**
   * Get cascade details
   */
  getCascadeDetails(cascadeId: string) {
    const cascade = this.cascadeLog.get(cascadeId);
    if (!cascade) return null;

    return {
      ...cascade,
      events: cascade.events.map((eventId) => this.eventLog.get(eventId)),
      timeline: this.buildCascadeTimeline(cascade),
    };
  }

  /**
   * Build cascade timeline
   */
  private buildCascadeTimeline(cascade: CascadeInfo) {
    return cascade.events
      .map((eventId) => this.eventLog.get(eventId))
      .filter((e) => e !== undefined)
      .sort((a, b) => a!.timestamp - b!.timestamp);
  }

  /**
   * Get trade network statistics
   */
  getNetworkStats() {
    return this.tradeEngine.getNetworkStats();
  }

  /**
   * Get narrative statistics
   */
  getNarrativeStats() {
    return this.chronicler.getNarrativeStats();
  }

  /**
   * Get causal graph statistics
   */
  getCausalStats() {
    return {
      totalEvents: this.eventLog.size,
      totalCascades: this.cascadeLog.size,
      averageEventSignificance:
        Array.from(this.eventLog.values()).reduce((sum, e) => sum + e.significance, 0) /
        Math.max(this.eventLog.size, 1),
    };
  }
}

export default SystemIntegrationManager;
