import { getDb } from "../db";
import {
  agentTasks,
  agentWorkflows,
  agentConfigurations,
  agentExecutionHistory,
  InsertAgentTask,
  InsertAgentWorkflow,
  InsertAgentConfiguration,
  InsertAgentExecutionHistory,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const getDatabase = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return db as any;
};

/**
 * Agent Task Helpers
 */
export async function createAgentTask(userId: number, task: InsertAgentTask) {
  const db = await getDatabase();
  const result = await db.insert(agentTasks).values({
    ...task,
    userId,
  });
  return result;
}

export async function getAgentTasks(userId: number) {
  const db = await getDatabase();
  return await db.query.agentTasks.findMany({
    where: eq(agentTasks.userId, userId),
  });
}

export async function getAgentTaskById(taskId: number, userId: number) {
  const db = await getDatabase();
  return await db.query.agentTasks.findFirst({
    where: and(eq(agentTasks.id, taskId), eq(agentTasks.userId, userId)),
  });
}

export async function updateAgentTask(
  taskId: number,
  userId: number,
  updates: Partial<InsertAgentTask>
) {
  const db = await getDatabase();
  return await db
    .update(agentTasks)
    .set(updates)
    .where(and(eq(agentTasks.id, taskId), eq(agentTasks.userId, userId)));
}

export async function deleteAgentTask(taskId: number, userId: number) {
  const db = await getDatabase();
  return await db
    .delete(agentTasks)
    .where(and(eq(agentTasks.id, taskId), eq(agentTasks.userId, userId)));
}

/**
 * Agent Workflow Helpers
 */
export async function createAgentWorkflow(userId: number, workflow: InsertAgentWorkflow) {
  const db = await getDatabase();
  return await db.insert(agentWorkflows).values({
    ...workflow,
    userId,
  });
}

export async function getAgentWorkflows(userId: number) {
  const db = await getDatabase();
  return await db.query.agentWorkflows.findMany({
    where: eq(agentWorkflows.userId, userId),
  });
}

export async function getAgentWorkflowById(workflowId: number, userId: number) {
  const db = await getDatabase();
  return await db.query.agentWorkflows.findFirst({
    where: and(eq(agentWorkflows.id, workflowId), eq(agentWorkflows.userId, userId)),
  });
}

export async function updateAgentWorkflow(
  workflowId: number,
  userId: number,
  updates: Partial<InsertAgentWorkflow>
) {
  const db = await getDatabase();
  return await db
    .update(agentWorkflows)
    .set(updates)
    .where(and(eq(agentWorkflows.id, workflowId), eq(agentWorkflows.userId, userId)));
}

/**
 * Agent Configuration Helpers
 */
export async function getAgentConfiguration(userId: number) {
  const db = await getDatabase();
  return await db.query.agentConfigurations.findFirst({
    where: eq(agentConfigurations.userId, userId),
  });
}

export async function createAgentConfiguration(
  userId: number,
  config: Omit<InsertAgentConfiguration, "userId">
) {
  const db = await getDatabase();
  return await db.insert(agentConfigurations).values({
    ...config,
    userId,
  });
}

export async function updateAgentConfiguration(
  userId: number,
  updates: Partial<InsertAgentConfiguration>
) {
  const db = await getDatabase();
  return await db
    .update(agentConfigurations)
    .set(updates)
    .where(eq(agentConfigurations.userId, userId));
}

/**
 * Agent Execution History Helpers
 */
export async function createExecutionHistory(
  userId: number,
  history: Omit<InsertAgentExecutionHistory, "userId">
) {
  const db = await getDatabase();
  return await db.insert(agentExecutionHistory).values({
    ...history,
    userId,
  });
}

export async function getExecutionHistory(userId: number, limit: number = 30) {
  const db = await getDatabase();
  return await db.query.agentExecutionHistory.findMany({
    where: eq(agentExecutionHistory.userId, userId),
    limit,
    orderBy: (table: any) => table.executionDate,
  });
}

export async function getLatestExecutionHistory(userId: number) {
  const db = await getDatabase();
  const result = await db.query.agentExecutionHistory.findFirst({
    where: eq(agentExecutionHistory.userId, userId),
    orderBy: (table: any) => table.executionDate,
  });
  return result;
}

/**
 * Aggregate Statistics
 */
export async function getAgentStatistics(userId: number) {
  const tasks = await getAgentTasks(userId);
  const workflows = await getAgentWorkflows(userId);
  const config = await getAgentConfiguration(userId);
  const history = await getLatestExecutionHistory(userId);

  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const failedTasks = tasks.filter((t: any) => t.status === "failed").length;
  const pendingTasks = tasks.filter((t: any) => t.status === "pending").length;
  const inProgressTasks = tasks.filter((t: any) => t.status === "in-progress").length;

  return {
    totalTasks: tasks.length,
    completedTasks,
    failedTasks,
    pendingTasks,
    inProgressTasks,
    successRate: tasks.length > 0 ? completedTasks / tasks.length : 0,
    totalWorkflows: workflows.length,
    configuration: config,
    latestExecution: history,
  };
}
