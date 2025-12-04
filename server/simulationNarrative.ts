/**
 * Narrative-Driven Galaxy Simulation
 * Generates galaxy histories using narrative event generation for rich, interconnected stories
 */

import { getDb } from "./db";
import { galaxies, species, planets, events } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { generateRichGalaxyHistory } from "./simulationRich";
import { generateNarrativeEventsForGalaxy } from "./narrativeEventGenerator";

export interface NarrativeSimulationConfig {
  galaxyName: string;
  userId: number;
  speciesCount: number;
  totalYears: number;
  narrativeDepth: "light" | "medium" | "deep"; // Controls how many narrative events to generate
  seed?: string;
}

export async function generateNarrativeGalaxyHistory(
  config: NarrativeSimulationConfig
): Promise<number> {
  console.log(`\n[NarrativeSim] Starting narrative galaxy generation: ${config.galaxyName}`);

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Step 1: Generate base galaxy with species, planets, and initial events
    console.log(`[NarrativeSim] Step 1: Generating base galaxy...`);
    const galaxyId = await generateRichGalaxyHistory({
      galaxyName: config.galaxyName,
      userId: config.userId,
      speciesCount: config.speciesCount,
      totalYears: config.totalYears,
      seed: config.seed,
    });

    console.log(`[NarrativeSim] ✓ Base galaxy created (ID: ${galaxyId})`);

    // Step 2: Generate narrative events at key points in history
    console.log(`[NarrativeSim] Step 2: Generating narrative events...`);

    const narrativeEventCounts = {
      light: 5,
      medium: 15,
      deep: 30,
    };

    const eventCount = narrativeEventCounts[config.narrativeDepth];

    // Generate narrative events at multiple points in the timeline
    const timelinePoints = [
      Math.floor(config.totalYears * 0.25), // 25% through history
      Math.floor(config.totalYears * 0.5), // 50% through history
      Math.floor(config.totalYears * 0.75), // 75% through history
    ];

    let totalNarrativeEvents = 0;

    for (const year of timelinePoints) {
      console.log(`[NarrativeSim] Generating narrative events for year ${year}...`);

      const narrativeEvents = await generateNarrativeEventsForGalaxy(
        galaxyId,
        year,
        Math.ceil(eventCount / 3)
      );

      // Insert generated narrative events into database
      for (const event of narrativeEvents) {
        try {
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
          console.error(`[NarrativeSim] Error inserting narrative event:`, error);
        }
      }
    }

    console.log(`[NarrativeSim] ✓ Generated ${totalNarrativeEvents} narrative events`);

    // Step 3: Update galaxy status
    console.log(`[NarrativeSim] Step 3: Finalizing galaxy...`);

    await db
      .update(galaxies)
      .set({
        status: "completed",
        currentYear: config.totalYears,
      })
      .where(eq(galaxies.id, galaxyId));

    console.log(`[NarrativeSim] ✅ Narrative galaxy generation complete!`);
    console.log(`[NarrativeSim] Galaxy ID: ${galaxyId}`);
    console.log(`[NarrativeSim] Total Events: ${totalNarrativeEvents}`);
    console.log(`[NarrativeSim] Narrative Depth: ${config.narrativeDepth}\n`);

    return galaxyId;
  } catch (error) {
    console.error(`[NarrativeSim] ✗ Fatal error:`, error);
    throw error;
  }
}
