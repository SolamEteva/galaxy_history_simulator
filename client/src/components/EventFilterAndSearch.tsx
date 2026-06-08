/**
 * Event Filtering and Full-Text Search
 * 
 * Provides comprehensive filtering by type, civilization, importance, date range,
 * and full-text search across event narratives and descriptions.
 * Uses backend searchEvents endpoint for efficient full-history searching.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface EventFilterState {
  searchQuery: string;
  eventTypes: string[];
  civilizations: string[];
  importanceRange: [number, number];
  yearRange: [number, number];
  cascadeOnly: boolean;
}

interface FilteredEvent {
  id: string;
  title: string;
  eventType: string;
  year: number;
  importance: number;
  involvedCivilizations: string[];
  causalStrength: number;
  narrative?: string;
}

interface EventFilterAndSearchProps {
  galaxyId: string;
  onEventSelect?: (event: FilteredEvent) => void;
}

/**
 * Filter Panel Component
 */
function FilterPanel({
  filters,
  onFilterChange,
  eventTypes,
  civilizations,
  yearRange,
}: {
  filters: EventFilterState;
  onFilterChange: (filters: EventFilterState) => void;
  eventTypes: string[];
  civilizations: string[];
  yearRange: [number, number];
}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    types: true,
    civilizations: true,
    importance: true,
    year: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleEventType = (type: string) => {
    const updated = filters.eventTypes.includes(type)
      ? filters.eventTypes.filter((t) => t !== type)
      : [...filters.eventTypes, type];

    onFilterChange({ ...filters, eventTypes: updated });
  };

  const toggleCivilization = (civ: string) => {
    const updated = filters.civilizations.includes(civ)
      ? filters.civilizations.filter((c) => c !== civ)
      : [...filters.civilizations, civ];

    onFilterChange({ ...filters, civilizations: updated });
  };

  const yearRangeTyped = yearRange as [number, number];

  return (
    <div className="space-y-4">
      {/* Event Types */}
      <div className="border rounded-lg">
        <button
          onClick={() => toggleSection('types')}
          className="w-full px-4 py-2 flex justify-between items-center hover:bg-slate-50"
        >
          <span className="font-semibold text-sm">Event Types</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expandedSections.types ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.types && (
          <div className="px-4 py-3 border-t space-y-2">
            {eventTypes.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.eventTypes.includes(type)}
                  onChange={() => toggleEventType(type)}
                  className="rounded"
                />
                <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Civilizations */}
      <div className="border rounded-lg">
        <button
          onClick={() => toggleSection('civilizations')}
          className="w-full px-4 py-2 flex justify-between items-center hover:bg-slate-50"
        >
          <span className="font-semibold text-sm">Civilizations</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expandedSections.civilizations ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.civilizations && (
          <div className="px-4 py-3 border-t space-y-2 max-h-48 overflow-y-auto">
            {civilizations.map((civ) => (
              <label key={civ} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.civilizations.includes(civ)}
                  onChange={() => toggleCivilization(civ)}
                  className="rounded"
                />
                <span className="text-sm">{civ}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Importance Range */}
      <div className="border rounded-lg">
        <button
          onClick={() => toggleSection('importance')}
          className="w-full px-4 py-2 flex justify-between items-center hover:bg-slate-50"
        >
          <span className="font-semibold text-sm">Importance</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expandedSections.importance ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.importance && (
          <div className="px-4 py-3 border-t space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Min: {filters.importanceRange[0]}</span>
              <span>Max: {filters.importanceRange[1]}</span>
            </div>

            <Slider
              min={0}
              max={10}
              step={1}
              value={filters.importanceRange}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  importanceRange: [value[0], value[1]],
                })
              }
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Year Range */}
      <div className="border rounded-lg">
        <button
          onClick={() => toggleSection('year')}
          className="w-full px-4 py-2 flex justify-between items-center hover:bg-slate-50"
        >
          <span className="font-semibold text-sm">Year Range</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expandedSections.year ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSections.year && (
          <div className="px-4 py-3 border-t space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>From: {filters.yearRange[0]}</span>
              <span>To: {filters.yearRange[1]}</span>
            </div>

            <Slider
              min={yearRangeTyped[0]}
              max={yearRangeTyped[1]}
              step={1}
              value={filters.yearRange}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  yearRange: [value[0], value[1]],
                })
              }
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Cascade Only */}
      <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
        <input
          type="checkbox"
          checked={filters.cascadeOnly}
          onChange={(e) => onFilterChange({ ...filters, cascadeOnly: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm font-medium">Cascade Events Only</span>
      </label>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          onFilterChange({
            searchQuery: '',
            eventTypes: [],
            civilizations: [],
            importanceRange: [0, 10],
            yearRange: yearRangeTyped,
            cascadeOnly: false,
          })
        }
      >
        Clear All Filters
      </Button>
    </div>
  );
}

/**
 * Event List Component
 */
function EventList({
  events,
  onEventSelect,
}: {
  events: FilteredEvent[];
  onEventSelect?: (event: FilteredEvent) => void;
}) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600">
        <p>No events match your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onEventSelect?.(event)}
          className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{event.title}</h4>
              {event.narrative && (
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{event.narrative}</p>
              )}
            </div>

            <div className="text-right ml-4">
              <div className="text-xs font-mono text-slate-600">Year {event.year}</div>
              <Badge variant="outline" className="text-xs mt-1">
                Importance: {event.importance}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {event.eventType}
            </Badge>

            {event.causalStrength > 0.7 && (
              <Badge className="text-xs bg-red-100 text-red-800">Cascade</Badge>
            )}

            {event.involvedCivilizations.slice(0, 2).map((civ) => (
              <Badge key={civ} variant="outline" className="text-xs">
                {civ}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main Component
 */
export function EventFilterAndSearch({ galaxyId, onEventSelect }: EventFilterAndSearchProps) {
  const [filters, setFilters] = useState<EventFilterState>({
    searchQuery: '',
    eventTypes: [],
    civilizations: [],
    importanceRange: [0, 10],
    yearRange: [0, 10000],
    cascadeOnly: false,
  });

  // Search events using backend endpoint
  const { data: eventsData, isLoading } = trpc.simulationTickScheduler.searchEvents.useQuery(
    {
      galaxyId,
      query: filters.searchQuery || '*',
      eventTypes: filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
      civilizations: filters.civilizations.length > 0 ? filters.civilizations : undefined,
      importanceMin: filters.importanceRange[0],
      importanceMax: filters.importanceRange[1],
      yearMin: filters.yearRange[0],
      yearMax: filters.yearRange[1],
      cascadeOnly: filters.cascadeOnly,
      limit: 100,
      offset: 0,
    },
    { refetchInterval: 2000, enabled: filters.searchQuery.length > 0 || filters.cascadeOnly }
  );

  // Extract unique event types and civilizations
  const { eventTypes, civilizations, yearRange } = useMemo(() => {
    if (!eventsData?.events) {
      return { eventTypes: [], civilizations: [], yearRange: [0, 10000] as [number, number] };
    }

    const types = new Set<string>();
    const civs = new Set<string>();
    let minYear = Infinity;
    let maxYear = -Infinity;

    eventsData.events.forEach((event) => {
      types.add(event.eventType);
      event.involvedCivilizations.forEach((civ) => civs.add(civ as any));
      minYear = Math.min(minYear, event.year);
      maxYear = Math.max(maxYear, event.year);
    });

    return {
      eventTypes: Array.from(types).sort(),
      civilizations: Array.from(civs).sort(),
      yearRange: [minYear === Infinity ? 0 : minYear, maxYear === -Infinity ? 10000 : maxYear] as [number, number],
    };
  }, [eventsData?.events]);

  // Transform events for display
  const filteredEvents = useMemo(() => {
    if (!eventsData?.events) return [];

    return eventsData.events.map((e) => ({
      id: e.id,
      title: e.title,
      eventType: e.eventType,
      year: e.year,
      importance: e.importance,
      involvedCivilizations: e.involvedCivilizations as any,
      causalStrength: e.causalStrength,
      narrative: e.narrative,
    }));
  }, [eventsData?.events]);

  if (isLoading && filters.searchQuery.length === 0 && !filters.cascadeOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600">Enter a search query or select filters to begin</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Search & Filter</CardTitle>
        <CardDescription>
          {isLoading ? 'Searching...' : `${eventsData?.total || 0} events match your filters`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search events by title or narrative..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filters and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              eventTypes={eventTypes}
              civilizations={civilizations}
              yearRange={yearRange as [number, number]}
            />
          </div>

          {/* Event List */}
          <div className="lg:col-span-3">
            <EventList events={filteredEvents} onEventSelect={onEventSelect} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
