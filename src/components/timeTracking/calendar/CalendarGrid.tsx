
import React from "react";
import { getDay } from "date-fns";
import { TimeEntry } from "@/types";
import CalendarDay from "./CalendarDay";

interface CalendarGridProps {
  daysInMonth: Date[];
  getEntryForDate: (date: Date) => TimeEntry | undefined;
  isWorkingDay: (date: Date) => boolean;
  isHolidayDate: (date: Date) => boolean;
  isVacationDate: (date: Date) => boolean;
  missingEntries: string[];
  formatDateString: (date: Date) => string;
  onSelectDate: (date: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  daysInMonth,
  getEntryForDate,
  isWorkingDay,
  isHolidayDate,
  isVacationDate,
  missingEntries,
  formatDateString,
  onSelectDate
}) => {
  // Day names in Portuguese - properly ordered from Sunday (0) to Saturday (6)
  const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];
  
  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {/* Headers for days of week: Sunday(D) to Saturday(S) */}
      {dayNames.map((day, i) => (
        <div key={i} className="py-2 text-sm font-medium text-gray-400">
          {day}
        </div>
      ))}
      
      {daysInMonth.map((day, i) => {
        // Get the actual day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
        const dayOfWeek = getDay(day);
        const dateStr = formatDateString(day);
        const entry = getEntryForDate(day);
        const isWorkDay = isWorkingDay(day);
        const isHoliday = isHolidayDate(day);
        const isVacation = isVacationDate(day);
        const isMissingEntry = missingEntries.includes(dateStr);
        
        return (
          <CalendarDay
            key={i}
            day={day}
            dateStr={dateStr}
            entry={entry}
            isWorkDay={isWorkDay}
            isHoliday={isHoliday}
            isVacation={isVacation}
            isMissingEntry={isMissingEntry}
            dayOfWeek={dayOfWeek}
            onSelectDate={onSelectDate}
          />
        );
      })}
    </div>
  );
};

export default CalendarGrid;
