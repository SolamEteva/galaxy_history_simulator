import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";

export default function GalaxyDetail() {
  const { galaxyId } = useParams<{ galaxyId: string }>();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("overview");

  const galaxyQuery = trpc.galaxy.get.useQuery({ galaxyId: parseInt(galaxyId || "0") });
  const speciesQuery = trpc.galaxy.getSpecies.useQuery({ galaxyId: parseInt(galaxyId || "0") });
  const planetsQuery = trpc.galaxy.getPlanets.useQuery({ galaxyId: parseInt(galaxyId || "0") });
  const eventsQuery = trpc.galaxy.getEvents.useQuery({ galaxyId: parseInt(galaxyId || "0") });

  if (galaxyQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading galaxy...</p>
        </div>
      </div>
    );
  }

  if (!galaxyQuery.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
        <Button onClick={() => setLocation("/")} variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-300">Galaxy not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const galaxy = galaxyQuery.data;
  const species = speciesQuery.data || [];
  const planets = planetsQuery.data || [];
  const events = eventsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => setLocation("/")} variant="outline" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Galaxies
        </Button>

        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 border border-blue-700 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{galaxy.name}</h1>
          <p className="text-blue-200 mb-4">{galaxy.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-blue-300">Status</p>
              <p className="text-white font-semibold capitalize">{galaxy.status}</p>
            </div>
            <div>
              <p className="text-blue-300">Species</p>
              <p className="text-white font-semibold">{species.length}</p>
            </div>
            <div>
              <p className="text-blue-300">Planets</p>
              <p className="text-white font-semibold">{planets.length}</p>
            </div>
            <div>
              <p className="text-blue-300">Events</p>
              <p className="text-white font-semibold">{events.length}</p>
            </div>
            <div>
              <p className="text-blue-300">Years</p>
              <p className="text-white font-semibold">{galaxy.endYear.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="species">Species ({species.length})</TabsTrigger>
            <TabsTrigger value="planets">Planets ({planets.length})</TabsTrigger>
            <TabsTrigger value="timeline">Events ({events.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Galaxy Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Description</p>
                  <p className="text-slate-100">{galaxy.description}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700 rounded p-3">
                    <p className="text-slate-400 text-xs">Start Year</p>
                    <p className="text-white font-semibold">{galaxy.startYear}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <p className="text-slate-400 text-xs">End Year</p>
                    <p className="text-white font-semibold">{galaxy.endYear}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <p className="text-slate-400 text-xs">Total Species</p>
                    <p className="text-white font-semibold">{species.length}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <p className="text-slate-400 text-xs">Total Planets</p>
                    <p className="text-white font-semibold">{planets.length}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <p className="text-slate-400 text-xs">Total Events</p>
                    <p className="text-white font-semibold">{events.length}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <p className="text-slate-400 text-xs">Status</p>
                    <p className="text-white font-semibold capitalize">{galaxy.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="species" className="space-y-4">
            {species.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">No species found.</p>
                </CardContent>
              </Card>
            ) : (
              species.map((sp) => (
                <Card key={sp.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: sp.color || "#888" }}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-white">{sp.name}</CardTitle>
                        <p className="text-sm text-slate-400 capitalize">{sp.speciesType}</p>
                      </div>
                      {sp.extinct && (
                        <span className="px-2 py-1 bg-red-900 text-red-200 text-xs rounded">
                          Extinct
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm">Physical</p>
                      <p className="text-slate-100 text-sm">{sp.physicalDescription}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Culture</p>
                      <p className="text-slate-100 text-sm">{sp.culturalDescription}</p>
                    </div>
                    {(() => {
                      const traits = sp.traits as any[];
                      return traits && Array.isArray(traits) && traits.length > 0 ? (
                        <div>
                          <p className="text-slate-400 text-sm mb-2">Traits</p>
                          <div className="flex flex-wrap gap-2">
                            {traits.map((trait: any, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">Origin</p>
                        <p className="text-white">Year {sp.yearOfOrigin}</p>
                      </div>
                      {sp.yearOfExtinction && (
                        <div>
                          <p className="text-slate-400">Extinction</p>
                          <p className="text-white">Year {sp.yearOfExtinction}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="planets" className="space-y-4">
            {planets.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">No planets found.</p>
                </CardContent>
              </Card>
            ) : (
              planets.map((planet) => (
                <Card key={planet.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-white">{planet.name}</CardTitle>
                      <p className="text-sm text-slate-400">{planet.starSystemName}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-slate-400 text-sm">Type</p>
                      <p className="text-white capitalize">{planet.planetType}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Habitability</p>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${planet.habitability}%` }}
                        />
                      </div>
                      <p className="text-white text-sm mt-1">{planet.habitability.toFixed(1)}%</p>
                    </div>
                    {planet.description && (
                      <div>
                        <p className="text-slate-400 text-sm">Description</p>
                        <p className="text-slate-100 text-sm">{planet.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {events.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">No events recorded.</p>
                </CardContent>
              </Card>
            ) : (
              events
                .sort((a, b) => a.year - b.year)
                .map((event) => (
                  <Card key={event.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-blue-400 text-sm font-semibold">Year {event.year}</p>
                          <CardTitle className="text-white">{event.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-purple-900 text-purple-200 text-xs rounded capitalize">
                            {event.eventType.replace(/-/g, " ")}
                          </span>
                          <span className="px-2 py-1 bg-yellow-900 text-yellow-200 text-xs rounded">
                            {event.importance}/10
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-100 text-sm">{event.description}</p>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
