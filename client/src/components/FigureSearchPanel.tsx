/**
 * Figure Search Panel Component
 * Searchable encyclopedia of notable figures with multi-filter support
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";

interface Figure {
  id: number;
  name: string;
  archetype: string;
  birthYear: number;
  deathYear?: number;
  civilization?: string;
  influence: number;
  legacy: number;
  achievements?: number;
}

interface FigureSearchPanelProps {
  figures: Figure[];
  onFigureSelect?: (figure: Figure) => void;
  onFigureClick?: (figure: Figure) => void;
}

interface FilterState {
  searchTerm: string;
  archetypes: Set<string>;
  civilizations: Set<string>;
  yearRange: [number, number];
  minInfluence: number;
}

/**
 * Main Figure Search Panel Component
 */
export const FigureSearchPanel: React.FC<FigureSearchPanelProps> = ({
  figures,
  onFigureSelect,
  onFigureClick,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    archetypes: new Set(),
    civilizations: new Set(),
    yearRange: [
      Math.min(...figures.map(f => f.birthYear)),
      Math.max(...figures.map(f => f.deathYear || f.birthYear)),
    ],
    minInfluence: 0,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);

  // Extract unique values for filters
  const uniqueArchetypes = useMemo(
    () => Array.from(new Set(figures.map(f => f.archetype))).sort(),
    [figures]
  );

  const uniqueCivilizations = useMemo(
    () => Array.from(new Set(figures.map(f => f.civilization).filter(Boolean))).sort(),
    [figures]
  );

  // Filter figures based on current filters
  const filteredFigures = useMemo(() => {
    return figures.filter(figure => {
      // Search term filter
      if (
        filters.searchTerm &&
        !figure.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Archetype filter
      if (filters.archetypes.size > 0 && !filters.archetypes.has(figure.archetype)) {
        return false;
      }

      // Civilization filter
      if (
        filters.civilizations.size > 0 &&
        !filters.civilizations.has(figure.civilization || "")
      ) {
        return false;
      }

      // Year range filter
      const figureYear = figure.deathYear || figure.birthYear;
      if (figureYear < filters.yearRange[0] || figureYear > filters.yearRange[1]) {
        return false;
      }

      // Influence filter
      if (figure.influence < filters.minInfluence) {
        return false;
      }

      return true;
    });
  }, [figures, filters]);

  const handleArchetypeToggle = (archetype: string) => {
    const newArchetypes = new Set(filters.archetypes);
    if (newArchetypes.has(archetype)) {
      newArchetypes.delete(archetype);
    } else {
      newArchetypes.add(archetype);
    }
    setFilters({ ...filters, archetypes: newArchetypes });
  };

  const handleCivilizationToggle = (civilization: string) => {
    const newCivilizations = new Set(filters.civilizations);
    if (newCivilizations.has(civilization)) {
      newCivilizations.delete(civilization);
    } else {
      newCivilizations.add(civilization);
    }
    setFilters({ ...filters, civilizations: newCivilizations });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      archetypes: new Set(),
      civilizations: new Set(),
      yearRange: [
        Math.min(...figures.map(f => f.birthYear)),
        Math.max(...figures.map(f => f.deathYear || f.birthYear)),
      ],
      minInfluence: 0,
    });
  };

  const archetypeColors: Record<string, string> = {
    monarch: "bg-purple-500",
    general: "bg-red-500",
    scientist: "bg-blue-500",
    artist: "bg-pink-500",
    prophet: "bg-yellow-500",
    merchant: "bg-green-500",
    scholar: "bg-indigo-500",
    explorer: "bg-cyan-500",
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Figure Encyclopedia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search figures by name..."
                value={filters.searchTerm}
                onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              {/* Archetype Filter */}
              <div className="space-y-2">
                <div className="text-sm font-semibold">Archetype</div>
                <div className="flex flex-wrap gap-2">
                  {uniqueArchetypes.map(archetype => (
                    <Badge
                      key={archetype}
                      variant={
                        filters.archetypes.has(archetype) ? "default" : "outline"
                      }
                      className={`cursor-pointer capitalize ${
                        filters.archetypes.has(archetype)
                          ? archetypeColors[archetype] + " text-white"
                          : ""
                      }`}
                      onClick={() => handleArchetypeToggle(archetype)}
                    >
                      {archetype}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Civilization Filter */}
              {uniqueCivilizations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Civilization</div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCivilizations.map(civ => (
                      <Badge
                        key={civ}
                        variant={
                          filters.civilizations.has(civ || "") ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => handleCivilizationToggle(civ || "")}
                      >
                        {civ}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Influence Filter */}
              <div className="space-y-2">
                <div className="text-sm font-semibold">
                  Minimum Influence: {filters.minInfluence}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minInfluence}
                  onChange={e =>
                    setFilters({ ...filters, minInfluence: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Clear Filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredFigures.length} of {figures.length} figures
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFigures.map(figure => (
          <Card
            key={figure.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => {
              setSelectedFigure(figure);
              onFigureClick?.(figure);
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm truncate">{figure.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {figure.birthYear}
                    {figure.deathYear && ` – ${figure.deathYear}`}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex gap-1 flex-wrap">
                <Badge
                  className={`${archetypeColors[figure.archetype] || "bg-gray-500"} text-white text-xs capitalize`}
                >
                  {figure.archetype}
                </Badge>
                {figure.civilization && (
                  <Badge variant="outline" className="text-xs">
                    {figure.civilization}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-1.5 bg-muted rounded">
                  <div className="font-semibold text-primary">
                    {Math.round(figure.influence)}
                  </div>
                  <div className="text-muted-foreground">Influence</div>
                </div>
                <div className="p-1.5 bg-muted rounded">
                  <div className="font-semibold text-primary">
                    {Math.round(figure.legacy)}
                  </div>
                  <div className="text-muted-foreground">Legacy</div>
                </div>
              </div>

              {figure.achievements && (
                <div className="text-xs text-muted-foreground">
                  {figure.achievements} achievement{figure.achievements !== 1 ? "s" : ""}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFigures.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              No figures match your search criteria. Try adjusting your filters.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FigureSearchPanel;
