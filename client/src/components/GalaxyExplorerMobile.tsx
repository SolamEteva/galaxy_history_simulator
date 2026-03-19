/**
 * Mobile-Optimized Galaxy Explorer
 * 
 * Adapts the Galaxy Explorer interface for mobile devices:
 * - Stacked tabs instead of horizontal
 * - Touch-friendly button sizes (44px minimum)
 * - Optimized spacing and padding
 * - Scrollable content areas
 * - Simplified visualizations
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMobile";
import { ChevronDown, ChevronUp } from "lucide-react";

interface GalaxyExplorerMobileProps {
  galaxyId: string;
}

export function GalaxyExplorerMobile({ galaxyId }: GalaxyExplorerMobileProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("chronicle");
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const sections = [
    {
      id: "chronicle",
      label: "Chronicle",
      icon: "📜",
      content: "Event timeline and history",
    },
    {
      id: "trade",
      label: "Trade Network",
      icon: "🤝",
      content: "Civilization connections",
    },
    {
      id: "perspectives",
      label: "Perspectives",
      icon: "👁️",
      content: "Multi-perspective narratives",
    },
    {
      id: "cascades",
      label: "Cascades",
      icon: "⚡",
      content: "Crisis chain analysis",
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <h1 className="text-xl font-bold">Galaxy {galaxyId}</h1>
        <p className="text-sm text-muted-foreground">Explore history and events</p>
      </div>

      {/* Accordion-style sections for mobile */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {sections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === section.id ? null : section.id
                  )
                }
                className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <span className="font-semibold">{section.label}</span>
                </div>
                {expandedSection === section.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedSection === section.id && (
                <div className="border-t border-border p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-3">
                    {section.content}
                  </p>
                  {/* Placeholder for actual content */}
                  <div className="space-y-2">
                    <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      Content loading...
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Fixed action buttons at bottom */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4 space-y-2">
        <Button className="w-full h-12 text-base" size="lg">
          Start Simulation
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base"
          size="lg"
        >
          Export Data
        </Button>
      </div>
    </div>
  );
}

export default GalaxyExplorerMobile;
