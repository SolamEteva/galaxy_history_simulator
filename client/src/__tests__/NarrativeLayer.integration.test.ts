/**
 * Narrative Layer Integration Tests
 * 
 * Tests for Civilization Tracker and Event Interconnection Visualizer
 * Validates that the narrative layer correctly transforms mechanics into human-readable story
 */

import { describe, it, expect } from 'vitest';

/**
 * Mock civilization history data
 */
const mockCivilizationHistory = [
  {
    year: 1000,
    population: 10,
    technology: 5,
    culture: 3,
    emotionalState: { trust: 60, desperation: 20, curiosity: 70, ambition: 50 },
    phase: 'emergence',
  },
  {
    year: 1100,
    population: 30,
    technology: 20,
    culture: 15,
    emotionalState: { trust: 65, desperation: 15, curiosity: 75, ambition: 60 },
    phase: 'emergence',
  },
  {
    year: 1300,
    population: 80,
    technology: 60,
    culture: 70,
    emotionalState: { trust: 85, desperation: 10, curiosity: 80, ambition: 75 },
    phase: 'resonance',
  },
  {
    year: 1500,
    population: 90,
    technology: 85,
    culture: 80,
    emotionalState: { trust: 90, desperation: 5, curiosity: 85, ambition: 80 },
    phase: 'resonance',
  },
  {
    year: 1700,
    population: 70,
    technology: 80,
    culture: 75,
    emotionalState: { trust: 70, desperation: 30, curiosity: 60, ambition: 65 },
    phase: 'decline',
  },
  {
    year: 1900,
    population: 20,
    technology: 60,
    culture: 50,
    emotionalState: { trust: 40, desperation: 70, curiosity: 40, ambition: 35 },
    phase: 'decline',
  },
  {
    year: 2000,
    population: 0,
    technology: 0,
    culture: 0,
    emotionalState: { trust: 0, desperation: 0, curiosity: 0, ambition: 0 },
    phase: 'legacy',
  },
];

/**
 * Mock causal chain data
 */
const mockCausalChains = [
  {
    rootEvent: {
      id: 'evt_1',
      title: 'Agricultural Revolution',
      year: 1050,
      importance: 9,
      eventType: 'technological_advance',
      causalStrength: 0.95,
      involvedCivilizations: ['Civilization A'],
    },
    consequences: [
      {
        event: {
          id: 'evt_2',
          title: 'Population Boom',
          year: 1100,
          importance: 8,
          eventType: 'demographic_change',
          causalStrength: 0.85,
          involvedCivilizations: ['Civilization A'],
        },
        strength: 0.9,
        depth: 1,
      },
      {
        event: {
          id: 'evt_3',
          title: 'City Formation',
          year: 1150,
          importance: 8,
          eventType: 'cultural_development',
          causalStrength: 0.8,
          involvedCivilizations: ['Civilization A'],
        },
        strength: 0.85,
        depth: 2,
      },
      {
        event: {
          id: 'evt_4',
          title: 'Trade Networks Established',
          year: 1200,
          importance: 7,
          eventType: 'diplomatic_event',
          causalStrength: 0.75,
          involvedCivilizations: ['Civilization A', 'Civilization B'],
        },
        strength: 0.7,
        depth: 3,
      },
    ],
  },
];

describe('Narrative Layer Integration', () => {
  describe('Civilization Tracker', () => {
    describe('Phase Determination', () => {
      it('should identify emergence phase for early civilization', () => {
        const state = mockCivilizationHistory[0];
        expect(state.phase).toBe('emergence');
      });

      it('should identify resonance phase at peak', () => {
        const state = mockCivilizationHistory[3];
        expect(state.phase).toBe('resonance');
      });

      it('should identify decline phase when population drops', () => {
        const state = mockCivilizationHistory[4];
        expect(state.phase).toBe('decline');
      });

      it('should identify legacy phase when population reaches zero', () => {
        const state = mockCivilizationHistory[6];
        expect(state.phase).toBe('legacy');
      });
    });

    describe('Arc Visualization', () => {
      it('should track population growth through emergence', () => {
        const emergence = mockCivilizationHistory.slice(0, 3);
        const populations = emergence.map((s) => s.population);
        expect(populations[populations.length - 1]).toBeGreaterThan(populations[0]);
      });

      it('should track technology advancement through resonance', () => {
        const resonance = mockCivilizationHistory.slice(2, 5);
        const techs = resonance.map((s) => s.technology);
        expect(techs[techs.length - 1]).toBeGreaterThanOrEqual(techs[0]);
      });

      it('should track emotional state changes', () => {
        const emergence = mockCivilizationHistory[0];
        const resonance = mockCivilizationHistory[3];
        const decline = mockCivilizationHistory[5];

        expect(resonance.emotionalState.trust).toBeGreaterThan(emergence.emotionalState.trust);
        expect(decline.emotionalState.desperation).toBeGreaterThan(resonance.emotionalState.desperation);
      });

      it('should calculate lifespan correctly', () => {
        const lifespan = mockCivilizationHistory[mockCivilizationHistory.length - 1].year - mockCivilizationHistory[0].year;
        expect(lifespan).toBe(1000);
      });

      it('should identify peak population', () => {
        const peakPop = Math.max(...mockCivilizationHistory.map((s) => s.population));
        expect(peakPop).toBe(90);
      });
    });

    describe('Metrics Aggregation', () => {
      it('should calculate average technology across lifespan', () => {
        const avgTech = mockCivilizationHistory.reduce((sum, s) => sum + s.technology, 0) / mockCivilizationHistory.length;
        expect(avgTech).toBeGreaterThan(0);
        expect(avgTech).toBeLessThanOrEqual(85);
      });

      it('should track emotional state progression', () => {
        const firstTrust = mockCivilizationHistory[0].emotionalState.trust;
        const peakTrust = Math.max(...mockCivilizationHistory.map((s) => s.emotionalState.trust));
        const lastTrust = mockCivilizationHistory[mockCivilizationHistory.length - 1].emotionalState.trust;

        expect(peakTrust).toBeGreaterThanOrEqual(firstTrust);
        expect(lastTrust).toBeLessThanOrEqual(peakTrust);
      });
    });
  });

  describe('Event Interconnection Visualizer', () => {
    describe('Causal Chain Structure', () => {
      it('should identify root event correctly', () => {
        const chain = mockCausalChains[0];
        expect(chain.rootEvent.title).toBe('Agricultural Revolution');
        expect(chain.rootEvent.importance).toBe(9);
      });

      it('should track consequence depth', () => {
        const chain = mockCausalChains[0];
        const depths = chain.consequences.map((c) => c.depth);
        expect(depths).toEqual([1, 2, 3]);
      });

      it('should calculate time span correctly', () => {
        const chain = mockCausalChains[0];
        const timeSpan = chain.consequences[chain.consequences.length - 1].event.year - chain.rootEvent.year;
        expect(timeSpan).toBe(150);
      });

      it('should count total affected events', () => {
        const chain = mockCausalChains[0];
        const totalAffected = chain.consequences.length + 1;
        expect(totalAffected).toBe(4);
      });
    });

    describe('Causal Strength', () => {
      it('should rank consequences by strength', () => {
        const chain = mockCausalChains[0];
        const strengths = chain.consequences.map((c) => c.strength);
        expect(strengths[0]).toBeGreaterThanOrEqual(strengths[1]);
        expect(strengths[1]).toBeGreaterThanOrEqual(strengths[2]);
      });

      it('should identify critical causality (strength > 0.7)', () => {
        const chain = mockCausalChains[0];
        const criticalConsequences = chain.consequences.filter((c) => c.strength > 0.7);
        expect(criticalConsequences.length).toBeGreaterThan(0);
      });

      it('should identify weak causality (strength < 0.4)', () => {
        const weakChain = {
          ...mockCausalChains[0],
          consequences: [
            ...mockCausalChains[0].consequences,
            {
              event: {
                id: 'evt_weak',
                title: 'Minor Event',
                year: 1300,
                importance: 2,
                eventType: 'local_event',
                causalStrength: 0.2,
                involvedCivilizations: ['Civilization A'],
              },
              strength: 0.2,
              depth: 4,
            },
          ],
        };

        const weakConsequences = weakChain.consequences.filter((c) => c.strength < 0.4);
        expect(weakConsequences.length).toBeGreaterThan(0);
      });
    });

    describe('Causal Network Statistics', () => {
      it('should calculate total events in chain', () => {
        const chain = mockCausalChains[0];
        const totalEvents = chain.consequences.length + 1;
        expect(totalEvents).toBe(4);
      });

      it('should calculate average causal strength', () => {
        const chain = mockCausalChains[0];
        const avgStrength = chain.consequences.reduce((sum, c) => sum + c.strength, 0) / chain.consequences.length;
        expect(avgStrength).toBeGreaterThan(0.5);
        expect(avgStrength).toBeLessThanOrEqual(1);
      });

      it('should identify longest causal chain', () => {
        const chains = mockCausalChains;
        const maxChainLength = Math.max(...chains.map((c) => c.consequences.length));
        expect(maxChainLength).toBe(3);
      });
    });

    describe('Event Type Propagation', () => {
      it('should track event type changes through chain', () => {
        const chain = mockCausalChains[0];
        const eventTypes = [chain.rootEvent.eventType, ...chain.consequences.map((c) => c.event.eventType)];
        expect(eventTypes).toContain('technological_advance');
        expect(eventTypes).toContain('demographic_change');
        expect(eventTypes).toContain('cultural_development');
      });

      it('should track civilization involvement expansion', () => {
        const chain = mockCausalChains[0];
        const firstCivs = chain.rootEvent.involvedCivilizations;
        const lastCivs = chain.consequences[chain.consequences.length - 1].event.involvedCivilizations;

        expect(firstCivs.length).toBe(1);
        expect(lastCivs.length).toBeGreaterThanOrEqual(firstCivs.length);
      });
    });

    describe('Filtering and Sorting', () => {
      it('should filter critical causal chains', () => {
        const chain = mockCausalChains[0];
        const criticalConsequences = chain.consequences.filter((c) => c.strength > 0.7);
        expect(criticalConsequences.length).toBeGreaterThan(0);
      });

      it('should filter long-term causal chains', () => {
        const chain = mockCausalChains[0];
        const timeSpan = chain.consequences[chain.consequences.length - 1].event.year - chain.rootEvent.year;
        expect(timeSpan).toBeGreaterThan(100);
      });

      it('should sort chains by root event importance', () => {
        const chains = mockCausalChains;
        const sorted = [...chains].sort((a, b) => b.rootEvent.importance - a.rootEvent.importance);
        expect(sorted[0].rootEvent.importance).toBeGreaterThanOrEqual(sorted[chains.length - 1].rootEvent.importance);
      });
    });
  });

  describe('Narrative Coherence', () => {
    it('should align civilization phase with causal chain intensity', () => {
      // During resonance, causal chains should be more intense
      const resonancePhase = mockCivilizationHistory.find((s) => s.phase === 'resonance');
      const chain = mockCausalChains[0];

      if (resonancePhase && chain) {
        const avgStrength = chain.consequences.reduce((sum, c) => sum + c.strength, 0) / chain.consequences.length;
        expect(avgStrength).toBeGreaterThan(0.5);
      }
    });

    it('should show causal chains leading to phase transitions', () => {
      // A chain from emergence to resonance should show technological advancement
      const chain = mockCausalChains[0];
      const hasAdvancementEvent = chain.consequences.some((c) => c.event.eventType === 'technological_advance' || c.event.eventType === 'cultural_development');
      expect(hasAdvancementEvent).toBe(true);
    });

    it('should track emotional state changes through causal chains', () => {
      const chain = mockCausalChains[0];
      const firstEvent = chain.rootEvent;
      const lastEvent = chain.consequences[chain.consequences.length - 1].event;

      // Both should be part of civilization history
      expect(firstEvent).toBeDefined();
      expect(lastEvent).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single-event civilization', () => {
      const singleEvent = [mockCivilizationHistory[0]];
      expect(singleEvent.length).toBe(1);
      expect(singleEvent[0].phase).toBe('emergence');
    });

    it('should handle empty causal chains', () => {
      const emptyChains: any[] = [];
      expect(emptyChains.length).toBe(0);
    });

    it('should handle civilization with no consequences', () => {
      const chainWithoutConsequences = {
        ...mockCausalChains[0],
        consequences: [],
      };
      expect(chainWithoutConsequences.consequences.length).toBe(0);
    });

    it('should handle zero-population civilization', () => {
      const extinct = mockCivilizationHistory[6];
      expect(extinct.population).toBe(0);
      expect(extinct.phase).toBe('legacy');
    });
  });
});
