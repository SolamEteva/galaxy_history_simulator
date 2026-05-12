import { performance } from 'perf_hooks';

/**
 * Database Performance Monitoring
 * Tracks query performance, connection pool health, and identifies optimization opportunities
 */

interface QueryMetric {
  query: string;
  duration: number;
  timestamp: Date;
  rows: number;
  success: boolean;
  error?: string;
}

interface ConnectionPoolMetric {
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  timestamp: Date;
}

interface PerformanceAlert {
  type: 'slow_query' | 'connection_pool_exhaustion' | 'high_memory' | 'index_missing';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

class DatabaseMonitor {
  private queryMetrics: QueryMetric[] = [];
  private connectionMetrics: ConnectionPoolMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private slowQueryThreshold = 100; // milliseconds
  private maxMetricsRetention = 10000; // Keep last 10k metrics

  /**
   * Record a query execution
   */
  recordQuery(
    query: string,
    duration: number,
    rows: number,
    success: boolean,
    error?: string
  ): void {
    const metric: QueryMetric = {
      query,
      duration,
      timestamp: new Date(),
      rows,
      success,
      error,
    };

    this.queryMetrics.push(metric);

    // Trim old metrics if exceeding retention limit
    if (this.queryMetrics.length > this.maxMetricsRetention) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsRetention);
    }

    // Check for slow queries
    if (duration > this.slowQueryThreshold) {
      this.addAlert({
        type: 'slow_query',
        severity: duration > 500 ? 'critical' : 'warning',
        message: `Slow query detected: ${duration}ms for "${query.substring(0, 50)}..."`,
        timestamp: new Date(),
        metadata: { duration, query, rows },
      });
    }
  }

  /**
   * Record connection pool metrics
   */
  recordConnectionPool(
    activeConnections: number,
    idleConnections: number,
    waitingRequests: number
  ): void {
    const metric: ConnectionPoolMetric = {
      activeConnections,
      idleConnections,
      waitingRequests,
      timestamp: new Date(),
    };

    this.connectionMetrics.push(metric);

    // Trim old metrics
    if (this.connectionMetrics.length > this.maxMetricsRetention) {
      this.connectionMetrics = this.connectionMetrics.slice(-this.maxMetricsRetention);
    }

    // Check for connection pool exhaustion
    const totalConnections = activeConnections + idleConnections;
    if (waitingRequests > 0 || activeConnections / totalConnections > 0.9) {
      this.addAlert({
        type: 'connection_pool_exhaustion',
        severity: waitingRequests > 5 ? 'critical' : 'warning',
        message: `Connection pool stress: ${activeConnections}/${totalConnections} active, ${waitingRequests} waiting`,
        timestamp: new Date(),
        metadata: { activeConnections, idleConnections, waitingRequests },
      });
    }
  }

  /**
   * Get query performance statistics
   */
  getQueryStats(): {
    totalQueries: number;
    successRate: number;
    averageDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    slowQueryCount: number;
  } {
    if (this.queryMetrics.length === 0) {
      return {
        totalQueries: 0,
        successRate: 0,
        averageDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
        slowQueryCount: 0,
      };
    }

    const successful = this.queryMetrics.filter((m) => m.success).length;
    const durations = this.queryMetrics
      .map((m) => m.duration)
      .sort((a, b) => a - b);

    const getPercentile = (percentile: number) => {
      const index = Math.ceil((percentile / 100) * durations.length) - 1;
      return durations[Math.max(0, index)];
    };

    return {
      totalQueries: this.queryMetrics.length,
      successRate: (successful / this.queryMetrics.length) * 100,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p50Duration: getPercentile(50),
      p95Duration: getPercentile(95),
      p99Duration: getPercentile(99),
      slowQueryCount: this.queryMetrics.filter((m) => m.duration > this.slowQueryThreshold)
        .length,
    };
  }

  /**
   * Get slowest queries
   */
  getSlowestQueries(limit = 10): QueryMetric[] {
    return this.queryMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get queries by type
   */
  getQueriesByType(type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'): QueryMetric[] {
    return this.queryMetrics.filter((m) => m.query.toUpperCase().startsWith(type));
  }

  /**
   * Get connection pool statistics
   */
  getConnectionPoolStats(): {
    averageActiveConnections: number;
    averageIdleConnections: number;
    peakActiveConnections: number;
    averageWaitingRequests: number;
  } {
    if (this.connectionMetrics.length === 0) {
      return {
        averageActiveConnections: 0,
        averageIdleConnections: 0,
        peakActiveConnections: 0,
        averageWaitingRequests: 0,
      };
    }

    const activeConnections = this.connectionMetrics.map((m) => m.activeConnections);
    const idleConnections = this.connectionMetrics.map((m) => m.idleConnections);
    const waitingRequests = this.connectionMetrics.map((m) => m.waitingRequests);

    return {
      averageActiveConnections: activeConnections.reduce((a, b) => a + b, 0) / activeConnections.length,
      averageIdleConnections: idleConnections.reduce((a, b) => a + b, 0) / idleConnections.length,
      peakActiveConnections: Math.max(...activeConnections),
      averageWaitingRequests: waitingRequests.reduce((a, b) => a + b, 0) / waitingRequests.length,
    };
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only recent alerts (last 1000)
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    // Log critical alerts immediately
    if (alert.severity === 'critical') {
      console.error(`[DB_ALERT] ${alert.message}`, alert.metadata);
    }
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 50): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: 'warning' | 'critical'): PerformanceAlert[] {
    return this.alerts.filter((a) => a.severity === severity);
  }

  /**
   * Clear old metrics and alerts
   */
  cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    this.queryMetrics = this.queryMetrics.filter((m) => m.timestamp > oneHourAgo);
    this.connectionMetrics = this.connectionMetrics.filter((m) => m.timestamp > oneHourAgo);
    this.alerts = this.alerts.filter((a) => a.timestamp > oneHourAgo);
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.queryMetrics = [];
    this.connectionMetrics = [];
    this.alerts = [];
  }

  /**
   * Get comprehensive health report
   */
  getHealthReport(): {
    status: 'healthy' | 'degraded' | 'critical';
    queryStats: ReturnType<typeof this.getQueryStats>;
    connectionStats: ReturnType<typeof this.getConnectionPoolStats>;
    recentAlerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const queryStats = this.getQueryStats();
    const connectionStats = this.getConnectionPoolStats();
    const recentAlerts = this.getAlerts(10);
    const recommendations: string[] = [];

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    // Determine status
    if (recentAlerts.some((a) => a.severity === 'critical')) {
      status = 'critical';
    } else if (
      queryStats.p95Duration > 500 ||
      queryStats.slowQueryCount > queryStats.totalQueries * 0.1 ||
      connectionStats.averageWaitingRequests > 2
    ) {
      status = 'degraded';
    }

    // Generate recommendations
    if (queryStats.p95Duration > 500) {
      recommendations.push('Consider adding indexes for slow queries');
    }

    if (queryStats.slowQueryCount > queryStats.totalQueries * 0.1) {
      recommendations.push('Review and optimize slow queries');
    }

    if (connectionStats.averageWaitingRequests > 2) {
      recommendations.push('Increase database connection pool size');
    }

    if (queryStats.successRate < 99) {
      recommendations.push('Investigate query failures and error handling');
    }

    return {
      status,
      queryStats,
      connectionStats,
      recentAlerts,
      recommendations,
    };
  }
}

// Export singleton instance
export const dbMonitor = new DatabaseMonitor();

/**
   * Middleware for automatic query monitoring
   */
export function createQueryMonitoringMiddleware() {
  return (query: string, params: unknown[], callback: (err: Error | null, result: unknown) => void) => {
    const startTime = performance.now();

    return callback(null, {
      query,
      params,
      monitor: (result: unknown, error?: Error) => {
        const duration = performance.now() - startTime;
        const rows = Array.isArray(result) ? result.length : 1;
        const success = !error;

        dbMonitor.recordQuery(query, duration, rows, success, error?.message);
      },
    });
  };
}

export type { QueryMetric, ConnectionPoolMetric, PerformanceAlert };
