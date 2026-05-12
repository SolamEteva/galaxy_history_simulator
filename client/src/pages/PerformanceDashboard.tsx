import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Performance Dashboard Component
 * Real-time monitoring of system health, query performance, and resource utilization
 */

interface PerformanceMetric {
  timestamp: string;
  queryDuration: number;
  activeConnections: number;
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  queryStats: {
    totalQueries: number;
    successRate: number;
    averageDuration: number;
    p95Duration: number;
    p99Duration: number;
    slowQueryCount: number;
  };
  connectionStats: {
    averageActiveConnections: number;
    averageIdleConnections: number;
    peakActiveConnections: number;
    averageWaitingRequests: number;
  };
  recentAlerts: Array<{
    type: string;
    severity: 'warning' | 'critical';
    message: string;
    timestamp: string;
  }>;
  recommendations: string[];
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // In a real implementation, fetch from tRPC endpoint
        // const response = await trpc.monitoring.getMetrics.useQuery();
        // setMetrics(response.data);
        // setHealth(response.health);

        // Mock data for demonstration
        setMetrics(generateMockMetrics());
        setHealth(generateMockHealth());
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const generateMockMetrics = (): PerformanceMetric[] => {
    return Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (20 - i) * 5000).toISOString(),
      queryDuration: 50 + Math.random() * 100,
      activeConnections: 5 + Math.random() * 10,
      cpuUsage: 30 + Math.random() * 40,
      memoryUsage: 40 + Math.random() * 30,
      errorRate: Math.random() * 0.5,
    }));
  };

  const generateMockHealth = (): HealthStatus => {
    return {
      status: 'healthy',
      queryStats: {
        totalQueries: 15234,
        successRate: 99.8,
        averageDuration: 75,
        p95Duration: 250,
        p99Duration: 450,
        slowQueryCount: 45,
      },
      connectionStats: {
        averageActiveConnections: 8,
        averageIdleConnections: 12,
        peakActiveConnections: 18,
        averageWaitingRequests: 0.2,
      },
      recentAlerts: [
        {
          type: 'slow_query',
          severity: 'warning',
          message: 'Slow query detected: 523ms for "SELECT * FROM events..."',
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
      ],
      recommendations: ['Monitor slow query trends', 'Consider adding indexes for frequently accessed columns'],
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Performance Dashboard</h1>
          <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
        </div>

        {/* Health Status */}
        {health && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  System Health
                  <Badge className={getStatusColor(health.status)}>{health.status.toUpperCase()}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{health.queryStats.successRate.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Query Time</p>
                    <p className="text-2xl font-bold">{health.queryStats.averageDuration.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">P95 Query Time</p>
                    <p className="text-2xl font-bold">{health.queryStats.p95Duration.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Connections</p>
                    <p className="text-2xl font-bold">{health.connectionStats.averageActiveConnections.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Metrics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Query Duration Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Query Performance Trend</CardTitle>
              <CardDescription>Average query duration over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    formatter={(value) => `${(value as number).toFixed(2)}ms`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="queryDuration"
                    stroke="#8884d8"
                    dot={false}
                    name="Query Duration"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Connection Pool Status */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Pool</CardTitle>
              <CardDescription>Active and idle database connections</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis label={{ value: 'Connections', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    formatter={(value) => `${(value as number).toFixed(0)}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activeConnections"
                    stroke="#82ca9d"
                    dot={false}
                    name="Active Connections"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resource Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>CPU and memory usage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    formatter={(value) => `${(value as number).toFixed(1)}%`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpuUsage"
                    stroke="#ffc658"
                    dot={false}
                    name="CPU Usage"
                  />
                  <Line
                    type="monotone"
                    dataKey="memoryUsage"
                    stroke="#ff7c7c"
                    dot={false}
                    name="Memory Usage"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Error Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
              <CardDescription>Percentage of failed operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis label={{ value: 'Error Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    formatter={(value) => `${(value as number).toFixed(2)}%`}
                  />
                  <Bar dataKey="errorRate" fill="#ff7c7c" name="Error Rate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {health && health.recentAlerts.length > 0 && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {health.recentAlerts.map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{alert.type.replace(/_/g, ' ').toUpperCase()}</p>
                            <p className="text-sm">{alert.message}</p>
                          </div>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        {health && health.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {health.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
