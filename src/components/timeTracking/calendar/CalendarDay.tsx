
import React from "react";
import { motion } from "framer-motion";
import { format, isToday } from "date-fns";
import { TimeEntry } from "@/types";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, AlertTriangle, X } from "lucide-react";

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
  let dayClass = "p-2 rounded-md transition-all duration-200 cursor-pointer min-h-[60px] min-w-[44px] touch-manipulation"; // Touch target 44x44
  
  if (isToday(day)) {
    dayClass += " border-2 border-cyanBlue ring-2 ring-cyanBlue/20";
  } else {
    dayClass += " hover:bg-gray-700/50 hover:scale-105 hover:shadow-lg";
  }
  
  // Pulsing effect for negative balance days
  const hasNegativeBalance = entry && entry.balanceMinutes < 0;
  
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

  // Get status icon
  const getStatusIcon = () => {
    if (isVacation || entry?.isVacation || isAtestado || entry?.isAtestado || isHoliday || entry?.isHoliday) {
      return null;
    }
    
    if (entry && entry.balanceMinutes === 0) {
      return <Check className="w-3 h-3 text-cyanBlue" aria-label="Jornada completa" />;
    }
    
    if (isMissingEntry && !entry) {
      return <X className="w-3 h-3 text-negative" aria-label="Ausente" />;
    }
    
    if (entry && entry.balanceMinutes < 0) {
      return <AlertTriangle className="w-3 h-3 text-negative" aria-label="Saldo negativo" />;
    }
    
    return null;
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            className={dayClass}
            onClick={handleDayClick}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`${tooltipText}${entry ? ` - Saldo: ${entry.balanceMinutes > 0 ? '+' : ''}${minutesToTime(entry.balanceMinutes)}` : isMissingEntry ? ' - Pendente' : ''}`}
          >
            <div className="text-sm font-medium">{format(day, "d")}</div>
            
            <div className="flex items-center justify-center gap-1 mt-1">
              {entry && !entry.isHoliday && !entry.isVacation && !entry.isAtestado && !isHoliday && !isVacation && !isAtestado && (
                <motion.div 
                  className={`text-xs ${entry.balanceMinutes > 0 ? 'text-positive' : entry.balanceMinutes < 0 ? 'text-negative' : 'text-cyanBlue/70'}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: hasNegativeBalance ? [1, 1.05, 1] : 1
                  }}
                  transition={hasNegativeBalance ? { repeat: Infinity, duration: 2 } : {}}
                >
                  {entry.balanceMinutes > 0 && `+${minutesToTime(entry.balanceMinutes)}`}
                  {entry.balanceMinutes < 0 && `-${minutesToTime(Math.abs(entry.balanceMinutes))}`}
                  {entry.balanceMinutes === 0 && getStatusIcon()}
                </motion.div>
              )}
              
              {(isHoliday || entry?.isHoliday) && !isVacation && !entry?.isVacation && !isAtestado && !entry?.isAtestado && (
                <div className="text-xs text-gray-400">🎉</div>
              )}
              
              {(isVacation || entry?.isVacation) && (
                <div className="text-xs text-cyanBlue/80">🏖️</div>
              )}
              
              {(isAtestado || entry?.isAtestado) && (
                <div className="text-xs text-orange-400">🏥</div>
              )}
              
              {isMissingEntry && !entry && (
                <motion.div 
                  className="text-xs text-negative flex items-center gap-1"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {getStatusIcon()}
                </motion.div>
              )}
            </div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent className="bg-card border-border">
          <p>{tooltipText}</p>
          {entry && (
            <p className={entry.balanceMinutes > 0 ? 'text-positive' : entry.balanceMinutes < 0 ? 'text-negative' : 'text-cyanBlue'}>
              Saldo: {entry.balanceMinutes > 0 ? '+' : ''}{minutesToTime(entry.balanceMinutes)}
            </p>
          )}
          {isMissingEntry && !entry && (
            <p className="text-negative">Pendente: -{minutesToTime(expectedMinutesPerDay)}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CalendarDay;
