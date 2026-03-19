/**
 * Perspective Viewer Component
 * 
 * Displays the same event from five different perspectives:
 * - Victor: triumphant, confident
 * - Loser: tragic, dignified
 * - Neutral Observer: analytical, detached
 * - Archaeologist: investigative, curious
 * - Alien Anthropologist: fascinated, analytical
 * 
 * Highlights contradictions and reveals hidden truths through comparison.
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Eye, Users } from "lucide-react";
import { Streamdown } from "streamdown";

interface Perspective {
  type: "victor" | "loser" | "neutral_observer" | "archaeologist" | "alien_anthropologist";
  narrator: string;
  narrative: string;
  tone: string;
  emphasis: string[];
  omissions: string[];
  bias: number; // 0-1
  reliability: number; // 0-1
}

interface Contradiction {
  perspectives: [string, string];
  claim1: string;
  claim2: string;
  resolution: string;
  significance: number;
}

interface PerspectiveViewerProps {
  eventId: string;
  eventType: string;
  perspectives: Map<string, Perspective>;
  contradictions: Contradiction[];
  hiddenTruths: string[];
}

const perspectiveColors: Record<string, string> = {
  victor: "bg-amber-900/50 border-amber-600 text-amber-200",
  loser: "bg-slate-900/50 border-slate-600 text-slate-200",
  neutral_observer: "bg-blue-900/50 border-blue-600 text-blue-200",
  archaeologist: "bg-purple-900/50 border-purple-600 text-purple-200",
  alien_anthropologist: "bg-green-900/50 border-green-600 text-green-200",
};

const perspectiveEmojis: Record<string, string> = {
  victor: "🏆",
  loser: "⚔️",
  neutral_observer: "📋",
  archaeologist: "🔍",
  alien_anthropologist: "👽",
};

export default function PerspectiveViewer({
  eventId,
  eventType,
  perspectives,
  contradictions,
  hiddenTruths,
}: PerspectiveViewerProps) {
  const [selectedPerspective, setSelectedPerspective] = useState<string>("neutral_observer");
  const [comparisonMode, setComparisonMode] = useState(false);

  const perspectiveArray = Array.from(perspectives.entries());
  const selected = perspectives.get(selectedPerspective);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white">Multiple Perspectives</CardTitle>
              <CardDescription className="text-slate-400">
                The same event told from five different viewpoints
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-500 text-slate-300">
              {perspectiveArray.length} perspectives
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Perspective Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {perspectiveArray.map(([type, perspective]) => (
          <button
            key={type}
            onClick={() => {
              setSelectedPerspective(type);
              setComparisonMode(false);
            }}
            className={`p-3 rounded-lg border transition-all ${
              selectedPerspective === type && !comparisonMode
                ? `${perspectiveColors[type]} ring-2 ring-offset-2 ring-offset-slate-900`
                : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
            }`}
          >
            <p className="text-2xl mb-1">{perspectiveEmojis[type]}</p>
            <p className="text-xs font-semibold text-slate-200 capitalize">
              {type.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-slate-400 mt-1">{perspective.narrator}</p>
          </button>
        ))}
      </div>

      {/* Main View */}
      {selected && (
        <Card className={`border ${perspectiveColors[selectedPerspective]}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-lg">
                  {perspectiveEmojis[selectedPerspective]} {selected.narrator}
                </CardTitle>
                <CardDescription className="text-slate-300 mt-1">
                  Tone: <span className="italic">{selected.tone}</span>
                </CardDescription>
              </div>
              <div className="space-y-2 text-right">
                <div>
                  <p className="text-xs text-slate-400">Reliability</p>
                  <div className="flex gap-1 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < Math.ceil(selected.reliability * 5)
                            ? "bg-green-500"
                            : "bg-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Bias</p>
                  <div className="flex gap-1 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < Math.ceil(selected.bias * 5)
                            ? "bg-red-500"
                            : "bg-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Narrative */}
            <div className="prose prose-invert max-w-none">
              <Streamdown>{selected.narrative}</Streamdown>
            </div>

            {/* Emphasis and Omissions */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600">
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">Emphasizes</p>
                <div className="flex flex-wrap gap-1">
                  {selected.emphasis.map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-2">Downplays</p>
                <div className="flex flex-wrap gap-1">
                  {selected.omissions.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs opacity-50">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contradictions Section */}
      {contradictions.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-white">Contradictions Found</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Different perspectives tell conflicting versions of events
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {contradictions.map((contradiction, index) => (
              <div
                key={index}
                className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-2 flex-1">
                    <div className="text-sm">
                      <p className="text-slate-400 text-xs mb-1">
                        {contradiction.perspectives[0]} says:
                      </p>
                      <p className="text-slate-200 font-semibold">
                        "{contradiction.claim1}"
                      </p>
                    </div>
                    <div className="text-slate-500 px-2">vs</div>
                    <div className="text-sm">
                      <p className="text-slate-400 text-xs mb-1">
                        {contradiction.perspectives[1]} says:
                      </p>
                      <p className="text-slate-200 font-semibold">
                        "{contradiction.claim2}"
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${
                      contradiction.significance > 0.7
                        ? "border-red-500 text-red-300"
                        : "border-yellow-500 text-yellow-300"
                    }`}
                  >
                    {Math.round(contradiction.significance * 100)}%
                  </Badge>
                </div>

                <div className="bg-slate-800/50 rounded p-2 border-l-2 border-green-500">
                  <p className="text-xs text-slate-400 mb-1">What actually happened:</p>
                  <p className="text-sm text-green-200">{contradiction.resolution}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Hidden Truths Section */}
      {hiddenTruths.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-white">Hidden Truths Revealed</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Insights that emerge from comparing multiple perspectives
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ul className="space-y-2">
              {hiddenTruths.map((truth, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span className="text-slate-200">{truth}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Comparison Mode */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Side-by-Side Comparison
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="victor" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {perspectiveArray.map(([type]) => (
                <TabsTrigger key={type} value={type} className="text-xs">
                  {perspectiveEmojis[type]}
                </TabsTrigger>
              ))}
            </TabsList>

            {perspectiveArray.map(([type, perspective]) => (
              <TabsContent key={type} value={type} className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">
                      Narrator
                    </p>
                    <p className="text-sm text-slate-200">{perspective.narrator}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">
                      Tone
                    </p>
                    <p className="text-sm text-slate-200">{perspective.tone}</p>
                  </div>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    Narrative
                  </p>
                  <Streamdown className="text-sm">
                    {perspective.narrative}
                  </Streamdown>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
