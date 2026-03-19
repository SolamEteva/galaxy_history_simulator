/**
 * Simulation Control Panel Component
 * 
 * Provides controls for:
 * - Play/Pause/Stop simulation
 * - Speed adjustment
 * - Event injection
 * - Civilization parameter editing
 * - Simulation state persistence
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  StopCircle,
  Zap,
  Settings,
  Plus,
  Trash2,
  Save,
  RotateCcw,
} from "lucide-react";

interface SimulationState {
  status: "running" | "paused" | "stopped";
  currentTick: number;
  speed: number;
  totalEvents: number;
  totalCascades: number;
}

interface CivilizationParameter {
  id: string;
  name: string;
  population: number;
  technology: number;
  culture: number;
  resources: number;
}

interface SimulationControlPanelProps {
  simulationState: SimulationState;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onSpeedChange?: (speed: number) => void;
  onEventInject?: (eventType: string, actors: string[]) => void;
  onParameterChange?: (civilizationId: string, parameter: Partial<CivilizationParameter>) => void;
  civilizations?: CivilizationParameter[];
}

export default function SimulationControlPanel({
  simulationState,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onEventInject,
  onParameterChange,
  civilizations = [],
}: SimulationControlPanelProps) {
  const [selectedCivilization, setSelectedCivilization] = useState<string | null>(
    civilizations[0]?.id || null
  );
  const [eventType, setEventType] = useState("war");
  const [showEventForm, setShowEventForm] = useState(false);

  const selectedCiv = civilizations.find((c) => c.id === selectedCivilization);

  const eventTypes = [
    "war",
    "discovery",
    "trade_agreement",
    "cultural_shift",
    "technological_breakthrough",
    "natural_disaster",
    "political_crisis",
    "first_contact",
  ];

  return (
    <div className="space-y-6">
      {/* Playback Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="w-5 h-5" />
            Playback Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Display */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Status</p>
              <Badge
                variant={
                  simulationState.status === "running"
                    ? "default"
                    : simulationState.status === "paused"
                      ? "secondary"
                      : "outline"
                }
                className="mt-1"
              >
                {simulationState.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-400">Current Tick</p>
              <p className="text-2xl font-bold text-white">{simulationState.currentTick}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Events</p>
              <p className="text-2xl font-bold text-white">{simulationState.totalEvents}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Cascades</p>
              <p className="text-2xl font-bold text-white">{simulationState.totalCascades}</p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onPlay}
              disabled={simulationState.status === "running"}
              className="flex-1 gap-2"
              variant={simulationState.status === "running" ? "secondary" : "default"}
            >
              <Play className="w-4 h-4" />
              Play
            </Button>
            <Button
              onClick={onPause}
              disabled={simulationState.status !== "running"}
              className="flex-1 gap-2"
              variant="outline"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
            <Button
              onClick={onStop}
              disabled={simulationState.status === "stopped"}
              className="flex-1 gap-2"
              variant="outline"
            >
              <StopCircle className="w-4 h-4" />
              Stop
            </Button>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300">Speed</label>
              <span className="text-sm text-slate-400">{simulationState.speed.toFixed(1)}x</span>
            </div>
            <Slider
              value={[simulationState.speed]}
              onValueChange={(value) => onSpeedChange?.(value[0])}
              min={0.1}
              max={5}
              step={0.1}
              className="w-full"
            />
            <div className="flex gap-2 text-xs text-slate-400">
              <span>0.1x</span>
              <span className="flex-1" />
              <span>5x</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Injection */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Event Injection
          </CardTitle>
          <CardDescription className="text-slate-400">
            Inject custom events to alter the simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showEventForm ? (
            <Button onClick={() => setShowEventForm(true)} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Inject Event
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">
                  Actors
                </label>
                <div className="flex gap-2">
                  {civilizations.slice(0, 3).map((civ) => (
                    <Button
                      key={civ.id}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // Toggle selection
                      }}
                    >
                      {civ.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onEventInject?.(eventType, []);
                    setShowEventForm(false);
                  }}
                  className="flex-1 gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Inject
                </Button>
                <Button
                  onClick={() => setShowEventForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Civilization Parameters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Civilization Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Civilization Selector */}
          <div>
            <label className="text-sm font-semibold text-slate-300 block mb-2">
              Select Civilization
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {civilizations.map((civ) => (
                <Button
                  key={civ.id}
                  variant={selectedCivilization === civ.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCivilization(civ.id)}
                  className="text-xs"
                >
                  {civ.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Parameter Sliders */}
          {selectedCiv && (
            <div className="space-y-4 pt-4 border-t border-slate-600">
              {/* Population */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">Population</label>
                  <span className="text-sm text-slate-400">{selectedCiv.population}M</span>
                </div>
                <Slider
                  value={[selectedCiv.population]}
                  onValueChange={(value) =>
                    onParameterChange?.(selectedCiv.id, { population: value[0] })
                  }
                  min={1}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Technology */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">Technology</label>
                  <span className="text-sm text-slate-400">{selectedCiv.technology}%</span>
                </div>
                <Slider
                  value={[selectedCiv.technology]}
                  onValueChange={(value) =>
                    onParameterChange?.(selectedCiv.id, { technology: value[0] })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Culture */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">Culture</label>
                  <span className="text-sm text-slate-400">{selectedCiv.culture}%</span>
                </div>
                <Slider
                  value={[selectedCiv.culture]}
                  onValueChange={(value) =>
                    onParameterChange?.(selectedCiv.id, { culture: value[0] })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Resources */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-300">Resources</label>
                  <span className="text-sm text-slate-400">{selectedCiv.resources}K</span>
                </div>
                <Slider
                  value={[selectedCiv.resources]}
                  onValueChange={(value) =>
                    onParameterChange?.(selectedCiv.id, { resources: value[0] })
                  }
                  min={0}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              <Button className="w-full gap-2 mt-4">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simulation State */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Simulation State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full gap-2">
            <Save className="w-4 h-4" />
            Save State
          </Button>
          <Button variant="outline" className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Load State
          </Button>
          <Button variant="outline" className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset to Initial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
