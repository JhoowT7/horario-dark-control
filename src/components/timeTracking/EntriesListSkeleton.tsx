import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const EntriesListSkeleton: React.FC = () => {
  return (
    <div className="space-y-2 animate-fade-in">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-md bg-gray-800/40 p-3">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntriesListSkeleton;
