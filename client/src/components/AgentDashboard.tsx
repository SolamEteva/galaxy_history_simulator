/**
 * Agent Status Dashboard
 * 
 * Real-time monitoring and management interface for the Mossbot AI Agent system
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TaskMetrics {
  timestamp: Date;
  completed: number;
  failed: number;
  pending: number;
  inProgress: number;
}

interface PerformanceMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export const AgentDashboard: React.FC = () => {
  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h");

  // Query agent status
  const { data: statusData, refetch: refetchStatus } = trpc.agent.getStatus.useQuery(undefined, {
    refetchInterval: 5000,
  });

  // Query all tasks
  const { data: tasksData } = trpc.agent.getAllTasks.useQuery(undefined, {
    refetchInterval: 5000,
  });

  // Update metrics when status changes
  useEffect(() => {
    if (statusData && statusData.initialized && 'completedTasks' in statusData) {
      const newTaskMetric: TaskMetrics = {
        timestamp: new Date(),
        completed: (statusData as any).completedTasks,
        failed: (statusData as any).failedTasks,
        pending: tasksData?.tasks?.filter((t: any) => t.status === "pending").length || 0,
        inProgress: (statusData as any).currentTask ? 1 : 0,
      };

      setTaskMetrics((prev) => [...prev.slice(-59), newTaskMetric]); // Keep last 60 data points

      if ('systemHealth' in statusData && statusData.systemHealth) {
        const newPerfMetric: PerformanceMetrics = {
          timestamp: new Date(),
          cpuUsage: (statusData as any).systemHealth.cpuUsage,
          memoryUsage: (statusData as any).systemHealth.memoryUsage,
          diskUsage: (statusData as any).systemHealth.diskUsage,
        };

        setPerformanceMetrics((prev) => [...prev.slice(-59), newPerfMetric]);
      }
    }
  }, [statusData, tasksData]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-blue-500";
      case "idle":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "in_progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-slate-500";
    }
  };

  const taskStats = tasksData?.tasks
    ? {
        total: tasksData.tasks.length,
        completed: tasksData.tasks.filter((t: any) => t.status === "completed").length,
        failed: tasksData.tasks.filter((t: any) => t.status === "failed").length,
        pending: tasksData.tasks.filter((t: any) => t.status === "pending").length,
        inProgress: tasksData.tasks.filter((t: any) => t.status === "in_progress").length,
      }
    : { total: 0, completed: 0, failed: 0, pending: 0, inProgress: 0 };

  const taskDistribution = [
    { name: "Completed", value: taskStats.completed, fill: "#10b981" },
    { name: "Failed", value: taskStats.failed, fill: "#ef4444" },
    { name: "Pending", value: taskStats.pending, fill: "#eab308" },
    { name: "In Progress", value: taskStats.inProgress, fill: "#3b82f6" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Total Tasks</div>
                <div className="text-3xl font-bold text-white">{taskStats.total}</div>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Completed</div>
                <div className="text-3xl font-bold text-green-400">{taskStats.completed}</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Failed</div>
                <div className="text-3xl font-bold text-red-400">{taskStats.failed}</div>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Success Rate</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {taskStats.total > 0
                    ? Math.round((taskStats.completed / taskStats.total) * 100)
                    : 0}
                  %
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Task Distribution */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Task Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskDistribution.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Completion Trend */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Completion Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={taskMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      name="Completed"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="#ef4444"
                      name="Failed"
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Current Task */}
          {statusData && 'currentTask' in statusData && statusData.currentTask && (
            <Card className="bg-blue-900/30 border-blue-700">
              <CardHeader>
                <CardTitle className="text-blue-300">Currently Working On</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-sm text-blue-200 font-semibold">{(statusData as any).currentTask?.title}</div>
                  <div className="text-sm text-slate-300 mt-1">{(statusData as any).currentTask?.description}</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-blue-700">{(statusData as any).currentTask?.category}</Badge>
                  <Badge className="bg-blue-600">
                    Priority: {(statusData as any).currentTask?.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">System Performance</CardTitle>
              <CardDescription className="text-slate-400">
                Real-time system resource usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cpuUsage"
                    stroke="#fbbf24"
                    name="CPU Usage %"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="memoryUsage"
                    stroke="#60a5fa"
                    name="Memory Usage %"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="diskUsage"
                    stroke="#34d399"
                    name="Disk Usage %"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Current System Health */}
          {statusData && 'systemHealth' in statusData && statusData.systemHealth && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">CPU Usage</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {(statusData as any).systemHealth?.cpuUsage?.toFixed(1) || 0}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(statusData as any).systemHealth?.cpuUsage || 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Memory Usage</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {(statusData as any).systemHealth?.memoryUsage?.toFixed(1) || 0}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(statusData as any).systemHealth?.memoryUsage || 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">Disk Usage</div>
                    <div className="text-2xl font-bold text-green-400">
                      {(statusData as any).systemHealth?.diskUsage?.toFixed(1) || 0}%
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(statusData as any).systemHealth?.diskUsage || 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Tasks</CardTitle>
              <CardDescription className="text-slate-400">
                Latest task execution history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasksData?.tasks && tasksData.tasks.length > 0 ? (
                  tasksData.tasks
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 20)
                    .map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-white">{task.title}</div>
                          <div className="text-xs text-slate-400 mt-1">{task.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTaskStatusColor(task.status)} capitalize`}>
                            {task.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-400">No tasks yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => refetchStatus()}
          className="bg-slate-700 hover:bg-slate-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default AgentDashboard;
