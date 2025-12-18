
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TimeEntry } from "@/types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarGrid from "./calendar/CalendarGrid";
import CalendarLegend from "./calendar/CalendarLegend";
import CalendarSkeleton from "./CalendarSkeleton";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";

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
  expectedMinutesPerDay: number;
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
  expectedMinutesPerDay,
  onSelectDate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const formattedMonth = format(currentMonth, "MMMM yyyy", { locale: ptBR });
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPrevMonth: () => handleMonthChange('prev'),
    onNextMonth: () => handleMonthChange('next'),
    onToday: goToCurrentMonth,
    enabled: true
  });
  
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setSlideDirection(direction === 'prev' ? 'right' : 'left');
    setIsLoading(true);
    
    setTimeout(() => {
      if (direction === 'prev') {
        goToPreviousMonth();
      } else {
        goToNextMonth();
      }
      setIsLoading(false);
    }, 150);
  };
  
  // Direct handler to avoid any delays
  const handleSelectDate = (date: string) => {
    onSelectDate(date);
  };

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? -50 : 50,
      opacity: 0
    })
  };
  
  return (
    <div className="space-y-4">
      <CalendarHeader 
        formattedMonth={formattedMonth}
        goToPreviousMonth={() => handleMonthChange('prev')}
        goToNextMonth={() => handleMonthChange('next')}
        goToCurrentMonth={goToCurrentMonth}
      />
      
      <TooltipProvider>
        <AnimatePresence mode="wait" custom={slideDirection}>
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CalendarSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={formattedMonth}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <CalendarGrid 
                daysInMonth={daysInMonth}
                getEntryForDate={getEntryForDate}
                isWorkingDay={isWorkingDay}
                isHolidayDate={isHolidayDate}
                isVacationDate={isVacationDate}
                missingEntries={missingEntries}
                formatDateString={formatDateString}
                expectedMinutesPerDay={expectedMinutesPerDay}
                onSelectDate={handleSelectDate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
      
      <CalendarLegend />
    </div>
  );
};

export default CalendarView;
