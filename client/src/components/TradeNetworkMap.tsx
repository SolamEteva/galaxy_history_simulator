/**
 * Trade Network Map Component
 * 
 * Visualizes civilizations as nodes and trade routes as edges.
 * Shows animated goods and ideas flowing between civilizations.
 * Displays network statistics and interactive route details.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Zap, Package, TrendingUp } from "lucide-react";

interface CivilizationNode {
  id: string;
  name: string;
  location: { x: number; y: number; z: number };
  resources: Record<string, number>;
  technologies: string[];
}

interface TradeRoute {
  id: string;
  source: string;
  target: string;
  distance: number;
  delay: number;
  active: boolean;
  resources: string[];
}

interface AnimatedFlow {
  id: string;
  type: "good" | "idea";
  from: string;
  to: string;
  progress: number; // 0-1
  resource?: string;
}

interface TradeNetworkMapProps {
  nodes: CivilizationNode[];
  edges: TradeRoute[];
  stats?: {
    totalCivilizations: number;
    totalTradeRoutes: number;
    activeRoutes: number;
    goodsInTransit: number;
    ideasInTransit: number;
    averageTrustLevel: number;
  };
}

export default function TradeNetworkMap({
  nodes,
  edges,
  stats,
}: TradeNetworkMapProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [animatedFlows, setAnimatedFlows] = useState<AnimatedFlow[]>([]);
  const [viewMode, setViewMode] = useState<"network" | "stats" | "routes">("network");

  // Simulate animated flows
  useEffect(() => {
    const flows: AnimatedFlow[] = [];

    // Create animated flows for each active route
    edges.forEach((edge, index) => {
      if (edge.active) {
        // Goods flow
        flows.push({
          id: `good-${edge.id}`,
          type: "good",
          from: edge.source,
          to: edge.target,
          progress: (index * 0.2) % 1,
          resource: edge.resources[0],
        });

        // Ideas flow (faster)
        flows.push({
          id: `idea-${edge.id}`,
          type: "idea",
          from: edge.source,
          to: edge.target,
          progress: (index * 0.3) % 1,
        });
      }
    });

    setAnimatedFlows(flows);

    // Animate flows
    const interval = setInterval(() => {
      setAnimatedFlows((prev) =>
        prev.map((flow) => ({
          ...flow,
          progress: (flow.progress + 0.01) % 1,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [edges]);

  // Calculate canvas dimensions and positions
  const canvasWidth = 800;
  const canvasHeight = 600;

  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * Math.PI * 2;
      const radius = Math.min(canvasWidth, canvasHeight) / 3;
      pos[node.id] = {
        x: canvasWidth / 2 + radius * Math.cos(angle),
        y: canvasHeight / 2 + radius * Math.sin(angle),
      };
    });

    return pos;
  }, [nodes]);

  // Get selected node details
  const selectedNodeData = selectedNode
    ? nodes.find((n) => n.id === selectedNode)
    : null;

  const selectedRouteData = selectedRoute
    ? edges.find((e) => e.id === selectedRoute)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Network className="w-5 h-5" />
                Trade Network Visualization
              </CardTitle>
              <CardDescription className="text-slate-400">
                Resources and ideas flowing between civilizations
              </CardDescription>
            </div>
            {stats && (
              <Badge variant="outline" className="border-slate-500 text-slate-300">
                {stats.activeRoutes} active routes
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Routes
          </TabsTrigger>
        </TabsList>

        {/* Network View */}
        <TabsContent value="network" className="mt-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <svg
                width="100%"
                height="600"
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                className="bg-slate-900/30 rounded-lg border border-slate-700"
              >
                {/* Draw edges (trade routes) */}
                {edges.map((edge) => {
                  const fromPos = positions[edge.source];
                  const toPos = positions[edge.target];

                  if (!fromPos || !toPos) return null;

                  return (
                    <g key={edge.id}>
                      {/* Route line */}
                      <line
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke={edge.active ? "#3b82f6" : "#64748b"}
                        strokeWidth={edge.active ? 2 : 1}
                        opacity={edge.active ? 0.6 : 0.3}
                        onClick={() => setSelectedRoute(edge.id)}
                        className="cursor-pointer hover:stroke-blue-400"
                      />

                      {/* Distance label */}
                      <text
                        x={(fromPos.x + toPos.x) / 2}
                        y={(fromPos.y + toPos.y) / 2}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#94a3b8"
                        opacity="0.7"
                      >
                        {edge.distance.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Draw animated flows */}
                {animatedFlows.map((flow) => {
                  const fromPos = positions[flow.from];
                  const toPos = positions[flow.to];

                  if (!fromPos || !toPos) return null;

                  const currentX = fromPos.x + (toPos.x - fromPos.x) * flow.progress;
                  const currentY = fromPos.y + (toPos.y - fromPos.y) * flow.progress;

                  return (
                    <circle
                      key={flow.id}
                      cx={currentX}
                      cy={currentY}
                      r={flow.type === "good" ? 4 : 3}
                      fill={flow.type === "good" ? "#f59e0b" : "#8b5cf6"}
                      opacity="0.8"
                    />
                  );
                })}

                {/* Draw nodes (civilizations) */}
                {nodes.map((node) => {
                  const pos = positions[node.id];
                  if (!pos) return null;

                  const isSelected = selectedNode === node.id;

                  return (
                    <g key={node.id}>
                      {/* Node circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 20 : 15}
                        fill={isSelected ? "#10b981" : "#3b82f6"}
                        opacity={isSelected ? 1 : 0.8}
                        stroke={isSelected ? "#34d399" : "#60a5fa"}
                        strokeWidth={isSelected ? 2 : 1}
                        onClick={() => setSelectedNode(node.id)}
                        className="cursor-pointer hover:fill-blue-400"
                      />

                      {/* Node label */}
                      <text
                        x={pos.x}
                        y={pos.y + 30}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#e2e8f0"
                        fontWeight="bold"
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="mt-4 flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-slate-300">Goods in transit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-slate-300">Ideas in transit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-0.5 bg-blue-500" />
                  <span className="text-slate-300">Active route</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics View */}
        <TabsContent value="stats" className="mt-4">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-slate-700/30 border-slate-600">
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-white">{stats.totalCivilizations}</p>
                  <p className="text-xs text-slate-400">Civilizations</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/30 border-slate-600">
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-white">{stats.totalTradeRoutes}</p>
                  <p className="text-xs text-slate-400">Total routes</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/30 border-slate-600">
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-white">{stats.activeRoutes}</p>
                  <p className="text-xs text-slate-400">Active routes</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/30 border-slate-600">
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-white">{stats.goodsInTransit}</p>
                  <p className="text-xs text-slate-400">Goods in transit</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/30 border-slate-600">
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-white">{stats.ideasInTransit}</p>
                  <p className="text-xs text-slate-400">Ideas in transit</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700/30 border-slate-600">
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-white">
                    {Math.round(stats.averageTrustLevel * 100)}%
                  </p>
                  <p className="text-xs text-slate-400">Avg trust level</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Routes View */}
        <TabsContent value="routes" className="mt-4">
          <div className="space-y-3">
            {edges.map((edge) => (
              <Card
                key={edge.id}
                className={`cursor-pointer transition-all ${
                  selectedRoute === edge.id
                    ? "bg-blue-900/50 border-blue-500"
                    : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
                }`}
                onClick={() => setSelectedRoute(edge.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {nodes.find((n) => n.id === edge.source)?.name} →{" "}
                        {nodes.find((n) => n.id === edge.target)?.name}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Distance: {edge.distance.toFixed(1)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Delay: {edge.delay} ticks
                        </Badge>
                        <Badge
                          variant={edge.active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {edge.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Resources: {edge.resources.join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Node Details */}
      {selectedNodeData && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{selectedNodeData.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Resources</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedNodeData.resources).map(([resource, amount]) => (
                  <Badge key={resource} variant="secondary">
                    {resource}: {amount}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Technologies</p>
              <div className="flex flex-wrap gap-2">
                {selectedNodeData.technologies.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Route Details */}
      {selectedRouteData && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Route Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">From</p>
                <p className="text-sm font-semibold text-white">
                  {nodes.find((n) => n.id === selectedRouteData.source)?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">To</p>
                <p className="text-sm font-semibold text-white">
                  {nodes.find((n) => n.id === selectedRouteData.target)?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Distance</p>
                <p className="text-sm font-semibold text-white">
                  {selectedRouteData.distance.toFixed(2)} units
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Delay</p>
                <p className="text-sm font-semibold text-white">
                  {selectedRouteData.delay} ticks
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Status</p>
              <Badge
                variant={selectedRouteData.active ? "default" : "secondary"}
              >
                {selectedRouteData.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
