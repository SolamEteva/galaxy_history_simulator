/**
 * Trade/Communication Network Engine
 * 
 * Implements the interconnection layer that allows resources and ideas to flow
 * between civilizations with realistic distance-based delays.
 * 
 * Key concepts:
 * - Trade routes form networks between nearby civilizations
 * - Resources and ideas propagate along routes with delay based on distance
 * - Trade relationships create political and cultural influence
 * - Disrupted trade causes cascading economic effects
 */

export interface Civilization {
  id: string;
  name: string;
  location: {
    x: number;
    y: number;
    z: number;
  };
  resources: Map<string, number>;
  technologies: Set<string>;
  culturalValues: string[];
}

export interface TradeRoute {
  id: string;
  fromCivId: string;
  toCivId: string;
  distance: number;
  delay: number; // ticks for goods to travel
  active: boolean;
  resources: string[]; // what's being traded
  tradingPartners: {
    civId: string;
    relationship: "ally" | "neutral" | "rival";
    trustLevel: number; // 0-1
  }[];
}

export interface TradeGood {
  id: string;
  name: string;
  origin: string; // civilization that produces it
  currentLocation: string; // civilization currently holding it
  inTransit: boolean;
  arrivalTime: number; // when it arrives
  value: number; // economic value
}

export interface CommunicationEvent {
  id: string;
  type: "idea" | "technology" | "cultural_practice" | "disease" | "rumor";
  origin: string;
  currentLocation: string;
  inTransit: boolean;
  arrivalTime: number;
  distortion: number; // 0-1, how much the message changed in transit
  recipients: string[];
}

/**
 * Trade Network Engine
 * Manages all trade relationships and resource/idea propagation
 */
export class TradeNetworkEngine {
  private civilizations: Map<string, Civilization> = new Map();
  private tradeRoutes: Map<string, TradeRoute> = new Map();
  private tradeGoods: Map<string, TradeGood> = new Map();
  private communicationEvents: Map<string, CommunicationEvent> = new Map();
  private currentTick: number = 0;

  /**
   * Register a civilization in the network
   */
  registerCivilization(civ: Civilization): void {
    this.civilizations.set(civ.id, civ);
  }

  /**
   * Create a trade route between two civilizations
   * Distance-based delay ensures realistic propagation time
   */
  createTradeRoute(
    fromCivId: string,
    toCivId: string,
    resources: string[]
  ): TradeRoute {
    const fromCiv = this.civilizations.get(fromCivId);
    const toCiv = this.civilizations.get(toCivId);

    if (!fromCiv || !toCiv) {
      throw new Error("Civilization not found");
    }

    // Calculate distance between civilizations
    const distance = this.calculateDistance(fromCiv.location, toCiv.location);

    // Delay is proportional to distance (10 ticks per distance unit)
    const delay = Math.ceil(distance * 10);

    const route: TradeRoute = {
      id: `route-${fromCivId}-${toCivId}`,
      fromCivId,
      toCivId,
      distance,
      delay,
      active: true,
      resources,
      tradingPartners: [
        {
          civId: fromCivId,
          relationship: "neutral",
          trustLevel: 0.5,
        },
        {
          civId: toCivId,
          relationship: "neutral",
          trustLevel: 0.5,
        },
      ],
    };

    this.tradeRoutes.set(route.id, route);
    return route;
  }

  /**
   * Send a trade good along a route
   */
  sendTradeGood(
    routeId: string,
    resourceName: string,
    quantity: number
  ): TradeGood {
    const route = this.tradeRoutes.get(routeId);
    if (!route || !route.active) {
      throw new Error("Trade route not found or inactive");
    }

    const good: TradeGood = {
      id: `good-${Date.now()}-${Math.random()}`,
      name: resourceName,
      origin: route.fromCivId,
      currentLocation: route.fromCivId,
      inTransit: true,
      arrivalTime: this.currentTick + route.delay,
      value: quantity * 10, // simplified valuation
    };

    this.tradeGoods.set(good.id, good);
    return good;
  }

  /**
   * Propagate an idea, technology, or cultural practice
   * Communication travels faster than physical goods but with distortion
   */
  propagateIdea(
    originCivId: string,
    ideaType: "idea" | "technology" | "cultural_practice",
    description: string,
    targetCivIds: string[]
  ): CommunicationEvent[] {
    const events: CommunicationEvent[] = [];

    targetCivIds.forEach((targetCivId) => {
      const originCiv = this.civilizations.get(originCivId);
      const targetCiv = this.civilizations.get(targetCivId);

      if (!originCiv || !targetCiv) {
        return;
      }

      // Communication travels faster than goods (5 ticks per distance unit)
      const distance = this.calculateDistance(
        originCiv.location,
        targetCiv.location
      );
      const delay = Math.ceil(distance * 5);

      // Distortion increases with distance (ideas change as they travel)
      const distortion = Math.min(distance / 100, 0.8);

      const event: CommunicationEvent = {
        id: `comm-${Date.now()}-${Math.random()}`,
        type: ideaType,
        origin: originCivId,
        currentLocation: originCivId,
        inTransit: true,
        arrivalTime: this.currentTick + delay,
        distortion,
        recipients: [targetCivId],
      };

      this.communicationEvents.set(event.id, event);
      events.push(event);
    });

    return events;
  }

  /**
   * Disrupt a trade route (war, natural disaster, etc.)
   * Creates cascading economic effects
   */
  disruptTradeRoute(routeId: string, duration: number): void {
    const route = this.tradeRoutes.get(routeId);
    if (!route) {
      throw new Error("Trade route not found");
    }

    route.active = false;

    // Goods in transit are lost
    const lostGoods: TradeGood[] = [];
    this.tradeGoods.forEach((good) => {
      if (
        good.inTransit &&
        ((good.origin === route.fromCivId && good.currentLocation === route.fromCivId) ||
          (good.origin === route.toCivId && good.currentLocation === route.toCivId))
      ) {
        good.inTransit = false;
        lostGoods.push(good);
      }
    });

    // Schedule route restoration
    setTimeout(() => {
      route.active = true;
    }, duration);
  }

  /**
   * Update trade network state (called each simulation tick)
   * Moves goods and ideas along routes, handles arrivals
   */
  update(tick: number): {
    arrivedGoods: TradeGood[];
    arrivedIdeas: CommunicationEvent[];
    disruptions: string[];
  } {
    this.currentTick = tick;

    const arrivedGoods: TradeGood[] = [];
    const arrivedIdeas: CommunicationEvent[] = [];
    const disruptions: string[] = [];

    // Process trade goods
    this.tradeGoods.forEach((good) => {
      if (good.inTransit && good.arrivalTime <= tick) {
        good.inTransit = false;
        good.currentLocation = this.getRouteDestination(good.origin);
        arrivedGoods.push(good);

        // Trade good arrival might trigger economic effects
        this.handleTradeGoodArrival(good);
      }
    });

    // Process communication events
    this.communicationEvents.forEach((event) => {
      if (event.inTransit && event.arrivalTime <= tick) {
        event.inTransit = false;
        event.currentLocation = event.recipients[0];
        arrivedIdeas.push(event);

        // Idea arrival might trigger cultural or technological changes
        this.handleIdeaArrival(event);
      }
    });

    // Check for trade disruptions (wars, natural disasters)
    this.tradeRoutes.forEach((route) => {
      if (!route.active) {
        disruptions.push(route.id);
      }
    });

    return { arrivedGoods, arrivedIdeas, disruptions };
  }

  /**
   * Calculate distance between two 3D locations
   */
  private calculateDistance(
    loc1: { x: number; y: number; z: number },
    loc2: { x: number; y: number; z: number }
  ): number {
    const dx = loc2.x - loc1.x;
    const dy = loc2.y - loc1.y;
    const dz = loc2.z - loc1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get destination of a trade route
   */
  private getRouteDestination(originCivId: string): string {
    for (const route of this.tradeRoutes.values()) {
      if (route.fromCivId === originCivId) {
        return route.toCivId;
      }
    }
    return originCivId;
  }

  /**
   * Handle arrival of trade good
   * Triggers economic effects, relationship changes, etc.
   */
  private handleTradeGoodArrival(good: TradeGood): void {
    const targetCiv = this.civilizations.get(good.currentLocation);
    if (!targetCiv) {
      return;
    }

    // Add resource to target civilization
    const currentAmount = targetCiv.resources.get(good.name) || 0;
    targetCiv.resources.set(good.name, currentAmount + good.value);

    // Improve relationship with trading partner
    const route = Array.from(this.tradeRoutes.values()).find(
      (r) =>
        (r.fromCivId === good.origin && r.toCivId === good.currentLocation) ||
        (r.toCivId === good.origin && r.fromCivId === good.currentLocation)
    );

    if (route) {
      const partner = route.tradingPartners.find(
        (p) => p.civId === good.origin
      );
      if (partner) {
        partner.trustLevel = Math.min(partner.trustLevel + 0.1, 1.0);
        if (partner.trustLevel > 0.7) {
          partner.relationship = "ally";
        }
      }
    }
  }

  /**
   * Handle arrival of idea/technology/cultural practice
   * Triggers adoption, cultural shifts, technological advancement
   */
  private handleIdeaArrival(event: CommunicationEvent): void {
    const targetCiv = this.civilizations.get(event.currentLocation);
    if (!targetCiv) {
      return;
    }

    switch (event.type) {
      case "technology":
        // Add technology to target civilization
        targetCiv.technologies.add(event.origin);
        break;

      case "cultural_practice":
        // Add cultural value to target civilization
        targetCiv.culturalValues.push(event.origin);
        break;

      case "idea":
        // Ideas might influence cultural values
        targetCiv.culturalValues.push(event.origin);
        break;

      case "disease":
        // Diseases reduce population (simplified)
        break;

      case "rumor":
        // Rumors might affect relationships
        break;
    }
  }

  /**
   * Detect trade disruptions and their cascading effects
   */
  detectTradeDisruptions(): {
    disruption: TradeRoute;
    affectedCivs: string[];
    cascadingEffects: string[];
  }[] {
    const disruptions: {
      disruption: TradeRoute;
      affectedCivs: string[];
      cascadingEffects: string[];
    }[] = [];

    this.tradeRoutes.forEach((route) => {
      if (!route.active) {
        const affectedCivs = [route.fromCivId, route.toCivId];
        const cascadingEffects: string[] = [];

        // Find other routes that depend on this one
        this.tradeRoutes.forEach((otherRoute) => {
          if (
            (otherRoute.fromCivId === route.fromCivId ||
              otherRoute.fromCivId === route.toCivId) &&
            otherRoute.id !== route.id
          ) {
            cascadingEffects.push(`Route ${otherRoute.id} may be affected`);
          }
        });

        disruptions.push({
          disruption: route,
          affectedCivs,
          cascadingEffects,
        });
      }
    });

    return disruptions;
  }

  /**
   * Get network statistics
   */
  getNetworkStats() {
    return {
      totalCivilizations: this.civilizations.size,
      totalTradeRoutes: this.tradeRoutes.size,
      activeRoutes: Array.from(this.tradeRoutes.values()).filter(
        (r) => r.active
      ).length,
      goodsInTransit: Array.from(this.tradeGoods.values()).filter(
        (g) => g.inTransit
      ).length,
      ideasInTransit: Array.from(this.communicationEvents.values()).filter(
        (e) => e.inTransit
      ).length,
      averageTrustLevel: this.calculateAverageTrust(),
    };
  }

  /**
   * Calculate average trust level across all trading relationships
   */
  private calculateAverageTrust(): number {
    let totalTrust = 0;
    let count = 0;

    this.tradeRoutes.forEach((route) => {
      route.tradingPartners.forEach((partner) => {
        totalTrust += partner.trustLevel;
        count++;
      });
    });

    return count > 0 ? totalTrust / count : 0;
  }

  /**
   * Get trade network visualization data
   */
  getNetworkVisualization() {
    const nodes = Array.from(this.civilizations.values()).map((civ) => ({
      id: civ.id,
      name: civ.name,
      location: civ.location,
      resources: Object.fromEntries(civ.resources),
      technologies: Array.from(civ.technologies),
    }));

    const edges = Array.from(this.tradeRoutes.values()).map((route) => ({
      id: route.id,
      source: route.fromCivId,
      target: route.toCivId,
      distance: route.distance,
      delay: route.delay,
      active: route.active,
      resources: route.resources,
    }));

    return { nodes, edges };
  }
}

export default TradeNetworkEngine;
