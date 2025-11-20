/**
 * Simplified Galaxy History Simulator V2
 * Focuses on stability and proper error handling
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { galaxies, species, planets, events, eventConnections } from "../drizzle/schema";
import { errorLogger, ErrorSeverity, Validator, safeExecute, withRetry } from "./errorHandler";

export interface SimpleSimulationConfig {
  galaxyName: string;
  userId: number;
  speciesCount: number;
  totalYears: number;
  seed?: string;
}

/**
 * Generate a simple galaxy with error handling
 */
export async function generateGalaxyHistoryV2(config: SimpleSimulationConfig): Promise<number> {
  const logger = errorLogger;
  
  // Validate input
  const validation = Validator.validateGalaxyParameters(config);
  if (!validation.valid) {
    const errors = validation.errors.join("; ");
    throw new Error(`Invalid galaxy parameters: ${errors}`);
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let galaxyId: number | null = null;

  try {
    // Step 1: Create galaxy record
    console.log(`[Simulation] Creating galaxy: ${config.galaxyName}`);
    
    const galaxyRecord = await withRetry(
      async () => {
        const result = await db.insert(galaxies).values({
          userId: config.userId,
          name: config.galaxyName,
          description: `A procedurally generated galaxy with ${config.speciesCount} species spanning ${config.totalYears} years`,
          seed: config.seed || Math.random().toString(36).substring(7),
          startYear: 0,
          currentYear: 0,
          endYear: config.totalYears,
          status: "running",
          isPaused: false,
        });
        return result;
      },
      "Create galaxy record",
      2
    );

    // Handle both old and new return formats
    galaxyId = (galaxyRecord as any).insertId || (galaxyRecord as any)[0]?.id;
    
    if (!galaxyId || galaxyId <= 0) {
      console.error('Galaxy record result:', galaxyRecord);
      throw new Error("Failed to create galaxy - invalid ID");
    }

    console.log(`[Galaxy ${galaxyId}] Created successfully`);
    await logger.logMilestone(galaxyId, 0, "Galaxy created", { speciesCount: config.speciesCount });

    // Step 2: Create species
    console.log(`[Galaxy ${galaxyId}] Creating ${config.speciesCount} species...`);
    const speciesIds: number[] = [];

    const speciesNames = [
      "Humans",
      "Xylothians",
      "Aquarians",
      "Crystallines",
      "Psionics",
      "Insectoids",
      "Ethereals",
      "Mechanoids",
    ];

    for (let i = 0; i < config.speciesCount; i++) {
      const speciesName = speciesNames[i] || `Species-${i}`;
      
      try {
        const speciesRecord = await withRetry(
          async () => {
            const result = await db.insert(species).values({
              galaxyId: galaxyId!,
              name: speciesName,
              speciesType: ["humanoid", "insectoid", "aquatic", "crystalline", "psionic"][i % 5],
              yearOfOrigin: 0,
              traits: ["innovative", "peaceful", "aggressive", "conservative"][i % 4],
              physicalDescription: `${speciesName} are a unique species`,
              culturalDescription: `${speciesName} have a rich culture`,
              color: `hsl(${(i * 45) % 360}, 70%, 50%)`,
              extinct: false,
            });
            return result;
          },
          `Create species ${speciesName}`,
          2
        );

        const speciesId = (speciesRecord as any).insertId || (speciesRecord as any)[0]?.id;
        if (speciesId && speciesId > 0) {
          speciesIds.push(speciesId);
          console.log(`  ✓ ${speciesName} (ID: ${speciesId})`);
          await logger.logEventGeneration(galaxyId, 0, `${speciesName} created`, true);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ Failed to create ${speciesName}: ${errorMsg}`);
        await logger.logEventGeneration(galaxyId, 0, `${speciesName} creation`, false, errorMsg);
      }
    }

    if (speciesIds.length === 0) {
      throw new Error("Failed to create any species");
    }

    console.log(`[Galaxy ${galaxyId}] Created ${speciesIds.length} species`);
    await logger.logMilestone(galaxyId, 0, `Created ${speciesIds.length} species`, {
      speciesIds,
    });

    // Step 3: Create planets
    console.log(`[Galaxy ${galaxyId}] Creating planets...`);
    const planetCount = Math.max(config.speciesCount, 3);
    const planetTypes = ["terrestrial", "aquatic", "desert", "ice", "volcanic"];

    for (let i = 0; i < planetCount; i++) {
      try {
        const planetRecord = await withRetry(
          async () => {
            const result = await db.insert(planets).values({
              galaxyId: galaxyId!,
              name: `Planet-${i + 1}`,
              starSystemName: `System-${Math.floor(i / 2) + 1}`,
              planetType: planetTypes[i % planetTypes.length] as any,
              habitability: 50 + Math.random() * 50,
              originSpeciesId: speciesIds[i % speciesIds.length],
              currentSpeciesIds: [speciesIds[i % speciesIds.length]],
              description: `A ${planetTypes[i % planetTypes.length]} planet`,
            });
            return result;
          },
          `Create planet ${i + 1}`,
          2
        );

        const planetId = (planetRecord as any).insertId || (planetRecord as any)[0]?.id;
        if (planetId && planetId > 0) {
          console.log(`  ✓ Planet-${i + 1} (ID: ${planetId})`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ Failed to create planet ${i + 1}: ${errorMsg}`);
      }
    }

    await logger.logMilestone(galaxyId, 0, `Created ${planetCount} planets`, { planetCount });

    // Step 4: Generate initial events
    console.log(`[Galaxy ${galaxyId}] Generating initial events...`);
    const eventCount = Math.min(5, config.speciesCount);

    for (let i = 0; i < eventCount; i++) {
      try {
        const speciesId = speciesIds[i % speciesIds.length];
        const speciesName = speciesNames[i % speciesNames.length];

        const eventRecord = await withRetry(
          async () => {
            const result = await db.insert(events).values({
              galaxyId: galaxyId!,
              year: 0,
              eventType: "species-origin",
              title: `Origin of ${speciesName}`,
              description: `The ${speciesName} emerge as a sentient species`,
              speciesIds: [speciesId],
              planetIds: [],
              civilizationIds: [],
              importance: 10,
              imagePrompt: `A portrait of the ${speciesName} species in their natural habitat`,
            });
            return result;
          },
          `Create event for ${speciesName}`,
          2
        );

        const eventId = (eventRecord as any).insertId || (eventRecord as any)[0]?.id;
        if (eventId && eventId > 0) {
          console.log(`  ✓ Event: Origin of ${speciesName} (ID: ${eventId})`);
          await logger.logEventGeneration(galaxyId, 0, `Origin of ${speciesName}`, true);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ Failed to create event: ${errorMsg}`);
        await logger.logEventGeneration(galaxyId, 0, `Event creation`, false, errorMsg);
      }
    }

    console.log(`[Galaxy ${galaxyId}] Simulation completed successfully`);
    await logger.logMilestone(galaxyId, config.totalYears, "Simulation completed", {
      totalSpecies: speciesIds.length,
      totalYears: config.totalYears,
    });

    return galaxyId;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Simulation] Fatal error: ${errorMsg}`);

    if (galaxyId) {
      await logger.logError(galaxyId, ErrorSeverity.CRITICAL, errorMsg, { error: String(error) });
    }

    throw error;
  }
}

/**
 * Generate a random seed
 */
function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15);
}
