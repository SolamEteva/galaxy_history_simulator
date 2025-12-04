/**
 * Narrative Event Generator
 * Dynamically creates rich, interconnected events based on galaxy state and unfolding narrative.
 */

import { getDb } from "./db";
import { events, species, planets } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

export interface NarrativeOpportunity {
  type: string;
  trigger: string;
  involvedSpeciesIds: number[];
  involvedPlanetIds: number[];
  narrativePotential: number;
  description: string;
}

export interface GeneratedNarrativeEvent {
  year: number;
  eventType: string;
  title: string;
  description: string;
  narrativeDepth: string;
  speciesIds: number[];
  planetIds: number[];
  importance: number;
  imagePrompt: string;
  consequences: string[];
}

/**
 * Analyze galaxy history to find narrative opportunities
 */
export async function findNarrativeOpportunities(
  galaxyId: number,
  currentYear: number,
  recentEvents: any[],
  activeSpecies: any[],
  activePlanets: any[]
): Promise<NarrativeOpportunity[]> {
  const opportunities: NarrativeOpportunity[] = [];
  const recentYears = 500;
  const eventWindow = recentEvents.filter((e) => e.year > currentYear - recentYears);

  // 1. CONFLICT ESCALATION: Multiple wars between same species
  const speciesPairs = new Map<string, number>();
  for (const event of eventWindow) {
    if (event.eventType === "war" && event.speciesIds?.length >= 2) {
      const pair = event.speciesIds.slice(0, 2).sort().join("-");
      speciesPairs.set(pair, (speciesPairs.get(pair) || 0) + 1);
    }
  }

  for (const [pair, count] of speciesPairs.entries()) {
    if (count >= 2) {
      const [id1, id2] = pair.split("-").map(Number);
      const sp1 = activeSpecies.find((s) => s.id === id1);
      const sp2 = activeSpecies.find((s) => s.id === id2);

      if (sp1 && sp2) {
        opportunities.push({
          type: "conflict-escalation",
          trigger: `Ongoing war between ${sp1.name} and ${sp2.name}`,
          involvedSpeciesIds: [id1, id2],
          involvedPlanetIds: [],
          narrativePotential: Math.min(10, 5 + count),
          description: `${sp1.name} and ${sp2.name} have been at war. New weapons or tactics may emerge.`,
        });
      }
    }
  }

  // 2. TECHNOLOGICAL BREAKTHROUGH: Innovative species
  for (const spec of activeSpecies) {
    if (spec.traits?.includes("innovative")) {
      const speciesEvents = eventWindow.filter((e) => e.speciesIds?.includes(spec.id));
      const discoveries = speciesEvents.filter((e) => e.eventType === "scientific-discovery");

      if (discoveries.length >= 1) {
        opportunities.push({
          type: "technological-breakthrough",
          trigger: `${spec.name} has made scientific discoveries`,
          involvedSpeciesIds: [spec.id],
          involvedPlanetIds: [],
          narrativePotential: 8,
          description: `${spec.name}'s innovative culture drives rapid advancement.`,
        });
      }
    }
  }

  // 3. CULTURAL FLOURISHING: Peace enables culture
  const peaceEvents = eventWindow.filter((e) => e.eventType === "peace-treaty");
  if (peaceEvents.length > 0) {
    for (const spec of activeSpecies) {
      if (spec.traits?.includes("artistic")) {
        opportunities.push({
          type: "cultural-flourishing",
          trigger: `Peace has enabled ${spec.name} cultural development`,
          involvedSpeciesIds: [spec.id],
          involvedPlanetIds: [],
          narrativePotential: 7,
          description: `With peace, ${spec.name} experiences cultural renaissance.`,
        });
      }
    }
  }

  // 4. DISCOVERY: New habitable worlds
  for (const planet of activePlanets) {
    if (planet.habitability > 50) {
      opportunities.push({
        type: "discovery",
        trigger: `Habitable world discovered: ${planet.name}`,
        involvedSpeciesIds: [],
        involvedPlanetIds: [planet.id],
        narrativePotential: 6,
        description: `${planet.name} harbors unique xenofauna and xenoflora.`,
      });
    }
  }

  // 5. EXTINCTION THREAT: Species in decline
  for (const spec of activeSpecies) {
    if (spec.extinct === false) {
      const speciesEvents = eventWindow.filter((e) => e.speciesIds?.includes(spec.id));
      const negativeEvents = speciesEvents.filter((e) =>
        ["war", "natural-disaster", "extinction-event"].includes(e.eventType)
      );

      if (negativeEvents.length >= 2) {
        opportunities.push({
          type: "extinction-threat",
          trigger: `${spec.name} faces existential threat`,
          involvedSpeciesIds: [spec.id],
          involvedPlanetIds: [],
          narrativePotential: 9,
          description: `${spec.name} civilization teeters on brink of extinction.`,
        });
      }
    }
  }

  return opportunities.sort((a, b) => b.narrativePotential - a.narrativePotential);
}

/**
 * Generate a rich narrative event from an opportunity
 */
export async function generateNarrativeEvent(
  opportunity: NarrativeOpportunity,
  activeSpecies: any[],
  activePlanets: any[],
  currentYear: number
): Promise<GeneratedNarrativeEvent | null> {
  try {
    const involvedSpecies = activeSpecies.filter((s) =>
      opportunity.involvedSpeciesIds.includes(s.id)
    );
    const involvedPlanets = activePlanets.filter((p) =>
      opportunity.involvedPlanetIds.includes(p.id)
    );

    const speciesContext = involvedSpecies
      .map((s) => `${s.name} (traits: ${s.traits?.join(", ") || "unknown"})`)
      .join(", ");

    const planetContext = involvedPlanets
      .map((p) => `${p.name} (${p.planetType})`)
      .join(", ");

    const prompt = `Generate a rich sci-fi narrative event for a galaxy simulation.

Type: ${opportunity.type}
Trigger: ${opportunity.trigger}
Species: ${speciesContext}
Planets: ${planetContext || "None"}
Year: ${currentYear}

Create a detailed event with:
1. Compelling title
2. Rich narrative description (2-3 paragraphs)
3. Deep lore implications
4. Image prompt for illustration
5. Predicted consequences

Respond as JSON:
{
  "title": "string",
  "description": "string",
  "narrativeDepth": "string",
  "imagePrompt": "string",
  "consequences": ["string"]
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a creative sci-fi world historian generating narrative events.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return null;
    }

    const eventData = JSON.parse(content);

    return {
      year: currentYear,
      eventType: opportunity.type,
      title: eventData.title,
      description: eventData.description,
      narrativeDepth: eventData.narrativeDepth,
      speciesIds: opportunity.involvedSpeciesIds,
      planetIds: opportunity.involvedPlanetIds,
      importance: Math.min(10, Math.round(opportunity.narrativePotential)),
      imagePrompt: eventData.imagePrompt,
      consequences: eventData.consequences || [],
    };
  } catch (error) {
    console.error("[NarrativeGen] Error:", error);
    return null;
  }
}

/**
 * Generate narrative events for a galaxy
 */
export async function generateNarrativeEventsForGalaxy(
  galaxyId: number,
  currentYear: number,
  eventCount: number = 10
): Promise<GeneratedNarrativeEvent[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log(`[NarrativeGen] Generating narrative events for galaxy ${galaxyId}`);

  try {
    const recentEvents = await db.select().from(events).where(eq(events.galaxyId, galaxyId));
    const activeSpecies = await db
      .select()
      .from(species)
      .where(eq(species.galaxyId, galaxyId));
    const activePlanets = await db.select().from(planets).where(eq(planets.galaxyId, galaxyId));

    const opportunities = await findNarrativeOpportunities(
      galaxyId,
      currentYear,
      recentEvents,
      activeSpecies,
      activePlanets
    );

    console.log(`[NarrativeGen] Found ${opportunities.length} opportunities`);

    const generatedEvents: GeneratedNarrativeEvent[] = [];

    for (let i = 0; i < Math.min(eventCount, opportunities.length); i++) {
      const event = await generateNarrativeEvent(
        opportunities[i],
        activeSpecies,
        activePlanets,
        currentYear
      );
      if (event) {
        generatedEvents.push(event);
        console.log(`[NarrativeGen] ✓ ${event.title}`);
      }
    }

    console.log(`[NarrativeGen] Generated ${generatedEvents.length} events\n`);
    return generatedEvents;
  } catch (error) {
    console.error("[NarrativeGen] Error:", error);
    throw error;
  }
}
