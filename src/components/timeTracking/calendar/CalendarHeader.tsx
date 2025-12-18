
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToPreviousMonth}
                className="h-10 w-10 rounded-full hover:bg-muted"
                aria-label="Mês anterior (←)"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mês anterior <Badge variant="outline" className="ml-1 text-xs">←</Badge></p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="flex flex-col items-center">
        <motion.h3 
          className="text-lg font-semibold capitalize"
          key={formattedMonth}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {formattedMonth}
        </motion.h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="link" 
                size="sm" 
                onClick={goToCurrentMonth} 
                className="text-xs text-muted-foreground hover:text-cyanBlue gap-1"
              >
                <Calendar className="h-3 w-3" />
                Ir para hoje
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Atalho: <Badge variant="outline" className="ml-1 text-xs">Ctrl+H</Badge></p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToNextMonth}
                className="h-10 w-10 rounded-full hover:bg-muted"
                aria-label="Próximo mês (→)"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Próximo mês <Badge variant="outline" className="ml-1 text-xs">→</Badge></p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CalendarHeader;
