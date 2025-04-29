
import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon
} from "lucide-react";
import { format, isToday, isWithinInterval, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TimeEntry } from "@/types";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CalendarViewProps {
  currentMonth: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
  daysInMonth: Date[];
  getEntryForDate: (date: Date) => TimeEntry | undefined;
  isWorkingDay: (date: Date) => boolean;
  isHolidayDate: (date: Date) => boolean;
  isVacationDate: (date: Date) => boolean;
  missingEntries: string[];
  formatDateString: (date: Date) => string;
  onSelectDate: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  goToPreviousMonth,
  goToNextMonth,
  goToCurrentMonth,
  daysInMonth,
  getEntryForDate,
  isWorkingDay,
  isHolidayDate,
  isVacationDate,
  missingEntries,
  formatDateString,
  onSelectDate
}) => {
  const formattedMonth = format(currentMonth, "MMMM yyyy", { locale: ptBR });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium capitalize">{formattedMonth}</h3>
          <Button 
            variant="link" 
            size="sm" 
            onClick={goToCurrentMonth} 
            className="text-xs text-gray-400"
          >
            Ir para mês atual
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Use the correct order for days of week in Portuguese: D, S, T, Q, Q, S, S */}
        {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
          <div key={i} className="py-2 text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((day, i) => {
          const dayOfWeek = getDay(day); // 0 = Sunday, 1 = Monday, etc.
          const dateStr = formatDateString(day);
          const entry = getEntryForDate(day);
          const isWorkDay = isWorkingDay(day);
          const isHoliday = isHolidayDate(day);
          const isVacation = isVacationDate(day);
          const isMissingEntry = missingEntries.includes(dateStr);
          
          // Determine day styling
          let dayClass = "p-2 rounded-md transition-colors";
          
          if (!isWorkDay) {
            dayClass += " text-gray-600 bg-transparent cursor-default";
          } else if (isToday(day)) {
            dayClass += " border border-cyanBlue/50";
          } else {
            dayClass += " hover:bg-gray-800 cursor-pointer";
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
          }
          
          const dayLabel = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][dayOfWeek];
          const tooltipText = `${format(day, "dd/MM/yyyy")} - ${dayLabel}`;
          
          return (
            <button
              key={i}
              className={dayClass}
              onClick={() => isWorkDay || entry ? onSelectDate(dateStr) : null}
              disabled={!isWorkDay && !entry}
              title={tooltipText}
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
          );
        })}
      </div>
      
      <CalendarLegend />
    </div>
  );
};

// Helper function to convert minutes to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

// CalendarLegend component
const CalendarLegend = () => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 text-xs">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-positive/10 mr-1"></div>
        <span className="text-gray-400">Saldo positivo</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-negative/10 mr-1"></div>
        <span className="text-gray-400">Saldo negativo</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-gray-800/50 mr-1"></div>
        <span className="text-gray-400">Feriado</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-cyanBlue/10 mr-1"></div>
        <span className="text-gray-400">Férias</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-negative/5 border border-negative/20 mr-1"></div>
        <span className="text-gray-400">Pendente</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full border border-cyanBlue/50 mr-1"></div>
        <span className="text-gray-400">Hoje</span>
      </div>
    </div>
  );
};

export default CalendarView;
