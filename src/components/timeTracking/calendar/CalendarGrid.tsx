
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
  onSelectDate,
}) => {
  const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"]; // Domingo a Sábado

  // Calcula o dia da semana do primeiro dia do mês (0 = Domingo, 1 = Segunda, ...)
  const firstDayOfMonth = getDay(daysInMonth[0]);
  const emptyDays = Array(firstDayOfMonth).fill(null);

  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {dayNames.map((day, i) => (
        <div key={i} className="py-2 text-sm font-medium text-gray-400">
          {day}
        </div>
      ))}
      
      {emptyDays.map((_, i) => (
        <div key={`empty-${i}`} className="p-2 bg-transparent" />
      ))}
      
      {daysInMonth.map((day, i) => {
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
