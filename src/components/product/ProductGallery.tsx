import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const validImages = images?.length > 0 ? images : ["/placeholder.svg"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : validImages.length - 1
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < validImages.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [validImages.length]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-soft border border-line">
        <img
          src={validImages[selectedIndex]}
          alt={`${name} - Imagem ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
          aria-live="polite"
        />
        
        {validImages.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(prev => 
                prev > 0 ? prev - 1 : validImages.length - 1
              )}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft hover:bg-white transition-colors"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={16} />
            </button>
            
            <button
              onClick={() => setSelectedIndex(prev => 
                prev < validImages.length - 1 ? prev + 1 : 0
              )}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-soft hover:bg-white transition-colors"
              aria-label="Próxima imagem"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedIndex(index);
                }
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                index === selectedIndex 
                  ? "border-brand-blue shadow-soft" 
                  : "border-line hover:border-muted"
              }`}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <img
                src={image}
                alt={`${name} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}