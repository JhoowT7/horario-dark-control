
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TimeEntry } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarGrid from "./calendar/CalendarGrid";
import CalendarLegend from "./calendar/CalendarLegend";

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
  
  // Pass all required props to CalendarGrid component
  return (
    <div className="space-y-4">
      <CalendarHeader 
        formattedMonth={formattedMonth}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        goToCurrentMonth={goToCurrentMonth}
      />
      
      <TooltipProvider>
        <CalendarGrid 
          daysInMonth={daysInMonth}
          getEntryForDate={getEntryForDate}
          isWorkingDay={isWorkingDay}
          isHolidayDate={isHolidayDate}
          isVacationDate={isVacationDate}
          missingEntries={missingEntries}
          formatDateString={formatDateString}
          onSelectDate={onSelectDate}
        />
      </TooltipProvider>
      
      <CalendarLegend />
    </div>
  );
};

export default CalendarView;
