/**
 * Comprehensive Error Handling and Validation Framework
 * Provides structured error types, validation utilities, and recovery mechanisms
 */

export enum ErrorSeverity {
  LOW = "low", // Non-critical, can be ignored
  MEDIUM = "medium", // Important but can be recovered
  HIGH = "high", // Critical, affects core functionality
  CRITICAL = "critical", // Fatal, stops execution
}

export enum ErrorCategory {
  VALIDATION = "validation",
  DATABASE = "database",
  LLM = "llm",
  TIMEOUT = "timeout",
  RESOURCE = "resource",
  UNKNOWN = "unknown",
}

export class SimulationError extends Error {
  constructor(
    public category: ErrorCategory,
    public severity: ErrorSeverity,
    public message: string,
    public context?: Record<string, any>,
    public originalError?: Error
  ) {
    super(message);
    this.name = "SimulationError";
  }

  toJSON() {
    return {
      name: this.name,
      category: this.category,
      severity: this.severity,
      message: this.message,
      context: this.context,
      originalMessage: this.originalError?.message,
    };
  }
}

/**
 * Validation utilities
 */
export class Validator {
  static validateGalaxyConfig(config: any): void {
    if (!config.galaxyName || typeof config.galaxyName !== "string") {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        "Galaxy name is required and must be a string",
        { provided: config.galaxyName }
      );
    }

    if (!Number.isInteger(config.speciesCount) || config.speciesCount < 1 || config.speciesCount > 8) {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        "Species count must be an integer between 1 and 8",
        { provided: config.speciesCount }
      );
    }

    if (!Number.isInteger(config.totalYears) || config.totalYears < 1000 || config.totalYears > 1000000) {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        "Total years must be an integer between 1000 and 1000000",
        { provided: config.totalYears }
      );
    }

    if (config.userId && !Number.isInteger(config.userId)) {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        "User ID must be an integer",
        { provided: config.userId }
      );
    }
  }

  static validateSpeciesData(species: any): void {
    if (!species.name || typeof species.name !== "string") {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        "Species name is required",
        { species }
      );
    }

    if (!species.speciesType || typeof species.speciesType !== "string") {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        "Species type is required",
        { species }
      );
    }

    // Validate color field length (max 7 chars for hex color)
    if (species.color && species.color.length > 7) {
      species.color = species.color.substring(0, 7);
      console.warn(`[Validator] Truncated color for ${species.name} to fit database constraint`);
    }
  }

  static validateEventData(event: any): void {
    if (!event.title || typeof event.title !== "string") {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        "Event title is required",
        { event }
      );
    }

    if (!event.eventType || typeof event.eventType !== "string") {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        "Event type is required",
        { event }
      );
    }

    if (!Number.isInteger(event.year) || event.year < 0) {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        "Event year must be a non-negative integer",
        { event }
      );
    }

    if (!Number.isInteger(event.importance) || event.importance < 0 || event.importance > 10) {
      throw new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        "Event importance must be an integer between 0 and 10",
        { event }
      );
    }
  }

  static validateLLMResponse(response: any): void {
    if (!response || !response.choices || !Array.isArray(response.choices)) {
      throw new SimulationError(
        ErrorCategory.LLM,
        ErrorSeverity.HIGH,
        "Invalid LLM response structure",
        { response }
      );
    }

    if (response.choices.length === 0) {
      throw new SimulationError(
        ErrorCategory.LLM,
        ErrorSeverity.HIGH,
        "LLM returned no choices",
        { response }
      );
    }

    const choice = response.choices[0];
    if (!choice.message || !choice.message.content) {
      throw new SimulationError(
        ErrorCategory.LLM,
        ErrorSeverity.HIGH,
        "LLM response missing message content",
        { choice }
      );
    }
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(backoffMultiplier, attempt);
        console.warn(
          `[Retry] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`,
          lastError.message
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new SimulationError(
    ErrorCategory.UNKNOWN,
    ErrorSeverity.HIGH,
    `Operation failed after ${maxRetries} attempts`,
    { attempts: maxRetries },
    lastError || undefined
  );
}

/**
 * Timeout wrapper for async operations
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
        () =>
          reject(
            new SimulationError(
              ErrorCategory.TIMEOUT,
              ErrorSeverity.HIGH,
              `Operation "${operationName}" timed out after ${timeoutMs}ms`,
              { operationName, timeoutMs }
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Safe JSON parsing with error context
 */
export function safeJsonParse<T>(jsonString: string, context: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new SimulationError(
      ErrorCategory.VALIDATION,
      ErrorSeverity.MEDIUM,
      `Failed to parse JSON in context: ${context}`,
      { context, jsonString: jsonString.substring(0, 200) },
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Error logger with structured output
 */
export class ErrorLogger {
  static log(error: SimulationError, context: string = ""): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : "";

    console.error(
      `[${timestamp}] [${error.severity.toUpperCase()}] ${error.category}${contextStr}: ${error.message}`
    );

    if (error.context) {
      console.error(`  Context:`, JSON.stringify(error.context, null, 2));
    }

    if (error.originalError) {
      console.error(`  Original Error:`, error.originalError.message);
    }
  }

  static logUnknown(error: unknown, context: string = ""): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : "";

    if (error instanceof SimulationError) {
      this.log(error, context);
    } else if (error instanceof Error) {
      console.error(`[${timestamp}] [ERROR]${contextStr}: ${error.message}`);
      console.error(`  Stack:`, error.stack);
    } else {
      console.error(`[${timestamp}] [ERROR]${contextStr}:`, error);
    }
  }
}

/**
 * Result type for operations that may fail
 */
export type Result<T, E = SimulationError> = { ok: true; value: T } | { ok: false; error: E };

export function Ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function Err<E = SimulationError>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Safe operation wrapper
 */
export async function safeOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  timeoutMs: number = 30000
): Promise<Result<T>> {
  try {
    const result = await withTimeout(operation(), timeoutMs, operationName);
    return Ok(result);
  } catch (error) {
    if (error instanceof SimulationError) {
      ErrorLogger.log(error, operationName);
      return Err(error);
    } else {
      const simError = new SimulationError(
        ErrorCategory.UNKNOWN,
        ErrorSeverity.HIGH,
        `Unexpected error in ${operationName}`,
        { operationName },
        error instanceof Error ? error : undefined
      );
      ErrorLogger.log(simError, operationName);
      return Err(simError);
    }
  }
}
