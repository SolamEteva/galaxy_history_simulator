import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateGalaxyHistoryDocument } from "./historyGeneration";
import { generateEventImagesBatch } from "./imageGeneration";
import { getGalaxyEvents, getGalaxySpecies, getGalaxy } from "./db";

export const documentRouter = router({
  /**
   * Generate a formatted history document for a galaxy
   */
  generateChronicle: protectedProcedure
    .input(z.object({ galaxyId: z.number().int() }))
    .mutation(async ({ input }) => {
      try {
        const result = await generateGalaxyHistoryDocument(input.galaxyId);

        if (!result.success) {
          throw new Error("Failed to generate history document");
        }

        return {
          success: true,
          documentId: result.documentId,
          url: result.url,
          message: "History chronicle generated successfully",
        };
      } catch (error) {
        console.error("Error generating chronicle:", error);
        throw new Error("Failed to generate history document");
      }
    }),

  /**
   * Generate images for important events in a galaxy
   */
  generateEventImages: protectedProcedure
    .input(z.object({ galaxyId: z.number().int() }))
    .mutation(async ({ input }) => {
      try {
        const galaxy = await getGalaxy(input.galaxyId);
        if (!galaxy) {
          throw new Error("Galaxy not found");
        }

        const events = await getGalaxyEvents(input.galaxyId);
        const species = await getGalaxySpecies(input.galaxyId);

        // Create species lookup map
        const speciesMap = new Map(species.map((s) => [s.id, s]));

        // Prepare events for batch image generation
        const eventsForImages = events.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          importance: event.importance,
          imagePrompt: event.imagePrompt,
          speciesIds: (event.speciesIds as number[]) || [],
          speciesNames: ((event.speciesIds as number[]) || [])
            .map((id) => speciesMap.get(id)?.name || "Unknown")
            .filter((name) => name !== "Unknown"),
          speciesColors: ((event.speciesIds as number[]) || [])
            .map((id) => speciesMap.get(id)?.color || "#888888")
            .filter((color) => color !== "#888888"),
        }));

        const results = await generateEventImagesBatch(eventsForImages);

        const successCount = results.filter((r) => r.success).length;

        return {
          success: true,
          totalEvents: results.length,
          successCount,
          results,
          message: `Generated images for ${successCount}/${results.length} events`,
        };
      } catch (error) {
        console.error("Error generating event images:", error);
        throw new Error("Failed to generate event images");
      }
    }),
});
