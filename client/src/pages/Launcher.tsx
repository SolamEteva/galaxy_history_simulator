/**
 * Galaxy Simulator - One-Click Launcher
 * 
 * Provides an accessible entry point for non-technical users to generate and explore galaxies.
 * Features preset configurations, progress tracking, and beautiful UI.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Zap, BookOpen, Settings, Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface GalaxyPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: {
    speciesCount: number;
    simulationLength: number;
    narrativeDepth: "light" | "medium" | "deep";
    seed?: string;
  };
}

const PRESETS: GalaxyPreset[] = [
  {
    id: "quick-start",
    name: "Quick Start",
    description: "Fast generation with 3 species, 5,000 years",
    icon: "⚡",
    config: {
      speciesCount: 3,
      simulationLength: 5000,
      narrativeDepth: "medium",
    },
  },
  {
    id: "epic-saga",
    name: "Epic Saga",
    description: "Deep history with 5 species, 50,000 years",
    icon: "🏰",
    config: {
      speciesCount: 5,
      simulationLength: 50000,
      narrativeDepth: "deep",
    },
  },
  {
    id: "intimate-story",
    name: "Intimate Story",
    description: "Detailed narrative with 2 species, 10,000 years",
    icon: "💫",
    config: {
      speciesCount: 2,
      simulationLength: 10000,
      narrativeDepth: "deep",
    },
  },
  {
    id: "vast-cosmos",
    name: "Vast Cosmos",
    description: "Maximum complexity with 8 species, 100,000 years",
    icon: "🌌",
    config: {
      speciesCount: 8,
      simulationLength: 100000,
      narrativeDepth: "medium",
    },
  },
];

export default function Launcher() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("presets");
  const [galaxyName, setGalaxyName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<GalaxyPreset | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [recentGalaxies, setRecentGalaxies] = useState<any[]>([]);

  // Fetch recent galaxies
  const { data: galaxies } = trpc.galaxy.list.useQuery(undefined, {
    refetchInterval: 5000,
  });

  // Generate galaxy mutation
  const generateGalaxy = trpc.galaxy.generate.useMutation({
    onSuccess: (data: any) => {
      setIsGenerating(false);
      toast.success("Galaxy generated successfully!");
      navigate(`/galaxy/${data.id}`);
    },
    onError: (error: any) => {
      setIsGenerating(false);
      toast.error(`Failed to generate galaxy: ${error.message}`);
    },
  });

  const handlePresetSelect = (preset: GalaxyPreset) => {
    setSelectedPreset(preset);
    setGalaxyName(preset.name);
  };

  const handleGenerateFromPreset = async () => {
    if (!selectedPreset) {
      toast.error("Please select a preset");
      return;
    }

    if (!galaxyName.trim()) {
      toast.error("Please enter a galaxy name");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      await generateGalaxy.mutateAsync({
        galaxyName: galaxyName,
        speciesCount: selectedPreset.config.speciesCount,
        totalYears: selectedPreset.config.simulationLength,
        narrativeDepth: selectedPreset.config.narrativeDepth,
        seed: selectedPreset.config.seed,
      });
      setGenerationProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleCustomGenerate = async () => {
    if (!galaxyName.trim()) {
      toast.error("Please enter a galaxy name");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      await generateGalaxy.mutateAsync({
        galaxyName: galaxyName,
        speciesCount: 3,
        totalYears: 10000,
        narrativeDepth: "medium",
      });
      setGenerationProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">Galaxy Simulator</h1>
            <Sparkles className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-xl text-slate-300 mb-2">
            Generate infinite worlds with thousands of years of interconnected history
          </p>
          <p className="text-slate-400">
            Pre-computed civilizations, wars, discoveries, and cultural evolution
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="presets" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Custom
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESETS.map((preset) => (
                <Card
                  key={preset.id}
                  className={`cursor-pointer transition-all ${
                    selectedPreset?.id === preset.id
                      ? "bg-blue-900/50 border-blue-500 ring-2 ring-blue-500"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => handlePresetSelect(preset)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-3xl mb-2">{preset.icon}</div>
                        <CardTitle className="text-white">{preset.name}</CardTitle>
                        <CardDescription className="text-slate-400">
                          {preset.description}
                        </CardDescription>
                      </div>
                      {selectedPreset?.id === preset.id && (
                        <CheckCircle className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div>
                        <span className="text-slate-400">Species:</span> {preset.config.speciesCount}
                      </div>
                      <div>
                        <span className="text-slate-400">Duration:</span> {preset.config.simulationLength.toLocaleString()} years
                      </div>
                      <div>
                        <span className="text-slate-400">Depth:</span>
                        <Badge variant="outline" className="ml-2 capitalize">
                          {preset.config.narrativeDepth}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedPreset && (
              <Card className="bg-blue-900/30 border-blue-700">
                <CardHeader>
                  <CardTitle className="text-white">Configure Your Galaxy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="galaxy-name" className="text-slate-300">
                      Galaxy Name
                    </Label>
                    <Input
                      id="galaxy-name"
                      value={galaxyName}
                      onChange={(e) => setGalaxyName(e.target.value)}
                      placeholder="Enter a name for your galaxy..."
                      className="bg-slate-700 border-slate-600 text-white mt-2"
                      disabled={isGenerating}
                    />
                  </div>

                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Generating galaxy...</span>
                        <span className="text-blue-400 font-semibold">
                          {Math.round(generationProgress)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateFromPreset}
                    disabled={isGenerating || !galaxyName.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Generate Galaxy
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Custom Galaxy Configuration</CardTitle>
                <CardDescription className="text-slate-400">
                  Create a galaxy with your own parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-name" className="text-slate-300">
                    Galaxy Name
                  </Label>
                  <Input
                    id="custom-name"
                    value={galaxyName}
                    onChange={(e) => setGalaxyName(e.target.value)}
                    placeholder="Enter galaxy name..."
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                    disabled={isGenerating}
                  />
                </div>

                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <p className="text-slate-300 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Advanced configuration coming soon. Use Quick Start presets for now.
                  </p>
                </div>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Generating galaxy...</span>
                      <span className="text-blue-400 font-semibold">
                        {Math.round(generationProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCustomGenerate}
                  disabled={isGenerating || !galaxyName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Galaxy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent" className="space-y-6">
            {galaxies && galaxies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {galaxies.map((galaxy: any) => (
                  <Card
                    key={galaxy.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer transition-all"
                    onClick={() => navigate(`/galaxy/${galaxy.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white">{galaxy.name}</CardTitle>
                          <CardDescription className="text-slate-400">
                            {galaxy.speciesCount} species • {galaxy.endYear.toLocaleString()} years
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{galaxy.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400">
                        Created {new Date(galaxy.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-400">No galaxies yet. Create one using Quick Start!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>
            Each galaxy is pre-computed with thousands of years of interconnected history,
            <br />
            featuring organic civilizations, wars, discoveries, and cultural evolution.
          </p>
        </div>
      </div>
    </div>
  );
}
