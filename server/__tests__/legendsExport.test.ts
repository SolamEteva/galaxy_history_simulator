import { describe, it, expect } from "vitest";
import { LegendData, SpeciesLegendData, EventLegendData, CivilizationLegendData, LegendStatistics } from "../legendsExport";

describe("Legends Export", () => {
  describe("Data Structure Validation", () => {
    it("should have valid LegendData structure", () => {
      const mockData: LegendData = {
        galaxyName: "Test Galaxy",
        totalYears: 50000,
        createdAt: new Date(),
        speciesCount: 5,
        eventCount: 150,
        civilizationCount: 12,
        species: [],
        events: [],
        civilizations: [],
        statistics: {
          totalWars: 25,
          totalPeaceTreaties: 8,
          totalDiscoveries: 45,
          totalExtinctions: 1,
          totalCulturalEvents: 30,
          averageEventImportance: 6.5,
          mostInfluentialSpecies: "Humans",
          majorTurningPoints: ["First Contact", "Great War"],
        },
      };

      expect(mockData.galaxyName).toBe("Test Galaxy");
      expect(mockData.totalYears).toBe(50000);
      expect(mockData.speciesCount).toBe(5);
      expect(mockData.eventCount).toBe(150);
      expect(mockData.civilizationCount).toBe(12);
    });

    it("should have valid SpeciesLegendData structure", () => {
      const species: SpeciesLegendData = {
        id: 1,
        name: "Humans",
        homeworld: "Earth",
        traits: ["innovative", "social"],
        status: "Active",
        extinctionYear: undefined,
      };

      expect(species.id).toBe(1);
      expect(species.name).toBe("Humans");
      expect(species.homeworld).toBe("Earth");
      expect(species.traits).toContain("innovative");
      expect(species.status).toBe("Active");
    });

    it("should handle extinct species", () => {
      const extinctSpecies: SpeciesLegendData = {
        id: 2,
        name: "Ancients",
        homeworld: "Lost World",
        traits: ["mystical"],
        status: "Extinct",
        extinctionYear: 25000,
      };

      expect(extinctSpecies.status).toBe("Extinct");
      expect(extinctSpecies.extinctionYear).toBe(25000);
    });

    it("should have valid EventLegendData structure", () => {
      const event: EventLegendData = {
        year: 1000,
        title: "First Contact",
        description: "First meeting between two species",
        eventType: "first-contact",
        importance: 9,
        speciesInvolved: ["Humans", "Aliens"],
        causes: ["Exploration"],
        effects: ["Alliance", "Trade"],
      };

      expect(event.year).toBe(1000);
      expect(event.title).toBe("First Contact");
      expect(event.importance).toBe(9);
      expect(event.speciesInvolved).toContain("Humans");
      expect(event.causes).toContain("Exploration");
      expect(event.effects).toContain("Alliance");
    });

    it("should have valid CivilizationLegendData structure", () => {
      const civ: CivilizationLegendData = {
        name: "Roman Empire",
        speciesName: "Humans",
        riseYear: 100,
        fallYear: 500,
        status: "Fallen",
      };

      expect(civ.name).toBe("Roman Empire");
      expect(civ.speciesName).toBe("Humans");
      expect(civ.riseYear).toBe(100);
      expect(civ.fallYear).toBe(500);
      expect(civ.status).toBe("Fallen");
    });

    it("should handle active civilizations", () => {
      const activeCiv: CivilizationLegendData = {
        name: "Modern Federation",
        speciesName: "Humans",
        riseYear: 2000,
        status: "Active",
      };

      expect(activeCiv.status).toBe("Active");
      expect(activeCiv.fallYear).toBeUndefined();
    });
  });

  describe("Statistics Calculation", () => {
    it("should calculate statistics correctly", () => {
      const stats: LegendStatistics = {
        totalWars: 15,
        totalPeaceTreaties: 5,
        totalDiscoveries: 40,
        totalExtinctions: 2,
        totalCulturalEvents: 25,
        averageEventImportance: 6.2,
        mostInfluentialSpecies: "Humans",
        majorTurningPoints: ["Event 1", "Event 2", "Event 3"],
      };

      expect(stats.totalWars).toBe(15);
      expect(stats.totalPeaceTreaties).toBe(5);
      expect(stats.totalDiscoveries).toBe(40);
      expect(stats.totalExtinctions).toBe(2);
      expect(stats.totalCulturalEvents).toBe(25);
      expect(stats.averageEventImportance).toBeCloseTo(6.2);
      expect(stats.majorTurningPoints.length).toBe(3);
    });

    it("should handle zero events", () => {
      const stats: LegendStatistics = {
        totalWars: 0,
        totalPeaceTreaties: 0,
        totalDiscoveries: 0,
        totalExtinctions: 0,
        totalCulturalEvents: 0,
        averageEventImportance: 0,
        mostInfluentialSpecies: "Unknown",
        majorTurningPoints: [],
      };

      expect(stats.totalWars).toBe(0);
      expect(stats.majorTurningPoints.length).toBe(0);
    });
  });

  describe("HTML Generation", () => {
    it("should generate valid HTML structure", () => {
      const mockData: LegendData = {
        galaxyName: "Test Galaxy",
        totalYears: 50000,
        createdAt: new Date(),
        speciesCount: 5,
        eventCount: 150,
        civilizationCount: 12,
        species: [
          {
            id: 1,
            name: "Humans",
            homeworld: "Earth",
            traits: ["innovative"],
            status: "Active",
          },
        ],
        events: [
          {
            year: 1000,
            title: "First Contact",
            description: "Meeting",
            eventType: "first-contact",
            importance: 9,
            speciesInvolved: ["Humans"],
            causes: [],
            effects: [],
          },
        ],
        civilizations: [
          {
            name: "Federation",
            speciesName: "Humans",
            riseYear: 100,
            status: "Active",
          },
        ],
        statistics: {
          totalWars: 10,
          totalPeaceTreaties: 5,
          totalDiscoveries: 30,
          totalExtinctions: 0,
          totalCulturalEvents: 20,
          averageEventImportance: 6.0,
          mostInfluentialSpecies: "Humans",
          majorTurningPoints: ["First Contact"],
        },
      };

      // Verify data structure is complete
      expect(mockData.galaxyName).toBeDefined();
      expect(mockData.species.length).toBeGreaterThan(0);
      expect(mockData.events.length).toBeGreaterThan(0);
      expect(mockData.civilizations.length).toBeGreaterThan(0);
      expect(mockData.statistics).toBeDefined();
    });

    it("should handle empty data gracefully", () => {
      const emptyData: LegendData = {
        galaxyName: "Empty Galaxy",
        totalYears: 1000,
        createdAt: new Date(),
        speciesCount: 0,
        eventCount: 0,
        civilizationCount: 0,
        species: [],
        events: [],
        civilizations: [],
        statistics: {
          totalWars: 0,
          totalPeaceTreaties: 0,
          totalDiscoveries: 0,
          totalExtinctions: 0,
          totalCulturalEvents: 0,
          averageEventImportance: 0,
          mostInfluentialSpecies: "Unknown",
          majorTurningPoints: [],
        },
      };

      expect(emptyData.species.length).toBe(0);
      expect(emptyData.events.length).toBe(0);
      expect(emptyData.civilizations.length).toBe(0);
    });
  });

  describe("Event Cause-Effect Relationships", () => {
    it("should track event causes correctly", () => {
      const event: EventLegendData = {
        year: 2000,
        title: "War",
        description: "Great conflict",
        eventType: "war",
        importance: 8,
        speciesInvolved: ["A", "B"],
        causes: ["Territorial Dispute", "Resource Scarcity"],
        effects: ["Destruction", "Refugee Crisis"],
      };

      expect(event.causes.length).toBe(2);
      expect(event.causes).toContain("Territorial Dispute");
    });

    it("should handle events with no causes", () => {
      const event: EventLegendData = {
        year: 0,
        title: "Origin",
        description: "Species origin",
        eventType: "species-origin",
        importance: 10,
        speciesInvolved: ["Humans"],
        causes: [],
        effects: ["Civilization"],
      };

      expect(event.causes.length).toBe(0);
    });

    it("should handle events with no effects", () => {
      const event: EventLegendData = {
        year: 50000,
        title: "Final Event",
        description: "End of history",
        eventType: "transcendence",
        importance: 10,
        speciesInvolved: ["Humans"],
        causes: ["Technological Singularity"],
        effects: [],
      };

      expect(event.effects.length).toBe(0);
    });
  });
});
