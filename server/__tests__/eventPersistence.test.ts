import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eventValidator, type ValidationResult, type EventIntegrityCheck } from '../engines/eventValidator';

/**
 * Event Persistence Validation Test Suite
 * Comprehensive tests for event persistence, integrity, and consistency
 */

describe('Event Persistence Validation', () => {
  describe('Event Validation Before Persistence', () => {
    it('should validate complete event with all required fields', () => {
      const event = {
        galaxy_id: 'galaxy_123',
        civilization_id: 'civ_456',
        event_type: 'war',
        description: 'Great War of the North',
        significance: 85,
        created_at: new Date().toISOString(),
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject event missing required galaxy_id', () => {
      const event = {
        civilization_id: 'civ_456',
        event_type: 'war',
        description: 'Great War',
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: galaxy_id');
    });

    it('should reject event missing required civilization_id', () => {
      const event = {
        galaxy_id: 'galaxy_123',
        event_type: 'war',
        description: 'Great War',
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: civilization_id');
    });

    it('should reject event missing required event_type', () => {
      const event = {
        galaxy_id: 'galaxy_123',
        civilization_id: 'civ_456',
        description: 'Great War',
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: event_type');
    });

    it('should warn on missing optional description field', () => {
      const event = {
        galaxy_id: 'galaxy_123',
        civilization_id: 'civ_456',
        event_type: 'war',
        significance: 75,
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Missing optional field: description');
    });

    it('should reject invalid significance score (negative)', () => {
      const event = {
        galaxy_id: 'galaxy_123',
        civilization_id: 'civ_456',
        event_type: 'war',
        significance: -10,
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid significance score'))).toBe(true);
    });

    it('should reject invalid significance score (too high)', () => {
      const event = {
        galaxy_id: 'galaxy_123',
        civilization_id: 'civ_456',
        event_type: 'war',
        significance: 150,
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid significance score'))).toBe(true);
    });

    it('should accept valid significance scores (0-100)', () => {
      for (const sig of [0, 25, 50, 75, 100]) {
        const event = {
          galaxy_id: 'galaxy_123',
          civilization_id: 'civ_456',
          event_type: 'war',
          significance: sig,
        };

        const result = eventValidator.validateEventBeforePersistence(event);

        expect(result.isValid).toBe(true);
      }
    });

    it('should reject invalid timestamp format', () => {
      const event = {
        galaxy_id: 'galaxy_123',
        civilization_id: 'civ_456',
        event_type: 'war',
        created_at: 'invalid-date',
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid created_at timestamp'))).toBe(true);
    });

    it('should accept valid event types', () => {
      const validTypes = [
        'birth',
        'death',
        'discovery',
        'war',
        'alliance',
        'trade',
        'cultural_shift',
        'technological_advancement',
        'natural_disaster',
        'migration',
        'conflict',
        'peace',
        'economic_crisis',
        'cultural_renaissance',
      ];

      for (const eventType of validTypes) {
        const event = {
          galaxy_id: 'galaxy_123',
          civilization_id: 'civ_456',
          event_type: eventType,
        };

        const result = eventValidator.validateEventBeforePersistence(event);

        expect(result.isValid).toBe(true);
      }
    });

    it('should warn on unknown event type', () => {
      const event = {
        galaxy_id: 'galaxy_123',
        civilization_id: 'civ_456',
        event_type: 'unknown_type',
      };

      const result = eventValidator.validateEventBeforePersistence(event);

      expect(result.warnings.some((w) => w.includes('Unknown event type'))).toBe(true);
    });
  });

  describe('Event Deduplication', () => {
    it('should detect exact duplicates', () => {
      const event = {
        id: 'event_1',
        civilization_id: 'civ_123',
        event_type: 'war',
        created_at: '2026-01-01T00:00:00Z',
        description: 'Great War',
      };

      const existingEvents = [event];

      const result = eventValidator.validateDeduplication(event, existingEvents);

      expect(result.isDuplicate).toBe(true);
      expect(result.confidence).toBe(1.0);
    });

    it('should detect near-duplicates within 1 minute', () => {
      const baseTime = new Date('2026-01-01T00:00:00Z');
      const event = {
        civilization_id: 'civ_123',
        event_type: 'war',
        created_at: new Date(baseTime.getTime() + 30000).toISOString(), // 30 seconds later
        description: 'Great War',
      };

      const existingEvents = [
        {
          id: 'event_1',
          civilization_id: 'civ_123',
          event_type: 'war',
          created_at: baseTime.toISOString(),
          description: 'Different description',
        },
      ];

      const result = eventValidator.validateDeduplication(event, existingEvents);

      expect(result.isDuplicate).toBe(true);
      expect(result.confidence).toBe(0.7);
    });

    it('should not detect duplicates for different civilizations', () => {
      const event = {
        civilization_id: 'civ_123',
        event_type: 'war',
        created_at: '2026-01-01T00:00:00Z',
        description: 'Great War',
      };

      const existingEvents = [
        {
          id: 'event_1',
          civilization_id: 'civ_456',
          event_type: 'war',
          created_at: '2026-01-01T00:00:00Z',
          description: 'Great War',
        },
      ];

      const result = eventValidator.validateDeduplication(event, existingEvents);

      expect(result.isDuplicate).toBe(false);
    });

    it('should not detect duplicates for different event types', () => {
      const event = {
        civilization_id: 'civ_123',
        event_type: 'war',
        created_at: '2026-01-01T00:00:00Z',
        description: 'Great War',
      };

      const existingEvents = [
        {
          id: 'event_1',
          civilization_id: 'civ_123',
          event_type: 'peace',
          created_at: '2026-01-01T00:00:00Z',
          description: 'Great War',
        },
      ];

      const result = eventValidator.validateDeduplication(event, existingEvents);

      expect(result.isDuplicate).toBe(false);
    });

    it('should not detect duplicates outside 1 minute window', () => {
      const baseTime = new Date('2026-01-01T00:00:00Z');
      const event = {
        civilization_id: 'civ_123',
        event_type: 'war',
        created_at: new Date(baseTime.getTime() + 120000).toISOString(), // 2 minutes later
        description: 'Great War',
      };

      const existingEvents = [
        {
          id: 'event_1',
          civilization_id: 'civ_123',
          event_type: 'war',
          created_at: baseTime.toISOString(),
          description: 'Great War',
        },
      ];

      const result = eventValidator.validateDeduplication(event, existingEvents);

      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('Cascade Consistency', () => {
    it('should validate consistent cascade', () => {
      const parentEvent = {
        id: 'event_1',
        created_at: '2026-01-01T00:00:00Z',
      };

      const cascadeEvents = [
        {
          id: 'event_2',
          causal_parent_id: 'event_1',
          created_at: '2026-01-01T01:00:00Z',
        },
        {
          id: 'event_3',
          causal_parent_id: 'event_1',
          created_at: '2026-01-01T02:00:00Z',
        },
      ];

      const result = eventValidator.validateCascadeConsistency(parentEvent, cascadeEvents);

      expect(result.isConsistent).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect cascade events with incorrect parent reference', () => {
      const parentEvent = {
        id: 'event_1',
        created_at: '2026-01-01T00:00:00Z',
      };

      const cascadeEvents = [
        {
          id: 'event_2',
          causal_parent_id: 'event_999',
          created_at: '2026-01-01T01:00:00Z',
        },
      ];

      const result = eventValidator.validateCascadeConsistency(parentEvent, cascadeEvents);

      expect(result.isConsistent).toBe(false);
      expect(result.issues.some((i) => i.includes('does not reference parent event'))).toBe(true);
    });

    it('should detect temporal inconsistency in cascade', () => {
      const parentEvent = {
        id: 'event_1',
        created_at: '2026-01-01T00:00:00Z',
      };

      const cascadeEvents = [
        {
          id: 'event_2',
          causal_parent_id: 'event_1',
          created_at: '2025-12-31T23:00:00Z', // Before parent
        },
      ];

      const result = eventValidator.validateCascadeConsistency(parentEvent, cascadeEvents);

      expect(result.isConsistent).toBe(false);
      expect(result.issues.some((i) => i.includes('temporal inconsistency'))).toBe(true);
    });
  });

  describe('Validation Report Generation', () => {
    it('should generate perfect score for all passing checks', () => {
      const checks: EventIntegrityCheck[] = [
        {
          eventId: 'event_1',
          causalConsistency: true,
          dataCompleteness: true,
          referentialIntegrity: true,
          temporalConsistency: true,
          errors: [],
        },
        {
          eventId: 'event_2',
          causalConsistency: true,
          dataCompleteness: true,
          referentialIntegrity: true,
          temporalConsistency: true,
          errors: [],
        },
      ];

      const report = eventValidator.generateValidationReport(checks);

      expect(report.totalChecks).toBe(2);
      expect(report.passedChecks).toBe(2);
      expect(report.failedChecks).toBe(0);
      expect(report.consistencyScore).toBe(100);
    });

    it('should generate report for partial failures', () => {
      const checks: EventIntegrityCheck[] = [
        {
          eventId: 'event_1',
          causalConsistency: true,
          dataCompleteness: true,
          referentialIntegrity: true,
          temporalConsistency: true,
          errors: [],
        },
        {
          eventId: 'event_2',
          causalConsistency: false,
          dataCompleteness: true,
          referentialIntegrity: true,
          temporalConsistency: true,
          errors: ['Causal consistency failed'],
        },
      ];

      const report = eventValidator.generateValidationReport(checks);

      expect(report.totalChecks).toBe(2);
      expect(report.passedChecks).toBe(1);
      expect(report.failedChecks).toBe(1);
      expect(report.consistencyScore).toBe(50);
    });

    it('should generate recommendations for low consistency', () => {
      const checks: EventIntegrityCheck[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          eventId: `event_${i}`,
          causalConsistency: i < 8,
          dataCompleteness: true,
          referentialIntegrity: true,
          temporalConsistency: true,
          errors: i < 8 ? [] : ['Causal consistency failed'],
        }));

      const report = eventValidator.generateValidationReport(checks);

      expect(report.consistencyScore).toBe(80);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Batch Persistence Validation', () => {
    it('should validate successful batch persistence', async () => {
      const now = new Date().toISOString();
      const events = [
        {
          id: 'event_1',
          galaxy_id: 'galaxy_1',
          civilization_id: 'civ_1',
          event_type: 'war',
          created_at: now,
        },
        {
          id: 'event_2',
          galaxy_id: 'galaxy_1',
          civilization_id: 'civ_2',
          event_type: 'peace',
          created_at: now,
        },
      ];

      const persistedEvents = [
        {
          id: 'event_1',
          galaxy_id: 'galaxy_1',
          civilization_id: 'civ_1',
          event_type: 'war',
          created_at: now,
        },
        {
          id: 'event_2',
          galaxy_id: 'galaxy_1',
          civilization_id: 'civ_2',
          event_type: 'peace',
          created_at: now,
        },
      ];

      const result = await eventValidator.validateBatchPersistence(events, persistedEvents);

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });

    it('should detect missing persisted events', async () => {
      const now = new Date().toISOString();
      const events = [
        {
          id: 'event_1',
          galaxy_id: 'galaxy_1',
          civilization_id: 'civ_1',
          event_type: 'war',
          created_at: now,
        },
        {
          id: 'event_2',
          galaxy_id: 'galaxy_1',
          civilization_id: 'civ_2',
          event_type: 'peace',
          created_at: now,
        },
      ];

      const persistedEvents = [
        {
          id: 'event_1',
          galaxy_id: 'galaxy_1',
          civilization_id: 'civ_1',
          event_type: 'war',
          created_at: now,
        },
        // Second event missing
      ];

      const result = await eventValidator.validateBatchPersistence(events, persistedEvents);

      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
      expect(result.validationErrors.event_1).toBeDefined();
    });
  });
});
