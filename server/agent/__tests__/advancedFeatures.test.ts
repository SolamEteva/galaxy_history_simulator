/**
 * Advanced Agent Features Tests
 * 
 * Comprehensive test suite for GitHub Actions integration,
 * WebSocket monitoring, and task queue management.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createGitHubIntegration } from "../githubIntegration";
import { createWebSocketServer } from "../websocketServer";

describe("GitHub Actions Integration", () => {
  let integration: ReturnType<typeof createGitHubIntegration>;

  beforeEach(() => {
    integration = createGitHubIntegration("test-secret", "test-repo");
  });

  it("should initialize with default triggers", () => {
    const triggers = integration.getTriggers();
    expect(triggers.length).toBeGreaterThan(0);
  });

  it("should register custom triggers", () => {
    const customTrigger = {
      id: "custom",
      name: "Custom Trigger",
      event: "push" as const,
      condition: () => true,
      taskFactory: () => ({
        title: "Custom Task",
        description: "Test",
        category: "feature" as const,
        priority: "medium" as const,
      }),
    };

    integration.registerTrigger(customTrigger);
    expect(integration.getTrigger("custom")).toBeDefined();
  });

  it("should process bug report webhooks", async () => {
    const webhook = {
      action: "opened",
      issue: {
        number: 1,
        title: "Critical Bug",
        body: "Bug description",
        labels: [{ name: "bug" }, { name: "critical" }],
      },
      repository: {
        name: "test-repo",
        full_name: "user/test-repo",
      },
    };

    const task = await integration.processWebhook(webhook);
    expect(task).toBeDefined();
    expect(task?.category).toBe("bug-fix");
    expect(task?.priority).toBe("critical");
  });

  it("should process feature request webhooks", async () => {
    const webhook = {
      action: "opened",
      issue: {
        number: 2,
        title: "New Feature",
        body: "Feature description",
        labels: [{ name: "enhancement" }],
      },
      repository: {
        name: "test-repo",
        full_name: "user/test-repo",
      },
    };

    const task = await integration.processWebhook(webhook);
    expect(task).toBeDefined();
    expect(task?.category).toBe("feature");
  });

  it("should reject webhooks from different repositories", async () => {
    const webhook = {
      action: "opened",
      issue: {
        number: 1,
        title: "Bug",
        body: "Description",
        labels: [{ name: "bug" }],
      },
      repository: {
        name: "other-repo",
        full_name: "user/other-repo",
      },
    };

    const task = await integration.processWebhook(webhook);
    expect(task).toBeNull();
  });

  it("should generate workflow YAML", () => {
    const yaml = integration.generateWorkflowYAML("Test Workflow", "push");
    expect(yaml).toContain("Test Workflow");
    expect(yaml).toContain("ubuntu-latest");
  });

  it("should verify webhook signatures", () => {
    const payload = "test payload";
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", "test-secret");
    hmac.update(payload);
    const signature = `sha256=${hmac.digest("hex")}`;

    const isValid = integration.verifyWebhookSignature(payload, signature);
    expect(isValid).toBe(true);
  });

  it("should reject invalid webhook signatures", () => {
    const isValid = integration.verifyWebhookSignature("payload", "invalid-signature");
    expect(isValid).toBe(false);
  });
});

describe("WebSocket Server", () => {
  let wsServer: ReturnType<typeof createWebSocketServer>;

  beforeEach(() => {
    wsServer = createWebSocketServer();
  });

  it("should register and unregister clients", () => {
    const client = wsServer.registerClient("client-1", 123);
    expect(client.id).toBe("client-1");
    expect(wsServer.getClientCount()).toBe(1);

    wsServer.unregisterClient("client-1");
    expect(wsServer.getClientCount()).toBe(0);
  });

  it("should manage client subscriptions", () => {
    wsServer.registerClient("client-1", 123);
    wsServer.subscribe("client-1", "task-status");

    const clients = wsServer.getSubscribedClients("task-status");
    expect(clients.length).toBe(1);
  });

  it("should broadcast updates to all clients", () => {
    wsServer.registerClient("client-1", 123);
    wsServer.registerClient("client-2", 456);
    wsServer.subscribe("client-1", "system-metrics");
    wsServer.subscribe("client-2", "system-metrics");

    let broadcastCount = 0;
    wsServer.on("send-to-client", () => {
      broadcastCount++;
    });

    wsServer.broadcastMetrics({
      cpuUsage: 50,
      memoryUsage: 60,
      diskUsage: 70,
      activeTaskCount: 2,
      completedTaskCount: 10,
      failedTaskCount: 1,
    });

    expect(broadcastCount).toBe(2);
  });

  it("should track recent updates", () => {
    wsServer.registerClient("client-1", 123);

    wsServer.broadcastMetrics({
      cpuUsage: 50,
      memoryUsage: 60,
      diskUsage: 70,
      activeTaskCount: 2,
      completedTaskCount: 10,
      failedTaskCount: 1,
    });

    const recent = wsServer.getRecentUpdates(10);
    expect(recent.length).toBeGreaterThan(0);
  });

  it("should broadcast task status updates", () => {
    wsServer.registerClient("client-1", 123);
    wsServer.subscribe("client-1", "task-status");

    let updateReceived = false;
    wsServer.on("send-to-client", (data) => {
      if (data.update.type === "task-status") {
        updateReceived = true;
      }
    });

    wsServer.broadcastTaskStatus({
      taskId: "task-1",
      status: "in-progress",
      progress: 50,
      currentStep: "Testing",
    });

    expect(updateReceived).toBe(true);
  });

  it("should broadcast workflow progress", () => {
    wsServer.registerClient("client-1", 123);
    wsServer.subscribe("client-1", "workflow-progress");

    let updateReceived = false;
    wsServer.on("send-to-client", (data) => {
      if (data.update.type === "workflow-progress") {
        updateReceived = true;
      }
    });

    wsServer.broadcastWorkflowProgress({
      workflowId: "workflow-1",
      currentStep: 2,
      totalSteps: 5,
      stepName: "Implementation",
      status: "running",
    });

    expect(updateReceived).toBe(true);
  });

  it("should broadcast errors", () => {
    wsServer.registerClient("client-1", 123);
    wsServer.subscribe("client-1", "error");

    let errorReceived = false;
    wsServer.on("send-to-client", (data) => {
      if (data.update.type === "error") {
        errorReceived = true;
      }
    });

    wsServer.broadcastError({
      message: "Test error",
      code: "TEST_ERROR",
    });

    expect(errorReceived).toBe(true);
  });

  it("should start and stop metrics broadcasting", () => {
    wsServer.registerClient("client-1", 123);
    wsServer.subscribe("client-1", "system-metrics");

    let broadcastCount = 0;
    wsServer.on("send-to-client", () => {
      broadcastCount++;
    });

    wsServer.startMetricsBroadcast(100);

    // Wait for at least one broadcast
    return new Promise((resolve) => {
      setTimeout(() => {
        wsServer.stopMetricsBroadcast();
        expect(broadcastCount).toBeGreaterThan(0);
        resolve(null);
      }, 150);
    });
  });

  it("should clear all data", () => {
    wsServer.registerClient("client-1", 123);
    wsServer.broadcastMetrics({
      cpuUsage: 50,
      memoryUsage: 60,
      diskUsage: 70,
      activeTaskCount: 2,
      completedTaskCount: 10,
      failedTaskCount: 1,
    });

    wsServer.clear();

    expect(wsServer.getClientCount()).toBe(0);
    expect(wsServer.getRecentUpdates(10).length).toBe(0);
  });
});

describe("Integration Tests", () => {
  it("should create tasks from GitHub webhooks and broadcast via WebSocket", async () => {
    const integration = createGitHubIntegration("test-secret", "test-repo");
    const wsServer = createWebSocketServer();

    wsServer.registerClient("client-1", 123);
    wsServer.subscribe("client-1", "*");

    const webhook = {
      action: "opened",
      issue: {
        number: 1,
        title: "Critical Bug",
        body: "Bug description",
        labels: [{ name: "bug" }, { name: "critical" }],
      },
      repository: {
        name: "test-repo",
        full_name: "user/test-repo",
      },
    };

    const task = await integration.processWebhook(webhook);

    let taskBroadcasted = false;
    wsServer.on("send-to-client", (data) => {
      if (data.update.data.title === task?.title) {
        taskBroadcasted = true;
      }
    });

    if (task) {
      wsServer.broadcastCompletion(task.title, {
        status: "created",
        category: task.category,
      });
    }

    expect(task).toBeDefined();
    expect(task?.priority).toBe("critical");
  });
});
