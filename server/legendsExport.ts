/**
 * Legends Export Service
 * Generates formatted PDF/HTML chronicles of galaxy histories
 */

import { getDb } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  galaxies,
  species,
  planets,
  events,
  civilizations,
  eventConnections,
} from "../drizzle/schema";
import { SimulationError, ErrorCategory, ErrorSeverity, safeOperation } from "./errorHandling";

export interface LegendExportOptions {
  format: "html" | "pdf";
  includeImages?: boolean;
  includeTimeline?: boolean;
  includeCauseEffect?: boolean;
}

export interface LegendData {
  galaxyName: string;
  totalYears: number;
  createdAt: Date;
  speciesCount: number;
  eventCount: number;
  civilizationCount: number;
  species: SpeciesLegendData[];
  events: EventLegendData[];
  civilizations: CivilizationLegendData[];
  statistics: LegendStatistics;
}

export interface SpeciesLegendData {
  id: number;
  name: string;
  homeworld: string;
  traits: string[];
  status: string;
  extinctionYear?: number;
}

export interface EventLegendData {
  year: number;
  title: string;
  description: string;
  eventType: string;
  importance: number;
  speciesInvolved: string[];
  causes: string[];
  effects: string[];
}

export interface CivilizationLegendData {
  name: string;
  speciesName: string;
  riseYear: number;
  fallYear?: number;
  status: string;
}

export interface LegendStatistics {
  totalWars: number;
  totalPeaceTreaties: number;
  totalDiscoveries: number;
  totalExtinctions: number;
  totalCulturalEvents: number;
  averageEventImportance: number;
  mostInfluentialSpecies: string;
  majorTurningPoints: string[];
}

/**
 * Fetch all legend data for a galaxy
 */
async function fetchLegendData(galaxyId: number): Promise<LegendData> {
  const db = await getDb();
  if (!db) {
    throw new SimulationError(
      ErrorCategory.DATABASE,
      ErrorSeverity.CRITICAL,
      "Database not available"
    );
  }

  // Fetch galaxy
  const galaxy = await db
    .select()
    .from(galaxies)
    .where(eq(galaxies.id, galaxyId))
    .limit(1);

  if (!galaxy.length) {
    throw new SimulationError(
      ErrorCategory.VALIDATION,
      ErrorSeverity.HIGH,
      `Galaxy ${galaxyId} not found`
    );
  }

  const galaxyData = galaxy[0];

  // Fetch species
  const speciesData = await db
    .select()
    .from(species)
    .where(eq(species.galaxyId, galaxyId));

  // Fetch planets
  const planetsData = await db
    .select()
    .from(planets)
    .where(eq(planets.galaxyId, galaxyId));

  // Fetch events
  const eventsData = await db
    .select()
    .from(events)
    .where(eq(events.galaxyId, galaxyId))
    .orderBy(desc(events.year));

  // Fetch civilizations
  const civilizationsData = await db
    .select()
    .from(civilizations)
    .where(eq(civilizations.galaxyId, galaxyId));

  // Fetch event connections for cause-effect relationships
  const connectionsData = await db
    .select()
    .from(eventConnections)
    .where(eq(eventConnections.galaxyId, galaxyId));

  // Build legend data
  const speciesLegend: SpeciesLegendData[] = speciesData.map((s) => ({
    id: s.id,
    name: s.name,
    homeworld: planetsData.find((p) => p.id === s.originPlanetId)?.name || "Unknown",
    traits: (s.traits as string[]) || [],
    status: s.extinct ? "Extinct" : "Active",
    extinctionYear: s.yearOfExtinction || undefined,
  }));

  const eventLegend: EventLegendData[] = eventsData.map((e) => {
    const connections = connectionsData.filter((c) => c.effectEventId === e.id);
    const causes = connections.map((c) => {
      const causeEvent = eventsData.find((ev) => ev.id === c.causeEventId);
      return causeEvent?.title || "Unknown";
    });

    return {
      year: e.year,
      title: e.title,
      description: e.description || "",
      eventType: e.eventType,
      importance: e.importance,
      speciesInvolved: (e.speciesIds as string[]) || [],
      causes,
      effects: [],
    };
  });

  // Add effects to events
  connectionsData.forEach((conn) => {
    const effectEvent = eventLegend.find((e) => e.title === eventsData.find((ev) => ev.id === conn.effectEventId)?.title);
    const causeEvent = eventsData.find((ev) => ev.id === conn.causeEventId);
    if (effectEvent && causeEvent) {
      effectEvent.effects.push(causeEvent.title);
    }
  });

  const civilizationLegend: CivilizationLegendData[] = civilizationsData.map((c) => ({
    name: c.name,
    speciesName: speciesData.find((s) => s.id === c.speciesId)?.name || "Unknown",
    riseYear: c.yearFounded,
    fallYear: c.yearFallen || undefined,
    status: c.yearFallen ? "Fallen" : "Active",
  }));

  // Calculate statistics
  const stats: LegendStatistics = {
    totalWars: eventsData.filter((e) => e.eventType === "war").length,
    totalPeaceTreaties: eventsData.filter((e) => e.eventType === "peace-treaty").length,
    totalDiscoveries: eventsData.filter((e) => e.eventType === "discovery").length,
    totalExtinctions: speciesData.filter((s) => s.extinct).length,
    totalCulturalEvents: eventsData.filter((e) => e.eventType === "cultural-event").length,
    averageEventImportance:
      eventsData.reduce((sum, e) => sum + e.importance, 0) / eventsData.length || 0,
    mostInfluentialSpecies: speciesData[0]?.name || "Unknown",
    majorTurningPoints: eventsData
      .filter((e) => e.importance >= 8)
      .map((e) => e.title),
  };

  return {
    galaxyName: galaxyData.name,
    totalYears: galaxyData.endYear,
    createdAt: galaxyData.createdAt,
    speciesCount: speciesData.length,
    eventCount: eventsData.length,
    civilizationCount: civilizationsData.length,
    species: speciesLegend,
    events: eventLegend,
    civilizations: civilizationLegend,
    statistics: stats,
  };
}

/**
 * Generate HTML legend
 */
function generateHtmlLegend(data: LegendData): string {
  const eventTimeline = data.events
    .map(
      (e) =>
        `
    <div class="timeline-event">
      <div class="timeline-year">${e.year}</div>
      <div class="timeline-content">
        <h4>${e.title}</h4>
        <p class="event-type">${e.eventType}</p>
        <p>${e.description}</p>
        ${e.causes.length > 0 ? `<p><strong>Caused by:</strong> ${e.causes.join(", ")}</p>` : ""}
        ${e.effects.length > 0 ? `<p><strong>Led to:</strong> ${e.effects.join(", ")}</p>` : ""}
        <div class="importance-bar">
          <div class="importance-fill" style="width: ${e.importance * 10}%"></div>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  const speciesProfiles = data.species
    .map(
      (s) =>
        `
    <div class="species-profile">
      <h3>${s.name}</h3>
      <p><strong>Homeworld:</strong> ${s.homeworld}</p>
      <p><strong>Status:</strong> ${s.status}</p>
      ${s.traits.length > 0 ? `<p><strong>Traits:</strong> ${s.traits.join(", ")}</p>` : ""}
      ${s.extinctionYear ? `<p><strong>Extinction Year:</strong> ${s.extinctionYear}</p>` : ""}
    </div>
  `
    )
    .join("");

  const civilizationProfiles = data.civilizations
    .map(
      (c) =>
        `
    <div class="civilization-profile">
      <h3>${c.name}</h3>
      <p><strong>Species:</strong> ${c.speciesName}</p>
      <p><strong>Rise Year:</strong> ${c.riseYear}</p>
      ${c.fallYear ? `<p><strong>Fall Year:</strong> ${c.fallYear}</p>` : ""}
      <p><strong>Status:</strong> ${c.status}</p>
    </div>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.galaxyName} - Legends Chronicle</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px;
      background: #0a0e27;
      color: #e0e0e0;
      line-height: 1.6;
    }
    h1 { font-size: 2.5em; color: #4da6ff; margin-bottom: 10px; }
    h2 { font-size: 2em; color: #66b3ff; margin-top: 40px; border-bottom: 2px solid #4da6ff; padding-bottom: 10px; }
    h3 { color: #99ccff; }
    h4 { color: #b3d9ff; margin: 10px 0; }
    .metadata { color: #888; font-style: italic; margin-bottom: 30px; }
    .statistics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
      padding: 20px;
      background: #0f1535;
      border-radius: 8px;
    }
    .stat-box {
      padding: 15px;
      background: #1a2050;
      border-left: 4px solid #4da6ff;
      border-radius: 4px;
    }
    .stat-value { font-size: 1.8em; color: #4da6ff; font-weight: bold; }
    .stat-label { color: #888; font-size: 0.9em; }
    .timeline-event {
      margin: 20px 0;
      padding: 20px;
      background: #0f1535;
      border-left: 4px solid #4da6ff;
      border-radius: 4px;
    }
    .timeline-year { color: #4da6ff; font-weight: bold; font-size: 1.1em; }
    .timeline-content { margin-top: 10px; }
    .event-type { color: #888; font-size: 0.9em; }
    .importance-bar {
      height: 4px;
      background: #1a2050;
      border-radius: 2px;
      margin-top: 10px;
      overflow: hidden;
    }
    .importance-fill { background: #4da6ff; height: 100%; }
    .species-profile, .civilization-profile {
      margin: 20px 0;
      padding: 15px;
      background: #0f1535;
      border-radius: 4px;
      border-left: 4px solid #66b3ff;
    }
    .page-break { page-break-after: always; margin: 40px 0; }
  </style>
</head>
<body>
  <h1>⭐ ${data.galaxyName}</h1>
  <div class="metadata">
    <p>Legends Chronicle | Generated: ${new Date().toLocaleDateString()}</p>
    <p>Simulation Span: ${data.totalYears.toLocaleString()} years</p>
    <p>Species: ${data.speciesCount} | Events: ${data.eventCount} | Civilizations: ${data.civilizationCount}</p>
  </div>

  <h2>📊 Statistics</h2>
  <div class="statistics">
    <div class="stat-box">
      <div class="stat-value">${data.statistics.totalWars}</div>
      <div class="stat-label">Wars</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${data.statistics.totalPeaceTreaties}</div>
      <div class="stat-label">Peace Treaties</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${data.statistics.totalDiscoveries}</div>
      <div class="stat-label">Discoveries</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${data.statistics.totalExtinctions}</div>
      <div class="stat-label">Extinctions</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${data.statistics.totalCulturalEvents}</div>
      <div class="stat-label">Cultural Events</div>
    </div>
    <div class="stat-box">
      <div class="stat-value">${data.statistics.averageEventImportance.toFixed(1)}</div>
      <div class="stat-label">Avg. Importance</div>
    </div>
  </div>

  <h2>🌍 Species Encyclopedia</h2>
  ${speciesProfiles}

  <div class="page-break"></div>

  <h2>🏛️ Civilizations</h2>
  ${civilizationProfiles}

  <div class="page-break"></div>

  <h2>📜 Timeline of Events</h2>
  ${eventTimeline}

  <div class="page-break"></div>

  <h2>🎯 Major Turning Points</h2>
  <ul>
    ${data.statistics.majorTurningPoints.map((point) => `<li>${point}</li>`).join("")}
  </ul>

  <p style="text-align: center; margin-top: 60px; color: #666;">
    <em>End of Legends Chronicle</em>
  </p>
</body>
</html>
  `;
}

/**
 * Export galaxy legend as HTML
 */
export async function exportLegendAsHtml(galaxyId: number) {
  return safeOperation(async () => {
    const data = await fetchLegendData(galaxyId);
    return generateHtmlLegend(data);
  }, "exportLegendAsHtml");
}

/**
 * Export galaxy legend as PDF
 * Note: Requires external PDF generation service
 */
export async function exportLegendAsPdf(galaxyId: number) {
  return safeOperation(async () => {
    const htmlResult = await exportLegendAsHtml(galaxyId);

    if (!htmlResult.ok) {
      throw htmlResult.error;
    }

    // In production, use a PDF generation service
    // For now, return a placeholder
    throw new SimulationError(
      ErrorCategory.VALIDATION,
      ErrorSeverity.HIGH,
      "PDF export requires external service configuration"
    );
  }, "exportLegendAsPdf");
}
