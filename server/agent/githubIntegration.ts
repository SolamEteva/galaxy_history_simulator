/**
 * GitHub Actions Integration Module
 * 
 * Connects the Mossbot agent system to GitHub Actions for CI/CD automation.
 * Handles webhook events, creates workflows, and triggers automated tasks.
 */

import { EventEmitter } from "events";

export interface GitHubWebhookEvent {
  action: string;
  issue?: {
    number: number;
    title: string;
    body: string;
    labels: Array<{ name: string }>;
  };
  pull_request?: {
    number: number;
    title: string;
    body: string;
  };
  repository: {
    name: string;
    full_name: string;
  };
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  event: "issue" | "pull_request" | "push" | "schedule";
  condition: (webhook: GitHubWebhookEvent) => boolean | undefined;
  taskFactory: (webhook: GitHubWebhookEvent) => AgentTask;
}

export interface AgentTask {
  title: string;
  description: string;
  category: "feature" | "bug-fix" | "documentation" | "optimization" | "testing";
  priority: "low" | "medium" | "high" | "critical";
}

export class GitHubActionsIntegration extends EventEmitter {
  private workflowTriggers: Map<string, WorkflowTrigger> = new Map();
  private webhookSecret: string;
  private repositoryName: string;

  constructor(webhookSecret: string, repositoryName: string) {
    super();
    this.webhookSecret = webhookSecret;
    this.repositoryName = repositoryName;
    this.initializeDefaultTriggers();
  }

  /**
   * Initialize default workflow triggers
   */
  private initializeDefaultTriggers(): void {
    // Bug report trigger
    this.registerTrigger({
      id: "bug-report",
      name: "Bug Report Issue",
      event: "issue",
      condition: (webhook) => {
        return (
          webhook.action === "opened" &&
          webhook.issue?.labels.some((l) => l.name === "bug")
        );
      },
      taskFactory: (webhook) => ({
        title: `Fix: ${webhook.issue?.title || "Bug"}`,
        description: webhook.issue?.body || "No description provided",
        category: "bug-fix",
        priority: webhook.issue?.labels.some((l) => l.name === "critical")
          ? "critical"
          : "high",
      }),
    });

    // Feature request trigger
    this.registerTrigger({
      id: "feature-request",
      name: "Feature Request Issue",
      event: "issue",
      condition: (webhook) => {
        return (
          webhook.action === "opened" &&
          webhook.issue?.labels.some((l) => l.name === "enhancement")
        );
      },
      taskFactory: (webhook) => ({
        title: `Feature: ${webhook.issue?.title || "Enhancement"}`,
        description: webhook.issue?.body || "No description provided",
        category: "feature",
        priority: webhook.issue?.labels.some((l) => l.name === "high-priority")
          ? "high"
          : "medium",
      }),
    });

    // Documentation trigger
    this.registerTrigger({
      id: "documentation",
      name: "Documentation Issue",
      event: "issue",
      condition: (webhook) => {
        return (
          webhook.action === "opened" &&
          webhook.issue?.labels.some((l) => l.name === "documentation")
        );
      },
      taskFactory: (webhook) => ({
        title: `Docs: ${webhook.issue?.title || "Documentation"}`,
        description: webhook.issue?.body || "No description provided",
        category: "documentation",
        priority: "medium",
      }),
    });

    // Pull request review trigger
    this.registerTrigger({
      id: "pr-review",
      name: "Pull Request Review",
      event: "pull_request",
      condition: (webhook) => {
        return webhook.action === "opened" || webhook.action === "synchronize";
      },
      taskFactory: (webhook) => ({
        title: `Review: ${webhook.pull_request?.title || "PR"}`,
        description: `Review pull request #${webhook.pull_request?.number}\n\n${webhook.pull_request?.body || ""}`,
        category: "testing",
        priority: "high",
      }),
    });
  }

  /**
   * Register a new workflow trigger
   */
  registerTrigger(trigger: WorkflowTrigger): void {
    this.workflowTriggers.set(trigger.id, trigger);
    this.emit("trigger-registered", trigger);
  }

  /**
   * Process incoming GitHub webhook event
   */
  async processWebhook(webhook: GitHubWebhookEvent): Promise<AgentTask | null> {
    // Verify repository matches
    if (!webhook.repository.full_name.includes(this.repositoryName)) {
      this.emit("webhook-rejected", {
        reason: "Repository mismatch",
        webhook,
      });
      return null;
    }

    // Check all triggers
    for (const trigger of this.workflowTriggers.values()) {
      if (trigger.event === webhook.action || this.eventMatches(trigger.event, webhook)) {
        if (trigger.condition(webhook)) {
          const task = trigger.taskFactory(webhook);
          this.emit("task-created", {
            trigger: trigger.id,
            task,
            webhook,
          });
          return task;
        }
      }
    }

    this.emit("webhook-processed", {
      matched: false,
      webhook,
    });
    return null;
  }

  /**
   * Check if webhook event matches trigger event type
   */
  private eventMatches(triggerEvent: string, webhook: GitHubWebhookEvent): boolean {
    if (triggerEvent === "issue" && webhook.issue) return true;
    if (triggerEvent === "pull_request" && webhook.pull_request) return true;
    return false as boolean;
  }

  /**
   * Get all registered triggers
   */
  getTriggers(): WorkflowTrigger[] {
    return Array.from(this.workflowTriggers.values());
  }

  /**
   * Get trigger by ID
   */
  getTrigger(id: string): WorkflowTrigger | undefined {
    return this.workflowTriggers.get(id);
  }

  /**
   * Remove a trigger
   */
  removeTrigger(id: string): boolean {
    return this.workflowTriggers.delete(id);
  }

  /**
   * Create GitHub Actions workflow YAML
   */
  generateWorkflowYAML(name: string, trigger: "push" | "pull_request" | "schedule"): string {
    const baseWorkflow = {
      name,
      on: trigger === "schedule" ? { schedule: [{ cron: "0 0 * * *" }] } : { [trigger]: {} },
      jobs: {
        agent: {
          "runs-on": "ubuntu-latest",
          steps: [
            {
              uses: "actions/checkout@v3",
            },
            {
              name: "Run Agent Task",
              run: "npm run agent:process",
            },
            {
              name: "Commit Changes",
              run: 'git config --local user.email "agent@mossbot.ai" && git config --local user.name "Mossbot Agent" && git add -A && git commit -m "Agent: Automated task completion" || true',
            },
            {
              name: "Push Changes",
              run: "git push",
            },
          ],
        },
      },
    };

    return `# Auto-generated by Mossbot Agent\n${JSON.stringify(baseWorkflow, null, 2)}`;
  }

  /**
   * Verify webhook signature (for security)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", this.webhookSecret);
    hmac.update(payload);
    const expectedSignature = `sha256=${hmac.digest("hex")}`;
    return signature === expectedSignature;
  }
}

/**
 * Create GitHub Actions integration instance
 */
export function createGitHubIntegration(
  webhookSecret: string,
  repositoryName: string
): GitHubActionsIntegration {
  return new GitHubActionsIntegration(webhookSecret, repositoryName);
}
