import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  decimal,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Galaxy table - represents a simulated galaxy with its parameters and metadata
 */
export const galaxies = mysqlTable("galaxies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  seed: varchar("seed", { length: 64 }), // For reproducible simulations
  startYear: int("startYear").notNull().default(0),
  currentYear: int("currentYear").notNull().default(0),
  endYear: int("endYear").notNull(), // Total simulation length in years
  status: mysqlEnum("status", ["created", "running", "paused", "completed"]).default("created").notNull(),
  isPaused: boolean("isPaused").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Galaxy = typeof galaxies.$inferSelect;
export type InsertGalaxy = typeof galaxies.$inferInsert;

/**
 * Species table - represents a sentient species in the galaxy
 */
export const species = mysqlTable("species", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  speciesType: varchar("speciesType", { length: 100 }).notNull(), // e.g., "humanoid", "insectoid", "aquatic", "silicon-based"
  originPlanetId: int("originPlanetId"),
  yearOfOrigin: int("yearOfOrigin").notNull(),
  yearOfSentience: int("yearOfSentience"), // When they became sentient
  yearOfFirstCivilization: int("yearOfFirstCivilization"), // When first civilization formed
  yearOfSpaceflight: int("yearOfSpaceflight"), // When they achieved spaceflight
  traits: json("traits"), // JSON array of traits: ["aggressive", "peaceful", "innovative", "conservative", etc.]
  physicalDescription: text("physicalDescription"), // Description for image generation
  culturalDescription: text("culturalDescription"), // Cultural characteristics
  color: varchar("color", { length: 7 }), // Hex color for UI representation
  extinct: boolean("extinct").default(false).notNull(),
  yearOfExtinction: int("yearOfExtinction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Species = typeof species.$inferSelect;
export type InsertSpecies = typeof species.$inferInsert;

/**
 * Planet table - represents planets in the galaxy
 */
export const planets = mysqlTable("planets", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  starSystemName: varchar("starSystemName", { length: 255 }).notNull(),
  planetType: mysqlEnum("planetType", [
    "terrestrial",
    "aquatic",
    "desert",
    "ice",
    "volcanic",
    "gas-giant",
    "moon",
  ]).notNull(),
  habitability: int("habitability").notNull(), // 0-100 score
  originSpeciesId: int("originSpeciesId"), // Which species originated here
  currentSpeciesIds: json("currentSpeciesIds"), // JSON array of species IDs currently on planet
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Planet = typeof planets.$inferSelect;
export type InsertPlanet = typeof planets.$inferInsert;

/**
 * Civilization table - represents civilizations/societies of species
 */
export const civilizations = mysqlTable("civilizations", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  speciesId: int("speciesId").notNull(),
  planetId: int("planetId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  governmentType: varchar("governmentType", { length: 100 }).notNull(), // e.g., "monarchy", "democracy", "hive-mind"
  yearFounded: int("yearFounded").notNull(),
  yearFallen: int("yearFallen"), // If civilization collapsed
  populationEstimate: varchar("populationEstimate", { length: 100 }), // e.g., "billions", "trillions"
  technologyLevel: int("technologyLevel").notNull(), // 0-10 scale
  militaryStrength: int("militaryStrength").notNull(), // 0-10 scale
  culturalInfluence: int("culturalInfluence").notNull(), // 0-10 scale
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Civilization = typeof civilizations.$inferSelect;
export type InsertCivilization = typeof civilizations.$inferInsert;

/**
 * Event table - represents significant historical events in the galaxy
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  year: int("year").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // e.g., "species-origin", "first-tool", "war", "discovery", "extinction", "first-contact", "spaceflight"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  speciesIds: json("speciesIds"), // JSON array of involved species IDs
  planetIds: json("planetIds"), // JSON array of involved planet IDs
  civilizationIds: json("civilizationIds"), // JSON array of involved civilization IDs
  importance: int("importance").notNull(), // 0-10 scale, determines if image should be generated
  imageUrl: varchar("imageUrl", { length: 500 }), // URL to generated image
  imagePrompt: text("imagePrompt"), // Prompt used to generate image
  generatedImageAt: timestamp("generatedImageAt"), // When image was generated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * EventConnection table - represents cause-effect relationships between events
 */
export const eventConnections = mysqlTable("eventConnections", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  causeEventId: int("causeEventId").notNull(),
  effectEventId: int("effectEventId").notNull(),
  connectionType: varchar("connectionType", { length: 100 }).notNull(), // e.g., "led-to", "caused", "prevented", "enabled"
  description: text("description"), // Explanation of the connection
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventConnection = typeof eventConnections.$inferSelect;
export type InsertEventConnection = typeof eventConnections.$inferInsert;

/**
 * HistoryDocument table - represents generated history documents/books
 */
export const historyDocuments = mysqlTable("historyDocuments", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(), // Markdown content
  format: mysqlEnum("format", ["markdown", "html", "pdf"]).default("markdown").notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }), // URL to stored document file
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HistoryDocument = typeof historyDocuments.$inferSelect;
export type InsertHistoryDocument = typeof historyDocuments.$inferInsert;

/**
 * SimulationLog table - tracks simulation progress and debugging
 */
export const simulationLogs = mysqlTable("simulationLogs", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  year: int("year").notNull(),
  logType: varchar("logType", { length: 50 }).notNull(), // "event-generated", "error", "milestone"
  message: text("message").notNull(),
  metadata: json("metadata"), // Additional context as JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SimulationLog = typeof simulationLogs.$inferSelect;
export type InsertSimulationLog = typeof simulationLogs.$inferInsert;
