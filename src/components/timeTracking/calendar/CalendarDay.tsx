
import React from "react";
import { format, isToday } from "date-fns";
import { TimeEntry } from "@/types";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CalendarDayProps {
  day: Date;
  dateStr: string;
  entry: TimeEntry | undefined;
  isWorkDay: boolean;
  isHoliday: boolean;
  isVacation: boolean;
  isMissingEntry: boolean;
  dayOfWeek: number;
  onSelectDate: (date: string) => void;
}

// Helper function to convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  dateStr,
  entry,
  isWorkDay,
  isHoliday,
  isVacation,
  isMissingEntry,
  dayOfWeek,
  onSelectDate
}) => {
  // Determine day styling
  let dayClass = "p-2 rounded-md transition-colors cursor-pointer"; // Always cursor-pointer
  
  if (isToday(day)) {
    dayClass += " border border-cyanBlue/50";
  } else {
    dayClass += " hover:bg-gray-800";
  }
  
  if (isVacation) {
    dayClass += " bg-cyanBlue/10";
  } else if (isHoliday) {
    dayClass += " bg-gray-800/50";
  } else if (entry) {
    if (entry.balanceMinutes > 0) {
      dayClass += " bg-positive/10";
    } else if (entry.balanceMinutes < 0) {
      dayClass += " bg-negative/10";
    } else {
      dayClass += " bg-gray-800/30";
    }
  } else if (isMissingEntry) {
    dayClass += " bg-negative/5 border border-negative/20";
  } else if (!isWorkDay) {
    dayClass += " text-gray-600 bg-transparent"; // Still clickable but styled differently
  }
  
  const dayLabel = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][dayOfWeek];
  const tooltipText = `${format(day, "dd/MM/yyyy")} - ${dayLabel}`;
  
  // Create handler directly here to prevent event bubbling issues
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectDate(dateStr);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={dayClass}
            onClick={handleClick}
            type="button"
          >
            <div className="text-sm">{format(day, "d")}</div>
            
            {entry && (
              <div className={`text-xs mt-1 ${entry.balanceMinutes > 0 ? 'text-positive' : entry.balanceMinutes < 0 ? 'text-negative' : ''}`}>
                {entry.balanceMinutes !== 0 && (
                  entry.balanceMinutes > 0 ? "+" : "-"
                )}
                {entry.balanceMinutes !== 0 && minutesToTime(Math.abs(entry.balanceMinutes))}
              </div>
            )}
            
            {isHoliday && (
              <div className="text-xs mt-1 text-gray-400">
                Feriado
              </div>
            )}
            
            {isVacation && (
              <div className="text-xs mt-1 text-cyanBlue/80">
                Férias
              </div>
            )}
            
            {isMissingEntry && !entry && (
              <div className="text-xs mt-1 text-negative">
                Pendente
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CalendarDay;
