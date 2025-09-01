import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/button";
import ProductSkeleton from "@/components/ProductSkeleton";
import { Loader2 } from "lucide-react";

interface LoadMoreProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  useIntersectionObserver?: boolean;
}

export default function LoadMore({
  loading,
  hasMore,
  onLoadMore,
  useIntersectionObserver = true,
}: LoadMoreProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!useIntersectionObserver || !targetRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: "200px", // Trigger 200px before the element is visible
        threshold: 0.1,
      }
    );

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [useIntersectionObserver]);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading && useIntersectionObserver) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore, useIntersectionObserver]);

  if (!hasMore) return null;

  return (
    <div className="mt-8 space-y-6">
      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Intersection Observer Target */}
      {useIntersectionObserver && (
        <div ref={targetRef} className="h-4 w-full" />
      )}

      {/* Manual Load More Button (fallback or primary) */}
      {!useIntersectionObserver && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              "Carregar mais produtos"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}