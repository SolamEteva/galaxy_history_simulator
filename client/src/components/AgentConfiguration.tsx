import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Save, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface AgentConfig {
  maxConcurrentTasks: number;
  taskTimeoutMinutes: number;
  retryPolicy: "aggressive" | "moderate" | "conservative";
  maxRetries: number;
  enableFeatureDevelopment: boolean;
  enableBugFixes: boolean;
  enableDocumentation: boolean;
  sendNotifications: boolean;
  notificationEmail?: string;
  autoCommitChanges: boolean;
  autoCreateBranches: boolean;
}

interface AgentConfigurationProps {
  config: AgentConfig;
  onSave: (config: AgentConfig) => Promise<void>;
  isLoading?: boolean;
}

export function AgentConfiguration({ config, onSave, isLoading = false }: AgentConfigurationProps) {
  const [formData, setFormData] = useState<AgentConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (field: keyof AgentConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleReset = () => {
    setFormData(config);
    setHasChanges(false);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveMessage({ type: "success", text: "Configuration saved successfully" });
      setHasChanges(false);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save configuration",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {saveMessage && (
        <Alert className={saveMessage.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <AlertCircle className={`h-4 w-4 ${saveMessage.type === "success" ? "text-green-600" : "text-red-600"}`} />
          <AlertDescription className={saveMessage.type === "success" ? "text-green-800" : "text-red-800"}>
            {saveMessage.text}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>Configure how the agent manages and executes tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Max Concurrent Tasks */}
          <div className="space-y-2">
            <Label htmlFor="maxConcurrentTasks">Maximum Concurrent Tasks</Label>
            <Input
              id="maxConcurrentTasks"
              type="number"
              min="1"
              max="10"
              value={formData.maxConcurrentTasks}
              onChange={(e) => handleChange("maxConcurrentTasks", parseInt(e.target.value))}
              disabled={isLoading || isSaving}
            />
            <p className="text-xs text-muted-foreground">
              How many tasks the agent can work on simultaneously (1-10)
            </p>
          </div>

          {/* Task Timeout */}
          <div className="space-y-2">
            <Label htmlFor="taskTimeoutMinutes">Task Timeout (minutes)</Label>
            <Input
              id="taskTimeoutMinutes"
              type="number"
              min="5"
              max="300"
              step="5"
              value={formData.taskTimeoutMinutes}
              onChange={(e) => handleChange("taskTimeoutMinutes", parseInt(e.target.value))}
              disabled={isLoading || isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Maximum time to spend on a single task before timeout (5-300 minutes)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retry Policy</CardTitle>
          <CardDescription>Configure how the agent handles failed tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Retry Policy */}
          <div className="space-y-2">
            <Label htmlFor="retryPolicy">Retry Strategy</Label>
            <Select
              value={formData.retryPolicy}
              onValueChange={(value) => handleChange("retryPolicy", value)}
              disabled={isLoading || isSaving}
            >
              <SelectTrigger id="retryPolicy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aggressive">Aggressive (Retry often, quick failures)</SelectItem>
                <SelectItem value="moderate">Moderate (Balanced approach)</SelectItem>
                <SelectItem value="conservative">Conservative (Retry rarely, thorough checks)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How aggressively the agent retries failed tasks
            </p>
          </div>

          {/* Max Retries */}
          <div className="space-y-2">
            <Label htmlFor="maxRetries">Maximum Retries</Label>
            <Input
              id="maxRetries"
              type="number"
              min="0"
              max="5"
              value={formData.maxRetries}
              onChange={(e) => handleChange("maxRetries", parseInt(e.target.value))}
              disabled={isLoading || isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of times to retry a failed task (0-5)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Capabilities</CardTitle>
          <CardDescription>Enable or disable specific types of work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Development */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableFeatureDevelopment" className="text-base">
                Feature Development
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow agent to work on new features and enhancements
              </p>
            </div>
            <Switch
              id="enableFeatureDevelopment"
              checked={formData.enableFeatureDevelopment}
              onCheckedChange={(checked) => handleChange("enableFeatureDevelopment", checked)}
              disabled={isLoading || isSaving}
            />
          </div>

          {/* Bug Fixes */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableBugFixes" className="text-base">
                Bug Fixes
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow agent to identify and fix bugs
              </p>
            </div>
            <Switch
              id="enableBugFixes"
              checked={formData.enableBugFixes}
              onCheckedChange={(checked) => handleChange("enableBugFixes", checked)}
              disabled={isLoading || isSaving}
            />
          </div>

          {/* Documentation */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableDocumentation" className="text-base">
                Documentation
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow agent to generate and update documentation
              </p>
            </div>
            <Switch
              id="enableDocumentation"
              checked={formData.enableDocumentation}
              onCheckedChange={(checked) => handleChange("enableDocumentation", checked)}
              disabled={isLoading || isSaving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications & Git</CardTitle>
          <CardDescription>Configure notifications and git behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Send Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sendNotifications" className="text-base">
                Send Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications when tasks complete or fail
              </p>
            </div>
            <Switch
              id="sendNotifications"
              checked={formData.sendNotifications}
              onCheckedChange={(checked) => handleChange("sendNotifications", checked)}
              disabled={isLoading || isSaving}
            />
          </div>

          {/* Notification Email */}
          {formData.sendNotifications && (
            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input
                id="notificationEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.notificationEmail || ""}
                onChange={(e) => handleChange("notificationEmail", e.target.value)}
                disabled={isLoading || isSaving}
              />
            </div>
          )}

          {/* Auto Commit Changes */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoCommitChanges" className="text-base">
                Auto Commit Changes
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically commit changes to git when tasks complete
              </p>
            </div>
            <Switch
              id="autoCommitChanges"
              checked={formData.autoCommitChanges}
              onCheckedChange={(checked) => handleChange("autoCommitChanges", checked)}
              disabled={isLoading || isSaving}
            />
          </div>

          {/* Auto Create Branches */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoCreateBranches" className="text-base">
                Auto Create Branches
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically create feature branches for new work
              </p>
            </div>
            <Switch
              id="autoCreateBranches"
              checked={formData.autoCreateBranches}
              onCheckedChange={(checked) => handleChange("autoCreateBranches", checked)}
              disabled={isLoading || isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges || isLoading || isSaving}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isLoading || isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
