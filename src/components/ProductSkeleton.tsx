import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductSkeleton() {
  return (
    <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Skeleton className="aspect-square w-full" />
          <div className="absolute top-2 left-2">
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="absolute top-2 right-2">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-3 w-3 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}