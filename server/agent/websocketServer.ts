/**
 * WebSocket Server for Real-Time Agent Monitoring
 * 
 * Provides real-time updates to connected clients about agent task status,
 * system metrics, and workflow progress.
 */

import { EventEmitter } from "events";

export interface ClientConnection {
  id: string;
  userId: number;
  connectedAt: Date;
  subscriptions: Set<string>;
}

export interface AgentUpdate {
  type: "task-status" | "system-metrics" | "workflow-progress" | "error" | "completion";
  timestamp: Date;
  data: Record<string, any>;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeTaskCount: number;
  completedTaskCount: number;
  failedTaskCount: number;
}

export interface TaskStatusUpdate {
  taskId: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  progress: number;
  currentStep?: string;
  estimatedTimeRemaining?: number;
}

export interface WorkflowProgressUpdate {
  workflowId: string;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  status: "running" | "completed" | "failed";
}

export class AgentWebSocketServer extends EventEmitter {
  private clients: Map<string, ClientConnection> = new Map();
  private updateQueue: AgentUpdate[] = [];
  private metricsInterval: ReturnType<typeof setInterval> | null = null;
  private maxQueueSize: number = 1000;

  constructor() {
    super();
  }

  /**
   * Register a new client connection
   */
  registerClient(clientId: string, userId: number): ClientConnection {
    const connection: ClientConnection = {
      id: clientId,
      userId,
      connectedAt: new Date(),
      subscriptions: new Set(),
    };

    this.clients.set(clientId, connection);
    this.emit("client-connected", connection);

    return connection;
  }

  /**
   * Unregister a client connection
   */
  unregisterClient(clientId: string): boolean {
    const connection = this.clients.get(clientId);
    if (connection) {
      this.clients.delete(clientId);
      this.emit("client-disconnected", connection);
      return true;
    }
    return false;
  }

  /**
   * Subscribe client to updates
   */
  subscribe(clientId: string, channel: string): boolean {
    const connection = this.clients.get(clientId);
    if (connection) {
      connection.subscriptions.add(channel);
      this.emit("subscription-added", { clientId, channel });
      return true;
    }
    return false;
  }

  /**
   * Unsubscribe client from updates
   */
  unsubscribe(clientId: string, channel: string): boolean {
    const connection = this.clients.get(clientId);
    if (connection) {
      connection.subscriptions.delete(channel);
      this.emit("subscription-removed", { clientId, channel });
      return true;
    }
    return false;
  }

  /**
   * Broadcast update to all connected clients
   */
  broadcast(update: AgentUpdate): void {
    this.addToQueue(update);

    for (const [clientId, connection] of this.clients) {
      // Check if client is subscribed to this update type
      if (connection.subscriptions.has(update.type) || connection.subscriptions.has("*")) {
        this.emit("send-to-client", {
          clientId,
          update,
        });
      }
    }
  }

  /**
   * Send update to specific client
   */
  sendToClient(clientId: string, update: AgentUpdate): boolean {
    const connection = this.clients.get(clientId);
    if (connection) {
      this.addToQueue(update);
      this.emit("send-to-client", {
        clientId,
        update,
      });
      return true;
    }
    return false;
  }

  /**
   * Broadcast task status update
   */
  broadcastTaskStatus(taskUpdate: TaskStatusUpdate): void {
    this.broadcast({
      type: "task-status",
      timestamp: new Date(),
      data: taskUpdate,
    });
  }

  /**
   * Broadcast system metrics
   */
  broadcastMetrics(metrics: SystemMetrics): void {
    this.broadcast({
      type: "system-metrics",
      timestamp: new Date(),
      data: metrics,
    });
  }

  /**
   * Broadcast workflow progress
   */
  broadcastWorkflowProgress(progress: WorkflowProgressUpdate): void {
    this.broadcast({
      type: "workflow-progress",
      timestamp: new Date(),
      data: progress,
    });
  }

  /**
   * Broadcast error message
   */
  broadcastError(error: { message: string; code?: string; context?: Record<string, any> }): void {
    this.broadcast({
      type: "error",
      timestamp: new Date(),
      data: error,
    });
  }

  /**
   * Broadcast task completion
   */
  broadcastCompletion(taskId: string, result: Record<string, any>): void {
    this.broadcast({
      type: "completion",
      timestamp: new Date(),
      data: {
        taskId,
        ...result,
      },
    });
  }

  /**
   * Add update to queue for persistence
   */
  private addToQueue(update: AgentUpdate): void {
    this.updateQueue.push(update);

    // Maintain max queue size
    if (this.updateQueue.length > this.maxQueueSize) {
      this.updateQueue.shift();
    }
  }

  /**
   * Get recent updates (for new clients to catch up)
   */
  getRecentUpdates(limit: number = 50): AgentUpdate[] {
    return this.updateQueue.slice(-limit);
  }

  /**
   * Get connected clients count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get all connected clients
   */
  getClients(): ClientConnection[] {
    return Array.from(this.clients.values());
  }

  /**
   * Get clients subscribed to a channel
   */
  getSubscribedClients(channel: string): ClientConnection[] {
    return Array.from(this.clients.values()).filter((c) => c.subscriptions.has(channel));
  }

  /**
   * Start periodic metrics broadcasting
   */
  startMetricsBroadcast(intervalMs: number = 5000): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      this.broadcastMetrics(metrics);
    }, intervalMs);
  }

  /**
   * Stop periodic metrics broadcasting
   */
  stopMetricsBroadcast(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  /**
   * Collect current system metrics
   */
  private collectMetrics(): SystemMetrics {
    // In production, these would be collected from actual system/agent state
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      activeTaskCount: Math.floor(Math.random() * 5),
      completedTaskCount: Math.floor(Math.random() * 50),
      failedTaskCount: Math.floor(Math.random() * 5),
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.clients.clear();
    this.updateQueue = [];
    this.stopMetricsBroadcast();
  }
}

/**
 * Create WebSocket server instance
 */
export function createWebSocketServer(): AgentWebSocketServer {
  return new AgentWebSocketServer();
}
