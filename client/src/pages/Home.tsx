import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, BookOpen, Zap } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [galaxyName, setGalaxyName] = useState("");
  const [speciesCount, setSpeciesCount] = useState(5);
  const [totalYears, setTotalYears] = useState(50000);
  const [seed, setSeed] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const generateGalaxy = trpc.galaxy.generate.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      toast.success(`Galaxy "${data.galaxyId}" generated! Redirecting...`);
      setTimeout(() => {
        setLocation(`/galaxy/${data.galaxyId}`);
      }, 1000);
    },
    onError: (error) => {
      setIsGenerating(false);
      const errorMsg = error.message || "Unknown error";
      setErrorDetails(errorMsg);
      console.error("Full error:", error);
      toast.error(`Failed to generate galaxy: ${errorMsg}`);
    },
  });

  const handleGenerateGalaxy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!galaxyName.trim()) {
      toast.error("Please enter a galaxy name");
      return;
    }

    setIsGenerating(true);
    generateGalaxy.mutate({
      galaxyName: galaxyName.trim(),
      speciesCount,
      totalYears,
      seed: seed || undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="animate-spin w-8 h-8 text-blue-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-white mb-4">{APP_TITLE}</h1>
            <p className="text-xl text-slate-300 mb-2">
              Generate entire galaxy histories inspired by Dwarf Fortress world generation
            </p>
            <p className="text-slate-400">
              Watch thousands of years of interconnected civilizations, wars, discoveries, and spaceflight unfold
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Pre-Computed History</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Entire galaxy histories generated upfront with deep cause-effect chains
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <BookOpen className="w-6 h-6 text-blue-400 mb-2" />
                <CardTitle className="text-white">Legends Chronicle</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Explore interconnected events, species evolution, and civilizational arcs
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
                <CardTitle className="text-white">Illustrated Moments</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Key historical events rendered with hand-drawn aesthetic images
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            Sign In to Generate Galaxies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      {errorDetails && (
        <div className="max-w-6xl mx-auto mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-100 text-sm font-mono break-words">{errorDetails}</p>
          <button
            onClick={() => setErrorDetails(null)}
            className="mt-2 text-xs text-red-300 hover:text-red-100"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">{APP_TITLE}</h1>
            </div>
            <div className="text-slate-400">
              Welcome, <span className="text-white font-semibold">{user?.name}</span>
            </div>
          </div>
          <p className="text-slate-300">
            Generate pre-computed galaxy histories with thousands of years of interconnected events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Generate New Galaxy</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure parameters for your galaxy history simulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateGalaxy} className="space-y-6">
                  {/* Galaxy Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Galaxy Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Andromeda Prime, The Eternal Spiral"
                      value={galaxyName}
                      onChange={(e) => setGalaxyName(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Species Count */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Number of Species: <span className="text-blue-400 font-semibold">{speciesCount}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={speciesCount}
                      onChange={(e) => setSpeciesCount(parseInt(e.target.value))}
                      className="w-full"
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      More species = more complex interactions and conflicts
                    </p>
                  </div>

                  {/* Total Years */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Simulation Length: <span className="text-blue-400 font-semibold">{totalYears.toLocaleString()} years</span>
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="1000000"
                      step="1000"
                      value={totalYears}
                      onChange={(e) => setTotalYears(parseInt(e.target.value))}
                      className="w-full"
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Longer simulations = more detailed history and events
                    </p>
                  </div>

                  {/* Seed (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Random Seed (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Leave empty for random seed"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Use the same seed to regenerate identical galaxy histories
                    </p>
                  </div>

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={isGenerating || !galaxyName.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Galaxy History...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Galaxy
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm space-y-3">
                <div>
                  <p className="font-semibold text-white mb-1">1. Configuration</p>
                  <p>Set the number of species and simulation length</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">2. Pre-Computation</p>
                  <p>AI generates thousands of years of interconnected history</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">3. Legends Chronicle</p>
                  <p>Explore the complete history with cause-effect relationships</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">4. Illustrations</p>
                  <p>Key events are rendered as hand-drawn aesthetic images</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recommended Settings</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Quick Generation:</span>
                  <span className="text-blue-400">3-5 species, 10k years</span>
                </div>
                <div className="flex justify-between">
                  <span>Balanced:</span>
                  <span className="text-blue-400">5-6 species, 50k years</span>
                </div>
                <div className="flex justify-between">
                  <span>Epic Scale:</span>
                  <span className="text-blue-400">8 species, 100k+ years</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
