/**
 * Agent Launcher Component
 * 
 * Provides user-friendly interface for launching and controlling the Mossbot AI Agent system
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Play, Square, Zap, CheckCircle, AlertCircle, Cpu } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AgentStatus {
  agentId?: string;
  status: "idle" | "working" | "error" | "offline" | "not_initialized";
  currentTask?: any;
  completedTasks: number;
  failedTasks: number;
  uptime: number;
  capabilities: Array<{
    name: string;
    description: string;
    enabled: boolean;
  }>;
  systemHealth?: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

export const AgentLauncher: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    status: "not_initialized",
    completedTasks: 0,
    failedTasks: 0,
    uptime: 0,
    capabilities: [],
  });
  const [projectPath, setProjectPath] = useState("/home/ubuntu/galaxy_history_simulator");

  // tRPC mutations and queries
  const initializeAgent = trpc.agent.initializeAgent.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        setIsInitialized(true);
        toast.success("Agent system initialized successfully");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to initialize agent: ${error?.message || 'Unknown error'}`);
    },
  });

  const startAgent = trpc.agent.startAgent.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        setIsRunning(true);
        toast.success("Agent started successfully");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to start agent: ${error?.message || 'Unknown error'}`);
    },
  });

  const stopAgent = trpc.agent.stopAgent.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        setIsRunning(false);
        toast.success("Agent stopped successfully");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to stop agent: ${error?.message || 'Unknown error'}`);
    },
  });

  // Query agent status
  const { data: statusData, refetch: refetchStatus } = trpc.agent.getStatus.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Update local state when status changes
  useEffect(() => {
    if (statusData) {
      setAgentStatus(statusData as AgentStatus);
      setIsInitialized(statusData.initialized);
    }
  }, [statusData]);

  const handleInitialize = async () => {
    await initializeAgent.mutateAsync({
      projectPath,
    });
  };

  const handleStart = async () => {
    await startAgent.mutateAsync();
  };

  const handleStop = async () => {
    await stopAgent.mutateAsync();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-blue-500";
      case "idle":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "idle":
        return <CheckCircle className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Agent Status Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Mossbot AI Agent
              </CardTitle>
              <CardDescription className="text-slate-400">
                Autonomous development system for Galaxy History Simulator
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(agentStatus.status)}`} />
              <span className="text-sm font-semibold text-slate-300 capitalize">
                {agentStatus.status}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Initialization Section */}
          {!isInitialized && (
            <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Project Path
                </label>
                <Input
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="/path/to/project"
                />
              </div>
              <Button
                onClick={handleInitialize}
                disabled={initializeAgent.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {initializeAgent.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize Agent System"
                )}
              </Button>
            </div>
          )}

          {/* Control Section */}
          {isInitialized && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <div className="text-xs text-slate-400">Completed Tasks</div>
                  <div className="text-2xl font-bold text-green-400">
                    {agentStatus.completedTasks}
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <div className="text-xs text-slate-400">Failed Tasks</div>
                  <div className="text-2xl font-bold text-red-400">
                    {agentStatus.failedTasks}
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <div className="text-xs text-slate-400">Uptime</div>
                  <div className="text-lg font-bold text-blue-400">
                    {formatUptime(agentStatus.uptime)}
                  </div>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <div className="text-xs text-slate-400">Agent ID</div>
                  <div className="text-xs font-mono text-slate-300 truncate">
                    {agentStatus.agentId?.slice(0, 8)}...
                  </div>
                </div>
              </div>

              {/* Current Task */}
              {agentStatus.currentTask && (
                <div className="bg-blue-900/30 border border-blue-700 p-3 rounded-lg">
                  <div className="text-sm font-semibold text-blue-300 mb-1">
                    Current Task
                  </div>
                  <div className="text-sm text-slate-300">{agentStatus.currentTask.title}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {agentStatus.currentTask.description}
                  </div>
                </div>
              )}

              {/* System Health */}
              {agentStatus.systemHealth && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">System Health</div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>CPU Usage</span>
                        <span>{agentStatus.systemHealth.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${agentStatus.systemHealth.cpuUsage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Memory Usage</span>
                        <span>{agentStatus.systemHealth.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${agentStatus.systemHealth.memoryUsage}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Disk Usage</span>
                        <span>{agentStatus.systemHealth.diskUsage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${agentStatus.systemHealth.diskUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleStart}
                  disabled={isRunning || startAgent.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {startAgent.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Agent
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleStop}
                  disabled={!isRunning || stopAgent.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {stopAgent.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Stopping...
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Agent
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Capabilities */}
          {agentStatus.capabilities.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">Agent Capabilities</div>
              <div className="flex flex-wrap gap-2">
                {agentStatus.capabilities
                  .filter((cap) => cap.enabled)
                  .map((cap) => (
                    <Badge key={cap.name} className="bg-slate-700 text-slate-200 capitalize">
                      {cap.name.replace(/_/g, " ")}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <div>
            <h4 className="font-semibold text-white mb-2">1. Initialize</h4>
            <p>
              Start by initializing the agent system with your project path. The agent will
              configure itself and prepare to accept tasks.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">2. Start</h4>
            <p>
              Click "Start Agent" to begin autonomous development. The agent will start processing
              tasks from the queue and working on improvements.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">3. Monitor</h4>
            <p>
              Watch the agent work in real-time. The dashboard shows current tasks, system health,
              and progress metrics.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">4. Review</h4>
            <p>
              Review completed tasks and pull requests. The agent creates detailed commits and
              documentation for all work.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentLauncher;
