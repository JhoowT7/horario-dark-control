
import React from "react";
import { format, isToday } from "date-fns";
import { TimeEntry } from "@/types";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check } from "lucide-react";

interface CalendarDayProps {
  day: Date;
  dateStr: string;
  entry: TimeEntry | undefined;
  isWorkDay: boolean;
  isHoliday: boolean;
  isVacation: boolean;
  isAtestado?: boolean;
  isMissingEntry: boolean;
  dayOfWeek: number;
  expectedMinutesPerDay: number;
  onSelectDate: (date: string) => void;
}

// Helper function to convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(Math.abs(minutes) / 60);
  const mins = Math.abs(minutes) % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  dateStr,
  entry,
  isWorkDay,
  isHoliday,
  isVacation,
  isAtestado = false,
  isMissingEntry,
  dayOfWeek,
  expectedMinutesPerDay,
  onSelectDate
}) => {
  // Determine day styling
  let dayClass = "p-2 rounded-md transition-colors cursor-pointer"; // Always cursor-pointer
  
  if (isToday(day)) {
    dayClass += " border border-cyanBlue/50";
  } else {
    dayClass += " hover:bg-gray-800";
  }
  
  if (isVacation || entry?.isVacation) {
    dayClass += " bg-cyanBlue/10";
  } else if (isAtestado || entry?.isAtestado) {
    dayClass += " bg-orange-500/10";
  } else if (isHoliday || entry?.isHoliday) {
    dayClass += " bg-gray-800/50";
  } else if (entry) {
    if (entry.balanceMinutes > 0) {
      dayClass += " bg-positive/10";
    } else if (entry.balanceMinutes < 0) {
      dayClass += " bg-negative/10";
    } else {
      // Zero balance - has entry but neutral
      dayClass += " bg-cyanBlue/5 border border-cyanBlue/20";
    }
  } else if (isMissingEntry) {
    dayClass += " bg-negative/5 border border-negative/20";
  } else if (!isWorkDay) {
    dayClass += " text-gray-600 bg-transparent"; // Still clickable but styled differently
  }
  
  const dayLabel = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][dayOfWeek];
  const tooltipText = `${format(day, "dd/MM/yyyy")} - ${dayLabel}`;
  
  // Handle the day click directly without any delays
  const handleDayClick = (e: React.MouseEvent) => {
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
            onClick={handleDayClick}
            type="button"
          >
            <div className="text-sm">{format(day, "d")}</div>
            
            {entry && !entry.isHoliday && !entry.isVacation && !entry.isAtestado && !isHoliday && !isVacation && !isAtestado && (
              <div className={`text-xs mt-1 ${entry.balanceMinutes > 0 ? 'text-positive' : entry.balanceMinutes < 0 ? 'text-negative' : 'text-cyanBlue/70'}`}>
                {entry.balanceMinutes > 0 && `+${minutesToTime(entry.balanceMinutes)}`}
                {entry.balanceMinutes < 0 && `-${minutesToTime(Math.abs(entry.balanceMinutes))}`}
                {entry.balanceMinutes === 0 && <Check className="w-3 h-3 mx-auto" />}
              </div>
            )}
            
            {(isHoliday || entry?.isHoliday) && !isVacation && !entry?.isVacation && !isAtestado && !entry?.isAtestado && (
              <div className="text-xs mt-1 text-gray-400">
                Feriado
              </div>
            )}
            
            {(isVacation || entry?.isVacation) && (
              <div className="text-xs mt-1 text-cyanBlue/80">
                Férias
              </div>
            )}
            
            {(isAtestado || entry?.isAtestado) && (
              <div className="text-xs mt-1 text-orange-400">
                Atestado
              </div>
            )}
            
            {isMissingEntry && !entry && (
              <div className="text-xs mt-1 text-negative">
                -{minutesToTime(expectedMinutesPerDay)} 
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
