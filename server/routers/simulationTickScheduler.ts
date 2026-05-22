/**
 * Simulation Tick Scheduler: tRPC Procedures
 * 
 * Exposes the SimulationEventLoop through tRPC procedures, allowing frontend
 * to control simulation playback (play/pause/stop), adjust speed, and receive
 * real-time updates via WebSocket.
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { SimulationEventLoop, type SimulationConfig, type SimulationState } from '../engines/simulationEventLoop';
import type { EventNode } from '../../types/narrative';

// Global simulation instances (in production, use a proper store)
const simulationInstances = new Map<string, SimulationEventLoop>();
const simulationConfigs = new Map<string, SimulationConfig>();

/**
 * Initialize a new simulation instance
 */
async function initializeSimulation(config: SimulationConfig): Promise<SimulationEventLoop> {
  if (simulationInstances.has(config.galaxyId)) {
    return simulationInstances.get(config.galaxyId)!;
  }

  const loop = new SimulationEventLoop(config);
  await loop.initialize();

  simulationInstances.set(config.galaxyId, loop);
  simulationConfigs.set(config.galaxyId, config);

  return loop;
}

/**
 * Get or create simulation instance
 */
function getSimulation(galaxyId: string): SimulationEventLoop | null {
  return simulationInstances.get(galaxyId) || null;
}

export const simulationTickSchedulerRouter = router({
  /**
   * Create and initialize a new simulation
   */
  createSimulation: protectedProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        civilizations: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            initialPopulation: z.number().min(100).max(10000),
            initialTechnology: z.number().min(0).max(100),
            initialResources: z.number().min(0).max(100),
          })
        ),
        startYear: z.number().int().default(0),
        tickDuration: z.number().int().min(100).max(5000).default(1000),
        cascadeThreshold: z.number().min(0).max(1).default(0.5),
        narrativeEnabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const config: SimulationConfig = {
        galaxyId: input.galaxyId,
        civilizations: input.civilizations,
        startYear: input.startYear,
        tickDuration: input.tickDuration,
        cascadeThreshold: input.cascadeThreshold,
        narrativeEnabled: input.narrativeEnabled,
      };

      const simulation = await initializeSimulation(config);

      return {
        success: true,
        galaxyId: config.galaxyId,
        state: simulation.getStateSnapshot(),
      };
    }),

  /**
   * Start simulation playback
   */
  playSimulation: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .mutation(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      simulation.start();

      return {
        success: true,
        message: 'Simulation started',
        state: simulation.getStateSnapshot(),
      };
    }),

  /**
   * Pause simulation playback
   */
  pauseSimulation: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .mutation(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      simulation.pause();

      return {
        success: true,
        message: 'Simulation paused',
        state: simulation.getStateSnapshot(),
      };
    }),

  /**
   * Stop simulation and reset to start
   */
  stopSimulation: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .mutation(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      simulation.stop();

      return {
        success: true,
        message: 'Simulation stopped and reset',
        state: simulation.getStateSnapshot(),
      };
    }),

  /**
   * Adjust simulation speed
   */
  setSimulationSpeed: protectedProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        speed: z.number().min(0.1).max(5.0),
      })
    )
    .mutation(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      simulation.setSpeed(input.speed);

      return {
        success: true,
        message: `Simulation speed set to ${input.speed}x`,
        speed: input.speed,
        state: simulation.getStateSnapshot(),
      };
    }),

  /**
   * Execute a single tick manually
   */
  executeTick: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .mutation(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      await simulation.tick();

      return {
        success: true,
        message: 'Tick executed',
        state: simulation.getStateSnapshot(),
      };
    }),

  /**
   * Inject a custom event into the simulation
   */
  injectEvent: protectedProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        event: z.object({
          title: z.string(),
          eventType: z.string(),
          importance: z.number().min(0).max(10),
          causalStrength: z.number().min(0).max(1),
          involvedCivilizations: z.array(z.string()),
          description: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      const event: EventNode = {
        id: `evt_${Date.now()}_${Math.random()}`,
        title: input.event.title,
        eventType: input.event.eventType,
        year: simulation.getStateSnapshot().currentYear,
        importance: input.event.importance,
        causalStrength: input.event.causalStrength,
        constraintSatisfaction: 0.8,
        unityCoefficient: 0.7,
        involvedCivilizations: input.event.involvedCivilizations.map(c => parseInt(c)) as any,
        description: input.event.description,
        narrative: '',
        causes: [],
        consequences: [],
        harmonyFrequency: 0.5,
        phaseCoherence: 0.7,
        resonanceVector: { sound: 0, light: 0, time: 0 },
        sacredGapScore: 0.5,
        involvedSpecies: [],
        involvedFigures: [],
        generatedBy: 'user',
        confidenceScore: input.event.causalStrength,
        galaxyId: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await simulation.injectEvent(event);

      return {
        success: true,
        message: 'Event injected',
        eventId: event.id,
        state: simulation.getStateSnapshot(),
      };
    }),

  /**
   * Get current simulation state
   */
  getSimulationState: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      const state = simulation.getStateSnapshot();

      return {
        galaxyId: state.galaxyId,
        currentYear: state.currentYear,
        tick: state.tick,
        isRunning: state.isRunning,
        speed: state.speed,
        eventCount: state.events.length,
        cascadeCount: state.cascades.length,
        civilizations: Array.from(state.civilizations.values()).map((civ) => ({
          id: civ.id,
          name: civ.name,
          population: Math.round(civ.population),
          technology: Math.round(civ.technology),
          resources: Math.round(civ.resources),
          culture: Math.round(civ.culture),
          phase: civ.evolutionState.currentPhase,
          postScarcity: civ.evolutionState.postScarcityAchieved,
        })),
      };
    }),

  /**
   * Get recent events
   */
  getRecentEvents: protectedProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      const state = simulation.getStateSnapshot();
      const events = state.eventHistory.slice(-input.limit - input.offset, -input.offset || undefined).reverse();

      return {
        events: events.map((e) => ({
          id: e.id,
          title: e.title,
          eventType: e.eventType,
          year: e.year,
          importance: e.importance,
          causalStrength: e.causalStrength,
          involvedCivilizations: e.involvedCivilizations,
          narrative: e.narrative,
        })),
        total: state.eventHistory.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get cascades
   */
  getCascades: protectedProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      const state = simulation.getStateSnapshot();
      const cascades = state.cascades.slice(-input.limit - input.offset, -input.offset || undefined).reverse();

      return {
        cascades: cascades.map((c) => ({
          id: c.id,
          triggerId: c.triggerId,
          year: c.year,
          severity: c.severity,
          eventCount: c.events.length,
          affectedCivilizations: c.affectedCivilizations,
          status: c.status,
        })),
        total: state.cascades.length,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get cascade details
   */
  getCascadeDetails: protectedProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        cascadeId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      const state = simulation.getStateSnapshot();
      const cascade = state.cascades.find((c) => c.id === input.cascadeId);

      if (!cascade) {
        throw new Error(`Cascade ${input.cascadeId} not found`);
      }

      return {
        id: cascade.id,
        triggerId: cascade.triggerId,
        year: cascade.year,
        severity: cascade.severity,
        status: cascade.status,
        affectedCivilizations: cascade.affectedCivilizations,
        events: cascade.events.map((e) => ({
          id: e.id,
          title: e.title,
          eventType: e.eventType,
          year: e.year,
          importance: e.importance,
          causalStrength: e.causalStrength,
          involvedCivilizations: e.involvedCivilizations,
        })),
      };
    }),

  /**
   * Get civilization details
   */
  getCivilizationDetails: protectedProcedure
    .input(
      z.object({
        galaxyId: z.string(),
        civilizationId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      const state = simulation.getStateSnapshot();
      const civ = state.civilizations.get(input.civilizationId);

      if (!civ) {
        throw new Error(`Civilization ${input.civilizationId} not found`);
      }

      return {
        id: civ.id,
        name: civ.name,
        year: civ.year,
        population: Math.round(civ.population),
        technology: Math.round(civ.technology),
        resources: Math.round(civ.resources),
        culture: Math.round(civ.culture),
        phase: civ.evolutionState.currentPhase,
        postScarcity: civ.evolutionState.postScarcityAchieved,
        emotionalState: Object.fromEntries(civ.emotionalState.variables),
        traits: Array.from(civ.traitProfile.traits.values()).map((t: any) => ({
          id: t.id,
          name: t.name,
          value: t.value,
          category: t.category,
        })),
      };
    }),

  /**
   * Get simulation statistics
   */
  getSimulationStats: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      const state = simulation.getStateSnapshot();
      const eventsByType: Record<string, number> = {};
      const eventsByCivilization: Record<string, number> = {};

      for (const event of state.eventHistory) {
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
        for (const civ of event.involvedCivilizations) {
          eventsByCivilization[civ] = (eventsByCivilization[civ] || 0) + 1;
        }
      }

      const avgCascadeSize = state.cascades.length > 0 ? state.cascades.reduce((sum, c) => sum + c.events.length, 0) / state.cascades.length : 0;

      return {
        totalYears: state.currentYear - simulationConfigs.get(input.galaxyId)?.startYear || 0,
        totalTicks: state.tick,
        totalEvents: state.eventHistory.length,
        totalCascades: state.cascades.length,
        averageCascadeSize: Math.round(avgCascadeSize * 100) / 100,
        eventsByType,
        eventsByCivilization,
        civilizationCount: state.civilizations.size,
        isRunning: state.isRunning,
        currentSpeed: state.speed,
      };
    }),

  /**
   * Delete simulation instance
   */
  deleteSimulation: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .mutation(async ({ input }) => {
      const simulation = getSimulation(input.galaxyId);
      if (!simulation) {
        throw new Error(`Simulation ${input.galaxyId} not found`);
      }

      simulation.stop();
      simulationInstances.delete(input.galaxyId);
      simulationConfigs.delete(input.galaxyId);

      return {
        success: true,
        message: `Simulation ${input.galaxyId} deleted`,
      };
    }),
});
