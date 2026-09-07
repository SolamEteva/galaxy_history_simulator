import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Zap, Users, Calendar, TreePine, Network } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [galaxyName, setGalaxyName] = useState("");
  const [speciesCount, setSpeciesCount] = useState(5);
  const [totalYears, setTotalYears] = useState(50000);
  const [narrativeDepth, setNarrativeDepth] = useState<"light" | "medium" | "deep">("medium");
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
      narrativeDepth,
      seed: seed.trim() || undefined,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
        <div className="max-w-2xl w-full text-center">
          {/* Logo & Title */}
          <div className="mb-12">
            {APP_LOGO && (
              <img 
                src={APP_LOGO} 
                alt={APP_TITLE}
                className="w-16 h-16 mx-auto mb-6 opacity-90"
              />
            )}
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
              {APP_TITLE}
            </h1>
            <p className="text-lg text-muted-foreground mb-3 leading-relaxed">
              Generate entire galaxy histories with thousands of years of interconnected civilizations
            </p>
            <p className="text-base text-muted-foreground/80">
              Explore the rise and fall of species, wars, discoveries, and the complex dynamics of conscious civilizations
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Network className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Causal Backbone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every event is grounded in cause-effect chains. History unfolds with logical coherence, not randomness.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Narrative Depth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Explore interconnected events, civilizational arcs, and the philosophical dynamics underlying history.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
                <CardTitle className="text-lg">Pre-Computed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Entire galaxy histories generated upfront. Instant access to thousands of years of civilization.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sign In Button */}
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold"
          >
            Sign In to Begin
          </Button>

          <p className="text-xs text-muted-foreground/60 mt-6">
            Create an account or sign in with your existing credentials
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Error Banner */}
      {errorDetails && (
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 mb-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-destructive font-mono">{errorDetails}</p>
            <button
              onClick={() => setErrorDetails(null)}
              className="mt-2 text-xs text-destructive/60 hover:text-destructive transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {APP_LOGO && (
                <img 
                  src={APP_LOGO} 
                  alt={APP_TITLE}
                  className="w-8 h-8 opacity-80"
                />
              )}
              <h1 className="text-3xl font-bold text-foreground">{APP_TITLE}</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Welcome, <span className="text-foreground font-semibold">{user?.name}</span>
            </div>
          </div>
          <p className="text-base text-muted-foreground mb-6 max-w-2xl">
            Configure and generate new galaxy histories, or explore your existing simulations
          </p>

          {/* Navigation Links */}
          <div className="flex gap-2 flex-wrap">
            <Link href="/genealogy">
              <Button variant="outline" size="sm" className="gap-2">
                <TreePine className="w-4 h-4" />
                Genealogies
              </Button>
            </Link>
            <Link href="/figures">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Figures
              </Button>
            </Link>
            <Link href="/timeline">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </Button>
            </Link>
            <Link href="/agent">
              <Button variant="outline" size="sm" className="gap-2">
                <Zap className="w-4 h-4" />
                Agent
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Galaxy</CardTitle>
                <CardDescription>
                  Configure parameters for your simulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateGalaxy} className="space-y-6">
                  {/* Galaxy Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Galaxy Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Andromeda Prime, The Eternal Spiral"
                      value={galaxyName}
                      onChange={(e) => setGalaxyName(e.target.value)}
                      disabled={isGenerating}
                      className="bg-card border-border"
                    />
                  </div>

                  {/* Species Count */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-foreground">
                        Number of Species
                      </label>
                      <span className="text-sm font-semibold text-primary">
                        {speciesCount}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={speciesCount}
                      onChange={(e) => setSpeciesCount(parseInt(e.target.value))}
                      disabled={isGenerating}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      More species increase complexity and interaction depth
                    </p>
                  </div>

                  {/* Total Years */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-foreground">
                        Simulation Duration
                      </label>
                      <span className="text-sm font-semibold text-primary">
                        {totalYears.toLocaleString()} years
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="100000"
                      step="5000"
                      value={totalYears}
                      onChange={(e) => setTotalYears(parseInt(e.target.value))}
                      disabled={isGenerating}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Longer simulations generate more historical depth
                    </p>
                  </div>

                  {/* Narrative Depth */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Narrative Depth
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["light", "medium", "deep"] as const).map((depth) => (
                        <button
                          key={depth}
                          type="button"
                          onClick={() => setNarrativeDepth(depth)}
                          disabled={isGenerating}
                          className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                            narrativeDepth === depth
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
                          }`}
                        >
                          {depth.charAt(0).toUpperCase() + depth.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seed (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Seed (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Leave empty for random generation"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      disabled={isGenerating}
                      className="bg-card border-border text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Use the same seed to regenerate identical galaxies
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Galaxy"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Presets Sidebar */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Presets</h3>
            <div className="space-y-3">
              {[
                {
                  name: "Quick Start",
                  species: 3,
                  years: 5000,
                  depth: "medium" as const,
                  description: "Fast generation"
                },
                {
                  name: "Epic Saga",
                  species: 5,
                  years: 50000,
                  depth: "deep" as const,
                  description: "Deep history"
                },
                {
                  name: "Intimate Story",
                  species: 2,
                  years: 10000,
                  depth: "deep" as const,
                  description: "Detailed narrative"
                },
                {
                  name: "Vast Cosmos",
                  species: 8,
                  years: 100000,
                  depth: "medium" as const,
                  description: "Maximum complexity"
                }
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setSpeciesCount(preset.species);
                    setTotalYears(preset.years);
                    setNarrativeDepth(preset.depth);
                    setGalaxyName(preset.name);
                  }}
                  disabled={isGenerating}
                  className="w-full text-left p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/60 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-foreground text-sm">{preset.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{preset.description}</div>
                  <div className="text-xs text-muted-foreground/60 mt-2">
                    {preset.species} species · {preset.years.toLocaleString()} years
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
