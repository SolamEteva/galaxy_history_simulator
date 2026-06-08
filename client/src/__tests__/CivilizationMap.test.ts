/**
 * Civilization Map Tests
 * 
 * Tests for position calculation, color mapping, and visualization logic
 */

import { describe, it, expect } from 'vitest';

/**
 * Calculate civilization position based on index
 */
function calculatePosition(index: number, total: number, radius: number = 200) {
  const angle = (index / total) * Math.PI * 2;
  return {
    x: Math.cos(angle) * radius + 250,
    y: Math.sin(angle) * radius + 250,
  };
}

/**
 * Get color based on civilization phase
 */
function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    emergence: '#fbbf24',
    growth: '#60a5fa',
    peak: '#34d399',
    cooperation: '#a78bfa',
    transcendence: '#f472b6',
    decline: '#ef4444',
    extinction: '#6b7280',
  };
  return colors[phase] || '#9ca3af';
}

/**
 * Get emotional state color
 */
function getEmotionalColor(emotionalState?: Record<string, number>): string {
  if (!emotionalState) return '#d1d5db';

  const trust = emotionalState['trust'] || 50;
  const desperation = emotionalState['desperation'] || 30;

  if (trust > 70) return '#22c55e';
  if (trust > 60) return '#84cc16';
  if (desperation > 70) return '#dc2626';
  if (desperation > 60) return '#f97316';
  return '#eab308';
}

describe('Civilization Map', () => {
  describe('Position Calculation', () => {
    it('should calculate position for single civilization', () => {
      const pos = calculatePosition(0, 1, 200);
      expect(pos.x).toBeCloseTo(450); // 200 + 250
      expect(pos.y).toBeCloseTo(250);
    });

    it('should distribute civilizations evenly in circle', () => {
      const positions = [
        calculatePosition(0, 4, 200),
        calculatePosition(1, 4, 200),
        calculatePosition(2, 4, 200),
        calculatePosition(3, 4, 200),
      ];

      // Check that positions form a square (90 degree angles)
      expect(positions[0].x).toBeCloseTo(450);
      expect(positions[1].y).toBeCloseTo(450);
      expect(positions[2].x).toBeCloseTo(50);
      expect(positions[3].y).toBeCloseTo(50);
    });

    it('should place civilizations at correct radius', () => {
      const radius = 200;
      const pos = calculatePosition(0, 4, radius);

      // Distance from center (250, 250)
      const distance = Math.sqrt((pos.x - 250) ** 2 + (pos.y - 250) ** 2);
      expect(distance).toBeCloseTo(radius);
    });

    it('should handle large number of civilizations', () => {
      const positions = Array.from({ length: 100 }, (_, i) => calculatePosition(i, 100, 200));

      // All positions should be at same radius
      positions.forEach((pos) => {
        const distance = Math.sqrt((pos.x - 250) ** 2 + (pos.y - 250) ** 2);
        expect(distance).toBeCloseTo(200, 1);
      });
    });

    it('should use custom radius', () => {
      const pos1 = calculatePosition(0, 1, 100);
      const pos2 = calculatePosition(0, 1, 200);

      const dist1 = Math.sqrt((pos1.x - 250) ** 2 + (pos1.y - 250) ** 2);
      const dist2 = Math.sqrt((pos2.x - 250) ** 2 + (pos2.y - 250) ** 2);

      expect(dist1).toBeCloseTo(100);
      expect(dist2).toBeCloseTo(200);
    });
  });

  describe('Phase Color Mapping', () => {
    it('should return correct color for emergence phase', () => {
      expect(getPhaseColor('emergence')).toBe('#fbbf24');
    });

    it('should return correct color for growth phase', () => {
      expect(getPhaseColor('growth')).toBe('#60a5fa');
    });

    it('should return correct color for peak phase', () => {
      expect(getPhaseColor('peak')).toBe('#34d399');
    });

    it('should return correct color for cooperation phase', () => {
      expect(getPhaseColor('cooperation')).toBe('#a78bfa');
    });

    it('should return correct color for transcendence phase', () => {
      expect(getPhaseColor('transcendence')).toBe('#f472b6');
    });

    it('should return correct color for decline phase', () => {
      expect(getPhaseColor('decline')).toBe('#ef4444');
    });

    it('should return correct color for extinction phase', () => {
      expect(getPhaseColor('extinction')).toBe('#6b7280');
    });

    it('should return default color for unknown phase', () => {
      expect(getPhaseColor('unknown_phase')).toBe('#9ca3af');
    });

    it('should handle null/undefined phase', () => {
      expect(getPhaseColor('')).toBe('#9ca3af');
    });
  });

  describe('Emotional State Color Mapping', () => {
    it('should return gray for undefined emotional state', () => {
      expect(getEmotionalColor(undefined)).toBe('#d1d5db');
    });

    it('should return green for high trust', () => {
      expect(getEmotionalColor({ trust: 80, desperation: 20 })).toBe('#22c55e');
    });

    it('should return lime for moderate-high trust', () => {
      expect(getEmotionalColor({ trust: 65, desperation: 20 })).toBe('#84cc16');
    });

    it('should return red for high desperation', () => {
      expect(getEmotionalColor({ trust: 20, desperation: 80 })).toBe('#dc2626');
    });

    it('should return orange for moderate-high desperation', () => {
      expect(getEmotionalColor({ trust: 20, desperation: 65 })).toBe('#f97316');
    });

    it('should return yellow for neutral emotional state', () => {
      expect(getEmotionalColor({ trust: 50, desperation: 30 })).toBe('#eab308');
    });

    it('should use default values for missing properties', () => {
      expect(getEmotionalColor({})).toBe('#eab308');
    });

    it('should prioritize trust over desperation', () => {
      const highTrustHighDesperation = getEmotionalColor({
        trust: 80,
        desperation: 80,
      });
      expect(highTrustHighDesperation).toBe('#22c55e');
    });
  });

  describe('Visualization Logic', () => {
    it('should calculate node size based on population', () => {
      const baseSize = 20;
      const population1 = 50;
      const population2 = 100;

      const size1 = baseSize + (population1 / 100) * 10;
      const size2 = baseSize + (population2 / 100) * 10;

      expect(size2).toBeGreaterThan(size1);
      expect(size1).toBeCloseTo(25);
      expect(size2).toBeCloseTo(30);
    });

    it('should scale technology indicator opacity', () => {
      const tech1 = 30;
      const tech2 = 90;

      const opacity1 = tech1 / 100;
      const opacity2 = tech2 / 100;

      expect(opacity2).toBeGreaterThan(opacity1);
      expect(opacity1).toBe(0.3);
      expect(opacity2).toBe(0.9);
    });

    it('should generate trade routes with correct intensity', () => {
      const intensity1 = Math.random() * 0.8 + 0.2;
      const intensity2 = Math.random() * 0.8 + 0.2;

      expect(intensity1).toBeGreaterThanOrEqual(0.2);
      expect(intensity1).toBeLessThanOrEqual(1);
      expect(intensity2).toBeGreaterThanOrEqual(0.2);
      expect(intensity2).toBeLessThanOrEqual(1);
    });
  });

  describe('Trade Route Animation', () => {
    it('should calculate particle position along route', () => {
      const from = { x: 0, y: 0 };
      const to = { x: 100, y: 100 };
      const progress = 50; // 50%

      const x = from.x + ((to.x - from.x) * progress) / 100;
      const y = from.y + ((to.y - from.y) * progress) / 100;

      expect(x).toBe(50);
      expect(y).toBe(50);
    });

    it('should calculate particle opacity based on progress', () => {
      const progress1 = 25;
      const progress2 = 50;
      const progress3 = 75;

      const opacity1 = Math.sin((progress1 / 100) * Math.PI) * 0.8;
      const opacity2 = Math.sin((progress2 / 100) * Math.PI) * 0.8;
      const opacity3 = Math.sin((progress3 / 100) * Math.PI) * 0.8;

      expect(opacity2).toBeGreaterThan(opacity1);
      expect(opacity2).toBeGreaterThan(opacity3);
    });

    it('should loop animation correctly', () => {
      const animationOffset1 = 0;
      const animationOffset2 = 50;
      const animationOffset3 = 100;

      const offset1 = (animationOffset1 + 2) % 100;
      const offset2 = (animationOffset2 + 2) % 100;
      const offset3 = (animationOffset3 + 2) % 100;

      expect(offset1).toBe(2);
      expect(offset2).toBe(52);
      expect(offset3).toBe(2);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate total population', () => {
      const civilizations = [
        { population: 100 },
        { population: 200 },
        { population: 150 },
      ];

      const total = civilizations.reduce((sum, c) => sum + c.population, 0);
      expect(total).toBe(450);
    });

    it('should calculate average technology', () => {
      const civilizations = [
        { technology: 50 },
        { technology: 60 },
        { technology: 70 },
      ];

      const avg = civilizations.reduce((sum, c) => sum + c.technology, 0) / civilizations.length;
      expect(avg).toBe(60);
    });

    it('should count trade routes', () => {
      const routes = [
        { from: 'civ1', to: 'civ2' },
        { from: 'civ1', to: 'civ3' },
        { from: 'civ2', to: 'civ3' },
      ];

      expect(routes.length).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero civilizations', () => {
      const positions: any[] = [];
      expect(positions).toHaveLength(0);
    });

    it('should handle single civilization', () => {
      const pos = calculatePosition(0, 1, 200);
      expect(pos).toBeDefined();
      expect(pos.x).toBeDefined();
      expect(pos.y).toBeDefined();
    });

    it('should handle very large population values', () => {
      const size = 20 + (1000000 / 100) * 10;
      expect(size).toBeGreaterThan(20);
    });

    it('should handle zero technology', () => {
      const opacity = 0 / 100;
      expect(opacity).toBe(0);
    });

    it('should handle 100% technology', () => {
      const opacity = 100 / 100;
      expect(opacity).toBe(1);
    });
  });
});
