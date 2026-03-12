/**
 * Error Handling Middleware for tRPC
 * 
 * Integrates comprehensive error handling, logging, and validation
 * into all tRPC procedures for seamless error recovery and user feedback.
 */

import { TRPCError } from "@trpc/server";
import { AppError, ErrorCode, normalizeError } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

/**
 * Generate request ID for tracking
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Error handling middleware
 */
export function createErrorMiddleware() {
  return async (opts: any) => {
    const requestId = generateRequestId();
    const startTime = performance.now();

    try {
      logger.debug(`[${opts.path}] Request started`, { path: opts.path }, requestId);
      const result = await opts.next();
      const duration = performance.now() - startTime;

      logger.info(`[${opts.path}] Request completed`, { path: opts.path, duration }, requestId);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const appError = normalizeError(error, requestId);

      logger.error(`[${opts.path}] Request failed`, appError instanceof Error ? appError : new Error(String(appError)), { path: opts.path, duration }, requestId);

      if (appError instanceof AppError) {
        throw appError.toTRPCError();
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        cause: appError,
      });
    }
  };
}

/**
 * Input validation middleware
 */
export function createValidationMiddleware() {
  return async (opts: any) => {
    const requestId = generateRequestId();

    try {
      return await opts.next();
    } catch (error) {
      if (error instanceof AppError && error.code === ErrorCode.INVALID_INPUT) {
        logger.warn(`Validation error on ${opts.path}`, { path: opts.path }, requestId);
      }
      throw error;
    }
  };
}

/**
 * Request logging middleware
 */
export function createLoggingMiddleware() {
  return async (opts: any) => {
    const requestId = generateRequestId();
    const startTime = performance.now();

    logger.debug(`Request: ${opts.path}`, { path: opts.path, input: opts.rawInput }, requestId);

    try {
      const result = await opts.next();
      const duration = performance.now() - startTime;

      logger.info(`Success: ${opts.path}`, { path: opts.path, duration }, requestId);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`Error: ${opts.path}`, error instanceof Error ? error : new Error(String(error)), {
        path: opts.path,
        duration,
      }, requestId);
      throw error;
    }
  };
}

/**
 * Performance monitoring middleware
 */
export function createPerformanceMiddleware() {
  return async (opts: any) => {
    const operationName = opts.path;

    return logger.trackOperation(operationName, () => opts.next());
  };
}

/**
 * Rate limiting middleware (basic implementation)
 */
export function createRateLimitMiddleware(maxRequestsPerMinute: number = 60) {
  const requestCounts = new Map<string, number[]>();

  return async (opts: any) => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Get or create request timestamps for this endpoint
    const key = opts.path;
    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const timestamps = requestCounts.get(key)!;

    // Remove old timestamps
    const recentTimestamps = timestamps.filter((ts) => ts > oneMinuteAgo);
    requestCounts.set(key, recentTimestamps);

    // Check rate limit
    if (recentTimestamps.length >= maxRequestsPerMinute) {
      throw new AppError(ErrorCode.RATE_LIMIT_ERROR, `Rate limit exceeded for ${key}`, {
        userMessage: "Too many requests. Please wait a moment before trying again.",
        suggestedAction: "Wait a minute and try again",
      });
    }

    // Record this request
    recentTimestamps.push(now);

    return opts.next();
  };
}

/**
 * Context enrichment middleware
 */
export function createContextMiddleware() {
  return async (opts: any) => {
    const requestId = generateRequestId();
    const userId = opts.ctx?.user?.id;

    // Enrich context with request tracking info
    opts.ctx = {
      ...opts.ctx,
      requestId,
      userId,
      startTime: Date.now(),
    };

    return opts.next();
  };
}
