/**
 * Causal Graph Engine
 * 
 * Implements the foundation for true interconnection between events.
 * Replaces simple event logging with a graph structure that tracks:
 * - Causal relationships (CAUSED, INFLUENCED, PREVENTED, ENABLED)
 * - Temporal relationships (PRECEDED, COEXISTED_WITH)
 * - Spatial relationships (NEAR, FAR, OCCUPIED)
 * - Event significance and ripple propagation
 */

// Type definitions for causal graph
export type CausalRelationship = "CAUSED" | "INFLUENCED" | "PREVENTED" | "ENABLED" | "PRECEDED" | "COEXISTED_WITH" | "NEAR" | "FAR" | "OCCUPIED";

export interface EventNode {
  id: string;
  timestamp: number;
  location: { sector: string; system: string; planet: string };
  actors: string[];
  type: string;
}

export interface EventOpportunity {
  type: string;
  probability: number;
  description: string;
}

export interface CausalEdge {
  fromEventId: string;
  toEventId: string;
  relationshipType: CausalRelationship;
}

/**
 * Represents a node in the causal graph
 */
export interface CausalGraphNode {
  eventId: string;
  timestamp: number; // simulation ticks
  location: {
    galaxySector: string;
    system: string;
    planet: string;
  };
  actors: string[]; // entity IDs involved
  actionType: string; // what happened
  consequences: string[]; // immediate effects
  
  // Significance scoring
  significance: number; // 0-1, determines if event gets permanently logged
  narrativeWeight: number; // importance for storytelling
  cascadeRisk: number; // likelihood of triggering other events
  
  // Ripple propagation
  immediateAffectedEntities: string[]; // entities affected directly
  delayedAffectedEntities: Map<string, number>; // entity -> ticks until affected
  
  // Metadata
  createdAt: Date;
  lastModified: Date;
}

/**
 * Represents a directed edge in the causal graph
 */
export interface CausalGraphEdge {
  fromEventId: string;
  toEventId: string;
  relationshipType: CausalRelationship;
  strength: number; // 0-1, how strong is the causal link
  delay: number; // ticks between cause and effect
  probability: number; // 0-1, likelihood of this relationship manifesting
  description: string; // human-readable explanation
}

/**
 * Main Causal Graph Engine
 */
export class CausalGraphEngine {
  private nodes: Map<string, CausalGraphNode> = new Map();
  private edges: Map<string, CausalGraphEdge[]> = new Map();
  private significanceThreshold: number = 0.3;
  
  /**
   * Add an event to the causal graph
   */
  addEvent(event: EventNode): CausalGraphNode {
    const node: CausalGraphNode = {
      eventId: event.id,
      timestamp: event.timestamp,
      location: {
        galaxySector: event.location.sector,
        system: event.location.system,
        planet: event.location.planet,
      },
      actors: event.actors,
      actionType: event.type,
      consequences: [],
      significance: this.calculateSignificance(event),
      narrativeWeight: this.calculateNarrativeWeight(event),
      cascadeRisk: this.calculateCascadeRisk(event),
      immediateAffectedEntities: this.calculateImmediateAffected(event),
      delayedAffectedEntities: this.calculateDelayedAffected(event),
      createdAt: new Date(),
      lastModified: new Date(),
    };
    
    this.nodes.set(event.id, node);
    return node;
  }
  
  /**
   * Add a causal relationship between two events
   */
  addCausalLink(
    fromEventId: string,
    toEventId: string,
    relationshipType: CausalRelationship,
    strength: number = 0.8,
    delay: number = 0,
    probability: number = 1.0,
    description: string = ""
  ): CausalGraphEdge {
    const edge: CausalGraphEdge = {
      fromEventId,
      toEventId,
      relationshipType,
      strength,
      delay,
      probability,
      description,
    };
    
    if (!this.edges.has(fromEventId)) {
      this.edges.set(fromEventId, []);
    }
    this.edges.get(fromEventId)!.push(edge);
    
    return edge;
  }
  
  /**
   * Calculate event significance (0-1)
   * Determines if event should be permanently logged
   */
  private calculateSignificance(event: EventNode): number {
    let significance = 0;
    
    // Factor 1: Number of actors involved (more actors = more significant)
    significance += Math.min(event.actors.length / 10, 0.3);
    
    // Factor 2: Event type importance
    const typeWeights: Record<string, number> = {
      "war": 0.9,
      "discovery": 0.7,
      "extinction": 1.0,
      "first_contact": 0.8,
      "technological_breakthrough": 0.7,
      "cultural_shift": 0.6,
      "trade_route_established": 0.5,
      "natural_disaster": 0.6,
      "political_crisis": 0.5,
      "birth_of_figure": 0.4,
      "death_of_figure": 0.5,
    };
    significance += typeWeights[event.type] || 0.3;
    
    // Factor 3: Cascade potential (predicted consequences)
    const predictedConsequences = this.predictConsequences(event);
    significance += Math.min(predictedConsequences.length / 20, 0.2);
    
    // Normalize to 0-1
    return Math.min(significance / 2, 1.0);
  }
  
  /**
   * Calculate narrative weight for storytelling
   */
  private calculateNarrativeWeight(event: EventNode): number {
    let weight = 0;
    
    // Threshold crossings are highly narrative-worthy
    if (event.type.includes("breakthrough") || event.type.includes("extinction")) {
      weight += 0.8;
    }
    
    // Pattern breaks (unexpected events)
    const recentEvents = Array.from(this.nodes.values())
      .filter(n => n.timestamp > event.timestamp - 100)
      .slice(-10);
    
    const similarEventCount = recentEvents.filter(n => n.actionType === event.type).length;
    if (similarEventCount === 0) {
      weight += 0.3; // Novel event type
    }
    
    // High-causal-density events
    const incomingEdges = Array.from(this.edges.values())
      .flatMap(edges => edges.filter(e => e.toEventId === event.id));
    weight += Math.min(incomingEdges.length / 5, 0.3);
    
    return Math.min(weight, 1.0);
  }
  
  /**
   * Calculate cascade risk (likelihood of triggering other events)
   */
  private calculateCascadeRisk(event: EventNode): number {
    let risk = 0;
    
    // Events with many actors have higher cascade risk
    risk += Math.min(event.actors.length / 20, 0.4);
    
    // Certain event types are more likely to cascade
    const cascadeTypes: Record<string, number> = {
      "war": 0.9,
      "extinction": 0.8,
      "natural_disaster": 0.7,
      "technological_breakthrough": 0.6,
      "political_crisis": 0.7,
    };
    risk += cascadeTypes[event.type] || 0.2;
    
    return Math.min(risk, 1.0);
  }
  
  /**
   * Calculate which entities are immediately affected by an event
   */
  private calculateImmediateAffected(event: EventNode): string[] {
    const affected: Set<string> = new Set();
    
    // Direct actors are always affected
    event.actors.forEach((actor: string) => affected.add(actor));
    
    // Entities in same location are affected
    const sameLocationEvents = Array.from(this.nodes.values())
      .filter(n => 
        n.location.planet === event.location.planet &&
        n.timestamp === event.timestamp
      );
    sameLocationEvents.forEach(n => n.actors.forEach(a => affected.add(a)));
    
    return Array.from(affected);
  }
  
  /**
   * Calculate which entities are affected with delay (ripple propagation)
   * Returns map of entity -> ticks until affected
   */
  private calculateDelayedAffected(event: EventNode): Map<string, number> {
    const delayed = new Map<string, number>();
    
    // For each entity, calculate distance-based delay
    // Nearby entities affected sooner, distant ones after delay
    const allEntities = new Set<string>();
    Array.from(this.nodes.values()).forEach(n => n.actors.forEach(a => allEntities.add(a)));
    
    allEntities.forEach((entity: string) => {
      if (!event.actors.includes(entity)) {
        // Calculate distance (simplified: based on location proximity)
        const distance = this.calculateEntityDistance(event.location, entity);
        const delayTicks = Math.ceil(distance * 10); // 10 ticks per distance unit
        
        if (delayTicks > 0 && delayTicks < 1000) { // Reasonable delay range
          delayed.set(entity, delayTicks);
        }
      }
    });
    
    return delayed;
  }
  
  /**
   * Predict consequences of an event
   */
  private predictConsequences(event: EventNode): EventOpportunity[] {
    const consequences: EventOpportunity[] = [];
    
    // War events often lead to territorial changes, migrations, technological advancement
    if (event.type === "war") {
      consequences.push({
        type: "territorial_change",
        probability: 0.8,
        description: "Winners expand territory, losers contract",
      });
      consequences.push({
        type: "migration",
        probability: 0.6,
        description: "Refugees flee war zones",
      });
      consequences.push({
        type: "technological_advancement",
        probability: 0.5,
        description: "Military innovations developed during conflict",
      });
    }
    
    // Discovery events lead to technological advancement and trade
    if (event.type === "discovery") {
      consequences.push({
        type: "technological_advancement",
        probability: 0.9,
        description: "Discovery enables new technologies",
      });
      consequences.push({
        type: "trade_route",
        probability: 0.7,
        description: "New resources enable trade networks",
      });
    }
    
    // Extinction events cause massive cascades
    if (event.type === "extinction") {
      consequences.push({
        type: "power_vacuum",
        probability: 0.95,
        description: "Extinct civilization's territory becomes contested",
      });
      consequences.push({
        type: "cultural_shift",
        probability: 0.8,
        description: "Surviving civilizations adapt to new world order",
      });
      consequences.push({
        type: "resource_redistribution",
        probability: 0.9,
        description: "Extinct civilization's resources become available",
      });
    }
    
    return consequences;
  }
  
  /**
   * Calculate distance between event location and entity
   * Simplified version - in real implementation would use actual spatial coordinates
   */
  private calculateEntityDistance(location: any, entityId: string): number {
    // Placeholder: return random distance for now
    // In real implementation, would look up entity location and calculate actual distance
    return Math.random() * 100;
  }
  
  /**
   * Trace causal chain backwards from an event
   * Implements "Butterfly Effect" tracer
   */
  traceCausalChain(eventId: string, maxDepth: number = 10): CausalGraphEdge[] {
    const chain: CausalGraphEdge[] = [];
    const visited = new Set<string>();
    
    const trace = (currentEventId: string, depth: number) => {
      if (depth > maxDepth || visited.has(currentEventId)) {
        return;
      }
      
      visited.add(currentEventId);
      
      // Find all edges pointing TO this event (incoming edges = causes)
      Array.from(this.edges.values()).forEach(edgeList => {
        edgeList.forEach(edge => {
          if (edge.toEventId === currentEventId) {
            chain.push(edge);
            trace(edge.fromEventId, depth + 1);
          }
        });
      });
    };
    
    trace(eventId, 0);
    return chain;
  }
  
  /**
   * Trace ripple effects forward from an event
   */
  traceRippleEffects(eventId: string, maxDepth: number = 10): CausalGraphEdge[] {
    const ripples: CausalGraphEdge[] = [];
    const visited = new Set<string>();
    
    const trace = (currentEventId: string, depth: number) => {
      if (depth > maxDepth || visited.has(currentEventId)) {
        return;
      }
      
      visited.add(currentEventId);
      
      // Find all edges originating FROM this event (outgoing edges = effects)
      const outgoing = this.edges.get(currentEventId) || [];
      outgoing.forEach(edge => {
        ripples.push(edge);
        trace(edge.toEventId, depth + 1);
      });
    };
    
    trace(eventId, 0);
    return ripples;
  }
  
  /**
   * Get all events above significance threshold
   */
  getSignificantEvents(): CausalGraphNode[] {
    return Array.from(this.nodes.values())
      .filter(node => node.significance >= this.significanceThreshold)
      .sort((a, b) => b.significance - a.significance);
  }
  
  /**
   * Get narrative-worthy events for storytelling
   */
  getNarrativeEvents(count: number = 20): CausalGraphNode[] {
    return Array.from(this.nodes.values())
      .sort((a, b) => b.narrativeWeight - a.narrativeWeight)
      .slice(0, count);
  }
  
  /**
   * Detect crisis cascades (one failure triggering others)
   */
  detectCrisisCascades(): CausalGraphEdge[][] {
    const cascades: CausalGraphEdge[][] = [];
    
    // Find high-cascade-risk events
    const highRiskEvents = Array.from(this.nodes.values())
      .filter(node => node.cascadeRisk > 0.7)
      .sort((a, b) => b.cascadeRisk - a.cascadeRisk);
    
    // For each high-risk event, trace its ripple effects
    highRiskEvents.forEach(event => {
      const ripples = this.traceRippleEffects(event.eventId, 5);
      if (ripples.length > 3) { // Only consider as cascade if 3+ linked events
        cascades.push(ripples);
      }
    });
    
    return cascades;
  }
  
  /**
   * Get statistics about the causal graph
   */
  getGraphStatistics() {
    const nodes = Array.from(this.nodes.values());
    const allEdges = Array.from(this.edges.values()).flatMap(e => e);
    
    return {
      totalEvents: nodes.length,
      significantEvents: nodes.filter(n => n.significance >= this.significanceThreshold).length,
      totalCausalLinks: allEdges.length,
      averageSignificance: nodes.reduce((sum, n) => sum + n.significance, 0) / nodes.length,
      averageNarrativeWeight: nodes.reduce((sum, n) => sum + n.narrativeWeight, 0) / nodes.length,
      averageCascadeRisk: nodes.reduce((sum, n) => sum + n.cascadeRisk, 0) / nodes.length,
      detectedCascades: this.detectCrisisCascades().length,
    };
  }
}

export default CausalGraphEngine;
