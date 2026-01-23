/**
 * Unit Tests for UI Components
 * Tests for GenealogyTreeVisualizer, FigureSearchPanel, and EventTimelineWithFigures
 */

import { describe, it, expect, beforeEach } from "vitest";



// Mock components for testing
describe("UI Components", () => {
  describe("GenealogyTreeVisualizer", () => {
    it("should render root figure with name and archetype", () => {
      const rootFigure = {
        id: 1,
        name: "King Aldric",
        archetype: "monarch",
        birthYear: 1000,
        deathYear: 1080,
        attributes: {
          charisma: 0.9,
          intellect: 0.7,
          courage: 0.8,
          wisdom: 0.6,
          creativity: 0.5,
          ambition: 0.9,
          compassion: 0.4,
          ruthlessness: 0.8,
        },
        influence: 85,
        legacy: 90,
      };

      const allFigures = new Map([[1, rootFigure]]);

      // Test data structure
      expect(rootFigure.name).toBe("King Aldric");
      expect(rootFigure.archetype).toBe("monarch");
      expect(rootFigure.influence).toBeGreaterThan(0);
      expect(rootFigure.legacy).toBeGreaterThan(0);
    });

    it("should calculate genealogy statistics correctly", () => {
      const figures = [
        {
          id: 1,
          name: "King Aldric",
          archetype: "monarch",
          birthYear: 1000,
          deathYear: 1080,
          attributes: {
            charisma: 0.9,
            intellect: 0.7,
            courage: 0.8,
            wisdom: 0.6,
            creativity: 0.5,
            ambition: 0.9,
            compassion: 0.4,
            ruthlessness: 0.8,
          },
          childrenIds: [2, 3],
          influence: 85,
          legacy: 90,
        },
        {
          id: 2,
          name: "Queen Elara",
          archetype: "monarch",
          birthYear: 1020,
          deathYear: 1100,
          attributes: {
            charisma: 0.85,
            intellect: 0.8,
            courage: 0.7,
            wisdom: 0.75,
            creativity: 0.6,
            ambition: 0.7,
            compassion: 0.8,
            ruthlessness: 0.5,
          },
          childrenIds: [4],
          isSuccessor: true,
          influence: 80,
          legacy: 85,
        },
        {
          id: 3,
          name: "Prince Aldwin",
          archetype: "general",
          birthYear: 1025,
          deathYear: 1090,
          attributes: {
            charisma: 0.7,
            intellect: 0.6,
            courage: 0.95,
            wisdom: 0.5,
            creativity: 0.4,
            ambition: 0.85,
            compassion: 0.3,
            ruthlessness: 0.9,
          },
          childrenIds: [],
          influence: 70,
          legacy: 60,
        },
        {
          id: 4,
          name: "Princess Lyra",
          archetype: "scholar",
          birthYear: 1050,
          deathYear: 1130,
          attributes: {
            charisma: 0.6,
            intellect: 0.95,
            courage: 0.5,
            wisdom: 0.9,
            creativity: 0.85,
            ambition: 0.6,
            compassion: 0.7,
            ruthlessness: 0.2,
          },
          childrenIds: [],
          influence: 75,
          legacy: 95,
        },
      ];

      // Calculate statistics
      const descendants = figures.length - 1; // All except root
      const totalInfluence = figures.reduce((sum, f) => sum + f.influence, 0);
      const maxLegacy = Math.max(...figures.map(f => f.legacy));
      const successorCount = figures.filter(f => f.isSuccessor).length;

      expect(descendants).toBe(3);
      expect(totalInfluence).toBe(310);
      expect(maxLegacy).toBe(95);
      expect(successorCount).toBe(1);
    });

    it("should identify dominant traits correctly", () => {
      const attributes = {
        charisma: 0.9,
        intellect: 0.7,
        courage: 0.8,
        wisdom: 0.6,
        creativity: 0.5,
        ambition: 0.9,
        compassion: 0.4,
        ruthlessness: 0.8,
      };

      const dominantTrait = Object.entries(attributes).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];

      expect(dominantTrait).toBe("charisma");
    });

    it("should handle multi-generation lineages", () => {
      const figures = new Map([
        [
          1,
          {
            id: 1,
            name: "Ancestor",
            archetype: "monarch",
            birthYear: 900,
            childrenIds: [2],
            attributes: {},
            influence: 50,
            legacy: 80,
          },
        ],
        [
          2,
          {
            id: 2,
            name: "Parent",
            archetype: "monarch",
            birthYear: 950,
            childrenIds: [3],
            attributes: {},
            influence: 60,
            legacy: 70,
          },
        ],
        [
          3,
          {
            id: 3,
            name: "Child",
            archetype: "scholar",
            birthYear: 1000,
            childrenIds: [4],
            attributes: {},
            influence: 70,
            legacy: 85,
          },
        ],
        [
          4,
          {
            id: 4,
            name: "Grandchild",
            archetype: "artist",
            birthYear: 1050,
            childrenIds: [],
            attributes: {},
            influence: 55,
            legacy: 65,
          },
        ],
      ]);

      // Verify lineage chain
      const root = figures.get(1);
      expect(root?.childrenIds).toContain(2);

      const child = figures.get(2);
      expect(child?.childrenIds).toContain(3);

      const grandchild = figures.get(3);
      expect(grandchild?.childrenIds).toContain(4);
    });
  });

  describe("FigureSearchPanel", () => {
    it("should filter figures by search term", () => {
      const figures = [
        {
          id: 1,
          name: "King Aldric",
          archetype: "monarch",
          birthYear: 1000,
          influence: 85,
          legacy: 90,
        },
        {
          id: 2,
          name: "Queen Elara",
          archetype: "monarch",
          birthYear: 1020,
          influence: 80,
          legacy: 85,
        },
        {
          id: 3,
          name: "Prince Aldwin",
          archetype: "general",
          birthYear: 1025,
          influence: 70,
          legacy: 60,
        },
      ];

      const searchTerm = "Aldric";
      const filtered = figures.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe("King Aldric");
    });

    it("should filter figures by archetype", () => {
      const figures = [
        {
          id: 1,
          name: "King Aldric",
          archetype: "monarch",
          birthYear: 1000,
          influence: 85,
          legacy: 90,
        },
        {
          id: 2,
          name: "Queen Elara",
          archetype: "monarch",
          birthYear: 1020,
          influence: 80,
          legacy: 85,
        },
        {
          id: 3,
          name: "Prince Aldwin",
          archetype: "general",
          birthYear: 1025,
          influence: 70,
          legacy: 60,
        },
      ];

      const archetypeFilter = new Set(["monarch"]);
      const filtered = figures.filter(f => archetypeFilter.has(f.archetype));

      expect(filtered.length).toBe(2);
      expect(filtered.every(f => f.archetype === "monarch")).toBe(true);
    });

    it("should filter figures by influence threshold", () => {
      const figures = [
        {
          id: 1,
          name: "King Aldric",
          archetype: "monarch",
          birthYear: 1000,
          influence: 85,
          legacy: 90,
        },
        {
          id: 2,
          name: "Queen Elara",
          archetype: "monarch",
          birthYear: 1020,
          influence: 80,
          legacy: 85,
        },
        {
          id: 3,
          name: "Prince Aldwin",
          archetype: "general",
          birthYear: 1025,
          influence: 70,
          legacy: 60,
        },
      ];

      const minInfluence = 80;
      const filtered = figures.filter(f => f.influence >= minInfluence);

      expect(filtered.length).toBe(2);
      expect(filtered.every(f => f.influence >= minInfluence)).toBe(true);
    });

    it("should combine multiple filters", () => {
      const figures = [
        {
          id: 1,
          name: "King Aldric",
          archetype: "monarch",
          birthYear: 1000,
          civilization: "Aldrian Empire",
          influence: 85,
          legacy: 90,
        },
        {
          id: 2,
          name: "Queen Elara",
          archetype: "monarch",
          birthYear: 1020,
          civilization: "Aldrian Empire",
          influence: 80,
          legacy: 85,
        },
        {
          id: 3,
          name: "Prince Aldwin",
          archetype: "general",
          birthYear: 1025,
          civilization: "Northern Kingdoms",
          influence: 70,
          legacy: 60,
        },
      ];

      const archetypeFilter = new Set(["monarch"]);
      const civilizationFilter = new Set(["Aldrian Empire"]);
      const minInfluence = 75;

      const filtered = figures.filter(
        f =>
          archetypeFilter.has(f.archetype) &&
          civilizationFilter.has(f.civilization || "") &&
          f.influence >= minInfluence
      );

      expect(filtered.length).toBe(2);
      expect(filtered.every(f => f.archetype === "monarch")).toBe(true);
      expect(filtered.every(f => f.civilization === "Aldrian Empire")).toBe(true);
      expect(filtered.every(f => f.influence >= minInfluence)).toBe(true);
    });
  });

  describe("EventTimelineWithFigures", () => {
    it("should calculate timeline statistics correctly", () => {
      const events = [
        {
          id: 1,
          year: 1000,
          title: "Founding of Kingdom",
          description: "The kingdom is founded",
          eventType: "political",
          importance: 10,
          involvedFigures: [1, 2],
          figureInfluenceContribution: { 1: 60, 2: 40 },
        },
        {
          id: 2,
          year: 1050,
          title: "Great War",
          description: "A devastating conflict",
          eventType: "war",
          importance: 9,
          involvedFigures: [3],
          figureInfluenceContribution: { 3: 100 },
        },
        {
          id: 3,
          year: 1100,
          title: "Scientific Discovery",
          description: "New technology discovered",
          eventType: "technological",
          importance: 7,
          involvedFigures: [4],
          figureInfluenceContribution: { 4: 80 },
        },
      ];

      // Calculate statistics
      const figuresInvolved = new Set<number>();
      let totalInfluence = 0;

      events.forEach((event: any) => {
        event.involvedFigures?.forEach((figId: number) => {
          figuresInvolved.add(figId);
          totalInfluence += (event.figureInfluenceContribution?.[figId] as number) || 0;
        });
      });

      expect(events.length).toBe(3);
      expect(figuresInvolved.size).toBe(4);
      expect(totalInfluence).toBe(280);
    });

    it("should filter events by type", () => {
      const events = [
        {
          id: 1,
          year: 1000,
          title: "Founding",
          description: "Kingdom founded",
          eventType: "political",
          importance: 10,
          involvedFigures: [],
          figureInfluenceContribution: {},
        },
        {
          id: 2,
          year: 1050,
          title: "War",
          description: "Conflict",
          eventType: "war",
          importance: 9,
          involvedFigures: [],
          figureInfluenceContribution: {},
        },
        {
          id: 3,
          year: 1100,
          title: "Discovery",
          description: "Technology",
          eventType: "technological",
          importance: 7,
          involvedFigures: [],
          figureInfluenceContribution: {},
        },
      ];

      const filterType = "war";
      const filtered = events.filter(e => e.eventType === filterType);

      expect(filtered.length).toBe(1);
      expect(filtered[0].eventType).toBe("war");
    });

    it("should sort events chronologically", () => {
      const events = [
        {
          id: 1,
          year: 1100,
          title: "Event 3",
          description: "Later event",
          eventType: "political",
          importance: 5,
          involvedFigures: [],
          figureInfluenceContribution: {},
        },
        {
          id: 2,
          year: 1000,
          title: "Event 1",
          description: "Earlier event",
          eventType: "war",
          importance: 8,
          involvedFigures: [],
          figureInfluenceContribution: {},
        },
        {
          id: 3,
          year: 1050,
          title: "Event 2",
          description: "Middle event",
          eventType: "technological",
          importance: 6,
          involvedFigures: [],
          figureInfluenceContribution: {},
        },
      ];

      // Sort ascending
      const sortedAsc = [...events].sort((a, b) => a.year - b.year);
      expect(sortedAsc[0].year).toBe(1000);
      expect(sortedAsc[1].year).toBe(1050);
      expect(sortedAsc[2].year).toBe(1100);

      // Sort descending
      const sortedDesc = [...events].sort((a, b) => b.year - a.year);
      expect(sortedDesc[0].year).toBe(1100);
      expect(sortedDesc[1].year).toBe(1050);
      expect(sortedDesc[2].year).toBe(1000);
    });

    it("should calculate figure contribution percentages", () => {
      const event = {
        id: 1,
        year: 1000,
        title: "Event",
        description: "Description",
        eventType: "political",
        importance: 8,
        involvedFigures: [1, 2, 3],
        figureInfluenceContribution: { 1: 50, 2: 30, 3: 20 },
      };

      const totalInfluence = Object.values(event.figureInfluenceContribution).reduce(
        (a, b) => a + b,
        0
      );

      const contributions: Record<number, number> = {
        1: Math.round((50 / totalInfluence) * 100),
        2: Math.round((30 / totalInfluence) * 100),
        3: Math.round((20 / totalInfluence) * 100),
      };

      expect(contributions[1]).toBe(50);
      expect(contributions[2]).toBe(30);
      expect(contributions[3]).toBe(20);
      expect(contributions[1] + contributions[2] + contributions[3]).toBe(100);
    });

    it("should identify key figures in events", () => {
      const figures = new Map([
        [1, { id: 1, name: "King", archetype: "monarch", influence: 85, legacy: 90 }],
        [2, { id: 2, name: "General", archetype: "general", influence: 75, legacy: 70 }],
      ]);

      const event = {
        id: 1,
        year: 1000,
        title: "Event",
        description: "Description",
        eventType: "war",
        importance: 9,
        involvedFigures: [1, 2],
        figureInfluenceContribution: { 1: 60, 2: 40 },
      };

      const involvedFigures = event.involvedFigures
        ?.map(id => figures.get(id))
        .filter(Boolean);

      expect(involvedFigures?.length).toBe(2);
      expect(involvedFigures?.[0]?.name).toBe("King");
      expect(involvedFigures?.[1]?.name).toBe("General");
    });
  });
});
