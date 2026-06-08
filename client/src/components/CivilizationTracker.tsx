/**
 * Civilization Tracker
 * 
 * Visualizes the arc of a civilization: emergence → resonance → decline → legacy
 * Shows population, technology, culture, and emotional state across time.
 * This is the human-readable story layer that makes galactic mechanics meaningful.
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Zap, Heart, Users, BookOpen } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CivilizationState {
  year: number;
  population: number;
  technology: number;
  culture: number;
  emotionalState: {
    trust: number;
    desperation: number;
    curiosity: number;
    ambition: number;
  };
  phase: 'emergence' | 'resonance' | 'decline' | 'legacy';
  majorEvents: Array<{
    year: number;
    title: string;
    importance: number;
  }>;
}

interface CivilizationTrackerProps {
  galaxyId: string;
  civilizationId: string;
  civilizationName: string;
}

/**
 * Determine civilization phase based on metrics
 */
function determineCivilizationPhase(
  population: number,
  technology: number,
  culture: number,
  emotionalState: Record<string, number>
): 'emergence' | 'resonance' | 'decline' | 'legacy' {
  const trust = emotionalState['trust'] || 50;
  const desperation = emotionalState['desperation'] || 30;

  // Legacy: civilization has ended but left lasting impact
  if (population === 0) return 'legacy';

  // Decline: population dropping, desperation rising
  if (population < 50 || desperation > 70) return 'decline';

  // Resonance: peak civilization, high culture and technology, high trust
  if (technology > 70 && culture > 70 && trust > 60) return 'resonance';

  // Emergence: early civilization, low tech but growing
  return 'emergence';
}

/**
 * Get phase color
 */
function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    emergence: 'bg-yellow-100 text-yellow-800',
    resonance: 'bg-green-100 text-green-800',
    decline: 'bg-red-100 text-red-800',
    legacy: 'bg-purple-100 text-purple-800',
  };
  return colors[phase] || 'bg-gray-100 text-gray-800';
}

/**
 * Get phase description
 */
function getPhaseDescription(phase: string): string {
  const descriptions: Record<string, string> = {
    emergence: 'Early civilization, discovering itself',
    resonance: 'Peak civilization, flourishing in culture and technology',
    decline: 'Struggling civilization, facing existential challenges',
    legacy: 'Civilization has ended, but its impact endures',
  };
  return descriptions[phase] || 'Unknown phase';
}

/**
 * Timeline Arc Component
 */
function TimelineArc({
  states,
  onStateSelect,
}: {
  states: CivilizationState[];
  onStateSelect: (state: CivilizationState) => void;
}) {
  if (states.length === 0) return null;

  const minYear = Math.min(...states.map((s) => s.year));
  const maxYear = Math.max(...states.map((s) => s.year));
  const yearRange = maxYear - minYear || 1;

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-slate-700">Civilization Arc ({minYear} - {maxYear})</div>

      {/* Timeline visualization */}
      <div className="relative h-32 bg-slate-50 rounded-lg border border-slate-200 p-4">
        {/* Grid lines for phases */}
        <div className="absolute inset-0 flex opacity-10 pointer-events-none">
          <div className="flex-1 border-r border-slate-400"></div>
          <div className="flex-1 border-r border-slate-400"></div>
          <div className="flex-1 border-r border-slate-400"></div>
          <div className="flex-1"></div>
        </div>

        {/* Phase labels */}
        <div className="absolute inset-0 flex text-xs text-slate-500 font-semibold pointer-events-none">
          <div className="flex-1 text-center">Emergence</div>
          <div className="flex-1 text-center">Resonance</div>
          <div className="flex-1 text-center">Decline</div>
          <div className="flex-1 text-center">Legacy</div>
        </div>

        {/* Data points */}
        <div className="absolute inset-0 p-4">
          {states.map((state, idx) => {
            const xPercent = ((state.year - minYear) / yearRange) * 100;
            const yPercent = (state.population / 100) * 80 + 10; // Normalize to 10-90% of height

            return (
              <button
                key={idx}
                onClick={() => onStateSelect(state)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                }}
              >
                {/* Outer glow */}
                <div
                  className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    state.phase === 'emergence'
                      ? 'bg-yellow-400'
                      : state.phase === 'resonance'
                        ? 'bg-green-400'
                        : state.phase === 'decline'
                          ? 'bg-red-400'
                          : 'bg-purple-400'
                  }`}
                  style={{ width: '24px', height: '24px', marginLeft: '-12px', marginTop: '-12px' }}
                ></div>

                {/* Point */}
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white ${
                    state.phase === 'emergence'
                      ? 'bg-yellow-500'
                      : state.phase === 'resonance'
                        ? 'bg-green-500'
                        : state.phase === 'decline'
                          ? 'bg-red-500'
                          : 'bg-purple-500'
                  }`}
                  style={{ marginLeft: '-6px', marginTop: '-6px' }}
                ></div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Year {state.year}: Pop {state.population}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Year range */}
      <div className="flex justify-between text-xs text-slate-600">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
}

/**
 * Metrics Panel Component
 */
function MetricsPanel({ state }: { state: CivilizationState }) {
  const metrics = [
    { label: 'Population', value: state.population, icon: Users, color: 'text-blue-600' },
    { label: 'Technology', value: state.technology, icon: Zap, color: 'text-yellow-600' },
    { label: 'Culture', value: state.culture, icon: BookOpen, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${metric.color}`} />
              <span className="text-xs font-semibold text-slate-700">{metric.label}</span>
            </div>

            <div className="mb-2">
              <div className="text-lg font-bold text-slate-900">{metric.value}</div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${metric.color}`}
                style={{ width: `${metric.value}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Emotional State Panel Component
 */
function EmotionalStatePanel({ state }: { state: CivilizationState }) {
  const emotions = [
    { label: 'Trust', value: state.emotionalState.trust, color: 'bg-green-500' },
    { label: 'Desperation', value: state.emotionalState.desperation, color: 'bg-red-500' },
    { label: 'Curiosity', value: state.emotionalState.curiosity, color: 'bg-blue-500' },
    { label: 'Ambition', value: state.emotionalState.ambition, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-3">
      {emotions.map((emotion) => (
        <div key={emotion.label}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-slate-700">{emotion.label}</span>
            <span className="text-sm font-bold text-slate-900">{emotion.value}</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${emotion.color}`}
              style={{ width: `${emotion.value}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Major Events Panel Component
 */
function MajorEventsPanel({ events }: { events: Array<{ year: number; title: string; importance: number }> }) {
  if (events.length === 0) {
    return <div className="text-center py-4 text-slate-600 text-sm">No major events recorded</div>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {events
        .sort((a, b) => b.year - a.year)
        .map((event, idx) => (
          <div key={idx} className="flex items-start gap-3 pb-2 border-b border-slate-200 last:border-0">
            <div className="text-xs font-mono text-slate-600 min-w-fit">Year {event.year}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{event.title}</p>
              <Badge variant="outline" className="text-xs mt-1">
                Importance: {event.importance}
              </Badge>
            </div>

            {event.importance > 7 && (
              <div className="text-red-500">
                <TrendingUp className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

/**
 * Main Component
 */
export function CivilizationTracker({
  galaxyId,
  civilizationId,
  civilizationName,
}: CivilizationTrackerProps) {
  const [selectedStateIdx, setSelectedStateIdx] = useState(0);

  // Fetch civilization history
  const { data: historyData, isLoading } = trpc.simulationTickScheduler.getCivilizationDetails.useQuery(
    { galaxyId, civilizationId },
    { refetchInterval: 3000 }
  );

  // Transform history into civilization states
  const states: CivilizationState[] = useMemo(() => {
    if (!historyData?.history) return [];

    return historyData.history.map((h) => ({
      year: h.year,
      population: h.population,
      technology: h.technology,
      culture: h.culture,
      emotionalState: h.emotionalState,
      phase: determineCivilizationPhase(h.population, h.technology, h.culture, h.emotionalState),
      majorEvents: h.majorEvents || [],
    }));
  }, [historyData?.history]);

  const selectedState = states[selectedStateIdx] || states[states.length - 1];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{civilizationName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600">Loading civilization history...</div>
        </CardContent>
      </Card>
    );
  }

  if (states.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{civilizationName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600">No history data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{civilizationName}</CardTitle>
            <CardDescription>
              {selectedState && (
                <>
                  Year {selectedState.year} •{' '}
                  <Badge className={getPhaseColor(selectedState.phase)}>
                    {selectedState.phase.charAt(0).toUpperCase() + selectedState.phase.slice(1)}
                  </Badge>
                </>
              )}
            </CardDescription>
          </div>

          {selectedState && (
            <div className="text-right">
              <div className="text-xs text-slate-600 mb-1">Current Status</div>
              <div className="text-sm font-semibold text-slate-900">{getPhaseDescription(selectedState.phase)}</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timeline Arc */}
        <TimelineArc
          states={states}
          onStateSelect={(state) => {
            const idx = states.findIndex((s) => s.year === state.year);
            if (idx !== -1) setSelectedStateIdx(idx);
          }}
        />

        {/* Tabs for different views */}
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="emotions">Emotional State</TabsTrigger>
            <TabsTrigger value="events">Major Events</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            {selectedState && <MetricsPanel state={selectedState} />}
          </TabsContent>

          <TabsContent value="emotions" className="space-y-4">
            {selectedState && <EmotionalStatePanel state={selectedState} />}
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {selectedState && <MajorEventsPanel events={selectedState.majorEvents} />}
          </TabsContent>
        </Tabs>

        {/* Summary statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div>
            <div className="text-xs text-slate-600 mb-1">Lifespan</div>
            <div className="text-lg font-bold text-slate-900">
              {states[0]?.year} - {states[states.length - 1]?.year}
            </div>
            <div className="text-xs text-slate-600">
              {states[states.length - 1]?.year - (states[0]?.year || 0)} years
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-600 mb-1">Peak Population</div>
            <div className="text-lg font-bold text-slate-900">
              {Math.max(...states.map((s) => s.population))}
            </div>
            <div className="text-xs text-slate-600">
              {states.find((s) => s.population === Math.max(...states.map((s) => s.population)))?.year}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
