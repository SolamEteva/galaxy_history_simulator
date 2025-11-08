import { invokeLLM } from "./_core/llm";
import {
  getGalaxy,
  getGalaxySpecies,
  getGalaxyPlanets,
  getGalaxyEvents,
  getEventConnections,
  createHistoryDocument,
} from "./db";
import { storagePut } from "./storage";

/**
 * Generate a formatted history document for a galaxy
 */
export async function generateGalaxyHistoryDocument(galaxyId: number): Promise<{
  documentId: number;
  url: string;
  success: boolean;
}> {
  try {
    const galaxy = await getGalaxy(galaxyId);
    if (!galaxy) throw new Error("Galaxy not found");

    const species = await getGalaxySpecies(galaxyId);
    const planets = await getGalaxyPlanets(galaxyId);
    const events = await getGalaxyEvents(galaxyId);
    const connections = await getEventConnections(galaxyId);

    console.log(
      `[History Generation] Generating chronicle for galaxy ${galaxyId} with ${events.length} events`
    );

    // Build markdown chronicle
    const markdown = buildHistoryMarkdown(
      galaxy,
      species,
      planets,
      events,
      connections
    );

    // Store document
    const fileKey = `chronicles/${galaxyId}-${Date.now()}.md`;
    const storageResult = await storagePut(fileKey, markdown, "text/markdown");

    // Create document record
    const docResult = await createHistoryDocument({
      galaxyId,
      userId: galaxy.userId,
      title: `The Chronicles of ${galaxy.name}`,
      content: markdown,
      format: "markdown",
      fileUrl: storageResult.url,
    });

    const documentId = (docResult as any).insertId as number;

    console.log(
      `[History Generation] Successfully generated chronicle for galaxy ${galaxyId}`
    );

    return {
      documentId,
      url: storageResult.url,
      success: true,
    };
  } catch (error) {
    console.error(
      `[History Generation] Error generating history document for galaxy ${galaxyId}:`,
      error
    );
    return {
      documentId: 0,
      url: "",
      success: false,
    };
  }
}

/**
 * Build markdown chronicle from galaxy data
 */
function buildHistoryMarkdown(
  galaxy: any,
  species: any[],
  planets: any[],
  events: any[],
  connections: any[]
): string {
  const lines: string[] = [];

  // Title and introduction
  lines.push(`# The Chronicles of ${galaxy.name}`);
  lines.push("");
  lines.push(`*A comprehensive history spanning ${galaxy.endYear.toLocaleString()} years*`);
  lines.push("");
  lines.push(galaxy.description || "");
  lines.push("");

  // Table of contents
  lines.push("## Table of Contents");
  lines.push("1. [Overview](#overview)");
  lines.push("2. [The Species](#the-species)");
  lines.push("3. [Planetary Systems](#planetary-systems)");
  lines.push("4. [Historical Timeline](#historical-timeline)");
  lines.push("5. [Major Events](#major-events)");
  lines.push("6. [Cause and Effect](#cause-and-effect)");
  lines.push("");

  // Overview section
  lines.push("## Overview");
  lines.push("");
  lines.push(`**Galaxy Name:** ${galaxy.name}`);
  lines.push(`**Total Years:** ${galaxy.endYear.toLocaleString()}`);
  lines.push(`**Active Species:** ${species.length}`);
  lines.push(`**Planetary Systems:** ${planets.length}`);
  lines.push(`**Recorded Events:** ${events.length}`);
  lines.push("");

  // Species section
  lines.push("## The Species");
  lines.push("");
  lines.push(
    "The following sentient species evolved and flourished throughout the history of this galaxy:"
  );
  lines.push("");

  for (const sp of species) {
    lines.push(`### ${sp.name}`);
    lines.push("");
    lines.push(`**Type:** ${sp.speciesType}`);
    lines.push(`**Traits:** ${(sp.traits as string[]).join(", ")}`);
    lines.push("");
    lines.push(`**Physical Description:** ${sp.physicalDescription}`);
    lines.push("");
    lines.push(`**Cultural Description:** ${sp.culturalDescription}`);
    lines.push("");

    // Milestones
    lines.push("**Milestones:**");
    lines.push(`- Origin: Year ${sp.yearOfOrigin}`);
    if (sp.yearOfSentience) {
      lines.push(`- Sentience: Year ${sp.yearOfSentience}`);
    }
    if (sp.yearOfFirstCivilization) {
      lines.push(`- First Civilization: Year ${sp.yearOfFirstCivilization}`);
    }
    if (sp.yearOfSpaceflight) {
      lines.push(`- Spaceflight: Year ${sp.yearOfSpaceflight}`);
    }
    if (sp.extinct) {
      lines.push(`- **Extinction: Year ${sp.yearOfExtinction}**`);
    }
    lines.push("");
  }

  // Planetary systems section
  lines.push("## Planetary Systems");
  lines.push("");

  const starSystems = new Map<string, any[]>();
  for (const planet of planets) {
    if (!starSystems.has(planet.starSystemName)) {
      starSystems.set(planet.starSystemName, []);
    }
    starSystems.get(planet.starSystemName)!.push(planet);
  }

  for (const [systemName, systemPlanets] of starSystems) {
    lines.push(`### ${systemName}`);
    lines.push("");

    for (const planet of systemPlanets) {
      lines.push(`#### ${planet.name}`);
      lines.push(`- **Type:** ${planet.planetType}`);
      lines.push(`- **Habitability:** ${planet.habitability}%`);
      if (planet.description) {
        lines.push(`- **Description:** ${planet.description}`);
      }
      lines.push("");
    }
  }

  // Historical timeline section
  lines.push("## Historical Timeline");
  lines.push("");

  // Group events by era
  const erasArray = groupEventsByEra(events, galaxy.endYear);

  for (const [eraName, eraEvents] of erasArray) {
    lines.push(`### ${eraName}`);
    lines.push("");

    for (const event of eraEvents) {
      lines.push(`**Year ${event.year}: ${event.title}**`);
      lines.push("");
      lines.push(event.description);
      lines.push("");
      lines.push(`*Type: ${event.eventType} | Importance: ${event.importance}/10*`);
      lines.push("");
    }
  }

  // Major events section
  lines.push("## Major Events");
  lines.push("");

  const majorEvents = events.filter((e) => e.importance >= 8).sort((a, b) => a.year - b.year);

  for (const event of majorEvents) {
    lines.push(`### ${event.title}`);
    lines.push("");
    lines.push(`**Year:** ${event.year}`);
    lines.push(`**Type:** ${event.eventType}`);
    lines.push(`**Importance:** ${event.importance}/10`);
    lines.push("");
    lines.push(event.description);
    lines.push("");

    // Find connected events
    const causes = connections.filter((c) => c.effectEventId === event.id);
    const effects = connections.filter((c) => c.causeEventId === event.id);

    if (causes.length > 0) {
      lines.push("**Caused by:**");
      for (const cause of causes) {
        const causeEvent = events.find((e) => e.id === cause.causeEventId);
        if (causeEvent) {
          lines.push(`- ${causeEvent.title} (Year ${causeEvent.year})`);
        }
      }
      lines.push("");
    }

    if (effects.length > 0) {
      lines.push("**Led to:**");
      for (const effect of effects) {
        const effectEvent = events.find((e) => e.id === effect.effectEventId);
        if (effectEvent) {
          lines.push(`- ${effectEvent.title} (Year ${effectEvent.year})`);
        }
      }
      lines.push("");
    }
  }

  // Cause and effect section
  lines.push("## Cause and Effect");
  lines.push("");
  lines.push("The following interconnected events shaped the destiny of this galaxy:");
  lines.push("");

  for (const connection of connections) {
    const cause = events.find((e) => e.id === connection.causeEventId);
    const effect = events.find((e) => e.id === connection.effectEventId);

    if (cause && effect) {
      lines.push(
        `- **${cause.title}** (Year ${cause.year}) → **${effect.title}** (Year ${effect.year})`
      );
      if (connection.description) {
        lines.push(`  - ${connection.description}`);
      }
      lines.push("");
    }
  }

  // Conclusion
  lines.push("## Conclusion");
  lines.push("");
  lines.push(
    `This chronicle documents the rise and fall of civilizations, the clash of species, and the ` +
      `inexorable march of progress across ${galaxy.endYear.toLocaleString()} years of galactic history. ` +
      `From the first awakening of consciousness to the stars themselves, the story of ${galaxy.name} ` +
      `is one of triumph, tragedy, and transformation.`
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*Generated: ${new Date().toISOString()}*`);

  return lines.join("\n");


}

/**
 * Group events by historical era
 */
function groupEventsByEra(events: any[], totalYears: number): Array<[string, any[]]> {
  const eraLength = Math.floor(totalYears / 6);
  const eras: Array<[string, any[]]> = [];

  const eraNames = [
    "Primordial Age",
    "Ancient Age",
    "Classical Age",
    "Medieval Age",
    "Industrial Age",
    "Space Age",
  ];

  for (let i = 0; i < 6; i++) {
    const startYear = i * eraLength;
    const endYear = (i + 1) * eraLength;
    const eraName = eraNames[i];

    const eraEvents = events.filter((e) => e.year >= startYear && e.year < endYear);
    if (eraEvents.length > 0) {
      eras.push([eraName, eraEvents.sort((a, b) => a.year - b.year)]);
    }
  }

  return eras;
}
