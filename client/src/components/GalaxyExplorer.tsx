/**
 * Galaxy Explorer Component
 * 
 * Integrated view combining:
 * - Chronicle (event timeline and details)
 * - Trade Network (civilization connections and resource flow)
 * - Perspectives (multi-narrative analysis)
 * - Cascades (crisis chain visualization)
 * - Controls (simulation playback and parameters)
 * - Export (narrative export in multiple formats)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen, Network, Eye, Zap, Settings, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import CrisisCascadeVisualizer from "./CrisisCascadeVisualizer";
import PerspectiveViewer from "./PerspectiveViewer";
import TradeNetworkMap from "./TradeNetworkMap";
import SimulationControlPanel from "./SimulationControlPanel";
import NarrativeExporter from "./NarrativeExporter";
import { useSimulationWebSocket } from "@/hooks/useSimulationWebSocket";

interface GalaxyExplorerProps {
  galaxyId: string;
}

export default function GalaxyExplorer({ galaxyId }: GalaxyExplorerProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chronicle");
  const [simulationState, setSimulationState] = useState<{
    status: "running" | "paused" | "stopped";
    currentTick: number;
    speed: number;
    totalEvents: number;
    totalCascades: number;
  }>({
    status: "paused",
    currentTick: 0,
    speed: 1,
    totalEvents: 0,
    totalCascades: 0,
  });

  // WebSocket connection for real-time updates
  const { isConnected } = useSimulationWebSocket({
    enabled: true,
    onEvent: (event) => {
      // Update event list when new event arrives
      console.log("New event received:", event);
    },
    onCascade: (cascade: any) => {
      // Update cascade when detected
      console.log("New cascade detected:", cascade);
    },
    onSimulationStateChange: (state) => {
      setSimulationState(state);
    },
  });

  // Fetch simulation data
  const { data: events, isLoading: eventsLoading } = trpc.simulation.getEvents.useQuery({
    galaxyId,
    limit: 100,
  });

  const { data: cascades, isLoading: cascadesLoading } = trpc.simulation.getCascades.useQuery({
    galaxyId,
    minSeverity: 0.5,
  });

  const { data: causalGraph, isLoading: causalLoading } =
    trpc.simulation.getCausalGraph.useQuery({
      galaxyId,
    });

  const { data: tradeNetwork, isLoading: tradeLoading } =
    trpc.simulation.getTradeNetwork.useQuery({
      galaxyId,
    });

  const { data: stats, isLoading: statsLoading } = trpc.simulation.getSummaryStats.useQuery({
    galaxyId,
  });

  // Fetch selected event details
  const { data: eventDetail } = trpc.simulation.getEventDetail.useQuery(
    { eventId: selectedEventId || "" },
    { enabled: !!selectedEventId }
  );

  const isLoading =
    eventsLoading || cascadesLoading || causalLoading || tradeLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <Skeleton className="h-8 w-64 bg-slate-700" />
            <Skeleton className="h-4 w-96 bg-slate-700 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full bg-slate-700" />
              <Skeleton className="h-12 w-full bg-slate-700" />
              <Skeleton className="h-12 w-full bg-slate-700" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <Card className="bg-yellow-900/50 border-yellow-700">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-200">
              ⚠️ WebSocket connection lost. Attempting to reconnect...
            </p>
          </CardContent>
        </Card>
      )}

      {isConnected && (
        <Card className="bg-green-900/50 border-green-700">
          <CardContent className="pt-4">
            <p className="text-sm text-green-200">✓ Real-time updates connected</p>
          </CardContent>
        </Card>
      )}

      {/* Header with Statistics */}
      {stats && (
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Galaxy Explorer</CardTitle>
            <CardDescription className="text-slate-400">
              Explore the history, trade networks, and perspectives of your galaxy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Cascades</p>
                <p className="text-2xl font-bold text-white">{stats.totalCascades}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Current Tick</p>
                <p className="text-2xl font-bold text-white">{simulationState.currentTick}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Simulation Speed</p>
                <p className="text-2xl font-bold text-white">{simulationState.speed.toFixed(1)}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Exploration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="chronicle" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Chronicle</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            <span className="hidden sm:inline">Trade</span>
          </TabsTrigger>
          <TabsTrigger value="perspectives" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Perspectives</span>
          </TabsTrigger>
          <TabsTrigger value="cascades" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Cascades</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Controls</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        {/* Chronicle Tab */}
        <TabsContent value="chronicle" className="mt-4">
          {events && events.events && events.events.length > 0 ? (
            <div className="space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Event Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {events.events.map((event: any) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedEventId === event.id
                            ? "bg-blue-900/50 border border-blue-500"
                            : "bg-slate-700/30 border border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <p className="font-semibold text-white">{event.type}</p>
                        <p className="text-xs text-slate-400">Tick {event.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {eventDetail && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">{eventDetail.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-400">Actors</p>
                      <p className="text-white">{eventDetail.actors?.join(", ") || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Location</p>
                      <p className="text-white">{eventDetail.location || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Significance</p>
                      <p className="text-white">
                        {Math.round((eventDetail.significance || 0) * 100)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">No events recorded yet</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trade Network Tab */}
        <TabsContent value="network" className="mt-4">
          {tradeNetwork ? (
            <TradeNetworkMap
              nodes={tradeNetwork.nodes || []}
              edges={tradeNetwork.edges || []}
            />
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Network className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">No trade network data available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Perspectives Tab */}
        <TabsContent value="perspectives" className="mt-4">
          {eventDetail ? (
            <PerspectiveViewer
              eventId={eventDetail.id}
              eventType={eventDetail.type}
              perspectives={eventDetail.narratives || {}}
              contradictions={[]}
              hiddenTruths={[]}
            />
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Eye className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">Select an event to view perspectives</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cascades Tab */}
        <TabsContent value="cascades" className="mt-4">
          {cascades && cascades.length > 0 ? (
            <CrisisCascadeVisualizer
              cascades={cascades.map((cascade: any) => ({
                id: cascade.id,
                name: cascade.name,
                rootCause: cascade.rootCause,
                events: [],
                severity: cascade.severity,
                totalAffectedEntities: new Set(cascade.affectedEntities),
                totalDuration: 0,
              }))}
            />
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Zap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">No major cascades detected</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="mt-4">
          <SimulationControlPanel
            simulationState={simulationState}
            onPlay={() => console.log("Play clicked")}
            onPause={() => console.log("Pause clicked")}
            onStop={() => console.log("Stop clicked")}
            onSpeedChange={(speed) => console.log("Speed changed to:", speed)}
            civilizations={[]}
          />
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="mt-4">
          <NarrativeExporter
            eventCount={events?.total || 0}
            cascadeCount={cascades?.length || 0}
            onExport={(options) => console.log("Export options:", options)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
