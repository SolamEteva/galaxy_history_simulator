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

/**
 * NotableFigures table - represents significant historical figures
 */
export const notableFigures = mysqlTable("notableFigures", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  civilizationId: int("civilizationId").notNull(),
  speciesId: int("speciesId").notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  nameOrigin: varchar("nameOrigin", { length: 255 }),
  birthYear: int("birthYear").notNull(),
  deathYear: int("deathYear"),
  
  archetype: varchar("archetype", { length: 50 }).notNull(), // monarch, general, prophet, scientist, etc.
  primaryRole: varchar("primaryRole", { length: 100 }),
  secondaryRoles: json("secondaryRoles"), // JSON array of secondary roles
  
  attributes: json("attributes").notNull(), // {charisma, intellect, courage, wisdom, creativity, ambition, compassion, ruthlessness}
  
  influence: int("influence").default(0).notNull(),
  legacyScore: int("legacyScore").default(0).notNull(),
  
  mentors: json("mentors"), // JSON array of figure IDs
  students: json("students"),
  allies: json("allies"),
  rivals: json("rivals"),
  
  family: json("family"), // {parents, children, spouse, siblings}
  generation: int("generation").default(0).notNull(),
  lineageId: varchar("lineageId", { length: 36 }),
  
  birthEventId: int("birthEventId"),
  deathEventId: int("deathEventId"),
  majorEvents: json("majorEvents"), // JSON array of event IDs
  
  speciesTraits: json("speciesTraits"), // JSON array of trait names
  culturalTraits: json("culturalTraits"),
  
  generatedBy: varchar("generatedBy", { length: 50 }).default("llm").notNull(), // event, genealogy, opportunity, user
  generationPrompt: text("generationPrompt"),
  llmModel: varchar("llmModel", { length: 255 }),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).default("0.00").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotableFigure = typeof notableFigures.$inferSelect;
export type InsertNotableFigure = typeof notableFigures.$inferInsert;

/**
 * Achievements table - represents significant accomplishments of figures
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  figureId: int("figureId").notNull(),
  galaxyId: int("galaxyId").notNull(),
  
  year: int("year").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  achievementType: varchar("achievementType", { length: 50 }).notNull(), // military_victory, discovery, innovation, etc.
  
  civilizationImpact: int("civilizationImpact"), // 0-100
  historicalSignificance: int("historicalSignificance"), // 0-100
  
  triggeredEvents: json("triggeredEvents"), // JSON array of event IDs
  enabledTechnologies: json("enabledTechnologies"),
  influencedBeliefs: json("influencedBeliefs"),
  
  collaborators: json("collaborators"), // JSON array of figure IDs
  opposition: json("opposition"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * Genealogies table - represents family lineages
 */
export const genealogies = mysqlTable("genealogies", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  civilizationId: int("civilizationId").notNull(),
  
  lineageName: varchar("lineageName", { length: 255 }).notNull(),
  founderFigureId: int("founderFigureId").notNull(),
  
  generations: json("generations").notNull(), // {generation: number, members: [figureIds]}
  
  dominantTraits: json("dominantTraits"), // JSON array of trait names
  culturalInfluence: int("culturalInfluence"), // 0-100
  powerDuration: int("powerDuration"), // years
  
  majorAchievements: json("majorAchievements"),
  conflicts: json("conflicts"), // JSON array of conflict descriptions
  alliances: json("alliances"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Genealogy = typeof genealogies.$inferSelect;
export type InsertGenealogy = typeof genealogies.$inferInsert;

/**
 * HistoricalMemory table - tracks how figures are remembered over time
 */
export const historicalMemory = mysqlTable("historicalMemory", {
  id: int("id").autoincrement().primaryKey(),
  figureId: int("figureId").notNull(),
  civilizationId: int("civilizationId").notNull(),
  
  memoryStrength: decimal("memoryStrength", { precision: 3, scale: 2 }).default("1.00").notNull(), // 0.0-1.0
  publicPerception: varchar("publicPerception", { length: 100 }), // Hero, Tyrant, Sage, etc.
  mythologization: decimal("mythologization", { precision: 3, scale: 2 }).default("0.00").notNull(), // 0.0-1.0
  
  lastMentionedYear: int("lastMentionedYear"),
  mentionCount: int("mentionCount").default(0).notNull(),
  
  currentInfluence: decimal("currentInfluence", { precision: 3, scale: 2 }), // 0.0-1.0
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HistoricalMemory = typeof historicalMemory.$inferSelect;
export type InsertHistoricalMemory = typeof historicalMemory.$inferInsert;

/**
 * EventAuthenticity table - validation metrics for events
 */
export const eventAuthenticity = mysqlTable("eventAuthenticity", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().unique(),
  
  unityCoefficient: decimal("unityCoefficient", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  constraintSatisfaction: decimal("constraintSatisfaction", { precision: 3, scale: 2 }).notNull(),
  sacredGapScore: decimal("sacredGapScore", { precision: 3, scale: 2 }).notNull(),
  authenticityScore: decimal("authenticityScore", { precision: 3, scale: 2 }).notNull(),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).notNull(),
  
  validationViolations: json("validationViolations"), // JSON array of violation descriptions
  generationPrompt: text("generationPrompt"),
  llmModel: varchar("llmModel", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventAuthenticity = typeof eventAuthenticity.$inferSelect;
export type InsertEventAuthenticity = typeof eventAuthenticity.$inferInsert;

/**
 * EventHarmonic table - harmonic properties of events
 */
export const eventHarmonic = mysqlTable("eventHarmonic", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().unique(),
  
  harmonyFrequency: decimal("harmonyFrequency", { precision: 6, scale: 2 }).notNull(), // 0-963 Hz
  phaseCoherence: decimal("phaseCoherence", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  
  resonanceVectorSound: decimal("resonanceVectorSound", { precision: 3, scale: 2 }), // Cultural impact
  resonanceVectorLight: decimal("resonanceVectorLight", { precision: 3, scale: 2 }), // Discovery/revelation
  resonanceVectorTime: decimal("resonanceVectorTime", { precision: 3, scale: 2 }), // Historical significance
  
  causalStrength: decimal("causalStrength", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventHarmonic = typeof eventHarmonic.$inferSelect;
export type InsertEventHarmonic = typeof eventHarmonic.$inferInsert;

/**
 * CivilizationHarmonic table - harmonic properties of civilizations
 */
export const civilizationHarmonic = mysqlTable("civilizationHarmonic", {
  id: int("id").autoincrement().primaryKey(),
  civilizationId: int("civilizationId").notNull().unique(),
  
  harmonyFrequency: decimal("harmonyFrequency", { precision: 6, scale: 2 }).notNull(), // 0-963 Hz
  phaseCoherence: decimal("phaseCoherence", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  unityCoefficient: decimal("unityCoefficient", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CivilizationHarmonic = typeof civilizationHarmonic.$inferSelect;
export type InsertCivilizationHarmonic = typeof civilizationHarmonic.$inferInsert;

/**
 * CivilizationRelationships table - relationships between civilizations in harmonic network
 */
export const civilizationRelationships = mysqlTable("civilizationRelationships", {
  id: int("id").autoincrement().primaryKey(),
  galaxyId: int("galaxyId").notNull(),
  civilizationAId: int("civilizationAId").notNull(),
  civilizationBId: int("civilizationBId").notNull(),
  
  alignment: decimal("alignment", { precision: 3, scale: 2 }).notNull(), // -1.0 to 1.0
  harmonyDistance: decimal("harmonyDistance", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  causalCoupling: decimal("causalCoupling", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  
  lastInteractionYear: int("lastInteractionYear"),
  eventTypes: json("eventTypes"), // JSON array of event type names
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CivilizationRelationship = typeof civilizationRelationships.$inferSelect;
export type InsertCivilizationRelationship = typeof civilizationRelationships.$inferInsert;

/**
 * CivilizationEvolution table - evolutionary fitness state of civilizations
 */
export const civilizationEvolution = mysqlTable("civilizationEvolution", {
  id: int("id").autoincrement().primaryKey(),
  civilizationId: int("civilizationId").notNull().unique(),
  
  survivalFitness: decimal("survivalFitness", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  culturalFitness: decimal("culturalFitness", { precision: 3, scale: 2 }).notNull(),
  technologicalFitness: decimal("technologicalFitness", { precision: 3, scale: 2 }).notNull(),
  expansionFitness: decimal("expansionFitness", { precision: 3, scale: 2 }).notNull(),
  
  expansionistStrategy: decimal("expansionistStrategy", { precision: 3, scale: 2 }).notNull(), // 0.0-1.0
  peacefulStrategy: decimal("peacefulStrategy", { precision: 3, scale: 2 }).notNull(),
  innovativeStrategy: decimal("innovativeStrategy", { precision: 3, scale: 2 }).notNull(),
  culturalStrategy: decimal("culturalStrategy", { precision: 3, scale: 2 }).notNull(),
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CivilizationEvolution = typeof civilizationEvolution.$inferSelect;
export type InsertCivilizationEvolution = typeof civilizationEvolution.$inferInsert;
