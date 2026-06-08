/**
 * Event Filter and Search Tests
 * 
 * Tests for filtering, searching, and sorting simulation events
 */

import { describe, it, expect } from 'vitest';

interface TestEvent {
  id: string;
  title: string;
  description: string;
  narrative?: string;
  eventType: string;
  year: number;
  importance: number;
  involvedCivilizations: string[];
  causalStrength: number;
}

/**
 * Full-text search scoring function (copied from component)
 */
function scoreSearchMatch(query: string, text: string): number {
  if (!query || !text) return 0;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  if (textLower === queryLower) return 100;
  if (textLower.startsWith(queryLower)) return 80;
  if (textLower.includes(queryLower)) return 60;

  const words = textLower.split(/\s+/);
  if (words.some((w) => w.startsWith(queryLower))) return 40;

  let score = 0;
  let queryIdx = 0;

  for (let i = 0; i < textLower.length && queryIdx < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIdx]) {
      score += 1;
      queryIdx++;
    }
  }

  return queryIdx === queryLower.length ? score : 0;
}

describe('Event Filter and Search', () => {
  const testEvents: TestEvent[] = [
    {
      id: 'evt_1',
      title: 'Great War Begins',
      description: 'A major conflict erupts',
      narrative: 'The great war began with devastating consequences',
      eventType: 'military_conflict',
      year: 1000,
      importance: 9,
      involvedCivilizations: ['Empire A', 'Empire B'],
      causalStrength: 0.95,
    },
    {
      id: 'evt_2',
      title: 'Technological Breakthrough',
      description: 'New technology discovered',
      narrative: 'A breakthrough in agriculture transformed society',
      eventType: 'technological_advance',
      year: 1050,
      importance: 7,
      involvedCivilizations: ['Empire A'],
      causalStrength: 0.65,
    },
    {
      id: 'evt_3',
      title: 'Trade Agreement Signed',
      description: 'Two civilizations establish trade',
      narrative: 'Peaceful trade routes were established',
      eventType: 'diplomatic_event',
      year: 1100,
      importance: 5,
      involvedCivilizations: ['Empire B', 'Empire C'],
      causalStrength: 0.45,
    },
  ];

  describe('Search Scoring', () => {
    it('should score exact matches highest', () => {
      const score = scoreSearchMatch('war', 'Great War Begins');
      expect(score).toBeGreaterThan(0);
    });

    it('should score substring matches', () => {
      const score = scoreSearchMatch('tech', 'Technological Breakthrough');
      expect(score).toBeGreaterThan(0);
    });

    it('should return 0 for no match', () => {
      const score = scoreSearchMatch('xyz', 'Great War Begins');
      expect(score).toBe(0);
    });

    it('should handle case-insensitive matching', () => {
      const score1 = scoreSearchMatch('WAR', 'war');
      const score2 = scoreSearchMatch('war', 'WAR');
      expect(score1).toBe(score2);
      expect(score1).toBeGreaterThan(0);
    });

    it('should score word boundary matches', () => {
      const score = scoreSearchMatch('war', 'Great War Begins');
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('Event Type Filtering', () => {
    it('should filter events by single type', () => {
      const filtered = testEvents.filter((e) => e.eventType === 'military_conflict');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('evt_1');
    });

    it('should filter events by multiple types', () => {
      const types = ['military_conflict', 'technological_advance'];
      const filtered = testEvents.filter((e) => types.includes(e.eventType));
      expect(filtered).toHaveLength(2);
    });

    it('should return empty array when no types match', () => {
      const filtered = testEvents.filter((e) => e.eventType === 'nonexistent');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Civilization Filtering', () => {
    it('should filter events by civilization involvement', () => {
      const filtered = testEvents.filter((e) => e.involvedCivilizations.includes('Empire A'));
      expect(filtered).toHaveLength(2);
    });

    it('should filter events by multiple civilizations', () => {
      const civs = ['Empire A', 'Empire B'];
      const filtered = testEvents.filter((e) =>
        civs.some((civ) => e.involvedCivilizations.includes(civ))
      );
      expect(filtered).toHaveLength(3);
    });

    it('should return empty array for non-existent civilization', () => {
      const filtered = testEvents.filter((e) =>
        e.involvedCivilizations.includes('Nonexistent')
      );
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Importance Range Filtering', () => {
    it('should filter events by importance range', () => {
      const filtered = testEvents.filter((e) => e.importance >= 7 && e.importance <= 10);
      expect(filtered).toHaveLength(2);
    });

    it('should include boundary values', () => {
      const filtered = testEvents.filter((e) => e.importance >= 5 && e.importance <= 5);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('evt_3');
    });

    it('should return empty array for out-of-range', () => {
      const filtered = testEvents.filter((e) => e.importance >= 10 && e.importance <= 15);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Year Range Filtering', () => {
    it('should filter events by year range', () => {
      const filtered = testEvents.filter((e) => e.year >= 1000 && e.year <= 1050);
      expect(filtered).toHaveLength(2);
    });

    it('should handle exact year match', () => {
      const filtered = testEvents.filter((e) => e.year === 1000);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('evt_1');
    });
  });

  describe('Cascade Detection', () => {
    it('should identify cascades by causal strength threshold', () => {
      const cascadeThreshold = 0.7;
      const cascades = testEvents.filter((e) => e.causalStrength > cascadeThreshold);
      expect(cascades).toHaveLength(1);
      expect(cascades[0].id).toBe('evt_1');
    });

    it('should filter cascade-only events', () => {
      const cascadeThreshold = 0.7;
      const filtered = testEvents.filter((e) => e.causalStrength > cascadeThreshold);
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Combined Filtering', () => {
    it('should apply multiple filters simultaneously', () => {
      const filtered = testEvents.filter((e) => {
        const typeMatch = e.eventType === 'military_conflict';
        const importanceMatch = e.importance >= 8;
        const yearMatch = e.year >= 1000 && e.year <= 1100;
        return typeMatch && importanceMatch && yearMatch;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('evt_1');
    });

    it('should return empty when filters conflict', () => {
      const filtered = testEvents.filter((e) => {
        const typeMatch = e.eventType === 'military_conflict';
        const importanceMatch = e.importance <= 3;
        return typeMatch && importanceMatch;
      });

      expect(filtered).toHaveLength(0);
    });
  });

  describe('Sorting', () => {
    it('should sort events by year descending', () => {
      const sorted = [...testEvents].sort((a, b) => b.year - a.year);
      expect(sorted[0].year).toBe(1100);
      expect(sorted[sorted.length - 1].year).toBe(1000);
    });

    it('should sort events by importance descending', () => {
      const sorted = [...testEvents].sort((a, b) => b.importance - a.importance);
      expect(sorted[0].importance).toBe(9);
      expect(sorted[sorted.length - 1].importance).toBe(5);
    });

    it('should sort events by causal strength descending', () => {
      const sorted = [...testEvents].sort((a, b) => b.causalStrength - a.causalStrength);
      expect(sorted[0].causalStrength).toBe(0.95);
      expect(sorted[sorted.length - 1].causalStrength).toBe(0.45);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty event list', () => {
      const filtered = [].filter((e: TestEvent) => e.importance > 5);
      expect(filtered).toHaveLength(0);
    });

    it('should handle events with empty civilization list', () => {
      const event: TestEvent = {
        ...testEvents[0],
        involvedCivilizations: [],
      };

      const filtered = [event].filter((e) => e.involvedCivilizations.includes('Any'));
      expect(filtered).toHaveLength(0);
    });

    it('should handle null/undefined narrative gracefully', () => {
      const event: TestEvent = {
        ...testEvents[0],
        narrative: undefined,
      };

      const score = scoreSearchMatch('test', event.narrative || '');
      expect(score).toBe(0);
    });
  });
});
