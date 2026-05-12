/**
 * Event Persistence Validation Engine
 * Ensures all events persist correctly and maintain data integrity
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: Record<string, unknown>;
}

interface EventIntegrityCheck {
  eventId: string;
  causalConsistency: boolean;
  dataCompleteness: boolean;
  referentialIntegrity: boolean;
  temporalConsistency: boolean;
  errors: string[];
}

class EventValidator {
  /**
   * Validate event before persistence
   */
  validateEventBeforePersistence(event: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, unknown> = {};

    // Check required fields
    if (!event.galaxy_id) {
      errors.push('Missing required field: galaxy_id');
    }
    if (!event.civilization_id) {
      errors.push('Missing required field: civilization_id');
    }
    if (!event.event_type) {
      errors.push('Missing required field: event_type');
    }
    if (!event.description) {
      warnings.push('Missing optional field: description');
    }

    // Validate event type
    const validEventTypes = [
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

    if (event.event_type && !validEventTypes.includes(event.event_type as string)) {
      warnings.push(`Unknown event type: ${event.event_type}`);
    }

    // Validate significance score
    if (event.significance) {
      const sig = event.significance as number;
      if (sig < 0 || sig > 100) {
        errors.push(`Invalid significance score: ${sig} (must be 0-100)`);
      }
    } else {
      warnings.push('Missing significance score (will default to 50)');
    }

    // Validate timestamps
    if (event.created_at) {
      const date = new Date(event.created_at as string);
      if (isNaN(date.getTime())) {
        errors.push(`Invalid created_at timestamp: ${event.created_at}`);
      }
    } else {
      warnings.push('Missing created_at timestamp (will use current time)');
    }

    // Validate causal parent if present
    if (event.causal_parent_id && typeof event.causal_parent_id !== 'string') {
      errors.push('Invalid causal_parent_id type (must be string)');
    }

    metadata.fieldsChecked = Object.keys(event).length;
    metadata.eventType = event.event_type;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata,
    };
  }

  /**
   * Validate event after persistence
   */
  async validateEventAfterPersistence(
    eventId: string,
    originalEvent: Record<string, unknown>,
    persistedEvent: Record<string, unknown>
  ): Promise<EventIntegrityCheck> {
    const errors: string[] = [];
    let causalConsistency = true;
    let dataCompleteness = true;
    let referentialIntegrity = true;
    let temporalConsistency = true;

    // Check data completeness
    const requiredFields = ['galaxy_id', 'civilization_id', 'event_type', 'created_at'];
    for (const field of requiredFields) {
      if (!(field in persistedEvent)) {
        errors.push(`Missing persisted field: ${field}`);
        dataCompleteness = false;
      }
    }

    // Check data matches
    for (const [key, value] of Object.entries(originalEvent)) {
      if (key in persistedEvent) {
        if (JSON.stringify(persistedEvent[key]) !== JSON.stringify(value)) {
          errors.push(`Data mismatch for field ${key}: expected ${value}, got ${persistedEvent[key]}`);
          dataCompleteness = false;
        }
      }
    }

    // Validate causal consistency
    if (persistedEvent.causal_parent_id) {
      // In a real implementation, would verify parent event exists
      if (typeof persistedEvent.causal_parent_id !== 'string') {
        errors.push('Invalid causal_parent_id type after persistence');
        causalConsistency = false;
      }
    }

    // Validate temporal consistency
    if (persistedEvent.created_at && persistedEvent.updated_at) {
      const created = new Date(persistedEvent.created_at as string);
      const updated = new Date(persistedEvent.updated_at as string);
      if (updated < created) {
        errors.push('Temporal inconsistency: updated_at before created_at');
        temporalConsistency = false;
      }
    }

    // Validate referential integrity
    if (persistedEvent.civilization_id && persistedEvent.galaxy_id) {
      // In a real implementation, would verify civilization exists in galaxy
      referentialIntegrity = true;
    }

    return {
      eventId,
      causalConsistency,
      dataCompleteness,
      referentialIntegrity,
      temporalConsistency,
      errors,
    };
  }

  /**
   * Validate event deduplication
   */
  validateDeduplication(
    event: Record<string, unknown>,
    existingEvents: Record<string, unknown>[]
  ): {
    isDuplicate: boolean;
    duplicateEventId?: string;
    confidence: number;
  } {
    // Check for exact duplicates
    for (const existing of existingEvents) {
      if (
        existing.civilization_id === event.civilization_id &&
        existing.event_type === event.event_type &&
        existing.created_at === event.created_at &&
        existing.description === event.description
      ) {
        return {
          isDuplicate: true,
          duplicateEventId: existing.id as string,
          confidence: 1.0,
        };
      }
    }

    // Check for near-duplicates (same type, civilization, within 1 minute)
    const eventTime = new Date(event.created_at as string);
    for (const existing of existingEvents) {
      const existingTime = new Date(existing.created_at as string);
      const timeDiff = Math.abs(eventTime.getTime() - existingTime.getTime());

      if (
        existing.civilization_id === event.civilization_id &&
        existing.event_type === event.event_type &&
        timeDiff < 60000 // 1 minute
      ) {
        return {
          isDuplicate: true,
          duplicateEventId: existing.id as string,
          confidence: 0.7,
        };
      }
    }

    return {
      isDuplicate: false,
      confidence: 0,
    };
  }

  /**
   * Validate event cascade consistency
   */
  validateCascadeConsistency(
    event: Record<string, unknown>,
    cascadeEvents: Record<string, unknown>[]
  ): {
    isConsistent: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check that cascade events reference this event
    for (const cascadeEvent of cascadeEvents) {
      if (cascadeEvent.causal_parent_id !== event.id) {
        issues.push(`Cascade event ${cascadeEvent.id} does not reference parent event`);
      }
    }

    // Check temporal consistency of cascade
    const eventTime = new Date(event.created_at as string);
    for (const cascadeEvent of cascadeEvents) {
      const cascadeTime = new Date(cascadeEvent.created_at as string);
      if (cascadeTime < eventTime) {
        issues.push(
          `Cascade event ${cascadeEvent.id} occurs before parent event (temporal inconsistency)`
        );
      }
    }

    return {
      isConsistent: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate event batch persistence
   */
  async validateBatchPersistence(
    events: Record<string, unknown>[],
    persistedEvents: Record<string, unknown>[]
  ): Promise<{
    successCount: number;
    failureCount: number;
    validationErrors: Record<string, string[]>;
  }> {
    const validationErrors: Record<string, string[]> = {};
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < events.length; i++) {
      const originalEvent = events[i];
      const persistedEvent = persistedEvents[i];

      if (!persistedEvent) {
        failureCount++;
        validationErrors[`event_${i}`] = ['Event was not persisted'];
        continue;
      }

      const check = await this.validateEventAfterPersistence(
        persistedEvent.id as string,
        originalEvent,
        persistedEvent
      );

      if (check.errors.length === 0) {
        successCount++;
      } else {
        failureCount++;
        validationErrors[`event_${i}`] = check.errors;
      }
    }

    return {
      successCount,
      failureCount,
      validationErrors,
    };
  }

  /**
   * Generate validation report
   */
  generateValidationReport(
    checks: EventIntegrityCheck[]
  ): {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    consistencyScore: number;
    recommendations: string[];
  } {
    const totalChecks = checks.length;
    const passedChecks = checks.filter((c) => {
      return (
        c.causalConsistency &&
        c.dataCompleteness &&
        c.referentialIntegrity &&
        c.temporalConsistency
      );
    }).length;
    const failedChecks = totalChecks - passedChecks;

    const consistencyScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    const recommendations: string[] = [];

    if (consistencyScore < 90) {
      recommendations.push('Review and fix data consistency issues');
    }

    const causalFailures = checks.filter((c) => !c.causalConsistency).length;
    if (causalFailures > 0) {
      recommendations.push(`Fix ${causalFailures} causal consistency issues`);
    }

    const dataFailures = checks.filter((c) => !c.dataCompleteness).length;
    if (dataFailures > 0) {
      recommendations.push(`Verify ${dataFailures} events with incomplete data`);
    }

    const temporalFailures = checks.filter((c) => !c.temporalConsistency).length;
    if (temporalFailures > 0) {
      recommendations.push(`Review ${temporalFailures} events with temporal inconsistencies`);
    }

    return {
      totalChecks,
      passedChecks,
      failedChecks,
      consistencyScore,
      recommendations,
    };
  }
}

export const eventValidator = new EventValidator();
export type { ValidationResult, EventIntegrityCheck };
