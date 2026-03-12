/**
 * Comprehensive Error Handling Utility
 * 
 * Provides structured error handling, logging, and recovery mechanisms
 * for seamless architect interaction with minimal friction.
 */

import { TRPCError } from "@trpc/server";

export enum ErrorCode {
  // Validation errors
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",
  
  // Business logic errors
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  
  // System errors
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  
  // Agent system errors
  AGENT_NOT_INITIALIZED = "AGENT_NOT_INITIALIZED",
  AGENT_ALREADY_RUNNING = "AGENT_ALREADY_RUNNING",
  TASK_QUEUE_FULL = "TASK_QUEUE_FULL",
  WORKFLOW_EXECUTION_FAILED = "WORKFLOW_EXECUTION_FAILED",
  
  // Unknown error
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface ErrorContext {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  userMessage?: string;
  suggestedAction?: string;
  timestamp: Date;
  requestId?: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details: Record<string, any>;
  public readonly userMessage: string;
  public readonly suggestedAction?: string;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, any>;
      userMessage?: string;
      suggestedAction?: string;
      requestId?: string;
    }
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = options?.details || {};
    this.userMessage = options?.userMessage || this.getDefaultUserMessage(code);
    this.suggestedAction = options?.suggestedAction;
    this.timestamp = new Date();
    this.requestId = options?.requestId;

    Object.setPrototypeOf(this, AppError.prototype);
  }

  private getDefaultUserMessage(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.INVALID_INPUT]: "The provided input is invalid. Please check your data and try again.",
      [ErrorCode.MISSING_REQUIRED_FIELD]: "A required field is missing. Please provide all required information.",
      [ErrorCode.CONSTRAINT_VIOLATION]: "The operation violates a system constraint. Please adjust your input.",
      [ErrorCode.RESOURCE_NOT_FOUND]: "The requested resource was not found.",
      [ErrorCode.RESOURCE_ALREADY_EXISTS]: "A resource with this identifier already exists.",
      [ErrorCode.OPERATION_NOT_ALLOWED]: "This operation is not allowed in the current state.",
      [ErrorCode.INSUFFICIENT_PERMISSIONS]: "You do not have permission to perform this action.",
      [ErrorCode.DATABASE_ERROR]: "A database error occurred. Please try again later.",
      [ErrorCode.EXTERNAL_SERVICE_ERROR]: "An external service is currently unavailable. Please try again later.",
      [ErrorCode.TIMEOUT_ERROR]: "The operation took too long. Please try again.",
      [ErrorCode.RATE_LIMIT_ERROR]: "Too many requests. Please wait before trying again.",
      [ErrorCode.AGENT_NOT_INITIALIZED]: "The agent system is not initialized. Please initialize it first.",
      [ErrorCode.AGENT_ALREADY_RUNNING]: "The agent is already running. Stop it before starting again.",
      [ErrorCode.TASK_QUEUE_FULL]: "The task queue is full. Please wait for some tasks to complete.",
      [ErrorCode.WORKFLOW_EXECUTION_FAILED]: "The workflow execution failed. Please check the logs for details.",
      [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again or contact support.",
    };

    return messages[code] || "An error occurred. Please try again.";
  }

  toContext(): ErrorContext {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      userMessage: this.userMessage,
      suggestedAction: this.suggestedAction,
      timestamp: this.timestamp,
      requestId: this.requestId,
    };
  }

  toTRPCError(): TRPCError {
    const codeMap: Record<ErrorCode, "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR" | "FORBIDDEN" | "CONFLICT"> = {
      [ErrorCode.INVALID_INPUT]: "BAD_REQUEST",
      [ErrorCode.MISSING_REQUIRED_FIELD]: "BAD_REQUEST",
      [ErrorCode.CONSTRAINT_VIOLATION]: "BAD_REQUEST",
      [ErrorCode.RESOURCE_NOT_FOUND]: "NOT_FOUND",
      [ErrorCode.RESOURCE_ALREADY_EXISTS]: "CONFLICT",
      [ErrorCode.OPERATION_NOT_ALLOWED]: "BAD_REQUEST",
      [ErrorCode.INSUFFICIENT_PERMISSIONS]: "FORBIDDEN",
      [ErrorCode.DATABASE_ERROR]: "INTERNAL_SERVER_ERROR",
      [ErrorCode.EXTERNAL_SERVICE_ERROR]: "INTERNAL_SERVER_ERROR",
      [ErrorCode.TIMEOUT_ERROR]: "INTERNAL_SERVER_ERROR",
      [ErrorCode.RATE_LIMIT_ERROR]: "BAD_REQUEST",
      [ErrorCode.AGENT_NOT_INITIALIZED]: "BAD_REQUEST",
      [ErrorCode.AGENT_ALREADY_RUNNING]: "BAD_REQUEST",
      [ErrorCode.TASK_QUEUE_FULL]: "BAD_REQUEST",
      [ErrorCode.WORKFLOW_EXECUTION_FAILED]: "INTERNAL_SERVER_ERROR",
      [ErrorCode.UNKNOWN_ERROR]: "INTERNAL_SERVER_ERROR",
    };

    return new TRPCError({
      code: codeMap[this.code],
      message: this.userMessage,
      cause: this,
    });
  }
}

/**
 * Safe execution wrapper with error handling
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context: {
    operation: string;
    requestId?: string;
    onError?: (error: AppError) => void;
  }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const appError = normalizeError(error, context.requestId);
    context.onError?.(appError);
    throw appError;
  }
}

/**
 * Normalize any error to AppError
 */
export function normalizeError(error: unknown, requestId?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, {
      details: { originalError: error.name },
      requestId,
    });
  }

  return new AppError(ErrorCode.UNKNOWN_ERROR, String(error), {
    requestId,
  });
}

/**
 * Validation helper with detailed error messages
 */
export function validateRequired(
  value: any,
  fieldName: string,
  requestId?: string
): void {
  if (value === null || value === undefined || value === "") {
    throw new AppError(ErrorCode.MISSING_REQUIRED_FIELD, `Missing required field: ${fieldName}`, {
      details: { fieldName },
      userMessage: `Please provide a value for ${fieldName}.`,
      requestId,
    });
  }
}

/**
 * Validation helper for numeric ranges
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string,
  requestId?: string
): void {
  if (value < min || value > max) {
    throw new AppError(ErrorCode.INVALID_INPUT, `${fieldName} must be between ${min} and ${max}`, {
      details: { fieldName, value, min, max },
      userMessage: `${fieldName} must be between ${min} and ${max}. You provided ${value}.`,
      requestId,
    });
  }
}

/**
 * Validation helper for string patterns
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName: string,
  patternDescription: string,
  requestId?: string
): void {
  if (!pattern.test(value)) {
    throw new AppError(ErrorCode.INVALID_INPUT, `${fieldName} does not match required pattern`, {
      details: { fieldName, pattern: pattern.source },
      userMessage: `${fieldName} must ${patternDescription}.`,
      requestId,
    });
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 100;
  const maxDelayMs = options.maxDelayMs ?? 10000;
  const backoffMultiplier = options.backoffMultiplier ?? 2;

  let lastError: Error | null = null;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (
        attempt === maxRetries ||
        (options.shouldRetry && !options.shouldRetry(lastError))
      ) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Timeout wrapper
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
            new AppError(ErrorCode.TIMEOUT_ERROR, `${operationName} timed out after ${timeoutMs}ms`, {
              details: { operationName, timeoutMs },
              userMessage: `The operation took too long. Please try again.`,
            })
          ),
        timeoutMs
      )
    ),
  ]);
}
