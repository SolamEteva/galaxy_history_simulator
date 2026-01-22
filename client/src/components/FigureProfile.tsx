/**
 * Figure Profile Component
 * Displays notable figure information with expandable sections
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Award, Users, BookOpen } from "lucide-react";

interface FigureAttributes {
  charisma: number;
  intellect: number;
  courage: number;
  wisdom: number;
  creativity: number;
  ambition: number;
  compassion: number;
  ruthlessness: number;
}

interface Achievement {
  id: number;
  year: number;
  title: string;
  description: string;
  achievementType: string;
  civilizationImpact: number;
  historicalSignificance: number;
}

interface FigureProfileProps {
  name: string;
  archetype: string;
  birthYear: number;
  deathYear?: number;
  attributes: FigureAttributes;
  achievements?: Achievement[];
  backstory?: string;
  reputation?: string;
  influence?: number;
  legacy?: number;
  civilization?: string;
}

const AttributeBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const percentage = Math.round(value * 100);
  const getColor = (val: number) => {
    if (val < 0.33) return "bg-red-500";
    if (val < 0.66) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getColor(value)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const FigureProfile: React.FC<FigureProfileProps> = ({
  name,
  archetype,
  birthYear,
  deathYear,
  attributes,
  achievements = [],
  backstory,
  reputation,
  influence = 0,
  legacy = 0,
  civilization,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    attributes: true,
    achievements: false,
    genealogy: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
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

  const archetypeColor = archetypeColors[archetype.toLowerCase()] || "bg-gray-500";

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">{name}</CardTitle>
              <Badge className={`${archetypeColor} text-white capitalize`}>
                {archetype}
              </Badge>
            </div>
            <CardDescription>
              {civilization && <span>{civilization} · </span>}
              {birthYear} {deathYear && `– ${deathYear}`}
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm font-medium">Influence</div>
            <div className="text-2xl font-bold text-primary">{Math.round(influence)}</div>
          </div>
        </div>

        {backstory && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm italic text-muted-foreground">{backstory}</p>
          </div>
        )}

        {reputation && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Reputation: </span>
            <span className="text-muted-foreground">{reputation}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => toggleSection("attributes")}
          >
            <span className="font-semibold flex items-center gap-2">
              <Award className="w-4 h-4" />
              Core Attributes
            </span>
            {expandedSections.attributes ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {expandedSections.attributes && (
            <div className="space-y-3 mt-3 pl-6">
              <AttributeBar label="Charisma" value={attributes.charisma} />
              <AttributeBar label="Intellect" value={attributes.intellect} />
              <AttributeBar label="Courage" value={attributes.courage} />
              <AttributeBar label="Wisdom" value={attributes.wisdom} />
              <AttributeBar label="Creativity" value={attributes.creativity} />
              <AttributeBar label="Ambition" value={attributes.ambition} />
              <AttributeBar label="Compassion" value={attributes.compassion} />
              <AttributeBar label="Ruthlessness" value={attributes.ruthlessness} />
            </div>
          )}
        </div>

        {achievements.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
              onClick={() => toggleSection("achievements")}
            >
              <span className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Achievements ({achievements.length})
              </span>
              {expandedSections.achievements ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.achievements && (
              <div className="space-y-2 mt-3 pl-6">
                {achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="p-3 bg-muted rounded-lg space-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {achievement.year}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline">
                        Impact: {achievement.civilizationImpact}
                      </Badge>
                      <Badge variant="outline">
                        Significance: {achievement.historicalSignificance}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {legacy > 0 && (
          <div className="border-t pt-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
              onClick={() => toggleSection("genealogy")}
            >
              <span className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Legacy & Impact
              </span>
              {expandedSections.genealogy ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {expandedSections.genealogy && (
              <div className="mt-3 pl-6 space-y-2">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Legacy Score</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {Math.round(legacy)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Measure of lasting impact on civilization
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FigureProfile;
