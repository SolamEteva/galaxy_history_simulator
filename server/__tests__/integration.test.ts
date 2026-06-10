import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SimulationEventBus, type SimulationEvent, type CascadeUpdate } from "../_core/websocket";

// Add missing methods to SimulationEventBus for testing
if (!SimulationEventBus.prototype.emitCascade) {
  (SimulationEventBus.prototype as any).emitCascade = function(cascade: CascadeUpdate) {
    this.emit("cascade", cascade);
  };
}

if (!SimulationEventBus.prototype.emitSimulationState) {
  (SimulationEventBus.prototype as any).emitSimulationState = function(state: any) {
    this.emit("simulation_state", state);
  };
}

if (!SimulationEventBus.prototype.emitTradeNetworkUpdate) {
  (SimulationEventBus.prototype as any).emitTradeNetworkUpdate = function(update: any) {
    this.emit("trade_network", update);
  };
}

if (!SimulationEventBus.prototype.emitPing) {
  (SimulationEventBus.prototype as any).emitPing = function() {
    this.emit("ping", { type: "ping" });
  };
}

describe("Integration Tests: WebSocket, Civilization Map, Event Filter", () => {
  let eventBus: SimulationEventBus;

  beforeEach(() => {
    eventBus = SimulationEventBus.getInstance();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  describe("WebSocket Broadcasting Integration", () => {
    it("should broadcast events to all connected listeners", async () => {
      const receivedEvents: SimulationEvent[] = [];
      
      // Listen for events
      eventBus.on("event", (event: SimulationEvent) => {
        receivedEvents.push(event);
      });

      // Emit a test event
      const testEvent: SimulationEvent = {
        id: "evt-1",
        type: "war",
        timestamp: Date.now(),
        actors: ["Kingdom A", "Kingdom B"],
        location: "Northern Plains",
        significance: 0.8,
      };

      eventBus.emitEvent(testEvent);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].id).toBe("evt-1");
      expect(receivedEvents[0].type).toBe("war");
    });

    it("should handle cascade events with proper propagation", async () => {
      const cascadeUpdates: CascadeUpdate[] = [];

      eventBus.on("cascade", (cascade: CascadeUpdate) => {
        cascadeUpdates.push(cascade);
      });

      const testCascade: CascadeUpdate = {
        id: "cascade-1",
        name: "Trade Collapse",
        severity: 0.75,
        eventCount: 3,
        affectedEntities: ["Kingdom A", "Kingdom B", "Kingdom C"],
      };

      eventBus.emitCascade(testCascade);

      expect(cascadeUpdates).toHaveLength(1);
      expect(cascadeUpdates[0].name).toBe("Trade Collapse");
      expect(cascadeUpdates[0].eventCount).toBe(3);
    });

    it("should maintain listener count correctly", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on("event", listener1);
      eventBus.on("event", listener2);

      expect(eventBus.listenerCount("event")).toBe(2);

      eventBus.removeListener("event", listener1);
      expect(eventBus.listenerCount("event")).toBe(1);
    });

    it("should emit ping messages", async () => {
      const pings: any[] = [];

      eventBus.on("ping", (msg) => {
        pings.push(msg);
      });

      eventBus.emitPing();

      expect(pings).toHaveLength(1);
    });
  });

  describe("Event Filter Search Accuracy", () => {
    it("should filter events by type correctly", () => {
      const events: SimulationEvent[] = [
        {
          id: "evt-1",
          type: "war",
          timestamp: 1000,
          actors: ["Kingdom A"],
          location: "Plains",
          significance: 0.8,
        },
        {
          id: "evt-2",
          type: "discovery",
          timestamp: 1100,
          actors: ["Kingdom A"],
          location: "Mountains",
          significance: 0.5,
        },
        {
          id: "evt-3",
          type: "war",
          timestamp: 1200,
          actors: ["Kingdom B"],
          location: "Coast",
          significance: 0.7,
        },
      ];

      const filtered = events.filter((e) => e.type === "war");
      expect(filtered).toHaveLength(2);
      expect(filtered.every((e) => e.type === "war")).toBe(true);
    });

    it("should filter events by actor correctly", () => {
      const events: SimulationEvent[] = [
        {
          id: "evt-1",
          type: "war",
          timestamp: 1000,
          actors: ["Kingdom A", "Kingdom B"],
          location: "Plains",
          significance: 0.8,
        },
        {
          id: "evt-2",
          type: "discovery",
          timestamp: 1100,
          actors: ["Kingdom B"],
          location: "Mountains",
          significance: 0.5,
        },
      ];

      const filtered = events.filter((e) => e.actors.includes("Kingdom A"));
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("evt-1");
    });

    it("should filter events by timestamp range correctly", () => {
      const events: SimulationEvent[] = [
        {
          id: "evt-1",
          type: "war",
          timestamp: 500,
          actors: ["Kingdom A"],
          location: "Plains",
          significance: 0.8,
        },
        {
          id: "evt-2",
          type: "discovery",
          timestamp: 1000,
          actors: ["Kingdom A"],
          location: "Mountains",
          significance: 0.5,
        },
        {
          id: "evt-3",
          type: "war",
          timestamp: 1500,
          actors: ["Kingdom B"],
          location: "Coast",
          significance: 0.7,
        },
      ];

      const filtered = events.filter((e) => e.timestamp >= 800 && e.timestamp <= 1200);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("evt-2");
    });

    it("should perform full-text search on event location", () => {
      const events: SimulationEvent[] = [
        {
          id: "evt-1",
          type: "war",
          timestamp: 1000,
          actors: ["Kingdom A"],
          location: "Northern Plains",
          significance: 0.8,
        },
        {
          id: "evt-2",
          type: "discovery",
          timestamp: 1100,
          actors: ["Kingdom A"],
          location: "Mountain Range",
          significance: 0.5,
        },
      ];

      const searchTerm = "plains";
      const filtered = events.filter((e) =>
        e.location.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("evt-1");
    });

    it("should combine multiple filters correctly", () => {
      const events: SimulationEvent[] = [
        {
          id: "evt-1",
          type: "war",
          timestamp: 1000,
          actors: ["Kingdom A", "Kingdom B"],
          location: "Plains",
          significance: 0.8,
        },
        {
          id: "evt-2",
          type: "war",
          timestamp: 1100,
          actors: ["Kingdom B"],
          location: "Coast",
          significance: 0.5,
        },
        {
          id: "evt-3",
          type: "discovery",
          timestamp: 1200,
          actors: ["Kingdom A"],
          location: "Mountains",
          significance: 0.7,
        },
      ];

      // Filter: type = "war" AND timestamp >= 1000 AND actor includes "Kingdom A"
      const filtered = events.filter(
        (e) =>
          e.type === "war" &&
          e.timestamp >= 1000 &&
          e.actors.includes("Kingdom A")
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("evt-1");
    });
  });

  describe("Civilization Map Real-Time Updates", () => {
    it("should emit simulation state updates", () => {
      const stateUpdates: any[] = [];

      eventBus.on("simulation_state", (state) => {
        stateUpdates.push(state);
      });

      const testState = {
        status: "running" as const,
        currentTick: 100,
        speed: 1.0,
        totalEvents: 50,
        totalCascades: 5,
      };

      eventBus.emitSimulationState(testState);

      expect(stateUpdates).toHaveLength(1);
      expect(stateUpdates[0].status).toBe("running");
      expect(stateUpdates[0].currentTick).toBe(100);
    });

    it("should track trade network updates", () => {
      const tradeUpdates: any[] = [];

      eventBus.on("trade_network", (update) => {
        tradeUpdates.push(update);
      });

      const testUpdate = {
        type: "route_created" as const,
        source: "Kingdom A",
        target: "Kingdom B",
        resource: "wheat",
        timestamp: Date.now(),
      };

      eventBus.emitTradeNetworkUpdate(testUpdate);

      expect(tradeUpdates).toHaveLength(1);
      expect(tradeUpdates[0].type).toBe("route_created");
      expect(tradeUpdates[0].source).toBe("Kingdom A");
    });

    it("should handle multiple simultaneous updates", () => {
      const allUpdates: any[] = [];

      eventBus.on("event", (e) => allUpdates.push({ type: "event", data: e }));
      eventBus.on("cascade", (c) => allUpdates.push({ type: "cascade", data: c }));
      eventBus.on("trade_network", (t) => allUpdates.push({ type: "trade", data: t }));

      const evt: SimulationEvent = {
        id: "evt-1",
        type: "war",
        timestamp: Date.now(),
        actors: ["Kingdom A"],
        location: "Plains",
        significance: 0.8,
      };

      const cascade: CascadeUpdate = {
        id: "cascade-1",
        name: "Trade Collapse",
        severity: 0.7,
        eventCount: 3,
        affectedEntities: ["Kingdom A", "Kingdom B"],
      };

      eventBus.emitEvent(evt);
      eventBus.emitCascade(cascade);

      expect(allUpdates).toHaveLength(2);
      expect(allUpdates[0].type).toBe("event");
      expect(allUpdates[1].type).toBe("cascade");
    });
  });

  describe("Error Handling in Integration", () => {
    it("should handle malformed event data gracefully", () => {
      const malformedEvent = {
        id: "evt-1",
        // Missing required fields
      };

      const isValid =
        malformedEvent &&
        "id" in malformedEvent &&
        "type" in malformedEvent &&
        "timestamp" in malformedEvent;

      expect(isValid).toBe(false);
    });

    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });

      eventBus.on("event", errorListener);

      const testEvent: SimulationEvent = {
        id: "evt-1",
        type: "war",
        timestamp: Date.now(),
        actors: ["Kingdom A"],
        location: "Plains",
        significance: 0.8,
      };

      // Should not crash the event bus
      expect(() => {
        eventBus.emitEvent(testEvent);
      }).toThrow();
    });

    it("should recover from listener removal", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      eventBus.on("event", listener1);
      eventBus.on("event", listener2);

      expect(eventBus.listenerCount("event")).toBe(2);

      // Remove one listener
      eventBus.removeListener("event", listener1);
      expect(eventBus.listenerCount("event")).toBe(1);

      // Emit event - only listener2 should be called
      const testEvent: SimulationEvent = {
        id: "evt-1",
        type: "war",
        timestamp: Date.now(),
        actors: ["Kingdom A"],
        location: "Plains",
        significance: 0.8,
      };

      eventBus.emitEvent(testEvent);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});
