/**
 * Narrative Exporter Component
 * 
 * UI for exporting narratives in multiple formats:
 * - Markdown for easy sharing
 * - PDF for formal documentation
 * - JSON for data interchange
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, FileJson, File } from "lucide-react";

interface ExportOptions {
  includeContradictions: boolean;
  includeHiddenTruths: boolean;
  includeCascadeAnalysis: boolean;
  includeMetadata: boolean;
  format: "markdown" | "pdf" | "json";
}

interface NarrativeExporterProps {
  eventCount?: number;
  cascadeCount?: number;
  onExport?: (options: ExportOptions) => void;
}

export default function NarrativeExporter({
  eventCount = 0,
  cascadeCount = 0,
  onExport,
}: NarrativeExporterProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeContradictions: true,
    includeHiddenTruths: true,
    includeCascadeAnalysis: true,
    includeMetadata: true,
    format: "markdown",
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      onExport?.(options);

      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Narratives
          </CardTitle>
          <CardDescription className="text-slate-400">
            Export simulation data in multiple formats for sharing and analysis
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Format Selection */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Export Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setOptions({ ...options, format: "markdown" })}
              className={`p-4 rounded-lg border transition-all ${
                options.format === "markdown"
                  ? "bg-blue-900/50 border-blue-500"
                  : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
              }`}
            >
              <FileText className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-white">Markdown</p>
              <p className="text-xs text-slate-400 mt-1">Easy to share</p>
            </button>

            <button
              onClick={() => setOptions({ ...options, format: "pdf" })}
              className={`p-4 rounded-lg border transition-all ${
                options.format === "pdf"
                  ? "bg-blue-900/50 border-blue-500"
                  : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
              }`}
            >
              <File className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-white">PDF</p>
              <p className="text-xs text-slate-400 mt-1">Formal docs</p>
            </button>

            <button
              onClick={() => setOptions({ ...options, format: "json" })}
              className={`p-4 rounded-lg border transition-all ${
                options.format === "json"
                  ? "bg-blue-900/50 border-blue-500"
                  : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
              }`}
            >
              <FileJson className="w-6 h-6 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-white">JSON</p>
              <p className="text-xs text-slate-400 mt-1">Data interchange</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Content Options */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Include in Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={options.includeMetadata}
              onCheckedChange={(checked) =>
                setOptions({ ...options, includeMetadata: checked as boolean })
              }
              className="w-4 h-4"
            />
            <label className="text-sm text-slate-300 cursor-pointer">
              Event Metadata (timestamps, actors, locations)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={options.includeContradictions}
              onCheckedChange={(checked) =>
                setOptions({ ...options, includeContradictions: checked as boolean })
              }
              className="w-4 h-4"
            />
            <label className="text-sm text-slate-300 cursor-pointer">
              Contradictions Between Perspectives
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={options.includeHiddenTruths}
              onCheckedChange={(checked) =>
                setOptions({ ...options, includeHiddenTruths: checked as boolean })
              }
              className="w-4 h-4"
            />
            <label className="text-sm text-slate-300 cursor-pointer">
              Hidden Truths Revealed
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              checked={options.includeCascadeAnalysis}
              onCheckedChange={(checked) =>
                setOptions({ ...options, includeCascadeAnalysis: checked as boolean })
              }
              className="w-4 h-4"
            />
            <label className="text-sm text-slate-300 cursor-pointer">
              Crisis Cascade Analysis
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Export Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Events to Export</p>
              <p className="text-2xl font-bold text-white">{eventCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Cascades to Export</p>
              <p className="text-2xl font-bold text-white">{cascadeCount}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-400">Export will include:</p>
            <div className="flex flex-wrap gap-2">
              {options.includeMetadata && (
                <Badge variant="secondary" className="text-xs">
                  Metadata
                </Badge>
              )}
              {options.includeContradictions && (
                <Badge variant="secondary" className="text-xs">
                  Contradictions
                </Badge>
              )}
              {options.includeHiddenTruths && (
                <Badge variant="secondary" className="text-xs">
                  Hidden Truths
                </Badge>
              )}
              {options.includeCascadeAnalysis && (
                <Badge variant="secondary" className="text-xs">
                  Cascade Analysis
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting || (eventCount === 0 && cascadeCount === 0)}
        className="w-full gap-2 py-6 text-lg"
      >
        <Download className="w-5 h-5" />
        {isExporting ? "Exporting..." : `Export as ${options.format.toUpperCase()}`}
      </Button>

      {/* Quick Export Presets */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Quick Presets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={() => {
              setOptions({
                includeContradictions: true,
                includeHiddenTruths: true,
                includeCascadeAnalysis: true,
                includeMetadata: true,
                format: "markdown",
              });
            }}
          >
            Complete Analysis (Markdown)
          </Button>

          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={() => {
              setOptions({
                includeContradictions: false,
                includeHiddenTruths: false,
                includeCascadeAnalysis: false,
                includeMetadata: true,
                format: "json",
              });
            }}
          >
            Data Only (JSON)
          </Button>

          <Button
            variant="outline"
            className="w-full text-sm"
            onClick={() => {
              setOptions({
                includeContradictions: true,
                includeHiddenTruths: true,
                includeCascadeAnalysis: true,
                includeMetadata: true,
                format: "pdf",
              });
            }}
          >
            Formal Report (PDF)
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <p className="text-sm text-blue-200">
          💡 <strong>Tip:</strong> Export your narratives regularly to build a comprehensive
          archive of your galaxy's history. Compare exports across different simulation runs to
          identify patterns and alternative timelines.
        </p>
      </div>
    </div>
  );
}
