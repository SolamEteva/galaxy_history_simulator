import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LegendsExportButtonProps {
  galaxyId: number;
  galaxyName: string;
}

export function LegendsExportButton({ galaxyId, galaxyName }: LegendsExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportHtmlMutation = trpc.export.exportLegendHtml.useMutation({
    onSuccess: (data) => {
      // Create a blob from the HTML
      const blob = new Blob([data.html], { type: "text/html;charset=utf-8" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", data.fileName);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Legends chronicle exported successfully!");
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
      setIsExporting(false);
    },
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportHtmlMutation.mutateAsync({ galaxyId });
    } catch (error) {
      console.error("Export error:", error);
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export Legends Chronicle
        </>
      )}
    </Button>
  );
}
