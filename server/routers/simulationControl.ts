/**
 * Simulation Control Router
 * 
 * Procedures for controlling simulation playback:
 * - Play/Pause/Stop
 * - Speed adjustment
 * - Event injection
 * - Civilization parameter modification
 * - State persistence
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { SimulationEventBus } from "../_core/websocket";

// Simulation state management
interface SimulationInstance {
  id: string;
  galaxyId: string;
  status: "running" | "paused" | "stopped";
  currentTick: number;
  speed: number;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory simulation instances (in production, store in database)
const simulationInstances = new Map<string, SimulationInstance>();
const eventBus = SimulationEventBus.getInstance();

export const simulationControlRouter = router({
  /**
   * Initialize a new simulation for a galaxy
   */
  initializeSimulation: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const simulation: SimulationInstance = {
        id: simulationId,
        galaxyId: input.galaxyId,
        status: "paused",
        currentTick: 0,
        speed: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      simulationInstances.set(simulationId, simulation);

      // Broadcast initial state
      eventBus.emitSimulationStateChange({
        status: "paused",
        currentTick: 0,
        speed: 1,
        totalEvents: 0,
        totalCascades: 0,
      });

      return {
        simulationId,
        status: simulation.status,
        currentTick: simulation.currentTick,
        speed: simulation.speed,
      };
    }),

  /**
   * Play simulation
   */
  playSimulation: protectedProcedure
    .input(z.object({ simulationId: z.string() }))
    .mutation(async ({ input }) => {
      const simulation = simulationInstances.get(input.simulationId);
      if (!simulation) {
        throw new Error("Simulation not found");
      }

      simulation.status = "running";
      simulation.updatedAt = new Date();

      // Broadcast state change
      eventBus.emitSimulationStateChange({
        status: "running",
        currentTick: simulation.currentTick,
        speed: simulation.speed,
        totalEvents: 0,
        totalCascades: 0,
      });

      // In production, start simulation engine loop here
      console.log(`Simulation ${input.simulationId} started`);

      return {
        simulationId: simulation.id,
        status: simulation.status,
        currentTick: simulation.currentTick,
      };
    }),

  /**
   * Pause simulation
   */
  pauseSimulation: protectedProcedure
    .input(z.object({ simulationId: z.string() }))
    .mutation(async ({ input }) => {
      const simulation = simulationInstances.get(input.simulationId);
      if (!simulation) {
        throw new Error("Simulation not found");
      }

      simulation.status = "paused";
      simulation.updatedAt = new Date();

      // Broadcast state change
      eventBus.emitSimulationStateChange({
        status: "paused",
        currentTick: simulation.currentTick,
        speed: simulation.speed,
        totalEvents: 0,
        totalCascades: 0,
      });

      console.log(`Simulation ${input.simulationId} paused`);

      return {
        simulationId: simulation.id,
        status: simulation.status,
        currentTick: simulation.currentTick,
      };
    }),

  /**
   * Stop simulation
   */
  stopSimulation: protectedProcedure
    .input(z.object({ simulationId: z.string() }))
    .mutation(async ({ input }) => {
      const simulation = simulationInstances.get(input.simulationId);
      if (!simulation) {
        throw new Error("Simulation not found");
      }

      simulation.status = "stopped";
      simulation.currentTick = 0;
      simulation.updatedAt = new Date();

      // Broadcast state change
      eventBus.emitSimulationStateChange({
        status: "stopped",
        currentTick: 0,
        speed: simulation.speed,
        totalEvents: 0,
        totalCascades: 0,
      });

      console.log(`Simulation ${input.simulationId} stopped`);

      return {
        simulationId: simulation.id,
        status: simulation.status,
        currentTick: 0,
      };
    }),

  /**
   * Adjust simulation speed
   */
  setSimulationSpeed: protectedProcedure
    .input(
      z.object({
        simulationId: z.string(),
        speed: z.number().min(0.1).max(5),
      })
    )
    .mutation(async ({ input }) => {
      const simulation = simulationInstances.get(input.simulationId);
      if (!simulation) {
        throw new Error("Simulation not found");
      }

      simulation.speed = input.speed;
      simulation.updatedAt = new Date();

      // Broadcast state change
      eventBus.emitSimulationStateChange({
        status: simulation.status,
        currentTick: simulation.currentTick,
        speed: simulation.speed,
        totalEvents: 0,
        totalCascades: 0,
      });

      console.log(`Simulation ${input.simulationId} speed set to ${input.speed}x`);

      return {
        simulationId: simulation.id,
        speed: simulation.speed,
      };
    }),

  /**
   * Inject custom event into simulation
   */
  injectEvent: protectedProcedure
    .input(
      z.object({
        simulationId: z.string(),
        eventType: z.string(),
        actors: z.array(z.string()),
        location: z.string().optional(),
        significance: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const simulation = simulationInstances.get(input.simulationId);
      if (!simulation) {
        throw new Error("Simulation not found");
      }

      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create and broadcast event
      const event = {
        id: eventId,
        type: input.eventType,
        timestamp: simulation.currentTick,
        actors: input.actors,
        location: input.location || "Unknown",
        significance: input.significance || 0.5,
      };

      eventBus.emitEvent(event);

      console.log(`Event injected into simulation ${input.simulationId}:`, event);

      return {
        eventId,
        ...event,
      };
    }),

  /**
   * Update civilization parameters
   */
  updateCivilizationParameters: protectedProcedure
    .input(
      z.object({
        simulationId: z.string(),
        civilizationId: z.string(),
        population: z.number().optional(),
        technology: z.number().min(0).max(100).optional(),
        culture: z.number().min(0).max(100).optional(),
        resources: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const simulation = simulationInstances.get(input.simulationId);
      if (!simulation) {
        throw new Error("Simulation not found");
      }

      // In production, update civilization in database
      console.log(`Updated civilization ${input.civilizationId} in simulation ${input.simulationId}`);

      return {
        civilizationId: input.civilizationId,
        updated: true,
      };
    }),

  /**
   * Get current simulation state
   */
  getSimulationState: protectedProcedure
    .input(z.object({ simulationId: z.string() }))
    .query(({ input }) => {
      const simulation = simulationInstances.get(input.simulationId);
      if (!simulation) {
        throw new Error("Simulation not found");
      }

      return {
        simulationId: simulation.id,
        galaxyId: simulation.galaxyId,
        status: simulation.status,
        currentTick: simulation.currentTick,
        speed: simulation.speed,
        createdAt: simulation.createdAt,
        updatedAt: simulation.updatedAt,
      };
    }),

  /**
   * Save simulation state
   */
  saveSimulationState: protectedProcedure
    .input(
      z.object({
        simulationId: z.string(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const simulation = simulationInstances.get(input.simulationId);
      if (!simulation) {
        throw new Error("Simulation not found");
      }

      const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In production, save to database
      console.log(`Saved simulation state as ${snapshotId}`);

      return {
        snapshotId,
        name: input.name,
        simulationId: input.simulationId,
        savedAt: new Date(),
      };
    }),

  /**
   * Load simulation state
   */
  loadSimulationState: protectedProcedure
    .input(z.object({ snapshotId: z.string() }))
    .mutation(async ({ input }) => {
      // In production, load from database
      console.log(`Loaded simulation state from ${input.snapshotId}`);

      return {
        snapshotId: input.snapshotId,
        loaded: true,
      };
    }),

  /**
   * List all simulations for a galaxy
   */
  listSimulations: protectedProcedure
    .input(z.object({ galaxyId: z.string() }))
    .query(({ input }) => {
      const simulations = Array.from(simulationInstances.values()).filter(
        (sim) => sim.galaxyId === input.galaxyId
      );

      return simulations.map((sim) => ({
        simulationId: sim.id,
        status: sim.status,
        currentTick: sim.currentTick,
        speed: sim.speed,
        createdAt: sim.createdAt,
        updatedAt: sim.updatedAt,
      }));
    }),

  /**
   * Delete simulation
   */
  deleteSimulation: protectedProcedure
    .input(z.object({ simulationId: z.string() }))
    .mutation(async ({ input }) => {
      const deleted = simulationInstances.delete(input.simulationId);

      if (!deleted) {
        throw new Error("Simulation not found");
      }

      console.log(`Deleted simulation ${input.simulationId}`);

      return {
        simulationId: input.simulationId,
        deleted: true,
      };
    }),
});

export default simulationControlRouter;
