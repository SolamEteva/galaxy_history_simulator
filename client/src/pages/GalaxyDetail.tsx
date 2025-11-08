import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Sparkles, Users, Globe, BookOpen, Zap } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GalaxyDetail() {
  const { galaxyId } = useParams<{ galaxyId: string }>();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const galaxyQuery = trpc.galaxy.get.useQuery({ galaxyId: parseInt(galaxyId!) });
  const speciesQuery = trpc.galaxy.getSpecies.useQuery({ galaxyId: parseInt(galaxyId!) });
  const planetsQuery = trpc.galaxy.getPlanets.useQuery({ galaxyId: parseInt(galaxyId!) });
  const eventsQuery = trpc.galaxy.getEvents.useQuery({ galaxyId: parseInt(galaxyId!) });
  const eventConnectionsQuery = trpc.galaxy.getEventConnections.useQuery({
    galaxyId: parseInt(galaxyId!),
  });

  if (authLoading || galaxyQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="animate-spin w-8 h-8 text-blue-400" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const galaxy = galaxyQuery.data;
  const species = (speciesQuery.data || []) as any[];
  const planets = (planetsQuery.data || []) as any[];
  const events = (eventsQuery.data || []) as any[];
  const connections = (eventConnectionsQuery.data || []) as any[];

  if (galaxyQuery.error || !galaxy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Galaxy Not Found</h1>
          <Button onClick={() => setLocation("/")} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "running":
        return "text-yellow-400";
      case "paused":
        return "text-orange-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "✓ History Generated";
      case "running":
        return "⟳ Generating...";
      case "paused":
        return "⏸ Paused";
      default:
        return "○ Created";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Galaxies
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{galaxy.name}</h1>
              <p className={`text-lg font-semibold ${getStatusColor(galaxy.status)}`}>
                {getStatusText(galaxy.status)}
              </p>
            </div>
          </div>

          {galaxy.description && (
            <p className="text-slate-300 mt-4">{galaxy.description}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{species.length}</p>
                <p className="text-sm text-slate-400">Species</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Globe className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{planets.length}</p>
                <p className="text-sm text-slate-400">Planets</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{events.length}</p>
                <p className="text-sm text-slate-400">Events</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{galaxy.endYear.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Years</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="timeline" className="text-slate-300 data-[state=active]:text-white">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="species" className="text-slate-300 data-[state=active]:text-white">
              Species
            </TabsTrigger>
            <TabsTrigger value="planets" className="text-slate-300 data-[state=active]:text-white">
              Planets
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Historical Timeline</CardTitle>
                <CardDescription className="text-slate-400">
                  {events.length} major events spanning {galaxy.endYear.toLocaleString()} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {events.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No events generated yet</p>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedEventId === event.id
                            ? "bg-blue-900 border-blue-500"
                            : "bg-slate-700 border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Year {event.year}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2">{event.description}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                            {event.eventType}
                          </span>
                          <span className="text-xs bg-purple-600 text-purple-100 px-2 py-1 rounded">
                            Importance: {event.importance}/10
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Detail */}
            {selectedEventId && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {events.find((e) => e.id === selectedEventId) && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Title</p>
                        <p className="text-white font-semibold">
                          {events.find((e) => e.id === selectedEventId)?.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Description</p>
                        <p className="text-slate-300">
                          {events.find((e) => e.id === selectedEventId)?.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Year</p>
                          <p className="text-white">
                            {events.find((e) => e.id === selectedEventId)?.year}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 mb-1">Type</p>
                          <p className="text-white">
                            {events.find((e) => e.id === selectedEventId)?.eventType}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Species Tab */}
          <TabsContent value="species" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Species Encyclopedia</CardTitle>
                <CardDescription className="text-slate-400">
                  {species.length} sentient species in this galaxy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {species.map((sp) => (
                    <div
                      key={sp.id}
                      className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: sp.color || "#888888" }}
                        />
                        <div>
                          <h3 className="font-semibold text-white">{sp.name}</h3>
                          <p className="text-xs text-slate-400">{sp.speciesType}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 mb-3">{sp.physicalDescription}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Origin:</span>
                          <span className="text-white">Year {sp.yearOfOrigin}</span>
                        </div>
                        {sp.yearOfSentience && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sentience:</span>
                            <span className="text-white">Year {sp.yearOfSentience}</span>
                          </div>
                        )}
                        {sp.yearOfFirstCivilization && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">First Civilization:</span>
                            <span className="text-white">Year {sp.yearOfFirstCivilization}</span>
                          </div>
                        )}
                        {sp.yearOfSpaceflight && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Spaceflight:</span>
                            <span className="text-white">Year {sp.yearOfSpaceflight}</span>
                          </div>
                        )}
                        {sp.extinct && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Extinct:</span>
                            <span className="text-red-400">Year {sp.yearOfExtinction}</span>
                          </div>
                        )}
                      </div>

                      {sp.traits && (sp.traits as any).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(sp.traits as string[]).map((trait: string) => (
                            <span
                              key={trait}
                              className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planets Tab */}
          <TabsContent value="planets" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Planetary Systems</CardTitle>
                <CardDescription className="text-slate-400">
                  {planets.length} planets across {new Set(planets.map((p) => p.starSystemName)).size} star systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planets.map((planet) => (
                    <div
                      key={planet.id}
                      className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-all"
                    >
                      <div className="mb-3">
                        <h3 className="font-semibold text-white">{planet.name}</h3>
                        <p className="text-xs text-slate-400">{planet.starSystemName}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Type:</span>
                          <span className="text-white capitalize">{planet.planetType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Habitability:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${planet.habitability}%` }}
                              />
                            </div>
                            <span className="text-white">{planet.habitability}%</span>
                          </div>
                        </div>
                      </div>

                      {planet.description && (
                        <p className="text-sm text-slate-300 mt-3">{planet.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
