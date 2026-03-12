/**
 * Task Queue Manager Component
 * 
 * Visual task queue manager with drag-and-drop reordering,
 * priority management, and estimated completion times.
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Trash2, Plus, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  category: "feature" | "bug-fix" | "documentation" | "optimization" | "testing";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "completed" | "failed";
  estimatedTimeMinutes: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface TaskQueueManagerProps {
  tasks: Task[];
  onTaskReorder?: (tasks: Task[]) => void;
  onTaskRemove?: (taskId: string) => void;
  onTaskAdd?: (task: Omit<Task, "id" | "createdAt" | "status">) => void;
  onTaskPriorityChange?: (taskId: string, priority: Task["priority"]) => void;
}

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const categoryIcons: Record<Task["category"], string> = {
  feature: "✨",
  "bug-fix": "🐛",
  documentation: "📚",
  optimization: "⚡",
  testing: "🧪",
};

const statusColors: Record<Task["status"], string> = {
  pending: "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export const TaskQueueManager: React.FC<TaskQueueManagerProps> = ({
  tasks,
  onTaskReorder,
  onTaskRemove,
  onTaskAdd,
  onTaskPriorityChange,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (!draggedTaskId || !onTaskReorder) return;

      const draggedIndex = tasks.findIndex((t) => t.id === draggedTaskId);
      if (draggedIndex === dropIndex) return;

      const newTasks = [...tasks];
      const [draggedTask] = newTasks.splice(draggedIndex, 1);
      newTasks.splice(dropIndex, 0, draggedTask);

      onTaskReorder(newTasks);
      setDraggedTaskId(null);
      setDragOverIndex(null);
    },
    [draggedTaskId, tasks, onTaskReorder]
  );

  const calculateEstimatedCompletion = (task: Task, allTasks: Task[]): string => {
    const pendingTasks = allTasks.filter((t) => t.status === "pending");
    const taskIndex = pendingTasks.findIndex((t) => t.id === task.id);
    const totalMinutes = pendingTasks.reduce((sum, t) => sum + t.estimatedTimeMinutes, 0);

    if (taskIndex === -1) return "Not in queue";

    const completionTime = new Date();
    completionTime.setMinutes(completionTime.getMinutes() + totalMinutes);

    return completionTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTaskQueuePosition = (taskId: string): number => {
    const pendingTasks = tasks.filter((t) => t.status === "pending");
    return pendingTasks.findIndex((t) => t.id === taskId) + 1;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Task Queue Manager</CardTitle>
              <CardDescription>
                Drag to reorder tasks, manage priorities and track estimated completion times
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Queue Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {tasks.filter((t) => t.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {tasks.filter((t) => t.status === "in-progress").length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {tasks.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {tasks.filter((t) => t.status === "failed").length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No tasks in queue. Add one to get started!
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`p-4 border rounded-lg cursor-move transition-all ${
                    dragOverIndex === index ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                  } ${draggedTaskId === task.id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{categoryIcons[task.category]}</span>
                        <h3 className="font-semibold text-sm truncate">{task.title}</h3>
                        {task.status === "pending" && (
                          <Badge variant="outline" className="text-xs">
                            #{getTaskQueuePosition(task.id)}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        <Badge className={statusColors[task.status]}>
                          {task.status.replace("-", " ")}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimatedTimeMinutes}m
                        </Badge>
                        {task.status === "pending" && (
                          <Badge variant="outline" className="text-xs">
                            Est. {calculateEstimatedCompletion(task, tasks)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedTaskId(
                            expandedTaskId === task.id ? null : task.id
                          )
                        }
                      >
                        {expandedTaskId === task.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      {onTaskRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskRemove(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTaskId === task.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <p className="font-medium">
                            {task.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        {task.startedAt && (
                          <div>
                            <span className="text-gray-600">Started:</span>
                            <p className="font-medium">
                              {task.startedAt.toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {onTaskPriorityChange && task.status === "pending" && (
                        <div>
                          <label className="text-sm text-gray-600 block mb-2">
                            Change Priority:
                          </label>
                          <div className="flex gap-2">
                            {(
                              ["low", "medium", "high", "critical"] as const
                            ).map((p) => (
                              <Button
                                key={p}
                                variant={
                                  task.priority === p ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => onTaskPriorityChange(task.id, p)}
                              >
                                {p}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskQueueManager;
