/**
 * tRPC Router for Export and Progress Operations
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { exportLegendAsHtml } from "./legendsExport";
import { progressTracker, GenerationStage } from "./progressTracker";
import { TRPCError } from "@trpc/server";

export const exportRouter = router({
  /**
   * Export galaxy legend as HTML
   */
  exportLegendHtml: protectedProcedure
    .input(z.object({ galaxyId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      try {
        const result = await exportLegendAsHtml(input.galaxyId);

        if (!result.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error.message,
          });
        }

        return {
          success: true,
          html: result.value,
          fileName: `legend-${input.galaxyId}-${Date.now()}.html`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to export legend",
        });
      }
    }),

  /**
   * Get progress history for a galaxy
   */
  getProgressHistory: protectedProcedure
    .input(z.object({ galaxyId: z.number().int().positive() }))
    .query(({ input }) => {
      const history = progressTracker.getHistory(input.galaxyId);

      return {
        galaxyId: input.galaxyId,
        updates: history.map((u) => ({
          stage: u.stage,
          progress: u.progress,
          message: u.message,
          timestamp: u.timestamp.toISOString(),
          details: u.details,
        })),
      };
    }),

  /**
   * Get latest progress for a galaxy
   */
  getLatestProgress: protectedProcedure
    .input(z.object({ galaxyId: z.number().int().positive() }))
    .query(({ input }) => {
      const latest = progressTracker.getLatest(input.galaxyId);

      if (!latest) {
        return null;
      }

      return {
        stage: latest.stage,
        progress: latest.progress,
        message: latest.message,
        timestamp: latest.timestamp.toISOString(),
        details: latest.details,
      };
    }),

  /**
   * Clear progress data for a galaxy
   */
  clearProgress: protectedProcedure
    .input(z.object({ galaxyId: z.number().int().positive() }))
    .mutation(({ input }) => {
      progressTracker.clear(input.galaxyId);

      return {
        success: true,
        message: `Progress cleared for galaxy ${input.galaxyId}`,
      };
    }),
});
