import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  galaxies,
  species,
  planets,
  civilizations,
  events,
  eventConnections,
  historyDocuments,
  simulationLogs,
  InsertGalaxy,
  InsertSpecies,
  InsertPlanet,
  InsertCivilization,
  InsertEvent,
  InsertEventConnection,
  InsertSimulationLog,
  InsertHistoryDocument,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ GALAXY QUERIES ============

export async function createGalaxy(galaxy: InsertGalaxy) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(galaxies).values(galaxy);
  return result;
}

export async function getGalaxy(galaxyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(galaxies)
    .where(eq(galaxies.id, galaxyId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserGalaxies(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(galaxies)
    .where(eq(galaxies.userId, userId));
}

export async function updateGalaxyYear(galaxyId: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(galaxies)
    .set({ currentYear: year, updatedAt: new Date() })
    .where(eq(galaxies.id, galaxyId));
}

export async function updateGalaxyStatus(
  galaxyId: number,
  status: "created" | "running" | "paused" | "completed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(galaxies)
    .set({ status, updatedAt: new Date() })
    .where(eq(galaxies.id, galaxyId));
}

export async function updateGalaxyPauseState(galaxyId: number, isPaused: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(galaxies)
    .set({ isPaused, updatedAt: new Date() })
    .where(eq(galaxies.id, galaxyId));
}

// ============ SPECIES QUERIES ============

export async function createSpecies(sp: InsertSpecies) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(species).values(sp);
  return result;
}

export async function getGalaxySpecies(galaxyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(species)
    .where(eq(species.galaxyId, galaxyId));
}

export async function getSpecies(speciesId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(species)
    .where(eq(species.id, speciesId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateSpecies(speciesId: number, updates: Partial<InsertSpecies>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(species)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(species.id, speciesId));
}

// ============ PLANET QUERIES ============

export async function createPlanet(planet: InsertPlanet) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(planets).values(planet);
  return result;
}

export async function getGalaxyPlanets(galaxyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(planets)
    .where(eq(planets.galaxyId, galaxyId));
}

export async function getPlanet(planetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(planets)
    .where(eq(planets.id, planetId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updatePlanet(planetId: number, updates: Partial<InsertPlanet>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(planets)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(planets.id, planetId));
}

// ============ CIVILIZATION QUERIES ============

export async function createCivilization(civ: InsertCivilization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(civilizations).values(civ);
  return result;
}

export async function getGalaxyCivilizations(galaxyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(civilizations)
    .where(eq(civilizations.galaxyId, galaxyId));
}

export async function getCivilization(civId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(civilizations)
    .where(eq(civilizations.id, civId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateCivilization(civId: number, updates: Partial<InsertCivilization>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(civilizations)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(civilizations.id, civId));
}

// ============ EVENT QUERIES ============

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(events).values(event);
  return result;
}

export async function getGalaxyEvents(galaxyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(events)
    .where(eq(events.galaxyId, galaxyId));
}

export async function getGalaxyEventsByYear(galaxyId: number, year: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(events)
    .where(and(eq(events.galaxyId, galaxyId), eq(events.year, year)));
}

export async function getEvent(eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateEvent(eventId: number, updates: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(events)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(events.id, eventId));
}

// ============ EVENT CONNECTION QUERIES ============

export async function createEventConnection(connection: InsertEventConnection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(eventConnections).values(connection);
  return result;
}

export async function getEventConnections(galaxyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(eventConnections)
    .where(eq(eventConnections.galaxyId, galaxyId));
}

export async function getEventCauses(effectEventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(eventConnections)
    .where(eq(eventConnections.effectEventId, effectEventId));
}

export async function getEventEffects(causeEventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(eventConnections)
    .where(eq(eventConnections.causeEventId, causeEventId));
}

// ============ HISTORY DOCUMENT QUERIES ============

export async function createHistoryDocument(doc: InsertHistoryDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(historyDocuments).values(doc);
  return result;
}

export async function getGalaxyHistoryDocuments(galaxyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(historyDocuments)
    .where(eq(historyDocuments.galaxyId, galaxyId));
}

export async function getHistoryDocument(docId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(historyDocuments)
    .where(eq(historyDocuments.id, docId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ SIMULATION LOG QUERIES ============

export async function createSimulationLog(log: InsertSimulationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(simulationLogs).values(log);
  return result;
}

export async function getGalaxySimulationLogs(galaxyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(simulationLogs)
    .where(eq(simulationLogs.galaxyId, galaxyId));
}
