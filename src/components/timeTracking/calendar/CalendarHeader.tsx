
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  formattedMonth: string;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  formattedMonth,
  goToPreviousMonth,
  goToNextMonth,
  goToCurrentMonth
}) => {
  return (
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
  );
};

export default CalendarHeader;
