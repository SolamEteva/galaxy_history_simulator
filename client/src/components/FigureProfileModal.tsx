import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Award, Zap, Users, TrendingUp } from "lucide-react";
import type { EventNode } from "@/types/narrative";

interface FigureProfileModalProps {
  figure: {
    id: string;
    name: string;
    title: string;
    civilization: string;
    archetype: string;
    birthYear: number;
    deathYear?: number;
    achievements: string[];
    influence: number;
    description: string;
    traits: string[];
    successors?: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  relatedEvents?: EventNode[];
}

export function FigureProfileModal({
  figure,
  isOpen,
  onClose,
  relatedEvents = [],
}: FigureProfileModalProps) {
  if (!figure) return null;

  const lifespan = figure.deathYear
    ? `${figure.birthYear} - ${figure.deathYear} (${figure.deathYear - figure.birthYear} years)`
    : `${figure.birthYear} - Present`;

  const influencePercentage = Math.min(100, Math.max(0, figure.influence * 10));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{figure.name}</DialogTitle>
              <p className="text-slate-400 text-sm mt-1">{figure.title}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="pt-6 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Civilization</p>
                  <p className="text-white font-semibold">{figure.civilization}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Archetype</p>
                  <Badge className="mt-1">{figure.archetype}</Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Lifespan</p>
                  <p className="text-white">{lifespan}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Influence</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${influencePercentage}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-semibold">
                      {figure.influence.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-base">Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 text-sm leading-relaxed">{figure.description}</p>
            </CardContent>
          </Card>

          {/* Traits */}
          {figure.traits.length > 0 && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Traits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {figure.traits.map((trait, idx) => (
                    <Badge key={idx} variant="outline" className="border-blue-500 text-blue-300">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {figure.achievements.length > 0 && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Major Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {figure.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Successors */}
          {figure.successors && figure.successors.length > 0 && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Successors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {figure.successors.map((successor, idx) => (
                    <p key={idx} className="text-slate-200 text-sm">
                      {successor}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Related Events ({relatedEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {relatedEvents.map((event, idx) => (
                    <div key={idx} className="p-2 bg-slate-600 rounded text-sm">
                      <p className="text-blue-300 font-semibold">Year {event.year}</p>
                      <p className="text-slate-200">{event.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
