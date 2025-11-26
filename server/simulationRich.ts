/**
 * Rich Galaxy History Simulator
 * Generates detailed, interconnected histories with LLM-powered events
 */

import { getDb } from "./db";
import { galaxies, species, planets, events, civilizations } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

export interface RichSimulationConfig {
  galaxyName: string;
  userId: number;
  speciesCount: number;
  totalYears: number;
  seed?: string;
}

interface SpeciesData {
  id: number;
  name: string;
  traits: string[];
  planetId: number;
}

export async function generateRichGalaxyHistory(config: RichSimulationConfig): Promise<number> {
  console.log(`\n[RichSim] Starting rich galaxy generation: ${config.galaxyName}`);

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  let galaxyId: number | null = null;
  const speciesMap = new Map<number, SpeciesData>();
  const planetMap = new Map<number, { id: number; name: string; type: string }>();

  try {
    // Step 1: Create galaxy
    console.log(`[RichSim] Step 1: Creating galaxy...`);
    
    await db.insert(galaxies).values({
      userId: config.userId,
      name: config.galaxyName,
      description: `A rich galaxy with ${config.speciesCount} species over ${config.totalYears} years`,
      seed: config.seed || Math.random().toString(36).substring(7),
      startYear: 0,
      currentYear: 0,
      endYear: config.totalYears,
      status: "running",
      isPaused: false,
    });

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
    console.log(`[RichSim] ✓ Galaxy created (ID: ${galaxyId})`);

    // Step 2: Create species with traits
    console.log(`[RichSim] Step 2: Creating ${config.speciesCount} species with traits...`);
    
    const speciesTypes = ["humanoid", "insectoid", "aquatic", "crystalline", "psionic", "avian", "reptilian", "fungal"];
    const speciesNames = [
      "Humans", "Xylothians", "Aquarians", "Crystallines", "Psionics",
      "Arthropods", "Avians", "Reptilians"
    ];
    const traitOptions = [
      ["innovative", "warlike", "peaceful", "spiritual", "scientific", "artistic"],
      ["territorial", "nomadic", "communal", "individualistic"],
      ["technological", "magical", "biological", "mechanical"]
    ];

    const speciesIds: number[] = [];

    for (let i = 0; i < config.speciesCount; i++) {
      try {
        const speciesName = speciesNames[i] || `Species-${i}`;
        const speciesType = speciesTypes[i % speciesTypes.length];
        
        // Generate random traits
        const traits = [
          traitOptions[0][Math.floor(Math.random() * traitOptions[0].length)],
          traitOptions[1][Math.floor(Math.random() * traitOptions[1].length)],
          traitOptions[2][Math.floor(Math.random() * traitOptions[2].length)],
        ];

        await db.insert(species).values({
          galaxyId,
          name: speciesName,
          speciesType: speciesType as any,
          yearOfOrigin: Math.floor(Math.random() * 1000), // Stagger origins
          traits,
          physicalDescription: `${speciesName} - ${speciesType} species with ${traits.join(", ")} traits`,
          culturalDescription: `${speciesName} culture emphasizes ${traits[0]} and ${traits[1]}`,
          color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
          extinct: false,
        });

        const speciesRecords = await db
          .select()
          .from(species)
          .where(eq(species.galaxyId, galaxyId))
          .orderBy(desc(species.createdAt))
          .limit(1);

        if (speciesRecords && speciesRecords.length > 0) {
          const speciesId = speciesRecords[0].id;
          speciesIds.push(speciesId);
          speciesMap.set(speciesId, {
            id: speciesId,
            name: speciesName,
            traits,
            planetId: 0, // Will be set when we create planets
          });
          console.log(`[RichSim]   ✓ ${speciesName} (${traits.join(", ")})`);
        }
      } catch (error) {
        console.error(`[RichSim]   ✗ Error creating species ${i}:`, error);
      }
    }

    // Step 3: Create planets and assign species
    console.log(`[RichSim] Step 3: Creating planets and assigning species...`);
    
    const planetTypes = ["terrestrial", "aquatic", "desert", "ice", "volcanic", "jungle", "tundra"];
    const planetCount = Math.max(3, config.speciesCount);

    for (let i = 0; i < planetCount; i++) {
      try {
        const planetType = planetTypes[i % planetTypes.length];
        const originSpeciesId = speciesIds[i % speciesIds.length];
        
        await db.insert(planets).values({
          galaxyId,
          name: `${planetType.charAt(0).toUpperCase() + planetType.slice(1)} World ${i + 1}`,
          starSystemName: `System-${Math.floor(i / 2) + 1}`,
          planetType: planetType as any,
          habitability: 40 + Math.random() * 60,
          originSpeciesId,
          currentSpeciesIds: [originSpeciesId],
          description: `A ${planetType} world home to the ${speciesMap.get(originSpeciesId)?.name || "unknown"} species`,
        });

        const planetRecords = await db
          .select()
          .from(planets)
          .where(eq(planets.galaxyId, galaxyId))
          .orderBy(desc(planets.createdAt))
          .limit(1);

        if (planetRecords && planetRecords.length > 0) {
          const planetId = planetRecords[0].id;
          planetMap.set(planetId, {
            id: planetId,
            name: planetRecords[0].name,
            type: planetType,
          });
          
          // Update species with planet info
          if (speciesMap.has(originSpeciesId)) {
            const specData = speciesMap.get(originSpeciesId)!;
            specData.planetId = planetId;
          }
          
          console.log(`[RichSim]   ✓ ${planetRecords[0].name} (${planetType})`);
        }
      } catch (error) {
        console.error(`[RichSim]   ✗ Error creating planet ${i}:`, error);
      }
    }

    // Step 4: Generate rich event history
    console.log(`[RichSim] Step 4: Generating event history...`);
    
    let eventCount = 0;
    const eventTypes = [
      "species-origin",
      "civilization-rise",
      "technological-breakthrough",
      "first-contact",
      "war",
      "peace-treaty",
      "migration",
      "extinction-event",
      "cultural-shift",
      "religious-movement",
      "scientific-discovery",
      "natural-disaster",
      "alliance-formed",
      "trade-established",
      "civil-war",
      "space-exploration",
    ];

    // Generate origin events for each species
    for (const speciesId of speciesIds) {
      const specData = speciesMap.get(speciesId);
      if (!specData) continue;

      try {
        await db.insert(events).values({
          galaxyId,
          year: specData.traits.includes("innovative") ? 100 : 500,
          eventType: "species-origin",
          title: `Origin of ${specData.name}`,
          description: `The ${specData.name} emerge as a sentient species on their homeworld. They are ${specData.traits.join(", ")}.`,
          speciesIds: [speciesId],
          planetIds: specData.planetId ? [specData.planetId] : [],
          civilizationIds: [],
          importance: 10,
          imagePrompt: `Portrait of ${specData.name}, a ${specData.traits[0]} alien species`,
        });

        eventCount++;
        console.log(`[RichSim]   ✓ Origin event for ${specData.name}`);
      } catch (error) {
        console.error(`[RichSim]   ✗ Error creating origin event:`, error);
      }
    }

    // Generate random events throughout history
    const eventGenerationSteps = Math.min(50, Math.floor(config.totalYears / 100));
    
    for (let step = 0; step < eventGenerationSteps; step++) {
      const year = Math.floor((step / eventGenerationSteps) * config.totalYears);
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const involvedSpecies = [];
      
      // Randomly select 1-3 species for this event
      const speciesInvolved = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < speciesInvolved && i < speciesIds.length; i++) {
        involvedSpecies.push(speciesIds[Math.floor(Math.random() * speciesIds.length)]);
      }

      const uniqueSpecies = Array.from(new Set(involvedSpecies));
      const speciesNames = uniqueSpecies
        .map(id => speciesMap.get(id)?.name)
        .filter(Boolean)
        .join(" and ");

      try {
        await db.insert(events).values({
          galaxyId,
          year,
          eventType: eventType as any,
          title: `${eventType.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} (Year ${year})`,
          description: `A significant ${eventType} event involving ${speciesNames}. This event shaped the course of galactic history.`,
          speciesIds: uniqueSpecies,
          planetIds: Array.from(planetMap.keys()).slice(0, 2),
          civilizationIds: [],
          importance: Math.floor(Math.random() * 10) + 1,
          imagePrompt: `Illustration of ${eventType}: ${speciesNames} during year ${year}`,
        });

        eventCount++;
      } catch (error) {
        console.error(`[RichSim]   ✗ Error creating event at year ${year}:`, error);
      }
    }

    console.log(`[RichSim] ✓ Created ${eventCount} events`);

    // Step 5: Create civilizations
    console.log(`[RichSim] Step 5: Creating civilizations...`);
    
    let civilizationCount = 0;
    for (const speciesId of speciesIds) {
      const specData = speciesMap.get(speciesId);
      if (!specData) continue;

      try {
        const planetId = specData.planetId || 1;
        
        await db.insert(civilizations).values({
          galaxyId,
          speciesId,
          planetId,
          name: `${specData.name} Civilization`,
          yearFounded: specData.traits.includes("innovative") ? 500 : 2000,
          yearFallen: null,
          governmentType: ["monarchy", "democracy", "theocracy", "collective"][Math.floor(Math.random() * 4)],
          technologyLevel: Math.floor(Math.random() * 10) + 1,
          militaryStrength: Math.floor(Math.random() * 10) + 1,
          culturalInfluence: Math.floor(Math.random() * 10) + 1,
          populationEstimate: `${Math.floor(Math.random() * 100) + 1} million`,
          description: `The great civilization of ${specData.name}, known for being ${specData.traits[0]} and ${specData.traits[1]}`,
        });

        civilizationCount++;
        console.log(`[RichSim]   ✓ ${specData.name} Civilization`);
      } catch (error) {
        console.error(`[RichSim]   ✗ Error creating civilization:`, error);
      }
    }

    console.log(`[RichSim] ✓ Created ${civilizationCount} civilizations`);

    console.log(`\n[RichSim] ✅ Rich galaxy generation complete!`);
    console.log(`[RichSim] Galaxy ID: ${galaxyId}`);
    console.log(`[RichSim] Species created: ${speciesIds.length}`);
    console.log(`[RichSim] Planets created: ${planetMap.size}`);
    console.log(`[RichSim] Events created: ${eventCount}`);
    console.log(`[RichSim] Civilizations created: ${civilizationCount}\n`);

    return galaxyId;

  } catch (error) {
    console.error(`[RichSim] ✗ Fatal error:`, error);
    throw error;
  }
}
