/**
 * Narrative Event Generator V2 - With Robust Error Handling
 * Dynamically creates rich, interconnected events based on galaxy state
 */

import { getDb } from "./db";
import { events, species, planets } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import {
  SimulationError,
  ErrorCategory,
  ErrorSeverity,
  Validator,
  retryWithBackoff,
  withTimeout,
  safeJsonParse,
  ErrorLogger,
  safeOperation,
  Result,
  Ok,
  Err,
} from "./errorHandling";

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
 * Analyze galaxy history to find narrative opportunities with error handling
 */
export async function findNarrativeOpportunities(
  galaxyId: number,
  currentYear: number,
  recentEvents: any[],
  activeSpecies: any[],
  activePlanets: any[]
): Promise<Result<NarrativeOpportunity[]>> {
  try {
    // Validate inputs
    if (!Number.isInteger(galaxyId) || galaxyId <= 0) {
      return Err(
        new SimulationError(
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM,
          "Invalid galaxy ID",
          { galaxyId }
        )
      );
    }

    if (!Array.isArray(recentEvents) || !Array.isArray(activeSpecies) || !Array.isArray(activePlanets)) {
      return Err(
        new SimulationError(
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM,
          "Invalid input arrays",
          { hasEvents: Array.isArray(recentEvents), hasSpecies: Array.isArray(activeSpecies) }
        )
      );
    }

    const opportunities: NarrativeOpportunity[] = [];
    const recentYears = 500;
    const eventWindow = recentEvents.filter((e) => {
      try {
        return e && e.year && e.year > currentYear - recentYears;
      } catch {
        return false;
      }
    });

    // 1. CONFLICT ESCALATION
    const speciesPairs = new Map<string, number>();
    for (const event of eventWindow) {
      try {
        if (event.eventType === "war" && Array.isArray(event.speciesIds) && event.speciesIds.length >= 2) {
          const pair = event.speciesIds.slice(0, 2).sort().join("-");
          speciesPairs.set(pair, (speciesPairs.get(pair) || 0) + 1);
        }
      } catch (error) {
        console.warn("[NarrativeGen] Error processing war event:", error);
        continue;
      }
    }

    for (const [pair, count] of speciesPairs.entries()) {
      try {
        if (count >= 2) {
          const [id1, id2] = pair.split("-").map(Number);
          const sp1 = activeSpecies.find((s) => s && s.id === id1);
          const sp2 = activeSpecies.find((s) => s && s.id === id2);

          if (sp1 && sp2 && sp1.name && sp2.name) {
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
      } catch (error) {
        console.warn("[NarrativeGen] Error creating conflict escalation opportunity:", error);
        continue;
      }
    }

    // 2. TECHNOLOGICAL BREAKTHROUGH
    for (const spec of activeSpecies) {
      try {
        if (spec && spec.id && spec.traits && Array.isArray(spec.traits) && spec.traits.includes("innovative")) {
          const speciesEvents = eventWindow.filter((e) => e && e.speciesIds && e.speciesIds.includes(spec.id));
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
      } catch (error) {
        console.warn("[NarrativeGen] Error creating technological breakthrough opportunity:", error);
        continue;
      }
    }

    // 3. CULTURAL FLOURISHING
    try {
      const peaceEvents = eventWindow.filter((e) => e && e.eventType === "peace-treaty");
      if (peaceEvents.length > 0) {
        for (const spec of activeSpecies) {
          try {
            if (spec && spec.traits && Array.isArray(spec.traits) && spec.traits.includes("artistic")) {
              opportunities.push({
                type: "cultural-flourishing",
                trigger: `Peace has enabled ${spec.name} cultural development`,
                involvedSpeciesIds: [spec.id],
                involvedPlanetIds: [],
                narrativePotential: 7,
                description: `With peace, ${spec.name} experiences cultural renaissance.`,
              });
            }
          } catch (error) {
            console.warn("[NarrativeGen] Error creating cultural flourishing opportunity:", error);
            continue;
          }
        }
      }
    } catch (error) {
      console.warn("[NarrativeGen] Error processing peace events:", error);
    }

    // 4. EXTINCTION THREAT
    for (const spec of activeSpecies) {
      try {
        if (spec && spec.id && spec.extinct === false) {
          const speciesEvents = eventWindow.filter((e) => e && e.speciesIds && e.speciesIds.includes(spec.id));
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
      } catch (error) {
        console.warn("[NarrativeGen] Error creating extinction threat opportunity:", error);
        continue;
      }
    }

    return Ok(opportunities.sort((a, b) => b.narrativePotential - a.narrativePotential));
  } catch (error) {
    const simError = new SimulationError(
      ErrorCategory.UNKNOWN,
      ErrorSeverity.MEDIUM,
      "Error finding narrative opportunities",
      { galaxyId, currentYear },
      error instanceof Error ? error : undefined
    );
    ErrorLogger.log(simError, "findNarrativeOpportunities");
    return Err(simError);
  }
}

/**
 * Generate a rich narrative event with comprehensive error handling
 */
export async function generateNarrativeEvent(
  opportunity: NarrativeOpportunity,
  activeSpecies: any[],
  activePlanets: any[],
  currentYear: number
): Promise<Result<GeneratedNarrativeEvent>> {
  return safeOperation(async () => {
    try {
      // Validate opportunity
      if (!opportunity || !opportunity.type) {
        throw new SimulationError(
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM,
          "Invalid narrative opportunity",
          { opportunity }
        );
      }

      const involvedSpecies = activeSpecies.filter((s) => s && opportunity.involvedSpeciesIds.includes(s.id));
      const involvedPlanets = activePlanets.filter((p) => p && opportunity.involvedPlanetIds.includes(p.id));

      const speciesContext = involvedSpecies
        .map((s) => `${s.name} (traits: ${Array.isArray(s.traits) ? s.traits.join(", ") : "unknown"})`)
        .join(", ");

      const planetContext = involvedPlanets.map((p) => `${p.name} (${p.planetType})`).join(", ");

      const prompt = `Generate a rich sci-fi narrative event for a galaxy simulation.

Type: ${opportunity.type}
Trigger: ${opportunity.trigger}
Species: ${speciesContext || "None"}
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

      // Call LLM with timeout and retry
      const response = await retryWithBackoff(
        () =>
          withTimeout(
            invokeLLM({
              messages: [
                {
                  role: "system",
                  content: "You are a creative sci-fi world historian generating narrative events.",
                },
                { role: "user", content: prompt },
              ],
            }),
            15000,
            "LLM narrative generation"
          ),
        3,
        1000,
        2
      );

      // Validate LLM response
      Validator.validateLLMResponse(response);

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new SimulationError(
          ErrorCategory.LLM,
          ErrorSeverity.MEDIUM,
          "LLM response content is not a string",
          { contentType: typeof content }
        );
      }

      // Parse JSON with error handling
      const eventData = safeJsonParse<any>(content, "narrative event generation");

      // Validate parsed data
      if (!eventData.title || !eventData.description) {
        throw new SimulationError(
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM,
          "Generated event missing required fields",
          { eventData }
        );
      }

      return {
        year: currentYear,
        eventType: opportunity.type,
        title: eventData.title,
        description: eventData.description,
        narrativeDepth: eventData.narrativeDepth || "",
        speciesIds: opportunity.involvedSpeciesIds,
        planetIds: opportunity.involvedPlanetIds,
        importance: Math.min(10, Math.round(opportunity.narrativePotential)),
        imagePrompt: eventData.imagePrompt || "",
        consequences: Array.isArray(eventData.consequences) ? eventData.consequences : [],
      };
    } catch (error) {
      if (error instanceof SimulationError) {
        throw error;
      }
      throw new SimulationError(
        ErrorCategory.UNKNOWN,
        ErrorSeverity.MEDIUM,
        "Error generating narrative event",
        { opportunityType: opportunity.type },
        error instanceof Error ? error : undefined
      );
    }
  }, "generateNarrativeEvent");
}

/**
 * Generate narrative events for a galaxy with comprehensive error handling
 */
export async function generateNarrativeEventsForGalaxy(
  galaxyId: number,
  currentYear: number,
  eventCount: number = 10
): Promise<Result<GeneratedNarrativeEvent[]>> {
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

    console.log(`[NarrativeGen] Generating ${eventCount} narrative events for galaxy ${galaxyId}`);

    try {
      const recentEvents = await db.select().from(events).where(eq(events.galaxyId, galaxyId));
      const activeSpecies = await db.select().from(species).where(eq(species.galaxyId, galaxyId));
      const activePlanets = await db.select().from(planets).where(eq(planets.galaxyId, galaxyId));

      const opportunitiesResult = await findNarrativeOpportunities(
        galaxyId,
        currentYear,
        recentEvents,
        activeSpecies,
        activePlanets
      );

      if (!opportunitiesResult.ok) {
        throw opportunitiesResult.error;
      }

      const opportunities = opportunitiesResult.value;
      console.log(`[NarrativeGen] Found ${opportunities.length} opportunities`);

      const generatedEvents: GeneratedNarrativeEvent[] = [];

      for (let i = 0; i < Math.min(eventCount, opportunities.length); i++) {
        const eventResult = await generateNarrativeEvent(opportunities[i], activeSpecies, activePlanets, currentYear);

        if (eventResult.ok) {
          generatedEvents.push(eventResult.value);
          console.log(`[NarrativeGen] ✓ ${eventResult.value.title}`);
        } else {
          ErrorLogger.log(eventResult.error, `generateNarrativeEvent[${i}]`);
          // Continue with next event instead of failing completely
        }
      }

      console.log(`[NarrativeGen] Generated ${generatedEvents.length} events\n`);
      return generatedEvents;
    } catch (error) {
      if (error instanceof SimulationError) {
        throw error;
      }
      throw new SimulationError(
        ErrorCategory.UNKNOWN,
        ErrorSeverity.HIGH,
        "Error generating narrative events for galaxy",
        { galaxyId, currentYear, eventCount },
        error instanceof Error ? error : undefined
      );
    }
  }, "generateNarrativeEventsForGalaxy", 60000);
}
