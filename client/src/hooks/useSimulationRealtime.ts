/**
 * useSimulationRealtime: React Hook for Real-Time Simulation Updates
 * 
 * Manages WebSocket connection to simulation event stream and provides
 * real-time updates for events, cascades, and state changes.
 */

import { useEffect, useState, useCallback, useRef } from 'react';

export interface SimulationEvent {
  id: string;
  title: string;
  eventType: string;
  year: number;
  importance: number;
  causalStrength: number;
  involvedCivilizations: string[];
  narratives?: Record<string, string>;
}

export interface CascadeUpdate {
  id: string;
  triggerId: string;
  year: number;
  severity: number;
  eventCount: number;
  affectedCivilizations: string[];
  status: 'active' | 'resolved' | 'ongoing';
}

export interface TickUpdate {
  year: number;
  tick: number;
  eventCount: number;
  cascadeCount: number;
  state: {
    galaxyId: string;
    currentYear: number;
    tick: number;
    isRunning: boolean;
    speed: number;
  };
}

export interface SimulationRealtimeState {
  connected: boolean;
  lastEvent: SimulationEvent | null;
  lastCascade: CascadeUpdate | null;
  lastTick: TickUpdate | null;
  eventStream: SimulationEvent[];
  cascadeStream: CascadeUpdate[];
  error: string | null;
  connectionAttempts: number;
}

interface WebSocketMessage {
  type: 'event' | 'cascade' | 'tick' | 'error' | 'connected' | 'disconnected';
  data: any;
}

const MAX_STREAM_SIZE = 100; // Keep last 100 events/cascades

export function useSimulationRealtime(galaxyId: string, enabled: boolean = true) {
  const [state, setState] = useState<SimulationRealtimeState>({
    connected: false,
    lastEvent: null,
    lastCascade: null,
    lastTick: null,
    eventStream: [],
    cascadeStream: [],
    error: null,
    connectionAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!enabled || !galaxyId) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/simulation/${galaxyId}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setState((prev) => ({
          ...prev,
          connected: true,
          error: null,
          connectionAttempts: 0,
        }));

        // Start heartbeat
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          setState((prev) => {
            const newState = { ...prev };

            switch (message.type) {
              case 'event': {
                const newEvent = message.data as SimulationEvent;
                newState.lastEvent = newEvent;
                newState.eventStream = [newEvent, ...prev.eventStream].slice(0, MAX_STREAM_SIZE);
                break;
              }

              case 'cascade': {
                const newCascade = message.data as CascadeUpdate;
                newState.lastCascade = newCascade;
                newState.cascadeStream = [newCascade, ...prev.cascadeStream].slice(0, MAX_STREAM_SIZE);
                break;
              }

              case 'tick': {
                newState.lastTick = message.data as TickUpdate;
                break;
              }

              case 'error': {
                newState.error = message.data.message || 'Unknown error';
                break;
              }
            }

            return newState;
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState((prev) => ({
          ...prev,
          error: 'WebSocket connection error',
        }));
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setState((prev) => ({
          ...prev,
          connected: false,
        }));

        // Attempt to reconnect with exponential backoff
        setState((prev) => {
          const attempts = prev.connectionAttempts + 1;
          const delay = Math.min(1000 * Math.pow(2, attempts), 30000);

          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connect, delay);

          return {
            ...prev,
            connectionAttempts: attempts,
          };
        });
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to connect to simulation',
      }));
    }
  }, [galaxyId, enabled]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

    setState((prev) => ({
      ...prev,
      connected: false,
    }));
  }, []);

  /**
   * Send message to simulation
   */
  const send = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  /**
   * Clear event stream
   */
  const clearEventStream = useCallback(() => {
    setState((prev) => ({
      ...prev,
      eventStream: [],
    }));
  }, []);

  /**
   * Clear cascade stream
   */
  const clearCascadeStream = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cascadeStream: [],
    }));
  }, []);

  // Connect on mount
  useEffect(() => {
    if (enabled && galaxyId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [galaxyId, enabled, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    send,
    clearEventStream,
    clearCascadeStream,
  };
}
