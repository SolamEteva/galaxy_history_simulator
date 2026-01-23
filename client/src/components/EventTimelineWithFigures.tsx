/**
 * Event Timeline with Figure Attribution Component
 * Displays events with figure attribution, influence metrics, and achievement compounds
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Zap, Users, TrendingUp } from "lucide-react";

interface Figure {
  id: number;
  name: string;
  archetype: string;
  influence: number;
  legacy: number;
}

interface Event {
  id: number;
  year: number;
  title: string;
  description: string;
  eventType: string;
  importance: number;
  involvedFigures?: number[];
  figureInfluenceContribution?: Record<number, number>;
}

interface EventTimelineWithFiguresProps {
  events: Event[];
  figures: Map<number, Figure>;
  onEventSelect?: (event: Event) => void;
  onFigureSelect?: (figure: Figure) => void;
}

/**
 * Individual timeline event component
 */
interface TimelineEventProps {
  event: Event;
  figures: Map<number, Figure>;
  index: number;
  total: number;
  onEventSelect?: (event: Event) => void;
  onFigureSelect?: (figure: Figure) => void;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({
  event,
  figures,
  index,
  total,
  onEventSelect,
  onFigureSelect,
}) => {
  const [expanded, setExpanded] = useState(false);

  const involvedFigures = event.involvedFigures
    ?.map(id => figures.get(id))
    .filter(Boolean) as Figure[];

  const totalInfluenceContribution = event.involvedFigures?.reduce(
    (sum, figureId) => sum + (event.figureInfluenceContribution?.[figureId] || 0),
    0
  ) || 0;

  const eventTypeColors: Record<string, string> = {
    discovery: "bg-blue-500",
    war: "bg-red-500",
    peace: "bg-green-500",
    cultural: "bg-purple-500",
    technological: "bg-cyan-500",
    religious: "bg-yellow-500",
    political: "bg-orange-500",
    natural: "bg-emerald-500",
  };

  const eventColor = eventTypeColors[event.eventType] || "bg-gray-500";

  const importanceStars = Math.round(event.importance / 2);

  return (
    <div className="relative">
      {/* Timeline connector */}
      {index < total - 1 && (
        <div className="absolute left-6 top-16 w-0.5 h-12 bg-border" />
      )}

      {/* Timeline dot */}
      <div className="absolute left-0 top-4 w-4 h-4 bg-primary rounded-full border-2 border-background" />

      {/* Event card */}
      <Card className="ml-12 cursor-pointer hover:border-primary transition-colors">
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => {
            setExpanded(!expanded);
            onEventSelect?.(event);
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-sm truncate">{event.title}</CardTitle>
                <Badge className={`${eventColor} text-white text-xs capitalize flex-shrink-0`}>
                  {event.eventType}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">Year {event.year}</div>
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            )}
          </div>
        </CardHeader>

        {/* Event details */}
        <CardContent className="space-y-3">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>

          {/* Importance indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Importance:</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Zap
                  key={i}
                  className={`w-3 h-3 ${
                    i < importanceStars ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Expandable section */}
          {expanded && (
            <div className="space-y-3 pt-3 border-t">
              {/* Full description */}
              <div className="text-sm text-muted-foreground">{event.description}</div>

              {/* Involved figures */}
              {involvedFigures.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Key Figures ({involvedFigures.length})
                  </div>
                  <div className="space-y-2">
                    {involvedFigures.map(figure => {
                      const contribution = event.figureInfluenceContribution?.[figure.id] || 0;
                      const contributionPercent = totalInfluenceContribution > 0
                        ? Math.round((contribution / totalInfluenceContribution) * 100)
                        : 0;

                      return (
                        <div
                          key={figure.id}
                          className="p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => onFigureSelect?.(figure)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-xs truncate">
                                {figure.name}
                              </div>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize mt-1"
                              >
                                {figure.archetype}
                              </Badge>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs font-bold text-primary">
                                {contributionPercent}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Contribution
                              </div>
                            </div>
                          </div>

                          {/* Contribution bar */}
                          <div className="w-full bg-background rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-primary transition-all"
                              style={{ width: `${contributionPercent}%` }}
                            />
                          </div>

                          {/* Figure metrics */}
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Influence:</span>
                              <span className="font-semibold ml-1 text-primary">
                                {Math.round(figure.influence)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Legacy:</span>
                              <span className="font-semibold ml-1 text-primary">
                                {Math.round(figure.legacy)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Influence compound effect */}
              {totalInfluenceContribution > 0 && (
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      Combined Influence Impact
                    </span>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    +{Math.round(totalInfluenceContribution)} influence points
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    This event was shaped by {involvedFigures.length} figure
                    {involvedFigures.length !== 1 ? "s" : ""} working together
                  </div>
                </div>
              )}

              {/* No figures message */}
              {involvedFigures.length === 0 && (
                <div className="text-xs text-muted-foreground italic">
                  No key figures attributed to this event
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Main Event Timeline with Figures Component
 */
export const EventTimelineWithFigures: React.FC<EventTimelineWithFiguresProps> = ({
  events,
  figures,
  onEventSelect,
  onFigureSelect,
}) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Get unique event types
  const eventTypes = useMemo(
    () => Array.from(new Set(events.map(e => e.eventType))).sort(),
    [events]
  );

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (filterType) {
      filtered = filtered.filter(e => e.eventType === filterType);
    }

    return filtered.sort((a, b) => {
      const comparison = a.year - b.year;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [events, filterType, sortOrder]);

  // Calculate timeline statistics
  const stats = useMemo(() => {
    const figuresInvolved = new Set<number>();
    let totalInfluence = 0;

    filteredEvents.forEach(event => {
      event.involvedFigures?.forEach(figId => {
        figuresInvolved.add(figId);
        totalInfluence += event.figureInfluenceContribution?.[figId] || 0;
      });
    });

    return {
      eventsCount: filteredEvents.length,
      figuresInvolved: figuresInvolved.size,
      totalInfluence: Math.round(totalInfluence),
    };
  }, [filteredEvents]);

  return (
    <div className="w-full space-y-4">
      {/* Header with controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Event Timeline with Figure Attribution
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-primary">{stats.eventsCount}</div>
              <div className="text-xs text-muted-foreground">Events</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-primary">{stats.figuresInvolved}</div>
              <div className="text-xs text-muted-foreground">Figures Involved</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-primary">{stats.totalInfluence}</div>
              <div className="text-xs text-muted-foreground">Total Influence</div>
            </div>
          </div>

          {/* Filter and sort controls */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Event Type Filter</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(null)}
              >
                All
              </Button>
              {eventTypes.map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort control */}
          <div className="flex gap-2">
            <Button
              variant={sortOrder === "asc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortOrder("asc")}
            >
              Oldest First
            </Button>
            <Button
              variant={sortOrder === "desc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortOrder("desc")}
            >
              Newest First
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-0">
        {filteredEvents.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            figures={figures}
            index={index}
            total={filteredEvents.length}
            onEventSelect={onEventSelect}
            onFigureSelect={onFigureSelect}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              No events match your filter criteria.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventTimelineWithFigures;
