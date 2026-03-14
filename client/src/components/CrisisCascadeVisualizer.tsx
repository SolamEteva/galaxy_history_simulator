/**
 * Crisis Cascade Visualizer
 * 
 * Displays how one failure triggers a chain of consequences.
 * Shows the cascade flow (financial panic → trade collapse → famine → migration → conflict)
 * with visual indicators of impact and timing.
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingDown, Clock, Zap, Network } from "lucide-react";

interface CascadeEvent {
  id: string;
  name: string;
  type: "trigger" | "consequence" | "amplifier" | "mitigation";
  severity: number; // 0-1
  timing: number; // ticks until event occurs
  affectedEntities: string[];
  description: string;
  parentEventId?: string;
  childEventIds: string[];
}

interface CascadeChain {
  id: string;
  name: string;
  rootCause: string;
  events: CascadeEvent[];
  totalDuration: number;
  totalAffectedEntities: Set<string>;
  severity: number;
}

interface CrisisCascadeVisualizerProps {
  cascades: CascadeChain[];
  selectedCascadeId?: string;
  onCascadeSelect?: (cascadeId: string) => void;
}

export default function CrisisCascadeVisualizer({
  cascades,
  selectedCascadeId,
  onCascadeSelect,
}: CrisisCascadeVisualizerProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "flow" | "impact">("timeline");

  const selectedCascade = useMemo(
    () => cascades.find((c) => c.id === selectedCascadeId) || cascades[0],
    [cascades, selectedCascadeId]
  );

  if (!selectedCascade) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-slate-400">No crisis cascades detected.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cascade Selector */}
      {cascades.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cascades.map((cascade) => (
            <Card
              key={cascade.id}
              className={`cursor-pointer transition-all ${
                selectedCascadeId === cascade.id
                  ? "bg-red-900/50 border-red-500 ring-2 ring-red-500"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
              onClick={() => onCascadeSelect?.(cascade.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">{cascade.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {cascade.events.length} events in chain
                    </CardDescription>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Severity:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.ceil(cascade.severity * 5)
                              ? "bg-red-500"
                              : "bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-slate-300">{cascade.totalDuration} ticks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Affected:</span>
                    <span className="text-slate-300">
                      {cascade.totalAffectedEntities.size} entities
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Cascade View */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white">{selectedCascade.name}</CardTitle>
              <CardDescription className="text-slate-400">
                Root cause: {selectedCascade.rootCause}
              </CardDescription>
            </div>
            <Badge variant="destructive" className="bg-red-900 text-red-200">
              {Math.round(selectedCascade.severity * 100)}% Severity
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* View Mode Selector */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="flow" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Flow
              </TabsTrigger>
              <TabsTrigger value="impact" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Impact
              </TabsTrigger>
            </TabsList>

            {/* Timeline View */}
            <TabsContent value="timeline" className="space-y-4 mt-4">
              <div className="space-y-3">
                {selectedCascade.events.map((event, index) => (
                  <div key={event.id} className="relative">
                    {/* Timeline connector */}
                    {index < selectedCascade.events.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-slate-500 to-slate-700" />
                    )}

                    {/* Event node */}
                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="relative flex flex-col items-center pt-1">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            event.type === "trigger"
                              ? "bg-red-500 border-red-300"
                              : event.type === "amplifier"
                              ? "bg-orange-500 border-orange-300"
                              : event.type === "mitigation"
                              ? "bg-green-500 border-green-300"
                              : "bg-yellow-500 border-yellow-300"
                          }`}
                        />
                      </div>

                      {/* Event details */}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() =>
                          setExpandedEventId(
                            expandedEventId === event.id ? null : event.id
                          )
                        }
                      >
                        <div className="bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700/70 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-white">{event.name}</h4>
                              <p className="text-sm text-slate-400">
                                {event.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className={`${
                                  event.type === "trigger"
                                    ? "border-red-500 text-red-300"
                                    : event.type === "amplifier"
                                    ? "border-orange-500 text-orange-300"
                                    : event.type === "mitigation"
                                    ? "border-green-500 text-green-300"
                                    : "border-yellow-500 text-yellow-300"
                                }`}
                              >
                                {event.type}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">
                                +{event.timing} ticks
                              </p>
                            </div>
                          </div>

                          {/* Expanded details */}
                          {expandedEventId === event.id && (
                            <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                              <div>
                                <p className="text-xs text-slate-400 font-semibold">
                                  Severity Impact
                                </p>
                                <div className="flex gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`flex-1 h-1 rounded ${
                                        i < Math.ceil(event.severity * 5)
                                          ? "bg-red-500"
                                          : "bg-slate-600"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 font-semibold">
                                  Affected Entities ({event.affectedEntities.length})
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {event.affectedEntities.map((entity) => (
                                    <Badge
                                      key={entity}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {entity}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Flow View */}
            <TabsContent value="flow" className="space-y-4 mt-4">
              <div className="bg-slate-700/30 rounded-lg p-6 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  {selectedCascade.events.map((event, index) => (
                    <React.Fragment key={event.id}>
                      {/* Event box */}
                      <div
                        className={`px-4 py-2 rounded-lg text-center min-w-[120px] ${
                          event.type === "trigger"
                            ? "bg-red-900/50 border border-red-500 text-red-200"
                            : event.type === "amplifier"
                            ? "bg-orange-900/50 border border-orange-500 text-orange-200"
                            : event.type === "mitigation"
                            ? "bg-green-900/50 border border-green-500 text-green-200"
                            : "bg-yellow-900/50 border border-yellow-500 text-yellow-200"
                        }`}
                      >
                        <p className="font-semibold text-sm">{event.name}</p>
                        <p className="text-xs opacity-75">+{event.timing}t</p>
                      </div>

                      {/* Arrow */}
                      {index < selectedCascade.events.length - 1 && (
                        <div className="text-slate-400 text-xl">→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Flow statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="pt-4">
                    <p className="text-2xl font-bold text-white">
                      {selectedCascade.events.length}
                    </p>
                    <p className="text-xs text-slate-400">Events in cascade</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="pt-4">
                    <p className="text-2xl font-bold text-white">
                      {selectedCascade.totalDuration}
                    </p>
                    <p className="text-xs text-slate-400">Total duration (ticks)</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/30 border-slate-600">
                  <CardContent className="pt-4">
                    <p className="text-2xl font-bold text-white">
                      {selectedCascade.totalAffectedEntities.size}
                    </p>
                    <p className="text-xs text-slate-400">Affected entities</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Impact View */}
            <TabsContent value="impact" className="space-y-4 mt-4">
              <div className="space-y-3">
                {selectedCascade.events.map((event) => (
                  <div key={event.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{event.name}</span>
                      <span className="text-sm text-slate-400">
                        {Math.round(event.severity * 100)}% impact
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          event.type === "trigger"
                            ? "bg-red-500"
                            : event.type === "amplifier"
                            ? "bg-orange-500"
                            : event.type === "mitigation"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${event.severity * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Impact summary */}
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-white">Cascade Impact Summary</p>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>
                    • Initial trigger: <span className="font-semibold">{selectedCascade.rootCause}</span>
                  </li>
                  <li>
                    • Cascade duration: <span className="font-semibold">{selectedCascade.totalDuration} ticks</span>
                  </li>
                  <li>
                    • Entities affected: <span className="font-semibold">{selectedCascade.totalAffectedEntities.size}</span>
                  </li>
                  <li>
                    • Overall severity: <span className="font-semibold">{Math.round(selectedCascade.severity * 100)}%</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
