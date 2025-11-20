/**
 * Simplified Galaxy History Simulator V3
 * Ultra-minimal version to debug database issues
 */

import { getDb } from "./db";
import { galaxies, species, planets, events } from "../drizzle/schema";

export interface SimpleSimulationConfig {
  galaxyName: string;
  userId: number;
  speciesCount: number;
  totalYears: number;
  seed?: string;
}

export async function generateGalaxyHistoryV3(config: SimpleSimulationConfig): Promise<number> {
  console.log(`\n[SimV3] Starting galaxy generation: ${config.galaxyName}`);
  console.log(`[SimV3] Config:`, JSON.stringify(config, null, 2));

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let galaxyId: number | null = null;

  try {
    // Step 1: Create galaxy
    console.log(`[SimV3] Step 1: Creating galaxy record...`);
    
    const galaxyInsertResult = await db.insert(galaxies).values({
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

    console.log(`[SimV3] Galaxy insert result:`, galaxyInsertResult);
    console.log(`[SimV3] Result type:`, typeof galaxyInsertResult);
    console.log(`[SimV3] Result keys:`, Object.keys(galaxyInsertResult || {}));

    // Try to extract ID - handle multiple possible formats
    galaxyId = null;
    
    if (galaxyInsertResult) {
      // Try insertId first (MySQL/MariaDB format)
      if ((galaxyInsertResult as any).insertId) {
        galaxyId = (galaxyInsertResult as any).insertId;
        console.log(`[SimV3] ✓ Extracted ID from insertId:`, galaxyId);
      }
      // Try as array
      else if (Array.isArray(galaxyInsertResult) && galaxyInsertResult.length > 0) {
        galaxyId = (galaxyInsertResult[0] as any).id;
        console.log(`[SimV3] ✓ Extracted ID from array[0].id:`, galaxyId);
      }
      // Try direct id property
      else if ((galaxyInsertResult as any).id) {
        galaxyId = (galaxyInsertResult as any).id;
        console.log(`[SimV3] ✓ Extracted ID from .id:`, galaxyId);
      }
    }

    if (!galaxyId || galaxyId <= 0) {
      console.error(`[SimV3] ✗ Failed to extract valid galaxy ID`);
      console.error(`[SimV3] Full result:`, JSON.stringify(galaxyInsertResult, null, 2));
      throw new Error(`Failed to create galaxy - invalid ID: ${galaxyId}`);
    }

    console.log(`[SimV3] ✓ Galaxy created with ID: ${galaxyId}`);

    // Step 2: Create species
    console.log(`[SimV3] Step 2: Creating ${config.speciesCount} species...`);
    
    const speciesNames = [
      "Humans", "Xylothians", "Aquarians", "Crystallines", "Psionics",
      "Arthropods", "Avians", "Reptilians"
    ];

    const speciesIds: number[] = [];

    for (let i = 0; i < config.speciesCount; i++) {
      try {
        const speciesName = speciesNames[i] || `Species-${i}`;
        
        const speciesInsertResult = await db.insert(species).values({
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

        let speciesId: number | null = null;
        if ((speciesInsertResult as any).insertId) {
          speciesId = (speciesInsertResult as any).insertId;
        } else if (Array.isArray(speciesInsertResult) && speciesInsertResult.length > 0) {
          speciesId = (speciesInsertResult[0] as any).id;
        }

        if (speciesId && speciesId > 0) {
          speciesIds.push(speciesId);
          console.log(`[SimV3]   ✓ ${speciesName} (ID: ${speciesId})`);
        } else {
          console.log(`[SimV3]   ✗ Failed to create ${speciesName}`);
        }
      } catch (error) {
        console.error(`[SimV3]   ✗ Error creating species ${i}:`, error);
      }
    }

    console.log(`[SimV3] ✓ Created ${speciesIds.length} species`);

    // Step 3: Create planets
    console.log(`[SimV3] Step 3: Creating planets...`);
    
    const planetTypes = ["terrestrial", "aquatic", "desert", "ice", "volcanic"];
    const planetCount = Math.max(2, config.speciesCount);

    for (let i = 0; i < planetCount; i++) {
      try {
        const originSpeciesId = speciesIds[i % speciesIds.length] || 1;
        
        const planetInsertResult = await db.insert(planets).values({
          galaxyId,
          name: `Planet-${i + 1}`,
          starSystemName: `System-${Math.floor(i / 2) + 1}`,
          planetType: planetTypes[i % planetTypes.length] as any,
          habitability: 50 + Math.random() * 50,
          originSpeciesId,
          currentSpeciesIds: [originSpeciesId],
          description: `A ${planetTypes[i % planetTypes.length]} planet`,
        });

        let planetId: number | null = null;
        if ((planetInsertResult as any).insertId) {
          planetId = (planetInsertResult as any).insertId;
        } else if (Array.isArray(planetInsertResult) && planetInsertResult.length > 0) {
          planetId = (planetInsertResult[0] as any).id;
        }

        if (planetId && planetId > 0) {
          console.log(`[SimV3]   ✓ Planet-${i + 1} (ID: ${planetId})`);
        }
      } catch (error) {
        console.error(`[SimV3]   ✗ Error creating planet ${i}:`, error);
      }
    }

    // Step 4: Create initial events
    console.log(`[SimV3] Step 4: Creating initial events...`);
    
    let eventCount = 0;
    for (let i = 0; i < speciesIds.length; i++) {
      try {
        const speciesId = speciesIds[i];
        const speciesName = speciesNames[i] || `Species-${i}`;

        const eventInsertResult = await db.insert(events).values({
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

        let eventId: number | null = null;
        if ((eventInsertResult as any).insertId) {
          eventId = (eventInsertResult as any).insertId;
        } else if (Array.isArray(eventInsertResult) && eventInsertResult.length > 0) {
          eventId = (eventInsertResult[0] as any).id;
        }

        if (eventId && eventId > 0) {
          eventCount++;
          console.log(`[SimV3]   ✓ Event: Origin of ${speciesName} (ID: ${eventId})`);
        }
      } catch (error) {
        console.error(`[SimV3]   ✗ Error creating event for species ${i}:`, error);
      }
    }

    console.log(`[SimV3] ✓ Created ${eventCount} events`);

    console.log(`\n[SimV3] ✅ Galaxy generation complete!`);
    console.log(`[SimV3] Galaxy ID: ${galaxyId}`);
    console.log(`[SimV3] Species created: ${speciesIds.length}`);
    console.log(`[SimV3] Events created: ${eventCount}\n`);

    return galaxyId;

  } catch (error) {
    console.error(`[SimV3] ✗ Fatal error:`, error);
    throw error;
  }
}
