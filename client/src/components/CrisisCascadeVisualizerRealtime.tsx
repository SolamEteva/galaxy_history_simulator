/**
 * Crisis Cascade Visualizer: Real-Time Connected Component
 * 
 * Displays cascading events in real-time, updating as events are generated
 * and cascades are detected. Shows timeline, flow, and impact views.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSimulationRealtime } from '@/hooks/useSimulationRealtime';
import type { CascadeUpdate, SimulationEvent } from '@/hooks/useSimulationRealtime';

interface CrisisCascadeVisualizerRealtimeProps {
  galaxyId: string;
  enabled?: boolean;
}

interface CascadeVisualization {
  cascade: CascadeUpdate & { timeline?: Array<{ year: number; events: SimulationEvent[] }> };
  events: SimulationEvent[];
  timeline: Array<{
    year: number;
    events: SimulationEvent[];
  }>
}

/**
 * Timeline View: Shows cascade events chronologically
 */
function TimelineView({ cascade, events, timeline }: CascadeVisualization) {
  return (
    <div className="space-y-4">
      {timeline.map((timepoint: any, idx: number) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            {idx < timeline.length - 1 && <div className="w-0.5 h-12 bg-red-200" />}
          </div>

          <div className="flex-1">
            <div className="text-sm font-semibold">Year {timepoint.year}</div>
            <div className="space-y-2 mt-2">
              {timepoint.events.map((event: any) => (
                <div key={event.id} className="bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{(event as any).description}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {event.eventType}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Importance: {event.importance}/10
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Flow View: Shows cascade propagation as a directed graph
 */
function FlowView({ cascade, events }: CascadeVisualization) {
  const width = 800;
  const height = 400;

  // Simple flow layout: arrange events horizontally by time
  const sortedEvents = [...events].sort((a, b) => a.year - b.year);
  const eventPositions = sortedEvents.map((event, idx) => ({
    event,
    x: 50 + (idx / Math.max(1, sortedEvents.length - 1)) * (width - 100),
    y: 50 + Math.random() * (height - 100),
  }));

  return (
    <svg width={width} height={height} className="border border-slate-200 rounded bg-white">
      {/* Draw connections */}
      {eventPositions.map((pos, idx) => {
        if (idx < eventPositions.length - 1) {
          const next = eventPositions[idx + 1];
          return (
            <line
              key={`line-${idx}`}
              x1={pos.x}
              y1={pos.y}
              x2={next.x}
              y2={next.y}
              stroke="#e2e8f0"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        }
        return null;
      })}

      {/* Arrow marker */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Draw nodes */}
      {eventPositions.map((pos) => (
        <g key={pos.event.id}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r="20"
            fill={pos.event.eventType.includes('conflict') ? '#ef4444' : '#3b82f6'}
            opacity="0.8"
          />
          <title>{pos.event.title}</title>
        </g>
      ))}
    </svg>
  );
}

/**
 * Impact View: Shows severity metrics and affected civilizations
 */
function ImpactView({ cascade }: { cascade: CascadeUpdate }) {
  const severityPercent = Math.round(cascade.severity * 100);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Cascade Severity</span>
          <span className="text-sm font-mono">{severityPercent}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-red-500 h-full transition-all duration-300"
            style={{ width: `${severityPercent}%` }}
          />
        </div>
      </div>

      <div>
        <div className="font-semibold mb-3">Affected Civilizations</div>
        <div className="flex flex-wrap gap-2">
          {cascade.affectedCivilizations.map((civ) => (
            <Badge key={civ} variant="outline">
              {civ}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <div className="text-sm text-slate-600">Event Count</div>
          <div className="text-2xl font-bold mt-1">{cascade.eventCount}</div>
        </div>

        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <div className="text-sm text-slate-600">Status</div>
          <div className="text-lg font-semibold mt-1 capitalize">{cascade.status}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Component: Crisis Cascade Visualizer with Real-Time Updates
 */
export function CrisisCascadeVisualizerRealtime({ galaxyId, enabled = true }: CrisisCascadeVisualizerRealtimeProps) {
  const [selectedCascadeId, setSelectedCascadeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'flow' | 'impact'>('timeline');

  const realtime = useSimulationRealtime(galaxyId, enabled);

  // Build cascade visualizations
  const cascadeVisualizations = useMemo(() => {
    return realtime.cascadeStream.map((cascade) => {
      // Find events that belong to this cascade
      const cascadeEvents = realtime.eventStream.filter((event) =>
        cascade.affectedCivilizations.some((civ) => event.involvedCivilizations.includes(civ as any))
      );

      // Group events by year for timeline
      const timeline = Array.from(
        cascadeEvents.reduce(
          (acc, event) => {
            if (!acc.has(event.year)) {
              acc.set(event.year, []);
            }
            acc.get(event.year)!.push(event);
            return acc;
          },
          new Map<number, SimulationEvent[]>()
        )
      )
        .sort((a, b) => a[0] - b[0])
        .map(([year, events]) => ({ year, events }));

      return {
        cascade: { ...cascade, timeline },
        events: cascadeEvents,
        timeline,
      };
    });
  }, [realtime.cascadeStream, realtime.eventStream]);

  const selectedCascade = cascadeVisualizations.find((c) => c.cascade.id === selectedCascadeId) || cascadeVisualizations[0];

  if (!realtime.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crisis Cascade Visualizer</CardTitle>
          <CardDescription>Connecting to simulation...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-sm text-slate-600">
              {realtime.error ? `Connection error: ${realtime.error}` : 'Establishing connection...'}
            </div>
            {realtime.connectionAttempts > 0 && (
              <div className="text-xs text-slate-500 mt-2">Attempt {realtime.connectionAttempts}</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cascadeVisualizations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crisis Cascade Visualizer</CardTitle>
          <CardDescription>Waiting for cascades...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600">No cascades detected yet. Run the simulation to generate events.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crisis Cascade Visualizer</CardTitle>
        <CardDescription>
          {cascadeVisualizations.length} cascade{cascadeVisualizations.length !== 1 ? 's' : ''} detected
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Cascade Selector */}
        {cascadeVisualizations.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {cascadeVisualizations.map((viz) => (
              <Button
                key={viz.cascade.id}
                variant={selectedCascadeId === viz.cascade.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCascadeId(viz.cascade.id)}
                className="text-xs"
              >
                Year {viz.cascade.year} ({viz.cascade.eventCount} events)
              </Button>
            ))}
          </div>
        )}

        {selectedCascade && (
          <>
            {/* Cascade Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="text-xs text-slate-600">Year</div>
                <div className="font-semibold">{selectedCascade.cascade.year}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="text-xs text-slate-600">Severity</div>
                <div className="font-semibold">{Math.round(selectedCascade.cascade.severity * 100)}%</div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="text-xs text-slate-600">Events</div>
                <div className="font-semibold">{selectedCascade.cascade.eventCount}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <div className="text-xs text-slate-600">Status</div>
                <div className="font-semibold capitalize">{selectedCascade.cascade.status}</div>
              </div>
            </div>

            {/* View Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="flow">Flow</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                {selectedCascade && <TimelineView {...selectedCascade} />}
              </TabsContent>

              <TabsContent value="flow" className="mt-4">
                <div className="overflow-x-auto">
                  <FlowView {...selectedCascade} />
                </div>
              </TabsContent>

              <TabsContent value="impact" className="mt-4">
                <ImpactView cascade={selectedCascade.cascade} />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-xs text-slate-600 pt-4 border-t">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          Connected • {realtime.eventStream.length} events • {realtime.cascadeStream.length} cascades
        </div>
      </CardContent>
    </Card>
  );
}
