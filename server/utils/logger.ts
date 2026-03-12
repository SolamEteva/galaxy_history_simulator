/**
 * Comprehensive Logging and Observability Utility
 * 
 * Provides structured logging, request tracking, and performance monitoring
 * for debugging and understanding system behavior.
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface PerformanceMetrics {
  operationName: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000;
  private performanceMetrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 5000;
  private minLogLevel: LogLevel = LogLevel.DEBUG;

  /**
   * Set minimum log level
   */
  setMinLogLevel(level: LogLevel): void {
    this.minLogLevel = level;
  }

  /**
   * Check if log should be recorded based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    const minIndex = levels.indexOf(this.minLogLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  /**
   * Log message with context
   */
  log(
    level: LogLevel,
    message: string,
    options?: {
      context?: Record<string, any>;
      requestId?: string;
      userId?: number;
      error?: Error;
    }
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: options?.context,
      requestId: options?.requestId,
      userId: options?.userId,
      error: options?.error
        ? {
            name: options.error.name,
            message: options.error.message,
            stack: options.error.stack,
          }
        : undefined,
    };

    this.logs.push(entry);

    // Maintain max log size
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    this.printLog(entry);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.DEBUG, message, { context, requestId });
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.INFO, message, { context, requestId });
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.WARN, message, { context, requestId });
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.ERROR, message, { context, requestId, error });
  }

  /**
   * Log critical error
   */
  critical(message: string, error?: Error, context?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.CRITICAL, message, { context, requestId, error });
  }

  /**
   * Track operation performance
   */
  trackOperation<T>(
    operationName: string,
    fn: () => T | Promise<T>,
    requestId?: string
  ): T | Promise<T> {
    const startTime = performance.now();

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result
          .then((value) => {
            this.recordMetric(operationName, startTime, true);
            return value;
          })
          .catch((error) => {
            this.recordMetric(operationName, startTime, false, error);
            throw error;
          });
      }

      this.recordMetric(operationName, startTime, true);
      return result;
    } catch (error) {
      this.recordMetric(operationName, startTime, false, error);
      throw error;
    }
  }

  /**
   * Record performance metric
   */
  private recordMetric(
    operationName: string,
    startTime: number,
    success: boolean,
    error?: any
  ): void {
    const endTime = performance.now();
    const metric: PerformanceMetrics = {
      operationName,
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      error: error ? String(error) : undefined,
    };

    this.performanceMetrics.push(metric);

    // Maintain max metrics size
    if (this.performanceMetrics.length > this.maxMetrics) {
      this.performanceMetrics.shift();
    }

    // Log slow operations
    if (metric.duration > 1000) {
      this.warn(`Slow operation: ${operationName} took ${metric.duration.toFixed(2)}ms`, {
        duration: metric.duration,
      });
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel, limit: number = 100): LogEntry[] {
    return this.logs.filter((log) => log.level === level).slice(-limit);
  }

  /**
   * Get logs by request ID
   */
  getLogsByRequestId(requestId: string): LogEntry[] {
    return this.logs.filter((log) => log.requestId === requestId);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.performanceMetrics.slice(-limit);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, { avgDuration: number; count: number; failureRate: number }> {
    const summary: Record<string, { avgDuration: number; count: number; failureRate: number }> = {};

    for (const metric of this.performanceMetrics) {
      if (!summary[metric.operationName]) {
        summary[metric.operationName] = {
          avgDuration: 0,
          count: 0,
          failureRate: 0,
        };
      }

      const stats = summary[metric.operationName];
      stats.count++;
      stats.avgDuration = (stats.avgDuration * (stats.count - 1) + metric.duration) / stats.count;

      if (!metric.success) {
        stats.failureRate = (stats.failureRate * (stats.count - 1) + 1) / stats.count;
      }
    }

    return summary;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.performanceMetrics = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Print log to console with formatting
   */
  private printLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level}]`;

    let message = `${prefix} ${entry.message}`;

    if (entry.requestId) {
      message += ` (req: ${entry.requestId})`;
    }

    if (entry.context) {
      message += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      message += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\n  Stack: ${entry.error.stack}`;
      }
    }

    const consoleMethod = this.getConsoleMethod(entry.level);
    consoleMethod(message);
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.log;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      case LogLevel.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }
}

// Export singleton instance
export const logger = new Logger();
