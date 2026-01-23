import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GenealogyTreeVisualizer from "@/components/GenealogyTreeVisualizer";
import { Link } from "wouter";

interface FigureData {
  id: number;
  name: string;
  archetype: string;
  birthYear: number;
  deathYear?: number;
  attributes: Record<string, number>;
  parentIds?: number[];
  childrenIds?: number[];
  isSuccessor?: boolean;
  influence: number;
  legacy: number;
}

// Sample data for demonstration
const SAMPLE_FIGURES: FigureData[] = [
  {
    id: 1,
    name: "King Aldric the Wise",
    archetype: "monarch",
    birthYear: 1000,
    deathYear: 1080,
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
    childrenIds: [2, 3],
    influence: 85,
    legacy: 90,
  },
  {
    id: 2,
    name: "Queen Elara the Scholar",
    archetype: "monarch",
    birthYear: 1020,
    deathYear: 1100,
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
    childrenIds: [4],
    isSuccessor: true,
    influence: 80,
    legacy: 85,
  },
  {
    id: 3,
    name: "Prince Aldwin the Conqueror",
    archetype: "general",
    birthYear: 1025,
    deathYear: 1090,
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
    childrenIds: [],
    influence: 70,
    legacy: 60,
  },
  {
    id: 4,
    name: "Princess Lyra the Enlightened",
    archetype: "scholar",
    birthYear: 1050,
    deathYear: 1130,
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
    childrenIds: [],
    influence: 75,
    legacy: 95,
  },
];

export default function Genealogy() {
  const [selectedFigure, setSelectedFigure] = useState<FigureData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFigures = SAMPLE_FIGURES.filter(fig =>
    fig.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Genealogies & Lineages</h1>
              <p className="text-muted-foreground mt-1">
                Explore family trees, trait inheritance, and succession chains across civilizations
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
          {/* Sidebar - Figure List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Notable Figures</CardTitle>
                <CardDescription>Search and select figures to view genealogy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search figures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredFigures.map((figure) => (
                    <button
                      key={figure.id}
                      onClick={() => setSelectedFigure(figure)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedFigure?.id === figure.id
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      <div className="font-semibold text-sm">{figure.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {figure.archetype}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {figure.birthYear}-{figure.deathYear || "present"}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Area - Genealogy Tree */}
          <div className="lg:col-span-2">
            {selectedFigure ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedFigure.name}</CardTitle>
                  <CardDescription>
                    {selectedFigure.archetype.charAt(0).toUpperCase() +
                      selectedFigure.archetype.slice(1)}{" "}
                    • {selectedFigure.birthYear}-{selectedFigure.deathYear || "present"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GenealogyTreeVisualizer
                    rootFigure={selectedFigure}
                    allFigures={new Map(SAMPLE_FIGURES.map((f) => [f.id, f]))}
                  />

                  {/* Figure Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Influence Score</div>
                      <div className="text-2xl font-bold text-accent">
                        {selectedFigure.influence}%
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Legacy Rating</div>
                      <div className="text-2xl font-bold text-accent">
                        {selectedFigure.legacy}%
                      </div>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Core Attributes</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedFigure.attributes).map(([attr, value]) => (
                        <div key={attr}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-muted-foreground">{attr}</span>
                            <span className="font-semibold">{Math.round(value * 100)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full transition-all"
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-8 text-center">
                  <p className="text-muted-foreground">
                    Select a figure from the list to view their genealogy and attributes
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
