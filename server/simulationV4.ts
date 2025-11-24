/**
 * Galaxy History Simulator V4
 * Uses query-based ID retrieval instead of relying on insert result
 */

import { getDb } from "./db";
import { galaxies, species, planets, events } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export interface SimpleSimulationConfig {
  galaxyName: string;
  userId: number;
  speciesCount: number;
  totalYears: number;
  seed?: string;
}

export async function generateGalaxyHistoryV4(config: SimpleSimulationConfig): Promise<number> {
  console.log(`\n[SimV4] Starting galaxy generation: ${config.galaxyName}`);

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let galaxyId: number | null = null;

  try {
    // Step 1: Create galaxy
    console.log(`[SimV4] Step 1: Creating galaxy record...`);
    
    await db.insert(galaxies).values({
      userId: config.userId,
      name: config.galaxyName,
      description: `A galaxy with ${config.speciesCount} species`,
      seed: config.seed || Math.random().toString(36).substring(7),
      startYear: 0,
      currentYear: 0,
      endYear: config.totalYears,
      status: "running",
      isPaused: false,
    });

    // Query for the galaxy we just created
    console.log(`[SimV4] Querying for created galaxy...`);
    const galaxyRecords = await db
      .select()
      .from(galaxies)
      .where(eq(galaxies.userId, config.userId))
      .orderBy(desc(galaxies.createdAt))
      .limit(1);

    if (!galaxyRecords || galaxyRecords.length === 0) {
      throw new Error("Failed to retrieve created galaxy");
    }

    galaxyId = galaxyRecords[0].id;
    console.log(`[SimV4] ✓ Galaxy created with ID: ${galaxyId}`);

    // Step 2: Create species
    console.log(`[SimV4] Step 2: Creating ${config.speciesCount} species...`);
    
    const speciesNames = [
      "Humans", "Xylothians", "Aquarians", "Crystallines", "Psionics",
      "Arthropods", "Avians", "Reptilians"
    ];

    const speciesIds: number[] = [];

    for (let i = 0; i < config.speciesCount; i++) {
      try {
        const speciesName = speciesNames[i] || `Species-${i}`;
        
        await db.insert(species).values({
          galaxyId,
          name: speciesName,
          speciesType: ["humanoid", "insectoid", "aquatic", "crystalline", "psionic"][i % 5],
          yearOfOrigin: 0,
          traits: ["innovative", "peaceful"],
          physicalDescription: `${speciesName} description`,
          culturalDescription: `${speciesName} culture`,
          color: `hsl(${(i * 45) % 360}, 70%, 50%)`,
          extinct: false,
        });

        // Query for the species we just created
        const speciesRecords = await db
          .select()
          .from(species)
          .where(eq(species.galaxyId, galaxyId))
          .orderBy(desc(species.createdAt))
          .limit(1);

        if (speciesRecords && speciesRecords.length > 0) {
          const speciesId = speciesRecords[0].id;
          speciesIds.push(speciesId);
          console.log(`[SimV4]   ✓ ${speciesName} (ID: ${speciesId})`);
        } else {
          console.log(`[SimV4]   ✗ Failed to retrieve ${speciesName}`);
        }
      } catch (error) {
        console.error(`[SimV4]   ✗ Error creating species ${i}:`, error);
      }
    }

    console.log(`[SimV4] ✓ Created ${speciesIds.length} species`);

    // Step 3: Create planets
    console.log(`[SimV4] Step 3: Creating planets...`);
    
    const planetTypes = ["terrestrial", "aquatic", "desert", "ice", "volcanic"];
    const planetCount = Math.max(2, config.speciesCount);

    for (let i = 0; i < planetCount; i++) {
      try {
        const originSpeciesId = speciesIds[i % speciesIds.length] || 1;
        
        await db.insert(planets).values({
          galaxyId,
          name: `Planet-${i + 1}`,
          starSystemName: `System-${Math.floor(i / 2) + 1}`,
          planetType: planetTypes[i % planetTypes.length] as any,
          habitability: 50 + Math.random() * 50,
          originSpeciesId,
          currentSpeciesIds: [originSpeciesId],
          description: `A ${planetTypes[i % planetTypes.length]} planet`,
        });

        console.log(`[SimV4]   ✓ Planet-${i + 1}`);
      } catch (error) {
        console.error(`[SimV4]   ✗ Error creating planet ${i}:`, error);
      }
    }

    // Step 4: Create initial events
    console.log(`[SimV4] Step 4: Creating initial events...`);
    
    let eventCount = 0;
    for (let i = 0; i < speciesIds.length; i++) {
      try {
        const speciesId = speciesIds[i];
        const speciesName = speciesNames[i] || `Species-${i}`;

        await db.insert(events).values({
          galaxyId,
          year: 0,
          eventType: "species-origin",
          title: `Origin of ${speciesName}`,
          description: `The ${speciesName} emerge as a sentient species`,
          speciesIds: [speciesId],
          planetIds: [],
          civilizationIds: [],
          importance: 10,
          imagePrompt: `Portrait of ${speciesName}`,
        });

        eventCount++;
        console.log(`[SimV4]   ✓ Event: Origin of ${speciesName}`);
      } catch (error) {
        console.error(`[SimV4]   ✗ Error creating event for species ${i}:`, error);
      }
    }

    console.log(`[SimV4] ✓ Created ${eventCount} events`);

    console.log(`\n[SimV4] ✅ Galaxy generation complete!`);
    console.log(`[SimV4] Galaxy ID: ${galaxyId}`);
    console.log(`[SimV4] Species created: ${speciesIds.length}`);
    console.log(`[SimV4] Events created: ${eventCount}\n`);

    return galaxyId;

  } catch (error) {
    console.error(`[SimV4] ✗ Fatal error:`, error);
    throw error;
  }
}
