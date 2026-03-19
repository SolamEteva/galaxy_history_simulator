/**
 * Galaxy Explorer Component
 * 
 * Integrated view combining:
 * - Chronicle (event timeline and details)
 * - Trade Network (civilization connections and resource flow)
 * - Perspectives (multi-narrative analysis)
 * - Cascades (crisis chain visualization)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen, Network, Eye, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import CrisisCascadeVisualizer from "./CrisisCascadeVisualizer";
import PerspectiveViewer from "./PerspectiveViewer";
import TradeNetworkMap from "./TradeNetworkMap";

interface GalaxyExplorerProps {
  galaxyId: string;
}

export default function GalaxyExplorer({ galaxyId }: GalaxyExplorerProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chronicle");

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
      {/* Header with Statistics */}
      {stats && (
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Galaxy Explorer</CardTitle>
            <CardDescription className="text-slate-400">
              Explore the interconnected history of civilizations, trade networks, and
              perspectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Cascades</p>
                <p className="text-2xl font-bold text-white">{stats.totalCascades}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg Significance</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(stats.averageEventSignificance * 100)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Routes</p>
                <p className="text-2xl font-bold text-white">
                  {stats.networkStats?.activeRoutes || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Trust Level</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round((stats.networkStats?.averageTrustLevel || 0) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Exploration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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
        </TabsList>

        {/* Chronicle Tab */}
        <TabsContent value="chronicle" className="space-y-4 mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Event Chronicle</CardTitle>
              <CardDescription className="text-slate-400">
                Chronological history of significant events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events?.events && events.events.length > 0 ? (
                  events.events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedEventId === event.id
                          ? "bg-blue-900/50 border-blue-500"
                          : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-white capitalize">
                            {event.type.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Tick {event.timestamp} • Significance: {Math.round(event.significance * 100)}%
                          </p>
                          <p className="text-xs text-slate-300 mt-1">
                            Actors: {event.actors.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">No events found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Detail */}
          {selectedEventId && eventDetail && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white capitalize">
                  {eventDetail.type.replace(/_/g, " ")} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Location</p>
                  <p className="text-sm text-slate-200">{eventDetail.location}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Actors</p>
                  <p className="text-sm text-slate-200">{eventDetail.actors.join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Causal Connections</p>
                  <p className="text-sm text-slate-200">
                    Caused by: {eventDetail.causalParents.length} events
                  </p>
                  <p className="text-sm text-slate-200">
                    Caused: {eventDetail.causalChildren.length} events
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trade Network Tab */}
        <TabsContent value="network" className="mt-4">
          {tradeNetwork && (
            <TradeNetworkMap
              nodes={tradeNetwork.nodes || []}
              edges={tradeNetwork.edges || []}
              stats={stats?.networkStats}
            />
          )}
        </TabsContent>

        {/* Perspectives Tab */}
        <TabsContent value="perspectives" className="mt-4">
          {selectedEventId && eventDetail?.narratives ? (
            <PerspectiveViewer
              eventId={selectedEventId}
              eventType={eventDetail.type}
              perspectives={eventDetail.narratives.perspectives || new Map()}
              contradictions={eventDetail.narratives.contradictions || []}
              hiddenTruths={eventDetail.narratives.hiddenTruths || []}
            />
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">
                    Select an event from the Chronicle to view perspectives
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cascades Tab */}
        <TabsContent value="cascades" className="mt-4">
          {cascades && cascades.length > 0 ? (
            <CrisisCascadeVisualizer
              cascades={cascades.map((cascade) => ({
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
      </Tabs>
    </div>
  );
}
