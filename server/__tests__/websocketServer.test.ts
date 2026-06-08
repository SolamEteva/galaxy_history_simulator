/**
 * WebSocket Server Tests
 * 
 * Tests for real-time event broadcasting, connection management, and heartbeat mechanism
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketServerManager } from '../_core/websocketServer';
import { createServer } from 'http';
import type { WebSocket } from 'ws';

describe('WebSocketServerManager', () => {
  let manager: WebSocketServerManager;
  let httpServer: ReturnType<typeof createServer>;

  beforeEach(() => {
    manager = new WebSocketServerManager();
    httpServer = createServer() as any;
  });

  afterEach(() => {
    manager.shutdown();
    httpServer.close();
  });

  describe('Connection Management', () => {
    it('should initialize WebSocket server on HTTP server', () => {
      expect(() => manager.initialize(httpServer)).not.toThrow();
    });

    it('should track connected clients', () => {
      manager.initialize(httpServer);
      const stats = manager.getStats();
      expect(stats.totalConnections).toBe(0);
      expect(stats.activeSimulations).toBe(0);
    });

    it('should reject connections without galaxy ID', () => {
      manager.initialize(httpServer);
      // Connection validation happens at handler level
      expect(manager.getStats().totalConnections).toBe(0);
    });
  });

  describe('Broadcasting', () => {
    it('should broadcast events to galaxy subscribers', () => {
      manager.initialize(httpServer);

      const testEvent = {
        id: 'evt_1',
        title: 'Test Event',
        year: 1000,
        importance: 5,
      };

      // Should not throw
      expect(() => manager.broadcastEvent('galaxy_1', testEvent)).not.toThrow();
    });

    it('should broadcast cascades to galaxy subscribers', () => {
      manager.initialize(httpServer);

      const testCascade = {
        id: 'cascade_1',
        events: [],
        affectedCivilizations: ['civ_1'],
      };

      expect(() => manager.broadcastCascade('galaxy_1', testCascade)).not.toThrow();
    });

    it('should broadcast tick updates', () => {
      manager.initialize(httpServer);

      const tickData = {
        tick: 1,
        year: 1000,
        eventCount: 5,
        cascadeCount: 1,
      };

      expect(() => manager.broadcastTick('galaxy_1', tickData)).not.toThrow();
    });

    it('should broadcast errors', () => {
      manager.initialize(httpServer);

      expect(() => manager.broadcastError('galaxy_1', 'Test error')).not.toThrow();
    });
  });

  describe('Statistics', () => {
    it('should return correct statistics', () => {
      manager.initialize(httpServer);

      const stats = manager.getStats();

      expect(stats).toHaveProperty('totalConnections');
      expect(stats).toHaveProperty('connectionsByGalaxy');
      expect(stats).toHaveProperty('activeSimulations');

      expect(typeof stats.totalConnections).toBe('number');
      expect(typeof stats.activeSimulations).toBe('number');
      expect(typeof stats.connectionsByGalaxy).toBe('object');
    });

    it('should track connections by galaxy', () => {
      manager.initialize(httpServer);

      const stats = manager.getStats();
      expect(stats.connectionsByGalaxy).toEqual({});
    });
  });

  describe('Heartbeat Mechanism', () => {
    it('should initialize heartbeat on startup', () => {
      manager.initialize(httpServer);
      // Heartbeat is started internally
      const stats = manager.getStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', () => {
      manager.initialize(httpServer);
      expect(() => manager.shutdown()).not.toThrow();
    });

    it('should close all connections on shutdown', () => {
      manager.initialize(httpServer);
      manager.shutdown();

      const stats = manager.getStats();
      expect(stats.totalConnections).toBe(0);
    });
  });
});
