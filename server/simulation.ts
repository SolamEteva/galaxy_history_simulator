import { invokeLLM } from "./_core/llm";
import {
  createGalaxy,
  createSpecies,
  createPlanet,
  createCivilization,
  createEvent,
  createEventConnection,
  createSimulationLog,
  getGalaxy,
  getGalaxySpecies,
  getGalaxyPlanets,
  getGalaxyEvents,
  updateGalaxyYear,
  updateGalaxyStatus,
  updateSpecies,
  updateEvent,
  getEvent,
} from "./db";
import { InsertGalaxy, InsertSpecies, InsertPlanet, InsertEvent } from "../drizzle/schema";

/**
 * Simulation configuration for galaxy generation
 */
export interface SimulationConfig {
  galaxyName: string;
  userId: number;
  speciesCount: number; // 1-8
  totalYears: number; // Total simulation length (e.g., 50000 years)
  seed?: string; // For reproducible simulations
}

/**
 * Species template for generation
 */
interface SpeciesTemplate {
  name: string;
  type: string;
  traits: string[];
  physicalDescription: string;
  culturalDescription: string;
  color: string;
}

/**
 * Historical era definition
 */
interface HistoricalEra {
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  suggestedEventTypes: string[];
}

/**
 * Initialize a new galaxy and pre-compute its entire history (Dwarf Fortress style)
 */
export async function generateGalaxyHistory(config: SimulationConfig) {
  // Create galaxy record
  const galaxyData: InsertGalaxy = {
    userId: config.userId,
    name: config.galaxyName,
    description: `A procedurally generated galaxy with ${config.speciesCount} species spanning ${config.totalYears} years`,
    seed: config.seed || generateSeed(),
    startYear: 0,
    currentYear: 0,
    endYear: config.totalYears,
    status: "running",
    isPaused: false,
  };

  const galaxyResult = await createGalaxy(galaxyData);
  const galaxyId = (galaxyResult as any).insertId as number;

  try {
    // Step 1: Generate species
    console.log(`[Galaxy ${galaxyId}] Generating ${config.speciesCount} species...`);
    const speciesTemplates = await generateSpeciesTemplates(config.speciesCount);
    const speciesMap = new Map<string, number>();

    for (const template of speciesTemplates) {
      const speciesData: InsertSpecies = {
        galaxyId,
        name: template.name,
        speciesType: template.type,
        yearOfOrigin: 0,
        traits: template.traits,
        physicalDescription: template.physicalDescription,
        culturalDescription: template.culturalDescription,
        color: template.color,
      };

      const speciesResult = await createSpecies(speciesData);
      const speciesId = (speciesResult as any).insertId as number;
      speciesMap.set(template.name, speciesId);
    }

    await createSimulationLog({
      galaxyId,
      year: 0,
      logType: "milestone",
      message: `Generated ${config.speciesCount} species`,
      metadata: { speciesCount: config.speciesCount },
    });

    // Step 2: Generate planets
    console.log(`[Galaxy ${galaxyId}] Generating planets...`);
    const planetCount = Math.floor(config.speciesCount * 1.5) + 2;
    const planets = [];

    for (let i = 0; i < planetCount; i++) {
      const planetData: InsertPlanet = {
        galaxyId,
        name: generatePlanetName(),
        starSystemName: generateStarSystemName(),
        planetType: selectRandomPlanetType() as any,
        habitability: Math.floor(Math.random() * 100),
        originSpeciesId: i < Array.from(speciesMap.values()).length ? Array.from(speciesMap.values())[i] : undefined,
        currentSpeciesIds: i < Array.from(speciesMap.values()).length ? [Array.from(speciesMap.values())[i]] : [],
      };

      const planetResult = await createPlanet(planetData);
      planets.push({
        id: (planetResult as any).insertId as number,
        ...planetData,
      });
    }

    // Step 3: Pre-compute entire history (era by era)
    console.log(`[Galaxy ${galaxyId}] Pre-computing ${config.totalYears} years of history...`);
    const eras = generateHistoricalEras(config.totalYears);
    const allEvents: any[] = [];
    const eventConnections: Array<{ cause: number; effect: number; type: string }> = [];

    for (const era of eras) {
      console.log(`[Galaxy ${galaxyId}] Processing era: ${era.name} (${era.startYear}-${era.endYear})`);

      const eraEvents = await generateEraEvents(
        galaxyId,
        era,
        Array.from(speciesMap.values()),
        Array.from(speciesMap.entries()),
        planets,
        allEvents
      );

      allEvents.push(...eraEvents);
    }

    // Step 4: Create cause-effect connections
    console.log(`[Galaxy ${galaxyId}] Establishing cause-effect relationships...`);
    await establishEventConnections(galaxyId, allEvents);

    // Step 5: Update species with milestones
    console.log(`[Galaxy ${galaxyId}] Updating species milestones...`);
    await updateSpeciesMilestones(galaxyId, Array.from(speciesMap.values()), allEvents);

    // Mark as completed
    await updateGalaxyStatus(galaxyId, "completed");

    await createSimulationLog({
      galaxyId,
      year: config.totalYears,
      logType: "milestone",
      message: `Galaxy history pre-computation complete! Generated ${allEvents.length} events across ${config.totalYears} years`,
      metadata: { totalEvents: allEvents.length, totalYears: config.totalYears },
    });

    console.log(`[Galaxy ${galaxyId}] History generation complete!`);
    return galaxyId;
  } catch (error) {
    console.error(`[Galaxy ${galaxyId}] Error during history generation:`, error);
    await updateGalaxyStatus(galaxyId, "created");
    throw error;
  }
}

/**
 * Generate historical eras based on total years
 */
function generateHistoricalEras(totalYears: number): HistoricalEra[] {
  const eraLength = Math.floor(totalYears / 6);

  return [
    {
      name: "Primordial Age",
      startYear: 0,
      endYear: eraLength,
      description: "Species emerge and develop basic tools",
      suggestedEventTypes: [
        "species-origin",
        "first-tool",
        "first-fire",
        "first-settlement",
        "tribal-formation",
      ],
    },
    {
      name: "Ancient Age",
      startYear: eraLength,
      endYear: eraLength * 2,
      description: "Early civilizations and agriculture",
      suggestedEventTypes: [
        "agriculture-discovery",
        "first-city",
        "empire-rise",
        "religious-movement",
        "trade-route",
      ],
    },
    {
      name: "Classical Age",
      startYear: eraLength * 2,
      endYear: eraLength * 3,
      description: "Flourishing civilizations and cultural peaks",
      suggestedEventTypes: [
        "cultural-renaissance",
        "philosophical-movement",
        "architectural-wonder",
        "first-contact",
        "alliance-formed",
      ],
    },
    {
      name: "Medieval Age",
      startYear: eraLength * 3,
      endYear: eraLength * 4,
      description: "Feudalism, warfare, and fragmentation",
      suggestedEventTypes: [
        "war-declared",
        "kingdom-fall",
        "civil-war",
        "plague",
        "migration-wave",
      ],
    },
    {
      name: "Industrial Age",
      startYear: eraLength * 4,
      endYear: eraLength * 5,
      description: "Technological revolution and global change",
      suggestedEventTypes: [
        "industrial-revolution",
        "technology-breakthrough",
        "empire-expansion",
        "scientific-discovery",
        "resource-boom",
      ],
    },
    {
      name: "Space Age",
      startYear: eraLength * 5,
      endYear: totalYears,
      description: "Spaceflight and interstellar civilization",
      suggestedEventTypes: [
        "first-spaceflight",
        "first-colony",
        "interstellar-contact",
        "galactic-war",
        "transcendence",
        "extinction",
      ],
    },
  ];
}

/**
 * Generate events for a historical era
 */
async function generateEraEvents(
  galaxyId: number,
  era: HistoricalEra,
  speciesIds: number[],
  speciesMap: Array<[string, number]>,
  planets: any[],
  previousEvents: any[]
): Promise<any[]> {
  const eventCount = Math.floor((era.endYear - era.startYear) / 500) + 2; // 1 event per 500 years minimum
  const eraEvents: any[] = [];

  const prompt = `Generate ${eventCount} significant historical events for the "${era.name}" (years ${era.startYear}-${era.endYear}).

Context:
- This is era ${Math.floor((era.startYear + era.endYear) / 2 / 10000) + 1} of galactic history
- Active species: ${speciesMap.map(([name]) => name).join(", ")}
- Event types to emphasize: ${era.suggestedEventTypes.join(", ")}
- Previous major events: ${previousEvents.slice(-5).map((e) => e.title).join(", ") || "None yet"}

For each event, provide:
1. Year (between ${era.startYear} and ${era.endYear})
2. Title
3. Description (2-3 sentences)
4. Event type
5. Affected species (array of names)
6. Importance (0-10, where 10 is civilization-altering)
7. Image prompt (for hand-drawn aesthetic visualization)
8. Consequences (how this event affects future history)

Ensure events are:
- Interconnected with previous events
- Species-appropriate for their development level
- Realistic in scope and timing
- Building toward spaceflight by the end

Return as JSON array of events.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a creative sci-fi historian generating interconnected galactic history spanning thousands of years. Events should cascade and influence each other, creating a rich tapestry of cause and effect.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "era_events",
          strict: true,
          schema: {
            type: "object",
            properties: {
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    year: { type: "integer" },
                    title: { type: "string" },
                    description: { type: "string" },
                    eventType: { type: "string" },
                    affectedSpecies: { type: "array", items: { type: "string" } },
                    importance: { type: "integer", minimum: 0, maximum: 10 },
                    imagePrompt: { type: "string" },
                    consequences: { type: "string" },
                  },
                  required: [
                    "year",
                    "title",
                    "description",
                    "eventType",
                    "affectedSpecies",
                    "importance",
                    "imagePrompt",
                    "consequences",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["events"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Unexpected response format from LLM");
    }

    const parsedResponse = JSON.parse(content);

    // Create database records for each event
    for (const eventData of parsedResponse.events) {
      const speciesIds = eventData.affectedSpecies
        .map((name: string) => {
          const entry = speciesMap.find(([sName]) => sName === name);
          return entry ? entry[1] : null;
        })
        .filter((id: number | null) => id !== null);

      const insertEvent: InsertEvent = {
        galaxyId,
        year: eventData.year,
        eventType: eventData.eventType,
        title: eventData.title,
        description: eventData.description,
        speciesIds: speciesIds,
        planetIds: [],
        civilizationIds: [],
        importance: eventData.importance,
        imagePrompt: eventData.imagePrompt,
      };

      const eventResult = await createEvent(insertEvent);
      const eventId = (eventResult as any).insertId as number;

      eraEvents.push({
        id: eventId,
        ...eventData,
        consequences: eventData.consequences,
      });
    }

    return eraEvents;
  } catch (error) {
    console.error("Error generating era events:", error);
    return [];
  }
}

/**
 * Establish cause-effect connections between events
 */
async function establishEventConnections(galaxyId: number, allEvents: any[]) {
  // Sort events by year to ensure causes precede effects
  const sortedEvents = [...allEvents].sort((a, b) => a.year - b.year);

  for (let i = 0; i < sortedEvents.length; i++) {
    const currentEvent = sortedEvents[i];

    // Look at next few events to find potential effects
    for (let j = i + 1; j < Math.min(i + 10, sortedEvents.length); j++) {
      const potentialEffect = sortedEvents[j];

      // Check if there's a logical connection (shared species, related event types, etc.)
      const sharedSpecies = currentEvent.affectedSpecies.some((s: string) =>
        potentialEffect.affectedSpecies.includes(s)
      );

      if (sharedSpecies && potentialEffect.year - currentEvent.year < 2000) {
        // Create connection
        await createEventConnection({
          galaxyId,
          causeEventId: currentEvent.id,
          effectEventId: potentialEffect.id,
          connectionType: "led-to",
          description: `${currentEvent.title} led to ${potentialEffect.title}`,
        });
      }
    }
  }
}

/**
 * Update species with milestone years (sentience, civilization, spaceflight)
 */
async function updateSpeciesMilestones(galaxyId: number, speciesIds: number[], allEvents: any[]) {
  for (const speciesId of speciesIds) {
    const species = await getGalaxySpecies(galaxyId);
    const speciesData = species.find((s) => s.id === speciesId);

    if (!speciesData) continue;

    // Find key events for this species
    const speciesEvents = allEvents.filter((e) =>
      e.affectedSpecies.some((name: string) => name === speciesData.name)
    );

    if (speciesEvents.length === 0) continue;

    // Find first sentience event
    const sentientEvent = speciesEvents.find((e) =>
      ["first-tool", "first-fire", "first-settlement"].includes(e.eventType)
    );

    // Find first civilization event
    const civEvent = speciesEvents.find((e) =>
      ["first-city", "empire-rise", "agriculture-discovery"].includes(e.eventType)
    );

    // Find spaceflight event
    const spaceflightEvent = speciesEvents.find((e) => e.eventType === "first-spaceflight");

    // Find extinction event
    const extinctionEvent = speciesEvents.find((e) => e.eventType === "extinction");

    // Update species with milestones
    await updateSpecies(speciesId, {
      yearOfSentience: sentientEvent?.year,
      yearOfFirstCivilization: civEvent?.year,
      yearOfSpaceflight: spaceflightEvent?.year,
      yearOfExtinction: extinctionEvent?.year,
      extinct: extinctionEvent ? true : false,
    });
  }
}

/**
 * Utility functions
 */

function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generatePlanetName(): string {
  const prefixes = ["Zeta", "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Theta", "Iota"];
  const suffixes = ["Prime", "Nova", "Terra", "Centauri", "Andromeda", "Kepler", "Proxima"];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

function generateStarSystemName(): string {
  const names = [
    "Sirius",
    "Betelgeuse",
    "Rigel",
    "Vega",
    "Altair",
    "Deneb",
    "Polaris",
    "Arcturus",
    "Antares",
    "Aldebaran",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function selectRandomPlanetType(): string {
  const types = ["terrestrial", "aquatic", "desert", "ice", "volcanic", "gas-giant", "moon"];
  return types[Math.floor(Math.random() * types.length)];
}

async function generateSpeciesTemplates(count: number): Promise<SpeciesTemplate[]> {
  const prompt = `Generate ${count} unique alien species for a sci-fi galaxy simulation. For each species, provide:
1. A unique name
2. Species type (e.g., humanoid, insectoid, aquatic, silicon-based, energy-based)
3. 3-5 personality traits (e.g., aggressive, peaceful, innovative, conservative, xenophobic, diplomatic)
4. Physical description (2-3 sentences for image generation)
5. Cultural description (2-3 sentences about their society)
6. A hex color code for UI representation

Return as JSON array with objects containing: name, type, traits (array), physicalDescription, culturalDescription, color`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a creative sci-fi worldbuilder. Generate diverse, interesting alien species with distinct characteristics.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "species_list",
          strict: true,
          schema: {
            type: "object",
            properties: {
              species: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    traits: { type: "array", items: { type: "string" } },
                    physicalDescription: { type: "string" },
                    culturalDescription: { type: "string" },
                    color: { type: "string" },
                  },
                  required: [
                    "name",
                    "type",
                    "traits",
                    "physicalDescription",
                    "culturalDescription",
                    "color",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["species"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content !== "string") {
      throw new Error("Unexpected response format from LLM");
    }

    const parsed = JSON.parse(content);
    return parsed.species.slice(0, count);
  } catch (error) {
    console.error("Error generating species templates:", error);
    return generateFallbackSpecies(count);
  }
}

function generateFallbackSpecies(count: number): SpeciesTemplate[] {
  const templates: SpeciesTemplate[] = [
    {
      name: "Humans",
      type: "humanoid",
      traits: ["adaptive", "innovative", "social"],
      physicalDescription:
        "Bipedal mammals with opposable thumbs, standing upright with complex facial expressions and varied skin tones",
      culturalDescription:
        "Highly social beings with diverse cultures, capable of rapid technological advancement and complex social structures",
      color: "#FFB6C1",
    },
    {
      name: "Xylothians",
      type: "insectoid",
      traits: ["collective", "efficient", "xenophobic"],
      physicalDescription:
        "Six-limbed arthropods with chitinous exoskeletons and compound eyes, organized in hive structures with telepathic coordination",
      culturalDescription:
        "Highly organized collective societies with rigid hierarchies and perfect coordination, viewing individuality as weakness",
      color: "#8B4513",
    },
    {
      name: "Aquarians",
      type: "aquatic",
      traits: ["peaceful", "artistic", "philosophical"],
      physicalDescription:
        "Cephalopod-like beings with bioluminescent skin and graceful tentacles, dwelling in deep oceans and underwater cities",
      culturalDescription:
        "Contemplative civilization focused on art, music, and understanding the cosmos through meditation and observation",
      color: "#4169E1",
    },
    {
      name: "Silicates",
      type: "silicon-based",
      traits: ["logical", "patient", "methodical"],
      physicalDescription:
        "Crystalline structures with geometric forms, capable of photosynthesis and mineral absorption through their lattice bodies",
      culturalDescription:
        "Ancient civilization with slow but profound technological development, viewing time on geological scales",
      color: "#C0C0C0",
    },
    {
      name: "Ethereals",
      type: "energy-based",
      traits: ["mysterious", "powerful", "unpredictable"],
      physicalDescription:
        "Beings of pure energy with shifting forms of plasma and electromagnetic fields, capable of existing in multiple states",
      culturalDescription:
        "Enigmatic species with capabilities beyond conventional physics, motivations often unclear to material-based civilizations",
      color: "#FFD700",
    },
    {
      name: "Reptilians",
      type: "reptilian",
      traits: ["aggressive", "territorial", "honor-bound"],
      physicalDescription:
        "Scaled bipeds with sharp claws, powerful tails, and predatory instincts, standing 8 feet tall with keen senses",
      culturalDescription:
        "Warrior culture with strong codes of honor, hierarchical societies based on martial prowess and territorial dominance",
      color: "#228B22",
    },
    {
      name: "Avians",
      type: "avian",
      traits: ["independent", "adventurous", "spiritual"],
      physicalDescription:
        "Winged humanoids with feathered bodies, keen eyesight, and natural flight capabilities, building sky-cities",
      culturalDescription:
        "Nomadic explorers with strong spiritual traditions, valuing freedom and discovery above all else",
      color: "#FF8C00",
    },
    {
      name: "Myconids",
      type: "fungal",
      traits: ["cooperative", "regenerative", "slow-thinking"],
      physicalDescription:
        "Fungal colonies forming humanoid shapes with spore-based reproduction and bioluminescence in darkness",
      culturalDescription:
        "Ancient collective consciousness with slow decision-making but profound ecological knowledge spanning millennia",
      color: "#9932CC",
    },
  ];

  return templates.slice(0, count);
}
