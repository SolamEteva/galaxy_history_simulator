import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateGalaxyHistoryV4 } from "./simulationV4";
import { debugRouter } from "./debugRouter";
import {
  getUserGalaxies,
  getGalaxy,
  getGalaxySpecies,
  getGalaxyPlanets,
  getGalaxyEvents,
  getEventConnections,
  getGalaxyHistoryDocuments,
  getEvent,
  getEventCauses,
  getEventEffects,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  debug: debugRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Galaxy generation and retrieval
  galaxy: router({
    /**
     * Generate a new galaxy with pre-computed history
     */
    generate: protectedProcedure
      .input(
        z.object({
          galaxyName: z.string().min(1).max(255),
          speciesCount: z.number().int().min(1).max(8),
          totalYears: z.number().int().min(1000).max(1000000),
          seed: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const galaxyId = await generateGalaxyHistoryV4({
            galaxyName: input.galaxyName,
            userId: ctx.user!.id,
            speciesCount: input.speciesCount,
            totalYears: input.totalYears,
            seed: input.seed,
          });

          return {
            success: true,
            galaxyId,
            message: "Galaxy history generated successfully",
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("Error generating galaxy:", error);
          console.error("Error message:", errorMessage);
          throw new Error(`Galaxy generation failed: ${errorMessage}`);
        }
      }),

    /**
     * Get user's galaxies
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserGalaxies(ctx.user!.id);
    }),

    /**
     * Get detailed galaxy information
     */
    get: protectedProcedure
      .input(z.object({ galaxyId: z.number().int() }))
      .query(async ({ input }) => {
        const galaxy = await getGalaxy(input.galaxyId);
        if (!galaxy) {
          throw new Error("Galaxy not found");
        }
        return galaxy;
      }),

    /**
     * Get all species in a galaxy
     */
    getSpecies: protectedProcedure
      .input(z.object({ galaxyId: z.number().int() }))
      .query(async ({ input }) => {
        return await getGalaxySpecies(input.galaxyId);
      }),

    /**
     * Get all planets in a galaxy
     */
    getPlanets: protectedProcedure
      .input(z.object({ galaxyId: z.number().int() }))
      .query(async ({ input }) => {
        return await getGalaxyPlanets(input.galaxyId);
      }),

    /**
     * Get all events in a galaxy
     */
    getEvents: protectedProcedure
      .input(z.object({ galaxyId: z.number().int() }))
      .query(async ({ input }) => {
        const events = await getGalaxyEvents(input.galaxyId);
        // Sort by year
        return events.sort((a, b) => a.year - b.year);
      }),

    /**
     * Get event connections (cause-effect relationships)
     */
    getEventConnections: protectedProcedure
      .input(z.object({ galaxyId: z.number().int() }))
      .query(async ({ input }) => {
        return await getEventConnections(input.galaxyId);
      }),

    /**
     * Get detailed event with connections
     */
    getEventDetail: protectedProcedure
      .input(z.object({ eventId: z.number().int() }))
      .query(async ({ input }) => {
        const event = await getEvent(input.eventId);
        if (!event) {
          throw new Error("Event not found");
        }

        const causes = await getEventCauses(input.eventId);
        const effects = await getEventEffects(input.eventId);

        return {
          event,
          causes,
          effects,
        };
      }),

    /**
     * Get history documents for a galaxy
     */
    getHistoryDocuments: protectedProcedure
      .input(z.object({ galaxyId: z.number().int() }))
      .query(async ({ input }) => {
        return await getGalaxyHistoryDocuments(input.galaxyId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
