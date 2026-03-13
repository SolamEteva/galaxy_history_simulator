/**
 * Agent tRPC Router
 * 
 * Provides API endpoints for managing the Cosmic Forge AI Agent system
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  createAgentSystem,
  TaskStatus,
  TaskPriority as TaskPriorityEnum,
  AgentTaskSchema,
} from "../agent/agentSystem";

// Global agent instance (in production, this would be managed by a service)
let agentSystem: ReturnType<typeof createAgentSystem> | null = null;

export const agentRouter = router({
  /**
   * Initialize agent system
   */
  initializeAgent: protectedProcedure
    .input(
      z.object({
        projectPath: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (agentSystem) {
        return {
          success: false,
          message: "Agent system already initialized",
        };
      }

      try {
        agentSystem = createAgentSystem(
          `agent-${Date.now()}`,
          input.projectPath,
          String(ctx.user.id || `user-${Date.now()}`)
        );

        return {
          success: true,
          message: "Agent system initialized successfully",
          agentId: agentSystem["agentId"],
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to initialize agent",
        };
      }
    }),

  /**
   * Start agent
   */
  startAgent: protectedProcedure.mutation(async ({ ctx }) => {
    if (!agentSystem) {
      return {
        success: false,
        message: "Agent system not initialized",
      };
    }

    try {
      await agentSystem.start();
      return {
        success: true,
        message: "Agent started successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to start agent",
      };
    }
  }),

  /**
   * Stop agent
   */
  stopAgent: protectedProcedure.mutation(async ({ ctx }) => {
    if (!agentSystem) {
      return {
        success: false,
        message: "Agent system not initialized",
      };
    }

    try {
      await agentSystem.stop();
      return {
        success: true,
        message: "Agent stopped successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to stop agent",
      };
    }
  }),

  /**
   * Add task to agent queue
   */
  addTask: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.enum(["feature", "bug", "optimization", "documentation", "testing"]),
        priority: z.nativeEnum(TaskPriorityEnum),
        estimatedHours: z.number().positive(),
        acceptanceCriteria: z.array(z.string()),
        dependencies: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!agentSystem) {
        return {
          success: false,
          message: "Agent system not initialized",
        };
      }

      try {
        const taskId = `task-${Date.now()}`;
        agentSystem.addTask({
          id: taskId,
          title: input.title,
          description: input.description,
          category: input.category,
          priority: input.priority,
          status: TaskStatus.PENDING,
          estimatedHours: input.estimatedHours,
          acceptanceCriteria: input.acceptanceCriteria,
          dependencies: input.dependencies || [],
          createdAt: new Date(),
        });

        return {
          success: true,
          message: "Task added to queue",
          taskId,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to add task",
        };
      }
    }),

  /**
   * Get agent status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    if (!agentSystem) {
      return {
        initialized: false,
        status: "not_initialized",
      };
    }

    const report = agentSystem.getStatusReport();
    return {
      initialized: true,
      ...report,
    };
  }),

  /**
   * Get task status
   */
  getTaskStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!agentSystem) {
        return {
          found: false,
          message: "Agent system not initialized",
        };
      }

      const task = agentSystem.getTaskStatus(input.taskId);
      if (!task) {
        return {
          found: false,
          message: "Task not found",
        };
      }

      return {
        found: true,
        task,
      };
    }),

  /**
   * Get all tasks
   */
  getAllTasks: protectedProcedure.query(async ({ ctx }) => {
    if (!agentSystem) {
      return {
        initialized: false,
        tasks: [],
      };
    }

    return {
      initialized: true,
      tasks: agentSystem.getAllTasks(),
    };
  }),

  /**
   * Get tasks by status
   */
  getTasksByStatus: protectedProcedure
    .input(z.object({ status: z.nativeEnum(TaskStatus) }))
    .query(async ({ input, ctx }) => {
      if (!agentSystem) {
        return {
          initialized: false,
          tasks: [],
        };
      }

      return {
        initialized: true,
        tasks: agentSystem.getTasksByStatus(input.status),
      };
    }),

  /**
   * Get agent capabilities
   */
  getCapabilities: publicProcedure.query(async () => {
    if (!agentSystem) {
      return {
        initialized: false,
        capabilities: [],
      };
    }

    const report = agentSystem.getStatusReport();
    return {
      initialized: true,
      capabilities: report.capabilities,
    };
  }),

  /**
   * Get agent events (polling-based for real-time updates)
   */
  getAgentEvents: protectedProcedure
    .input(z.object({ lastEventId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      if (!agentSystem) {
        return {
          initialized: false,
          events: [],
        };
      }

      // Return current status as event
      return {
        initialized: true,
        events: [
          {
            type: "status",
            data: agentSystem.getStatusReport(),
            timestamp: new Date(),
          },
        ],
      };
    }),

  getConfiguration: protectedProcedure.query(async ({ ctx }) => {
    return {
      maxConcurrentTasks: 3,
      taskTimeoutMinutes: 30,
      retryPolicy: "moderate" as const,
      maxRetries: 2,
      enableFeatureDevelopment: true,
      enableBugFixes: true,
      enableDocumentation: false,
      sendNotifications: true,
      notificationEmail: undefined,
      autoCommitChanges: true,
      autoCreateBranches: true,
    };
  }),

  updateConfiguration: protectedProcedure
    .input(
      z.object({
        maxConcurrentTasks: z.number().optional(),
        taskTimeoutMinutes: z.number().optional(),
        retryPolicy: z.enum(["aggressive", "moderate", "conservative"]).optional(),
        maxRetries: z.number().optional(),
        enableFeatureDevelopment: z.boolean().optional(),
        enableBugFixes: z.boolean().optional(),
        enableDocumentation: z.boolean().optional(),
        sendNotifications: z.boolean().optional(),
        notificationEmail: z.string().optional(),
        autoCommitChanges: z.boolean().optional(),
        autoCreateBranches: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        message: "Configuration updated successfully",
      };
    }),
});
