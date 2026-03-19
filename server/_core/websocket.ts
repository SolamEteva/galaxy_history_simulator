/**
 * WebSocket Infrastructure
 * 
 * Enables real-time streaming of:
 * - New events as they occur
 * - Cascade detection and progression
 * - Trade network changes
 * - Narrative updates
 * - Simulation state changes
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { EventEmitter } from "events";

export interface SimulationEvent {
  id: string;
  type: string;
  timestamp: number;
  actors: string[];
  location: string;
  significance: number;
}

export interface CascadeUpdate {
  id: string;
  name: string;
  severity: number;
  eventCount: number;
  affectedEntities: string[];
}

export interface TradeNetworkUpdate {
  type: "route_created" | "route_disrupted" | "flow_started" | "flow_completed";
  source: string;
  target: string;
  resource?: string;
  timestamp: number;
}

export interface SimulationStateUpdate {
  status: "running" | "paused" | "stopped";
  currentTick: number;
  speed: number;
  totalEvents: number;
  totalCascades: number;
}

export type WebSocketMessage =
  | { type: "event"; data: SimulationEvent }
  | { type: "cascade"; data: CascadeUpdate }
  | { type: "trade_network"; data: TradeNetworkUpdate }
  | { type: "simulation_state"; data: SimulationStateUpdate }
  | { type: "subscribe"; channel: string }
  | { type: "unsubscribe"; channel: string }
  | { type: "ping" }
  | { type: "pong" };

/**
 * Simulation Event Bus
 * Central hub for broadcasting simulation events to all connected clients
 */
export class SimulationEventBus extends EventEmitter {
  private static instance: SimulationEventBus;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): SimulationEventBus {
    if (!SimulationEventBus.instance) {
      SimulationEventBus.instance = new SimulationEventBus();
    }
    return SimulationEventBus.instance;
  }

  emitEvent(event: SimulationEvent): void {
    this.emit("event", event);
  }

  emitCascade(cascade: CascadeUpdate): void {
    this.emit("cascade", cascade);
  }

  emitTradeNetworkUpdate(update: TradeNetworkUpdate): void {
    this.emit("trade_network", update);
  }

  emitSimulationStateChange(state: SimulationStateUpdate): void {
    this.emit("simulation_state", state);
  }
}

/**
 * WebSocket Connection Manager
 * Handles individual client connections and subscriptions
 */
export class WebSocketConnectionManager {
  private ws: WebSocket;
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private eventBus: SimulationEventBus;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.eventBus = SimulationEventBus.getInstance();
    this.setupListeners();
  }

  private setupListeners(): void {
    this.ws.on("message", (data: string) => this.handleMessage(data));
    this.ws.on("close", () => this.handleClose());
    this.ws.on("error", (error) => this.handleError(error));

    // Subscribe to all channels by default
    this.subscribe("events");
    this.subscribe("cascades");
    this.subscribe("trade_network");
    this.subscribe("simulation_state");

    // Setup event listeners
    this.eventBus.on("event", (event: SimulationEvent) => {
      if (this.subscriptions.has("events")) {
        this.send({ type: "event", data: event });
      }
    });

    this.eventBus.on("cascade", (cascade: CascadeUpdate) => {
      if (this.subscriptions.has("cascades")) {
        this.send({ type: "cascade", data: cascade });
      }
    });

    this.eventBus.on("trade_network", (update: TradeNetworkUpdate) => {
      if (this.subscriptions.has("trade_network")) {
        this.send({ type: "trade_network", data: update });
      }
    });

    this.eventBus.on("simulation_state", (state: SimulationStateUpdate) => {
      if (this.subscriptions.has("simulation_state")) {
        this.send({ type: "simulation_state", data: state });
      }
    });

    // Heartbeat to keep connection alive
    this.startHeartbeat();
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as WebSocketMessage;

      switch (message.type) {
        case "subscribe":
          this.subscribe(message.channel);
          break;
        case "unsubscribe":
          this.unsubscribe(message.channel);
          break;
        case "ping":
          this.send({ type: "pong" });
          break;
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  }

  private handleClose(): void {
    this.cleanup();
  }

  private handleError(error: Error | undefined): void {
    if (error) {
      console.error("WebSocket error:", error);
    }
  }

  private subscribe(channel: string): void {
    this.subscriptions.add(channel);
  }

  private unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
  }

  private send(message: WebSocketMessage): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    }
  }

  private startHeartbeat(): void {
    const heartbeatInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // Every 30 seconds
  }

  private cleanup(): void {
    this.subscriptions.clear();
    this.eventBus.removeAllListeners();
  }

  isConnected(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * WebSocket Server Manager
 * Creates and manages WebSocket server instance
 */
export class WebSocketServerManager {
  private wss: WebSocketServer;
  private connections: Set<WebSocketConnectionManager> = new Set();
  private eventBus: SimulationEventBus;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/api/ws" });
    this.eventBus = SimulationEventBus.getInstance();
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("New WebSocket connection");
      const manager = new WebSocketConnectionManager(ws);
      this.connections.add(manager);

      ws.on("close", () => {
        this.connections.delete(manager);
        console.log("WebSocket connection closed");
      });
    });

    this.wss.on("error", (error: Error) => {
      console.error("WebSocket server error:", error);
    });
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastEvent(event: SimulationEvent): void {
    this.eventBus.emitEvent(event);
  }

  /**
   * Broadcast cascade to all connected clients
   */
  broadcastCascade(cascade: CascadeUpdate): void {
    this.eventBus.emitCascade(cascade);
  }

  /**
   * Broadcast trade network update to all connected clients
   */
  broadcastTradeNetworkUpdate(update: TradeNetworkUpdate): void {
    this.eventBus.emitTradeNetworkUpdate(update);
  }

  /**
   * Broadcast simulation state change to all connected clients
   */
  broadcastSimulationStateChange(state: SimulationStateUpdate): void {
    this.eventBus.emitSimulationStateChange(state);
  }

  /**
   * Get number of connected clients
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    this.wss.clients.forEach((client: WebSocket) => {
      client.close();
    });
  }
}

// Export singleton instance getter
let wsManager: WebSocketServerManager | null = null;

export function initializeWebSocketServer(server: Server): WebSocketServerManager {
  if (!wsManager) {
    wsManager = new WebSocketServerManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketServerManager | null {
  return wsManager;
}

export default SimulationEventBus;
