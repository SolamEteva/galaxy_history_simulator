/**
 * useSimulationWebSocket Hook
 * 
 * Manages WebSocket connection to simulation server
 * Handles real-time event streaming, cascades, and state updates
 */

import { useEffect, useRef, useState, useCallback } from "react";

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
  | { type: "ping" }
  | { type: "pong" };

interface UseSimulationWebSocketOptions {
  enabled?: boolean;
  onEvent?: (event: SimulationEvent) => void;
  onCascade?: (cascade: CascadeUpdate) => void;
  onTradeNetworkUpdate?: (update: TradeNetworkUpdate) => void;
  onSimulationStateChange?: (state: SimulationStateUpdate) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function useSimulationWebSocket(options: UseSimulationWebSocketOptions = {}) {
  const {
    enabled = true,
    onEvent,
    onCascade,
    onTradeNetworkUpdate,
    onSimulationStateChange,
    onError,
    onConnected,
    onDisconnected,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setReconnectAttempts(0);
        onConnected?.();

        // Start heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;

          switch (message.type) {
            case "event":
              onEvent?.(message.data);
              break;
            case "cascade":
              onCascade?.(message.data);
              break;
            case "trade_network":
              onTradeNetworkUpdate?.(message.data);
              break;
            case "simulation_state":
              onSimulationStateChange?.(message.data);
              break;
            case "pong":
              // Heartbeat response
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          onError?.(error instanceof Error ? error : new Error(String(error)));
        }
      };

      ws.onerror = (event) => {
        const error = new Error("WebSocket error");
        console.error("WebSocket error:", error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        onDisconnected?.();

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Attempt to reconnect
        if (enabled && reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Error creating WebSocket:", err);
      onError?.(err);
    }
  }, [enabled, onEvent, onCascade, onTradeNetworkUpdate, onSimulationStateChange, onError, onConnected, onDisconnected, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    setIsConnected(false);
  }, []);

  const subscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", channel }));
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "unsubscribe", channel }));
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  };
}

export default useSimulationWebSocket;
