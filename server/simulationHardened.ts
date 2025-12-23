/**
 * Hardened Galaxy Simulation Pipeline
 * Integrates comprehensive error handling, validation, and recovery mechanisms
 */

import { getDb } from "./db";
import { galaxies, species, planets, events } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateRichGalaxyHistory } from "./simulationRich";
import { generateNarrativeEventsForGalaxy } from "./narrativeEventGeneratorV2";
import {
  SimulationError,
  ErrorCategory,
  ErrorSeverity,
  Validator,
  ErrorLogger,
  safeOperation,
  Result,
  Ok,
  Err,
} from "./errorHandling";

export interface HardenedSimulationConfig {
  galaxyName: string;
  userId: number;
  speciesCount: number;
  totalYears: number;
  narrativeDepth?: "light" | "medium" | "deep";
  seed?: string;
}

/**
 * Generate a galaxy with comprehensive error handling and recovery
 */
export async function generateHardenedGalaxyHistory(
  config: HardenedSimulationConfig
): Promise<Result<number>> {
  return safeOperation(async () => {
    console.log(`\n[HardenedSim] Starting galaxy generation: ${config.galaxyName}`);

    // Validate configuration
    try {
      Validator.validateGalaxyConfig(config);
    } catch (error) {
      if (error instanceof SimulationError) {
        throw error;
      }
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        "Invalid galaxy configuration",
        { config },
        error instanceof Error ? error : undefined
      );
    }

    const db = await getDb();
    if (!db) {
      throw new SimulationError(
        ErrorCategory.DATABASE,
        ErrorSeverity.CRITICAL,
        "Database not available",
        { config }
      );
    }

    let galaxyId: number | null = null;

    try {
      // Step 1: Generate base galaxy
      console.log(`[HardenedSim] Step 1: Generating base galaxy...`);
      galaxyId = await generateRichGalaxyHistory({
        galaxyName: config.galaxyName,
        userId: config.userId,
        speciesCount: config.speciesCount,
        totalYears: config.totalYears,
        seed: config.seed,
      });

      if (!galaxyId || !Number.isInteger(galaxyId)) {
        throw new SimulationError(
          ErrorCategory.DATABASE,
          ErrorSeverity.CRITICAL,
          "Failed to create galaxy - invalid ID returned",
          { galaxyId }
        );
      }

      console.log(`[HardenedSim] ✓ Base galaxy created (ID: ${galaxyId})`);

      // Step 2: Generate narrative events if depth is specified
      if (config.narrativeDepth && config.narrativeDepth !== "light") {
        console.log(`[HardenedSim] Step 2: Generating narrative events (${config.narrativeDepth})...`);

        const narrativeEventCounts = {
          light: 5,
          medium: 15,
          deep: 30,
        };

        const eventCount = narrativeEventCounts[config.narrativeDepth];
        const timelinePoints = [
          Math.floor(config.totalYears * 0.25),
          Math.floor(config.totalYears * 0.5),
          Math.floor(config.totalYears * 0.75),
        ];

        let totalNarrativeEvents = 0;
        let failedEventInsertions = 0;

        for (const year of timelinePoints) {
          try {
            console.log(`[HardenedSim] Generating narrative events for year ${year}...`);

            const narrativeResult = await generateNarrativeEventsForGalaxy(
              galaxyId,
              year,
              Math.ceil(eventCount / 3)
            );

            if (!narrativeResult.ok) {
              console.warn(`[HardenedSim] Failed to generate narrative events for year ${year}:`, narrativeResult.error);
              continue;
            }

            const narrativeEvents = narrativeResult.value;

            // Insert generated narrative events with individual error handling
            for (const event of narrativeEvents) {
              try {
                // Validate event before insertion
                Validator.validateEventData({
                  title: event.title,
                  eventType: event.eventType,
                  year: event.year,
                  importance: event.importance,
                });

                await db.insert(events).values({
                  galaxyId,
                  year: event.year,
                  eventType: event.eventType as any,
                  title: event.title,
                  description: event.description,
                  speciesIds: event.speciesIds,
                  planetIds: event.planetIds,
                  civilizationIds: [],
                  importance: event.importance,
                  imagePrompt: event.imagePrompt,
                });

                totalNarrativeEvents++;
              } catch (error) {
                failedEventInsertions++;
                ErrorLogger.logUnknown(error, `insertNarrativeEvent[${event.title}]`);
                // Continue with next event
              }
            }
          } catch (error) {
            ErrorLogger.logUnknown(error, `narrativeEventGeneration[year=${year}]`);
            // Continue with next timeline point
          }
        }

        console.log(`[HardenedSim] ✓ Generated ${totalNarrativeEvents} narrative events`);
        if (failedEventInsertions > 0) {
          console.warn(`[HardenedSim] ⚠ ${failedEventInsertions} event insertions failed`);
        }
      }

      // Step 3: Update galaxy status
      console.log(`[HardenedSim] Step 3: Finalizing galaxy...`);

      try {
        await db
          .update(galaxies)
          .set({
            status: "completed",
            currentYear: config.totalYears,
          })
          .where(eq(galaxies.id, galaxyId));

        console.log(`[HardenedSim] ✅ Galaxy generation complete!`);
        console.log(`[HardenedSim] Galaxy ID: ${galaxyId}`);
        console.log(`[HardenedSim] Narrative Depth: ${config.narrativeDepth || "none"}\n`);

        return galaxyId;
      } catch (error) {
        throw new SimulationError(
          ErrorCategory.DATABASE,
          ErrorSeverity.HIGH,
          "Failed to finalize galaxy",
          { galaxyId },
          error instanceof Error ? error : undefined
        );
      }
    } catch (error) {
      if (error instanceof SimulationError) {
        throw error;
      }

      // Attempt to mark galaxy as failed if it was created
      if (galaxyId) {
        try {
          await db
            .update(galaxies)
            .set({ status: "paused" }) // Use valid status
            .where(eq(galaxies.id, galaxyId));
        } catch (updateError) {
          console.error("[HardenedSim] Failed to mark galaxy as failed:", updateError);
        }
      }

      throw new SimulationError(
        ErrorCategory.UNKNOWN,
        ErrorSeverity.CRITICAL,
        "Fatal error during galaxy generation",
        { config, galaxyId },
        error instanceof Error ? error : undefined
      );
    }
  }, "generateHardenedGalaxyHistory", 300000); // 5 minute timeout
}

/**
 * Recover from a failed galaxy generation
 */
export async function recoverFailedGalaxy(galaxyId: number): Promise<Result<void>> {
  return safeOperation(async () => {
    const db = await getDb();
    if (!db) {
      throw new SimulationError(
        ErrorCategory.DATABASE,
        ErrorSeverity.CRITICAL,
        "Database not available",
        { galaxyId }
      );
    }

    console.log(`[HardenedSim] Attempting recovery for galaxy ${galaxyId}...`);

    try {
      // Get galaxy info
      const galaxy = await db.select().from(galaxies).where(eq(galaxies.id, galaxyId));

      if (!galaxy || galaxy.length === 0) {
        throw new SimulationError(
          ErrorCategory.DATABASE,
          ErrorSeverity.HIGH,
          "Galaxy not found",
          { galaxyId }
        );
      }

      // Mark as recovered and retry
      await db
        .update(galaxies)
        .set({ status: "running" }) // Use valid status
        .where(eq(galaxies.id, galaxyId));

      console.log(`[HardenedSim] ✓ Galaxy marked for recovery`);
    } catch (error) {
      if (error instanceof SimulationError) {
        throw error;
      }
      throw new SimulationError(
        ErrorCategory.UNKNOWN,
        ErrorSeverity.HIGH,
        "Error recovering galaxy",
        { galaxyId },
        error instanceof Error ? error : undefined
      );
    }
  }, "recoverFailedGalaxy");
}
