import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventTimelineWithFigures from "@/components/EventTimelineWithFigures";
import { Link } from "wouter";
import { Calendar, Users, Zap } from "lucide-react";

interface TimelineEvent {
  id: number;
  year: number;
  title: string;
  description: string;
  eventType: "political" | "war" | "technological" | "cultural" | "religious" | "natural";
  importance: number;
  involvedFigures: number[];
  figureInfluenceContribution: Record<number, number>;
}

// Sample events for demonstration
const SAMPLE_EVENTS: TimelineEvent[] = [
  {
    id: 1,
    year: 1000,
    title: "Founding of the Aldrian Empire",
    description:
      "King Aldric unites five kingdoms under one banner, establishing the foundation of the greatest empire the world has ever known.",
    eventType: "political",
    importance: 10,
    involvedFigures: [1, 2],
    figureInfluenceContribution: { 1: 70, 2: 30 },
  },
  {
    id: 2,
    year: 1020,
    title: "Construction of the Grand Library",
    description:
      "King Aldric commissions the construction of the Grand Library, which becomes the repository of all known knowledge.",
    eventType: "technological",
    importance: 8,
    involvedFigures: [1],
    figureInfluenceContribution: { 1: 100 },
  },
  {
    id: 3,
    year: 1040,
    title: "The Theocratic Reformation",
    description:
      "Prophet Malachai founds the Order of the Eternal Light, fundamentally changing the spiritual landscape of the world.",
    eventType: "religious",
    importance: 9,
    involvedFigures: [6],
    figureInfluenceContribution: { 6: 100 },
  },
  {
    id: 4,
    year: 1045,
    title: "Establishment of the Academy of Arcane Arts",
    description:
      "Queen Elara establishes the first formal institution for magical education, revolutionizing arcane practice.",
    eventType: "cultural",
    importance: 8,
    involvedFigures: [2],
    figureInfluenceContribution: { 2: 100 },
  },
  {
    id: 5,
    year: 1050,
    title: "The Northern Conquest",
    description:
      "General Aldwin leads a series of military campaigns that expand the Aldrian Empire by 40%, incorporating the Northern Territories.",
    eventType: "war",
    importance: 9,
    involvedFigures: [3],
    figureInfluenceContribution: { 3: 100 },
  },
  {
    id: 6,
    year: 1070,
    title: "The Eternal Symphony Premiere",
    description:
      "Bard Theron performs his masterpiece, the Eternal Symphony, which inspires a cultural renaissance across all civilizations.",
    eventType: "cultural",
    importance: 7,
    involvedFigures: [5],
    figureInfluenceContribution: { 5: 100 },
  },
  {
    id: 7,
    year: 1075,
    title: "Discovery of Harmonic Resonance Principles",
    description:
      "Scholar Lyra publishes her groundbreaking work on harmonic resonance, revolutionizing magical theory and practice.",
    eventType: "technological",
    importance: 9,
    involvedFigures: [4],
    figureInfluenceContribution: { 4: 100 },
  },
  {
    id: 8,
    year: 1100,
    title: "The Succession of Queen Elara",
    description:
      "After 80 years of rule, King Aldric passes the throne to Queen Elara, ensuring the continuity of the empire.",
    eventType: "political",
    importance: 8,
    involvedFigures: [1, 2],
    figureInfluenceContribution: { 1: 40, 2: 60 },
  },
];

const EVENT_TYPE_COLORS: Record<string, string> = {
  political: "bg-purple-500",
  war: "bg-red-500",
  technological: "bg-blue-500",
  cultural: "bg-pink-500",
  religious: "bg-yellow-500",
  natural: "bg-green-500",
};

export default function Timeline() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredEvents = filterType
    ? SAMPLE_EVENTS.filter(e => e.eventType === filterType)
    : SAMPLE_EVENTS;

  const eventTypes = Array.from(new Set(SAMPLE_EVENTS.map(e => e.eventType)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Event Timeline</h1>
              <p className="text-muted-foreground mt-1">
                Explore the interconnected events that shaped civilizations, driven by notable figures
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Events</CardTitle>
                <CardDescription>By event type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setFilterType(null)}
                  className={`w-full text-left p-2 rounded-lg border transition-colors ${
                    filterType === null
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background border-border hover:bg-muted"
                  }`}
                >
                  <span className="font-semibold text-sm">All Events</span>
                  <div className="text-xs text-muted-foreground">{SAMPLE_EVENTS.length} total</div>
                </button>

                {eventTypes.map(type => {
                  const count = SAMPLE_EVENTS.filter(e => e.eventType === type).length;
                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`w-full text-left p-2 rounded-lg border transition-colors ${
                        filterType === type
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${EVENT_TYPE_COLORS[type] || "bg-gray-500"}`}
                        />
                        <span className="font-semibold text-sm capitalize">{type}</span>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">{count} events</div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Timeline Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                  <div className="text-2xl font-bold">{SAMPLE_EVENTS.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Time Span</div>
                  <div className="text-2xl font-bold">
                    {Math.max(...SAMPLE_EVENTS.map(e => e.year)) -
                      Math.min(...SAMPLE_EVENTS.map(e => e.year))}{" "}
                    years
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg. Importance</div>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      SAMPLE_EVENTS.reduce((sum, e) => sum + e.importance, 0) / SAMPLE_EVENTS.length
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Timeline */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {filterType ? `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Events` : "All Events"}
                </CardTitle>
                <CardDescription>{filteredEvents.length} events in this view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedEvent?.id === event.id
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold text-sm">{event.year}</span>
                            <Badge
                              className={`${EVENT_TYPE_COLORS[event.eventType] || "bg-gray-500"} text-white text-xs capitalize`}
                            >
                              {event.eventType}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-base mb-1">{event.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>Importance: {event.importance}/10</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{event.involvedFigures.length} figures</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Detail */}
            {selectedEvent && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{selectedEvent.title}</CardTitle>
                  <CardDescription>Year {selectedEvent.year}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Event Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Type</div>
                        <div className="font-semibold capitalize">{selectedEvent.eventType}</div>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Importance</div>
                        <div className="font-semibold">{selectedEvent.importance}/10</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Figure Involvement</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedEvent.figureInfluenceContribution).map(
                        ([figureId, contribution]) => {
                          const total = Object.values(
                            selectedEvent.figureInfluenceContribution
                          ).reduce((a, b) => a + b, 0);
                          const percentage = Math.round((contribution / total) * 100);
                          return (
                            <div key={figureId}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Figure #{figureId}</span>
                                <span className="font-semibold">{percentage}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-accent h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
