import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { EventNode } from "@/types/narrative";

interface EventImage {
  id: string;
  url: string;
  title: string;
  description: string;
  generatedAt: number;
  style: string;
}

interface EventImageGalleryProps {
  event: EventNode | null;
  images: EventImage[];
  isOpen: boolean;
  onClose: () => void;
}

export function EventImageGallery({ event, images, isOpen, onClose }: EventImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!event || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.title}-${currentIndex + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
              <p className="text-slate-400 text-sm mt-1">Year {event.year}</p>
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
          {/* Main Image */}
          <Card className="bg-slate-700 border-slate-600 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
                <img
                  src={currentImage.url}
                  alt={currentImage.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23374151' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='20' fill='%239CA3AF' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
                  }}
                />

                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevious}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 bg-black/70 px-3 py-1 rounded text-sm text-white">
                  {currentIndex + 1} / {images.length}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Info */}
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Image Title</p>
                <p className="text-white font-semibold">{currentImage.title}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Description</p>
                <p className="text-slate-200 text-sm">{currentImage.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Style</p>
                  <p className="text-white capitalize">{currentImage.style}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Generated</p>
                  <p className="text-white text-sm">
                    {new Date(currentImage.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Context */}
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="pt-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Event Description</p>
                <p className="text-slate-200 text-sm leading-relaxed">{event.description}</p>
              </div>
              {event.involvedCivilizations && event.involvedCivilizations.length > 0 && (
                <div className="mt-3">
                  <p className="text-slate-400 text-sm mb-2">Involved Civilizations</p>
                  <div className="flex flex-wrap gap-2">
                    {event.involvedCivilizations.map((civ: any, idx: any) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded"
                      >
                        {civ}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={() => window.open(currentImage.url, "_blank")}
              variant="outline"
              className="border-slate-600 text-slate-200 hover:bg-slate-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                    idx === currentIndex
                      ? "border-blue-500"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
