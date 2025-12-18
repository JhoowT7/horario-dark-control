import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarSkeleton: React.FC = () => {
  const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
      
      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day names */}
        {dayNames.map((day, i) => (
          <div key={i} className="py-2 text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}
        
        {/* Empty days + calendar days */}
        {Array(35).fill(null).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-md" />
        ))}
      </div>
      
      {/* Legend skeleton */}
      <div className="flex flex-wrap gap-2 mt-2">
        {Array(7).fill(null).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20 rounded-md" />
        ))}
      </div>
    </div>
  );
};

export default CalendarSkeleton;
