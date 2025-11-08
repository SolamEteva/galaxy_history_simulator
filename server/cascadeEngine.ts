/**
 * Cascade Engine: Manages event consequences, temporal ordering, and propagation
 * Ensures causality is maintained (causes precede effects) and consequences ripple through history
 */

export interface EventNode {
  id: number;
  year: number;
  title: string;
  description: string;
  eventType: string;
  importance: number;
  imagePrompt?: string | null;
  speciesIds: number[];
  speciesNames?: string[];
  speciesColors?: string[];
}

export interface EventConnection {
  causeEventId: number;
  effectEventId: number;
  strength: number; // 0-1, how much the cause affects the effect
  description: string;
  delayYears: number; // How many years between cause and effect
}

/**
 * Cascade Engine manages the interconnected web of events and their consequences
 */
export class CascadeEngine {
  private events: Map<number, EventNode> = new Map();
  private connections: Map<number, EventConnection[]> = new Map(); // cause -> effects
  private reverseConnections: Map<number, EventConnection[]> = new Map(); // effect -> causes
  private importanceDecay = 0.7; // How much importance decays through cascade

  /**
   * Add an event to the cascade system
   */
  addEvent(event: EventNode): void {
    if (this.events.has(event.id)) {
      throw new Error(`Event ${event.id} already exists`);
    }
    this.events.set(event.id, event);
    this.connections.set(event.id, []);
    this.reverseConnections.set(event.id, []);
  }

  /**
   * Add a causal connection between two events
   * Validates temporal ordering: cause must occur before effect
   */
  addConnection(
    causeEventId: number,
    effectEventId: number,
    strength: number = 1.0,
    description: string = "",
    delayYears: number = 0
  ): void {
    const cause = this.events.get(causeEventId);
    const effect = this.events.get(effectEventId);

    if (!cause || !effect) {
      throw new Error("One or both events not found");
    }

    // Validate temporal ordering
    if (cause.year + delayYears > effect.year) {
      throw new Error(
        `Temporal violation: cause (year ${cause.year}) must precede effect (year ${effect.year})`
      );
    }

    const connection: EventConnection = {
      causeEventId,
      effectEventId,
      strength: Math.min(1.0, Math.max(0, strength)),
      description,
      delayYears,
    };

    this.connections.get(causeEventId)!.push(connection);
    this.reverseConnections.get(effectEventId)!.push(connection);
  }

  /**
   * Propagate consequences from an event through the cascade
   * Updates importance of all downstream events
   */
  propagateConsequences(eventId: number, initialStrength: number = 1.0): Map<number, number> {
    const impactMap = new Map<number, number>();
    const visited = new Set<number>();

    const propagate = (currentEventId: number, strength: number, depth: number) => {
      if (visited.has(currentEventId) || depth > 10) {
        return; // Prevent infinite loops and limit cascade depth
      }

      visited.add(currentEventId);
      impactMap.set(currentEventId, (impactMap.get(currentEventId) || 0) + strength);

      const effects = this.connections.get(currentEventId) || [];
      effects.forEach((connection) => {
        const decayedStrength = strength * connection.strength * this.importanceDecay;
        if (decayedStrength > 0.01) {
          // Only continue if impact is meaningful
          propagate(connection.effectEventId, decayedStrength, depth + 1);
        }
      });
    };

    propagate(eventId, initialStrength, 0);
    return impactMap;
  }

  /**
   * Get all events that caused a specific event
   */
  getCauses(eventId: number): EventConnection[] {
    return this.reverseConnections.get(eventId) || [];
  }

  /**
   * Get all events caused by a specific event
   */
  getEffects(eventId: number): EventConnection[] {
    return this.connections.get(eventId) || [];
  }

  /**
   * Get the complete causal chain for an event (all ancestors)
   */
  getCausalChain(eventId: number): EventNode[] {
    const chain: EventNode[] = [];
    const visited = new Set<number>();

    const traverse = (currentId: number) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const causes = this.getCauses(currentId);
      causes.forEach((connection) => {
        const causeEvent = this.events.get(connection.causeEventId);
        if (causeEvent) {
          chain.push(causeEvent);
          traverse(connection.causeEventId);
        }
      });
    };

    traverse(eventId);
    return chain.sort((a, b) => a.year - b.year);
  }

  /**
   * Get all consequences of an event (all descendants)
   */
  getConsequences(eventId: number): EventNode[] {
    const consequences: EventNode[] = [];
    const visited = new Set<number>();

    const traverse = (currentId: number) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      const effects = this.getEffects(currentId);
      effects.forEach((connection) => {
        const effectEvent = this.events.get(connection.effectEventId);
        if (effectEvent) {
          consequences.push(effectEvent);
          traverse(connection.effectEventId);
        }
      });
    };

    traverse(eventId);
    return consequences.sort((a, b) => a.year - b.year);
  }

  /**
   * Validate the entire cascade for temporal consistency
   */
  validateCausality(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.connections.forEach((effects, causeId) => {
      const cause = this.events.get(causeId)!;
      effects.forEach((connection) => {
        const effect = this.events.get(connection.effectEventId)!;
        if (cause.year + connection.delayYears > effect.year) {
          errors.push(
            `Temporal violation: ${cause.title} (year ${cause.year}) ` +
              `causes ${effect.title} (year ${effect.year})`
          );
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Detect cycles in the causal graph (which would be paradoxes)
   */
  detectCycles(): number[][] {
    const cycles: number[][] = [];
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    const dfs = (nodeId: number, path: number[]): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const effects = this.connections.get(nodeId) || [];
      effects.forEach((connection) => {
        const nextId = connection.effectEventId;
        if (!visited.has(nextId)) {
          dfs(nextId, [...path]);
        } else if (recursionStack.has(nextId)) {
          // Found a cycle
          const cycleStart = path.indexOf(nextId);
          cycles.push(path.slice(cycleStart).concat(nextId));
        }
      });

      recursionStack.delete(nodeId);
    };

    this.events.forEach((_, eventId) => {
      if (!visited.has(eventId)) {
        dfs(eventId, []);
      }
    });

    return cycles;
  }

  /**
   * Calculate the "importance" of an event based on its causal impact
   */
  calculateCausalImportance(eventId: number): number {
    const event = this.events.get(eventId);
    if (!event) return 0;

    let importance = event.importance;

    // Add importance from being caused by important events
    const causes = this.getCauses(eventId);
    causes.forEach((connection) => {
      const causeEvent = this.events.get(connection.causeEventId)!;
      importance += causeEvent.importance * connection.strength * 0.5;
    });

    // Add importance from causing important events
    const effects = this.getEffects(eventId);
    effects.forEach((connection) => {
      const effectEvent = this.events.get(connection.effectEventId)!;
      importance += effectEvent.importance * connection.strength * 0.3;
    });

    return Math.min(10, importance); // Cap at 10
  }

  /**
   * Get statistics about the cascade
   */
  getStatistics(): {
    totalEvents: number;
    totalConnections: number;
    averageConnectionsPerEvent: number;
    maxCausalDepth: number;
    cycles: number;
  } {
    let maxDepth = 0;

    const calculateDepth = (eventId: number, depth: number = 0): number => {
      const effects = this.getEffects(eventId);
      if (effects.length === 0) return depth;
      return Math.max(...effects.map((e) => calculateDepth(e.effectEventId, depth + 1)));
    };

    this.events.forEach((_, eventId) => {
      maxDepth = Math.max(maxDepth, calculateDepth(eventId));
    });

    return {
      totalEvents: this.events.size,
      totalConnections: Array.from(this.connections.values()).reduce((sum, arr) => sum + arr.length, 0),
      averageConnectionsPerEvent:
        Array.from(this.connections.values()).reduce((sum, arr) => sum + arr.length, 0) /
        this.events.size,
      maxCausalDepth: maxDepth,
      cycles: this.detectCycles().length,
    };
  }

  /**
   * Export cascade as JSON for visualization
   */
  toJSON() {
    const connections: EventConnection[] = [];
    this.connections.forEach((effects) => {
      connections.push(...effects);
    });

    return {
      events: Array.from(this.events.values()),
      connections,
      statistics: this.getStatistics(),
    };
  }
}

/**
 * Helper function to build a cascade from event data
 */
export function buildCascadeFromEvents(
  events: EventNode[],
  connectionData: Array<{
    causeId: number;
    effectId: number;
    strength: number;
    description: string;
    delayYears: number;
  }>
): CascadeEngine {
  const cascade = new CascadeEngine();

  // Add all events
  events.forEach((event) => cascade.addEvent(event));

  // Add connections
  connectionData.forEach((conn) => {
    try {
      cascade.addConnection(
        conn.causeId,
        conn.effectId,
        conn.strength,
        conn.description,
        conn.delayYears
      );
    } catch (error) {
      console.warn(`Failed to add connection: ${error}`);
    }
  });

  return cascade;
}
