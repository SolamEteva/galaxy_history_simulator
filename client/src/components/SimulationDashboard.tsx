/**
 * Simulation Dashboard: Unified Control Center
 * 
 * Integrates simulation controls, real-time visualization, and event streaming
 * into a single dashboard for monitoring and controlling the simulation.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { CrisisCascadeVisualizerRealtime } from './CrisisCascadeVisualizerRealtime';
import { useSimulationRealtime } from '@/hooks/useSimulationRealtime';

interface SimulationDashboardProps {
  galaxyId: string;
}

/**
 * Event Stream Panel: Shows recent events
 */
function EventStreamPanel({ galaxyId }: { galaxyId: string }) {
  const realtime = useSimulationRealtime(galaxyId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Stream</CardTitle>
        <CardDescription>{realtime.eventStream.length} events</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {realtime.eventStream.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-sm">No events yet</div>
          ) : (
            realtime.eventStream.slice(0, 10).map((event) => (
              <div key={event.id} className="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
                <div className="font-medium">{event.title}</div>
                <div className="text-xs text-slate-600 mt-1">Year {event.year}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {event.eventType}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Importance: {event.importance}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simulation Statistics Panel
 */
function StatisticsPanel({ galaxyId }: { galaxyId: string }) {
  const realtime = useSimulationRealtime(galaxyId);
  const lastTick = realtime.lastTick;

  if (!lastTick) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-600 text-sm">Waiting for simulation data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Statistics</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <div className="text-sm text-slate-600">Current Year</div>
          <div className="text-2xl font-bold mt-1">{lastTick.year}</div>
        </div>

        <div className="bg-green-50 p-4 rounded border border-green-200">
          <div className="text-sm text-slate-600">Tick</div>
          <div className="text-2xl font-bold mt-1">{lastTick.tick}</div>
        </div>

        <div className="bg-purple-50 p-4 rounded border border-purple-200">
          <div className="text-sm text-slate-600">Events This Tick</div>
          <div className="text-2xl font-bold mt-1">{lastTick.eventCount}</div>
        </div>

        <div className="bg-red-50 p-4 rounded border border-red-200">
          <div className="text-sm text-slate-600">Cascades This Tick</div>
          <div className="text-2xl font-bold mt-1">{lastTick.cascadeCount}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simulation Controls Panel
 */
function ControlsPanel({ galaxyId }: { galaxyId: string }) {
  const [speed, setSpeed] = useState(1);
  const realtime = useSimulationRealtime(galaxyId);

  const playMutation = trpc.simulationTickScheduler.playSimulation.useMutation();
  const pauseMutation = trpc.simulationTickScheduler.pauseSimulation.useMutation();
  const stopMutation = trpc.simulationTickScheduler.stopSimulation.useMutation();
  const speedMutation = trpc.simulationTickScheduler.setSimulationSpeed.useMutation();

  const isRunning = realtime.lastTick?.state.isRunning || false;

  const handlePlay = async () => {
    await playMutation.mutateAsync({ galaxyId });
  };

  const handlePause = async () => {
    await pauseMutation.mutateAsync({ galaxyId });
  };

  const handleStop = async () => {
    await stopMutation.mutateAsync({ galaxyId });
  };

  const handleSpeedChange = async (newSpeed: number) => {
    setSpeed(newSpeed);
    await speedMutation.mutateAsync({ galaxyId, speed: newSpeed });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Simulation Controls</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Playback Controls */}
        <div className="flex gap-2">
          <Button
            onClick={handlePlay}
            disabled={isRunning || playMutation.isPending}
            className="flex-1"
            variant={isRunning ? 'secondary' : 'default'}
          >
            <Play className="w-4 h-4 mr-2" />
            Play
          </Button>

          <Button
            onClick={handlePause}
            disabled={!isRunning || pauseMutation.isPending}
            className="flex-1"
            variant="outline"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>

          <Button onClick={handleStop} disabled={stopMutation.isPending} className="flex-1" variant="outline">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Speed</label>
            <span className="text-sm font-mono">{speed.toFixed(1)}x</span>
          </div>

          <Slider
            min={0.1}
            max={5}
            step={0.1}
            value={[speed]}
            onValueChange={([newSpeed]) => handleSpeedChange(newSpeed)}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-slate-600">
            <span>0.1x</span>
            <span>5.0x</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-slate-50 p-3 rounded border border-slate-200">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-slate-400'}`} />
            <span className="text-sm font-medium">{isRunning ? 'Running' : 'Paused'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Dashboard Component
 */
export function SimulationDashboard({ galaxyId }: SimulationDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Simulation Dashboard</h1>
        <p className="text-slate-600 mt-1">Monitor and control the galaxy history simulation in real-time</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls and Statistics */}
        <div className="space-y-6">
          <ControlsPanel galaxyId={galaxyId} />
          <StatisticsPanel galaxyId={galaxyId} />
        </div>

        {/* Right Column: Event Stream */}
        <div className="lg:col-span-2">
          <EventStreamPanel galaxyId={galaxyId} />
        </div>
      </div>

      {/* Crisis Cascade Visualizer */}
      <div>
        <CrisisCascadeVisualizerRealtime galaxyId={galaxyId} />
      </div>

      {/* Detailed Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="events">
            <TabsList>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="cascades">Cascades</TabsTrigger>
              <TabsTrigger value="civilizations">Civilizations</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-4">
              <div className="text-center py-8 text-slate-600">
                <p>Event details will appear here as the simulation runs</p>
              </div>
            </TabsContent>

            <TabsContent value="cascades" className="mt-4">
              <div className="text-center py-8 text-slate-600">
                <p>Cascade analysis will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="civilizations" className="mt-4">
              <div className="text-center py-8 text-slate-600">
                <p>Civilization data will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
