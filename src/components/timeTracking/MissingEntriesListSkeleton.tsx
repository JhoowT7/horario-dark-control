import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MissingEntriesListSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 animate-fade-in">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-md border border-negative/20 bg-negative/5 p-3">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MissingEntriesListSkeleton;
