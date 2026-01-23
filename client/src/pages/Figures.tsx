import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FigureSearchPanel from "@/components/FigureSearchPanel";
import FigureProfile from "@/components/FigureProfile";
import { Link } from "wouter";

interface FigureDetail {
  id: number;
  name: string;
  archetype: string;
  birthYear: number;
  deathYear?: number;
  civilization: string;
  attributes: Record<string, number>;
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    impact: number;
    significance: number;
    year: number;
  }>;
  influence: number;
  legacy: number;
}

// Sample figures for demonstration
const SAMPLE_FIGURES: FigureDetail[] = [
  {
    id: 1,
    name: "King Aldric the Wise",
    archetype: "monarch",
    birthYear: 1000,
    deathYear: 1080,
    civilization: "Aldrian Empire",
    attributes: {
      charisma: 0.9,
      intellect: 0.7,
      courage: 0.8,
      wisdom: 0.6,
      creativity: 0.5,
      ambition: 0.9,
      compassion: 0.4,
      ruthlessness: 0.8,
    },
    achievements: [
      {
        id: 1,
        title: "Founded the Aldrian Empire",
        description: "United five kingdoms under one banner",
        impact: 95,
        significance: 100,
        year: 1000,
      },
      {
        id: 2,
        title: "Built the Grand Library",
        description: "Established the greatest repository of knowledge",
        impact: 80,
        significance: 90,
        year: 1020,
      },
    ],
    influence: 85,
    legacy: 90,
  },
  {
    id: 2,
    name: "Queen Elara the Scholar",
    archetype: "monarch",
    birthYear: 1020,
    deathYear: 1100,
    civilization: "Aldrian Empire",
    attributes: {
      charisma: 0.85,
      intellect: 0.8,
      courage: 0.7,
      wisdom: 0.75,
      creativity: 0.6,
      ambition: 0.7,
      compassion: 0.8,
      ruthlessness: 0.5,
    },
    achievements: [
      {
        id: 3,
        title: "Established the Academy of Arcane Arts",
        description: "Created the first formal magical institution",
        impact: 85,
        significance: 95,
        year: 1045,
      },
    ],
    influence: 80,
    legacy: 85,
  },
  {
    id: 3,
    name: "General Aldwin the Conqueror",
    archetype: "general",
    birthYear: 1025,
    deathYear: 1090,
    civilization: "Aldrian Empire",
    attributes: {
      charisma: 0.7,
      intellect: 0.6,
      courage: 0.95,
      wisdom: 0.5,
      creativity: 0.4,
      ambition: 0.85,
      compassion: 0.3,
      ruthlessness: 0.9,
    },
    achievements: [
      {
        id: 4,
        title: "Conquered the Northern Territories",
        description: "Expanded empire by 40% through military campaigns",
        impact: 90,
        significance: 85,
        year: 1050,
      },
    ],
    influence: 70,
    legacy: 60,
  },
  {
    id: 4,
    name: "Scholar Lyra the Enlightened",
    archetype: "scholar",
    birthYear: 1050,
    deathYear: 1130,
    civilization: "Aldrian Empire",
    attributes: {
      charisma: 0.6,
      intellect: 0.95,
      courage: 0.5,
      wisdom: 0.9,
      creativity: 0.85,
      ambition: 0.6,
      compassion: 0.7,
      ruthlessness: 0.2,
    },
    achievements: [
      {
        id: 5,
        title: "Discovered the Principles of Harmonic Resonance",
        description: "Revolutionized understanding of magical theory",
        impact: 88,
        significance: 98,
        year: 1075,
      },
    ],
    influence: 75,
    legacy: 95,
  },
  {
    id: 5,
    name: "Bard Theron the Melodious",
    archetype: "artist",
    birthYear: 1040,
    deathYear: 1110,
    civilization: "Free Cities Alliance",
    attributes: {
      charisma: 0.95,
      intellect: 0.65,
      courage: 0.6,
      wisdom: 0.55,
      creativity: 0.9,
      ambition: 0.5,
      compassion: 0.85,
      ruthlessness: 0.1,
    },
    achievements: [
      {
        id: 6,
        title: "Composed the Eternal Symphony",
        description: "Created a masterpiece that inspired generations",
        impact: 70,
        significance: 85,
        year: 1070,
      },
    ],
    influence: 65,
    legacy: 80,
  },
  {
    id: 6,
    name: "Prophet Malachai the Visionary",
    archetype: "prophet",
    birthYear: 1015,
    deathYear: 1095,
    civilization: "The Theocracy",
    attributes: {
      charisma: 0.88,
      intellect: 0.72,
      courage: 0.75,
      wisdom: 0.92,
      creativity: 0.68,
      ambition: 0.45,
      compassion: 0.88,
      ruthlessness: 0.15,
    },
    achievements: [
      {
        id: 7,
        title: "Founded the Order of the Eternal Light",
        description: "Established a spiritual movement that shaped civilization",
        impact: 92,
        significance: 96,
        year: 1040,
      },
    ],
    influence: 82,
    legacy: 92,
  },
];

export default function Figures() {
  const [selectedFigure, setSelectedFigure] = useState<FigureDetail | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notable Figures Encyclopedia</h1>
              <p className="text-muted-foreground mt-1">
                Discover the kings, queens, generals, scholars, and visionaries who shaped civilizations
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <FigureSearchPanel
              figures={SAMPLE_FIGURES as any}
              onFigureSelect={(figure) => setSelectedFigure(figure as any)}
            />
          </div>

          {/* Figure Detail */}
          <div className="lg:col-span-2">
            {selectedFigure ? (
              <FigureProfile
                name={selectedFigure.name}
                archetype={selectedFigure.archetype}
                birthYear={selectedFigure.birthYear}
                deathYear={selectedFigure.deathYear}
                attributes={selectedFigure.attributes as any}
                achievements={selectedFigure.achievements.map(a => ({
                  id: a.id,
                  year: a.year,
                  title: a.title,
                  description: a.description,
                  achievementType: 'achievement',
                  civilizationImpact: a.impact,
                  historicalSignificance: a.significance,
                }))}
                influence={selectedFigure.influence}
                legacy={selectedFigure.legacy}
                civilization={selectedFigure.civilization}
              />
            ) : (
              <Card>
                <CardContent className="pt-12 text-center pb-12">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Select a Figure</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Use the search panel on the left to find and explore notable figures. Filter by
                      archetype, civilization, or search by name to discover their achievements and
                      influence on history.
                    </p>
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
