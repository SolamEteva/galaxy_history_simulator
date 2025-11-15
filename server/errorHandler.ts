/**
 * Comprehensive Error Handling and Logging System
 * Provides structured error handling, validation, and logging for the simulation engine
 */

import { getDb } from "./db";
import { simulationLogs } from "../drizzle/schema";

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Custom error class for simulation errors
 */
export class SimulationError extends Error {
  constructor(
    public code: string,
    message: string,
    public severity: ErrorSeverity = ErrorSeverity.ERROR,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = "SimulationError";
  }
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Error logger class
 */
export class ErrorLogger {
  private static instance: ErrorLogger;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log error to database and console
   */
  async logError(
    galaxyId: number,
    severity: ErrorSeverity,
    message: string,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      const db = await getDb();
      if (db) {
        await db.insert(simulationLogs).values({
          galaxyId,
          year: 0,
          logType: "error",
          message: message.substring(0, 1000),
          metadata: context || {},
          createdAt: new Date(),
        });
      }

      // Always log to console
      const timestamp = new Date().toISOString();
      const logLevel = severity.toUpperCase();
      console.log(`[${timestamp}] [${logLevel}] [Galaxy ${galaxyId}] ${message}`);
      if (context) {
        console.log("Context:", context);
      }
    } catch (error) {
      // Fallback to console if database logging fails
      console.error("Failed to log error to database:", error);
      console.error("Original error:", message, context);
    }
  }

  /**
   * Log simulation milestone
   */
  async logMilestone(
    galaxyId: number,
    year: number,
    message: string,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      const db = await getDb();
      if (db) {
        await db.insert(simulationLogs).values({
          galaxyId,
          year,
          logType: "milestone",
          message: message.substring(0, 1000),
          metadata: context || {},
          createdAt: new Date(),
        });
      }

      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [MILESTONE] [Galaxy ${galaxyId}, Year ${year}] ${message}`);
    } catch (error) {
      console.error("Failed to log milestone:", error);
    }
  }

  /**
   * Log event generation
   */
  async logEventGeneration(
    galaxyId: number,
    year: number,
    eventTitle: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    try {
      const db = await getDb();
      if (db) {
        await db.insert(simulationLogs).values({
          galaxyId,
          year,
          logType: "event-generated",
          message: `${success ? "✓" : "✗"} ${eventTitle}${error ? `: ${error}` : ""}`.substring(0, 1000),
          metadata: { success, eventTitle, error },
          createdAt: new Date(),
        });
      }

      const timestamp = new Date().toISOString();
      const status = success ? "✓" : "✗";
      console.log(
        `[${timestamp}] [EVENT] ${status} [Galaxy ${galaxyId}, Year ${year}] ${eventTitle}`
      );
      if (error) {
        console.log(`  Error: ${error}`);
      }
    } catch (error) {
      console.error("Failed to log event generation:", error);
    }
  }
}

/**
 * Validation utilities
 */
export class Validator {
  /**
   * Validate species profile
   */
  static validateSpeciesProfile(species: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!species.name || species.name.trim().length === 0) {
      errors.push("Species name is required");
    }

    if (!species.physiology || !species.physiology.baseForm) {
      errors.push("Species physiology base form is required");
    }

    if (!species.environment) {
      errors.push("Species environment is required");
    }

    if (!species.traits || !Array.isArray(species.traits) || species.traits.length === 0) {
      warnings.push("Species should have at least one trait");
    }

    if (species.traits && species.traits.length > 10) {
      warnings.push("Species has many traits - may be overly complex");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate galaxy parameters
   */
  static validateGalaxyParameters(params: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!params.name || params.name.trim().length === 0) {
      errors.push("Galaxy name is required");
    }

    if (!params.speciesCount || params.speciesCount < 1 || params.speciesCount > 8) {
      errors.push("Species count must be between 1 and 8");
    }

    if (!params.simulationYears || params.simulationYears < 1000) {
      errors.push("Simulation must be at least 1000 years");
    }

    if (params.simulationYears > 1000000) {
      warnings.push("Very long simulations may take significant time to generate");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate event data
   */
  static validateEvent(event: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!event.title || event.title.trim().length === 0) {
      errors.push("Event title is required");
    }

    if (!event.description || event.description.trim().length === 0) {
      errors.push("Event description is required");
    }

    if (event.year === undefined || event.year === null) {
      errors.push("Event year is required");
    }

    if (event.importance === undefined || event.importance < 0 || event.importance > 10) {
      errors.push("Event importance must be between 0 and 10");
    }

    if (!event.speciesIds || !Array.isArray(event.speciesIds) || event.speciesIds.length === 0) {
      warnings.push("Event should involve at least one species");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Safe wrapper for async operations with error handling
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  operationName: string,
  galaxyId?: number,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const logger = ErrorLogger.getInstance();
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    if (galaxyId) {
      await logger.logError(
        galaxyId,
        ErrorSeverity.ERROR,
        `${operationName} failed: ${message}`,
        { stack, error: String(error) }
      );
    } else {
      console.error(`[ERROR] ${operationName} failed:`, error);
    }

    return fallbackValue;
  }
}

/**
 * Timeout wrapper for operations that might hang
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new SimulationError(
          "TIMEOUT",
          `${operationName} exceeded timeout of ${timeoutMs}ms`,
          ErrorSeverity.ERROR
        )),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Retry wrapper for flaky operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${maxRetries}] ${operationName}`);
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[Attempt ${attempt} failed] ${operationName}: ${lastError.message}`);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw new SimulationError(
    "RETRY_EXHAUSTED",
    `${operationName} failed after ${maxRetries} attempts: ${lastError?.message}`,
    ErrorSeverity.ERROR
  );
}

/**
 * Batch operation with error handling
 */
export async function executeBatch<T, R>(
  items: T[],
  operation: (item: T, index: number) => Promise<R>,
  operationName: string,
  batchSize: number = 10
): Promise<{ results: R[]; errors: Array<{ index: number; error: string }> }> {
  const results: R[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const promises = batch.map(async (item, batchIndex) => {
      const globalIndex = i + batchIndex;
      try {
        const result = await operation(item, globalIndex);
        results[globalIndex] = result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({ index: globalIndex, error: errorMessage });
        console.error(`[Batch ${operationName}] Item ${globalIndex} failed: ${errorMessage}`);
      }
    });

    await Promise.all(promises);
  }

  return { results, errors };
}

/**
 * Export singleton instance
 */
export const errorLogger = ErrorLogger.getInstance();
