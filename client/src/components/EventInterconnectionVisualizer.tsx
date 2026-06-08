/**
 * Event Interconnection Visualizer
 * 
 * Visualizes cause-effect chains that transform isolated events into historical narrative.
 * Shows how events cascade through time, creating the web of causality that defines history.
 * This is where "valence-agnostic" philosophy becomes visible to the user.
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowRight, GitBranch } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CausalEvent {
  id: string;
  title: string;
  year: number;
  importance: number;
  eventType: string;
  causalStrength: number;
  involvedCivilizations: string[];
}

interface CausalChain {
  rootEvent: CausalEvent;
  consequences: Array<{
    event: CausalEvent;
    strength: number; // 0-1, how strongly connected
    depth: number; // How many steps from root
  }>;
  totalAffected: number;
  timeSpan: number; // Years from root to last consequence
}

interface EventInterconnectionVisualizerProps {
  galaxyId: string;
  onEventSelect?: (event: CausalEvent) => void;
}

/**
 * Get causal strength color
 */
function getCausalStrengthColor(strength: number): string {
  if (strength > 0.8) return 'bg-red-500';
  if (strength > 0.6) return 'bg-orange-500';
  if (strength > 0.4) return 'bg-yellow-500';
  return 'bg-blue-500';
}

/**
 * Get causal strength label
 */
function getCausalStrengthLabel(strength: number): string {
  if (strength > 0.8) return 'Critical';
  if (strength > 0.6) return 'Strong';
  if (strength > 0.4) return 'Moderate';
  return 'Weak';
}

/**
 * Causal Chain Card Component
 */
function CausalChainCard({
  chain,
  onEventSelect,
  expanded,
  onToggleExpand,
}: {
  chain: CausalChain;
  onEventSelect?: (event: CausalEvent) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
      {/* Root event */}
      <button
        onClick={() => {
          onToggleExpand();
          onEventSelect?.(chain.rootEvent);
        }}
        className="w-full text-left mb-3 pb-3 border-b border-slate-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate">{chain.rootEvent.title}</h4>
            <p className="text-xs text-slate-600 mt-1">
              Year {chain.rootEvent.year} • {chain.rootEvent.eventType}
            </p>
          </div>

          <div className="flex items-center gap-2 min-w-fit">
            <Badge variant="outline" className="text-xs">
              Importance: {chain.rootEvent.importance}
            </Badge>
            <ChevronRight
              className={`w-4 h-4 text-slate-600 transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Consequence summary */}
      <div className="flex items-center gap-2 text-sm text-slate-700 mb-3">
        <GitBranch className="w-4 h-4 text-slate-600" />
        <span>
          <strong>{chain.consequences.length}</strong> consequence{chain.consequences.length !== 1 ? 's' : ''} over{' '}
          <strong>{chain.timeSpan}</strong> years
        </span>
      </div>

      {/* Expanded consequences */}
      {expanded && chain.consequences.length > 0 && (
        <div className="space-y-3 mt-3 pt-3 border-t border-slate-200">
          {chain.consequences.map((item, idx) => (
            <div key={idx} className="ml-4 space-y-2">
              {/* Connector line */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-3 bg-slate-300"></div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xs text-slate-600 font-mono">+{item.event.year - chain.rootEvent.year} years</div>
              </div>

              {/* Consequence event */}
              <button
                onClick={() => onEventSelect?.(item.event)}
                className="block w-full text-left p-2 rounded hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.event.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Year {item.event.year} • {item.event.eventType}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 min-w-fit">
                    {/* Causal strength indicator */}
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className={`w-6 h-1 rounded-full ${getCausalStrengthColor(item.strength)}`}
                      ></div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {getCausalStrengthLabel(item.strength)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Collapsed summary */}
      {!expanded && chain.consequences.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {chain.consequences.slice(0, 3).map((item, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {item.event.eventType}
            </Badge>
          ))}
          {chain.consequences.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{chain.consequences.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Causal Network Statistics Component
 */
function CausalNetworkStats({ chains }: { chains: CausalChain[] }) {
  const stats = useMemo(() => {
    if (chains.length === 0) {
      return {
        totalEvents: 0,
        avgChainLength: 0,
        maxChainLength: 0,
        totalConnections: 0,
        avgCausalStrength: 0,
      };
    }

    const totalEvents = chains.reduce((sum, c) => sum + c.consequences.length + 1, 0);
    const totalConnections = chains.reduce((sum, c) => sum + c.consequences.length, 0);
    const avgChainLength = totalConnections / chains.length;
    const maxChainLength = Math.max(...chains.map((c) => c.consequences.length));
    const avgCausalStrength =
      chains.reduce((sum, c) => sum + c.consequences.reduce((s, item) => s + item.strength, 0), 0) /
        Math.max(totalConnections, 1) || 0;

    return {
      totalEvents,
      avgChainLength: avgChainLength.toFixed(1),
      maxChainLength,
      totalConnections,
      avgCausalStrength: (avgCausalStrength * 100).toFixed(0),
    };
  }, [chains]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="text-xs text-slate-600 mb-1">Total Events</div>
        <div className="text-2xl font-bold text-slate-900">{stats.totalEvents}</div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="text-xs text-slate-600 mb-1">Causal Connections</div>
        <div className="text-2xl font-bold text-slate-900">{stats.totalConnections}</div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="text-xs text-slate-600 mb-1">Avg Chain Length</div>
        <div className="text-2xl font-bold text-slate-900">{stats.avgChainLength}</div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
        <div className="text-xs text-slate-600 mb-1">Avg Causal Strength</div>
        <div className="text-2xl font-bold text-slate-900">{stats.avgCausalStrength}%</div>
      </div>
    </div>
  );
}

/**
 * Main Component
 */
export function EventInterconnectionVisualizer({
  galaxyId,
  onEventSelect,
}: EventInterconnectionVisualizerProps) {
  const [expandedChainIdx, setExpandedChainIdx] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch causal chains
  const { data: chainsData, isLoading } = trpc.simulationTickScheduler.getCausalChains.useQuery(
    { galaxyId },
    { refetchInterval: 3000 }
  );

  // Transform data into causal chains
  const chains: CausalChain[] = useMemo(() => {
    if (!chainsData?.chains) return [];

    return chainsData.chains
      .map((chain) => ({
        rootEvent: chain.rootEvent,
        consequences: chain.consequences,
        totalAffected: chain.consequences.length + 1,
        timeSpan: chain.consequences.length > 0 ? Math.max(...chain.consequences.map((c) => c.event.year)) - chain.rootEvent.year : 0,
      }))
      .filter((chain) => {
        if (filterType === 'all') return true;
        if (filterType === 'critical') return chain.consequences.some((c) => c.strength > 0.7);
        if (filterType === 'long') return chain.timeSpan > 500;
        return true;
      })
      .sort((a, b) => b.rootEvent.importance - a.rootEvent.importance);
  }, [chainsData?.chains, filterType]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Interconnection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600">Loading causal chains...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Interconnection</CardTitle>
        <CardDescription>
          Cause-effect chains that transform isolated events into historical narrative
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistics */}
        <CausalNetworkStats chains={chains} />

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All Chains
          </Button>
          <Button
            variant={filterType === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('critical')}
          >
            Critical Only
          </Button>
          <Button
            variant={filterType === 'long' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('long')}
          >
            Long-Term
          </Button>
        </div>

        {/* Causal chains */}
        {chains.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No causal chains found matching the selected filter
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chains.map((chain, idx) => (
              <CausalChainCard
                key={idx}
                chain={chain}
                onEventSelect={onEventSelect}
                expanded={expandedChainIdx === idx}
                onToggleExpand={() => setExpandedChainIdx(expandedChainIdx === idx ? null : idx)}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-700 mb-2">Causal Strength</div>
          <div className="flex gap-4 flex-wrap">
            {[
              { strength: 0.9, label: 'Critical' },
              { strength: 0.7, label: 'Strong' },
              { strength: 0.5, label: 'Moderate' },
              { strength: 0.2, label: 'Weak' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-1 rounded-full ${getCausalStrengthColor(item.strength)}`}></div>
                <span className="text-xs text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
