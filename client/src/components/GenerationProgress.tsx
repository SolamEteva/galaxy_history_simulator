import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export interface ProgressUpdate {
  stage: string;
  progress: number;
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

interface GenerationProgressProps {
  galaxyId: number;
  isGenerating: boolean;
  onComplete?: () => void;
}

const stageLabels: Record<string, string> = {
  initializing: "Initializing Galaxy",
  "creating-species": "Creating Species",
  "generating-planets": "Generating Planets",
  "establishing-civilizations": "Establishing Civilizations",
  "generating-events": "Generating Events",
  "finding-narrative-opportunities": "Finding Narrative Opportunities",
  "generating-narrative-events": "Generating Narrative Events",
  "generating-images": "Generating Illustrations",
  finalizing: "Finalizing Galaxy",
  complete: "Complete",
  failed: "Failed",
};

const stageColors: Record<string, string> = {
  initializing: "bg-blue-500",
  "creating-species": "bg-purple-500",
  "generating-planets": "bg-cyan-500",
  "establishing-civilizations": "bg-green-500",
  "generating-events": "bg-orange-500",
  "finding-narrative-opportunities": "bg-pink-500",
  "generating-narrative-events": "bg-red-500",
  "generating-images": "bg-yellow-500",
  finalizing: "bg-indigo-500",
  complete: "bg-emerald-500",
  failed: "bg-red-600",
};

export function GenerationProgress({ galaxyId, isGenerating, onComplete }: GenerationProgressProps) {
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [currentStage, setCurrentStage] = useState<ProgressUpdate | null>(null);

  useEffect(() => {
    if (!isGenerating) return;

    // Simulate progress updates (in production, this would use WebSocket or polling)
    const interval = setInterval(async () => {
      try {
        // This would call trpc.export.getLatestProgress
        // For now, we'll just show the structure
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, galaxyId]);

  if (!isGenerating && updates.length === 0) {
    return null;
  }

  const isComplete = currentStage?.stage === "complete";
  const isFailed = currentStage?.stage === "failed";

  return (
    <Card className="w-full bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : isFailed ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          )}
          Galaxy Generation Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stage */}
        {currentStage && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {stageLabels[currentStage.stage] || currentStage.stage}
              </span>
              <span className="text-sm text-slate-400">{currentStage.progress}%</span>
            </div>
            <Progress value={currentStage.progress} className="h-2" />
            <p className="text-sm text-slate-300">{currentStage.message}</p>
          </div>
        )}

        {/* Stage Timeline */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {updates.map((update, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  stageColors[update.stage] || "bg-slate-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-slate-200">
                    {stageLabels[update.stage] || update.stage}
                  </span>
                  <span className="text-slate-400 text-xs flex-shrink-0">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">{update.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Message */}
        {isComplete && (
          <div className="p-3 bg-emerald-900/20 border border-emerald-700 rounded text-emerald-200 text-sm">
            ✓ Galaxy generation complete! You can now explore the history.
          </div>
        )}

        {isFailed && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-200 text-sm">
            ✗ Galaxy generation failed. Please try again with different parameters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
