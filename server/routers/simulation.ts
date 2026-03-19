/**
 * Simulation Router
 * 
 * Exposes SystemIntegrationManager through tRPC procedures
 * Allows frontend to query events, cascades, narratives, and network statistics
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import SystemIntegrationManager from "../engines/systemIntegration";

// Initialize simulation manager (in production, this would be per-galaxy)
const simulationManager = new SystemIntegrationManager();

export const simulationRouter = router({
  /**
   * Get all events for a galaxy
   */
  getEvents: publicProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      })
    )
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const events = history.events.slice(input.offset, input.offset + input.limit);

      return {
        events: events.map((event) => ({
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          actors: event.actors,
          location: event.location,
          significance: event.significance,
          causalParents: event.causalParents,
          causalChildren: event.causalChildren,
        })),
        total: history.events.length,
        offset: input.offset,
        limit: input.limit,
      };
    }),

  /**
   * Get a specific event with full details
   */
  getEventDetail: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const event = history.events.find((e) => e.id === input.eventId);

      if (!event) {
        return null;
      }

      return {
        ...event,
        narratives: history.narratives[input.eventId] || null,
      };
    }),

  /**
   * Get all cascades
   */
  getCascades: publicProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        minSeverity: z.number().optional().default(0),
      })
    )
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const cascades = history.cascades.filter(
        (c) => c.severity >= input.minSeverity
      );

      return cascades.map((cascade) => ({
        id: cascade.id,
        name: cascade.name,
        rootCause: cascade.rootCause,
        eventCount: cascade.events.length,
        severity: cascade.severity,
        affectedEntities: Array.from(cascade.affectedEntities),
      }));
    }),

  /**
   * Get cascade details
   */
  getCascadeDetail: publicProcedure
    .input(z.object({ cascadeId: z.string() }))
    .query(({ input }) => {
      const cascadeDetail = simulationManager.getCascadeDetails(input.cascadeId);

      if (!cascadeDetail) {
        return null;
      }

      return {
        id: cascadeDetail.id,
        name: cascadeDetail.name,
        rootCause: cascadeDetail.rootCause,
        severity: cascadeDetail.severity,
        affectedEntities: Array.from(cascadeDetail.affectedEntities),
        events: cascadeDetail.events.map((e) => ({
          id: e?.id,
          type: e?.type,
          timestamp: e?.timestamp,
          significance: e?.significance,
        })),
        timeline: cascadeDetail.timeline.map((e) => ({
          id: e?.id,
          type: e?.type,
          timestamp: e?.timestamp,
        })),
      };
    }),

  /**
   * Get narrative for an event
   */
  getNarrative: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const narrative = history.narratives[input.eventId];

      if (!narrative) {
        return null;
      }

      return narrative;
    }),

  /**
   * Get causal graph visualization data
   */
  getCausalGraph: publicProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      return history.causalGraph;
    }),

  /**
   * Get trade network visualization data
   */
  getTradeNetwork: publicProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      return history.tradeNetwork;
    }),

  /**
   * Get network statistics
   */
  getNetworkStats: publicProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(({ input }) => {
      return simulationManager.getNetworkStats();
    }),

  /**
   * Get narrative statistics
   */
  getNarrativeStats: publicProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(({ input }) => {
      return simulationManager.getNarrativeStats();
    }),

  /**
   * Get causal statistics
   */
  getCausalStats: publicProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(({ input }) => {
      return simulationManager.getCausalStats();
    }),

  /**
   * Get complete event history
   */
  getEventHistory: publicProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(({ input }) => {
      return simulationManager.getEventHistory();
    }),

  /**
   * Search events by type
   */
  searchEventsByType: publicProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        eventType: z.string(),
        limit: z.number().optional().default(50),
      })
    )
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const filtered = history.events
        .filter((e) => e.type === input.eventType)
        .slice(0, input.limit);

      return filtered;
    }),

  /**
   * Search events by actor
   */
  searchEventsByActor: publicProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        actor: z.string(),
        limit: z.number().optional().default(50),
      })
    )
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const filtered = history.events
        .filter((e) => e.actors.includes(input.actor))
        .slice(0, input.limit);

      return filtered;
    }),

  /**
   * Get events by time range
   */
  getEventsByTimeRange: publicProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        startTime: z.number(),
        endTime: z.number(),
      })
    )
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const filtered = history.events.filter(
        (e) => e.timestamp >= input.startTime && e.timestamp <= input.endTime
      );

      return filtered;
    }),

  /**
   * Get causal chain (ancestors and descendants of an event)
   */
  getCausalChain: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        depth: z.number().optional().default(3),
      })
    )
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const event = history.events.find((e) => e.id === input.eventId);

      if (!event) {
        return null;
      }

      const ancestors: typeof event[] = [];
      const descendants: typeof event[] = [];

      // Collect ancestors
      const collectAncestors = (e: typeof event, d: number) => {
        if (d <= 0) return;
        e.causalParents.forEach((parentId) => {
          const parent = history.events.find((ev) => ev.id === parentId);
          if (parent && !ancestors.includes(parent)) {
            ancestors.push(parent);
            collectAncestors(parent, d - 1);
          }
        });
      };

      // Collect descendants
      const collectDescendants = (e: typeof event, d: number) => {
        if (d <= 0) return;
        e.causalChildren.forEach((childId) => {
          const child = history.events.find((ev) => ev.id === childId);
          if (child && !descendants.includes(child)) {
            descendants.push(child);
            collectDescendants(child, d - 1);
          }
        });
      };

      collectAncestors(event, input.depth);
      collectDescendants(event, input.depth);

      return {
        event,
        ancestors,
        descendants,
        depth: input.depth,
      };
    }),

  /**
   * Get summary statistics for a galaxy
   */
  getSummaryStats: publicProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(({ input }) => {
      const history = simulationManager.getEventHistory();
      const networkStats = simulationManager.getNetworkStats();
      const narrativeStats = simulationManager.getNarrativeStats();
      const causalStats = simulationManager.getCausalStats();

      return {
        totalEvents: history.events.length,
        totalCascades: history.cascades.length,
        averageEventSignificance:
          history.events.reduce((sum, e) => sum + e.significance, 0) /
          Math.max(history.events.length, 1),
        networkStats,
        narrativeStats,
        causalStats,
      };
    }),
});

export default simulationRouter;
