/**
 * Genealogy Tree Visualizer Component
 * Displays interactive family lineages with trait inheritance and succession chains
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Users, Zap, Crown } from "lucide-react";

interface FigureNode {
  id: number;
  name: string;
  archetype: string;
  birthYear: number;
  deathYear?: number;
  attributes: Record<string, number>;
  parentIds?: number[];
  childrenIds?: number[];
  influence: number;
  legacy: number;
  isSuccessor?: boolean;
}

interface GenealogyTreeVisualizerProps {
  rootFigure: FigureNode;
  allFigures: Map<number, FigureNode>;
  generationsToShow?: number;
  onFigureSelect?: (figure: FigureNode) => void;
}

interface TreeNodeProps {
  figure: FigureNode;
  allFigures: Map<number, FigureNode>;
  level: number;
  maxLevels: number;
  onFigureSelect?: (figure: FigureNode) => void;
}

/**
 * Individual tree node component
 */
const TreeNode: React.FC<TreeNodeProps> = ({
  figure,
  allFigures,
  level,
  maxLevels,
  onFigureSelect,
}) => {
  const [expanded, setExpanded] = useState(level < 2);
  const children = figure.childrenIds
    ?.map(id => allFigures.get(id))
    .filter(Boolean) as FigureNode[];

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

  const archetypeColor = archetypeColors[figure.archetype.toLowerCase()] || "bg-gray-500";

  // Calculate dominant trait
  const dominantTrait = Object.entries(figure.attributes).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  const traitColor =
    figure.attributes[dominantTrait] > 0.7
      ? "text-green-400"
      : figure.attributes[dominantTrait] > 0.4
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="flex flex-col items-center">
      {/* Figure Card */}
      <div
        className="relative cursor-pointer"
        onClick={() => onFigureSelect?.(figure)}
      >
        <Card className="w-48 border-2 border-border hover:border-primary transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-sm font-bold truncate">
                  {figure.name}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  {figure.birthYear}
                  {figure.deathYear && ` – ${figure.deathYear}`}
                </div>
              </div>
              {figure.isSuccessor && (
                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex gap-1 flex-wrap">
              <Badge className={`${archetypeColor} text-white text-xs capitalize`}>
                {figure.archetype}
              </Badge>
              <Badge variant="outline" className={`text-xs ${traitColor}`}>
                {dominantTrait}
              </Badge>
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

            {/* Trait inheritance indicator */}
            <div className="text-xs space-y-1">
              <div className="font-semibold text-muted-foreground">Top Traits:</div>
              <div className="space-y-0.5">
                {Object.entries(figure.attributes)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([trait, value]) => (
                    <div key={trait} className="flex justify-between text-muted-foreground">
                      <span className="capitalize">{trait}</span>
                      <span className="font-semibold">{Math.round(value * 100)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children */}
      {children && children.length > 0 && level < maxLevels && (
        <div className="mt-4 space-y-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            <span>{children.length} descendant{children.length !== 1 ? "s" : ""}</span>
          </button>

          {expanded && (
            <div className="relative">
              {/* Connector lines */}
              <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-border -translate-x-1/2 -translate-y-full" />

              <div className="flex gap-8 justify-center flex-wrap">
                {children.map((child, idx) => (
                  <div key={child.id} className="relative">
                    {/* Horizontal connector */}
                    <div className="absolute left-1/2 top-0 w-8 h-4 border-l border-b border-border -translate-x-1/2 -translate-y-full" />

                    <TreeNode
                      figure={child}
                      allFigures={allFigures}
                      level={level + 1}
                      maxLevels={maxLevels}
                      onFigureSelect={onFigureSelect}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Main Genealogy Tree Visualizer Component
 */
export const GenealogyTreeVisualizer: React.FC<GenealogyTreeVisualizerProps> = ({
  rootFigure,
  allFigures,
  generationsToShow = 4,
  onFigureSelect,
}) => {
  const [expandAll, setExpandAll] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Calculate genealogy statistics
  const stats = useMemo(() => {
    const descendants = new Set<number>();
    const queue = [rootFigure.id];
    let totalInfluence = 0;
    let maxLegacy = 0;
    let successorCount = 0;

    while (queue.length > 0) {
      const id = queue.shift();
      if (!id || descendants.has(id)) continue;

      const figure = allFigures.get(id);
      if (!figure) continue;

      descendants.add(id);
      totalInfluence += figure.influence;
      maxLegacy = Math.max(maxLegacy, figure.legacy);

      if (figure.isSuccessor) successorCount++;
      if (figure.childrenIds) {
        queue.push(...figure.childrenIds);
      }
    }

    return {
      totalDescendants: descendants.size - 1,
      totalInfluence: Math.round(totalInfluence),
      maxLegacy: Math.round(maxLegacy),
      successorCount,
    };
  }, [rootFigure, allFigures]);

  return (
    <div className="w-full space-y-4">
      {/* Header with controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Genealogy Tree
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? "Hide" : "Show"} Stats
            </Button>
          </div>
        </CardHeader>

        {showStats && (
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-primary">
                {stats.totalDescendants}
              </div>
              <div className="text-xs text-muted-foreground">Descendants</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-primary">
                {stats.totalInfluence}
              </div>
              <div className="text-xs text-muted-foreground">Total Influence</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-primary">
                {stats.maxLegacy}
              </div>
              <div className="text-xs text-muted-foreground">Peak Legacy</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-primary">
                {stats.successorCount}
              </div>
              <div className="text-xs text-muted-foreground">Successors</div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Tree visualization */}
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <div className="flex justify-center pb-6">
            <TreeNode
              figure={rootFigure}
              allFigures={allFigures}
              level={0}
              maxLevels={generationsToShow}
              onFigureSelect={onFigureSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-muted-foreground">Successor/Leader</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">High Influence</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Trait colors indicate dominance: <span className="text-green-400">High</span>,{" "}
            <span className="text-yellow-400">Medium</span>, <span className="text-red-400">Low</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenealogyTreeVisualizer;
